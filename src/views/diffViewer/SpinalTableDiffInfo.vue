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
  <v-expansion-panel-content ripple lazy :disabled="diffInfo.length === 0">
    <template v-slot:header>
      <div>{{ title }} ({{ diffInfo.length }})</div>
    </template>
    <v-card>
      <v-card-text>
        <v-data-table
          :headers="diffInfoHeader"
          :items="diffInfo"
          class="elevation-1"
        >
          <template v-slot:items="props">
            <td>{{ props.item.label }}</td>
            <td>
              <v-edit-dialog :return-value.sync="props.item.archiValue" lazy>
                {{ props.item.archiValue }}
                <template v-slot:input>
                  <v-text-field
                    v-model="props.item.archiValue"
                    label="Edit"
                    single-line
                  ></v-text-field>
                </template>
              </v-edit-dialog>
            </td>
            <td>{{ props.item.nodeValue }}</td>
            <td>{{ props.item.unit }}</td>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-expansion-panel-content>
</template>

<script>
export default {
  name: 'SpinalTableDiffInfo',
  props: ['diffInfo', 'diffInfoHeader', 'title'],
  data() {
    return {};
  },
  methods: {},
};
</script>
