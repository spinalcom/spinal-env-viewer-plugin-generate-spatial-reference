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
  <div>
    <v-stepper v-show="!showTestList"
               v-model="e1"
               class="advenced-select-model-container spinal-scrollbar"
               vertical>
      <v-stepper-step step="1">
        Basic parameters
      </v-stepper-step>
      <v-stepper-content step="1">
        <Basicselectmodel :bimfiles="bimfiles"
                          :btn-label="btnLabel"
                          @continue="onBasicSelect" />
      </v-stepper-content>

      <v-stepper-step step="2">
        Levels
      </v-stepper-step>
      <v-stepper-content step="2">
        <AdvenceSettings :model-name="basic.selectedModel"
                         :revit-cat="['Revit Level']"
                         @seeList="seeTestList"
                         @continue="onLevelSelect"
                         @cancel="onCancel" />
      </v-stepper-content>

      <v-stepper-step step="3">
        Rooms
      </v-stepper-step>
      <v-stepper-content step="3">
        <AdvenceSettings :model-name="basic.selectedModel"
                         :revit-cat="['Revit Pièces', 'Revit Rooms']"
                         @seeList="seeTestList"
                         @continue="onRoomSelect"
                         @cancel="onCancel">
          <v-checkbox v-model="isRoomRefOK"
                      :label="`Use Rooms 3D as Reference.`" />
          <template v-if="isRoomRefOK">
            <v-text-field v-model="floorRoomNbr"
                          label="Attribut name of the Room's number in the Level." />
            <v-text-field v-model="floorRoomName"
                          label="Attribut name to rename the Room"
                          placeholder="Optional" />
            <v-text-field v-model="floorLevelName"
                          label="Attribut name to rename the Level"
                          placeholder="Optional" />
          </template>
        </AdvenceSettings>
      </v-stepper-content>
      <template v-if="!isRoomRefOK">
        <v-stepper-step step="4">
          Floors*
          <small>Optional</small>
        </v-stepper-step>
        <v-stepper-content step="4">
          <AdvenceSettings :model-name="basic.selectedModel"
                           :revit-cat="['Revit Sols', 'Revit Floors']"
                           @seeList="seeTestList"
                           @continue="onFloorSelect"
                           @cancel="onCancel">
            <v-text-field v-model="floorRoomNbr"
                          label="Attribut name of the Room's number in the Level." />
            <v-text-field v-model="floorRoomName"
                          label="Attribut name to rename the Room"
                          placeholder="Optional" />
            <v-text-field v-model="floorLevelName"
                          label="Attribut name to rename the Level"
                          placeholder="Optional" />
          </AdvenceSettings>
        </v-stepper-content>
      </template>

      <v-stepper-step :step="structureStep">
        Structures
      </v-stepper-step>
      <v-stepper-content :step="structureStep">
        <AdvenceSettingStructure :model-name="basic.selectedModel"
                                 @seeList="seeTestList"
                                 @continue="onStructureSelect"
                                 @cancel="onCancel" />
      </v-stepper-content>
      <v-stepper-step :step="structureStep + 1">
        Confirm
      </v-stepper-step>
      <v-stepper-content :step="structureStep + 1">
        <v-btn color="red darken-1"
               flat
               @click="onCancel">
          Cancel
        </v-btn>
        <v-btn color="primary"
               @click="onGenerate">
          Generate
        </v-btn>
      </v-stepper-content>
    </v-stepper>
    <div v-if="showTestList"
         class="test-popover spinal-scrollbar">
      <ShowTestList :items="testItems"
                    :model-name="basic.selectedModel"
                    @close="showTestList = false" />
    </div>
  </div>
</template>

<script>
import Basicselectmodel from "../BasicSelectModel.vue";
import ShowTestList from "../showTestList.vue";
import AdvenceSettings from "./AdvenceSettings.vue";
import AdvenceSettingStructure from "./AdvenceSettingStructure.vue";

AdvenceSettings;
import {
  getObjFromRvtModel,
  getModelByName
} from "../../services/getObjFromRvtModel";

export default {
  name: "AdvencedSelectModel",
  components: {
    Basicselectmodel,
    AdvenceSettings,
    AdvenceSettingStructure,
    ShowTestList
  },
  props: {
    bimfiles: { require: true, type: Array, default: () => [] },
    btnLabel: { type: String, default: () => "Continue" },
    btnDisabled: { type: Boolean, default: () => false }
  },
  data() {
    return {
      firstname: "test",
      advenced: [],
      e1: 1,
      isRoomRefOK: true,
      showTestList: false,
      basic: {},
      levelSelect: [],
      roomSelect: [],
      floorSelect: [],
      structureSelect: [],
      testItems: [],
      floorRoomNbr: "Number",
      floorRoomName: "",
      floorLevelName: ""
    };
  },
  computed: {
    structureStep() {
      return this.isRoomRefOK ? 4 : 5;
    }
  },
  methods: {
    onCancel() {
      this.e1 = this.e1 - 1;
    },
    onBasicSelect(value) {
      this.e1 = this.e1 + 1;
      this.basic = value;
    },
    onLevelSelect(value) {
      this.levelSelect = value;
      this.e1 = this.e1 + 1;
    },
    onRoomSelect(value) {
      this.roomSelect = value;
      this.e1 = this.e1 + 1;
    },
    onFloorSelect(value) {
      this.floorSelect = value;
      this.e1 = this.e1 + 1;
    },
    onStructureSelect(value) {
      this.structureSelect = value;
      this.e1 = this.e1 + 1;
    },
    onGenerate() {
      const cfg = {
        basic: this.basic,
        levelSelect: this.createData(this.levelSelect),
        roomSelect: this.createData(this.roomSelect),
        structureSelect: this.createData(this.structureSelect)
      };
      if (this.isRoomRefOK === true) {
        Object.assign(cfg, { floorSelect: this.createData(this.floorSelect) });
      }
      if (this.floorRoomNbr) {
        Object.assign(cfg, { floorRoomNbr: this.floorRoomNbr });
      }
      if (this.floorRoomName) {
        Object.assign(cfg, { floorRoomName: this.floorRoomName });
      }
      if (this.floorLevelName) {
        Object.assign(cfg, { floorLevelName: this.floorLevelName });
      }

      this.$emit("onGenerate", cfg);
    },
    createData(lstObj) {
      const res = [];
      for (const d of lstObj) {
        const obj = {
          key: d.key.toString(),
          value: d.value.toString()
        };
        if (d.isCat === true) Object.assign(obj, { isCat: true });
        res.push(obj);
      }
      return res;
    },
    async seeTestList(dataRegexp) {
      const model = getModelByName(this.basic.selectedModel);
      this.testItems = await getObjFromRvtModel(model, dataRegexp);

      console.log("this.testItems", this.testItems);
      this.showTestList = true;
    }
  }
};
</script>

<style >
.advenced-select-model-container {
  height: 100%;
  overflow-y: auto;
}
.spinal-scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.spinal-scrollbar::-webkit-scrollbar-thumb {
  -webkit-border-radius: 5px;
  border-radius: 5px;
  background: rgba(169, 169, 169, 0.9);
}
.spinal-scrollbar::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
  box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
  -webkit-border-radius: 5px;
  border-radius: 5px;
}
</style>
<style scoped>
.test-popover {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  overflow-y: auto;
}
</style>
