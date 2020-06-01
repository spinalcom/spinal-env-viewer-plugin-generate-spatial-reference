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
  <v-dialog v-model="openDialogCompu"
            persistent
            lazy>
    <v-card class="spinal-model-gen-context-dialog-edit-cat">
      <!-- <v-card-title>
        <span class="headline"></span>
      </v-card-title> -->

      <v-card-text>
        <v-container grid-list-md>
          <v-layout wrap>
            <v-flex xs12
                    sm6>
              <h4>Attribut name</h4>
              <md-field>
                <md-select id="selectKeyFlagType"
                           v-model="selectKeyFlagTypeComp"
                           name="selectKeyFlagType"
                           md-dense>
                  <md-option v-for="item in items"
                             :value="item.name">
                    {{ item.name }}
                  </md-option>
                </md-select>
              </md-field>

              <!-- <v-select v-model="selectKeyFlagType"
                        :items="items"
                        return-object
                        item-text="name"
                        item-value="value" /> -->
              <div>
                <v-text-field v-model="resultKey"
                              label="Nom" />
                <v-text-field v-if="haveKeyFlag"
                              v-model="resultKeyFlag"
                              class="input-regex-fleg"
                              label="indicateur(s)" />
              </div>
            </v-flex>
            <v-flex xs12
                    sm6>
              <h4>Attribut value</h4>

              <md-field>
                <md-select id="selectValFlagType"
                           v-model="selectValFlagTypeComp"
                           name="selectValFlagType"
                           md-dense>
                  <md-option v-for="item in items"
                             :value="item.name">
                    {{ item.name }}
                  </md-option>
                </md-select>
              </md-field>

              <!-- <v-select v-model="selectValFlagType"
                        :items="items"
                        return-object
                        item-text="name"
                        item-value="value" /> -->

              <div>
                <v-text-field v-model="resultValue"
                              label="Valeur" />
                <v-text-field v-if="haveValFlag"
                              v-model="resultValFlag"
                              class="input-regex-fleg"
                              label="indicateur(s)" />
              </div>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="blue darken-1"
               flat
               @click="close">
          Cancel
        </v-btn>
        <v-btn color="blue darken-1"
               flat
               :disabled="btnValid"
               @click="save">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "DialogAddCat",
  props: [
    "keyData",
    "keyType",
    "keyFlag",
    "val",
    "valType",
    "valFlag",
    "openDialog"
  ],
  data() {
    return {
      items: [
        { name: "Equal", value: "e" },
        { name: "Contains", value: "c" },
        { name: "Advanced (Regular expression)", value: "r" }
      ],
      result_key: null,
      result_keyFlag: null,
      result_keyType: null,
      result_val: null,
      result_valFlag: null,
      result_valType: null
    };
  },
  computed: {
    selectValFlagTypeComp: {
      get() {
        return this.selectValFlagType.name;
      },
      set(value) {
        for (const item of this.items) {
          if (item.name === value) {
            this.selectValFlagType = item;
          }
        }
      }
    },
    selectKeyFlagTypeComp: {
      get() {
        return this.selectKeyFlagType.name;
      },
      set(value) {
        for (const item of this.items) {
          if (item.name === value) {
            this.selectKeyFlagType = item;
          }
        }
      }
    },
    haveValFlag() {
      return this.selectValFlagType.value === "r";
    },
    haveKeyFlag() {
      return this.selectKeyFlagType.value === "r";
    },
    openDialogCompu: {
      get() {
        return this.openDialog;
      },
      set(value) {
        if (value) {
          this.$emit("close");
        }
      }
    },
    btnValid() {
      return this.resultValue === "" && this.selectKeyFlagType === "";
    },
    selectKeyFlagType: {
      get() {
        if (this.result_keyType) {
          for (const type of this.items) {
            if (this.result_keyType === type.value) return type;
          }
        }
        if (this.keyType) {
          for (const type of this.items) {
            if (this.keyType === type.value) return type;
          }
        }
        return { name: "Egale", value: "e" };
      },
      set(value) {
        this.result_keyType = value.value;
      }
    },
    resultKey: {
      get() {
        if (this.result_key) return this.result_key;
        if (this.keyData) return this.keyData;
        return "";
      },
      set(value) {
        this.result_key = value;
      }
    },
    resultKeyFlag: {
      get() {
        if (this.result_keyFlag) return this.result_keyFlag;
        if (this.keyFlag) return this.keyFlag;
        return "";
      },
      set(value) {
        this.result_keyFlag = value;
      }
    },
    selectValFlagType: {
      get() {
        if (this.result_valType) {
          for (const type of this.items) {
            if (this.result_valType === type.value) return type;
          }
        }
        if (this.valType) {
          for (const type of this.items) {
            if (this.valType === type.value) return type;
          }
        }
        return { name: "Egale", value: "e" };
      },
      set(value) {
        this.result_valType = value.value;
      }
    },
    resultValue: {
      get() {
        if (this.result_key) return this.result_val;
        if (this.val) return this.val;
        return "";
      },
      set(value) {
        this.result_val = value;
      }
    },
    resultValFlag: {
      get() {
        if (this.result_valFlag) return this.result_valFlag;
        if (this.valFlag) return this.valFlag;
        return "";
      },
      set(value) {
        this.result_valFlag = value;
      }
    }
  },
  watch: {
    openDialog(value) {
      if (value) {
        this.result_key = null;
        this.result_keyFlag = null;
        this.result_keyType = null;
        this.result_val = null;
        this.result_valFlag = null;
        this.result_valType = null;
      }
    }
  },
  methods: {
    close() {
      this.$emit("cancel");
    },
    save() {
      const res = {
        key: this.resultKey,
        keyFlag: this.resultKeyFlag.trim(),
        keyType: this.selectKeyFlagType.value,
        val: this.resultValue.trim(),
        valFlag: this.resultValFlag,
        valType: this.selectValFlagType.value
      };
      this.$emit("save", res);
    }
  }
};
</script>

<style>
.spinal-model-gen-context-dialog-edit-cat {
  z-index: 99999;
}
</style>
