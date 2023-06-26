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
  <v-expansion-panel-content ripple lazy :disabled="dataArr.length === 0">
    <template v-slot:header>
      <div>{{ title }} ({{ dataArr.length }})</div>
    </template>
    <v-card>
      <v-card-text>
        <v-data-table
          :headers="diffInfoHeader"
          :items="dataArr"
          class="elevation-1"
        >
          <template v-slot:items="props">
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.nodeId }}</td>
            <td>{{ props.item.serverId }}</td>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-expansion-panel-content>
</template>

<script>
import { FileSystem } from 'spinal-core-connectorjs';
export default {
  name: 'SpinalTableDel',
  props: ['title', 'value'],
  data() {
    return {
      diffInfoHeader: [
        { text: 'Name', align: 'left', value: 'name' },
        { text: 'Node ID', value: 'nodeId' },
        { text: 'ServerID', value: 'serverId' },
      ],
    };
  },
  computed: {
    dataArr() {
      const res = [];
      for (const serverId of this.value) {
        const node = FileSystem._objects[serverId];
        res.push({
          name: node.info.name.get(),
          nodeId: node.info.id.get(),
          serverId,
        });
      }
      return res;
    },
  },
};
</script>
