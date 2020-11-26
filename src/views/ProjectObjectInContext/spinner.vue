<!--
Copyright 2020 SpinalCom - www.spinalcom.com

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
  <transition name="spinner-back-fade">
    <div
      v-if="show"
      class="spinner-back">
      <v-progress-linear :indeterminate="true"
                         color="primary" />
    </div>
  </transition>
</template>

<script>
export default {
  name: "Spinner",
  props: {
    show: { required: true, type: Boolean }
  },
  data() {
    return {};
  },
  methods: {}
};
</script>

<style scoped>
.spinner-back {
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  opacity: 1;
}
.spinner-back > * {
  bottom: 0;
  margin: 0;
  position: absolute;
}

.spinner-back-fade-enter-active,
.spinner-back-fade-leave-active {
  transition: opacity 0.5s;
}
.spinner-back-fade-enter, .spinner-back-fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
