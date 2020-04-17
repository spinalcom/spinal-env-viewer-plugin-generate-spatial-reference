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

// import { enumMeshTriangles } from './rayUtils/enumMeshTriangles';
import { RayWorkerManager } from './rayUtils/workerManager';
import q from "q";

function getCenterObjects(array) {
  const res = [];
  for (const obj of array) {
    for (const dbId of obj.dbId) {
      let center = getCenter(dbId, obj.model);
      res.push(center);
    }
  }
  return Promise.all(res);
}


async function getMeshsData(array, viewer) {
  const res = [];
  for (const { model, dbId } of array) {
    for (const dbIdItem of dbId) {
      try {
        // eslint-disable-next-line no-await-in-loop
        let ids = await getFragIds(dbIdItem, model);
        if (!Array.isArray(ids)) { ids = [ids]; }
        const meshs = ids.map(fragId => viewer.impl.getRenderProxy(model, fragId));
        const bbox = getModifiedWorldBoundingBox(ids, model);
        let center = new window.THREE.Vector3();
        bbox.center(center);
        const dataMesh = meshs.map(mesh => {
          return {
            geometry: {
              vb: mesh.geometry.vb,
              vblayout: mesh.geometry.vblayout,
              attributes: mesh.geometry.attributes,
              ib: mesh.geometry.ib,
              indices: mesh.geometry.indices,
              index: mesh.geometry.index,
              offsets: mesh.geometry.offsets,
              vbstride: mesh.geometry.vbstride
            },
            matrixWorld: mesh.matrixWorld,
            center,
            bbox: {
              min: bbox.min,
              max: bbox.max
            }
          };
        });
        res.push({
          dataMesh,
          dbId: dbIdItem,
          modelId: model.id
        });
      } catch (e) {
        console.log("getMeshsData no fragId in", dbIdItem);
        continue;
      }
    }
  }
  return res;
}


/**
 * @export
 * @param {number} dbId
 * @param {{dbId: number[], model: Model}} models
 * @param {{dbId: number[], model: Model}} models
 * @returns
 */
export async function cast(from, to, viewer) {
  try {
    const [centerPoints, geometries] = await Promise.all([getCenterObjects(from), getMeshsData(to, viewer)]);
    console.log("cast", centerPoints, geometries);

    const rayWorkerManager = RayWorkerManager.getInstance();

    return rayWorkerManager.work({ centerPoints, geometries }); // send the worker a message
  } catch (e) {
    console.error(e);
    throw e;
  }
}

function getCenter(dbId, model) {
  let center = new window.THREE.Vector3();
  return getFragIds(dbId, model)
    .then(ids => {
      if (!Array.isArray(ids)) { ids = [ids]; }
      return getModifiedWorldBoundingBox(ids, model);
    })
    .then(bbox => {
      return {
        dbId, modelId: model.id,
        center: bbox.center(center)
      };
    });
}

function getFragIds(dbId, model) {
  const defer = q.defer();
  let it = model.getInstanceTree();
  it.enumNodeFragments(dbId, (res) => {
    defer.resolve(res);
  }, false);
  return defer.promise.timeout(500, `no fragId for ${dbId}`);
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

// window.testCast = async function () {
//   // const testObj = [{
//   //   dbId: [11589, 11512],
//   //   model: NOP_VIEWER.model
//   // }];
//   const viewer = window.NOP_VIEWER;
//   const model = window.NOP_VIEWER.model;
//   const dbid = 11327; // clim

//   const dbidFloor = 11899; // floor
//   const dbidSalle = 10217; // piece

//   var distance;


//   let center = await getCenter(dbid, model);
//   console.log("center", center);

//   let raycaster = new window.THREE.Raycaster();
//   raycaster.set(center, new window.THREE.Vector3(0, 0, -1));
//   var precision = raycaster.precision;
//   // const dbIds = [dbidFloor];

//   const intersects = [];
//   // const _iterator = model.getIterator();
//   // let res = _iterator.rayCast(raycaster, intersects, dbIds);




//   // var res = model.rayIntersect(raycaster, false, [dbidFloor, dbidSalle]);


//   for (const fDbId of [dbidFloor, dbidSalle]) {
//     // eslint-disable-next-line no-await-in-loop
//     let ids = await getFragIds(fDbId, model);
//     if (!Array.isArray(ids)) { ids = [ids]; }
//     const meshs = ids.map(fragId => viewer.impl.getRenderProxy(model, fragId));
//     // console.log("meshs", meshs);

//     const mesh = meshs[0];
//     console.log("mesh.geometry", mesh.geometry);

//     var geometry = mesh.geometry;
//     const inverseMatrix = new window.THREE.Matrix4();
//     const ray = new window.THREE.Ray();

//     inverseMatrix.getInverse(mesh.matrixWorld);
//     console.log(raycaster.ray);
//     console.log(ray);


//     ray.copy(raycaster.ray);
//     console.log(ray);
//     ray.applyMatrix4(inverseMatrix);


//     enumMeshTriangles(geometry, function (vA, vB, vC) {
//       // if (side === three__WEBPACK_IMPORTED_MODULE_1__["BackSide"]) {
//       let intersectionPoint = ray.intersectTriangle(vC, vB, vA, false);
//       if (!intersectionPoint) return;
//       console.log("intersectionPoint", intersectionPoint);
//       intersectionPoint.applyMatrix4(mesh.matrixWorld);

//       distance = raycaster.ray.origin.distanceTo(intersectionPoint);
//       console.log("distance", distance);

//     });
//   }

//   // const inter = test.intersectObject(meshs[0]);
//   // console.log("res => ", inter);
//   // console.log("res => ", res, intersects);
// };

// window.test2 = async () => {
//   const viewer = window.NOP_VIEWER;
//   const model = window.NOP_VIEWER.model;
//   const dbid = 11327; // clim
//   const fDbId = 11899; // floor

//   let center = await getCenter(dbid, model);


//   let ids = await getFragIds(fDbId, model);
//   if (!Array.isArray(ids)) { ids = [ids]; }
//   const meshs = ids.map(fragId => viewer.impl.getRenderProxy(model, fragId));
//   // console.log("meshs", meshs);

//   const mesh = meshs[0];
//   // const inverseMatrix = new window.THREE.Matrix4();
//   // const ray = new window.THREE.Ray();
//   // inverseMatrix.getInverse(mesh.matrixWorld);


//   console.log(mesh.geometry);


//   const opt = {
//     geometry: {
//       vb: mesh.geometry.vb,
//       vblayout: mesh.geometry.vblayout,
//       attributes: mesh.geometry.attributes,
//       ib: mesh.geometry.ib,
//       indices: mesh.geometry.indices,
//       index: mesh.geometry.index,
//       offsets: mesh.geometry.offsets,
//       vbstride: mesh.geometry.vbstride
//     },
//     matrixWorld: mesh.matrixWorld,
//     ray: { center, dir: [0, 0, -1] }
//   };
//   // enumMeshTriangles(opt.geometry, (vA, vB, vC) => {
//   //   console.log(vA, vB, vC);
//   // });

//   w.postMessage(opt); // send the worker a message


// };
// // /**
// //  * @export
// //  * @param {number} dbId
// //  * @param {Model} model
// //  * @param {{dbId: number[], model: Model}} models
// //  * @returns
// //  */
// // export async function cast(dbId, model, models) {
// //   let center = await getCenter(dbId, model);
// //   let ray = new window.THREE.Ray(center, new window.THREE.Vector3(0, 0, -1));
// //   const ids = [];
// //   const ms = [];
// //   for (const obj of models) {
// //     ids.push(...obj.dbId);
// //     ms.push(obj.model.id);
// //   }
// //   return window.spinal.SpinalForgeViewer.viewerManager.viewer.impl.rayIntersect(ray, true, ids, ms);
// // }
