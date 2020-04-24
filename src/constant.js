/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

import GeographicContext from 'spinal-env-viewer-context-geographic-service';
import SpinalSpatialReferential from 'spinal-spatial-referential';

export const GEO_SITE_RELATION = GeographicContext.constants.SITE_RELATION;
export const GEO_BUILDING_RELATION = SpinalSpatialReferential.constants.GEO_BUILDING_RELATION;
export const GEO_FLOOR_RELATION = SpinalSpatialReferential.constants.GEO_FLOOR_RELATION;
export const GEO_ROOM_RELATION = SpinalSpatialReferential.constants.GEO_ROOM_RELATION;
export const GEO_ZONE_RELATION = SpinalSpatialReferential.constants.GEO_ZONE_RELATION;

export const GEO_EQUIPMENT_RELATION = GeographicContext.constants.EQUIPMENT_RELATION;

export const GEO_REFERENCE_RELATION = SpinalSpatialReferential.constants.GEO_REFERENCE_RELATION;
export const GEO_REFERENCE_ROOM_RELATION = SpinalSpatialReferential.constants.GEO_REFERENCE_ROOM_RELATION;

export const GEO_ROOM_TYPE = GeographicContext.constants.ROOM_TYPE;
export const GEO_EQUIPMENT_TYPE = GeographicContext.constants.EQUIPMENT_TYPE;
