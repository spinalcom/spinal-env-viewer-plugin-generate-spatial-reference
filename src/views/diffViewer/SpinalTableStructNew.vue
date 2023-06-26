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
      <div>Reference Structures to be added ({{ dataTable.length }})</div>
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
          <v-card v-else class="mx-auto" flat>
            <div>
              {{ selectedComp.name }}
            </div>
            <v-card-text>
              <v-data-table
                :headers="diffInfoHeader"
                :items="selectedComp.attr"
                class="elevation-1"
              >
                <template v-slot:items="props">
                  <td>{{ props.item.label }}</td>
                  <td>{{ props.item.value }}</td>
                  <td>{{ props.item.unit }}</td>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-scroll-y-transition>
      </v-flex>
    </v-layout>
  </v-expansion-panel-content>
</template>

<script>
import { parseUnit } from 'spinal-spatial-referential';
export default {
  name: 'SpinalTableStructNew',
  props: ['value'],
  data() {
    return {
      selected: [],
      diffInfoHeader: [
        { text: 'Name', align: 'left', value: 'name' },
        { text: 'Value', value: 'value' },
        { text: 'Unit', value: 'unit' },
      ],
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
        for (const bimobj of this.value) {
          const obj = getProps(bimobj);
          this.dataTable.push(obj);
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
    if (attr.name === 'name') props.name = attr.value;
    if (attr.name === 'level') continue;
    props.attr.push({
      label: attr.name,
      value: attr.value,
      unit: parseUnit(attr.dataTypeContext),
    });
  }
  return props;
}
</script>
