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
  <div class="BtnGroupViewInViewer">
    <fieldset>
      <legend>Structures:</legend>
      <v-btn
        circle
        icon
        @click="onClickSelect($event)"
        @click.shift="onShiftClickSelect()"
      >
        <v-icon>devices</v-icon>
      </v-btn>
      <v-btn circle icon @click="onClickFit()">
        <v-icon>zoom_in</v-icon>
      </v-btn>
      <v-btn
        circle
        icon
        @click="onClickIsolate($event)"
        @click.shift="onShiftClickIsolate()"
      >
        <v-icon>settings_overscan</v-icon>
      </v-btn>
    </fieldset>
    <template v-if="type === 'floor'">
      <fieldset>
        <legend>Rooms:</legend>
        <v-btn
          circle
          icon
          @click="onClickSelect($event, true)"
          @click.shift="onShiftClickSelect(true)"
        >
          <v-icon>devices</v-icon>
        </v-btn>
        <v-btn circle icon @click="onClickFit(true)">
          <v-icon>zoom_in</v-icon>
        </v-btn>
        <v-btn
          circle
          icon
          @click="onClickIsolate($event, true)"
          @click.shift="onShiftClickIsolate(true)"
        >
          <v-icon>settings_overscan</v-icon>
        </v-btn>
      </fieldset>
    </template>
  </div>
</template>

<script>
import { getViewer } from 'spinal-spatial-referential';

export default {
  name: 'BtnGroupViewInViewer',
  props: ['data', 'type'],
  data() {
    return {};
  },
  methods: {
    getAttrDbId(arr) {
      for (const attr of arr) {
        if (attr.label === 'dbId') return attr.value;
      }
    },
    getDbId(target) {
      console.log('BtnGroupViewInViewer data', this.data);
      const dbIds = [];
      if (this.type === 'floor') {
        if (!target) {
          for (const extId in this.data.structures) {
            if (Object.hasOwnProperty.call(this.data.structures, extId)) {
              dbIds.push(this.data.structures[extId].properties.dbId);
            }
          }
        } else {
          for (const extId in this.data.children) {
            if (
              this.data.children.hasOwnProperty.call(this.data.children, extId)
            ) {
              const room = this.data.children[extId];
              for (const child of room.children) {
                dbIds.push(child.dbId);
              }
            }
          }
        }
      } else if (this.type === 'roomNew') {
        const roomDbId = this.getAttrDbId(this.data.attr);
        if (this.data.children) {
          for (const roomRef of this.data.children) {
            const roomRefDbId = this.getAttrDbId(this.data.attr);
            if (roomRefDbId) dbIds.push(roomRefDbId);
          }
        }
        if (roomDbId) dbIds.push(roomDbId);
      } else if (this.type === 'roomUpdate') {
        const FAData = this.data.FAData;
        const roomData = this.data.roomData;
        const roomArchi = FAData.floorArchi.children[roomData.externalId];
        if (roomArchi) {
          dbIds.push(roomArchi.properties.dbId);
          for (const child of roomArchi.children) {
            dbIds.push(child.dbId);
          }
        }
      }
      return dbIds;
    },
    getAggregateDbId(data, targetArray, key) {
      for (const itm of data) {
        for (const dbId of itm[key]) {
          targetArray.push(dbId);
        }
      }
    },
    onClickSelect(event, targetRoom) {
      if (event.shiftKey === true) return;
      const dbIds = this.getDbId(targetRoom);
      if (dbIds.length === 0) return;
      const viewer = getViewer();
      viewer.select(dbIds);
    },
    onClickFit(targetRoom) {
      const dbIds = this.getDbId(targetRoom);
      if (dbIds.length === 0) return;
      const viewer = getViewer();
      viewer.fitToView(dbIds);
    },
    onClickIsolate(event, targetRoom) {
      if (event.shiftKey === true) return;
      const dbIds = this.getDbId(targetRoom);
      if (dbIds.length === 0) return;
      const viewer = getViewer();
      viewer.isolate(dbIds);
    },
    onShiftClickSelect(targetRoom) {
      const dbIds = this.getDbId(targetRoom);
      if (dbIds.length === 0) return;
      const viewer = getViewer();
      const aggr = viewer.getAggregateSelection();
      this.getAggregateDbId(aggr, dbIds, 'selection');
      viewer.select(dbIds);
    },
    onShiftClickIsolate(targetRoom) {
      const dbIds = this.getDbId(targetRoom);
      if (dbIds.length === 0) return;
      const viewer = getViewer();
      const aggr = viewer.getAggregateIsolation();
      this.getAggregateDbId(aggr, dbIds, 'ids');
      viewer.isolate(dbIds);
    },
  },
};
</script>
<style scoped></style>
<style>
.BtnGroupViewInViewer .v-btn {
  margin: 2px 0;
}
.BtnGroupViewInViewer .v-btn:last-child {
  margin-right: 2px;
}
.BtnGroupViewInViewer .v-btn:first-of-type {
  margin-left: 2px;
}
</style>
