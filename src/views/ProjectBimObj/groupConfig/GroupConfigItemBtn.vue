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
  <v-speed-dial
    v-model="fab"
    direction="left"
    :open-on-hover="true"
    transition="slide-x-reverse-transition"
  >
    <template v-slot:activator>
      <v-btn
        v-model="fab"
        v-tooltip="openOrClose"
        color="blue darken-2"
        small
        dark
        fab
        @click.stop="fab = !fab"
      >
        <v-icon>more_vert</v-icon>
        <v-icon>close</v-icon>
      </v-btn>
    </template>

    <v-btn
      v-tooltip="'Edit group'"
      fab
      dark
      small
      color="orange"
      @click.stop="callEvent('showEdit')"
    >
      <v-icon>edit</v-icon>
    </v-btn>

    <v-btn
      v-tooltip="'Delete group'"
      fab
      dark
      small
      color="red"
      @click.stop="callEvent('deleteGroup')"
    >
      <v-icon>delete</v-icon>
    </v-btn>
  </v-speed-dial>
</template>

<script>
export default {
  name: 'GroupConfigItemBtn',
  props: {
    uid: { required: true, type: String },
  },
  data() {
    return {
      fab: false,
    };
  },
  computed: {
    openOrClose() {
      return this.fab ? 'Close menu' : 'Open  menu';
    },
  },
  methods: {
    callEvent(eventBtn) {
      this.$emit(eventBtn, this.uid);
    },
  },
};
</script>
