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

  <md-table class="_tableComponent md-scrollbar">
    <md-table-row>
      <md-table-head md-numeric>dbId</md-table-head>
      <md-table-head>Name</md-table-head>
      <md-table-head></md-table-head>
      <md-table-head></md-table-head>
    </md-table-row>

    <md-table-row v-for="(bim,index) in data"
                  :key="index">
      <md-table-cell md-numeric>{{bim.dbId}}</md-table-cell>
      <md-table-cell>{{bim.name}}</md-table-cell>

      <md-table-cell>
        <md-button class="md-icon-button md-dense"
                   @click="seeItem(bim.dbId)">
          <md-icon>visibility</md-icon>
        </md-button>
      </md-table-cell>

      <md-table-cell>
        <md-button class="md-icon-button md-dense"
                   @click="deleteItem(bim.dbId)">
          <md-icon>clear</md-icon>
        </md-button>
      </md-table-cell>
    </md-table-row>

  </md-table>

</template>

<script>
export default {
  name: "tableComponent",
  props: ["bimSelected"],
  data() {
    return {
      data: []
    };
  },
  methods: {
    getObjectsSelectedInfo() {
      return this.bimSelected.map(el => {
        const { model, selection } = el;
        return new Promise(resolve => {
          model.getBulkProperties(
            selection,
            {
              propFilter: ["name"]
            },
            dbIds => {
              return resolve(dbIds);
            }
          );
        });
      });
    },
    seeItem(dbId) {
      let bimIds = this.bimSelected.filter(el => {
        return el.selection.indexOf(dbId) !== -1;
      });
      bimIds.forEach(element => {
        window.spinal.ForgeViewer.viewer.impl.selector.setSelection(
          [dbId],
          element.model
        );
      });
    },
    deleteItem(dbId) {
      this.data = this.data.filter(el => el.dbId !== dbId);
      for (let i = 0; i < this.bimSelected.length; i++) {
        let index = this.bimSelected[i].selection.indexOf(dbId);
        if (index !== -1) {
          this.bimSelected[i].selection.splice(index, 1);
          console.log(this.bimSelected);
        }
      }
    }
  },
  watch: {
    bimSelected() {
      console.log(this.bimSelected);
      console.log("update");
      if (this.bimSelected) {
        let values = this.getObjectsSelectedInfo();
        Promise.all(values).then(dbIds => {
          dbIds = dbIds.flat();
          this.data = dbIds;
        });
      }
    }
  }
};
</script>

<style scoped>
._tableComponent {
  width: 100%;
  height: calc(100% - 117px);
  overflow: auto;
  background-color: transparent;
}
</style>
