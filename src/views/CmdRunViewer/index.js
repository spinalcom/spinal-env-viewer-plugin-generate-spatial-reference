/*
 * Copyright 2023 SpinalCom - www.spinalcom.com
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
import Vue from 'vue';
const {
  SpinalMountExtention
} = require("spinal-env-viewer-panel-manager-service");

import CmdRunViewer from "./CmdRunViewer.vue";
function getDomElemWithClassNameRetry() {
  return new Promise(resolve => {
    const inter = setInterval(() => {
      const dom = document.body;
      if (dom) {
        clearInterval(inter);
        resolve(dom);
      }
    }, 100);
  });
}

getDomElemWithClassNameRetry().then(
  (domElement) => {
    // include in div with class="plugin-graph-viewer"
    // a diff viewer
    SpinalMountExtention.mount({
      // name registered.
      name: "CmdRunViewer",
      // Vue.extend to create a Compoment constructor
      vueMountComponent: Vue.extend(CmdRunViewer),
      // where to  append the Compoment
      parentContainer: domElement
    });
  }
)


