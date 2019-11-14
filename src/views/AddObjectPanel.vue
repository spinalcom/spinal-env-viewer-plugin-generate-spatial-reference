<template>
    <v-app dark class="body">
        <v-progress-circular v-if="spin"
                             indeterminate
                             color="primary"
        ></v-progress-circular>
        <div v-else
        >
            <v-select
                    :items="models"
                    item-text="name"
                    label="Models contenant l'architecture"
                    multiple
            ></v-select>
            <table-component :bimSelected="bimSelected"></table-component>
            <v-btn @click="addCategory" dark>Ajouter Selection</v-btn>
            <br/>
            <v-btn @click="addObjectToContext" dark
                    :disabled="this.bimSelected.length == 0"
                   >Placer
            </v-btn>
        </div>
    </v-app>
</template>

<script>
  import { bimObjectManagerService } from "spinal-env-viewer-bim-manager-service";
  import TableComponent from "./tableComponent.vue";
  import * as SM from "spinal-spatial-referential";
  import { cast } from "../RayCaster";

  export default {
    name: "AddObjectPanel",
    components: { TableComponent },
    data() {
      this.viewer = window.spinal.ForgeViewer.viewer;
      this.manager = new SM.default.SpatialManager();
      return {
        bimSelected: [],
        items: [],
        categories: [],
        dialog: false,
        intersects: [],
        spin: false,
        models: []
        //contain the externalId of the categories and their names
      }
    },
    methods: {
      addCategory() {
        const aggregateSelection = this.viewer.getAggregateSelection();
        const referentialCopy = Object.assign( [], this.bimSelected );
        for (let select of aggregateSelection) {
          let found = referentialCopy.find( el => {
            return el.model.id === select.model.id
          } );

          if (typeof found !== "undefined") {
            for (let i = 0; i < select.selection.length; i++) {
              if (found.selection.indexOf( select.selection[i] ) === -1) {
                found.selection.push( ...select.selection[i] );
              }
            }
          } else {
            referentialCopy.push( select );
          }
        }
        this.bimSelected = [];
        for (let i = 0; i < referentialCopy.length; i++) {
          this.bimSelected.push( referentialCopy[i] )
        }
        this.bimSelected = referentialCopy;
      },
      async addObjectToContext() {
        this.spin = true;
        await this.isolateFinishFloor();
        let ids = [];
        let proms = [];
        for (let i = 0; i < this.bimSelected.length; i++) {
          ids.push(
            ...bimObjectManagerService
              .getLeafDbIds( this.bimSelected[i].model,
                this.bimSelected[i].selection ).selection );
          for (let j = 0; j < ids.length; j++) {
            proms.push( this.castToFloorFinish( ids[j],
              this.bimSelected[i].model ) )
          }
          ids = []
        }


        Promise.all( proms )
          .then( async ( res ) => {

            let equipmentInfo = [];
            for (let i = 0; i < res.length; i++) {
              let spinalIntersection = res[i];
              let bimObject = spinalIntersection.id;
              let floor_finish = spinalIntersection.intersect.dbId;
              const model = this.getModelById(spinalIntersection.modelId);
              this.manager.modelArchi =
                await this.manager.getArchiModel(model);
              let roomId = await this.manager
                .getRoomIdFromFloorFinish( floor_finish );
              equipmentInfo.push( { bimObject, floor_finish, roomId,  model} );
            }
            return equipmentInfo;
          } )
          .then( async equipmentInfo => {
            const context = this.manager.context;
            let fail = 0;
            for (let i = 0; i < equipmentInfo.length; i++) {
              let info = equipmentInfo[i];
              let roomId = await this.manager.getRoomIdFromDbId( info.roomId );
              let model = info.model;
              let bimObj = await this.getProps(info.bimObject, model);

              if (typeof roomId !== "undefined") {
                await window.spinal.BimObjectService.addBIMObject(
                  context.info.id.get(), roomId, info.bimObject, bimObj.name,
                  model);
              } else
                console.error( 'fail to add bimobject', fail++, info );
              this.spin = false;
            }
          } )
      },
      getModelById(id){
        for (let i = 0; i < this.bimSelected.length; i++) {
          if (this.bimSelected[i].model.id === id )
            return this.bimSelected[i].model
        }
      },

      getProps(dbId, model){
        return new Promise( (resolve, reject) => {
          model.getProperties(dbId, resolve, reject)
        })
      },
      isFloorFinish( id ) {
        const floor_finish = this.manager.getFloorFinishId( this.bimSelected[0].model );
        for (let i = 0; i < floor_finish.length; i++) {
          if (floor_finish[i].floorId === id)
            return true;
        }
        return false;
      },
      async castToFloorFinish( id, model ) {
        let turn = 0;
        let intersect = { dbId: id };

        do {
          try {
            intersect = await cast( intersect.dbId, model );
            console.log(intersect)
          } catch ( e ) {
            intersect = null;
          } finally {
            console.log( 'intersect', id, intersect, turn++ );
          }
        }
        while (
          intersect === null
          || (
            intersect.intersect === null
            && this.isFloorFinish( intersect.dbId )
          ));

        return { id, intersect, modelId: model.id };
      },
      async isolateFinishFloor() {

        await this.manager.init();
        window.manager = this.manager;

        for (let i = 0; i < this.models.length; i++) {
          const model = this.models[i].model;
          const tmpFloor = await this.manager
            .getFloorFinishId( model );
          this.viewer.isolate( tmpFloor, model );
        }

      },
      opened( option ) {
        this.dialog = true;
        window.isolate = this.isolateFinishFloor.bind( this );

        for (let key in spinal.BimObjectService.mappingNameByModel) {
          if (spinal.BimObjectService.mappingNameByModel.hasOwnProperty( key ))
            this.models.push( {
              name: key, model:
                spinal.BimObjectService.mappingNameByModel[key]
            } )
        }
      },
      removed() {
      },
      closeDialog( closeResult ) {
      }
    }

  }
</script>

<style scoped>
    .body {
        height: 100%;
    }
</style>