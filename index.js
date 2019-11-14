import {
  SpinalMountExtention
} from "spinal-env-viewer-panel-manager-service"
import {
  spinalContextMenuService,
} from "spinal-env-viewer-context-menu-service";
import Vue from 'vue'
import Vuetify from 'vuetify'
Vue.use( Vuetify )
import DialogGenerateContext from './src/views/SelectModelModal.vue'
import AddObjectPanel from "./src/views/AddObjectPanel.vue";
import {SpinalForgeExtention} from "spinal-env-viewer-panel-manager-service_spinalforgeextention"


import { ButtonGenerateContext } from "./src/buttons/generate";
import { ButtonAddObjectToCategory } from "./src/buttons/AddObjectToContext";

export const TOP_BAR_HOOK_NAME = 'GraphManagerTopBar';
//export const mure porte fenetere
spinalContextMenuService.registerApp( TOP_BAR_HOOK_NAME, new ButtonGenerateContext(), [7] );
spinalContextMenuService.registerApp( TOP_BAR_HOOK_NAME, new ButtonAddObjectToCategory(), [7] );


SpinalMountExtention.mount( {
  // name registered.
  name: "DialogGenerateContext",
  // Vue.extend to create a Compoment constructor
  vueMountComponent: Vue.extend( DialogGenerateContext ),
  // where to  append the Compoment
  parentContainer: document.body
} );



SpinalForgeExtention.registerExtention('DialogAddObject', SpinalForgeExtention.createExtention({
  name: "DialogAddObject",
  // Vue.extend to create a Compoment constructor
  vueMountComponent: Vue.extend( AddObjectPanel ),
  // where to  append the Compoment
  parentContainer: document.body,
 
   panel: {
    title: "Choisissez votre categorie",
    classname: "spinal-pannel",
    closeBehaviour: "delete"
  },
  style: {
    left: "405px",
    height: '250px'
  }
}))