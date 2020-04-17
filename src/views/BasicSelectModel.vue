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
      <slot />
      <v-select :items="bimfiles"
                attach="#spinalbasicselectcard"
                label="Selection du model architecture"
                @change="onModelSelected" />
      <div id="spinalbasicselectcard" />
      <v-text-field v-model="buildingNameCompu"
                    placeholder="Nom du batiment"
                    label="Nom du batiement" />

      <v-checkbox v-model="addLevelCompu"
                  :label="`Ajouter un etage`" />
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="green darken-1"
             flat
             :disabled="btnDisabledCompu"
             @click="onContinue">
        {{ btnLabel }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "Basicselectmodel",
  props: {
    bimfiles: { require: true, type: Array, default: () => [] },
    btnLabel: { type: String, default: () => "Générer" },
    btnDisabled: { type: Boolean, default: () => false }
  },
  data() {
    return {
      addLevel: false,
      buildingName: "",
      selectedModel: null,
      spinalbasicselectcard: null
    };
  },
  computed: {
    addLevelCompu: {
      get() {
        return this.addLevel;
      },
      set(value) {
        this.addLevel = value;
      }
    },
    buildingNameCompu: {
      get() {
        return this.buildingName;
      },
      set(value) {
        this.buildingName = value;
      }
    },
    btnDisabledCompu() {
      return (
        this.btnDisabled ||
        this.buildingName === "" ||
        this.selectedModel === null
      );
    }
  },
  mounted() {
    this.spinalbasicselectcard = this.$refs.spinalbasicselectcard;
  },
  methods: {
    onModelSelected(value) {
      this.selectedModel = value;
    },
    onContinue() {
      this.$emit("continue", {
        addLevel: this.addLevel,
        buildingName: this.buildingName,
        selectedModel: this.selectedModel
      });
    }
  }
};
</script>
