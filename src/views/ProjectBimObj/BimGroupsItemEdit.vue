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
  <transition name="bim-groups-item-edit-transi">
    <div v-if="itemToEdit !== null" class="bim-groups-item-edit">
      <v-toolbar card color="black" dark>
        <v-toolbar-title>Edit</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          v-tooltip="'Cancel'"
          dark
          fab
          small
          color="red darken-2"
          @click="onCancel"
        >
          <v-icon>cancel</v-icon>
        </v-btn>
        <v-btn
          v-tooltip="'Save'"
          dark
          fab
          small
          color="blue darken-2"
          @click="onValid"
        >
          <v-icon>done</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card>
        <v-card-text>
          <div class="bim-groups-edit-name">
            <v-text-field v-model="name" label="Name"></v-text-field>
          </div>
          <v-expansion-panel class="bim-groups-edit-content">
            <v-expansion-panel-content>
              <template v-slot:header>
                <div>Edit items' calculation point</div>
              </template>
              <v-card>
                <v-card-text>
                  <BimGroupsItemEditOffset
                    :offset="offset"
                    :disabled-preview="disabledPreview"
                    :mode="previewMode"
                    @onChange="updateOffset"
                    @onChangePreview="onChangePreview"
                  >
                  </BimGroupsItemEditOffset>
                </v-card-text>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-card-text>
      </v-card>
    </div>
  </transition>
</template>

<script>
import BimGroupsItemEditOffset from './BimGroupsItemEditOffset.vue';
import {
  previewItem,
  stopPreview,
} from '../../services/ProjectObjectInContext/PreviewCenter';

function itemToEditValidator(item) {
  return (
    item === null ||
    (item.offset &&
      typeof item.offset.r === 'number' &&
      typeof item.offset.t === 'number' &&
      typeof item.offset.z === 'number')
  );
}

export default {
  name: 'BimGroupsItemEdit',
  components: { BimGroupsItemEditOffset },
  props: {
    itemToEdit: { required: true, validator: itemToEditValidator },
  },
  data() {
    return {
      name,
      offset: { r: 0, t: 0, z: 0 },
      uid: 0,
      previewMode: 0,
    };
  },
  conputed: {
    disabledPreview() {
      if (this.itemToEdit && Array.isArray(this.itemToEdit.data)) {
        return this.itemToEdit.data.length === 0;
      }
      return false;
    },
  },
  watch: {
    itemToEdit() {
      if (this.itemToEdit) {
        this.name = this.itemToEdit.name;
        this.offset.r = this.itemToEdit.offset.r;
        this.offset.t = this.itemToEdit.offset.t;
        this.offset.z = this.itemToEdit.offset.z;
        this.uid = this.itemToEdit.uid;
        this.previewMode = 0;
      }
    },
  },
  mounted() {},
  methods: {
    updateOffset(offset) {
      if (isNaN(offset.r) || isNaN(offset.t) || isNaN(offset.z)) return;
      this.offset.r = offset.r;
      this.offset.t = offset.t;
      this.offset.z = offset.z;
      this.preview();
    },
    onChangePreview(mode) {
      this.previewMode = mode;
      this.preview();
    },
    preview() {
      const viewer = window.spinal.ForgeViewer.viewer;
      previewItem(this.itemToEdit, this.offset, this.previewMode, viewer);
    },

    onCancel() {
      const viewer = window.spinal.ForgeViewer.viewer;
      stopPreview(viewer);
      this.$emit('close');
    },
    onValid() {
      const viewer = window.spinal.ForgeViewer.viewer;
      stopPreview(viewer);
      this.$emit('close', {
        name: this.name,
        offset: this.offset,
        uid: this.uid,
      });
    },
  },
};
</script>

<style scoped>
.bim-groups-item-edit {
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: rgb(34, 34, 34);
  opacity: 1;
}

.bim-groups-edit-name {
  padding-left: 12px;
  padding-right: 12px;
}

.bim-groups-item-edit-transi-enter-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}
.bim-groups-item-edit-transi-enter,
.bim-groups-item-edit-transi-leave-to {
  opacity: 0;
  transform: translateX(-1em);
  min-width: unset;
}
.bim-groups-item-edit-transi-enter-to,
.bim-groups-item-edit-transi-leave-to {
  opacity: 1;
  transform: translateX(0);
  min-width: unset;
}
</style>

<style>
.bim-groups-edit-content .v-expansion-panel__header {
  flex-direction: row-reverse;
  padding: 0 5px 0 0;
}
.bim-groups-edit-content .v-expansion-panel__header:hover {
  background-color: rgba(25, 25, 25, 0.2);
}
.bim-groups-edit-content
  .v-expansion-panel__header
  .v-expansion-panel__header__icon {
  margin: 0 5px;
}
.bim-groups-edit-content .v-expansion-panel__header .bim-groups-item-header {
  flex-direction: row;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
