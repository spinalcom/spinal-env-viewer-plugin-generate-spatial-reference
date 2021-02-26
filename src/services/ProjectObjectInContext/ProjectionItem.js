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
//   data: IDataItem;
//   computed: IComputedItem;
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
//     "properties": []
//   }]
// }

export default class ProjectionItem {
  constructor(name, modelId, dbId, externalId, properties) {
    this.name = name;
    this.offset = { r: 0, t: 0, z: 0 };
    this.uid = `${Date.now()}-${Math.round(Math.random()*10000)}-${Math.round(Math.random()*10000)}`;
    this.modelId = modelId;
    this.externalId = externalId;
    this.dbId = dbId;
    this.id = `${modelId}-${dbId}`;
    this.properties = properties;
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
  selectItem(viewer) {
    const model = this.getModelByModelId(this.modelId);
    return viewer.select([this.dbId], model);
  }
}
