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

import { GEO_REFERENCE_ROOM_RELATION } from '../constant';

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

export async function getEquipmentInfo(intersects, contextId) {
  let equipmentInfo = [];
  /* eslint-disable no-await-in-loop */
  for (const spinalIntersections of intersects) {
    const spinalIntersection = getNearestIntersect(spinalIntersections);
    let bimObjectDbId = spinalIntersection.origin.dbId;
    let bimObjectModel = getModelByModelId(spinalIntersection.origin.modelId);
    let roomRefObjDbId = spinalIntersection.intersections.dbId;
    let roomRefObjModel = getModelByModelId(spinalIntersection.intersections.modelId);
    const refObjRef = await window.spinal.BimObjectService.getBIMObject(roomRefObjDbId, roomRefObjModel);
    const refObj = window.spinal.spinalGraphService.getRealNode(refObjRef.id.get());

    const rooms = await refObj.getParents(GEO_REFERENCE_ROOM_RELATION);
    rooms.filter((room) => {
      return room.contextIds.has(contextId);
    });

    equipmentInfo.push({
      bimObjectDbId,
      bimObjectModel,
      rooms
    });
  }
  return equipmentInfo;
}
