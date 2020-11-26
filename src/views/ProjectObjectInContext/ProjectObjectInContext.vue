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
    <div class="geolocate-bimObj-container">
      <BimGroupsList class="geolocate-bimObj-main spinal-scrollbar"
                     :bim-selected="bimSelected"
                     @addViewerSelection="addViewerSelection"
                     @showInViewer="showInViewer"
                     @showEdit="showEdit"
                     @deleteGroup="deleteGroup"
                     @deleteItemIngroup="deleteItemIngroup"></BimGroupsList>
      <div class="geolocate-bimObj-footer">
        <AddAGroup @addAGroup="addAGroup"
                   @addSelection="addSelection"></AddAGroup>

        <!-- <v-btn dark
               round
               :disabled="bimSelected.length == 0"
               @click="testUniq">
          Tests Unique
        </v-btn> -->

        <v-btn dark
               round
               :disabled="bimSelected.length == 0"
               @click="addObjectToContext">
          Project objets
        </v-btn>
      </div>
    </div>
    <BimGroupsItemEdit :item-to-edit="itemToEdit"
                       @close="onCloseEdit"></BimGroupsItemEdit>
    <Spinner :show="spin"></Spinner>
  </v-app>
</template>

<script>
import * as SM from "spinal-spatial-referential";
import { getEquipmentInfo } from "../../services/ProjectObjectInContext/getEquipmentInfo";
import { getIntersects } from "../../services/ProjectObjectInContext/getIntersects";
import { addEquipmentInContext } from "../../services/ProjectObjectInContext/addEquipmentInContext";
import { addNotFoundItems } from "../../services/ProjectObjectInContext/addNotFoundItems";
import Spinner from "./spinner.vue";
import BimGroupsList from "./BimGroupsList.vue";
import AddAGroup from "./AddAGroup.vue";
import BimGroupsItemEdit from "./BimGroupsItemEdit.vue";
import {
  addGroup,
  addSelectionToList,
  isProjectionGroupItems,
  getBulkProperties
} from "../../services/ProjectObjectInContext/ProjectItemService";
export default {
  name: "ProjectObjectInContext",
  components: { BimGroupsItemEdit, Spinner, BimGroupsList, AddAGroup },
  data() {
    return {
      bimSelected: [],
      itemToEdit: null,
      spin: false,
      contextId: ""
    };
  },
  mounted() {
    this.viewer = window.spinal.ForgeViewer.viewer;
    this.manager = new SM.default.SpatialManager();
  },
  methods: {
    addAGroup(name) {
      return addGroup(this.bimSelected, name);
      // this.bimSelected.push(new ProjectionGroupItems(name));
    },
    async addViewerSelection(index) {
      console.log("addViewerSelection", index);
      // return addSelectionToGroup(this.bimSelected, this.bimSelected[index], this.viewer);
      const prom = [];
      const toDel = [];
      const aggregateSelection = this.viewer.getAggregateSelection();

      for (let idx = 0; idx < this.bimSelected.length; idx++) {
        const item = this.bimSelected[idx];
        if (isProjectionGroupItems(item)) {
          if (idx === index) {
            prom.push( item.getAndMergeSelection(this.viewer));
          } else {
            for (let select of aggregateSelection) {
              // eslint-disable-next-line no-await-in-loop
              const props = await getBulkProperties(select.model, select.selection);
              for (const prop of props) {
                prom.push(item.deleteItem(prop));
              }
            }
          }
        } else {
          for (let select of aggregateSelection) {
            for (const dbId of select.selection) {
              if (select.model.id === item.modelId && dbId === item.dbId) {
                toDel.push(item);
              }
            }
            // // eslint-disable-next-line no-await-in-loop
            //             const props = await getBulkProperties(select.model, select.selection);
            //             for (const prop of props) {
            //               if (prop.modelId === item.modelId && prop.dbId === item.dbId) {
            //                 toDel.push(item);
            //               }
            //             }

          }
        }
      }
      for (const del of toDel) {
        let i = 0;
        while (this.bimSelected[i]) {
          if (del.uid === this.bimSelected[i].uid) {
            this.bimSelected.splice(i, 1);
          } else {
            i++;
          }
        }
      }
      return Promise.all(prom);
    },
    addSelection() {
      return addSelectionToList(this.bimSelected, this.viewer);
    },
    showInViewer(index, itm) {
      const item = this.bimSelected[index];
      if (isProjectionGroupItems(item)) {
        if (typeof itm === "undefined") item.selectAll(this.viewer);
        else item.selectItem(itm, this.viewer);
      } else {
        item.selectItem(this.viewer);
      }
    },
    deleteGroup(index) {
      this.bimSelected.splice(index, 1);
    },
    deleteItemIngroup(index, itm) {
      const item = this.bimSelected[index];
      if (isProjectionGroupItems(item)) {
        item.deleteItem(itm);
      }
    },
    // testUniq() {
    //   const error = testUniqueItem(this.bimSelected);
    //   console.log("test", error);
    // },
    async addObjectToContext() {
      this.spin = true;
      try {
        const {selection, intersects} = await getIntersects(
          this.bimSelected,
          this.contextId
        );
        console.log("selection", selection);
        console.log("intersects res => ", intersects);
        await addNotFoundItems(selection, intersects);

        const equipmentInfo = await getEquipmentInfo(
          intersects,
          this.contextId
        );
        console.log("equipmentInfo res => ", equipmentInfo);
        await addEquipmentInContext(equipmentInfo, this.contextId);

      } catch (e) {
        console.error(e);
        throw e;
      } finally {
        this.spin = false;
      }
    },
    showEdit(index) {
      const item = this.bimSelected[index];
      console.log(index);
      this.itemToEdit = item;
    },
    onCloseEdit(editItem) {
      console.log("onCloseEdit", editItem);
      if (editItem) {
        for (const item of this.bimSelected) {
          if (item.uid === editItem.uid) {
            item.name = editItem.name;
            item.offset.r = editItem.offset.r;
            item.offset.t = editItem.offset.t;
            item.offset.z = editItem.offset.z;
            break;
          }
        }
      }
      this.itemToEdit = null;
    },
    opened(contextId) {
      this.contextId = contextId;
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
.geolocate-bimObj-main {
  height: calc(100% - 48px);
  position: relative;
  overflow: auto;
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
