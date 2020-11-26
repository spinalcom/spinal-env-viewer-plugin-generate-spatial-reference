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
  <div>
    <v-list class="spinal-project-item-main-list">
      <v-list-tile v-if="bimSelected.length === 0">
        <v-list-tile-content>
          No Items in list, add items with the "+" button
        </v-list-tile-content>
      </v-list-tile>
      <template v-for="(item,i) in bimSelected">
        <v-list-group v-if="isProjectionGroupItems(item)"
                      :key="item.uid"
                      class="spinal-project-item-group-item"
                      no-action>
          <template v-slot:activator>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title>
                  {{ item.name }} ({{ item.computedData.length }})
                </v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <BimGroupsListHeaderBouttons :index="i"
                                             @addViewerSelection="addViewerSelection"
                                             @showInViewer="showInViewer"
                                             @showEdit="showEdit"
                                             @deleteGroup="deleteGroup">
                </bimgroupslistheaderbouttons>
              </v-list-tile-action>
            </v-list-tile>
          </template>
          <v-list-tile class="spinal-project-item-group-item-content">
            <v-list-tile-content>
              <BimGroupsItemContent :index="i"
                                    :item="item.computedData"
                                    @seeItem="seeItemIngroup"
                                    @deleteItem="deleteItemIngroup">
              </BimGroupsItemContent>
            </v-list-tile-content>
          </v-list-tile>
        </v-list-group>

        <v-list-tile v-else
                     :key="item.uid">
          <v-list-tile-content>
            {{ item.name }}
          </v-list-tile-content>
          <v-list-tile-action>
            <BimGroupsListHeaderBouttons :index="i"
                                         :is-item-group="false"
                                         @addViewerSelection="addViewerSelection"
                                         @showInViewer="showInViewer"
                                         @showEdit="showEdit"
                                         @deleteGroup="deleteGroup">
            </bimgroupslistheaderbouttons>
          </v-list-tile-action>
        </v-list-tile>
      </template>
    </v-list>

    <!-- <v-expansion-panel class="bim-groups-list">
      <v-expansion-panel-content v-for="(item,i) in bimSelected"
                                 :key="item.uid">
        <template v-slot:header>
          <div class="bim-groups-item-header">
            <div>
              {{ item.name }} ({{ item.computedData.length }})
            </div>
            <BimGroupsListHeaderBouttons :index="i"
                                         @addViewerSelection="addViewerSelection"
                                         @showInViewer="showInViewer"
                                         @showEdit="showEdit"
                                         @deleteGroup="deleteGroup">
            </BimGroupsListHeaderBouttons>
          </div>
        </template>
        <BimGroupsItemContent :index="i"
                              :item="item.computedData"></BimGroupsItemContent>
      </v-expansion-panel-content>
    </v-expansion-panel> -->
  </div>
</template>

<script>
import BimGroupsListHeaderBouttons from "./BimGroupsListHeaderBouttons.vue";
import BimGroupsItemContent from "./BimGroupsItemContent.vue";
import { isProjectionGroupItems } from "../../services/ProjectObjectInContext/ProjectItemService";
function BimSelectedValidator(item) {
  return Array.isArray(item);
}

export default {
  name: "BimGroupsList",
  components: {
    BimGroupsListHeaderBouttons,
    BimGroupsItemContent
  },
  props: {
    bimSelected: {
      required: true,
      type: Array,
      validator: BimSelectedValidator
    }
  },
  data() {
    return {};
  },
  computed: {},
  methods: {
    isProjectionGroupItems(item) {
      return isProjectionGroupItems(item);
    },
    addViewerSelection(index) {
      this.$emit("addViewerSelection", index);
    },
    showInViewer(index) {
      this.$emit("showInViewer", index);
    },
    showEdit(idx) {
      this.$emit("showEdit", idx);
    },
    seeItemIngroup(index, itm) {
      this.$emit("showInViewer", index, itm);
    },
    deleteItemIngroup(index, itm) {
      this.$emit("deleteItemIngroup", index, itm);
    },
    deleteGroup(index) {
      this.$emit("deleteGroup", index);

    }
  }
};
</script>

<style>
.spinal-project-item-main-list
  .spinal-project-item-group-item
  .v-list__group__header {
  flex-direction: row-reverse;
}

.spinal-project-item-main-list
  .spinal-project-item-group-item
  .v-list__group__header
  .v-list__group__header__append-icon {
  padding: 0 5px;
}

.spinal-project-item-main-list
  .spinal-project-item-group-item
  .v-list__group__items
  .spinal-project-item-group-item-content
  > .v-list__tile {
  height: unset;
  padding: 0;
}

.spinal-project-item-main-list
  .spinal-project-item-group-item
  .v-list__group__items
  .spinal-project-item-group-item-content
  > .v-list__tile
  .v-list__tile__content
  > div {
  width: 100%;
}

/* .bim-groups-list .v-expansion-panel__header {
  flex-direction: row-reverse;
  padding: 0 5px 0 0;
}
.bim-groups-list .v-expansion-panel__header:hover {
  background-color: rgba(25, 25, 25, 0.2);
}
.bim-groups-list .v-expansion-panel__header .v-expansion-panel__header__icon {
  margin: 0 5px;
}
.bim-groups-list .v-expansion-panel__header .bim-groups-item-header {
  flex-direction: row;
  display: flex;
  justify-content: space-between;
  align-items: center;
} */
</style>
