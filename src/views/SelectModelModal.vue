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
  <v-app>
    <v-layout row
              full-width
              scrollable
              justify-center>
      <v-dialog v-model="dialog">
        <v-card :dark="true">
          <v-card-title class="headline">
            Choisez un model
          </v-card-title>
          <v-card-text>
            <v-progress-circular v-if="spin"
                                 indeterminate
                                 color="primary" />
            <v-select :items="bimfiles"
                      label="Model"
                      @change="onModelSelected" />
            <v-text-field v-model="buildingName"
                          placeholder="Nom du batiment"
                          label="Nom du batiement" />

            <v-checkbox v-model="addLevel"
                        :label="`Ajouter un etage`" />
            <!-- <comboxSelectAttr></comboxSelectAttr> -->
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="green darken-1"
                   flat
                   :disabled="selectedModel === null"
                   @click="generate">
              Generer
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
  </v-app>
</template>

<script>
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import * as SM from "spinal-spatial-referential";

// import comboxSelectAttr from "./comboxSelectAttr.vue";

export default {
  name: "DialogGenerateContext",
  data: function() {
    this.manager = new SM.default.SpatialManager();
    return {
      models: [],
      selectedModel: null,
      dialog: false,
      spin: false,
      model: undefined,
      buildingName: "",
      addLevel: false
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

    //Load the children into the graph service
    SpinalGraphService.getChildren(context.info.id.get(), []);

    context.getChildrenInContext(context, []).then(children => {
      for (let i = 0; i < children.length; i++) {
        this.models.push(children[i]);
      }
    });
  },
  methods: {
    onModelSelected(model) {
      this.selectedModel = model;
    },
    generate() {
      this.spin = true;

      let bimFile;
      for (let i = 0; i < this.models.length; i++) {
        if (this.models[i].info.name.get() === this.selectedModel) {
          bimFile = this.models[i];
        }
      }
      window.spinal.SpinalForgeViewer.getSVF(
        bimFile.element,
        bimFile.info.id.get(),
        bimFile.info.name.get()
      )
        .then(svfVersionFile => {
          let path = window.location.origin + svfVersionFile.path;
          return this.loadModel(path, {});
        })
        .then(async m => {
          window.spinal.BimObjectService.addModel(
            bimFile.info.id.get(),
            m,
            1,
            null,
            bimFile.info.name.get()
          );

          await this.manager.init();
          this.model = m;
          return this.manager.getBuilding(this.buildingName);
        })
        .then(building => {
          if (this.addLevel) {
            return this.manager.generateContext(this.buildingName, this.model);
          } else {
            if (typeof building !== "undefined") {
              return this.manager.updateContext(this.buildingName, this.model);
            }
            return this.manager.generateContext(this.buildingName, this.model);
          }
        })
        .then(() => {
          this.spin = false;
        });
    },

    loadModel(path, opts) {
      return new Promise(resolve => {
        function geometryLoaded(m) {
          resolve(m.model);
        }

        const viewer = window.spinal.SpinalForgeViewer.viewerManager.viewer;
        viewer.addEventListener(
          window.Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
          geometryLoaded
        );
        viewer.loadModel(path, opts);
      });
    },
    opened() {
      this.dialog = true;
    },
    removed() {},
    closeDialog() {}
  }
};
</script>

<style scoped>
</style>
