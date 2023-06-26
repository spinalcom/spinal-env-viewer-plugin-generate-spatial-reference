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
      {{ name }}
      <v-spacer></v-spacer>
      <v-btn
        icon
        round
        @click="$emit('save', [uid])"
        color="warning"
        :disabled="canSave"
      >
        <v-icon>save</v-icon>
      </v-btn>

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
          <v-list class="spinal-project-item-main-list">
            <v-list-tile v-if="list.length === 0">
              <v-list-tile-content>
                No Items in list, add items with the "+" button
              </v-list-tile-content>
            </v-list-tile>
            <template v-for="(item, i) in list">
              <v-list-group
                v-if="isProjectionGroup(item)"
                :key="item.uid"
                class="spinal-project-item-group-item"
                no-action
              >
                <template v-slot:activator>
                  <v-list-tile class="spinal-project-item-group-item-container">
                    <div class="spinal-project-item-group-item-arrow-container">
                      <v-btn ripple @click.stop="up(i)" :disabled="canUp(i)">
                        <v-icon> expand_less </v-icon>
                      </v-btn>
                      <v-btn
                        ripple
                        @click.stop="down(i)"
                        :disabled="canDown(i)"
                      >
                        <v-icon> expand_more </v-icon>
                      </v-btn>
                    </div>
                    <v-list-tile-content>
                      <v-list-tile-title
                        class="spinal-project-item-group-item-title-container"
                      >
                        <span
                          v-tooltip="item.name"
                          class="spinal-project-item-group-item-title"
                        >
                          ({{ item.computedData.length }}) {{ item.name }}
                        </span>
                      </v-list-tile-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                      <BimGroupsListHeaderBouttons
                        :index="i"
                        @addViewerSelection="addViewerSelection"
                        @showInViewer="showInViewer"
                        @showEdit="showEdit"
                        @deleteGroup="deleteGroup"
                      >
                      </BimGroupsListHeaderBouttons>
                    </v-list-tile-action>
                  </v-list-tile>
                </template>
                <div class="spinal-project-item-group-item-content">
                  <v-list-tile-content>
                    <BimGroupsItemContent
                      :index="i"
                      :item="item.computedData"
                      @seeItem="showInViewer"
                      @deleteItem="deleteItemIngroup"
                    >
                    </BimGroupsItemContent>
                  </v-list-tile-content>
                </div>
              </v-list-group>

              <v-list-tile
                v-else
                :key="item.uid"
                class="spinal-project-item-group-item-container"
              >
                <div class="spinal-project-item-group-item-arrow-container">
                  <v-btn ripple @click="up(i)" :disabled="canUp(i)">
                    <v-icon> expand_less </v-icon>
                  </v-btn>
                  <v-btn ripple @click="down(i)" :disabled="canDown(i)">
                    <v-icon> expand_more </v-icon>
                  </v-btn>
                </div>

                <v-list-tile-content
                  class="spinal-project-item-group-item-title-container"
                >
                  <span
                    v-tooltip="item.name"
                    class="spinal-project-item-group-item-title"
                  >
                    {{ item.name }}
                  </span>
                </v-list-tile-content>
                <v-list-tile-action>
                  <BimGroupsListHeaderBouttons
                    :index="i"
                    :is-item-group="false"
                    @addViewerSelection="addViewerSelection"
                    @showInViewer="showInViewer"
                    @showEdit="showEdit"
                    @deleteGroup="deleteGroup"
                  >
                  </BimGroupsListHeaderBouttons>
                </v-list-tile-action>
              </v-list-tile>
            </template>
          </v-list>
        </div>
      </md-card>
    </div>
    <BimGroupsItemEdit
      :item-to-edit="itemToEdit"
      @close="onCloseEdit"
    ></BimGroupsItemEdit>
  </div>
</template>

<script>
import AddAGroup from './AddAGroup.vue';
import BimGroupsListHeaderBouttons from './BimGroupsListHeaderBouttons.vue';
import BimGroupsItemContent from './BimGroupsItemContent.vue';
import BimGroupsItemEdit from './BimGroupsItemEdit.vue';
import {
  isProjectionGroup,
  addToProjectionGroup,
  addSelectionToList,
  addViewerSelection,
  getViewer,
} from 'spinal-spatial-referential';
export default {
  name: 'SelectedGroup',
  props: ['name', 'uid', 'list', 'canSave'],
  components: {
    AddAGroup,
    BimGroupsListHeaderBouttons,
    BimGroupsItemContent,
    BimGroupsItemEdit,
  },
  data() {
    return {
      itemToEdit: null,
    };
  },
  computed: {},
  methods: {
    up(idx) {
      const itm = this.list[idx];
      this.list.splice(idx, 1);
      this.list.splice(idx - 1, 0, itm);
      this.$emit('savableCfg');
    },
    down(idx) {
      const itm = this.list[idx];
      this.list.splice(idx, 1);
      this.list.splice(idx + 1, 0, itm);
      this.$emit('savableCfg');
    },
    canUp(idx) {
      return idx === 0;
    },
    canDown(idx) {
      return idx === this.list.length - 1;
    },
    generate() {
      this.$emit('generate', [this.uid]);
    },
    addSelection() {
      this.$emit('savableCfg');
      return addSelectionToList(this.list, getViewer());
    },
    addAGroup(groupeName) {
      this.$emit('savableCfg');
      addToProjectionGroup(this.list, groupeName);
    },
    isProjectionGroup: isProjectionGroup,
    addViewerSelection(idx) {
      this.$emit('savableCfg');
      return addViewerSelection(idx, this.list, getViewer());
    },
    showInViewer(index, itm) {
      const item = this.list[index];
      const viewer = getViewer();
      if (isProjectionGroup(item)) {
        if (typeof itm === 'undefined') item.selectAll(viewer);
        else item.selectItem(itm, viewer);
      } else {
        item.selectItem(viewer);
      }
    },
    deleteItemIngroup(index, itm) {
      const item = this.list[index];
      if (isProjectionGroup(item)) {
        this.$emit('savableCfg');
        item.deleteItem(itm);
      }
    },
    deleteGroup(index) {
      this.$emit('savableCfg');
      this.list.splice(index, 1);
    },
    showEdit(index) {
      const item = this.list[index];
      this.itemToEdit = item;
    },
    onCloseEdit(editItem) {
      if (editItem) {
        for (const item of this.list) {
          if (item.uid === editItem.uid) {
            item.name = editItem.name;
            item.offset.r = editItem.offset.r;
            item.offset.t = editItem.offset.t;
            item.offset.z = editItem.offset.z;
            this.$emit('savableCfg');
            break;
          }
        }
      }
      this.itemToEdit = null;
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
.spinal-project-item-group-item-title-container {
  position: relative;
}
.spinal-project-item-group-item-title {
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  overflow: hidden;
}
.spinal-project-item-group-item-arrow-container {
  position: absolute;
  left: 0;
  display: flex;
  flex-direction: column;
  height: 48px;
}
.spinal-project-item-group-item-arrow-container > button {
  margin: 0;
  padding: 0;
  height: 24px;
  min-width: unset;
}
</style>

<style>
.spinal-project-item-group-item-content > .v-list__tile {
  padding-left: unset !important;
}
.spinal-project-item-group-item
  .spinal-project-item-group-item-container
  > .v-list__tile {
  padding-right: 0;
}
.spinal-project-item-group-item-container > .v-list__tile {
  padding-right: 0;
  padding-left: 32px;
}
</style>
