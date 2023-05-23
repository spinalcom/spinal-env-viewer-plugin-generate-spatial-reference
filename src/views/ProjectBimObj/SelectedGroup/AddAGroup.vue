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
  <v-dialog v-model="show" attach="body">
    <template v-slot:activator="{ on }">
      <v-btn color="indigo" dark small fab v-on="on">
        <v-icon dark> add </v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="headline"> Add Selection or a Group </v-card-title>
      <v-card-text>
        <v-radio-group v-model="radioSelection">
          <v-radio label="Add Selection from 3D Model" value="3d"></v-radio>
          <v-radio label="Add a Group" value="group"> </v-radio>
        </v-radio-group>
        <v-text-field
          v-if="radioSelection === 'group'"
          v-model="groupName"
          :counter="30"
          label="Group name"
          required
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red darken-1" flat @click="show = false"> Cancel </v-btn>
        <v-btn
          color="green darken-1"
          flat
          :disabled="canConfirm"
          @click="onConfirm"
        >
          Confirm
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'AddAGroup',
  props: {},
  data() {
    return {
      groupName: '',
      show: false,
      radioSelection: '3d',
    };
  },
  computed: {
    canConfirm() {
      if (this.radioSelection === '3d') return false;
      return this.groupName.length === 0 || this.groupName.length >= 30;
    },
  },
  watch: {
    show() {
      if (this.show === false) this.groupName = '';
    },
  },
  methods: {
    onClick() {
      console.log(this.$refs['dialog-add-a-group']);
      this.$refs['dialog-add-a-group'].showModal();
    },
    onConfirm() {
      if (this.radioSelection === '3d') {
        this.$emit('addSelection');
      } else {
        this.$emit('addAGroup', this.groupName);
      }
      this.show = false;
    },
  },
};
</script>

<style scoped>
.dialog-add-a-group {
  z-index: 99;
}
</style>
