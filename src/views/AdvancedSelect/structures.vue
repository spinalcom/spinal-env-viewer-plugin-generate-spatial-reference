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
  <v-card>
    <v-card-text>
      <v-select :items="bimfiles"
                label="Selection du model architecture"
                @change="onModelSelected" />
      <v-text-field v-model="buildingNameCompu"
                    placeholder="Nom du batiment"
                    label="Nom du batiement" />

      <v-checkbox v-model="addLevelCompu"
                  :label="`Ajouter un etage`" />
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="green darken-1"
             flat
             :disabled="selectedModel === null"
             @click="$emit('continue')">
        Continue
      </v-btn>
    </v-card-actions>
  </v-card>
</template>



