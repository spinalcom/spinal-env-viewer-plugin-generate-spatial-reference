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
      <div>Room to be added ({{ dataTable.length }})</div>
    </template>
    <SpinalRoomNew :tableData="dataTable" v-model="selected"></SpinalRoomNew>
  </v-expansion-panel-content>
</template>

<script>
import SpinalRoomNew from './SpinalRoomNew.vue';

import { parseUnit } from 'spinal-spatial-referential';
export default {
  name: 'SpinalTableRoomNew',
  props: ['value'],
  components: {
    SpinalRoomNew,
  },
  data() {
    return {
      dataTable: [],
      selected: [],
    };
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
      if (this.value)
        for (const roomArchi of this.value) {
          const room = getProps(roomArchi.properties);
          if (this.selected.length === 0) this.selected.push(room);
          this.dataTable.push(room);
          room.children = [];
          for (const structure of roomArchi.children) {
            const struct = getProps(structure);
            room.children.push(struct);
          }
        }
    },
  },
};

function getProps(properties) {
  const props = {
    name: '',
    id: properties.externalId,
    attr: [
      { label: 'dbId', value: properties.dbId, unit: '' },
      {
        label: 'externalId',
        value: properties.externalId,
        unit: '',
      },
    ],
  };
  for (const attr of properties.properties) {
    if (attr.name === 'name') props.name += attr.value;
    if (attr.name === 'level') continue;
    if (attr.name === 'number')
      props.name = attr.value.toString() + '-' + props.name;
    props.attr.push({
      label: attr.name,
      value: attr.value,
      unit: parseUnit(attr.dataTypeContext),
    });
  }
  return props;
}
</script>
