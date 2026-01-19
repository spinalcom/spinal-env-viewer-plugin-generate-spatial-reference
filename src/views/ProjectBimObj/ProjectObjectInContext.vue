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
      <v-card
        class="geolocate-bimObj-verif-card pa-3 mb-3"
        v-if="showVerification"
      >
        <v-card-text class="geolocate-bimObj-card-verif-content">
          <template v-for="item in verificationData" :key="item.id">
            <v-subheader> {{ item.name }} ({{ item.size }}) </v-subheader>
            <v-pagination
              :value="item.index"
              @input="updateItemIndex($event, item)"
              :length="Math.ceil(item.size / verifiPageSize)"
            ></v-pagination>
            <v-divider></v-divider>
          </template>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red"
            text
            @click="
              showVerification = false;
              cleanupProjectionTester();
            "
          >
            Cancel
          </v-btn>
          <v-btn color="primary" text @click="validateGenerate">
            Validate
          </v-btn>
        </v-card-actions>
      </v-card>

      <GroupeConfig
        v-else-if="selectedGroup === undefined"
        :groupConfigs="groupConfigs"
        @addAGroupConfig="addAGroupConfig"
        @selectGroup="onselectedGroup"
        @generate="generate"
        @save="onSave"
        @deleteGroup="deleteGroup"
      ></GroupeConfig>
      <SelectedGroup
        v-else
        :name="selectedGroup.name"
        :uid="selectedGroup.uid"
        :list="selectedGroup.data"
        :progress="selectedGroup.progress"
        :can-save="cleanCfg"
        @save="onSave"
        @savableCfg="cleanCfg = false"
        @back="selectedGroup = undefined"
        @generate="generate"
      ></SelectedGroup>
      <AssignFloor
        v-model="showAssignFloor"
        :levelsFound="levelsFound"
        :configFloorProjection="configFloorProjection"
        @confirm="onConfirmAssignFloor"
      ></AssignFloor>
      <v-progress-linear
        class="geolocate-bimObj-progressbar"
        v-if="progress != 100"
        :indeterminate="isNaN(progress)"
        v-model="progress"
      ></v-progress-linear>
    </div>
    <md-snackbar
      :md-position="'center'"
      :md-active.sync="showSnackbar"
      md-persistent
      class="md-accent"
    >
      <span>{{ msgSnackbar }}</span>
      <md-button class="md-primary" @click="showSnackbar = false"
        >close</md-button
      >
    </md-snackbar>
  </v-app>
</template>

<script>
import {
  getProjectionConfig,
  getRealNode,
  removeConfigFromContext,
  createConfigNodeAndProjGroup,
  prepareIntersects,
  mergeIntersectRes,
  createCmdNotFound,
  createCmdProjection,
  saveCmdsProjectionGeo,
  addNodeGraphService,
  waitPathSendToHub,
  getRoomRefByFloor,
  mergeRoomRef,
  getRefFloorZMinMax,
  initFloorAssign,
  updateProjectionFloorConfig,
  getOrCreateProjectionFloorConfig,
  aproximateItemsToFloors,
  ProjectionTester,
  raycastItemToMesh,
} from 'spinal-spatial-referential';
import GroupeConfig from './groupConfig/GroupConfig.vue';
import SelectedGroup from './SelectedGroup/SelectedGroup.vue';
import AssignFloor from './AssingFloor/AssignFloor.vue';

export default {
  name: 'ProjectObjectInContext',
  components: { GroupeConfig, SelectedGroup, AssignFloor },
  data() {
    return {
      contextId: '',
      groupConfigs: [],
      selectedGroup: undefined,
      cleanCfg: true,
      progress: 100,
      errorMode: true,
      msgSnackbar: '',
      showSnackbar: false,
      showAssignFloor: false,
      levelsFound: [],
      configFloorProjection: [],
      showVerification: false,
      verificationData: [],
      verifiPageSize: 25,
    };
  },
  mounted() {},
  methods: {
    async addAGroupConfig(groupName) {
      const context = getRealNode(this.contextId);
      const cfgGroup = await createConfigNodeAndProjGroup(context, groupName);
      this.groupConfigs.push(cfgGroup);
    },
    async onselectedGroup(select) {
      this.progress = 0;
      try {
        await select.loadConfigNode();
        this.selectedGroup = select;
        this.progress = 100;
      } catch (error) {
        console.error(error);
        this.showSnackbar = true;
        this.msgSnackbar = error.message;
        this.progress = 100;
      }
    },
    async onSave(configUidToGens) {
      try {
        const context = getRealNode(this.contextId);
        if (!configUidToGens)
          configUidToGens = this.groupConfigs.map((it) => it.uid);
        this.progress = 0;
        for (let idx = 0; idx < configUidToGens.length; idx++) {
          const group = this.getConfigByUid(configUidToGens[idx]);
          if (!group) {
            console.error(
              `${configUidToGens[idx]} skipped no config found with this uid`
            );
            continue;
          }
          await group.saveToContext(context);
          this.progress = (configUidToGens.length / (idx + 1)) * 100;
        }
        this.cleanCfg = true;
      } catch (error) {
        this.showSnackbar = true;
        this.msgSnackbar = error.message;
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
    async prepareItems(configUidToGens) {
      const lstItemsToAproximate = [];
      const lstItemsToIntersect = [];
      for (let idx = 0; idx < configUidToGens.length; idx++) {
        const configToGen = this.getConfigByUid(configUidToGens[idx]);
        if (!configToGen) {
          console.error(
            `${configUidToGens[idx]} skipped no config found with this uid`
          );
          continue;
        }
        const { itemsToAproximate, itemsToIntersect } = await prepareIntersects(
          configToGen
        );
        if (itemsToAproximate.length > 0)
          lstItemsToAproximate.push(itemsToAproximate);
        if (itemsToIntersect.length > 0)
          lstItemsToIntersect.push(itemsToIntersect);
      }
      return { lstItemsToAproximate, lstItemsToIntersect };
    },
    async generate(configUidToGens) {
      this.configUidToGens = configUidToGens;
      await this.onSave(configUidToGens);
      this.progress = NaN;
      try {
        const { lstItemsToAproximate, lstItemsToIntersect } =
          await this.prepareItems(configUidToGens);
        this.lstItemsToIntersect = lstItemsToIntersect;
        if (lstItemsToAproximate.length > 0) {
          const { levelsFound, configFloorProjection } = await initFloorAssign(
            lstItemsToAproximate,
            getRealNode(this.contextId)
          );
          this.lstItemsToAproximate = lstItemsToAproximate;
          this.levelsFound = levelsFound;
          this.configFloorProjection = configFloorProjection;
          this.showAssignFloor = true;
          this.progress = 100;
          return;
        }
      } catch (error) {
        console.error(error);
        this.progress = 100;
      }
      // this.progress = 0;
      // try {
      //   const roomRef = await getRoomRefByFloor();
      //   this.progress = 25;
      //   const floorsZData = await getRefFloorZMinMax(roomRef);
      //   const mergedRoomRef = mergeRoomRef(roomRef);
      //   const intersectRes = {
      //     selection: [],
      //     intersects: [],
      //   };
      //   for (let idx = 0; idx < configUidToGens.length; idx++) {
      //     const configToGen = this.getConfigByUid(configUidToGens[idx]);
      //     if (!configToGen) {
      //       console.error(
      //         `${configUidToGens[idx]} skipped no config found with this uid`
      //       );
      //       continue;
      //     }
      //     const { itemsToAproximate, itemsToIntersect } =
      //       await prepareIntersects(configToGen);

      //     const intersectResTmp = await raycastItemToMesh(
      //       itemsToIntersect,
      //       mergedRoomRef
      //     );

      //     // merge intersectRes
      //     mergeIntersectRes(intersectRes, intersectResTmp);
      //     this.progress = (configUidToGens.length / (idx + 1)) * 66;
      //     console.log(
      //       'raycasting %d% => %d/%d',
      //       (configUidToGens.length / (idx + 1)) * 100,
      //       idx + 1,
      //       configUidToGens.length
      //     );
      //   }
      //   console.log('raycasting', intersectRes);
      //   const cmdNotFounds = await createCmdNotFound(intersectRes);
      //   console.log('cmdNotFounds', cmdNotFounds);
      //   this.progress = 80;
      //   const cmdProject = await createCmdProjection(
      //     intersectRes.intersects,
      //     this.contextId,
      //     floorsZData
      //   );
      //   console.log('cmdProject', cmdProject);
      //   this.progress = 90;
      //   const cmd = cmdNotFounds.concat(cmdProject);
      //   const {
      //     node,
      //     context: contextCmd,
      //     data,
      //   } = await saveCmdsProjectionGeo(cmd);
      //   addNodeGraphService(node);
      //   await waitPathSendToHub(data);
      //   console.log('done', cmd);
      //   spinal.spinalPanelManagerService.openPanel('CmdRunViewer', {
      //     dataCmd: cmd,
      //     node,
      //     contextId: contextCmd.info.id.get(),
      //   });
      // } catch (error) {
      //   console.error(error);
      // } finally {
      //   this.progress = 100;
      // }
    },
    async validateGenerate() {
      const cmdNotFounds = await createCmdNotFound(this.intersectRes);
      console.log('cmdNotFounds', cmdNotFounds);
      const cmdProject = await createCmdProjection(
        this.intersectRes.intersects,
        this.contextId,
        this.floorsZData
      );
      console.log('cmdProject', cmdProject);
      // this.progress = 90;
      const cmd = cmdNotFounds.concat(cmdProject);
      const {
        node,
        context: contextCmd,
        data,
      } = await saveCmdsProjectionGeo(cmd);
      addNodeGraphService(node);
      await waitPathSendToHub(data);
      this.showVerification = false;
      console.log('done', cmd);
      spinal.spinalPanelManagerService.openPanel('CmdRunViewer', {
        dataCmd: cmd,
        node,
        contextId: contextCmd.info.id.get(),
      });
      this.cleanupProjectionTester();
    },
    async generate_intersects() {
      this.progress = NaN;
      try {
        const roomRefsByFloor = await getRoomRefByFloor();
        this.floorsZData = await getRefFloorZMinMax(roomRefsByFloor);
        const mergedRoomRef = mergeRoomRef(roomRefsByFloor);
        const config = await getOrCreateProjectionFloorConfig(
          getRealNode(this.contextId)
        );
        this.intersectRes = {
          selection: [],
          intersects: [],
        };

        if (this.lstItemsToAproximate)
          for (let idx = 0; idx < this.lstItemsToAproximate.length; idx++) {
            const itemsToAproximate = this.lstItemsToAproximate[idx];
            const intersectResTmp = await aproximateItemsToFloors(
              itemsToAproximate,
              roomRefsByFloor,
              config
            );
            mergeIntersectRes(this.intersectRes, {
              selection: itemsToAproximate,
              intersects: intersectResTmp,
            });
            console.log(
              'aproximating items to floors %d / %d',
              idx + 1,
              this.lstItemsToAproximate.length
            );
          }
        if (this.lstItemsToIntersect)
          for (let idx = 0; idx < this.lstItemsToIntersect.length; idx++) {
            const itemsToIntersect = this.lstItemsToIntersect[idx];
            const intersectResTmp = await raycastItemToMesh(
              itemsToIntersect,
              mergedRoomRef
            );
            mergeIntersectRes(this.intersectRes, {
              selection: itemsToIntersect,
              intersects: intersectResTmp,
            });
            console.log(
              'raycasting %d / %d',
              idx + 1,
              this.lstItemsToIntersect.length
            );
          }

        // same for raycast intersects
        console.log('intersectRes', this.intersectRes);
        this.projectionTester = new ProjectionTester(
          this.intersectRes.intersects,
          roomRefsByFloor
        );
        this.verificationData = this.projectionTester.getFloorsDataUx();
        this.verifiPageSize = this.projectionTester.pageSize;
        this.showVerification = true;
      } catch (error) {
        console.error(error);
        this.progress = 100;
      } finally {
        this.progress = 100;
      }
    },

    updateItemIndex(newIndex, item) {
      item.index = newIndex;
      this.verificationData = this.verificationData.map((it) => {
        if (it.id === item.id) {
          it.index = newIndex;
        } else it.index = 0;
        return it;
      });
      if (this.projectionTester)
        this.projectionTester.colorRooms(item.id, newIndex - 1);
    },

    async onConfirmAssignFloor({ levelsFoundAssigned, spatialLevels }) {
      await updateProjectionFloorConfig(
        getRealNode(this.contextId),
        levelsFoundAssigned,
        spatialLevels
      );
      this.showAssignFloor = false;
      this.generate_intersects();
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
    cleanupProjectionTester() {
      if (this.projectionTester) {
        this.projectionTester.clearColors();
        this.projectionTester = null;
        this.progress = 100;
      }
    },
    async opened(contextId) {
      this.contextId = contextId;
      return this.getConfig();
    },
    removed() {
      this.cleanupProjectionTester();
    },
    close() {},
    closeDialog() {},
  },
  // watch: {
  //   verificationPage(newPage) {
  //     // console.log('verificationPage changed to:', newPage);
  //     if (this.showVerification && this.projectionTester)
  //       this.projectionTester.colorRooms(newPage - 1);
  //   },
  // },
  beforeDestroy() {
    this.cleanupProjectionTester();
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
.geolocate-bimObj-verif-card {
  height: 100%;
}
.geolocate-bimObj-card-verif-content {
  height: calc(100% - 36px);
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
</style>
