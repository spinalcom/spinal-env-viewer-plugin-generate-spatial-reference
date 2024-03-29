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
  <v-card>
    <v-card-text>
      <md-field>
        <label for="catLstRes">Select categories:</label>
        <md-select
          id="catLstRes"
          v-model="catLstRes"
          name="catLstRes"
          multiple
          md-dense
        >
          <md-option v-for="cat in catLst" :key="cat" :value="cat">
            {{ cat }}
          </md-option>
        </md-select>
      </md-field>
      <v-data-table :headers="headers" :items="items">
        <template v-slot:items="props">
          <td>
            {{
              printInput(props.item.keyType, props.item.key, props.item.keyFlag)
            }}
          </td>
          <td class="text-xs-left">
            {{
              printInput(props.item.valType, props.item.val, props.item.valFlag)
            }}
          </td>

          <td class="justify-center layout px-0">
            <v-icon small class="mr-2" @click="editItem(props.item)">
              edit
            </v-icon>
            <v-icon small @click="deleteItem(props.item)"> delete </v-icon>
          </td>
        </template>
      </v-data-table>
    </v-card-text>
    <v-card-actions>
      <v-btn
        v-tooltip="'test the filter result'"
        flat
        icon
        :disabled="btnDisabledCompu"
        @click="onSeeList"
      >
        <v-icon>list</v-icon>
      </v-btn>

      <v-btn
        v-tooltip="'Ajouter un flitre'"
        flat
        icon
        :disabled="btnDisabledCompu"
        @click="addNewFilter"
      >
        <v-icon>add</v-icon>
      </v-btn>
      <v-spacer />
      <v-btn
        color="red darken-1"
        flat
        :disabled="btnDisabledCompu"
        @click="$emit('cancel')"
      >
        Cancel
      </v-btn>
      <v-btn
        color="green darken-1"
        flat
        :disabled="btnDisabledCompu"
        @click="onContinue"
      >
        Continue
      </v-btn>
    </v-card-actions>
    <DialogAddCat
      v-if="selected"
      :key-data="selected.key"
      :key-type="selected.keyType"
      :key-flag="selected.keyFlag"
      :val="selected.val"
      :val-type="selected.valType"
      :val-flag="selected.valFlag"
      :open-dialog="openDialogAddEdit"
      @cancel="onEditCancel"
      @save="onEditSave"
    />
    <v-snackbar
      v-model="snackbarError"
      :timeout="10000"
      absolute
      :bottom="true"
    >
      Error: {{ snackbarMessage }}
      <v-btn color="pink" flat @click="snackbarError = false"> Close </v-btn>
    </v-snackbar>
  </v-card>
</template>

<script>
import {
  createInput,
  createCat,
  getModelByName,
  getCatFromRvtModel,
} from '../../services/getObjFromRvtModel';
import DialogAddCat from './DialogAddCat.vue';
export default {
  name: 'AdvenceSettingStructure',
  components: { DialogAddCat },
  props: {
    modelName: { require: true, type: String, default: () => '' },
  },
  data() {
    return {
      // useCat: true,
      catLst: [],
      catLstRes: [],
      items: [],
      headers: [
        {
          text: 'Name',
          align: 'left',
          value: 'key',
        },
        { text: 'Value', value: 'val' },
        { text: 'Actions', value: 'name', sortable: false },
      ],
      modalStatus: null,
      openDialogAddEdit: false,
      selected: null,
      snackbarError: false,
    };
  },
  watch: {
    modelName() {
      return this.updateModelName();
    },
  },
  mounted() {
    return this.updateModelName();
  },
  methods: {
    async updateModelName() {
      if (this.modelName) {
        const model = getModelByName(this.modelName);
        this.catLst = await getCatFromRvtModel(model);
        const register = [
          'Revit Murs',
          'Revit Portes',
          'Revit Fenêtres',
          'Revit Walls',
          'Revit Doors',
          'Revit Windows',
        ];
        this.catLstRes = this.catLst.filter((item) => register.includes(item));
      }
    },
    printInput(keyType, name, flag) {
      if (keyType === 'e') return name;
      if (keyType === 'c') return `[${name}]`;
      if (keyType === 'r') {
        if (flag) return `/${name}/${flag}`;
        else return `/${name}/`;
      }
    },
    onContinue() {
      try {
        const data = this.createData();
        this.$emit('continue', data);
      } catch (e) {
        console.error(e);
        this.snackbarMessage = e.message;
        this.snackbarError = true;
      }
    },
    createData() {
      const data = [];
      for (const catName of this.catLstRes) {
        data.push(createCat(catName));
      }
      for (const item of this.items) {
        data.push({
          key: createInput(item.keyType, item.key, item.keyFlag),
          value: createInput(item.valType, item.val, item.valFlag),
        });
      }
      return data;
    },
    onSeeList() {
      try {
        const data = this.createData();
        this.$emit('seeList', data);
      } catch (e) {
        console.error(e);
        this.snackbarMessage = e.message;
        this.snackbarError = true;
      }
    },
    addNewFilter() {
      this.modalStatus = 'new';
      this.openDialogAddEdit = true;
      this.selected = {
        key: '',
        keyType: 'e',
        keyFlag: '',
        val: '',
        valType: 'e',
        valFlag: '',
      };
    },
    editItem(item) {
      this.modalStatus = 'edit';
      this.openDialogAddEdit = true;
      this.selected = item;
    },
    deleteItem(item) {
      const idx = this.items.indexOf(item);
      if (idx !== -1) this.items.splice(idx, 1);
    },
    onEditCancel() {
      this.openDialogAddEdit = false;
    },
    onEditSave(data) {
      this.openDialogAddEdit = false;
      if (this.modalStatus === 'new') return this.items.push(data);
      this.selected.key = data.key;
      this.selected.keyType = data.keyType;
      if (data.keyType === 'r') this.selected.keyFlag = data.keyFlag;
      else this.selected.keyFlag = '';

      this.selected.val = data.val;
      this.selected.valType = data.valType;
      if (data.valType === 'r') this.selected.valFlag = data.valFlag;
      else this.selected.valFlag = '';
    },
  },
};
</script>
