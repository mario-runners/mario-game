// modules/entities/goomba.js
import { aabbIntersect } from "../engine/physics.js";

export function createGoomba(x,y,img) {
  const goomba = {
    x, y, w: 40, h: 40,
    vx: -0.8,
    alive: true,
    img,
    update(dt, ctx) {
      if (!this.alive) return;
      // simple patrol
      this.x += this.vx * dt;
      // reverse on solid tile ahead using tileQuery
      const aheadX = this.vx < 0 ? this.x - 4 : this.x + this.w + 4;
      const foot = { x: aheadX, y: this.y + this.h + 1, w: 2, h: 2 };
      const solidAhead = ctx.tileQuery(foot.x, foot.y, foot.w, foot.h);
      if (!solidAhead) {
        this.vx *= -1; // turn around at edges
      }
      // player interactions: stomp handled by engine / collision logic (external)
    },
    draw(renderer) {
      renderer.drawSprite(this.img, this.x, this.y, this.w, this.h, false);
    }
  };
  return goomba;
}
