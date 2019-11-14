export async function cast(dbId, model){
  let center = await getCenter(dbId, model);
  let ray = new THREE.Ray(center, new THREE.Vector3(0,0, -1));
  return  window.spinal.SpinalForgeViewer.viewerManager.viewer.impl.rayIntersect(ray, true);
}

function getCenter( dbId, model ) {
  let center = new THREE.Vector3();
  return getFragIds(dbId, model)
    .then(ids => {
    if (!Array.isArray(ids))
      ids = [ids];
    return getModifiedWorldBoundingBox( ids, model )
  })
    .then(bbox => bbox.center(center));
}

function getFragIds( dbId, model ) {
  return new Promise( ( resolve ) => {
    let it = model.getInstanceTree();
    it.enumNodeFragments( dbId, resolve, false );
  } )
}

function getModifiedWorldBoundingBox( fragIds, model ) {
  
  //fragments list array
  var fragList = model.getFragmentList();
  const fragbBox = new THREE.Box3()
  const nodebBox = new THREE.Box3()
  
  fragIds.forEach( function ( fragId ) {
    fragList.getWorldBounds( fragId, fragbBox )
    nodebBox.union( fragbBox )
  } )
  
  return nodebBox
}
