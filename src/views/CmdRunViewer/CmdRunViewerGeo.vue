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
      v-for="index in cmdLen.length"
      :key="index"
      md-mode="determinate"
      :md-value="getProgress(index)"
    ></md-progress-bar>
  </div>
</template>

<script>
import {
  getCmdServId,
  decodeCmds,
  consumeCmdGeo,
} from 'spinal-spatial-referential';
import Axios from 'axios';

export default {
  name: 'CmdRunViewerGeo',
  props: [],
  data() {
    return {
      cmdLen: [],
      indexCmd: 0,
      idxInCmd: 0,
      status: 0,
    };
  },
  watch: {
    status(value) {
      this.$emit('status', value);
    },
  },
  methods: {
    async setUp(node, contextId) {
      this.indexCmd = 0;
      this.idxInCmd = 0;
      this.status = 0;
      this.nodeId = node.info.id.get();
      this.contextId = contextId;
      const servId = getCmdServId(node);
      const getData = await Axios.get(`/sceen/_?u=${servId}`, {
        responseType: 'blob',
      });
      const arrayBuffer = await getData.data.arrayBuffer();
      this.dataCmd = decodeCmds(arrayBuffer);
      this.cmdLen = this.dataCmd.map((it) => it.length);
      console.log('this.dataCmd', this.dataCmd, this.cmdLen);
    },
    async start() {
      try {
        this.status = 1;
        console.log('dataCmdRes', this.dataCmd);
        await consumeCmdGeo(
          this.dataCmd,
          this.nodeId,
          this.contextId,
          this.progress
        );
        this.status = 2;
        console.log('doing 2nd pass');
        await consumeCmdGeo(
          this.dataCmd,
          this.nodeId,
          this.contextId,
          this.progress
        );
        this.status = 3;
      } catch (error) {
        this.status = 4;
        throw error;
      }
    },
    progress(indexCmd, idxInCmd) {
      this.indexCmd = indexCmd;
      this.idxInCmd = idxInCmd;
      console.log(
        `${indexCmd + 1}/${this.cmdLen.length} => ${idxInCmd}/${
          this.cmdLen[indexCmd]
        }`
      );
    },

    getProgress(index) {
      if (this.status === 3) return 100;
      if (this.status === 1 || this.status === 2) {
        if (this.indexCmd < index) return 0;
        if (this.indexCmd > index) return 100;
        return (this.idxInCmd / this.cmdLen[index]) * 100;
      }
      return 0;
    },
  },
};
</script>
<style scoped>
.command-run-progress-bar {
  margin: 2px 0;
}
</style>
