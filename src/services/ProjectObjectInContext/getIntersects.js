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

import { cast } from './RayCaster';
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import {
  GEO_SITE_RELATION,
  GEO_BUILDING_RELATION,
  GEO_FLOOR_RELATION,
  GEO_ROOM_RELATION,
  GEO_ZONE_RELATION,
  GEO_ROOM_TYPE,
  GEO_REFERENCE_ROOM_RELATION,
  GEO_EQUIPMENT_TYPE
} from '../../constant';

import {
  isProjectionGroupItems,
  transformRtzToXyz,
  getModelByModelId,
  getLeafDbIdsByModel
} from './ProjectItemService';

function pushToModel(targetArray, ids, model, offset) {
  const isFocus = ids.length === 1;
  for (const obj of targetArray) {
    if (obj.model === model) {
      for (const id of ids) {
        const findItem = obj.dbId.find((a) => a.dbId === id);
        if (findItem === undefined) {
          obj.dbId.push({ dbId: id, offset, isFocus });
        } else if (isFocus === true && findItem.isFocus === false) {
          findItem.isFocus = true;
          findItem.offset = offset;
        }
      }
      return;
    }
  }

  const idSet = [];
  for (const id of ids) {
    idSet.push({ dbId: id, offset, isFocus });
  }
  targetArray.push({
    model,
    dbId: idSet
  });
}
function pushToModel2(targetArray, ids, model) {
  for (const obj of targetArray) {
    if (obj.model === model) {
      for (const id of ids) {
        obj.dbId.add(id);
      }
      return;
    }
  }

  const idSet = new Set();
  for (const id of ids) {
    idSet.add(id);
  }
  targetArray.push({
    model,
    dbId: idSet
  });
}

export async function getIntersects(bimSelected, contextId) {
  console.log("getIntersects");
  const selection = [];
  for (const bimSelect of bimSelected) {
    const _offset = transformRtzToXyz(bimSelect.offset);
    if (isProjectionGroupItems(bimSelect)) {
      for (const itm of bimSelect.computedData) {
        const model = getModelByModelId(itm.modelId);
        const ids = getLeafDbIdsByModel(model, itm.dbId);
        if (ids.length === 0) continue;
        pushToModel(selection, ids, model, _offset);
      }
    } else {
      const model = getModelByModelId(bimSelect.modelId);
      const ids = getLeafDbIdsByModel(model, bimSelect.dbId);
      pushToModel(selection, ids, model, _offset);
    }
  }
  const to = await getRoomRef(contextId);
  console.log("to ->", to);

  const intersects = await cast(selection, to, window.spinal.ForgeViewer.viewer);
  return { selection, intersects };
}

async function getRoomRef(contextId) {
  const result = [];
  const contextRNode = SpinalGraphService.getRealNode(contextId);
  const relNames = [
    GEO_SITE_RELATION,
    GEO_BUILDING_RELATION,
    GEO_FLOOR_RELATION,
    GEO_ROOM_RELATION,
    GEO_ZONE_RELATION
  ];

  // get rooms nodes
  const rooms = await contextRNode.find(relNames, (node) => {
    return node.getType().get() === GEO_ROOM_TYPE;
  });

  // populate rooms SpinalGraphService
  rooms.forEach(room => SpinalGraphService._addNode(room));

  // get refObjet from rooms nodes
  const refObjsProm = rooms.map(room => {
    return room.getChildren([GEO_REFERENCE_ROOM_RELATION]);
  });
  const refObjs = await Promise.all(refObjsProm);

  // merge result by model
  // format {model, dbId: number[] }[]
  for (const refs of refObjs) {
    for (const ref of refs) {
      if (ref.getType().get() === GEO_EQUIPMENT_TYPE) {
        SpinalGraphService._addNode(ref);
        const bimFileId = ref.info.bimFileId.get();
        const model = window.spinal.BimObjectService.getModelByBimfile(bimFileId);
        if (model) {
          const dbId = ref.info.dbid.get();
          pushToModel2(result, [dbId], model);
        }
      }
    }
  }
  return result;
}


// async function getModelByName(manager, configName, name) {
//   const model = window.spinal.BimObjectService.mappingNameByModel[name];
//   return {
//     model,
//     dbId: await manager.getFloorFinishId(configName, model)
//     // dbId: await Promise.resolve([6630, 10122, 10131, 10141, 10150,
//     //   10160, 10170, 10183, 10194, 10208, 10217, 10271, 10321, 10334, 10346,
//     //   10362, 10369, 10376, 10383, 10390, 10397, 10404, 10413, 10423, 10431,
//     //   10440, 10450, 10460, 10469, 10478, 10488, 10498, 10508, 10517, 10525,
//     //   10535, 10544, 10553, 10564, 10578, 10587, 10598, 10609, 10616, 10623,
//     //   10630, 10641, 10652, 10661, 10671, 10678, 10689, 10700, 10709, 10718,
//     //   10726, 10735, 10744, 10755, 10764, 10773, 10783, 10793, 10803, 10813,
//     //   10823, 10832, 10841, 10850, 10858, 10867, 10876, 10885, 10895, 10904,
//     //   10913, 10922, 10931, 10944, 10955, 10966, 10976, 10986, 10996, 11006,
//     //   11014, 11024, 11034, 11067, 11078, 11089, 11100, 11111, 11118, 11129,
//     //   11140, 11151, 11160, 11171])
//   };
// }
