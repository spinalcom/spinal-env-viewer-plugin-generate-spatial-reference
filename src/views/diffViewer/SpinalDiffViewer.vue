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
  <div class="SpinalDiffViewer-container">
    <div class="SpinalDiffViewer-header">
      <v-btn dark @click="closeDialog" round :icon="true">
        <v-icon>close</v-icon>
      </v-btn>

      <v-spacer></v-spacer>
      <v-btn dark @click="generate" round :icon="true">
        <v-icon>check</v-icon>
      </v-btn>
    </div>
    <div class="SpinalDiffViewer-content spinal-scrollbar">
      <SpinalDiffFloorViewer
        :archiData="archiData"
        v-model="skipList"
        @pushSkip="pushSkip"
        @rmAtSkip="rmAtSkip"
      ></SpinalDiffFloorViewer>
    </div>
  </div>
</template>

<script>
import SpinalDiffFloorViewer from './SpinalDiffFloorViewer.vue';
import {
  generateCmd,
  saveCmds,
  addNodeGraphService,
  waitPathSendToHub,
} from 'spinal-spatial-referential';
const SpinalDiffViewer = {
  name: 'SpinalDiffViewer',
  props: ['onFinised'],
  components: { SpinalDiffFloorViewer },
  data() {
    this.manualAssingment = null;
    return {
      showDialog: true,
      contextServerid: 0,
      archiData: undefined,
      skipList: [],
      loading: false,
    };
  },
  methods: {
    opened(option) {
      if (option) {
        this.archiData = option.archiData;
        this.manualAssingment = option.manualAssingment;
        this.buildingServerId = option.buildingServerId;
        this.bimFileId = option.bimFileId;
      }
    },
    removed(option) {
      this.showDialog = false;
    },
    closeDialog(closeResult) {
      if (typeof this.onFinised === 'function') this.onFinised();
    },
    pushSkip(itm) {
      this.skipList.push(itm);
    },
    rmAtSkip(idx) {
      this.skipList.splice(idx, 1);
    },
    async generate() {
      this.loading = true;
      try {
        const cmds = await generateCmd(
          this.archiData,
          this.skipList,
          this.buildingServerId,
          this.bimFileId
        );
        const { node, data } = await saveCmds(cmds);
        addNodeGraphService(node);
        await waitPathSendToHub(data);
        spinal.spinalPanelManagerService.openPanel('CmdRunViewer', {
          dataCmd: cmds,
          node,
        });
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
  },
};

export default SpinalDiffViewer;
</script>

<style scoped>
.SpinalDiffViewer-container {
  background-color: #424242;
  height: 100%;
  width: 100%;
  position: relative;
}
.SpinalDiffViewer-header {
  background-color: #222;
  display: flex;
}
.SpinalDiffViewer-content {
  height: calc(100% - 60px);
  overflow: auto;
}
</style>

<style>
.plugin-graph-viewer {
  position: relative;
}
.plugin-graph-viewer
  > .spinal-modal-container:has(.SpinalDiffViewer-container) {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 10;
}
</style>
