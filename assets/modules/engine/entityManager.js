// modules/engine/entityManager.js
// Manages entities: update order, draw order, registration.
// Entities expected to implement:
//  - update(dt, context)   (physics/ai)
//  - draw(renderer)

export function createEntityManager() {
  const entities = [];
  return {
    add(entity) { entities.push(entity); return entity; },
    remove(entity) {
      const i = entities.indexOf(entity);
      if (i !== -1) entities.splice(i,1);
    },
    updateAll(dt, context) {
      // context can include tileQuery, spawn helpers, etc.
      for (let e of entities) {
        if (typeof e.update === "function") e.update(dt, context);
      }
    },
    drawAll(renderer) {
      // could sort by y for simple painter's algorithm
      entities.sort((a,b)=> (a.y || 0) - (b.y || 0));
      for (let e of entities) {
        if (typeof e.draw === "function") e.draw(renderer);
      }
    },
    getEntities() { return entities; }
  };
}
