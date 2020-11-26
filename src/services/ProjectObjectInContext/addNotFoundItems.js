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
const CONTEXT_NOT_FOUND_NAME = "Projection Error";
const CONTEXT_NOT_FOUND_TYPE = "ProjectionError";
const CONTEXT_NOT_FOUND_RELATION = "ProjectionErrorHasDate";
const NOT_FOUND_DATE_TYPE = "ProjectionErrorDate";

import {
  SpinalGraphService, SPINAL_RELATION_LST_PTR_TYPE, SpinalContext, SpinalNode
} from "spinal-env-viewer-graph-service";

import { GEO_EQUIPMENT_RELATION } from '../../constant';
function getContext() {
  const context = SpinalGraphService.getContext(CONTEXT_NOT_FOUND_NAME);
  if (!context) {
    const graph = SpinalGraphService.getGraph();
    const contextNode = new SpinalContext(CONTEXT_NOT_FOUND_NAME, CONTEXT_NOT_FOUND_TYPE);
    graph.addContext(contextNode);
    SpinalGraphService._addNode(contextNode);
    return contextNode;
  }
  return context;
}

function addDate(context) {
  const t = new Date();
  const name = t.toLocaleString();
  const child = new SpinalNode(name, NOT_FOUND_DATE_TYPE);
  context.addChildInContext(child, CONTEXT_NOT_FOUND_RELATION, SPINAL_RELATION_LST_PTR_TYPE);
  SpinalGraphService._addNode(child);
  return child;
}

function pushToData(data, dbId, model) {
  for (const item of data) {
    if (item.model.id === model.id) {
      item.dbIds.add(dbId);
      return;
    }
  }
  data.push({
    model,
    dbIds: new Set([dbId])
  });
}

function getDiffSelection(selection, intersect) {
  const data = [];
  for (const { model, dbId } of selection) {
    for (const id of dbId) {
      let found = false;
      for (const inter of intersect) {
        for (const { origin } of inter) {
          if (origin.modelId === model.id && origin.dbId === id.dbId) {
            found = true;
            break;
          }
        }
      }
      if (!found) {
        pushToData(data, id.dbId, model);
      }
    }
  }
  return data;
}

function getBulkProperties(model, dbIds, props = { propFilter: ["name"] }) {
  return new Promise(resolve => {
    model.getBulkProperties(
      Array.from(dbIds),
      props,
      result => {
        result.forEach(e => {
          e.model = model;
        });
        resolve(result);
      });
  });
}
function getItemNames(data) {
  const res = [];
  for (const { model, dbIds } of data) {
    res.push(getBulkProperties(model, dbIds));
  }
  return Promise.all(res).then((arr) => {
    const result = [];
    return result.concat.apply(result, arr);
  });
}
async function addBIMObject(context, parent, dbId, bimObjName, model) {
  try {
    const bimObject = await window.spinal.BimObjectService.getBIMObject(dbId, model);
    if (typeof bimObject !== "undefined") {
      const nodeBimObject = SpinalGraphService.getRealNode(bimObject.id.get());
      await parent.addChildInContext(nodeBimObject, GEO_EQUIPMENT_RELATION,
        SPINAL_RELATION_LST_PTR_TYPE, context);
      return bimObject;
    }
    const child = await window.spinal.BimObjectService.createBIMObject(dbId, bimObjName, model);
    const nodeBimObject = SpinalGraphService.getRealNode(child.id.get());
    await parent.addChildInContext(nodeBimObject, GEO_EQUIPMENT_RELATION,
      SPINAL_RELATION_LST_PTR_TYPE, context);
    return child;
  } catch (e) {
    console.log('Error addBIMObject', dbId, bimObjName, model);
    console.error(e);
    throw e;
  }
}

export async function addNotFoundItems(selection, intersect) {
  const diff = getDiffSelection(selection, intersect);
  const data = await getItemNames(diff);
  if (data.length > 0) {
    const batchSize = 10;
    let turn = 0;
    let j = 0;
    const context = getContext();
    const nodeDate = addDate(context);
    while (j < data.length) {
      let proms = [];
      for (j = turn * batchSize; j < ((turn + 1) * batchSize) && j < data.length; j++) {
        const { model, dbId, name } = data[j];
        proms.push(addBIMObject(context, nodeDate, dbId, name, model));
      }
      try {
        // eslint-disable-next-line no-await-in-loop
        await waitForFileSystem(proms);
      } catch (obj) {
        console.log('batch fail => promise', proms);
      }
      turn++;
    }
  }
}


/**
 * Waits for the nodes to be in the FileSystem.
 * @param {Array<Promise>} promises Array of promises containing the nodes
 * @returns {Promise<any>} An empty promise
 */
async function waitForFileSystem(promises) {
  let nodes = await Promise.all(promises);
  const realNodes = nodes.map(item => {
    if (item && item.hasOwnProperty('id')) {
      return SpinalGraphService.getRealNode(item.id.get());
    }
  });
  return new Promise(resolve => {
    let inter = setInterval(() => {
      for (const node of realNodes) {
        if (node && typeof window.FileSystem._objects[node._server_id] === "undefined") {
          return;
        }
      }
      clearInterval(inter);
      resolve(nodes);
    }, 500);
  });
}
