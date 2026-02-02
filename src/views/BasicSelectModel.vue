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
  <v-card>
    <v-card-text>
      <md-field>
        <label for="modelselect"
          >Selection of the model that contains the architecture</label
        >
        <md-select
          id="modelselect"
          v-model="selectedModel"
          name="modelselect"
          md-dense
        >
          <md-option
            v-for="(bimfile, idx) in bimfiles"
            :key="idx"
            :value="bimfile"
            v-tooltip="bimfile"
          >
            {{ bimfile }}
          </md-option>
        </md-select>
      </md-field>
      <md-checkbox v-model="isRawData">Mode Raw Data</md-checkbox>
      <md-checkbox v-if="isRawData" v-model="isFloorOnlyImport"
        >Import only reference objects to floors</md-checkbox
      >

      <md-field v-if="isRawData">
        <label for="context select">Select a BIM Geo Context</label>
        <md-select
          id="context select"
          v-model="contextSelectedValue"
          name="context select"
          md-dense
          class="context-select"
        >
          <md-option
            v-for="context in contexts"
            :key="context.value"
            :value="context.value"
          >
            {{ context.label }}
          </md-option>
        </md-select>
        <md-button
          class="md-icon-button"
          md-dense
          @click="
            newcontextValue = '';
            openDialogNewcontext = true;
          "
        >
          <md-icon>add</md-icon>
        </md-button>
      </md-field>

      <md-field v-else>
        <label for="building select">select the building</label>
        <md-select
          id="building select"
          v-model="buildingSelectedValue"
          name="building select"
          md-dense
          class="building-select"
        >
          <md-option
            v-for="building in buildings"
            :key="building.value"
            :value="building.value"
          >
            {{ building.label }}
          </md-option>
        </md-select>
        <md-button
          class="md-icon-button"
          md-dense
          @click="
            newBuildingValue = '';
            openDialogNewBuilding = true;
          "
        >
          <md-icon>add</md-icon>
        </md-button>
      </md-field>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn
        color="green darken-1"
        flat
        :disabled="btnDisabledCompu"
        @click="onContinue"
      >
        {{ btnLabel }}
      </v-btn>
    </v-card-actions>
    <md-dialog-prompt
      :md-active.sync="openDialogNewBuilding"
      v-model="newBuildingValue"
      md-title="building name"
      md-input-maxlength="100"
      md-input-placeholder="Type the building name..."
      md-confirm-text="Done"
      @md-confirm="onAcceptNewBuilding(newBuildingValue)"
    />
    <md-dialog-prompt
      :md-active.sync="openDialogNewcontext"
      v-model="newContextValue"
      md-title="context name"
      md-input-maxlength="50"
      md-input-placeholder="Type the Context name..."
      md-confirm-text="Done"
      @md-confirm="onAcceptNewContext(newContextValue)"
    />
  </v-card>
</template>

<script>
import {
  getContextSpatial,
  getGraph,
  waitGetServerId,
  getBimGeoContexts,
  createBIMGeoContext,
} from 'spinal-spatial-referential';
import geoService from 'spinal-env-viewer-context-geographic-service';

export default {
  name: 'Basicselectmodel',
  props: {
    bimfiles: { require: true, type: Array, default: () => [] },
    btnLabel: { type: String, default: () => 'Continue' },
    btnDisabled: { type: Boolean, default: () => false },
  },
  data() {
    return {
      addLevel: false,
      selectedModel: null,
      manualAssingment: new Map(),
      newBuildingValue: '',
      openDialogNewBuilding: false,
      buildingSelectedValue: null,
      buildings: [],
      isRawData: false,
      isFloorOnlyImport: false,
      newContextValue: '',
      openDialogNewcontext: false,
      contextSelectedValue: null,
      contexts: [],
    };
  },
  computed: {
    btnDisabledCompu() {
      return (
        this.btnDisabled ||
        this.selectedModel === null ||
        !(this.buildingSelectedValue || this.contextSelectedValue)
      );
    },
  },
  mounted() {
    return this.getBuildings();
  },
  watch: {
    isRawData() {
      if (this.isRawData === false) {
        return this.getBuildings();
      } else {
        return this.getBimGeoContexts();
      }
    },
  },
  methods: {
    onModelSelected(value) {
      this.selectedModel = value;
    },
    async getBuildings() {
      if (this.isRawData === false) {
        const graph = getGraph();
        const contextGeo = await getContextSpatial(graph);
        const buildings = await contextGeo.getChildrenInContext(contextGeo);
        this.buildings = buildings.map((itm) => {
          return {
            label: itm.info.name.get(),
            value: itm._server_id,
          };
        });
        if (this.buildings.length === 1)
          this.buildingSelectedValue = this.buildings[0].value;
      }
    },
    async getBimGeoContexts() {
      if (this.isRawData === true) {
        const contexts = await getBimGeoContexts();
        this.contexts = contexts.map((itm) => {
          return {
            label: itm.info.name.get(),
            value: itm._server_id,
          };
        });
        if (this.contexts.length === 1)
          this.contextSelectedValue = this.contexts[0].value;
      }
    },
    async onAcceptNewBuilding(buildingName) {
      const graph = getGraph();
      const contextGeo = await getContextSpatial(graph);
      const node = await geoService.addBuilding(
        contextGeo.info.id.get(),
        contextGeo.info.id.get(),
        buildingName
      );
      await waitGetServerId(node);
      return this.getBuildings();
    },
    async onAcceptNewContext(contextName) {
      const context = await createBIMGeoContext(contextName);
      await waitGetServerId(context);
      return this.getBimGeoContexts();
    },
    onContinue() {
      this.$emit('continue', {
        isRawData: this.isRawData,
        isFloorOnlyImport: this.isFloorOnlyImport,
        selectedModel: this.selectedModel,
        buildingServId: this.buildingSelectedValue,
        BIMGeocontextServId: this.contextSelectedValue,
      });
    },
  },
};
</script>

<style scoped>
.building-select {
  align-items: flex-end;
}
</style>
