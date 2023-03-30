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
  <v-app dark class="gen-spatial-body">
    <div class="gen-spatial-container">
      <v-tabs v-show="hideDiffSettings" v-model="active">
        <v-tab ripple> Basic </v-tab>
        <v-tab ripple> Advanced </v-tab>
        <v-tab ripple> Scripts </v-tab>
        <v-tab-item class="spinal-modal-gen-spatial-tab-item">
          <Basicselectmodel
            v-if="active === 0"
            :bimfiles="bimfiles"
            :btn-disabled="spin"
            @continue="generate"
          >
          </Basicselectmodel>
        </v-tab-item>
        <v-tab-item>
          <AdvencedSelectModel
            v-if="active === 1"
            :bimfiles="bimfiles"
            :btn-disabled="spin"
            @onGenerate="advancedGenerate"
          />
        </v-tab-item>
        <v-tab-item>
          <v-card>
            <v-card-text>
              <md-list>
                <template v-for="(item, index) in scripts">
                  <template v-if="item.divider">
                    <md-divider
                      v-if="index !== 0"
                      :key="`${item.title}-divider`"
                    ></md-divider>
                    <md-subheader :key="item.title">{{
                      item.title
                    }}</md-subheader>
                  </template>
                  <md-list-item
                    v-else
                    :key="item.title"
                    :disabled="spin"
                    @click="launchFct(item.fct)"
                  >
                    <span class="md-list-item-text">{{ item.title }}</span>
                  </md-list-item>
                </template>
              </md-list>
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs>
      <SpatialDiffSettings
        v-if="!hideDiffSettings"
        @back="hideDiffSettings = true"
        :archiData="archiData"
        :buildingServerId="buildingServId"
        :bimFileId="bimFileId"
      ></SpatialDiffSettings>
      <md-dialog :md-active.sync="showDialog">
        <md-dialog-title>Choose which bimFile to update</md-dialog-title>
        <md-dialog-content>
          <md-field>
            <md-select v-model="selectedModelModal" multiple>
              <md-option
                v-for="bimFileName in bimfiles"
                :key="bimFileName"
                :value="bimFileName"
                >{{ bimFileName }}</md-option
              >
            </md-select>
          </md-field>
        </md-dialog-content>
        <md-dialog-actions>
          <md-button class="md-primary" @click="showDialog = false"
            >Close</md-button
          >
          <md-button class="md-primary" @click="updateDbIdsConfirm"
            >confirm</md-button
          >
        </md-dialog-actions>
      </md-dialog>
      <v-progress-linear
        v-if="spin"
        style="margin: 0"
        class="spinal-modal-progress-bar"
        :indeterminate="true"
        color="primary"
      />
    </div>
  </v-app>
</template>

<script>
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import Basicselectmodel from './BasicSelectModel.vue';
import AdvencedSelectModel from './AdvancedSelect/AdvencedSelectModel.vue';
import SpatialDiffSettings from './diffViewer/SpatialDiffSettings.vue';
import {
  getGraph,
  getArchi,
  transformArchi,
  updateDbIds,
  updateRoomDbId,
  loadBimFile,
  setLevelInContextGeo,
  setAreaInContextGeo,
  setCenterPosInContextGeo,
} from 'spinal-spatial-referential';
export default {
  name: 'DialogGenerateContext',
  components: { Basicselectmodel, AdvencedSelectModel, SpatialDiffSettings },
  data: function () {
    return {
      models: [],
      configName: 'default',
      spin: false,
      active: 0,
      hideDiffSettings: true,
      archiData: null,
      buildingServId: NaN,
      selectedModel: null,
      selectedModelModal: null,
      showDialog: false,
      scripts: [
        { divider: true, title: 'Script before update' },
        { title: 'Update dbids from externalIds', fct: this.updateDbIds },
        {
          title: "Update Room's dbid attribute information",
          fct: this.updateRoomDbId,
        },
        { divider: true, title: 'Script after update' },
        {
          title: 'Set level attribute in context spatial',
          fct: this.setLevelInContextGeo,
        },
        {
          title: 'Set area attribute in context spatial',
          fct: this.setAreaInContextGeo,
        },
        {
          title: 'Set center postion attribute in context spatial',
          fct: this.setCenterPosInContextGeo,
        },
      ],
    };
  },
  computed: {
    bimfiles() {
      return this.models.map((child) => {
        return child.info.name.get();
      });
    },
    bimFileId() {
      const bimFile = this.getBimFile();
      if (bimFile) return bimFile.info.id.get();
      return '';
    },
  },
  async mounted() {
    // this.manager = new SM.default.SpatialManager();
    let context = SpinalGraphService.getContext('BimFileContext');
    if (!context) return;
    // const spatialConfig = await this.manager.getSpatialConfig();
    // for (let idx = 0; idx < spatialConfig.data.length; idx++) {
    // const config = spatialConfig.data[idx];
    // this.configNames.push(config.configName.get());
    // }
    //Load the children into the graph service
    SpinalGraphService.getChildren(context.info.id.get(), []);

    context.getChildrenInContext(context, []).then((children) => {
      for (let i = 0; i < children.length; i++) {
        this.models.push(children[i]);
      }
    });
  },
  methods: {
    updateDbIds() {
      this.showDialog = true;
    },
    async updateDbIdsConfirm() {
      this.showDialog = false;
      this.spin = true;
      const viewer = window.spinal.SpinalForgeViewer.viewerManager.viewer;
      try {
        for (let i = 0; i < this.models.length; i++) {
          const bimFileNode = this.models[i];
          if (this.selectedModelModal.includes(bimFileNode.info.name.get())) {
            const model = await loadBimFile(bimFileNode, viewer);
            await updateDbIds(bimFileNode.info.id.get(), model);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.spin = false;
      }
    },

    updateRoomDbId() {
      const graph = getGraph();
      return updateRoomDbId(graph);
    },
    setLevelInContextGeo() {
      const graph = getGraph();
      return setLevelInContextGeo(graph);
    },
    setAreaInContextGeo() {
      const graph = getGraph();
      return setAreaInContextGeo(graph);
    },
    setCenterPosInContextGeo() {
      const graph = getGraph();
      return setCenterPosInContextGeo(graph);
    },
    async launchFct(fct) {
      this.spin = true;
      try {
        await fct();
        console.log('done');
      } catch (error) {
        console.error(error);
      } finally {
        this.spin = false;
      }
    },
    getBimFile() {
      for (let i = 0; i < this.models.length; i++) {
        if (this.models[i].info.name.get() === this.selectedModel) {
          return this.models[i];
        }
      }
    },
    async generate(opt) {
      this.spin = true;
      const graph = getGraph();
      try {
        this.selectedModel = opt.selectedModel;
        const bimFile = this.getBimFile();
        const viewer = window.spinal.SpinalForgeViewer.viewerManager.viewer;
        console.log('start load bimfile');
        const archi = await getArchi(graph, this.configName, bimFile, viewer);
        transformArchi(archi);
        console.log('get Archi Done', archi);
        this.archiData = archi;
        this.hideDiffSettings = false;
        this.buildingServId = opt.buildingServId;
      } catch (e) {
        console.error(e);
      } finally {
        this.spin = false;
      }
    },
    async advancedGenerate(cfg) {
      // console.log('cfg', cfg);
      const spatialConfig = await this.manager.getSpatialConfig();
      spatialConfig.saveConfig(cfg);
      await this.generate(cfg.basic);
    },
    opened() {
      this.dialog = true;
    },
    removed() {},
    close() {},
    closeDialog() {},
  },
};
</script>

<style scoped>
.gen-spatial-body {
  height: calc(100% - 17px);
  position: relative;
}
.spinal-modal-progress-bar {
  margin: 0;
  z-index: 1;
  position: absolute;
  bottom: 2px;
}
.spinal-modal-gen-spatial-tab,
.spinal-modal-progress-bar {
  background: #707070aa;
}
.spinal-modal-gen-spatial-btn-footer {
  background: #222222aa;
}
.spinal-modal-gen-spatial-tab-item {
  max-height: calc(100vh - 325px);
  overflow-y: auto;
}
</style>
<style>
.gen-spatial-body > .application--wrap {
  min-height: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
.gen-spatial-body * {
  box-sizing: border-box;
}
.gen-spatial-container {
  height: 100%;
  position: relative;
}
.gen-spatial-container > .v-tabs {
  height: 100%;
  position: relative;
}
.gen-spatial-container > .v-tabs > .v-window {
  height: calc(100% - 50px);
  position: relative;
  overflow: auto;
}

.gen-spatial-container > .v-tabs > .v-window::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.gen-spatial-container > .v-tabs > .v-window::-webkit-scrollbar-thumb {
  -webkit-border-radius: 5px;
  border-radius: 5px;
  background: rgba(169, 169, 169, 0.9);
}
.gen-spatial-container > .v-tabs > .v-window::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
  box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
  -webkit-border-radius: 5px;
  border-radius: 5px;
}

.spinal-modal-gen-spatial-tab-item > .v-window__container {
  height: 100%;
  position: relative;
}
.gen-spatial-container
  > .v-tabs
  > .v-window
  > .v-window__container
  > .v-window-item {
  height: 100%;
  position: relative;
}
.gen-spatial-container > .v-tabs > .v-tabs__bar {
  background-color: #2e2e2e;
}
.gen-spatial-container .v-window > .v-window__container {
  height: 100%;
}

/* .gen-spatial-body > .v-menu__content {
  top: 52px !important;
} */
</style>
