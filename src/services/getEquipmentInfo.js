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

export async function getEquipmentInfo(manager, intersects) {
  let equipmentInfo = [];
  for (const spinalIntersection of intersects) {
    let bimObject = spinalIntersection.id;
    let bimObjectModel = spinalIntersection.model;
    if (!spinalIntersection.intersect) {
      // No intersect found
      equipmentInfo.push({
        bimObject,
        model: bimObjectModel,
        floor_finish: null,
        roomId: null,
      });
      continue;
    }
    let floor_finish = spinalIntersection.intersect.dbId;
    let floor_finishModel = spinalIntersection.intersect.model;
    manager.modelArchi = await manager.getArchiModel(floor_finishModel);
    let roomId = await manager.getRoomIdFromFloorFinish(floor_finish);
    equipmentInfo.push({
      bimObject,
      model: bimObjectModel,
      floor_finish,
      roomId,
    });
  }
  return equipmentInfo
}
