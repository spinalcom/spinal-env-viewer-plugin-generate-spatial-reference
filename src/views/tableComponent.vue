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
        height: 100%;
        overflow: auto;
        background-color: transparent;
    }
</style>