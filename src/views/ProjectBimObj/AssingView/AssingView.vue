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
  <v-app dark class="manual-assign-projection-body">
    <v-toolbar dense dark>
      <v-btn
        v-tooltip="'import floor to search bar'"
        icon
        @click="importFloorToSearch"
      >
        <v-icon>image_search</v-icon>
      </v-btn>
      <v-btn
        v-tooltip="'isolate all the floor of the level selected'"
        icon
        :disabled="
          selectedSpatial.length === 0 || selectedSpatial[0].type !== 'floor'
        "
        @click="isolateFloor"
      >
        <v-icon>settings_overscan</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn icon @click="generate">
        <v-icon>check</v-icon>
      </v-btn>
    </v-toolbar>
    <div class="manual-assign-projection-container">
      <div class="manual-assign-projection-spatial-container">
        <v-text-field
          v-model="search"
          label="search"
          dark
          flat
          hide-details
          clearable
          clear-icon="clear"
        ></v-text-field>
        <div
          class="manual-assign-projection-treeview-container spinal-scrollbar"
        >
          <v-treeview
            v-if="spatial.length > 0"
            ref="assingTree"
            :items="spatial"
            activatable
            active-class="manual-assign-projection-treeview-item-active"
            :active.sync="selectedSpatial"
            open-all
            :search="search"
            return-object
            transition
          >
          </v-treeview>
        </div>
      </div>
      <div class="manual-assign-projection-list-container spinal-scrollbar">
        <AssingDataView
          ref="assingDataView"
          :roomSelected="selectedSpatialIdCompu"
          :contextId="contextId"
          :selectedNodeId="selectedNodeId"
          @roomSelect="onRoomSelect"
        ></AssingDataView>
      </div>
    </div>
  </v-app>
</template>

<script>
import ssRefService, {
  getSpatialTree,
  getRoomNodeFromSelectFloor,
  GEO_REFERENCE_ROOM_RELATION,
  getGraph,
  getContextSpatial,
} from 'spinal-spatial-referential';
import AssingDataView from './AssingDataView.vue';
import { utilities } from 'spinal-env-viewer-plugin-standard_button/js/utilities';

export default {
  name: 'AssingView',
  components: { AssingDataView },
  data() {
    return {
      search: '',
      contextId: '',
      selectedNodeId: '',
      spatial: [],
      selectedSpatial: [],
    };
  },
  computed: {
    selectedSpatialIdCompu() {
      if (this.selectedSpatial[0] && this.selectedSpatial[0].type === 'room')
        return this.selectedSpatial[0].id;
      return '';
    },
  },
  async mounted() {
    this.spatial = await getSpatialTree();
  },
  methods: {
    onRoomSelect(name) {
      console.log('onRoomSelect', name);
      this.search = name;
    },
    async importFloorToSearch() {
      const roomNode = await getRoomNodeFromSelectFloor();
      if (roomNode) {
        this.search = roomNode.info.name.get();
      }
    },
    async generate() {
      this.$refs.assingDataView.generate();
    },
    async isolateFloor() {
      const graph = getGraph();
      const spatialContext = await getContextSpatial(graph);
      const floorNode = FileSystem._objects[this.selectedSpatial[0].server_id];
      const rooms = await floorNode.getChildrenInContext(spatialContext);
      const floorRoomRefs = await Promise.all(
        rooms.map((room) =>
          room.getChildren(ssRefService.constants.GEO_REFERENCE_ROOM_RELATION)
        )
      );
      const nodes = floorRoomRefs.flat();
      const lstByModel = await utilities.sortBIMObjectByModel(nodes);
      const arrRes = utilities.organizeBimObjectForAggregateViewer(
        lstByModel,
        'ids'
      );
      window.spinal.ForgeViewer.viewer.impl.visibilityManager.aggregateIsolate(
        arrRes
      );
    },

    async opened({ contextId, selectedNodeId }) {
      this.contextId = contextId;
      this.selectedNodeId = selectedNodeId;
    },
    removed() {},
    close() {},
    closeDialog() {},
  },
};
</script>

<style scoped>
.manual-assign-projection-body {
  height: calc(100% - 17px);
  position: relative;
}
.manual-assign-projection-container {
  position: relative;
  height: calc(100% - 48px);
  display: flex;
  flex-direction: row;
}
.manual-assign-projection-container > div {
  width: 50%;
  height: 100%;
  overflow: auto;
  min-width: 200px;
}
.manual-assign-projection-treeview-container {
  height: calc(100% - 48px);
  overflow: auto;
}
.manual-assign-projection-spatial-container {
  margin: 0 8px;
}
</style>

<style>
.manual-assign-projection-body > .application--wrap {
  min-height: 100%;
  height: 100%;
}
.manual-assign-projection-body * {
  box-sizing: border-box;
}
.manual-assign-projection-treeview-item-active {
  background-color: #e3db00 !important;
  color: black;
}
</style>
