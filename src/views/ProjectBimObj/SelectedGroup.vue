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
  <div class="geolocate-selected-groupe-container">
    <v-toolbar
      class="geolocate-selected-groupe-header"
      color="black"
      dark
      dense
    >
      <v-btn icon @click="$emit('back')"><v-icon>arrow_back</v-icon></v-btn>
      {{ this.selectedGroup.name }}
      <v-spacer></v-spacer>
      <AddAGroup
        @addAGroup="addAGroup"
        @addSelection="addSelection"
      ></AddAGroup>
      <v-btn
        icon
        :disabled="list.length == 0"
        color="success"
        @click="generate"
      >
        <v-icon>check</v-icon>
      </v-btn>
    </v-toolbar>
    <div class="geolocate-selected-groupe-main">
      <md-card class="geolocate-groupe-card">
        <div class="geolocate-groupe-card-content spinal-scrollbar">
          <md-list>
            <md-list-item v-if="list.length === 0">
              <span class="md-list-item-text" style="white-space: normal">
                No Items in list, add items with the "+" button
              </span>
            </md-list-item>

            <!-- <md-list-item
              v-for="groupConfig in groupConfigs"
              :key="groupConfig.uid"
              @click="onSelectGroupConfig(groupConfig)"
            >
              <div class="md-list-item-text">
                <span>{{ groupConfig.name }}</span>
                <span>count : {{ countChild(groupConfig) }}</span>
              </div>
            </md-list-item> -->
          </md-list>
        </div>
      </md-card>
    </div>
    <!-- <BimGroupsItemEdit
      :item-to-edit="itemToEdit"
      @close="onCloseEdit"
    ></BimGroupsItemEdit> -->
  </div>
</template>

<script>
import AddAGroup from './AddAGroup.vue';
export default {
  name: 'SelectedGroup',
  props: ['selectedGroup'],
  components: { AddAGroup },
  data() {
    return {
      list: [],
    };
  },
  computed: {
    countChild() {
      if (!this.selectedGroup) 0;
      console.log(this.selectedGroup);
      return this.selectedGroup.countChild();
    },
  },
  methods: {
    generate() {
      this.$emit('generate', this.selectedGroup);
    },
    addSelection() {
      console.log('addSelection', arguments);
    },
    addAGroup() {
      console.log('addAGroup', arguments);
    },
  },
};
</script>

<style scoped>
.geolocate-selected-groupe-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.geolocate-selected-groupe-header {
  position: relative;
  overflow: auto;
}
.geolocate-selected-groupe-main {
  height: calc(100% - 48px);
  position: relative;
  overflow: auto;
}
.geolocate-groupe-card,
.geolocate-groupe-card-content {
  height: 100%;
}
</style>
