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
  <div class="geolocate-group-config-container">
    <v-toolbar class="geolocate-group-config-header" color="black" dark dense>
      <v-spacer></v-spacer>
      <AddAGroupConfig @addAGroupConfig="addAGroupConfig"></AddAGroupConfig>
      <v-btn icon round @click="$emit('save')" color="warning">
        <v-icon>save</v-icon>
      </v-btn>
      <v-btn
        icon
        round
        @click="generate"
        color="success"
        :disabled="selected.length === 0"
      >
        <v-icon>check</v-icon>
      </v-btn>
    </v-toolbar>
    <div class="geolocate-group-config-main">
      <md-card class="geolocate-group-config-card">
        <div class="geolocate-group-config-card-content spinal-scrollbar">
          <md-list>
            <md-list-item v-if="groupConfigs.length === 0">
              <span class="md-list-item-text" style="white-space: normal">
                No Items in list, add items with the "+" button
              </span>
            </md-list-item>
            <md-list-item
              v-for="groupConfig in groupConfigs"
              :key="groupConfig.uid"
              @click="$emit('selectGroup', groupConfig)"
            >
              <md-checkbox
                class="geolocate-group-config-card-item-checkbox"
                v-model="selected"
                :value="groupConfig.uid"
              />
              <div class="md-list-item-text">
                <span>{{ groupConfig.name }}</span>
                <span>{{ countChild(groupConfig) }}</span>
              </div>
              <groupConfigItemBtn
                :uid="groupConfig.uid"
                @deleteGroup="itemDelete = groupConfig"
                @showEdit="itmEdit = groupConfig"
              ></groupConfigItemBtn>
              <v-progress-linear
                class="geolocate-group-config-card-item-progressbar"
                v-if="groupConfig.progress != 100"
                v-model="groupConfig.progress"
              ></v-progress-linear>
            </md-list-item>
          </md-list>
        </div>
      </md-card>
    </div>
    <md-dialog-confirm
      v-if="itemDelete"
      :md-active.sync="showConfirmDelete"
      md-title="Confirm delete"
      md-confirm-text="Confirm"
      md-cancel-text="Cancel"
      @md-cancel="showConfirmDelete = false"
      @md-confirm="deleteGroup"
    />
    <md-dialog-prompt
      v-if="itmEdit"
      :md-active.sync="showEditPrompt"
      v-model="itmEdit.name"
      md-title="Edit Name"
      md-input-maxlength="30"
      md-input-placeholder="name..."
      md-confirm-text="Edit"
      @md-confirm="$emit('savableCfg')"
    />
  </div>
</template>

<script>
import AddAGroupConfig from './AddAGroupConfig.vue';
import GroupConfigItemBtn from './GroupConfigItemBtn.vue';

export default {
  name: 'groupConfig',
  components: { AddAGroupConfig, GroupConfigItemBtn },
  props: ['groupConfigs'],
  data() {
    return { show: true, selected: [], itmEdit: null, itemDelete: null };
  },
  computed: {
    showEditPrompt: {
      get() {
        return !!this.itmEdit;
      },
      set(value) {
        if (value === false) this.itmEdit = null;
      },
    },
    showConfirmDelete: {
      get() {
        return !!this.itemDelete;
      },
      set(value) {
        if (value === false) this.itemDelete = null;
      },
    },
  },
  methods: {
    countChild(groupConfig) {
      if (groupConfig.isLoaded === true) {
        return 'count : ' + groupConfig.countChild();
      } else {
        return '';
      }
    },
    addAGroupConfig(target) {
      this.$emit('addAGroupConfig', target);
    },
    generate() {
      this.$emit('generate', this.selected);
    },
    deleteGroup(uid) {
      this.$emit('deleteGroup', this.itemDelete.uid);
    },
  },
};
</script>

<style scoped>
.geolocate-group-config-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.geolocate-group-config-header {
  position: relative;
  overflow: auto;
}
.geolocate-group-config-main {
  height: calc(100% - 48px);
  position: relative;
  overflow: auto;
}
.geolocate-group-config-card,
.geolocate-group-config-card-content {
  height: 100%;
}
.geolocate-group-config-card-item-checkbox:first-child {
  margin-right: 16px;
}
.geolocate-group-config-card-item-progressbar {
  z-index: 1;
  position: absolute;
  bottom: 0;
  margin: 0;
}
</style>
