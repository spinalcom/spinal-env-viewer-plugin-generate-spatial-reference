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
  <v-list dark two-line>
    <v-subheader v-if="archiData === undefined"> loading... </v-subheader>
    <v-subheader v-else-if="archiData.length === 0"> no data </v-subheader>
    <v-list-group
      v-else
      v-for="FAData in archiData"
      :key="FAData.floorArchi.properties.externalId"
      no-action
      :lazy="true"
    >
      <template v-slot:activator>
        <v-list-tile
          ripple
          class="spinal-item-tile"
          :class="getColor(FAData.floorArchi.properties.modificationType)"
          @click="onSelectFloor(FAData)"
        >
          <v-list-tile-action>
            <v-btn
              @click.stop="
                onClickCheckbox(FAData.floorArchi.properties.externalId)
              "
              ripple
              circle
              dense
              icon
            >
              <v-icon
                v-if="isInSkipList(FAData.floorArchi.properties.externalId)"
                >check_box_outline_blank</v-icon
              >
              <v-icon v-else>check_box</v-icon>
            </v-btn>
          </v-list-tile-action>

          <v-list-tile-content>
            <v-list-tile-title class="spinal-list-tile-title">{{
              getName(FAData)
            }}</v-list-tile-title>
            <v-list-tile-sub-title class="spinal-list-tile-title">
              {{ getFloorSummData(FAData) }}
            </v-list-tile-sub-title>
            <v-list-tile-sub-title class="spinal-list-tile-title">
              {{ getFloorSummRoom(FAData) }}
            </v-list-tile-sub-title>
            <v-list-tile-sub-title class="spinal-list-tile-title">
              {{ getFloorSummStruct(FAData) }}
            </v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
      </template>
      <template v-if="FAData.diff">
        <v-list-tile
          ripple
          class="spinal-item-tile spinal-subitem-tile spinal-item-tile-delete"
          v-for="serverId in FAData.diff.diffRoom.delRooms"
          @click="onSelectRoom(FAData, serverId, 'delete')"
          :key="serverId"
        >
          <v-list-tile-action>
            <v-btn
              @click.stop="onClickCheckbox(serverId)"
              ripple
              circle
              dense
              icon
              :disabled="isInSkipList(FAData.floorArchi.properties.externalId)"
            >
              <v-icon
                v-if="
                  isInSkipList(
                    serverId,
                    FAData.floorArchi.properties.externalId
                  )
                "
                >check_box_outline_blank</v-icon
              >
              <v-icon v-else>check_box</v-icon>
            </v-btn>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title class="spinal-list-tile-title">{{
              getRoomNameNode(serverId)
            }}</v-list-tile-title>
            <v-list-tile-sub-title class="spinal-list-tile-title">
              server id : {{ serverId }}
            </v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile
          class="spinal-item-tile spinal-subitem-tile"
          v-for="subItem in FAData.diff.diffRoom.newRooms"
          @click="onSelectRoom(FAData, subItem, 'new')"
          :key="subItem.properties.externalId"
          :class="getColor(subItem.properties.modificationType)"
        >
          <v-list-tile-action>
            <v-btn
              @click.stop="onClickCheckbox(subItem.properties.externalId)"
              ripple
              circle
              dense
              icon
              :disabled="isInSkipList(FAData.floorArchi.properties.externalId)"
            >
              <v-icon
                v-if="
                  isInSkipList(
                    subItem.properties.externalId,
                    FAData.floorArchi.properties.externalId
                  )
                "
                >check_box_outline_blank</v-icon
              >
              <v-icon v-else>check_box</v-icon>
            </v-btn>
          </v-list-tile-action>

          <v-list-tile-content>
            <v-list-tile-title class="spinal-list-tile-title">{{
              getRoomNameArchi(subItem)
            }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile
          ripple
          class="spinal-item-tile spinal-subitem-tile"
          v-for="subItem in FAData.diff.diffRoom.updateRooms"
          :class="getColor(subItem.roomArchi.properties.modificationType)"
          :key="subItem.roomArchi.properties.externalId"
          @click="onSelectRoom(FAData, subItem, 'update')"
        >
          <v-list-tile-action>
            <v-btn
              @click.stop="
                onClickCheckbox(subItem.roomArchi.properties.externalId)
              "
              :disabled="isInSkipList(FAData.floorArchi.properties.externalId)"
              ripple
              circle
              dense
              icon
            >
              <v-icon
                v-if="
                  isInSkipList(
                    subItem.roomArchi.properties.externalId,
                    FAData.floorArchi.properties.externalId
                  )
                "
                >check_box_outline_blank</v-icon
              >
              <v-icon v-else>check_box</v-icon>
            </v-btn>
          </v-list-tile-action>

          <v-list-tile-content>
            <v-list-tile-title class="spinal-list-tile-title">{{
              getRoomName(subItem)
            }}</v-list-tile-title>
            <v-list-tile-sub-title class="spinal-list-tile-title">
              {{ getSumData(subItem.diff) }}
            </v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
      </template>
    </v-list-group>
  </v-list>
</template>

<script>
import { EModificationType } from 'spinal-spatial-referential';
import { FileSystem } from 'spinal-core-connectorjs';
import { SpinalNode } from 'spinal-model-graph';
import { eventBus } from './eventbus';

export default {
  name: 'SpinalDiffFloorViewer',
  props: ['archiData', 'value'],
  data() {
    return {
      selectedItem: null,
    };
  },
  methods: {
    getIcon(modificationType) {
      if (modificationType & EModificationType.update) return 'update';
      if (modificationType & EModificationType.create) return 'new-box';
      return 'delete';
    },
    getColor(modificationType) {
      if (modificationType & EModificationType.update)
        return { 'spinal-item-tile-update': true };
      if (modificationType & EModificationType.create)
        return { 'spinal-item-tile-create': true };
      if (modificationType & EModificationType.delete)
        return { 'spinal-item-tile-delete': true };
    },
    getName(FAData) {
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
    getRoomName(RAData) {
      if (RAData.diff) {
        if (RAData.diff.diffInfo && RAData.diff.diffInfo.diffInfo) {
          for (const { label, archiValue } of RAData.diff.diffInfo.diffInfo) {
            if (label === 'name') return archiValue;
          }
        }
      }
      return this.getRoomNameArchi(RAData.roomArchi);
    },
    getRoomNameArchi(roomArchi) {
      let resName, resNumber;
      for (const { name, value } of roomArchi.properties.properties) {
        if (name === 'name') resName = value;
        if (name === 'number') resNumber = value;
      }
      if (resNumber && resName) return `${resNumber}-${resName}`;
      return 'unamed';
    },
    getRoomNameNode(server_id) {
      const node = FileSystem._objects[server_id];
      if (node instanceof SpinalNode && node.info.name) {
        return node.info.name.get();
      }
      return server_id;
    },
    getFloorSummData(FAData) {
      if (FAData.diff) {
        return this.getSumData(FAData.diff.diffInfo);
      }
      return '';
    },
    getSumData(diffInfo) {
      if (!diffInfo) return '';
      const tmp = [];
      if (diffInfo.diffAttr.length > 0) {
        tmp.push(`${diffInfo.diffAttr.length} attribute(s)`);
      }
      if (diffInfo.diffInfo.length > 0) {
        tmp.push(`${diffInfo.diffInfo.length} nodeinfo(s)`);
      }
      if (tmp.length === 0) return '';
      return tmp.join(', ');
    },
    getFloorSummRoom(FAData) {
      if (FAData.diff) {
        const tmp = [];
        if (FAData.diff.diffRoom.delRooms.length > 0) {
          tmp.push(`${FAData.diff.diffRoom.delRooms.length} Delete`);
        }
        if (FAData.diff.diffRoom.newRooms.length > 0) {
          tmp.push(`${FAData.diff.diffRoom.newRooms.length} New`);
        }
        if (FAData.diff.diffRoom.updateRooms.length > 0) {
          tmp.push(`${FAData.diff.diffRoom.updateRooms.length} Update`);
        }
        if (tmp.length === 0) return '';
        return 'Rooms: ' + tmp.join(', ');
      }
      return '';
    },
    getFloorSummStruct(FAData) {
      if (FAData.diff) {
        const tmp = [];
        if (FAData.diff.diffRef.delBimObj.length > 0) {
          tmp.push(`${FAData.diff.diffRef.delBimObj.length} Delete`);
        }
        if (FAData.diff.diffRef.newBimObj.length > 0) {
          tmp.push(`${FAData.diff.diffRef.newBimObj.length} New`);
        }
        if (tmp.length === 0) return '';
        return 'Structure reference: ' + tmp.join(', ');
      }
      return '';
    },
    onSelectFloor(FAData) {
      eventBus.$emit('selectFloor', FAData);
    },
    onSelectRoom(FAData, RAData, type) {
      eventBus.$emit('selectRoom', { FAData, RAData, type });
    },
    onClickCheckbox(id, type) {
      const idx = this.value.findIndex((itm) => itm.id === id);
      if (idx === -1) {
        this.$emit('pushSkip', { id, type });
      } else {
        this.$emit('rmAtSkip', idx);
      }
    },
    isInSkipList(id, parentId) {
      const fct = (itm) => itm.id === id;
      if (parentId)
        return (
          this.value.some((itm) => itm.id === parentId) || this.value.some(fct)
        );
      return this.value.some(fct);
    },
  },
};
</script>

<style scoped>
.spinal-list-tile-title {
  color: white;
}
.spinal-item-tile {
  position: relative;
}
</style>
<style>
.spinal-subitem-tile > a {
  padding-left: 24px !important;
}
.spinal-item-tile .v-list__tile__action {
  min-width: 32px;
}
.spinal-item-tile > a {
  text-decoration: none !important;
  padding: 0px 8px;
}
.spinal-item-tile .v-list__tile__action > button i {
  color: #fff;
}
.spinal-item-tile.spinal-item-tile-update .v-list__tile__action > button i {
  color: #71b3ff;
}
.spinal-item-tile.spinal-item-tile-create .v-list__tile__action > button i {
  color: #49c750;
}
.spinal-item-tile.spinal-item-tile-delete .v-list__tile__action > button i {
  color: #ff9090;
}
.SpinalDiffViewer-content
  .v-list__group__header
  .v-list__group__header__append-icon {
  padding: 0px 8px;
}
</style>
