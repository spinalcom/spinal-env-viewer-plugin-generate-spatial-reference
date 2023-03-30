<!--
Copyright 2023 SpinalCom - www.spinalcom.com

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
  <v-expansion-panel-content ripple lazy :disabled="dataTable.length === 0">
    <template v-slot:header>
      <div>Room to be updated ({{ dataTable.length }})</div>
    </template>

    <v-layout justify-space-between pa-3>
      <v-flex xs4 spinal-scrollbar style="overflow: auto">
        <v-treeview
          :items="dataTable"
          :active.sync="selected"
          hoverable
          :open-all="true"
          return-object
          activatable
        ></v-treeview>
      </v-flex>
      <v-divider vertical></v-divider>
      <v-flex d-flex text-xs-center>
        <v-scroll-y-transition mode="out-in">
          <div
            v-if="selected.length === 0"
            class="title grey--text text--lighten-1 font-weight-light"
            style="align-self: center"
          >
            Select an item
          </div>
          <SpinalTableRoomUpdateDetails
            v-else
            :value="selectedComp"
          ></SpinalTableRoomUpdateDetails>
        </v-scroll-y-transition>
      </v-flex>
    </v-layout>
  </v-expansion-panel-content>
</template>

<script>
import SpinalTableRoomUpdateDetails from './SpinalTableRoomUpdateDetails.vue';
export default {
  name: 'SpinalTableRoomUpdate',
  props: ['value'],
  components: { SpinalTableRoomUpdateDetails },
  data() {
    return {
      selected: [],
      dataTable: [],
    };
  },
  computed: {
    selectedComp() {
      return this.selected[0];
    },
  },
  mounted() {
    this.update();
  },
  watch: {
    value() {
      this.update();
    },
  },
  methods: {
    update() {
      this.dataTable = [];
      this.selected = [];
      if (this.value)
        for (const { roomArchi, diff } of this.value) {
          const room = getProps(roomArchi.properties, diff);
          this.dataTable.push(room);
        }
    },
  },
};

function getProps(properties, diff) {
  const props = {
    name: '',
    id: properties.externalId,
    dbId: properties.dbId,
    externalId: properties.externalId,
    diff,
  };
  for (const attr of properties.properties) {
    if (attr.name === 'name') props.name += attr.value;
    if (attr.name === 'number')
      props.name = attr.value.toString() + '-' + props.name;
  }
  return props;
}
</script>

<style scoped>
.update-basic-info {
  text-align: left;
  padding: 0 16px;
}
.update-basic-info > p {
  margin-bottom: 0;
}
</style>
