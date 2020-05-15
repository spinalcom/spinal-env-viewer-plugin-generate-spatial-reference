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

<template>
  <v-edit-dialog :return-value.sync="label"
                 large
                 lazy
                 persistent
                 @save="save"
                 @cancel="cancel"
                 @open="open"
                 @close="close">
    <div>{{ label }}</div>
    <template v-slot:input>
      <v-select :items="items"
                label="Standard"
                :value="value" />
      <v-text-field v-model="label"
                    label="Edit"
                    single-line
                    counter
                    autofocus />
    </template>
  </v-edit-dialog>
</template>

<script>
export default {
  name: "InputValue",
  data() {
    return {
      items: ["Equal", "Contains", "Advanced (Regular expression)"],
      value: "Equal",
      label: "test"
    };
  },
  methods: {
    printInput(keyType, name, flag) {
      if (keyType === "e") return name;
      if (keyType === "c") return `[${name}]`;
      if (keyType === "r") return `/${name}]/${flag}`;
    },
    save() {
      console.log("save", this.value, this.label);
    },
    cancel() {
      console.log("cancel");
    },
    open() {
      console.log("open");
    },
    close() {
      console.log("close");
    }
  }
};
</script>
-->
