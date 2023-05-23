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
  <div>
    <md-progress-bar
      class="command-run-progress-bar"
      md-mode="determinate"
      :md-value="progress"
    ></md-progress-bar>
  </div>
</template>

<script>
import {
  getCmdServId,
  decodeCmds,
  consumeCmdProjection,
} from 'spinal-spatial-referential';
import Axios from 'axios';

export default {
  name: 'CmdRunViewerProjection',
  props: [],
  data() {
    return {
      progress: 0,
      status: 0,
      nodeId: '',
      contextId: '',
    };
  },
  watch: {
    status(value) {
      this.$emit('status', value);
    },
  },
  methods: {
    async setUp(node, contextId) {
      this.status = 0;
      this.progress = 0;
      this.nodeId = node.info.id.get();
      this.contextId = contextId;
      const servId = getCmdServId(node);
      const getData = await Axios.get(`/sceen/_?u=${servId}`, {
        responseType: 'blob',
      });
      const arrayBuffer = await getData.data.arrayBuffer();
      this.dataCmd = decodeCmds(arrayBuffer);
      console.log('this.dataCmd', this.dataCmd);
    },
    async start() {
      try {
        this.status = 1;
        this.progress = 0;
        console.log('dataCmdRes', this.dataCmd);
        await consumeCmdProjection(
          this.dataCmd,
          this.nodeId,
          this.contextId,
          this.onProgress
        );
        this.status = 2;
        console.log('doing 2nd pass');
        await consumeCmdProjection(
          this.dataCmd,
          this.nodeId,
          this.contextId,
          this.onProgress
        );
        this.status = 3;
      } catch (error) {
        this.status = 4;
        throw error;
      }
    },
    onProgress(percent) {
      console.log('onProgress => %d %', percent);
      this.progress = percent;
    },
  },
};
</script>
<style scoped>
.command-run-progress-bar {
  margin: 2px 0;
}
</style>
