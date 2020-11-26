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

import {
  isProjectionGroupItems,
  transformRtzToXyz,
  getModelByModelId,
  getLeafDbIdsByModel
} from './ProjectItemService';


function pushToModel(targetArray, error, bimSelect, ids, model, offset) {
  const isFocus = ids.length === 1;
  for (const obj of targetArray) {
    if (obj.model === model) {
      for (const id of ids) {
        const findItem = obj.dbId.find((a) => a.dbId === id);
        if (findItem === undefined) {
          obj.dbId.push({ dbId: id, offset, isFocus, bimSelect });
        } else {
          if (isFocus === true && findItem.isFocus === false) {
            findItem.isFocus = true;
            findItem.offset = offset;
            findItem.bimSelect = bimSelect;
          } else {
            error.push({
              orig: findItem,
              target: { dbId: id, offset, isFocus, bimSelect }
            });
          }
        }
      }
      return;
    }
  }

  const idSet = [];
  for (const id of ids) {
    idSet.push({ dbId: id, offset, isFocus, bimSelect });
  }
  targetArray.push({
    model,
    dbId: idSet
  });
}

export function testUniqueItem(bimSelected) {
  console.log("testUniqueItem");
  const selection = [];
  const error = [];
  for (const bimSelect of bimSelected) {
    const _offset = transformRtzToXyz(bimSelect.offset);
    if (isProjectionGroupItems(bimSelect)) {
      for (const itm of bimSelect.computedData) {
        const model = getModelByModelId(itm.modelId);
        const ids = getLeafDbIdsByModel(model, itm.dbId);
        if (ids.length === 0) continue;
        pushToModel(selection, error, bimSelect, ids, model, _offset);
      }
    } else {
      const model = getModelByModelId(bimSelect.modelId);
      const ids = getLeafDbIdsByModel(model, bimSelect.dbId);
      pushToModel(selection, error, bimSelect, ids, model, _offset);
    }
  }
  return error;
}
