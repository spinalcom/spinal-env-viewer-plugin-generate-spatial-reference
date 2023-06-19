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
  <v-tabs class="AssingDataView-vtabs" v-model="active" dark fixed-tabs grow>
    <v-tab ripple> Warnings ({{ warnLen }})</v-tab>
    <v-tab ripple> Error ({{ errLen }})</v-tab>
    <v-tab-item class="AssingDataView-tab-container">
      <AssingDataViewList
        :roomSelected="roomSelected"
        :items="warnArr"
        @roomSelect="onRoomSelect"
      ></AssingDataViewList>
    </v-tab-item>
    <v-tab-item class="AssingDataView-tab-container">
      <AssingDataViewList
        :roomSelected="roomSelected"
        :items="errorArr"
        @roomSelect="onRoomSelect"
      ></AssingDataViewList
    ></v-tab-item>
  </v-tabs>
</template>

<script>
import {
  getDataAssing,
  createCmdProjectionForManualAssing,
  saveCmdsProjectionGeo,
  addNodeGraphService,
  waitPathSendToHub,
} from 'spinal-spatial-referential';
import { debounce } from 'lodash';
import AssingDataViewList from './AssingDataViewList.vue';

export default {
  name: 'AssingDataView',
  components: { AssingDataViewList },
  data() {
    return {
      active: 0,
      warnArr: [],
      errorArr: [],
    };
  },
  props: ['contextId', 'selectedNodeId', 'roomSelected'],
  computed: {
    warnLen() {
      return this.warnArr.reduce((acc, item) => {
        if (!item.validId) acc += 1;
        return acc;
      }, 0);
    },
    errLen() {
      return this.errorArr.reduce((acc, item) => {
        if (!item.validId) acc += 1;
        return acc;
      }, 0);
    },
  },
  mounted() {
    return this.update();
  },
  created() {
    this.update = debounce(this._updateData, 100);
  },
  watch: {
    contextId() {
      this.update();
    },
    selectedNodeId() {
      this.update();
    },
  },
  methods: {
    async _updateData() {
      if (!this.contextId || !this.selectedNodeId) return;
      const data = await getDataAssing({
        contextId: this.contextId,
        selectedNodeId: this.selectedNodeId,
      });
      this.errorArr = data.error;
      this.warnArr = data.warn;
      if (this.warnArr.length === 0 && this.errorArr.length) this.active = 1;
    },
    onRoomSelect(roomId) {
      this.$emit('roomSelect', roomId);
    },
    async generate() {
      console.log('generate', this.errorArr, this.warnArr);

      const { cmd, cmdMiss } = await createCmdProjectionForManualAssing(
        this.warnArr,
        this.errorArr
      );
      const cmds = cmd.concat(cmdMiss);
      const {
        node,
        context: contextCmd,
        data,
      } = await saveCmdsProjectionGeo(cmds);
      addNodeGraphService(node);
      await waitPathSendToHub(data);
      console.log('done', cmd);
      spinal.spinalPanelManagerService.openPanel('CmdRunViewer', {
        dataCmd: cmd,
        node,
        contextId: contextCmd.info.id.get(),
      });
    },
  },
};
</script>

<style scoped>
.AssingDataView-vtabs {
  height: 100%;
}
</style>

<style>
.AssingDataView-vtabs *:hover {
  text-decoration: none !important;
}
.AssingDataView-vtabs .v-window {
  height: calc(100% - 48px);
  position: relative;
}
.AssingDataView-vtabs .v-window .v-window__container,
.AssingDataView-vtabs .AssingDataView-tab-container {
  height: 100%;
}
</style>
