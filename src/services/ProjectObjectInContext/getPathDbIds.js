/*
 * Copyright 2021 SpinalCom - www.spinalcom.com
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
 * @param {*} tree
 * @param {number} id
 * @returns {number[]}
 */
function getIdChildren(tree, id) {
  const children = [];
  tree.enumNodeChildren(id, childId => {
    children.push(childId);
  });
  return children;
}

/**
 * @param {*} model
 * @param {{[key: string]: any, dbId: number,path?: string[] }} dbIdToFind
 * @param {*} [path=[]]
 * @param {*} [id=undefined]
 */
function getPathDbIds(model, dbIdToFind, path = [], id = undefined) {
  const tree = model.getInstanceTree();
  if (id === undefined) id = tree.nodeAccess.rootId;
  const _path = [];
  _path.push(...path, id);
  const children = getIdChildren(tree, id);
  for (const child of children) {
    getPathDbIds(model, dbIdToFind, _path, child);
  }
  if (id === dbIdToFind.dbId) {
    if (children.length > 0) {
      dbIdToFind.path = _path;
    }
  }
}
/**
 * @export
 * @param {*} model
 * @param {{dbId: number,path?: string[] }} data
 * @returns
 */
export function dbIdsToNames(model, data) {
  return new Promise((resolve) => {
    model.getBulkProperties(data.path, ['name'], (props) => {
      const path = props.map(({ name }) => name);
      data.path = path;
      resolve(path);
    });
  });
}


export { getPathDbIds };


/**
 * @param {*} model
 * @param {number[]} dbIds
 * @returns {{dbId: number, name: string}}
 */
function getNames(model, dbIds) {
  return new Promise((resolve, reject) => {
    model.getBulkProperties(dbIds, ['name'], (data) => resolve(data), (err) => reject(err));
  });
}

/**
 * @param {string[]} stringPath
 * @param {{dbId: number, name: string}[] } datas
 * @returns {{dbId: number, name: string}}
 */
function findString(stringPath, datas) {
  for (const data of datas) {
    if (data.name === stringPath) return data;
  }
  return undefined;
}

/**
 * @export
 * @param {*} model
 * @param {string[]} stringsPath
 * @returns
 */
export async function getPathIdsFromPath(model, stringsPath) {
  const tree = model.getInstanceTree();
  const dbIds = [];
  const queue = await getNames(model, [tree.nodeAccess.rootId]);
  let idxPath = 0;
  const res = [];
  const data = findString(stringsPath[idxPath], queue);
  if (!data) return undefined; else idxPath += 1;
  res.push(data.dbId);

  while (queue.length) {
    let id = queue.pop();
    dbIds.push(id);
    const items = [];
    tree.enumNodeChildren(id, childId => {
      items.push(childId);
    });
    if (items.length === 0) continue;
    // eslint-disable-next-line no-await-in-loop
    const objects = await getNames(model, items);
    const data = findString(stringsPath[idxPath], objects);
    if (data) {
      idxPath += 1;
      res.push(data.dbId);
      queue.push(data);
    }
  }
  return res;
}
