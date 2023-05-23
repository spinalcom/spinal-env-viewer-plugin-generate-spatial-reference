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
          <md-option v-for="bimfile in bimfiles" :value="bimfile">
            {{ bimfile }}
          </md-option>
        </md-select>
      </md-field>
      <md-field>
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
      :md-title="title"
      md-input-maxlength="30"
      md-input-placeholder="Type the building name..."
      md-confirm-text="Done"
      @md-confirm="onAcceptNewBuilding(newBuildingValue)"
    />
  </v-card>
</template>

<script>
import {
  getContextSpatial,
  getGraph,
  waitGetServerId,
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
      newBuildingValue: '',
      manualAssingment: new Map(),
      openDialogNewBuilding: false,
      buildings: [],
      buildingSelectedValue: null,
    };
  },
  computed: {
    btnDisabledCompu() {
      return (
        this.btnDisabled ||
        this.selectedModel === null ||
        !this.buildingSelectedValue
      );
    },
  },
  mounted() {
    return this.getBuildings();
  },
  methods: {
    onModelSelected(value) {
      this.selectedModel = value;
    },
    async getBuildings() {
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
    onContinue() {
      this.$emit('continue', {
        buildingServId: this.buildingSelectedValue,
        selectedModel: this.selectedModel,
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
