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
        v-if="selectedGroup === undefined"
        :groupConfigs="groupConfigs"
        :can-save="cleanCfg"
        @addAGroupConfig="addAGroupConfig"
        @selectGroup="onselectedGroup"
        @generate="generate"
        @save="onSave"
        @savableCfg="cleanCfg = false"
        @deleteGroup="deleteGroup"
      ></GroupeConfig>
      <SelectedGroup
        v-else
        :name="selectedGroup.name"
        :uid="selectedGroup.uid"
        :list="selectedGroup.data"
        :can-save="cleanCfg"
        @save="onSave"
        @savableCfg="cleanCfg = false"
        @back="selectedGroup = undefined"
        @generate="generate"
      ></SelectedGroup>
      <v-progress-linear
        class="geolocate-bimObj-progressbar"
        v-if="progress != 100"
        v-model="progress"
      ></v-progress-linear>
    </div>
  </v-app>
</template>

<script>
import {
  ProjectionGroupConfig,
  getProjectionConfig,
  getRealNode,
  removeConfigFromContext,
  createConfigNode,
  getIntersects,
  mergeIntersectRes,
  createCmdNotFound,
  createCmdProjection,
  saveCmdsProjectionGeo,
  addNodeGraphService,
  waitPathSendToHub,
  getRoomRefByFloor,
  mergeRoomRef,
  getRefFloorZMinMax,
} from 'spinal-spatial-referential';
import GroupeConfig from './groupConfig/GroupConfig.vue';
import SelectedGroup from './SelectedGroup/SelectedGroup.vue';

export default {
  name: 'ProjectObjectInContext',
  components: { GroupeConfig, SelectedGroup },
  data() {
    return {
      contextId: '',
      groupConfigs: [],
      selectedGroup: undefined,
      cleanCfg: true,
      progress: 100,
    };
  },
  mounted() {},
  methods: {
    addAGroupConfig(groupName) {
      const cfgGroup = new ProjectionGroupConfig(groupName);
      this.groupConfigs.push(cfgGroup);
      const context = getRealNode(this.contextId);
      return createConfigNode(context, cfgGroup);
    },
    onselectedGroup(select) {
      this.selectedGroup = select;
    },
    async onSave() {
      try {
        const context = getRealNode(this.contextId);
        this.progress = 0;
        for (let idx = 0; idx < this.groupConfigs.length; idx++) {
          const group = this.groupConfigs[idx];
          await group.saveToContext(context);
          this.progress = (this.groupConfigs.length / (idx + 1)) * 100;
        }
        this.cleanCfg = true;
      } catch (error) {
        console.error(error);
      } finally {
        this.progress = 100;
      }
    },
    getConfigByUid(configUidToGen) {
      for (const cfg of this.groupConfigs) {
        if (cfg.uid === configUidToGen) return cfg;
      }
    },
    async generate(configUidToGens) {
      await this.onSave();
      this.progress = 0;
      try {
        const roomRef = await getRoomRefByFloor();
        this.progress = 25;
        const floorsZData = await getRefFloorZMinMax(roomRef);
        const mergedRoomRef = mergeRoomRef(roomRef);
        const intersectRes = {
          selection: [],
          intersects: [],
        };
        for (let idx = 0; idx < configUidToGens.length; idx++) {
          const configToGen = this.getConfigByUid(configUidToGens[idx]);
          if (!configToGen) {
            console.error(
              `${configUidToGens[idx]} skipped no config found with this uid`
            );
            continue;
          }
          const intersectResTmp = await getIntersects(
            configToGen,
            mergedRoomRef
          );
          // merge intersectRes
          mergeIntersectRes(intersectRes, intersectResTmp);
          this.progress = (configUidToGens.length / (idx + 1)) * 66;
          console.log(
            'raycasting %d% => %d/%d',
            (configUidToGens.length / (idx + 1)) * 100,
            idx + 1,
            configUidToGens.length
          );
        }
        console.log('raycasting', intersectRes);
        const cmdNotFounds = await createCmdNotFound(intersectRes);
        console.log('cmdNotFounds', cmdNotFounds);
        this.progress = 80;
        const cmdProject = await createCmdProjection(
          intersectRes.intersects,
          this.contextId,
          floorsZData
        );
        console.log('cmdProject', cmdProject);
        this.progress = 90;
        const cmd = cmdNotFounds.concat(cmdProject);
        const {
          node,
          context: contextCmd,
          data,
        } = await saveCmdsProjectionGeo(cmd);
        addNodeGraphService(node);
        await waitPathSendToHub(data);
        console.log('done', cmd);
        spinal.spinalPanelManagerService.openPanel('CmdRunViewer', {
          dataCmd: cmd,
          node,
          contextId: contextCmd.info.id.get(),
        });
      } catch (error) {
        console.error(error);
      } finally {
        this.progress = 100;
      }
    },
    deleteGroup(uid) {
      const index = this.groupConfigs.findIndex((itm) => itm.uid === uid);
      if (index !== -1) {
        const itm = this.groupConfigs[index];
        this.groupConfigs.splice(index, 1);
        const context = getRealNode(this.contextId);
        return removeConfigFromContext(context, itm.uid);
      }
    },
    async getConfig() {
      this.progress = 0;
      const context = getRealNode(this.contextId);
      this.groupConfigs = await getProjectionConfig(context);
      this.progress = 100;
    },
    async opened(contextId) {
      this.contextId = contextId;
      return this.getConfig();
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
.geolocate-bimObj-progressbar {
  z-index: 1;
  position: absolute;
  bottom: 0;
  margin: 0;
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
