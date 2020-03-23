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
var work = require('webworkify');
var q = require('q');

class RayWorkerManager {

  constructor() {
    this.worker = work(require('./raycastWorker'));
    this.workInProg = new Map();
    this.workId = 0;

    this.worker.addEventListener('message', (ev) => {
      const prom = this.workInProg.get(ev.data.workId);
      prom.resolve(ev.data.res);
      this.workInProg.delete(ev.data.workId);
    });
  }

  work(arg) {
    const defered = q.defer();
    this.workInProg.set(this.workId, defered);
    this.worker.postMessage({ workId: this.workId, data: arg }); // send the worker a message
    this.workId += 1;
    return defered.promise;
  }
  static getInstance() {
    if (RayWorkerManager.instance) return RayWorkerManager.instance;
    RayWorkerManager.instance = new RayWorkerManager();
    return RayWorkerManager.instance;
  }
}
RayWorkerManager.instance = null;

export {
  RayWorkerManager
};
export default RayWorkerManager;
