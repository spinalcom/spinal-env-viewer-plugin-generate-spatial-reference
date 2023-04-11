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
      <div>
        <md-progress-bar
          class="command-run-progress-bar"
          v-for="(cmds, index) in dataCmd"
          :key="index"
          md-mode="determinate"
          :md-value="getProgress(cmds, index)"
        ></md-progress-bar>
      </div>
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
  </md-dialog>
</template>

<script>
import {
  getCmdServId,
  decode,
  handleCmd,
  getRealNode,
} from 'spinal-spatial-referential';
import Axios from 'axios';

const CmdRunViewer = {
  name: 'CmdRunViewer',
  props: ['onFinised'],
  data() {
    return {
      showDialog: true,
      dataCmd: [],
      loading: false,
      indexCmd: 0,
      totalCmd: 0,
      idxInCmd: 0,
      totalInCmd: 0,
      status: 0,
    };
  },
  methods: {
    async opened(option) {
      this.showDialog = true;
      this.indexCmd = 0;
      this.totalCmd = 0;
      this.idxInCmd = 0;
      this.totalInCmd = 0;
      this.status = 0;
      if (option) {
        if (option.selectedNodeId) {
          this.loading = true;
          try {
            this.node = getRealNode(option.selectedNodeId);
            const servId = getCmdServId(this.node);
            const getData = await Axios.get(`/sceen/_?u=${servId}`, {
              responseType: 'blob',
            });
            const arrayBuffer = await getData.data.arrayBuffer();
            this.dataCmd = decode(arrayBuffer);
          } catch (error) {
            console.error(error);
          } finally {
            this.loading = false;
          }
        } else {
          this.dataCmd = option.dataCmd;
          this.node = option.node;
        }
      }
    },
    async start() {
      this.loading = true;
      try {
        this.status = 1;
        console.log('dataCmdRes', this.dataCmd);
        await handleCmd(this.dataCmd, this.node.info.name.get(), this.progress);
        this.status = 2;
        console.log('doing 2nd pass');
        await handleCmd(this.dataCmd, this.node.info.name.get(), this.progress);
        this.status = 3;
        // edit node status ???
      } catch (error) {
        this.status = 4;
        console.error(error);
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
    progress(indexCmd, idxInCmd) {
      this.indexCmd = indexCmd;
      this.idxInCmd = idxInCmd;
      console.log(
        `${indexCmd + 1}/${this.dataCmd.length} => ${idxInCmd}/${
          this.dataCmd[indexCmd].length
        }`
      );
    },
    removed(option) {
      this.showDialog = false;
    },
    closeDialog(closeResult) {
      if (typeof this.onFinised === 'function') this.onFinised();
    },
    getProgress(cmds, index) {
      if (this.status === 3) return 100;
      if (this.status === 1 || this.status === 2) {
        if (this.indexCmd < index) return 0;
        if (this.indexCmd > index) return 100;
        console.log(this.idxInCmd / cmds.length);
        return (this.idxInCmd / cmds.length) * 100;
      }
      return 0;
    },
  },
};

export default CmdRunViewer;
</script>

<style scoped>
.command-run-progress-bar {
  margin: 2px 0;
}
</style>

<style></style>
