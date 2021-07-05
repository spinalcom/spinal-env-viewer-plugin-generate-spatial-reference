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
  <v-layout class="bim-groups-item-edit-offset-slider"
            row>
    <v-flex xs9>
      <v-slider v-model="_value"
                :step="step"
                :max="max"
                :min="min"
                :label="label" />
    </v-flex>

    <v-flex xs3>
      <v-text-field v-model="_value2"
                    class="mt-0"
                    type="number" />
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  name: "BimGroupsItemEditOffsetSlider",
  props: {
    value: { required: true, type: Number },
    label: { required: true, type: String },
    min: { required: true, type: Number },
    max: { required: true, type: Number },
    step: { required: true, type: Number }
  },
  data() {
    return {
      tmpValue: 0
    };
  },
  computed: {
    _value: {
      get() {
        return this.value > this.max ? this.max : this.value;
      },
      set(value) {
        this.tmpValue = value;
        this.$emit("input", value);
      }
    },
    _value2: {
      get() {
        return this.value;
      },
      set(value) {
        this.tmpValue = value;
        this.$emit("input", value);
      }
    }
  },
  mounted() {
    console.log("value", this.value);
    console.log("label", this.label);
    console.log("min", this.min);
    console.log("max", this.max);
    console.log("step", this.step);
  },
  methods: {}
};
</script>


<style scoped>
.bim-groups-item-edit-offset-slider {
  margin-top: 0 !important;
}
</style>
