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

export async function generateContext(manager, bimFile, spatialConfig) {
  const svfVersionFile = await window.spinal.SpinalForgeViewer.getSVF(
    bimFile.element,
    bimFile.info.id.get(),
    bimFile.info.name.get()
  );
  const configName = spatialConfig.configName.get();
  const addLevel = spatialConfig.basic.addLevel.get();
  let path = window.location.origin + svfVersionFile.path;
  const m = await loadModel(path, {});
  window.spinal.BimObjectService.addModel(
    bimFile.info.id.get(),
    m,
    1,
    null,
    bimFile.info.name.get()
  );
  await manager.init();
  const building = await manager.getBuilding(spatialConfig);
  if (addLevel) {
    return manager.generateContext(configName, m);
  } else {
    if (typeof building !== "undefined") {
      return manager.updateContext(configName, m);
    }
    return manager.generateContext(configName, m);
  }
}

function loadModel(path, opts) {
  return new Promise(resolve => {
    function geometryLoaded(m) {
      resolve(m.model);
    }
    const viewer = window.spinal.SpinalForgeViewer.viewerManager.viewer;
    viewer.addEventListener(
      window.Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
      geometryLoaded
    );
    viewer.loadModel(path, opts);
  });
}
