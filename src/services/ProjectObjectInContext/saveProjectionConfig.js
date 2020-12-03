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

const CONFIG_NAME = "ProjectionConfig";
const CONFIG_TYPE = "ProjectionConfig";
const CONFIG_RELATION = "hasProjectionConfig";
import {
  SpinalGraphService,
  SpinalNode,
  SPINAL_RELATION_LST_PTR_TYPE
} from "spinal-env-viewer-graph-service";
import { Lst } from 'spinal-core-connectorjs_type';
import ProjectionGroupItems from './ProjectionGroupItems';
import ProjectionItem from './ProjectionItem';

async function getConfig(contextId) {
  const context = SpinalGraphService.getRealNode(contextId);
  let configNodes = await context.getChildren(CONFIG_RELATION);
  if (configNodes.length > 0) return configNodes[0].getElement();
  const config = new Lst();
  const configNode = new SpinalNode(CONFIG_NAME, CONFIG_TYPE, config);
  context.addChild(configNode, CONFIG_RELATION, SPINAL_RELATION_LST_PTR_TYPE);
  return configNode;
}

export async function getProjectionConfig(contextId) {
  const cfg = await getConfig(contextId);
  const res = [];
  for (let idx = 0; idx < cfg.length; idx++) {
    const item = cfg[idx];
    let itm;
    if (typeof item.modelId === "undefined") {
      // is a group
      itm = new ProjectionGroupItems(item.name.get());
      itm.offset = item.offset.get();
      itm.uid = item.uid.get();
      itm.data = item.data.get();
      itm.computedData = item.computedData.get();
    } else {
      itm = new ProjectionItem(item.name.get(), item.modelId.get(),
        item.dbId.get(), item.properties.get());
      itm.name = item.name.get();
      itm.offset = item.offset.get();
      itm.uid = item.uid.get();
      itm.modelId = item.modelId.get();
      itm.dbId = item.dbId.get();
      itm.id = item.id.get();
      itm.properties = item.properties.get();
    }
    res.push(itm);
  }
  return res;
  // return cfg.get();
}

export async function saveProjectionConfig(contextId, datas) {
  const config = await getConfig(contextId);
  config.clear();
  for (const data of datas) {
    config.push(data);
  }
}
