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
  <div class="spatial-diff-settings">
    <div class="spatial-diff-settings-header">
      <v-btn dark :icon="true" round @click="$emit('back')">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn elevation="2" icon @click="update">
        <v-icon>refresh</v-icon>
      </v-btn>
    </div>
    <div class="spatial-diff-settings-body spinal-scrollbar">
      <v-card v-if="modeView === ''">
        <v-card-title>
          <div>
            <h6 class="headline mb-0">Select an item in the sidebar</h6>
          </div>
        </v-card-title>
      </v-card>
      <v-card v-if="modeView === 'floor'">
        <v-card-title>
          <div class="spatial-diff-settings-title-container">
            <h6 class="headline mb-0">{{ getFloorName(FAData) }}</h6>
            <div>{{
              getModificationType(FAData.floorArchi.properties.modificationType)
            }}</div>
          </div>
          <BtnGroupViewInViewer
            type="floor"
            :data="FAData.floorArchi"
          ></BtnGroupViewInViewer>
        </v-card-title>
        <v-card-text>
          <md-field>
            <label>Manual assingment selection</label>
            <md-select
              v-model="manualAssingmentSelection"
              md-dense
              class="spinal-md-select"
            >
              <md-option
                v-for="item in manualAssingmentChoice"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }}
              </md-option>
            </md-select>
            <v-btn
              elevation="2"
              :disabled="
                manualAssingmentSelection === manualAssingmentSelectionTmp
              "
              icon
              @click="
                validateAssingment(FAData.floorArchi.properties.externalId)
              "
            >
              <v-icon>check</v-icon>
            </v-btn>
          </md-field>
          <v-expansion-panel popout>
            <template v-if="FAData.diff">
              <!-- diff info -->
              <SpinalTableDiffInfo
                :diffInfo="FAData.diff.diffInfo.diffInfo"
                :diffInfoHeader="diffInfoHeader"
                :title="'Diff Info'"
              ></SpinalTableDiffInfo>
              <!-- diff attr -->
              <SpinalTableDiffInfo
                :diffInfo="FAData.diff.diffInfo.diffAttr"
                :diffInfoHeader="diffInfoHeader"
                :title="'Diff Attributes'"
              ></SpinalTableDiffInfo>
              <!-- diff room del-->
              <SpinalTableDel
                :title="'Room to be removed'"
                :value="FAData.diff.diffRoom.delRooms"
              ></SpinalTableDel>
              <!-- diff room new -->
              <SpinalTableRoomNew
                :value="FAData.diff.diffRoom.newRooms"
              ></SpinalTableRoomNew>
              <!-- diff room update -->
              <SpinalTableRoomUpdate
                :value="FAData.diff.diffRoom.updateRooms"
              ></SpinalTableRoomUpdate>
              <!-- diff structures del -->
              <SpinalTableDel
                :title="'Reference Structures to be removed'"
                :value="FAData.diff.diffRef.delBimObj"
              ></SpinalTableDel>
              <!-- diff structures new -->
              <SpinalTableStructNew
                :value="FAData.diff.diffRef.newBimObj"
              ></SpinalTableStructNew>
            </template>
          </v-expansion-panel>
        </v-card-text>
      </v-card>
      <v-card v-if="modeView === 'roomupdate'">
        <v-card-title>
          <div class="spatial-diff-settings-title-container">
            <h6 class="headline mb-0">{{ compuName }}</h6>
            <div>{{ getModificationType(roomData.modificationType) }}</div>
          </div>
          <BtnGroupViewInViewer
            type="roomUpdate"
            :data="{ roomData, FAData }"
          ></BtnGroupViewInViewer>
        </v-card-title>
        <v-card-text>
          <md-field>
            <label>Manual assingment selection</label>
            <md-select
              v-model="manualAssingmentSelection"
              md-dense
              class="spinal-md-select"
            >
              <md-option
                v-for="item in manualAssingmentChoice"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }}
              </md-option>
            </md-select>
            <v-btn
              elevation="2"
              :disabled="
                manualAssingmentSelection === manualAssingmentSelectionTmp
              "
              icon
              @click="validateAssingment(roomData.externalId)"
            >
              <v-icon>check</v-icon>
            </v-btn>
          </md-field>
          <SpinalTableRoomUpdateDetails
            :value="roomData"
          ></SpinalTableRoomUpdateDetails>
        </v-card-text>
      </v-card>
      <v-card v-if="modeView === 'roomdelete'">
        <v-card-text class="spinal-diff-room-delete-container">
          <v-data-table
            hide-headers
            hide-actions
            :items="[
              { label: 'Name', value: roomData.name },
              { label: 'Node ID', value: roomData.nodeId },
              { label: 'Server ID', value: roomData.serverId },
            ]"
            class="elevation-1"
          >
            <template v-slot:items="props">
              <td>{{ props.item.label }}</td>
              <td>{{ props.item.value }}</td>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
      <v-card v-if="modeView === 'roomnew'">
        <SpinalRoomNew :tableData="roomData" v-model="selected">
          <md-field v-if="roomData[0] === selected[0]">
            <label>Manual assingment selection</label>
            <md-select
              v-model="manualAssingmentSelection"
              md-dense
              class="spinal-md-select"
            >
              <md-option
                v-for="item in manualAssingmentChoice"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }}
              </md-option>
            </md-select>
            <v-btn
              elevation="2"
              :disabled="
                manualAssingmentSelection === manualAssingmentSelectionTmp
              "
              icon
              @click="validateAssingment(selected[0].id)"
            >
              <v-icon>check</v-icon>
            </v-btn>
          </md-field>
        </SpinalRoomNew>
      </v-card>
    </div>
  </div>
</template>

<script>
import { EModificationType, getGraph } from 'spinal-spatial-referential';
import {
  diffFloorWithContextGeo,
  getContextSpatial,
  floorArchiHasChildren,
} from 'spinal-spatial-referential';
import { eventBus } from './eventbus';
import SpinalTableDiffInfo from './SpinalTableDiffInfo.vue';
import SpinalTableDel from './SpinalTableDel.vue';
import SpinalTableRoomNew from './SpinalTableRoomNew.vue';
import SpinalTableRoomUpdate from './SpinalTableRoomUpdate.vue';
import SpinalTableStructNew from './SpinalTableStructNew.vue';
import SpinalTableRoomUpdateDetails from './SpinalTableRoomUpdateDetails.vue';
import SpinalRoomNew from './SpinalRoomNew.vue';
import { parseUnit } from 'spinal-spatial-referential';
import BtnGroupViewInViewer from './BtnGroupViewInViewer.vue';

export default {
  name: 'SpatialDiffSettings',
  props: ['archiData', 'buildingServerId', 'bimFileId'],
  components: {
    SpinalTableDiffInfo,
    SpinalTableDel,
    SpinalTableRoomNew,
    SpinalTableRoomUpdate,
    SpinalTableStructNew,
    SpinalTableRoomUpdateDetails,
    SpinalRoomNew,
    BtnGroupViewInViewer,
  },
  data() {
    this.manualAssingment = new Map();
    return {
      modeView: '',
      FAData: null,
      roomData: null,
      manualAssingmentChoice: [],
      manualAssingmentSelection: 0,
      manualAssingmentSelectionTmp: 0,
      diffInfoHeader: [
        { text: 'Label', align: 'left', value: 'name' },
        { text: 'New Value', value: 'new' },
        { text: 'Old value', value: 'old' },
        { text: 'Unit', value: 'unit' },
      ],
      selected: [],
    };
  },
  computed: {
    compuName() {
      let name = '';
      if (this.roomData && this.roomData.diff && this.roomData.diff.diffAttr)
        for (const attr of this.roomData.diff.diffAttr) {
          if (attr.label === 'name') name += attr.archiValue;
          if (attr.label === 'number')
            name = attr.archiValue.toString() + '-' + name;
        }
      return name === '' ? this.roomData.name : name;
    },
  },
  mounted() {
    spinal.spinalPanelManagerService.openPanel('SpinalDiffViewer');
    eventBus.$on('selectFloor', this.onSelectFloor);
    eventBus.$on('selectRoom', this.onSelectRoom);
    return this.update();
  },
  beforDestroy() {
    eventBus.$off('selectFloor', this.onSelectFloor);
    eventBus.$off('selectRoom', this.onSelectRoom);

    spinal.spinalPanelManagerService.closePanel('SpinalDiffViewer');
  },
  methods: {
    validateAssingment(extId) {
      if (this.manualAssingmentSelection === 0) {
        this.manualAssingment.delete(extId);
      } else {
        this.manualAssingment.set(extId, this.manualAssingmentSelection);
      }
      return this.update();
    },
    getModificationType(modificationType) {
      if (modificationType & EModificationType.update) return 'update';
      if (modificationType & EModificationType.delete) return 'delete';
      if (modificationType & EModificationType.create) return 'new';
      return 'nothing to do';
    },
    getFloorName(FAData) {
      if (FAData.diff) {
        if (FAData.diff.diffInfo && FAData.diff.diffInfo.diffInfo) {
          for (const { label, archiValue } of FAData.diff.diffInfo.diffInfo) {
            if (label === 'name') return archiValue;
          }
        }
      }
      for (const { name, value } of FAData.floorArchi.properties.properties) {
        if (name === 'name') return value;
      }
    },

    async onSelectFloor(FAData) {
      this.modeView = 'floor';
      this.roomData = null;
      this.FAData = FAData;
      const graph = getGraph();
      const contextGeo = await getContextSpatial(graph);
      this.manualAssingmentSelection = 0;
      this.manualAssingmentSelectionTmp = 0;
      this.manualAssingmentChoice = [{ label: 'none', value: 0 }];
      const buildings = await contextGeo.getChildrenInContext(contextGeo);
      const buildingsFloors = await Promise.all(
        buildings.map((building) => {
          if (building._server_id === this.buildingServerId)
            return building.getChildrenInContext(contextGeo);
        })
      );
      const servId = this.manualAssingment.get(
        FAData.floorArchi.properties.externalId
      );
      for (const buildingFloor of buildingsFloors) {
        if (buildingFloor) {
          for (const floorNode of buildingFloor) {
            const data = {
              label: floorNode.info.name.get(),
              value: floorNode._server_id,
            };
            if (servId === floorNode._server_id) {
              this.manualAssingmentSelection = data.value;
              this.manualAssingmentSelectionTmp = data.value;
            }
            this.manualAssingmentChoice.push(data);
          }
        }
      }
    },
    async onSelectRoom({ FAData, RAData, type }) {
      this.roomData = null;
      this.modeView = 'room' + type;
      this.selected = [];
      this.FAData = FAData;
      if (type === 'update') {
        this.onSelectRoomSetAssing(FAData, RAData.roomArchi.properties);
        this.roomData = this.getProps(RAData.roomArchi.properties, RAData.diff);
      } else if (type === 'new') {
        this.onSelectRoomSetAssing(FAData, RAData.properties);
        const room = this.getPropsNew(RAData.properties);
        room.children = [];
        for (const structure of RAData.children) {
          const struct = this.getPropsNew(structure);
          room.children.push(struct);
        }
        this.roomData = [room];
      } else {
        const node = FileSystem._objects[RAData];
        this.roomData = {
          name: node.info.name.get(),
          nodeId: node.info.id.get(),
          serverId: RAData,
        };
      }
    },
    getPropsNew(properties) {
      const props = {
        name: '',
        id: properties.externalId,
        attr: [
          { label: 'dbId', value: properties.dbId, unit: '' },
          {
            label: 'externalId',
            value: properties.externalId,
            unit: '',
          },
        ],
      };
      for (const attr of properties.properties) {
        if (attr.name === 'name') props.name += attr.value;
        if (attr.name === 'level') continue;
        if (attr.name === 'number')
          props.name = attr.value.toString() + '-' + props.name;
        props.attr.push({
          label: attr.name,
          value: attr.value,
          unit: parseUnit(attr.dataTypeContext),
        });
      }
      return props;
    },
    getProps(properties, diff) {
      const props = {
        name: '',
        id: properties.externalId,
        dbId: properties.dbId,
        externalId: properties.externalId,
        modificationType: properties.modificationType,
        diff,
      };
      for (const attr of properties.properties) {
        if (attr.name === 'name') props.name += attr.value;
        if (attr.name === 'number')
          props.name = attr.value.toString() + '-' + props.name;
      }
      return props;
    },
    async onSelectRoomSetAssing(FAData, RADataProperties) {
      const graph = getGraph();
      const contextGeo = await getContextSpatial(graph);
      this.manualAssingmentSelection = 0;
      this.manualAssingmentSelectionTmp = 0;
      this.manualAssingmentChoice = [{ label: 'none', value: 0 }];
      const buildings = await contextGeo.getChildrenInContext(contextGeo);
      const buildingsFloors = await Promise.all(
        buildings.map(async (building) => {
          if (building._server_id === this.buildingServerId) {
            const floors = await building.getChildrenInContext(contextGeo);
            for (const floor of floors) {
              if (
                floor._server_id ===
                FAData.floorArchi.properties.spinalnodeServerId
              ) {
                return floor.getChildrenInContext(contextGeo);
              }
            }
          }
        })
      );
      let roomServId = this.manualAssingment.get(RADataProperties.externalId);
      for (const buildingRoom of buildingsFloors) {
        if (buildingRoom) {
          for (const roomNode of buildingRoom) {
            if (!roomNode) continue;
            const data = {
              label: roomNode.info.name.get(),
              value: roomNode._server_id,
            };
            if (roomServId === roomNode._server_id) {
              this.manualAssingmentSelection = data.value;
              this.manualAssingmentSelectionTmp = data.value;
            }
            this.manualAssingmentChoice.push(data);
          }
        }
      }
    },
    async update() {
      if (!this.buildingServerId) return;
      this.modeView = '';
      this.roomData = null;
      const graph = getGraph();
      const contextGeo = await getContextSpatial(graph);
      const archiData = [];
      for (const extId in this.archiData) {
        if (Object.hasOwnProperty.call(this.archiData, extId)) {
          const floorArchi = this.archiData[extId];
          if (floorArchiHasChildren(floorArchi)) {
            const diff = await diffFloorWithContextGeo(
              floorArchi,
              contextGeo,
              this.buildingServerId,
              this.manualAssingment
            );
            archiData.push({ diff, floorArchi });
          }
        }
      }
      spinal.spinalPanelManagerService.openPanel('SpinalDiffViewer', {
        archiData,
        manualAssingment: this.manualAssingment,
        buildingServerId: this.buildingServerId,
        bimFileId: this.bimFileId,
      });
    },
  },
};
</script>

<style scoped>
.spatial-diff-settings {
  height: 100%;
  position: relative;
}
.spatial-diff-settings-header {
  background-color: #222;
  display: flex;
}

.spatial-diff-settings-body {
  position: relative;
  overflow: auto;
  height: calc(100% - 50px);
  user-select: text;
}
.spinal-md-select {
  align-items: flex-end;
}
.spatial-diff-settings-title-container {
  flex-grow: 1;
  margin-right: 16px;
}
.plugin-graph-viewer {
  position: relative;
}
.spinal-diff-room-delete-container {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
</style>
