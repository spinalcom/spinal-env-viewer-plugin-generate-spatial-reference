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
  <div class="geolocate-groupe-config-container">
    <v-toolbar class="geolocate-groupe-config-header" color="black" dark dense>
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
    <div class="geolocate-groupe-config-main">
      <md-card class="geolocate-groupe-config-card">
        <div class="geolocate-groupe-config-card-content spinal-scrollbar">
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
                class="geolocate-groupe-config-card-item-checkbox"
                v-model="selected"
                :value="groupConfig.uid"
              />
              <div class="md-list-item-text">
                <span>{{ groupConfig.name }}</span>
                <span>count : {{ countChild(groupConfig) }}</span>
              </div>
              <GroupeConfigItemBtn
                :uid="groupConfig.uid"
                @deleteGroup="deleteGroup"
                @showInViewer="showInViewer"
                @showEdit="showEdit"
              ></GroupeConfigItemBtn>
            </md-list-item>
          </md-list>
        </div>
      </md-card>
    </div>
    <md-dialog-prompt
      v-if="itmEdit"
      :md-active.sync="showEditPrompt"
      v-model="itmEdit.name"
      md-title="Edit Name"
      md-input-maxlength="30"
      md-input-placeholder="name..."
      md-confirm-text="Edit"
    />
  </div>
</template>

<script>
import AddAGroupConfig from './AddAGroupConfig.vue';
import GroupeConfigItemBtn from './GroupeConfigItemBtn.vue';

export default {
  name: 'GroupeConfig',
  components: { AddAGroupConfig, GroupeConfigItemBtn },
  props: ['groupConfigs'],
  data() {
    return { show: true, selected: [], itmEdit: null };
  },
  computed: {
    showEditPrompt: {
      get() {
        return !!this.itmEdit;
      },
      set(value) {
        if (value === false) this.itmEdit = null;
        //  !!itmEdit;
      },
    },
  },
  methods: {
    countChild(groupConfig) {
      return groupConfig.countChild();
    },
    addAGroupConfig(target) {
      this.$emit('addAGroupConfig', target);
    },
    generate() {
      this.$emit('generate', selected);
    },
    deleteGroup(uid) {
      this.$emit('deleteGroup', uid);
    },
    showInViewer(uid) {
      this.$emit('showInViewer', uid);
    },
    showEdit(uid) {
      const itm = this.groupConfigs.find((itm) => itm.uid === uid);
      this.itmEdit = itm;
    },
  },
};
</script>

<style scoped>
.geolocate-groupe-config-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.geolocate-groupe-config-header {
  position: relative;
  overflow: auto;
}
.geolocate-groupe-config-main {
  height: calc(100% - 48px);
  position: relative;
  overflow: auto;
}
.geolocate-groupe-config-card,
.geolocate-groupe-config-card-content {
  height: 100%;
}
.geolocate-groupe-config-card-item-checkbox:first-child {
  margin-right: 16px;
}
</style>
