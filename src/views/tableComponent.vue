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
  <div class="spinal-list-model-container">
    <v-list class="_tableComponent spinal-list-scrollbar">
      <v-list-tile v-for="item in pageData"
                   :key="item.id"
                   class="dbid-list-item">
        <v-list-tile-content>
          <v-list-tile-title>{{ item.name }}</v-list-tile-title>
          <v-list-tile-sub-title>{{ item.dbId }}</v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action class="dbid-list-item-action-btn">
          <v-btn icon
                 ripple
                 @click="seeItem(item)">
            <v-icon color="grey lighten-1">
              visibility
            </v-icon>
          </v-btn>
          <v-btn icon
                 ripple
                 @click="deleteItem(item)">
            <v-icon color="grey lighten-1">
              clear
            </v-icon>
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>
    <v-pagination v-model="page"
                  :length="totalPage" />
  </div>
</template>

<script>
export default {
  name: "TableComponent",
  components: {},
  props: {
    bimSelected: {
      type: Array,
      required: true,
      validator: function() {
        return [];
      }
    }
  },
  data() {
    return { data: [], page: 1, nbPerPage: 10 };
  },
  computed: {
    pageData() {
      const idx = (this.page - 1) * this.nbPerPage;
      return this.bimSelected.slice(idx, idx + this.nbPerPage);
    },
    totalPage() {
      return Math.ceil(this.bimSelected.length / this.nbPerPage);
    }
  },
  methods: {
    seeItem(item) {
      this.$emit("seeItem", item);
    },
    deleteItem(item) {
      this.$emit("deleteItem", item);
    }
  }
};
</script>

<style scoped>
.spinal-list-model-container {
  height: calc(100% - 48px);
  position: relative;
}
._tableComponent {
  height: calc(100% - 42px);
  width: 100%;
  overflow: auto;
  background-color: transparent;
}

.spinal-list-scrollbar::-webkit-scrollbar {
  overflow-x: auto;
  width: 5px;
  height: 5px;
}
.spinal-list-scrollbar::-webkit-scrollbar-thumb {
  -webkit-border-radius: 5px;
  border-radius: 5px;
  background: rgba(169, 169, 169, 0.9);
}
.spinal-list-scrollbar::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
  box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
  -webkit-border-radius: 5px;
  border-radius: 5px;
}
</style>

<style>
.spinal-list-item {
  height: 100%;
}

.dbid-list-item-action-btn {
  flex-direction: row;
}
</style>
