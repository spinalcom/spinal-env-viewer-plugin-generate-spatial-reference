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

// array of {
//   origin: {dbId: 7934, modelId: 2, center: {…}}
//   intersections: { distance: 9.696686029434204, modelId: 2, dbId: 11560 }
// }

function getNearestIntersect(intersects) {
  if (intersects === 0) return undefined;
  let res = intersects[0];
  for (const intersect of intersects) {
    if (res.intersections.distance > intersect.intersections.distance) res = intersect;
  }
  return res;
}

function getModelByModelId(modelId) {
  const bimFileId = window.spinal.BimObjectService.mappingModelIdBimFileId[modelId].bimFileId;
  return window.spinal.BimObjectService.getModelByBimfile(bimFileId);
}

/* eslint-disable no-await-in-loop */
export async function getEquipmentInfo(manager, config, intersects) {
  let equipmentInfo = [];
  for (const spinalIntersections of intersects) {
    const spinalIntersection = getNearestIntersect(spinalIntersections);
    let bimObject = spinalIntersection.origin.dbId;
    let bimObjectModel = getModelByModelId(spinalIntersection.origin.modelId);
    let floor_finish = spinalIntersection.intersections.dbId;
    let floor_finishModel = getModelByModelId(spinalIntersection.intersections.modelId);

    // eslint-disable-next-line require-atomic-updates
    manager.modelArchi = await manager.getArchiModel(floor_finishModel, config.configName.get());
    let roomId = await manager.getRoomIdFromFloorFinish(floor_finish);
    equipmentInfo.push({
      bimObject,
      model: bimObjectModel,
      floor_finish,
      roomId
    });
  }
  return equipmentInfo;
}
