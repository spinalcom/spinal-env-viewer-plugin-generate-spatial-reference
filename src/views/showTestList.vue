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
  <v-card dense>
    <v-toolbar dark
               dense>
      <v-btn icon>
        <v-icon @click="backBtn">
          arrow_back
        </v-icon>
      </v-btn>

      <v-toolbar-title v-if="itemSelected !== null && openSearch === false">
        {{ itemSelected.name }}
      </v-toolbar-title>
      <v-spacer />
      <v-toolbar-title v-if="openSearch === true">
        <v-text-field v-model="searchQuery"
                      style="height: 42px;"
                      placeholder="Search"
                      solo
                      label="Search" />
      </v-toolbar-title>
      <v-btn icon
             @click="openSearch = !openSearch">
        <v-icon>
          search
        </v-icon>
      </v-btn>
    </v-toolbar>
    <v-card-text v-if="itemSelected === null">
      <v-list two-line
              subheader
              dense
              class="showTestListContainer"
              dark>
        <v-list-tile v-for="item in itemsCompu"
                     :key="item.dbId"
                     @click="onClick(item)"
                     @mouseenter="onMouseEnter(item)">
          <v-list-tile-content>
            <v-list-tile-title v-text="item.name" />
            <v-list-tile-sub-title v-text="item.dbId" />
          </v-list-tile-content>
          <v-list-tile-action class="action-btn">
            <BtnTooltip icon="arrow_forward_ios"
                        tooltip="See properties"
                        @clicked="onClickDetails(item)" />
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
      <div style="text-align: center;">
        <v-pagination v-model="page"
                      :length="pageLen" />
      </div>
    </v-card-text>
    <v-card-text v-else>
      <v-data-table :headers="header"
                    :items="itemSelected.properties"
                    :rows-per-page-items="rowsPerPage"
                    :pagination.sync="pagination"
                    class="elevation-1">
        <template v-slot:items="props">
          <td>{{ props.item.displayName }}</td>
          <td>{{ props.item.displayValue }}</td>
          <td>{{ props.item.displayCategory }}</td>
          <td>{{ props.item.attributeName }}</td>
          <td>{{ props.item.type }}</td>
          <td>{{ props.item.units }}</td>
          <td>{{ props.item.hidden }}</td>
          <td>{{ props.item.precision }}</td>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
import {
  getParamFromDbIds,
  selectDbId,
  fitToViewtDbIds
} from "../services/dbIdUtils";
import { getModelByName } from "../services/getObjFromRvtModel";
import BtnTooltip from "../viewUtils/BtnTooltip.vue";

const NBR_ITEMS = 15;
export default {
  name: "ShowTestList",
  components: { BtnTooltip },
  props: {
    items: { require: true, type: Array, default: () => [] },
    modelName: { require: true, type: String, default: () => "" }
  },
  data() {
    return {
      itemsParam: [],
      itemSelected: null,
      openSearch: false,
      searchQuery: "",
      privPage: 1,
      header: [
        { text: "displayName", value: "displayName" },
        { text: "displayValue", value: "displayValue" },
        { text: "displayCategory", value: "displayCategory" },
        { text: "attributeName", value: "attributeName" },
        { text: "type", value: "type" },
        { text: "units", value: "units" },
        { text: "hidden", value: "hidden" },
        { text: "precision", value: "precision" }
      ],
      rowsPerPage: [
        10,
        25,
        50,
        100,
        { text: "$vuetify.dataIterator.rowsPerPageAll", value: -1 }
      ],
      pagination: {
        descending: true,
        page: 1,
        rowsPerPage: 25, // -1 for All,
        sortBy: "",
        totalItems: 0
      }
    };
  },
  computed: {
    selectedProps() {
      const res = this.itemSelected.properties.map(e => {
        return {
          displayName: String(e.displayName),
          displayValue: String(e.displayValue),
          displayCategory: String(e.displayCategory),
          attributeName: String(e.attributeName),
          type: String(e.type),
          units: String(e.units),
          hidden: String(e.hidden),
          precision: String(e.precision)
        };
      });
      return res;
    },
    tmpItemsCompu() {
      if (this.openSearch === true && this.searchQuery !== "") {
        let query = "";
        try {
          query = RegExp.escape(this.searchQuery);
        } catch (e) {
          query = this.searchQuery;
        }
        const reg = new RegExp(query, "i");
        return this.itemsParam.filter(item => {
          return reg.test(item.name) || reg.test(item.dbId);
        });
      }
      return this.itemsParam;
    },
    itemsCompu() {
      const idx = (this.page - 1) * NBR_ITEMS;
      return this.tmpItemsCompu.slice(idx, idx + NBR_ITEMS);
    },
    pageLen() {
      return Math.ceil(this.tmpItemsCompu.length / NBR_ITEMS);
    },
    page: {
      get() {
        if (this.pageLen < this.privPage) return this.pageLen;
        return this.privPage;
      },
      set(value) {
        this.privPage = value;
      }
    }
  },
  async mounted() {
    if (this.items.length === 0) return;
    this.model = getModelByName(this.modelName);
    this.itemsParam = await getParamFromDbIds(this.model, this.items);
  },
  methods: {
    backBtn() {
      if (this.itemSelected) return (this.itemSelected = null);
      this.$emit("close");
    },
    onClick(value) {
      fitToViewtDbIds([value.dbId], this.model);
    },
    onMouseEnter(value) {
      selectDbId([value.dbId], this.model);
    },
    onClickDetails(value) {
      this.itemSelected = value;
    },
    getProps() {
      if (this.itemSelected.properties.length === 0) return [];
      const res = [];
      for (const key in this.itemSelected.properties[0]) {
        if (this.itemSelected.properties[0].hasOwnProperty(key)) {
          res.push(key);
        }
      }
      return res;
    }
  }
};
</script>

<style>
.showTestListContainer,
.showTestListContainer * {
  text-decoration: none !important;
  color: white;
}
</style>
<style scoped>
.action-btn {
  flex-wrap: wrap;
}
</style>
