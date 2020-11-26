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
import ProjectionGroupItems from './ProjectionGroupItems';
import ProjectionItem from './ProjectionItem';

export function addGroup(list, name) {
  list.push(new ProjectionGroupItems(name));
}

export function isProjectionGroupItems(item) {
  return item instanceof ProjectionGroupItems;
}

export async function addSelectionToList(list, viewer) {
  const aggregateSelection = viewer.getAggregateSelection();
  for (let select of aggregateSelection) {
    // eslint-disable-next-line no-await-in-loop
    const props = await getBulkProperties(select.model, select.selection);
    const prom = [];
    for (const prop of props) {
      prom.push(addProjectItem(list, prop));
    }
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(prom);
  }
}

// export async function addSelectionToGroup(list, item, viewer) {
//   const aggregateSelection = viewer.getAggregateSelection();
//   const prom = [];
//   const toDel = [];

//   for (let select of aggregateSelection) {
//     // eslint-disable-next-line no-await-in-loop
//     const props = await getBulkProperties(select.model, select.selection);
//     for (const prop of props) {
//       for (const grp of list) {
//         if (isProjectionGroupItems(grp)) {
//           if (item === grp) {
//             prom.push(grp.deleteItem(prop));
//           } else {
//             prom.push(item.getAndMergeSelection(viewer));
//           }
//         } else if (prop.modelId === grp.modelId && prop.dbId === grp.dbId) {
//           toDel.push(grp);
//         }
//       }
//     }
//   }
//   for (const del of toDel) {
//     let i = 0;
//     while (list[i]) {
//       if (del.uid === list[i]) {
//         list.splice(i, 1);
//       } else {
//         i++;
//       }
//     }
//   }
//   await Promise.all(prom);
// }

function addProjectItem(list, prop) {
  let found = false;
  const promRemove = [];
  for (const item of list) {
    if (item instanceof ProjectionItem &&
      item.modelId === prop.modelId && item.dbId === prop.dbId) {
      found = true;
      continue;
    } else if (item instanceof ProjectionGroupItems) {
      promRemove.push(item.deleteItem(prop));
    }
  }
  if (!found) {
    list.push(
      new ProjectionItem(prop.name, prop.modelId, prop.dbId, prop.properties)
    );
  }
  return Promise.all(promRemove);
}

export function getBulkProperties(modelId, dbIds, props = { propFilter: ["name"] }) {
  let model = modelId;
  if (typeof modelId === "string") model = getModelByModelId(modelId);
  return new Promise(resolve => {
    model.getBulkProperties(
      Array.from(dbIds),
      props,
      result => {
        result.forEach(e => {
          e.id = `${model.id}-${e.dbId}`;
          e.modelId = model.id;
        });
        resolve(result);
      });
  });
}

export function getModelByModelId(modelId) {
  for (const bimFileId in window.spinal.BimObjectService.mappingBimFileIdModelId) {
    if (window.spinal.BimObjectService.mappingBimFileIdModelId.hasOwnProperty(bimFileId)) {
      const mappingBimFileIdModelId = window.spinal.BimObjectService.mappingBimFileIdModelId[bimFileId];
      if (mappingBimFileIdModelId.modelId === modelId) {
        for (const { model } of mappingBimFileIdModelId.modelScene) {
          if (model.id === modelId) return model;
        }
      }
    }
  }
}


export function transformRtzToXyz({ r, t, z }) {
  const angle = t * Math.PI / 180;
  const x = r * Math.cos(angle);
  const y = r * Math.sin(angle);
  return { x, y, z };
}

export function getFragIds(dbId, model) {
  let promise = (resolve, reject) => {
    let it = model.getInstanceTree();
    const ids = [];
    it.enumNodeFragments(dbId, (res) => {
      ids.push(res);
    }, false);
    // wait 1s or 2 if not yet done
    setTimeout(() => {
      if (ids.length === 0) {
        setTimeout(() => {
          if (ids.length === 0) {
            return reject();
          }
          resolve(ids);
        }, 1000);
        return;
      }
      resolve(ids);
    }, 500);
  };
  return new Promise(promise);
}
export function getPointOffset(orig, offset, matrixWorld) {
  const inverseMatrix = new THREE.Matrix4();
  const point = new THREE.Vector3(orig.x, orig.y, orig.z);
  const _offset = new THREE.Vector3(offset.x, offset.y, offset.z);
  inverseMatrix.getInverse(matrixWorld);
  point.applyMatrix4(inverseMatrix);
  point.add(_offset);
  point.applyMatrix4(matrixWorld);
  return point;
}

export function getLeafDbIdsByModelId(modelId, dbIds) {
  const model = getModelByModelId(modelId);
  return bimObjectManagerService.getLeafDbIds(model, dbIds).selection;
}
export function getLeafDbIdsByModel(model, dbIds) {
  return bimObjectManagerService.getLeafDbIds(model, dbIds).selection;
}

export function getModifiedWorldBoundingBox(fragIds, model) {
  //fragments list array
  var fragList = model.getFragmentList();
  const fragbBox = new window.THREE.Box3();
  const nodebBox = new window.THREE.Box3();
  fragIds.forEach(function (fragId) {
    fragList.getWorldBounds(fragId, fragbBox);
    nodebBox.union(fragbBox);
  });
  return nodebBox;
}
async function getBBoxAndMatrix(dbId, model, viewer) {
  let ids = await getFragIds(dbId, model);

  const matrixWorld = viewer.impl.getRenderProxy(model, ids[0]).matrixWorld;
  const bbox = getModifiedWorldBoundingBox(ids, model);
  return { matrixWorld: matrixWorld.clone(), bbox };
}
export function getBBoxAndMatrixs(current, viewer) {
  const prom = [];
  for (const item of current.itemToShow) {
    if (typeof item.meshs === "undefined" || typeof item.bbox === "undefined") {
      const model = getModelByModelId(item.modelId);
      prom.push(getBBoxAndMatrix(item.dbId, model, viewer).then(
        ({ matrixWorld, bbox }) => {
          item.matrixWorld = matrixWorld;
          item.bbox = bbox;
        }
      ));
    }
  }
  return Promise.all(prom);
}
