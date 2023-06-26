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
  <div :id="id">
    <v-tooltip :attach="`#${id}`" bottom>
      <template v-slot:activator="{ on }">
        <v-btn icon ripple v-on="on" @click.stop="$emit('clicked', item)">
          <v-icon color="grey lighten-1">
            {{ icon }}
          </v-icon>
        </v-btn>
      </template>
      <span>{{ tooltip }}</span>
    </v-tooltip>
  </div>
</template>

<script>
let nbr = 0;
export default {
  name: 'BtnTooltip',
  props: {
    icon: { require: true, type: String, default: () => 'arrow_forward_ios' },
    tooltip: { require: true, type: String, default: () => '' },
  },
  data() {
    return { id: 'spinal-btn-tooltip' };
  },
  mounted() {
    this.id = this.id + nbr;
    nbr++;
  },
};
</script>
