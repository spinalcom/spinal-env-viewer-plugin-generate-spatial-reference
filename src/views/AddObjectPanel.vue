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
                  attach=".geolocate-bimObj-body"
                  label="Models contenant l'architecture"
                  multiple />
      </v-flex>
      <table-component :bim-selected="computBimSelected"
                       @seeItem="seeItem"
                       @deleteItem="deleteItem" />
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
      intersects: [],
      spin: false,
      models: [],
      arcModel: [],
      computBimSelected: [],
      contextId: ""
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
      // const referentialCopy = Object.assign([], this.bimSelected);
      for (let select of aggregateSelection) {
        let found = this.bimSelected.find(el => {
          return el.model.id === select.model.id;
        });

        if (typeof found !== "undefined") {
          for (const dbId of select.selection) {
            if (!found.selection.includes(dbId)) {
              found.selection.push(dbId);
            }
          }
        } else {
          this.bimSelected.push(select);
        }
      }
      this.getObjectsSelectedInfo();
    },
    async addObjectToContext() {
      this.spin = true;
      try {
        const spatialConfig = await this.manager.getSpatialConfig();
        const config = spatialConfig.getConfigFromContextId(this.contextId);
        const intersects = await getIntersects(
          this.manager,
          this.bimSelected,
          this.arcModel,
          config
        );
        const equipmentInfo = await getEquipmentInfo(
          this.manager,
          config,
          intersects
        );
        console.log("equipmentInfo res => ", equipmentInfo);
        await addEquipmentInContext(equipmentInfo, config);
      } catch (e) {
        console.error(e);
        throw e;
      } finally {
        this.spin = false;
      }
    },
    async getObjectsSelectedInfo() {
      const res = [];
      for (const { model, selection } of this.bimSelected) {
        if (selection.length === 0) continue;
        res.push(
          new Promise(resolve => {
            model.getBulkProperties(
              Array.from(selection),
              { propFilter: ["name"] },
              result => {
                result.forEach(e => {
                  e.id = `${model.id}-${e.dbId}`;
                  e.modelId = model.id;
                });
                resolve(result);
              }
            );
          })
        );
      }
      const tmpRes = await Promise.all(res);
      let idx = 0;
      while (idx < this.bimSelected.length) {
        const obj = this.bimSelected[idx];
        if (obj.selection.length === 0) {
          this.bimSelected.splice(idx, 1);
        } else {
          idx++;
        }
      }

      this.computBimSelected = tmpRes.reduce((acc, el) => {
        acc.push(...el);
        return acc;
      }, []);
    },
    deleteItem(item) {
      for (const { model, selection } of this.bimSelected) {
        if (model.id === item.modelId) {
          const idx = selection.indexOf(item.dbId);
          if (idx !== -1) selection.splice(idx, 1);
          this.getObjectsSelectedInfo();
          return;
        }
      }
    },
    seeItem(item) {
      for (const { model } of this.bimSelected) {
        if (model.id === item.modelId) {
          return window.spinal.ForgeViewer.viewer.select([item.dbId], model);
        }
      }
    },
    opened(contextId) {
      this.contextId = contextId;
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
    close() {},
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

/* .geolocate-bimObj-body > .v-menu__content {
  top: 52px !important;
} */
</style>
