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
  <div class="spinal-bim-groups-item-content">
    <v-list class="spinal-list-scrollbar"
            dense>
      <v-list-tile v-for="itm in pageData"
                   :key="itm.id"
                   class="dbid-list-item">
        <v-list-tile-content>
          <v-list-tile-title>{{ itm.name }}</v-list-tile-title>
          <v-list-tile-sub-title>{{ itm.dbId }}</v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action class="dbid-list-item-action-btn">
          <v-btn icon
                 ripple
                 @click="deleteItem(itm)">
            <v-icon color="red">
              clear
            </v-icon>
          </v-btn>
          <v-btn icon
                 ripple
                 @click="seeItem(itm)">
            <v-icon color="green">
              visibility
            </v-icon>
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>

      <v-list-tile v-if="item.length === 0">
        <v-list-tile-content>
          <v-list-tile-title>No Item in this group</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>

    <v-pagination v-if="totalPage > 1"
                  v-model="page"
                  :length="totalPage" />
  </div>
</template>

<script>
function itemValidator(item) {
  return Array.isArray(item);
}

export default {
  name: "BimGroupsItemContent",
  props: {
    index: {
      required: true,
      type: Number
    },
    item: {
      required: true,
      type: Array,
      validator: itemValidator
    }
  },
  data() {
    return { page: 1, nbPerPage: 10 };
  },
  computed: {
    pageData() {
      const idx = (this.page - 1) * this.nbPerPage;
      return this.item.slice(idx, idx + this.nbPerPage);
    },
    totalPage() {
      return Math.ceil(this.item.length / this.nbPerPage);
    }
  },
  methods: {
    seeItem(item) {
      this.$emit("seeItem", this.index, item);
    },
    deleteItem(item) {
      this.$emit("deleteItem", this.index, item);
    }
  }
};
</script>

<style>
.dbid-list-item-action-btn {
  flex-direction: row;
}

.spinal-bim-groups-item-content {
  text-align: center;
}
.spinal-bim-groups-item-content
.v-list__tile {
    padding-left: 48px;
}
</style>
