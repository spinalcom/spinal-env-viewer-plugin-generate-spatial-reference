<!--
Copyright 2026 SpinalCom - www.spinalcom.com

This file is part of SpinalCore.

Please read all of the following terms and conditions
of the Software license Agreement ("Agreement")
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
  <v-dialog :value="value" @input="onInput" attach="body">
    <v-card>
      <v-card-title> Assign Floor </v-card-title>
      <v-card-text>
        <v-layout class="project-bimobj-assignfloor-layout">
          <v-flex xs4 class="project-bimobj-assignfloor-flex spinal-scrollbar">
            <v-list dense two-line>
              <v-subheader>
                Select the target floor to assign levels to
              </v-subheader>

              <v-list-tile
                v-for="spatialLevel in spatialLevels"
                :key="spatialLevel.floorId"
                ripple
                @click="floorIdSelected = spatialLevel.floorId"
                :class="{
                  'grey lighten-2': floorIdSelected === spatialLevel.floorId,
                }"
              >
                <v-list-tile-content>
                  <v-list-tile-title>
                    {{ spatialLevel.name }}
                  </v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-flex>
          <v-flex xs8 class="project-bimobj-assignfloor-flex spinal-scrollbar">
            <v-list dense two-line>
              <v-subheader>
                Floor found to assign ({{ levelsFoundComputed.length }})
              </v-subheader>

              <v-list-tile
                v-for="item in levelsFoundComputed"
                :key="`${item.bimFileId}.${item.floorDbId}`"
              >
                <v-list-tile-content>
                  <v-list-tile-title>
                    {{ item.name }}
                  </v-list-tile-title>
                  <v-list-tile-sub-title>
                    {{ item.bimFileName }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>
                  <v-icon
                    color="green lighten-1"
                    @click="addToSelected(item)"
                    :disabled="floorIdSelected === null"
                  >
                    add
                  </v-icon>
                </v-list-tile-action>
              </v-list-tile>

              <v-divider></v-divider>
              <v-subheader>
                Already assigned ({{ levelsFoundAssigned.length }})
              </v-subheader>

              <v-list-tile
                v-for="item in levelsFoundAssigned"
                :key="`${item.bimFileId}.${item.floorDbId}`"
              >
                <v-list-tile-content>
                  <v-list-tile-title>
                    {{ item.name }}
                    <span>&gt; {{ item.targetFloorName }}</span>
                  </v-list-tile-title>
                  <v-list-tile-sub-title>
                    {{ item.bimFileName }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>
                  <v-icon
                    color="grey lighten-1"
                    @click="addToSelected(item)"
                    :disabled="floorIdSelected === null"
                  >
                    add
                  </v-icon>
                </v-list-tile-action>
              </v-list-tile>
            </v-list>
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red darken-1" flat @click="$emit('input', false)">
          Cancel
        </v-btn>
        <v-btn
          color="green darken-1"
          flat
          :disabled="levelsFoundComputed.length > 0"
          @click="onConfirm"
        >
          Confirm
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import {
  getRealNode,
  getModelByBimFileIdLoaded,
  getProperties,
} from 'spinal-spatial-referential';
import { FileSystem } from 'spinal-core-connectorjs';
export default {
  name: 'AssignFloor',
  props: {
    levelsFound: { type: Array, required: true },
    configFloorProjection: { type: Array, required: true },
    value: { type: Boolean, required: true },
  },
  data() {
    return {
      levelsFoundAssigned: [],
      spatialLevels: [],
      floorIdSelected: null,
    };
  },
  methods: {
    onInput(value) {
      this.$emit('input', value);
    },
    onConfirm() {
      this.$emit('confirm', {
        levelsFoundAssigned: this.levelsFoundAssigned,
        spatialLevels: this.spatialLevels,
      });
    },
    addToSelected(item) {
      // remove existing
      this.levelsFoundAssigned = this.levelsFoundAssigned.filter(
        (level) =>
          !(
            level.bimFileId === item.bimFileId &&
            level.floorDbId === item.floorDbId
          )
      );

      for (const spinalfloor of this.spatialLevels) {
        if (spinalfloor.floorId === this.floorIdSelected) {
          this.levelsFoundAssigned.push({
            ...item,
            targetFloorName: spinalfloor.name,
            targetFloorId: spinalfloor.floorId,
          });
          break;
        }
      }
    },
  },
  computed: {
    levelsFoundComputed() {
      return this.levelsFound
        .filter(
          (level) =>
            this.levelsFoundAssigned.findIndex(
              (l) =>
                l.bimFileId === level.bimFileId &&
                l.floorDbId === level.floorDbId
            ) === -1
        )
        .map((level) => ({
          ...level,
          bimFileName:
            getRealNode(level.bimFileId)?.info?.name?.get() || 'unknown',
        }));
    },
  },
  watch: {
    configFloorProjection: {
      immediate: true,
      deep: true,
      async handler(newVal) {
        this.levelsFoundAssigned = [];
        this.spatialLevels = [];
        for (const level of newVal) {
          const spatialLevelNode = FileSystem._objects[level.floorId];
          for (const child of level.floorData) {
            const bimFileNode = getRealNode(child.bimFileId);
            if (bimFileNode) {
              const model = getModelByBimFileIdLoaded(
                bimFileNode.info.id.get()
              );
              const props = await getProperties(model, child.floorDbId);
              const item = {
                bimFileName: bimFileNode.info.name.get(),
                bimFileId: child.bimFileId,
                name: props?.name || `Dbid: ${child.floorDbId}`,
                floorDbId: child.floorDbId,
                targetFloorName: spatialLevelNode.info.name.get(),
                targetFloorId: level.floorId,
              };
              this.levelsFoundAssigned.push(item);
            }
          }
          this.spatialLevels.push({
            name: spatialLevelNode.info.name.get(),
            floorId: level.floorId,
          });
        }
      },
    },
  },
};
</script>

<style scoped>
.project-bimobj-assignfloor-layout {
  max-height: calc(100vh - 250px);
}
.project-bimobj-assignfloor-layout > .project-bimobj-assignfloor-flex {
  max-height: 100%;
  overflow: auto;
}
</style>
