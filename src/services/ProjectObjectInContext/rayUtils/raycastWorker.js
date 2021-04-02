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


var THREE = require('three');
var { enumMeshTriangles } = require('./enumMeshTriangles');

module.exports = function (self) {
  function pushIntersection(targetArray, centerPoint, dbId, modelId, distance) {
    for (const obj of targetArray) {
      if (obj.origin.dbId === centerPoint.dbId) {
        if (obj.intersections.distance > distance) {
          obj.intersections.distance = distance;
          obj.intersections.dbId = dbId;
          obj.intersections.modelId = modelId;
        }
        return;
      }
    }
    targetArray.push({
      origin: centerPoint,
      intersections: { distance, modelId, dbId }
    });
  }

  self.addEventListener('message', function (ev) {
    const { workId, data } = ev.data;
    console.log("start work", data);
    const centerPoints = data.centerPoints;
    const geometries = data.geometries;

    const res = [];
    for (const centerPoint of centerPoints) {
      let rayOrig = new THREE.Ray(
        new THREE.Vector3(centerPoint.center.x, centerPoint.center.y, centerPoint.center.z),
        new THREE.Vector3(0, 0, -1)
      );
      const inverseMatrix = new THREE.Matrix4();
      const dbObjIntersections = [];

      for (const intersectionObjs of geometries) {
        for (const mesh of intersectionObjs.dataMesh) {
          const ray = new THREE.Ray();
          inverseMatrix.getInverse(mesh.matrixWorld);
          ray.copy(rayOrig);
          ray.applyMatrix4(inverseMatrix);
          // test with boundingbox
          const bBox = new THREE.Box3(mesh.bbox.min, mesh.bbox.max);
          let bboxFound = false;
          if (bBox.containsPoint(centerPoint)) { // test if point inside bbox
            bboxFound = true;
          } else { // test if point on top of bbox
            let intersectionPoint = ray.intersectBox(bBox, new THREE.Vector3());
            if (intersectionPoint) bboxFound = true;
          }
          if (bboxFound) {
            // test with boundingbox ok -> test with triangles
            enumMeshTriangles(mesh.geometry, function (vA, vB, vC) {
              let intersectionPoint = ray.intersectTriangle(vC, vB, vA, false, new THREE.Vector3());
              if (!intersectionPoint) return;
              intersectionPoint.applyMatrix4(mesh.matrixWorld);
              const distance = rayOrig.origin.distanceTo(intersectionPoint);
              pushIntersection(dbObjIntersections, centerPoint, intersectionObjs.dbId, intersectionObjs.modelId, distance);
            });
          }
        }
      }
      if (dbObjIntersections.length > 0) { res.push(dbObjIntersections); }
    }
    self.postMessage({ workId, res });
  });
};
