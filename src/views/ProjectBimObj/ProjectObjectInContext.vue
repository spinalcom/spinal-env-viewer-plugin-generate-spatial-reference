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
  <v-app dark class="geolocate-bimObj-body">
    <div class="geolocate-bimObj-container">
      <GroupeConfig
        v-if="selectedGroup === null"
        :groupConfigs="groupConfigs"
        @addAGroupConfig="addAGroupConfig"
        @selectGroup="onselectedGroup"
        @generate="generate"
        @deleteGroup="deleteGroup"
        @showInViewer="showInViewer"
      ></GroupeConfig>
      <SelectedGroup
        v-else
        @back="selectedGroup = null"
        :selectedGroup="selectedGroup"
        @generate="generate"
      ></SelectedGroup>
    </div>
  </v-app>
</template>

<script>
import { ProjectionGroupeConfig } from 'spinal-spatial-referential';
import GroupeConfig from './GroupConfig.vue';
import SelectedGroup from './SelectedGroup.vue';

export default {
  name: 'ProjectObjectInContext',
  components: { GroupeConfig, SelectedGroup },
  data() {
    return {
      contextId: '',
      groupConfigs: [],
      selectedGroup: null,
    };
  },
  mounted() {},
  methods: {
    addAGroupConfig(groupName) {
      this.groupConfigs.push(new ProjectionGroupeConfig(groupName));
    },
    onselectedGroup(select) {
      this.selectedGroup = select;
    },
    generate() {
      console.log('generate', arguments);
    },
    deleteGroup(uid) {
      const index = this.groupConfigs.findIndex((itm) => itm.uid === uid);
      if (index !== -1) this.groupConfigs.splice(index, 1);
    },
    showInViewer(uid) {
      const itm = this.groupConfigs.find((itm) => itm.uid === uid);
      console.log('showInViewer', itm);
    },
    async opened(contextId) {
      this.contextId = contextId;
    },
    removed() {},
    close() {},
    closeDialog() {},
  },
};
</script>

<style scoped>
.geolocate-bimObj-body {
  height: calc(100% - 17px);
  position: relative;
}
.geolocate-bimObj-container {
  height: 100%;
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
</style>
