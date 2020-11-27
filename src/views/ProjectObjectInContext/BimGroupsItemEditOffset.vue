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
  <v-container class="bim-groups-item-edit-offset"
               fluid
               grid-list-lg>
    <v-layout col
              align-center
              justify-center
              align-content-center
              wrap>
      <!-- <v-layout row
              align-center
              justify-center
              align-content-center
              wrap></v-layout> -->
      <!-- <v-btn-toggle v-model="toggleView"
                    mandatory>
        <v-btn v-tooltip="'Disable preview'"
               :disabled="disabledPreview"
               flat
               @click="$emit('onChangePreview', 0)">
          <v-icon>visibility_off</v-icon>
        </v-btn>
        <v-btn v-tooltip="'Preview only the 1st Object'"
               flat
               :disabled="disabledPreview"
               @click="$emit('onChangePreview', 1)">
          <v-icon>hdr_strong</v-icon>
        </v-btn>
        <v-btn v-tooltip="'Preview all Objects'"
               flat
               :disabled="disabledPreview"
               @click="$emit('onChangePreview', 2)">
          <v-icon>grain</v-icon>
        </v-btn>
      </v-btn-toggle> -->



      <v-btn-toggle v-model="toggleView"
                    mandatory>
        <v-btn v-tooltip="'Disable preview'"
               :disabled="disabledPreview"
               flat
               @click="$emit('onChangePreview', 0)">
          <v-icon>visibility_off</v-icon>
        </v-btn>
        <v-btn v-tooltip="'Preview only the 1st Object'"
               flat
               :disabled="disabledPreview"
               @click="$emit('onChangePreview', 1)">
          <v-icon>hdr_strong</v-icon>
        </v-btn>
        <v-btn v-tooltip="'Preview all Objects'"
               flat
               :disabled="disabledPreview"
               @click="$emit('onChangePreview', 2)">
          <v-icon>grain</v-icon>
        </v-btn>
      </v-btn-toggle>
    </v-layout>
    <v-layout row
              wrap>
      <v-flex xs9>
        <v-slider v-model="_r"
                  :step="0.1"
                  :max="50"
                  :min="-50"
                  label="R"></v-slider>
      </v-flex>

      <v-flex xs3>
        <v-text-field v-model="_r"
                      class="mt-0"
                      type="number"></v-text-field>
      </v-flex>

      <v-flex xs9>
        <v-slider v-model="_t"
                  :step="1"
                  :max="360"
                  label="T"></v-slider>
      </v-flex>

      <v-flex xs3>
        <v-text-field v-model="_t"
                      class="mt-0"
                      type="number"></v-text-field>
      </v-flex>

      <v-flex xs9>
        <v-slider v-model="_z"
                  :step="0.1"
                  :max="50"
                  :min="-50"
                  label="Z"></v-slider>
      </v-flex>

      <v-flex xs3>
        <v-text-field v-model="_z"
                      class="mt-0"
                      type="number"></v-text-field>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
function rtzValidator(item) {
  return (
    typeof item.r === "number" &&
    typeof item.t === "number" &&
    typeof item.z === "number"
  );
}

import throttle from "lodash.throttle";

export default {
  name: "BimGroupsItemEditOffset",
  props: {
    offset: { required: true, type: Object, validator: rtzValidator },
    disabledPreview: { required: true, type: Boolean, default: () => false }
  },
  data() {
    return {
      toggleView: 0,
      tmp: { r: 0, t: 0, z: 0 }
    };
  },
  computed: {
    _r: {
      get() {
        return this.offset.r;
      },
      set(value) {
        this.tmp.r = value;
        return this.onChangeTrottle();
      }
    },
    _t: {
      get() {
        return this.offset.t;
      },
      set(value) {
        this.tmp.t = value;
        return this.onChangeTrottle();
      }
    },
    _z: {
      get() {
        return this.offset.z;
      },
      set(value) {
        this.tmp.z = value;
        return this.onChangeTrottle();
      }
    }
  },
  watch: {
    offset() {
      this.tmp.r = this.offset.r;
      this.tmp.t = this.offset.t;
      this.tmp.z = this.offset.z;
    }
  },
  mounted() {
    this.onChangeTrottle = throttle(this.onChange.bind(this), 500, {
      leading: false
    });
  },
  methods: {
    onChange() {
      this.$emit("onChange", {
        r: parseFloat(this.tmp.r),
        t: parseInt(this.tmp.t, 10),
        z: parseFloat(this.tmp.z)
      });
    }
  }
};
</script>


<style scoped>
.bim-groups-item-edit-offset,
.bim-groups-item-edit-offset * {
  padding-bottom: 0 !important;
  padding-top: 0 !important;
}
</style>
