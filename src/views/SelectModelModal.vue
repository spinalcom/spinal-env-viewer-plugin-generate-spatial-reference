<template>
    <v-app>
        <v-layout row justify-center>
            <v-dialog v-model="dialog" max-width="290">
                <v-card :dark="true">
                    <v-card-title class="headline">Choisez un model
                    </v-card-title>
                    <v-card-text>

                        <v-progress-circular v-if="spin"
                                             indeterminate
                                             color="primary"
                        ></v-progress-circular>
                        <v-select
                                    :items="bimfiles"
                                    label="Model"
                                    @change="onModelSelected"
                            ></v-select>
                        <v-text-field v-model="buildingName"
                                      placeholder="Nom du batiment"
                                      label="Nom du batiement"
                        >
                        </v-text-field>

                        <v-checkbox
                                v-model="addLevel"
                                :label="`Ajouter un etage`"
                        ></v-checkbox>
                        
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="green darken-1"
                               flat
                               :disabled="selectedModel === null"
                               @click="generate">
                            Generer
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-layout>
    </v-app>
</template>

<script>

  import { SpinalGraphService } from "spinal-env-viewer-graph-service";
  import  * as SM from "spinal-spatial-referential";

  export default {
    name: "DialogGenerateContext",
    data: function () {
      this.manager = new SM.default.SpatialManager();

      return {
        models: [],
        selectedModel: null,
        dialog: false,
        spin: false,
        model: undefined,
        buildingName: '',
        addLevel: false
      }
    },
    computed: {
      bimfiles() {
        return this.models.map( child => { return child.info.name.get()} )
      }
    },
    mounted() {
      //TODO find constant
      let context = SpinalGraphService.getContext( "BimFileContext" );

      //Load the children into the graph service
      SpinalGraphService.getChildren( context.info.id.get(), [] );

      context.getChildrenInContext( context, [] )
        .then( children => {
          for (let i = 0; i < children.length; i++) {
            this.models.push( children[i] );
          }
        } )
    },
    methods: {
      onModelSelected( model ) {
        this.selectedModel = model;
      },
      generate() {
        this.spin = true;

        let bimFile;
        for (let i = 0; i < this.models.length; i++) {
          if (this.models[i].info.name.get() === this.selectedModel)
            bimFile = this.models[i];
        }
        let manager;
        let model;
        window.spinal.SpinalForgeViewer
          .getSVF( bimFile.element, bimFile.info.id.get(), bimFile.info.name.get() )
          .then( svfVersionFile => {
            let path = window.location.origin + svfVersionFile.path;
            return this.loadModel( path, {} )
          } )
          .then( async m => {
            window.spinal.BimObjectService
              .addModel( bimFile.info.id.get(), m,
                1, null, bimFile.info.name.get() );

            await this.manager.init( );

            model = m;
            this.model = m;
            return await this.manager.getBuilding( this.buildingName )
          } )
          .then( async building => {
            console.log('loloo',this.addLevel)
            if (this.addLevel)
              return this.manager.generateContext(this.buildingName,  this.model );
            else{
              if (typeof building !== "undefined")
                return this.manager.updateContext(this.buildingName,
                  this.model);
              return this.manager.generateContext(this.buildingName,
                this.model );
            }
          } )
          .then( res => {
            this.spin = false;
          } )
      },

      loadModel( path, opts ) {

        return new Promise( ( resolve ) => {
          function geometryLoaded( m ) {
            resolve( m.model )
          }

          const viewer = window.spinal.SpinalForgeViewer.viewerManager.viewer;
          viewer.addEventListener( Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
            geometryLoaded );
          viewer.loadModel( path, opts )
        } )

      },
      opened( option ) {
        this.dialog = true;
      },
      removed() {
      },
      closeDialog( closeResult ) {
      }
    }
  }
</script>

<style scoped>
</style>