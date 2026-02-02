<!--
Copyright 2023 SpinalCom - www.spinalcom.com

This file is part of SpinalCore.

Please read all of the following terms and conditions
of the Free Software license Agreement ("Agreement")
carefully.

This Agreement is a legally binding contract between
the Licensee (as defined below) and SpinalCom that
sets forth the terms and conditions that govern your
use of the Program. By installing and/or using the
Program, you agree to abide by all the terms and
conditions stated or referenced herein.

If you do not agree to abide by these terms and
conditions, do not demonstrate your acceptance and do
not install or use the Program.
You should have received a copy of the license along
with this file. If not, see
<http://resources.spinalcom.com/licenses.pdf>.
-->
<template>
  <md-dialog
    :md-active.sync="showDialog"
    :md-close-on-esc="!loading"
    :md-click-outside-to-close="!loading"
  >
    <md-dialog-title>Command Run</md-dialog-title>
    <md-dialog-content>
      <p>status: {{ getStatus() }}</p>
      <CmdRunViewerGeo
        v-show="this.mode === GENERATION_GEO_TYPE"
        ref="CmdRunViewerGeo"
        @status="status = $event.target"
      ></CmdRunViewerGeo>
      <CmdRunViewerProjection
        ref="CmdRunViewerProjection"
        v-show="this.mode === GENERATION_PROJECTION_TYPE"
        @status="status = $event.target"
      ></CmdRunViewerProjection>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button
        class="md-primary"
        :disabled="loading"
        @click="showDialog = false"
        >Close</md-button
      >
      <md-button class="md-primary" :disabled="loading" @click="start"
        >Start</md-button
      >
    </md-dialog-actions>

    <md-snackbar
      md-position="left"
      :md-duration="4000"
      :md-active.sync="snackbarError"
      md-persistent
    >
      <span> Error: {{ snackbarMessage }}</span>
      <md-button class="md-primary" @click="snackbarError = false"
        >Close</md-button
      >
    </md-snackbar>
  </md-dialog>
</template>

<script>
import {
  getRealNode,
  GENERATION_GEO_TYPE,
  GENERATION_PROJECTION_TYPE,
} from 'spinal-spatial-referential';
import CmdRunViewerGeo from './CmdRunViewerGeo.vue';
import CmdRunViewerProjection from './CmdRunViewerProjection.vue';
const CmdRunViewer = {
  name: 'CmdRunViewer',
  props: ['onFinised'],
  components: { CmdRunViewerGeo, CmdRunViewerProjection },
  data() {
    return {
      GENERATION_GEO_TYPE,
      GENERATION_PROJECTION_TYPE,
      showDialog: true,
      loading: false,
      mode: '',
      status: 0,
      snackbarError: false,
      snackbarMessage: '',
    };
  },
  methods: {
    async opened(option) {
      if (option) {
        this.showDialog = true;
        this.status = 0;
        let node;
        if (option.selectedNodeId) {
          node = getRealNode(option.selectedNodeId);
        } else {
          node = option.node;
        }
        this.mode = node.info.generationType.get();
        try {
          this.loading = true;
          if (this.mode === GENERATION_GEO_TYPE) {
            await this.$refs.CmdRunViewerGeo.setUp(
              node,
              option.contextId,
              option.dataCmd
            );
          } else if (this.mode === GENERATION_PROJECTION_TYPE) {
            await this.$refs.CmdRunViewerProjection.setUp(
              node,
              option.contextId,
              option.dataCmd
            );
          }
        } catch (error) {
          console.error(error);
          this.snackbarError = true;
          this.snackbarMessage = error;
        } finally {
          this.loading = false;
        }
      } else {
        this.snackbarError = true;
        this.snackbarMessage = 'CmdRunViewer opened without an option';
        console.error('CmdRunViewer opened without an option');
      }
    },
    async start() {
      this.loading = true;
      try {
        if (this.mode === GENERATION_GEO_TYPE) {
          await this.$refs.CmdRunViewerGeo.start.call(
            this.$refs.CmdRunViewerGeo
          );
        } else if (this.mode === GENERATION_PROJECTION_TYPE) {
          await this.$refs.CmdRunViewerProjection.start.call(
            this.$refs.CmdRunViewerProjection
          );
        }
      } catch (error) {
        console.error(error);
        this.snackbarError = true;
        this.snackbarMessage = 'Generation Error, please retry';
      } finally {
        this.loading = false;
        this.closeDialog();
      }
    },
    getStatus() {
      switch (this.status) {
        case 1:
          return '1/2 - running...';
        case 2:
          return '2/2 - checking';
        case 3:
          return 'done';
        case 4:
          return 'error';
        default: // standby
          return 'stand by';
      }
    },
    removed(option) {
      this.showDialog = false;
    },
    closeDialog(closeResult) {
      if (typeof this.onFinised === 'function') this.onFinised();
    },
  },
  watch: {
    showDialog() {
      if (this.showDialog === false) this.closeDialog();
    },
  },
};

export default CmdRunViewer;
</script>
