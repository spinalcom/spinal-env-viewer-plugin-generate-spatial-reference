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
         class="gen-spatial-body">
    <div class="gen-spatial-container">
      <v-tabs v-model="active">
        <v-tab ripple>
          Basic
        </v-tab>
        <v-tab ripple>
          Advancé
        </v-tab>
        <v-tab-item class="spinal-modal-gen-spatial-tab-item">
          <Basicselectmodel v-if="active === 0"
                            :bimfiles="bimfiles"
                            :btn-disabled="spin"
                            @continue="generate" />
        </v-tab-item>
        <v-tab-item>
          <AdvencedSelectModel v-if="active === 1"
                               :bimfiles="bimfiles"
                               :btn-disabled="spin"
                               @onGenerate="advancedGenerate" />
        </v-tab-item>
      </v-tabs>

      <v-progress-linear v-if="spin"
                         style="margin:0;"
                         class="spinal-modal-progress-bar"
                         :indeterminate="true"
                         color="primary" />
    </div>
  </v-app>
</template>

<script>
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import * as SM from "spinal-spatial-referential";
import Basicselectmodel from "./BasicSelectModel.vue";
import AdvencedSelectModel from "./AdvancedSelect/AdvencedSelectModel.vue";
import { generateContext } from "../services/generateContext";
export default {
  name: "DialogGenerateContext",
  components: { Basicselectmodel, AdvencedSelectModel },
  data: function() {
    this.manager = new SM.default.SpatialManager();
    return {
      models: [],
      selectedModel: null,
      dialog: false,
      spin: false,
      model: undefined,
      buildingName: "",
      addLevel: false,
      active: 0
    };
  },
  computed: {
    bimfiles() {
      return this.models.map(child => {
        return child.info.name.get();
      });
    }
  },
  mounted() {
    //TODO find constant
    let context = SpinalGraphService.getContext("BimFileContext");
    if (!context) return;

    //Load the children into the graph service
    SpinalGraphService.getChildren(context.info.id.get(), []);

    context.getChildrenInContext(context, []).then(children => {
      for (let i = 0; i < children.length; i++) {
        this.models.push(children[i]);
      }
    });
  },
  methods: {
    async generate(opt) {
      this.spin = true;
      let bimFile;
      for (let i = 0; i < this.models.length; i++) {
        if (this.models[i].info.name.get() === opt.selectedModel) {
          bimFile = this.models[i];
          break;
        }
      }
      try {
        await generateContext(
          this.manager,
          bimFile,
          opt.buildingName,
          opt.addLevel
        );
      } catch (e) {
        console.error(e);
      } finally {
        this.spin = false;
      }
    },
    async advancedGenerate(cfg) {
      console.log("cfg", cfg);
      const spatialConfig = await this.manager.getSpatialConfig();
      spatialConfig.set(cfg);
      await this.generate(cfg.basic);
    },
    opened() {
      this.dialog = true;
    },
    removed() {},
    close() {},
    closeDialog() {}
  }
};
</script>

<style scoped>
.gen-spatial-body {
  height: calc(100% - 17px);
  position: relative;
}
.spinal-modal-progress-bar {
  margin: 0;
  position: sticky;
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
}
.gen-spatial-container > .v-tabs > .v-window {
  height: calc(100% - 50px);
  position: relative;
}
.gen-spatial-container > .v-tabs > .v-window > .v-window__container {
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

/* .gen-spatial-body > .v-menu__content {
  top: 52px !important;
} */
</style>
