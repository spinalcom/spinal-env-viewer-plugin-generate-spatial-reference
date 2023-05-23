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


/**
 * @param {*} model
 * @param {Array<Object>} cfg
 * @returns
 */
export function getObjFromRvtModel(model, cfg) {
  const data = ['['];
  for (const d of cfg) {
    let isCatStr = '';
    if (d.isCat === true) isCatStr = `, isCat: true`;
    const str = `{ key: ${d.key.toString()}, value: ${d.value.toString()}${isCatStr}},`;
    data.push(str);
  }
  data.push(']');
  const fct = `
    function userFunction(pdb) {
      const data = ${data.join("")}
      const attrToWatch = [];
      const result = [];
      pdb.enumAttributes(function (i, attrDef) {
        for (const d of data) {
          if (
            (attrDef.displayName && d.key.test(attrDef.displayName)) ||
            (!attrDef.displayName && d.key.test(attrDef.name)) ||
              (d.isCat === true && attrDef.category === '__category__' && d.key.test(attrDef.name))
          ) {
            attrToWatch.push({
              id: i,
              attrDef, d
            });
            break;
          }
        }
      });
      pdb.enumObjects(function (dbId) {
        let isValid = false;
        pdb.enumObjectProperties(dbId, function (attrId, valId) {
          const attr = attrToWatch.find((item) => item.id === attrId);
          if (!attr) return false;
          let value = pdb.getAttrValue(attrId, valId);
          if (attr.d.value.test(value)) {
            isValid = true;
            return true;
          }
        });
        if (isValid) result.push(dbId);
      });
      return result;
    }`;
  return model.getPropertyDb().executeUserFunction(fct);
}


export function getCatFromRvtModel(model) {
  const fct = `
    function userFunction(pdb) {
      const result = new Set();
      let idCat = -1
      pdb.enumAttributes(function (i, attrDef) {
        if (attrDef.name === 'Category' && attrDef.category === '__category__') {
          idCat = i;
        }
      });
      if (idCat === -1) return [];
      pdb.enumObjects(function (dbId) {
        pdb.enumObjectProperties(dbId, function (attrId, valId) {
          if (idCat !== attrId) return false;
          let value = pdb.getAttrValue(attrId, valId);
          result.add(value);
          return true;
        });
      });

      return Array.from(result);
    }`;
  return model.getPropertyDb().executeUserFunction(fct);
}

export function createInput(type, name, regflag = "") {
  if (type === 'e') return new RegExp("^" + RegExp.escape(name) + "$", regflag);
  if (type === 'c') return new RegExp(RegExp.escape(name), regflag);
  if (type === 'r') return new RegExp(name, regflag);
}
export function createCat(value) {
  return {
    key: createInput('e', 'Category'),
    value: createInput('e', value),
    isCat: true
  };
}

export function getModelByName(name) {
  if (window.spinal.BimObjectService.mappingNameByModel.hasOwnProperty(name)) {
    return window.spinal.BimObjectService.mappingNameByModel[name];
  }
}


// eslint-disable-next-line no-unused-vars
function mainTest() {
  function create(key, value) { return { key, value }; }
  const d = [
    createCat('Revit Level'),
    create(createInput('e', 'Identifiant'), createInput("r", '[0-9]+'))
  ];
  getObjFromRvtModel(window.NOP_VIEWER.model, d).then(console.log);
  // getCatFromRvtModel(NOP_VIEWER.model).then(console.log);
}
