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
  <v-layout justify-space-between pa-3>
    <v-flex xs4 spinal-scrollbar style="overflow: auto">
      <v-treeview
        :items="tableData"
        :active.sync="selectedC"
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
          v-if="selectedC.length === 0"
          class="title grey--text text--lighten-1 font-weight-light"
          style="align-self: center"
        >
          Select an item
        </div>
        <v-card v-else class="mx-auto" flat>
          <div class="spinal-diff-room-new-container">
            <div>
              {{ name }}
            </div>
            <BtnGroupViewInViewer
              type="roomNew"
              :data="selectedComp"
            ></BtnGroupViewInViewer>
          </div>
          <v-card-text>
            <slot></slot>
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
</template>

<script>
import BtnGroupViewInViewer from './BtnGroupViewInViewer.vue';

export default {
  name: 'SpinalRoomNew',
  props: ['tableData', 'value'],
  components: {
    BtnGroupViewInViewer,
  },
  data() {
    return {
      diffInfoHeader: [
        { text: 'Name', align: 'left', value: 'name' },
        { text: 'Value', value: 'value' },
        { text: 'Unit', value: 'unit' },
      ],
    };
  },
  computed: {
    name() {
      let name = '';
      if (this.selectedComp)
        for (const attr of this.selectedComp.attr) {
          if (attr.label === 'name') name += attr.value;
          if (attr.label === 'number')
            name = attr.value.toString() + '-' + name;
        }
      return name;
    },
    selectedComp() {
      return this.value[0];
    },
    selectedC: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },
};
</script>

<style scoped>
.spinal-diff-room-new-container {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
}
.spinal-diff-room-new-container div:first-child {
  flex-grow: 1;
}
</style>
