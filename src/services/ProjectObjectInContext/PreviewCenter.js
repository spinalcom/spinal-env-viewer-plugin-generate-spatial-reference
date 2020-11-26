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
  getPointOffset,
  getLeafDbIdsByModelId,
  getBBoxAndMatrixs

} from './ProjectItemService';
import throttle from "lodash.throttle";
const THREE = window.THREE;
let current = null;
let sphereMat = null;
export const previewItem = throttle(_previewItem, 1000);

export async function _previewItem(item, offset, mode, viewer) {
  const _offset = transformRtzToXyz(offset);
  if (current === null) {
    createNew(item, _offset);
  }
  try {
    current.offset = _offset;
    await populateItemToShow(item, mode, viewer);
    await getBBoxAndMatrixs(current, viewer);
    for (const itm of current.itemToShow) {
      updatePointOffset(itm, _offset, viewer);
    }
    viewer.impl.invalidate(true, true, true);
  } catch (e) {
    console.error(e);
  }
}

export function stopPreview(viewer) {
  const curr = current;
  const prom = [];
  if (curr === null) return Promise.resolve();
  curr.lock = true;
  for (const itm of curr.itemToShow) {
    prom.push(hideItem(itm, viewer));
  }
  viewer.impl.invalidate(true, true, true);
  return Promise.all(prom).finally(() => {
    current = null;
    viewer.impl.invalidate(true, true, true);
  });
}

function createNew(item, offset) {
  const curr = {
    item,
    mode: 0,
    offset,
    lock: false,
    itemToShow: [] // {modelId, dbId}[]
  };
  current = curr;
}

function populateItemToShow(item, mode, viewer) {
  const curr = current;
  const prom = [];
  console.log("mode.mode", curr.mode, mode);
  if (curr.mode !== mode) {
    if (mode === 0) {
      for (const itm of curr.itemToShow) {
        prom.push(hideItem(itm, viewer));
      }
      curr.itemToShow = [];
      curr.mode = mode;
    } else if (mode === 1) {
      if (isProjectionGroupItems(item)) {
        const first = item.computedData[0];
        if (typeof first === "undefined") return;
        const ids = getLeafDbIdsByModelId(first.modelId, first.dbId);
        if (ids.length === 0) return;
        for (const itm of curr.itemToShow) {
          prom.push(hideItem(itm, viewer));
        }
        curr.itemToShow = [{ dbId: ids[0], modelId: first.modelId }];
      } else {
        const ids = getLeafDbIdsByModelId(item.modelId, item.dbId);
        if (ids.length === 0) return;
        for (const itm of curr.itemToShow) {
          prom.push(hideItem(itm, viewer));
        }
        curr.itemToShow = [{ dbId: ids[0], modelId: item.modelId }];
      }
    } else {
      if (isProjectionGroupItems(item)) {
        for (const itm of curr.itemToShow) {
          prom.push(hideItem(itm, viewer));
        }
        curr.itemToShow = [];
        for (const itm of item.computedData) {
          const ids = getLeafDbIdsByModelId(itm.modelId, itm.dbId);
          if (ids.length === 0) continue;
          for (const id of ids) {
            curr.itemToShow.push({ dbId: id, modelId: itm.modelId });
          }
        }
      } else {
        for (const itm of curr.itemToShow) {
          prom.push(hideItem(itm, viewer));
        }
        const ids = getLeafDbIdsByModelId(item.modelId, item.dbId);
        if (ids.length === 0) return;
        curr.itemToShow = [];
        for (const id of ids) {
          curr.itemToShow.push({ dbId: id, modelId: item.modelId });
        }
      }
    }
    curr.mode = mode;
  }
  return Promise.all(prom);
}

function hideItem(item, viewer) {
  viewer.impl.scene.remove(item.sphere);
  viewer.impl.scene.remove(item.line);

  return Promise.resolve();
}

function getSphereMat(viewer) {
  if (sphereMat === null) {
    sphereMat = new window.THREE.MeshPhongMaterial({ color: 0x00FF00 });
    viewer.impl.matman().addMaterial(
      'ADN-Material' + 'green', sphereMat, true);
  }
  return sphereMat;
}

function updatePointOffset(item, offset, viewer) {
  const matrixWorld = item.matrixWorld;
  const bbox = item.bbox;

  const bBoxCenter = bbox.center();
  const point = getPointOffset(bBoxCenter, offset, matrixWorld);

  const sphere = getOrCreateSphere(item, viewer);
  sphere.position.set(point.x, point.y, point.z);
  sphere.updateMatrix();

  const line = getOrCreateLine(item, bBoxCenter, viewer);
  line.geometry.verticesNeedUpdate = true;
}

function getOrCreateSphere(item, viewer) {
  if (typeof item.sphere === "undefined") {
    const material_green = getSphereMat(viewer);
    let sphere_geo = new THREE.SphereGeometry(0.3, 30, 30);
    var sphere_maxpt = new THREE.Mesh(sphere_geo, material_green);
    sphere_maxpt.matrixAutoUpdate = false;
    viewer.impl.scene.add(sphere_maxpt);
    item.sphere = sphere_maxpt;
  }
  return item.sphere;
}
function getOrCreateLine(item, bBoxCenter, viewer) {
  if (typeof item.line === "undefined") {
    var geometryLine = new THREE.Geometry();
    geometryLine.vertices.push(
      new THREE.Vector3(bBoxCenter.x, bBoxCenter.y, bBoxCenter.z),
      item.sphere.position
    );
    var material = new THREE.LineBasicMaterial({
      color: 0x00FF00
    });

    var line = new THREE.Line(geometryLine, material);
    viewer.impl.scene.add(line);
    item.line = line;
  }
  return item.line;
}



