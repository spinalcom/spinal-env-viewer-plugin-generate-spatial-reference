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

export function getIntersects(manager, bimSelected, arcModels) {
  let ids = [];
  let interPromsLst = [];
  for (let i = 0; i < bimSelected.length; i++) {
    ids.push(
      ...bimObjectManagerService.getLeafDbIds(
        bimSelected[i].model,
        bimSelected[i].selection
      ).selection
    );
    for (let j = 0; j < ids.length; j++) {
      interPromsLst.push(
        castToFloorFinish(ids[j], bimSelected[i].model, arcModels, manager)
      );
    }
    ids = [];
  }
  return Promise.all(interPromsLst);
}

async function castToFloorFinish(id, model, arcMod, manager) {
  let turn = 0;
  let intersect = { dbId: id };
  const arcModels = await Promise.all(arcMod.map(name => getModelByName(manager, name)));

  try {
    intersect = await cast(intersect.dbId, model, arcModels);
  } catch (e) {
    console.error("castToFloorFinish error", e);
    intersect = null;
  } finally {
    console.log("intersect", id, intersect, turn++);
  }

  // do {
  //   try {
  //     intersect = await cast(intersect.dbId, model, arcModels);
  //   } catch (e) {
  //     console.error("castToFloorFinish error", e);
  //     intersect = null;
  //   } finally {
  //     console.log("intersect", id, intersect, turn++);
  //   }
  // } while (
  //   intersect !== null ||
  //   (intersect.intersect === null &&
  //     isFloorFinish(arcModels, intersect))
  // );
  return { id, model, intersect };
}

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
  };
}
