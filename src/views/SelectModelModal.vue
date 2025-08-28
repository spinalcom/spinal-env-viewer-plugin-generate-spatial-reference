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
        :isRawDataGen="isRawDataGen"
        :isFloorOnlyImport="isFloorOnlyImport"
        :BIMGeocontextServId="BIMGeocontextServId"
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
          <v-checkbox
            v-model="updateBimobjectsName"
            label="update bimobjects name"
          ></v-checkbox>
          <v-checkbox
            v-model="updateBimobjectsDbid"
            label="update bimobjects dbid"
          ></v-checkbox>
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
      <md-snackbar
        :md-position="'center'"
        :md-active.sync="showSnackbar"
        :md-duration="durationSnakebar"
        md-persistent
      >
        <span>{{ msgSnackbar }}</span>
        <md-button class="md-primary" @click="showSnackbar = false"
          >close</md-button
        >
      </md-snackbar>
    </div>
  </v-app>
</template>

<script>
import Basicselectmodel from './BasicSelectModel.vue';
import AdvencedSelectModel from './AdvancedSelect/AdvencedSelectModel.vue';
import SpatialDiffSettings from './diffViewer/SpatialDiffSettings.vue';
import {
  getGraph,
  getArchi,
  transformArchi,
  updateBimObjectFromBimFileId,
  updateRoomDbId,
  loadBimFile,
  setLevelInContextGeo,
  setAreaInContextGeo,
  setCenterPosInContextGeo,
  addNodeGraphService,
  getViewer,
  loadConfig,
  getArchiFloorOnly,
  getLevelsWithAssignedStructures,
  createCmdFloorOnlyImport,
  waitPathSendToHub,
  saveCmdsGenerateGeo,
} from 'spinal-spatial-referential';
import { getModelByName } from '../services/getObjFromRvtModel';
import { FileSystem } from 'spinal-core-connectorjs';
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
      isRawDataGen: false,
      isFloorOnlyImport: false,
      BIMGeocontextServId: NaN,
      selectedModel: null,
      selectedModelModal: null,
      showDialog: false,
      showSnackbar: false,
      msgSnackbar: '',
      durationSnakebar: Infinity,
      scripts: [
        { divider: true, title: 'Script before update' },
        { title: 'Update bimobjects from externalIds', fct: this.updateDbIds },
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
      updateBimobjectsName: true,
      updateBimobjectsDbid: true,
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
    const graph = getGraph();
    let context = await graph.getContext('BimFileContext');
    if (!context) return;
    addNodeGraphService(context);

    const children = await context.getChildrenInContext(context);
    for (const child of children) {
      addNodeGraphService(child);
      this.models.push(child);
    }
  },
  methods: {
    updateDbIds() {
      this.showDialog = true;
    },
    async updateDbIdsConfirm() {
      this.showDialog = false;
      this.spin = true;
      const viewer = getViewer();
      try {
        for (let i = 0; i < this.models.length; i++) {
          const bimFileNode = this.models[i];
          if (this.selectedModelModal.includes(bimFileNode.info.name.get())) {
            const model = await loadBimFile(bimFileNode, viewer);
            await updateBimObjectFromBimFileId(
              bimFileNode.info.id.get(),
              model,
              this.updateBimobjectsName,
              this.updateBimobjectsDbid
            );
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
      return setCenterPosInContextGeo(graph, this.callbackScript);
    },
    callbackScript(msg) {
      if (!msg || msg === 'done') {
        this.durationSnakebar = 4000;
      } else {
        this.showSnackbar = true;
        this.durationSnakebar = Infinity;
      }
      this.msgSnackbar = msg;
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
      try {
        console.log('generate with opt', opt);
        this.selectedModel = opt.selectedModel;
        const graph = getGraph();
        const bimFile = this.getBimFile();
        if (opt.isFloorOnlyImport) {
          await this.generateFloorOnly(opt, bimFile, graph);
        } else {
          console.log('start load bimfile');
          const viewer = getViewer();
          const archi = await getArchi(graph, this.configName, bimFile, viewer);
          transformArchi(archi);
          console.log('get Archi Done', archi);
          this.archiData = archi;
          this.hideDiffSettings = false;
          this.isRawDataGen = opt.isRawData;
          this.buildingServId = opt.buildingServId;
          this.BIMGeocontextServId = opt.BIMGeocontextServId;
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.spin = false;
      }
    },
    async advancedGenerate(cfg) {
      const graph = getGraph();
      const spatialConfig = await loadConfig(graph);
      spatialConfig.saveConfig(cfg);
      await this.generate(cfg.basic);
    },

    async generateFloorOnly(opt, bimFile, graph) {
      console.log('start generateFloorOnly', opt);
      if (!opt.levelSelect || !opt.structureSelect) {
        const configModel = await loadConfig(graph);
        const config = configModel.getConfig(this.configName);
        opt.levelSelect = config.levelSelect.get();
        opt.structureSelect = config.structureSelect.get();
      }
      const cfgFloor = opt.levelSelect;
      const cfgFloorStructure = opt.structureSelect;
      let model = getModelByName(this.selectedModel);
      if (!model) {
        const viewer = getViewer();
        model = await loadBimFile(bimFile, viewer);
      }
      const floorsdata = await getArchiFloorOnly(
        model,
        cfgFloor,
        cfgFloorStructure
      );
      const structs = floorsdata.structures.filter((structData) => {
        return model.isNodeExists(structData.dbId);
      });
      floorsdata.structures = structs;
      const levels = getLevelsWithAssignedStructures(floorsdata);

      const cmds = await createCmdFloorOnlyImport(
        FileSystem._objects[opt.BIMGeocontextServId],
        levels,
        bimFile.info.id.get()
      );
      const { node, context, data } = await saveCmdsGenerateGeo(cmds);
      addNodeGraphService(node);
      await waitPathSendToHub(data);
      spinal.spinalPanelManagerService.openPanel('CmdRunViewer', {
        dataCmd: cmds,
        node,
        contextId: context.info.id.get(),
      });
    },

    opened() {},
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
