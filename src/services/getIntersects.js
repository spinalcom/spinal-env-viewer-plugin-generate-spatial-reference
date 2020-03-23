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

import { bimObjectManagerService } from "spinal-env-viewer-bim-manager-service";
import { cast } from './RayCaster';

// export function getIntersects(manager, bimSelected, arcModels) {
//   let ids = [];
//   let interPromsLst = [];
//   for (let i = 0; i < bimSelected.length; i++) {
//     ids.push(
//       ...bimObjectManagerService.getLeafDbIds(
//         bimSelected[i].model,
//         bimSelected[i].selection
//       ).selection
//     );
//     for (let j = 0; j < ids.length; j++) {
//       interPromsLst.push(
//         castToFloorFinish(ids[j], bimSelected[i].model, arcModels, manager)
//       );
//     }
//     ids = [];
//   }
//   return Promise.all(interPromsLst);
// }

function pushToModel(targetArray, ids, model) {
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

export async function getIntersects(manager, bimSelected, arcModels) {
  console.log("getIntersects", manager, bimSelected, arcModels);

  const selection = [];
  for (const bimSelect of bimSelected) {
    const ids = bimObjectManagerService.getLeafDbIds(
      bimSelect.model,
      bimSelect.selection
    ).selection;
    pushToModel(selection, ids, bimSelect.model);
  }
  console.log("getIntersects selection", selection);


  const to = await Promise.all(arcModels.map(name => getModelByName(manager, name)));
  console.log("getIntersects to", to);


  const intersects = await cast(selection, to, window.spinal.ForgeViewer.viewer);

  console.log("intersects", intersects);
}



// for (let i = 0; i < bimSelected.length; i++) {
//   ids.push(
//     ...bimObjectManagerService.getLeafDbIds(
//       bimSelected[i].model,
//       bimSelected[i].selection
//     ).selection
//   );
//   for (let j = 0; j < ids.length; j++) {
//     interPromsLst.push(
//       castToFloorFinish(ids[j], bimSelected[i].model, arcModels, manager)
//     );
//   }
//   ids = [];
// }
// return Promise.all(interPromsLst);

// async function castToFloorFinish(id, model, arcMod, manager) {
//   let turn = 0;
//   let intersect = { dbId: id };
//   const arcModels = await Promise.all(arcMod.map(name => getModelByName(manager, name)));

//   try {
//     intersect = await cast(intersect.dbId, model, arcModels);
//   } catch (e) {
//     console.error("castToFloorFinish error", e);
//     intersect = null;
//   } finally {
//     console.log("intersect", id, intersect, turn++);
//   }

//   // do {
//   //   try {
//   //     intersect = await cast(intersect.dbId, model, arcModels);
//   //   } catch (e) {
//   //     console.error("castToFloorFinish error", e);
//   //     intersect = null;
//   //   } finally {
//   //     console.log("intersect", id, intersect, turn++);
//   //   }
//   // } while (
//   //   intersect !== null ||
//   //   (intersect.intersect === null &&
//   //     isFloorFinish(arcModels, intersect))
//   // );
//   return { id, model, intersect };
// }

// function isFloorFinish(arcModels, intersect) {
//   for (const model of arcModels) {
//     if (model === intersect.model) {
//       return model.dbId.includes(intersect.dbId);
//     }
//   }
//   return false;
// }
async function getModelByName(manager, name) {
  const model = window.spinal.BimObjectService.mappingNameByModel[name];
  return {
    model,
    dbId: await manager.getFloorFinishId(model)
    // dbId: await Promise.resolve([6630, 10122, 10131, 10141, 10150,
    //   10160, 10170, 10183, 10194, 10208, 10217, 10271, 10321, 10334, 10346,
    //   10362, 10369, 10376, 10383, 10390, 10397, 10404, 10413, 10423, 10431,
    //   10440, 10450, 10460, 10469, 10478, 10488, 10498, 10508, 10517, 10525,
    //   10535, 10544, 10553, 10564, 10578, 10587, 10598, 10609, 10616, 10623,
    //   10630, 10641, 10652, 10661, 10671, 10678, 10689, 10700, 10709, 10718,
    //   10726, 10735, 10744, 10755, 10764, 10773, 10783, 10793, 10803, 10813,
    //   10823, 10832, 10841, 10850, 10858, 10867, 10876, 10885, 10895, 10904,
    //   10913, 10922, 10931, 10944, 10955, 10966, 10976, 10986, 10996, 11006,
    //   11014, 11024, 11034, 11067, 11078, 11089, 11100, 11111, 11118, 11129,
    //   11140, 11151, 11160, 11171])
  };
}
