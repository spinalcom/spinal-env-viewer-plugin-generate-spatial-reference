<!--
Copyright 2020 SpinalCom - www.spinalcom.com

This file is part of SpinalCore.

Please read all of the following terms and conditions
of the Free Software license Agreement ("Agreement")
carefully.

This Agreement is a legally binding contract between
the Licensee (as defined below) and SpinalCom that
sets forth the terms and conditions that govern your
use of the Program. By installing and/or using the
Program, you agree to abide by all the terms and
conditions stated or referenced herein.

If you do not agree to abide by these terms and
conditions, do not demonstrate your acceptance and do
not install or use the Program.
You should have received a copy of the license along
with this file. If not, see
<http://resources.spinalcom.com/licenses.pdf>.
-->

<template>
  <v-app dark
         class="geolocate-bimObj-body">
    <v-progress-circular v-if="spin"
                         indeterminate
                         color="primary" />
    <div v-else
         class="geolocate-bimObj-container">
      <v-flex xs12>
        <v-select v-model="arcModel"
                  :items="models"
                  item-text="name"
                  label="Models contenant l'architecture"
                  multiple />
      </v-flex>
      <table-component :bim-selected="bimSelected" />
      <div class="geolocate-bimObj-footer">
        <v-btn dark
               @click="addCategory">
          Ajouter Selection
        </v-btn>
        <v-btn dark
               :disabled="bimSelected.length == 0"
               @click="addObjectToContext">
          Placer
        </v-btn>
      </div>
    </div>
  </v-app>
</template>

<script>
import TableComponent from "./tableComponent.vue";
import * as SM from "spinal-spatial-referential";
// import { cast } from "../services/RayCaster";
import { isolateFinishFloor } from "../services/isolateFinishFloor";
import { getEquipmentInfo } from "../services/getEquipmentInfo";
import { getIntersects } from "../services/getIntersects";
import { addEquipmentInContext } from "../services/addEquipmentInContext";
export default {
  name: "AddObjectPanel",
  components: { TableComponent },
  data() {
    return {
      bimSelected: [],
      items: [],
      categories: [],
      dialog: false,
      intersects: [],
      spin: false,
      models: [],
      arcModel: []
      //contain the externalId of the categories and their names
    };
  },
  mounted() {
    this.viewer = window.spinal.ForgeViewer.viewer;
    this.manager = new SM.default.SpatialManager();
  },
  methods: {
    addCategory() {
      const aggregateSelection = this.viewer.getAggregateSelection();
      const referentialCopy = Object.assign([], this.bimSelected);
      for (let select of aggregateSelection) {
        let found = referentialCopy.find(el => {
          return el.model.id === select.model.id;
        });

        if (typeof found !== "undefined") {
          for (let i = 0; i < select.selection.length; i++) {
            if (found.selection.indexOf(select.selection[i]) === -1) {
              found.selection.push(...select.selection[i]);
            }
          }
        } else {
          referentialCopy.push(select);
        }
      }
      // this.bimSelected = [];
      // for (let i = 0; i < referentialCopy.length; i++) {
      //   this.bimSelected.push(referentialCopy[i]);
      // }
      this.bimSelected = referentialCopy;
      console.log("this.bimSelected", this.bimSelected);
    },
    async addObjectToContext() {
      this.spin = true;
      try {
        await isolateFinishFloor(this.manager, this.viewer, this.models);
        const intersects = await getIntersects(
          this.manager,
          this.bimSelected,
          this.arcModel
        );
        console.log("intersects res => ", intersects);
        const equipmentInfo = await getEquipmentInfo(
          this.manager,
          intersects,
          this.bimSelected
        );
        console.log("equipmentInfo res => ", equipmentInfo);
        await addEquipmentInContext(this.manager, equipmentInfo);
      } catch (e) {
        console.error(e);
        throw e;
      } finally {
        this.spin = false;
      }
    },

    opened() {
      this.dialog = true;
      window.isolate = isolateFinishFloor.bind(
        this,
        this.manager,
        this.viewer,
        this.models
      ); // testing

      for (let key in window.spinal.BimObjectService.mappingNameByModel) {
        if (
          window.spinal.BimObjectService.mappingNameByModel.hasOwnProperty(key)
        ) {
          this.models.push({
            name: key,
            model: window.spinal.BimObjectService.mappingNameByModel[key]
          });
        }
      }
    },
    removed() {},
    closeDialog() {}
  }
};
</script>

<style scoped>
.geolocate-bimObj-body {
  height: calc(100% - 17px);
  position: relative;
}
.geolocate-bimObj-footer {
  display: flex;
  justify-content: space-between;
}
</style>

<style>
.geolocate-bimObj-body > .application--wrap {
  min-height: 100%;
  height: 100%;
}
.geolocate-bimObj-body * {
  box-sizing: border-box;
}
.geolocate-bimObj-container {
  height: 100%;
}

.geolocate-bimObj-body > .v-menu__content {
  top: 52px !important;
}
</style>
