<!--
Copyright 2023 SpinalCom - www.spinalcom.com

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
  <div class="SpinalMergeBimGeo-main">
    <div class="SpinalMergeBimGeo-container SpinalMergeBimGeo-scrollbar">
      <div class="SpinalMergeBimGeo-content-left">
        <div class="SpinalMergeBimGeo-content-header">
          <h3>Spatial Context</h3>
        </div>
        <div class="SpinalMergeBimGeo-content SpinalMergeBimGeo-scrollbar">
          <!-- Spatial Tree view -->
          <v-treeview
            ref="spatialTree"
            dark
            activatable
            hoverable
            :open-all="true"
            active-class="SpinalMergeBimGeo-selection-active"
            :items="spatialTree"
            :active.sync="activeSpatial"
            return-object
          >
            <template v-slot:append="{ item }">
              <v-btn
                v-if="canShowAddBuilding(item) || canShowAddFloor(item)"
                flat
                icon
                small
                @click.stop="onClickAddItemGeo(item)"
              >
                <v-icon>add</v-icon>
              </v-btn>
              <v-btn
                v-else-if="canShowRemoveFloor(item)"
                flat
                small
                icon
                @click.stop="onClickRemoveItem(item)"
                color="#ffb1ac"
              >
                <v-icon>delete</v-icon>
              </v-btn>
            </template>
            <template v-slot:prepend="{ item }">
              <v-icon
                v-if="item.status === 2 || item.status === 3"
                flat
                small
                color="#ffb1ac"
                >delete</v-icon
              >
              <v-icon v-else-if="item.status === 1" flat small color="#63f669"
                >fiber_new</v-icon
              >
            </template>
          </v-treeview>
        </div>
      </div>
      <div class="SpinalMergeBimGeo-content-right">
        <div class="SpinalMergeBimGeo-content-header">
          <h3>Bim Geo Context(s)</h3>
        </div>
        <div class="SpinalMergeBimGeo-content SpinalMergeBimGeo-scrollbar">
          <!-- BIMGeo tree view -->
          <v-treeview
            ref="bimGeoTree"
            dark
            activatable
            small
            hoverable
            :open-all="true"
            :items="bimGeoTree"
            :active.sync="activeBim"
            return-object
          >
            <template v-slot:append="{ item }">
              <v-btn
                class="SpinalMergeBimGeo-tree-button"
                small
                v-if="canShowAddBimFloor(item)"
                flat
                icon
                @click.stop="onClickAddBimFloor(item)"
              >
                <v-icon>add</v-icon>
              </v-btn>
            </template>

            <template v-slot:prepend="{ item }">
              <v-icon v-if="item.status === 1" flat small color="#63f669"
                >label_important_outline</v-icon
              >
              <v-icon v-else-if="item.status === 2" flat small color="#ffb1ac"
                >label_off</v-icon
              >
              <v-icon v-else-if="item.inGeoContext === true" flat small
                >label</v-icon
              >
            </template>
          </v-treeview>
          <!-- add_link -->
        </div>
      </div>
    </div>
    <div class="SpinalMergeBimGeo-action-bar">
      <v-spacer />
      <!-- btn validate -->
      <md-button
        class="md-primary"
        :disabled="canGenerate"
        @click="onGenerateClick"
        >Generate</md-button
      >
      <!-- loading abs-->
    </div>
    <md-dialog-prompt
      :md-active.sync="openDialogNewBuilding"
      v-model="newBuildingValue"
      md-title="building name"
      md-input-maxlength="100"
      md-input-placeholder="Type the building name..."
      md-confirm-text="Confirm"
      @md-confirm="onAcceptNewBuilding(newBuildingValue)"
    />
    <md-dialog-prompt
      :md-active.sync="openDialogNewFloor"
      v-model="newFloorValue"
      md-title="Floor name"
      md-input-maxlength="100"
      md-input-placeholder="Type the floor name..."
      md-confirm-text="Confirm"
      @md-confirm="onAcceptNewFloor(newFloorValue)"
    />
    <md-dialog-confirm
      :md-active.sync="openDialogFloorDelete"
      md-title="Remove Floor"
      md-confirm-text="Confim"
      md-cancel-text="Cancel"
      @md-cancel="openDialogFloorDelete = false"
      @md-confirm="onConfimRemove"
    />
  </div>
</template>

<script>
import {
  getMergeSpatialTree,
  getMergeBimGeoTrees,
  spatialTreeCreateBuilding,
  spatialTreeCreateFloor,
  addBimFloorToFloor,
  removeBimFloor,
  BIM_GEO_FLOOR_PART_TYPE,
  mergeBimGeoCreateCmd,
  saveCmdsGenerateGeo,
  addNodeGraphService,
  waitPathSendToHub,
} from 'spinal-spatial-referential';
import ssr from 'spinal-spatial-referential';

export default {
  name: 'SpinalMergeBimGeo',
  data() {
    return {
      geoContextId: '',
      canGenerate: false,
      spatialTree: [],
      activeSpatial: [],
      bimGeoTree: [],
      activeBim: [],
      openDialogNewBuilding: false,
      newBuildingValue: '',
      openDialogNewFloor: false,
      newFloorValue: '',
      openDialogFloorDelete: false,
    };
  },
  computed: {
    selectedSpatial() {
      return this.activeSpatial[0];
    },
  },
  methods: {
    async initSpatialTree() {
      this.spatialTree = await getMergeSpatialTree(this.geoContextId);
      this.bimGeoTree = await getMergeBimGeoTrees(this.spatialTree);
      setImmediate(() => {
        this.$refs.spatialTree.updateAll(true);
        this.$refs.bimGeoTree.updateAll(true);
      });
    },
    canShowAddBuilding(item) {
      return item.type === ssr.constants.GEO_CONTEXT_TYPE;
    },
    canShowAddFloor(item) {
      return item.type === ssr.constants.GEO_BUILDING_TYPE;
    },
    canShowRemoveFloor(item) {
      return (
        (item.type === BIM_GEO_FLOOR_PART_TYPE && item.status !== 2) ||
        (item.type === ssr.constants.GEO_FLOOR_TYPE && item.status === 1)
      );
    },
    canShowAddBimFloor(item) {
      return (
        this.selectedSpatial &&
        this.selectedSpatial.type === ssr.constants.GEO_FLOOR_TYPE &&
        item.type === BIM_GEO_FLOOR_PART_TYPE &&
        item.status === 0 &&
        item.inGeoContext !== true
      );
    },
    onClickAddItemGeo(item) {
      this.activeSpatial = [item];
      if (item.type === ssr.constants.GEO_CONTEXT_TYPE) {
        this.openDialogNewBuilding = true;
      } else {
        this.openDialogNewFloor = true;
      }
    },
    onAcceptNewBuilding(value) {
      spatialTreeCreateBuilding(this.selectedSpatial, value, this.geoContextId);
      this.newBuildingValue = '';
      setImmediate(() => {
        this.$refs.spatialTree.updateAll(true);
      });
    },
    onAcceptNewFloor(value) {
      spatialTreeCreateFloor(this.selectedSpatial, value, this.geoContextId);
      this.newFloorValue = '';
      setImmediate(() => {
        this.$refs.spatialTree.updateAll(true);
      });
    },
    onClickRemoveItem(item) {
      this.activeSpatial = [item];
      this.openDialogFloorDelete = true;
    },
    onConfimRemove() {
      removeBimFloor(this.spatialTree, this.selectedSpatial);
      if (this.selectedSpatial.type === ssr.constants.GEO_FLOOR_TYPE)
        this.activeSpatial = [];
    },
    onClickAddBimFloor(item) {
      this.activeBim = [item];
      this.onConfimLinkBimFloor();
    },
    onConfimLinkBimFloor() {
      addBimFloorToFloor(this.selectedSpatial, this.activeBim[0]);
      setImmediate(() => {
        this.$refs.spatialTree.updateAll(true);
      });
    },
    async onGenerateClick() {
      const cmds = await mergeBimGeoCreateCmd(this.spatialTree);
      console.log('cmd', cmds);
      const { node, context, data } = await saveCmdsGenerateGeo(cmds);
      addNodeGraphService(node);
      await waitPathSendToHub(data);
      spinal.spinalPanelManagerService.openPanel('CmdRunViewer', {
        dataCmd: cmds,
        node,
        contextId: context.info.id.get(),
      });
    },
    showJSON(json) {
      return JSON.stringify(json, null, 2);
    },
    opened(option) {
      this.geoContextId = option.selectedNodeId;
      return this.initSpatialTree();
    },
    removed() {},
    close() {},
    closeDialog() {},
  },
};
</script>

<style scoped>
.SpinalMergeBimGeo-main {
  height: calc(100% - 17px);
  position: relative;
}
.SpinalMergeBimGeo-container {
  height: calc(100% - 42px);
  position: relative;
  display: flex;
  flex-direction: row;
}
.SpinalMergeBimGeo-content-left {
  width: 50%;
  border-right: 1px #737374 solid;
}
.SpinalMergeBimGeo-content-right {
  border-left: 1px #737374 solid;
  width: 50%;
}
.SpinalMergeBimGeo-action-bar {
  height: 42px;
  position: relative;
  display: flex;
}
.SpinalMergeBimGeo-content-header {
  height: 40px;
  padding: 8px 8px 0 8px;
  text-align: center;
}
.SpinalMergeBimGeo-content {
  height: calc(100% - 40px);
  border: 1px solid #fff;
  margin: 0 8px;
  padding: 8px;
}
.SpinalMergeBimGeo-tree-button {
  margin: 0 8px;
}
</style>
<style>
.SpinalMergeBimGeo-main * {
  box-sizing: border-box;
}
.SpinalMergeBimGeo-scrollbar {
  overflow: auto;
}
.SpinalMergeBimGeo-scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.SpinalMergeBimGeo-scrollbar::-webkit-scrollbar-thumb {
  -webkit-border-radius: 5px;
  border-radius: 5px;
  background: rgba(169, 169, 169, 0.9);
}
.SpinalMergeBimGeo-scrollbar::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
  box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
  -webkit-border-radius: 5px;
  border-radius: 5px;
}
.SpinalMergeBimGeo-selection-active {
  background-color: #365bab !important;
}
</style>
