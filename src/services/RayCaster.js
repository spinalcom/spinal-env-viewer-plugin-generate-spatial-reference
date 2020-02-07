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

/**
 * @export
 * @param {number} dbId
 * @param {Model} model
 * @param {{dbId: number[], model: Model}} models
 * @returns
 */
export async function cast(dbId, model, models) {
  let center = await getCenter(dbId, model);
  let ray = new window.THREE.Ray(center, new window.THREE.Vector3(0, 0, -1));
  const ids = [];
  const ms = [];
  for (const obj of models) {
    ids.push(...obj.dbId);
    ms.push(obj.model.id);
  }
  return window.spinal.SpinalForgeViewer.viewerManager.viewer.impl.rayIntersect(ray, true, ids, ms);
}

function getCenter(dbId, model) {
  let center = new window.THREE.Vector3();
  return getFragIds(dbId, model)
    .then(ids => {
      if (!Array.isArray(ids)) { ids = [ids]; }
      return getModifiedWorldBoundingBox(ids, model);
    })
    .then(bbox => bbox.center(center));
}

function getFragIds(dbId, model) {
  return new Promise((resolve) => {
    let it = model.getInstanceTree();
    it.enumNodeFragments(dbId, resolve, false);
  });
}

function getModifiedWorldBoundingBox(fragIds, model) {

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

