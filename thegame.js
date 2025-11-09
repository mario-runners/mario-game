const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const prefix = "https://raw.githubusercontent.com/con-aga-tent/Mario-runners/main/assets";

// 🎵 Music
const music = new Audio(`${prefix}/music/overworld.mp3`);
music.loop = true;
window.addEventListener("click", () => music.play().catch(()=>{}), { once: true });

// 🖼️ Sprites
const marioSmall = new Image(); marioSmall.src = `${prefix}/sprites/mario/small_mario.png`;
const marioBig = new Image(); marioBig.src = `${prefix}/sprites/mario/big_mario.png`;
const marioFire = new Image(); marioFire.src = `${prefix}/sprites/mario/fire_mario.png`;

const groundImg = new Image(); groundImg.src = `${prefix}/sprites/blocks/ground.png`;
const brickImg = new Image(); brickImg.src = `${prefix}/sprites/blocks/brick.png`;
const qBlockImg = new Image(); qBlockImg.src = `${prefix}/sprites/blocks/%3Fblock.png`;
const goalPoleImg = new Image(); goalPoleImg.src = `${prefix}/sprites/goal-poles/GoalPole_Normal.png`;
const goombaImg = new Image(); goombaImg.src = `${prefix}/sprites/enemies/goomba.png`;
const fireFlowerImg = new Image(); fireFlowerImg.src = `${prefix}/sprites/powerups/fireflower.png`;
const cloudBg = new Image(); cloudBg.src = `${prefix}/sprites/bg/cloud.png`;

// 🧍 Mario
let player = {
  x: 100,
  y: 0,
  w: 32,
  h: 32,
  velX: 0,
  velY: 0,
  speed: 4,
  jumpForce: 10,
  grounded: false,
  state: "small", // small | big | fire
  facingRight: true,
  slidingFlag: false,
  invincible: 0
};

// 🔥 Fireballs
let fireballs = [];

// 🌍 Level Setup
const gravity = 0.5;
const groundHeight = 64;
const levelWidth = 10000;
const camera = { x: 0, y: 0 };

let platforms = [];
for (let i = 0; i < levelWidth; i += 64) {
  platforms.push({ x: i, y: canvas.height - groundHeight, w: 64, h: 64, img: groundImg });
}

// Staircase to goal
for (let i = 0; i < 6; i++) {
  platforms.push({ x: 9400 + i * 64, y: canvas.height - groundHeight - i * 64, w: 64, h: 64, img: brickImg });
}

// Question block
const qBlock = { x: 600, y: canvas.height - groundHeight - 128, w: 32, h: 32, hit: false };

// Fire flower
let fireFlower = null;

// Goal pole
const goalPole = { x: 9800, y: canvas.height - 320, w: 32, h: 320 };

// Enemies
let goombas = [{ x: 800, y: canvas.height - groundHeight - 32, w: 32, h: 32, dir: -1 }];

// 🎮 Controls
let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

document.getElementById("left").ontouchstart = () => keys["ArrowLeft"] = true;
document.getElementById("left").ontouchend = () => keys["ArrowLeft"] = false;
document.getElementById("right").ontouchstart = () => keys["ArrowRight"] = true;
document.getElementById("right").ontouchend = () => keys["ArrowRight"] = false;
document.getElementById("jump").ontouchstart = () => jump();
document.getElementById("fire").ontouchstart = () => shootFire();

function jump() {
  if (player.grounded && !player.slidingFlag) {
    player.velY = -player.jumpForce;
    player.grounded = false;
  }
}

function shootFire() {
  if (player.state === "fire" && fireballs.length < 3) {
    const dir = player.facingRight ? 1 : -1;
    fireballs.push({
      x: player.x + player.w / 2,
      y: player.y + player.h / 2,
      velX: 8 * dir,
      radius: 8
    });
  }
}

function rectsCollide(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// 🧠 Game Loop
function update() {
  if (player.slidingFlag) return;

  // Movement
  if (keys["ArrowRight"]) {
    player.velX = player.speed;
    player.facingRight = true;
  } else if (keys["ArrowLeft"]) {
    player.velX = -player.speed;
    player.facingRight = false;
  } else {
    player.velX = 0;
  }

  if (keys[" "]) jump();

  // Gravity
  player.velY += gravity;
  player.x += player.velX;
  player.y += player.velY;
  player.grounded = false;

  // Collisions
  for (let p of platforms) {
    if (!rectsCollide(player, p)) continue;

    const overlapX = (player.x + player.w / 2) - (p.x + p.w / 2);
    const overlapY = (player.y + player.h / 2) - (p.y + p.h / 2);
    const halfW = (player.w + p.w) / 2;
    const halfH = (player.h + p.h) / 2;

    if (Math.abs(overlapX) < halfW && Math.abs(overlapY) < halfH) {
      const diffX = halfW - Math.abs(overlapX);
      const diffY = halfH - Math.abs(overlapY);

      if (diffX >= diffY) {
        if (overlapY > 0) {
          // Hit from below
          player.y += diffY;
          player.velY = 0;

          // Check if block hit is question block
          if (p === qBlock && !qBlock.hit) {
            qBlock.hit = true;
            fireFlower = { x: qBlock.x, y: qBlock.y, w: 32, h: 32, vy: -1.5, resting: false };
          }
        } else {
          // Landed on top
          player.y -= diffY;
          player.velY = 0;
          player.grounded = true;
        }
      } else {
        // Left/Right
        if (overlapX > 0) player.x += diffX;
        else player.x -= diffX;
        player.velX = 0;
      }
    }
  }

  // Fire flower behavior
  if (fireFlower) {
    if (!fireFlower.resting) {
      fireFlower.y += fireFlower.vy;
      if (fireFlower.y <= qBlock.y - 32) {
        fireFlower.vy = 0;
        fireFlower.resting = true;
      }
    }
    // Pickup
    if (rectsCollide(player, fireFlower)) {
      fireFlower = null;
      player.state = "fire";
    }
  }

  // Fireballs move
  fireballs.forEach(f => f.x += f.velX);
  fireballs = fireballs.filter(f => f.x > camera.x && f.x < camera.x + canvas.width * 2);

  // Goombas move
  for (let g of goombas) {
    g.x += g.dir * 1.2;

    // Flip direction if hitting edge of ground
    if (g.x < 700 || g.x > 1000) g.dir *= -1;

    // Player collision
    if (rectsCollide(player, g) && player.invincible <= 0) {
      if (player.velY > 0 && player.y + player.h - 5 < g.y + g.h) {
        // Stomp
        player.velY = -8;
        g.dead = true;
      } else {
        // Damage
        if (player.state === "fire") player.state = "big";
        else if (player.state === "big") player.state = "small";
        else {
          alert("☠️ You Died!");
          location.reload();
        }
        player.invincible = 60;
      }
    }
  }
  goombas = goombas.filter(g => !g.dead);

  // Fireball hits goomba
  for (let f of fireballs) {
    for (let g of goombas) {
      if (rectsCollide({ x: f.x - f.radius, y: f.y - f.radius, w: f.radius*2, h: f.radius*2 }, g)) {
        g.dead = true;
      }
    }
  }

  if (player.invincible > 0) player.invincible--;

  // Flagpole detection
  if (
    !player.slidingFlag &&
    rectsCollide(player, goalPole)
  ) {
    player.slidingFlag = true;
    player.velX = player.velY = 0;
    player.x = goalPole.x - player.w + 10;
    const slide = setInterval(() => {
      player.y += 3;
      if (player.y + player.h >= canvas.height - groundHeight) {
        clearInterval(slide);
        setTimeout(() => {
          alert("✅ Level Complete!");
          location.reload();
        }, 500);
      }
    }, 16);
  }

  // Camera follow
  camera.x = Math.max(0, player.x - canvas.width / 2);
}

// 🎨 Draw
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Sky
  ctx.fillStyle = "#5c94fc";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < levelWidth; i += 400) {
    ctx.drawImage(cloudBg, i - camera.x * 0.5, 80, 128, 64);
  }

  // Ground and blocks
  for (let p of platforms) ctx.drawImage(p.img, p.x - camera.x, p.y, p.w, p.h);

  // Question block
  ctx.drawImage(qBlock.hit ? brickImg : qBlockImg, qBlock.x - camera.x, qBlock.y, qBlock.w, qBlock.h);

  // Fire flower
  if (fireFlower) ctx.drawImage(fireFlowerImg, fireFlower.x - camera.x, fireFlower.y, fireFlower.w, fireFlower.h);

  // Goal pole
  ctx.drawImage(goalPoleImg, goalPole.x - camera.x, goalPole.y, goalPole.w, goalPole.h);

  // Goombas
  for (let g of goombas) ctx.drawImage(goombaImg, g.x - camera.x, g.y, g.w, g.h);

  // Fireballs
  ctx.fillStyle = "orange";
  for (let f of fireballs) ctx.beginPath(), ctx.arc(f.x - camera.x, f.y, f.radius, 0, Math.PI * 2), ctx.fill();

  // Mario sprite
  ctx.save();
  ctx.translate(player.x - camera.x + player.w / 2, player.y + player.h / 2);
  ctx.scale(player.facingRight ? 1 : -1, 1);
  const marioImg = player.state === "fire" ? marioFire : player.state === "big" ? marioBig : marioSmall;
  ctx.drawImage(marioImg, -player.w / 2, -player.h / 2, player.w, player.h);
  ctx.restore();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
gameLoop();
