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
  <v-card class="mx-auto" flat>
    <div class="update-basic-info">
      <p>name: {{ name }}</p>
      <p>dbId: {{ value.dbId }}</p>
      <p>externalId: {{ value.externalId }}</p>
    </div>
    <v-card-text>
      <v-expansion-panel popout>
        <v-expansion-panel-content
          ripple
          lazy
          :disabled="value.diff.diffInfo.length === 0"
        >
          <template v-slot:header>
            <div>Diff info ({{ value.diff.diffInfo.length }})</div>
          </template>
          <v-data-table
            :headers="diffInfoHeader"
            :items="value.diff.diffInfo"
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
        </v-expansion-panel-content>
        <v-expansion-panel-content
          ripple
          lazy
          :disabled="value.diff.diffAttr.length === 0"
        >
          <template v-slot:header>
            <div>Diff Attributes ({{ value.diff.diffAttr.length }})</div>
          </template>
          <v-data-table
            :headers="diffInfoHeader"
            :items="value.diff.diffAttr"
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
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'SpinalTableRoomUpdateDetails',
  props: ['value'],
  data() {
    return {
      diffInfoHeader: [
        { text: 'Name', align: 'left', value: 'name' },
        { text: 'New Value', value: 'new' },
        { text: 'Old value', value: 'old' },
        { text: 'Unit', value: 'unit' },
      ],
    };
  },
  computed: {
    name() {
      let name = '';
      if (this.value && this.value.diff && this.value.diff.diffAttr)
        for (const attr of this.value.diff.diffAttr) {
          if (attr.label === 'name') name += attr.archiValue;
          if (attr.label === 'number')
            name = attr.archiValue.toString() + '-' + name;
        }
      return name === '' ? this.value.name : name;
    },
  },
};
</script>

<style scoped>
.update-basic-info {
  text-align: left;
  padding: 0 16px;
}
.update-basic-info > p {
  margin-bottom: 0;
  user-select: text;
}
</style>
