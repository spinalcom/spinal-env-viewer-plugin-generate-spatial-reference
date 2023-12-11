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
import { SpinalForgeExtention } from "spinal-env-viewer-panel-manager-service_spinalforgeextention";
import SpinalMergeBimGeo from "./SpinalMergeBimGeo.vue";
import { SpinalContextApp } from 'spinal-env-viewer-context-menu-service';
const { spinalPanelManagerService } = require("spinal-env-viewer-panel-manager-service");
import ssr from "spinal-spatial-referential";
import { spinalContextMenuService } from "spinal-env-viewer-context-menu-service";

// REGISTER PANEL
SpinalForgeExtention.registerExtention('SpinalMergeBimGeo', SpinalForgeExtention.createExtention({
  name: "SpinalMergeBimGeo",
  // Vue.extend to create a Compoment constructor
  vueMountComponent: Vue.extend(SpinalMergeBimGeo),
  // where to  append the Compoment
  parentContainer: document.body,

  panel: {
    title: "Spatial context builder",
    classname: "spinal-pannel",
    closeBehaviour: "delete"
  },
  style: {
    left: "405px",
    width: "700px",
    height: '250px'
  }
}));

// REGISTER BUTTON
const LABEL = 'Merge Bim Geographic';
class ManualAssingmentButton extends SpinalContextApp {

  constructor() {
    super(LABEL, LABEL, {
      icon: 'location_city',
      icon_type: 'in',
      backgroundColor: '#000000',
      fontColor: '#ffffff'
    });

    this.action = this.openPanel.bind(this);
  }

  isShown(option) {
    if (option.selectedNode.type.get() === ssr.constants.GEO_CONTEXT_TYPE) {
      return Promise.resolve(true);
    }
    return Promise.resolve(-1);
  }

  openPanel(option) {
    spinalPanelManagerService.openPanel("SpinalMergeBimGeo", {
      contextId: option.context.id.get(),
      selectedNodeId: option.selectedNode.id.get()
    });
  }
}
const SIDE_BAR_HOOK_NAME = "GraphManagerSideBar";
spinalContextMenuService.registerApp(SIDE_BAR_HOOK_NAME, new ManualAssingmentButton(), [7]);
