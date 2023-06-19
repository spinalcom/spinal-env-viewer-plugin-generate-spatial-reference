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
  <v-list-tile-sub-title v-if="validId" class="AssignDataViewRoomName">
    <span
      style="color: #00e300"
      v-if="validCompuText === nodeName"
      @click.stop="$emit('roomSelect', nodeName)"
    >
      {{ nodeName }}
    </span>
    <template v-else>
      <span
        style="color: #00e300"
        @click.stop="$emit('roomSelect', validCompuText)"
      >
        {{ validCompuText }}
      </span>
      <span style="color: red">
        <s @click.stop="$emit('roomSelect', nodeName)">{{ nodeName }}</s>
      </span>
    </template>
  </v-list-tile-sub-title>
  <v-list-tile-sub-title
    class="AssignDataViewRoomName"
    v-else
    @click.stop="$emit('roomSelect', nodeName)"
  >
    <span style="color: #00e300">
      {{ nodeName }}
    </span>
  </v-list-tile-sub-title>
</template>

<script>
import { getRealNode } from 'spinal-spatial-referential';

export default {
  name: 'AssignDataViewRoomName',
  data() {
    return {};
  },
  props: ['nodeName', 'validId'],
  computed: {
    validCompuText() {
      const node = getRealNode(this.validId);
      if (node) return node.info.name.get();
      return this.validId;
    },
  },
};
</script>
<style scoped>
.AssignDataViewRoomName:hover {
  background-color: #363636;
}
</style>
