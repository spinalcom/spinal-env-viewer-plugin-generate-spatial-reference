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
  <v-list two-line dense class="AssingDataViewList-container spinal-scrollbar">
    <v-list-tile
      v-for="item in currArr"
      :key="item.externalId"
      class="assingDataitem"
      ripple
      @click="showItem(item)"
    >
      <v-list-tile-action>
        <v-btn icon ripple @click.stop="searchRoomRef(item)">
          <v-icon>view_compact</v-icon>
        </v-btn>
      </v-list-tile-action>

      <v-list-tile-content>
        <v-list-tile-title>{{ item.name }}</v-list-tile-title>
        <AssignDataViewRoomName
          :validId="item.validId"
          :nodeName="item.PName"
          @roomSelect="onRoomClick"
        ></AssignDataViewRoomName>
      </v-list-tile-content>

      <v-list-tile-action>
        <v-btn
          icon
          ripple
          :disabled="!roomSelected"
          @click.stop="onValid(item)"
        >
          <v-icon>check</v-icon>
        </v-btn>
      </v-list-tile-action>
    </v-list-tile>
    <v-divider></v-divider>
    <v-subheader> Done </v-subheader>
    <v-list-tile
      v-for="item in doneArr"
      ripple
      @click="showItem(item)"
      class="assingDataitem"
      :key="item.externalId"
    >
      <v-list-tile-content>
        <v-list-tile-title>{{ item.name }}</v-list-tile-title>
        <AssignDataViewRoomName
          :validId="item.validId"
          :nodeName="item.PName"
          @roomSelect="onRoomClick"
        ></AssignDataViewRoomName>
      </v-list-tile-content>
      <v-list-tile-action>
        <v-btn icon ripple @click.stop="onCancel(item)">
          <v-icon>cancel</v-icon>
        </v-btn>
      </v-list-tile-action>
    </v-list-tile>
  </v-list>
</template>
<script>
import AssignDataViewRoomName from './AssignDataViewRoomName.vue';
import {
  viewDataAssignInViewer,
  getRoomRef,
  getContextSpatial,
  getModelByBimFileIdLoaded,
  getGraph,
  getViewer,
} from 'spinal-spatial-referential';

export default {
  name: 'AssingDataViewList',
  props: ['items', 'roomSelected'],
  components: { AssignDataViewRoomName },
  data() {
    return {
      currArr: [],
      doneArr: [],
    };
  },
  mounted() {
    this.updateData();
  },
  watch: {
    items() {
      this.updateData();
    },
  },
  methods: {
    updateData() {
      if (!this.items) return;
      this.currArr = [];
      this.doneArr = [];
      for (const item of this.items) {
        if (item.validId) this.doneArr.push(item);
        else this.currArr.push(item);
      }
    },
    onValid(item) {
      item.validId = this.roomSelected;
      this.updateData();
    },
    async searchRoomRef(item) {
      const modelDbid = getModelByBimFileIdLoaded(item.bimFileId);
      if (modelDbid) {
        const graph = getGraph();
        const contextGeo = await getContextSpatial(graph);
        const aggrData = await getRoomRef(contextGeo);
        for (const { model, dbId } of aggrData) {
          if (model === modelDbid) {
            dbId.add(item.dbid);
            break;
          }
        }
        const data = aggrData.map((itm) => {
          return {
            model: itm.model,
            selection: Array.from(itm.dbId),
          };
        });
        const viewer = getViewer();
        viewer.impl.visibilityManager.aggregateIsolate(data);
        viewer.fitToView([item.dbid], modelDbid);
        viewer.select([item.dbid], modelDbid);
      }
    },
    showItem(item) {
      viewDataAssignInViewer(
        item.dbid,
        item.bimFileId,
        this.roomSelected,
        item.validId,
        item.PNId
      );
    },
    onCancel(item) {
      console.log('onCancel', item);
      item.validId = '';
      this.updateData();
    },
    onRoomClick(itemId) {
      this.$emit('roomSelect', itemId);
    },
  },
};
</script>

<style scoped>
.assingDataSelected {
  background-color: #365bab !important;
}
.assingDataitem * {
  color: #fff !important;
  text-decoration: none !important;
}
.AssingDataViewList-container {
  height: 100%;
  overflow: auto;
}
</style>

<style>
.AssingDataViewList-container .v-list__tile__action {
  min-width: 36px;
}
</style>
