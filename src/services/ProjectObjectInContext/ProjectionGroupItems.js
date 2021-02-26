/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

// interface IItem {
//   name: string;
//   offset: IOffset;
//   uid: string;
//   data: IDataItem[];
//   computed: IComputedItem[];
// }
// interface IOffset {
//   r: number;
//   t: number;
//   z: number;
// }
// interface IDataItem {
//   modelId: string;
//   selection: number[];
// }
// interface IComputedItem {
//   dbId: number;
//   id: string;
//   modelId: number;
//   name: string;
//   properties: any[];
// }

// {
//   "name": "",
//   "offset": { "r": 0, "t": 0, "z": 0 },
//   "uid": "",
//   "data": [{
//     "modelId": "",
//     "selection": [0]
//   }],
//   "computed": [{
//     "dbId": 3358,
//     "id": "2-3358",
//     "modelId": 2,
//     "name": "1 Vantail - Droit [318651]",
//   }]
// }

export default class ProjectionGroupItems {
  constructor(name) {
    this.name = name;
    this.offset = { r: 0, t: 0, z: 0 };
    this.uid = `${Date.now()}-${Math.round(Math.random()*10000)}-${Math.round(Math.random()*10000)}`;
    this.data = [];
    this.computedData = [];
  }

  async getAndMergeSelection(viewer) {
    const aggregateSelection = viewer.getAggregateSelection();
    for (let select of aggregateSelection) {
      let found = this.data.find(el => {
        return el.modelId === select.model.id;
      });

      if (typeof found !== "undefined") {
        for (const dbId of select.selection) {
          if (!found.selection.includes(dbId)) {
            found.selection.push(dbId);
          }
        }
      } else {
        this.data.push({
          modelId: select.model.id,
          selection: select.selection
        });
      }
    }
    await this.updateComputed();
  }

  getModelByModelId(modelId) {
    for (const bimFileId in window.spinal.BimObjectService.mappingBimFileIdModelId) {
      if (window.spinal.BimObjectService.mappingBimFileIdModelId.hasOwnProperty(bimFileId)) {
        const mappingBimFileIdModelId = window.spinal.BimObjectService.mappingBimFileIdModelId[bimFileId];
        if (mappingBimFileIdModelId.modelId === modelId) {
          for (const { model } of mappingBimFileIdModelId.modelScene) {
            if (model.id === modelId) return model;
          }
        }
      }
    }
  }

  async updateComputed() {
    const res = [];
    for (const { modelId, selection } of this.data) {
      if (selection.length === 0) continue;
      const model = this.getModelByModelId(modelId);

      res.push(
        new Promise(resolve => {
          model.getBulkProperties(
            Array.from(selection),
            { propFilter: ["name", "externalId"] },
            result => {
              result.forEach(e => {
                e.id = `${model.id}-${e.dbId}`;
                e.modelId = model.id;
              });
              resolve(result);
            }
          );
        })
      );
    }
    const tmpRes = await Promise.all(res);
    let idx = 0;
    while (idx < this.data.length) {
      const obj = this.data[idx];
      if (obj.selection.length === 0) {
        this.data.splice(idx, 1);
      } else {
        idx++;
      }
    }
    this.computedData = tmpRes.reduce((acc, el) => {
      acc.push(...el);
      return acc;
    }, []);
  }

  deleteItem(item) {
    for (const { modelId, selection } of this.data) {
      if (modelId === item.modelId) {
        const idx = selection.indexOf(item.dbId);
        if (idx !== -1) {
          selection.splice(idx, 1);
          return this.updateComputed();
        }
        return Promise.resolve();
      }
    }
    return Promise.resolve();
  }

  selectItem(item, viewer) {
    for (const { modelId } of this.data) {
      if (modelId === item.modelId) {
        const model = this.getModelByModelId(modelId);
        return viewer.select([item.dbId], model);
      }
    }
  }
  selectAll(viewer) {
    viewer.clearSelection();
    for (const { modelId, selection } of this.data) {
      const model = this.getModelByModelId(modelId);
      model.selector.setSelection(selection, model);
    }
  }
}
