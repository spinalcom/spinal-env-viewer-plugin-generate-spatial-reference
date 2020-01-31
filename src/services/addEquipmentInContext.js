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

import { SpinalGraphService } from "spinal-env-viewer-graph-service";

export async function addEquipmentInContext(manager, equipmentInfo) {
  const context = manager.context;
  let fail = [];
  const batchSize = 10;
  let turn = 0;
  let j = 0;
  let countOK = 0;

  while (j < equipmentInfo.length) {
    let proms = [];
    for (j = turn * batchSize; j < ((turn + 1) * batchSize) && j < equipmentInfo.length; j++) {
      const info = equipmentInfo[j];
      if (!info.roomId) {
        fail.push(info);
        continue;
      }
      // eslint-disable-next-line no-await-in-loop
      let roomId = await manager.getRoomIdFromDbId(info.roomId);
      let model = info.model;
      // eslint-disable-next-line no-await-in-loop
      let bimObj = await getProps(info.bimObject, model);
      if (typeof roomId !== "undefined") {
        proms.push(
          addBIMObject(
            context.info.id.get(),
            roomId,
            info.bimObject,
            bimObj.name,
            model
          ));
      } else { fail.push(info); }
    }
    try {
      // eslint-disable-next-line no-await-in-loop
      await waitForFileSystem(proms);
      countOK += proms.length;
    } catch (obj) {
      console.log('batch fail');
      console.log('batch fail => promise', proms);
    }
    turn++;
  }

  if (fail.length > 0) {
    console.error(
      `${fail.length} items failed to be added in Local`,
      fail
    );
  }

  const res = {
    total: equipmentInfo.length,
    Succcess: countOK,
    failLen: fail.length,
    fail
  };
  console.log(`addEquipmentInContext done`, res);
  return res;
}

function addBIMObject(contextId, roomId, bimObj, bimObjName, model) {
  try {
    return window.spinal.BimObjectService.addBIMObject(contextId, roomId, bimObj, bimObjName, model);
  } catch (e) {
    console.log('Error addBIMObject', contextId, roomId, bimObj, bimObjName, model);
    return e;
  }
}




function getProps(dbId, model) {
  return new Promise((resolve, reject) => {
    model.getProperties(dbId, resolve, reject);
  });
}

/**
 * Waits for the nodes to be in the FileSystem.
 * @param {Array<Promise>} promises Array of promises containing the nodes
 * @returns {Promise<any>} An empty promise
 */
async function waitForFileSystem(promises) {
  console.log("waitForFileSystem", promises.length);
  let nodes = await Promise.all(promises);
  const realNodes = nodes.map(item => {
    if (item && item.hasOwnProperty('id')) {
      return SpinalGraphService.getRealNode(item.id.get());
    }
  });
  console.log("waitForFileSystem after promise.all", realNodes);
  return new Promise(resolve => {
    let inter = setInterval(() => {
      console.log("in interval");
      for (const node of realNodes) {
        if (node && typeof window.FileSystem._objects[node._server_id] === "undefined") {
          return;
        }
      }
      console.log("in interval RESOLVED");
      clearInterval(inter);
      resolve(nodes);
    }, 500);
  });
}
