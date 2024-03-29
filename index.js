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

// import { SpinalMountExtention } from "spinal-env-viewer-panel-manager-service";
import { spinalContextMenuService } from "spinal-env-viewer-context-menu-service";
import Vue from 'vue';
import Vuetify from 'vuetify';
Vue.use(Vuetify);

import DialogGenerateContext from './src/views/SelectModelModal.vue';
import ProjectObjectInContext from "./src/views/ProjectBimObj/ProjectObjectInContext.vue";
import AssingView from "./src/views/ProjectBimObj/AssingView/AssingView.vue";
import { SpinalForgeExtention } from "spinal-env-viewer-panel-manager-service_spinalforgeextention";

import { ButtonGenerateContext } from "./src/buttons/generate";
import { ButtonAddObjectToCategory } from "./src/buttons/AddObjectToContext";
import { GenerateContextGeo } from "./src/buttons/RunGeneration";
import { ManualAssingmentButton } from "./src/buttons/ManualAssingment";
import "./src/views/diffViewer/index";
import "./src/views/CmdRunViewer/index";
import "./src/views/MergeBimGeo";
export const TOP_BAR_HOOK_NAME = 'GraphManagerTopBar';
const SIDE_BAR_HOOK_NAME = "GraphManagerSideBar";

//export const mure porte fenetere
spinalContextMenuService.registerApp(TOP_BAR_HOOK_NAME, new ButtonGenerateContext(), [7]);
spinalContextMenuService.registerApp(SIDE_BAR_HOOK_NAME, new ButtonAddObjectToCategory(), [7]);
spinalContextMenuService.registerApp(SIDE_BAR_HOOK_NAME, new GenerateContextGeo(), [7]);
spinalContextMenuService.registerApp(SIDE_BAR_HOOK_NAME, new ManualAssingmentButton(), [7]);

SpinalForgeExtention.registerExtention('DialogGenerateContext', SpinalForgeExtention.createExtention({
  name: "DialogGenerateContext",
  // Vue.extend to create a Compoment constructor
  vueMountComponent: Vue.extend(DialogGenerateContext),
  // where to  append the Compoment
  parentContainer: document.body,

  panel: {
    title: "Generate / Update Spatial context",
    classname: "spinal-pannel",
    closeBehaviour: "delete"
  },
  style: {
    left: "405px",
    width: "700px",
    height: '250px'
  }
}));


SpinalForgeExtention.registerExtention('DialogAddObject', SpinalForgeExtention.createExtention({
  name: "DialogAddObject",
  // Vue.extend to create a Compoment constructor
  vueMountComponent: Vue.extend(ProjectObjectInContext),
  // where to  append the Compoment
  parentContainer: document.body,

  panel: {
    title: "Project objects in context",
    classname: "spinal-pannel",
    closeBehaviour: "delete"
  },
  style: {
    left: "405px",
    width: "400px",
    height: '250px'
  }
}));
SpinalForgeExtention.registerExtention('panelManualAssingView', SpinalForgeExtention.createExtention({
  name: "panelManualAssingView",
  // Vue.extend to create a Compoment constructor
  vueMountComponent: Vue.extend(AssingView),
  // where to  append the Compoment
  parentContainer: document.body,

  panel: {
    title: "Manual assignation",
    classname: "spinal-pannel",
    closeBehaviour: "delete"
  },
  style: {
    left: "405px",
    width: "690px",
    height: '250px'
  }
}));
;