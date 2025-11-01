const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

const gravity = 0.67;
let scrollOffset = 0;
let isMuted = false;

// Player
const player = {
  x: 100,
  y: canvas.height - 164,
  width: 50,
  height: 64,
  velocityX: 0,
  velocityY: 0,
  speed: 5,
  jumping: false,
  state: "small" // small, big, fire
};

// Fireballs
const fireballs = [];

// Platforms
const groundHeight = 100;
const platforms = [
  { x: 0, y: canvas.height - groundHeight, width: 600, height: groundHeight },
  { x: 650, y: canvas.height - groundHeight - 50, width: 300, height: 50 },
  { x: 1000, y: canvas.height - groundHeight, width: 400, height: groundHeight }
];

// Goal Poles
const fakeGoal = { x: 950, y: canvas.height - groundHeight - 150, width: 40, height: 150 };
const realGoal = { x: 1100, y: canvas.height - groundHeight - 150, width: 40, height: 150 };

// Load images
const marioImg = {
  small: new Image(),
  big: new Image(),
  fire: new Image()
};
marioImg.small.src = "assets/sprites/mario/small_mario.png";
marioImg.big.src = "assets/sprites/mario/big_mario.png";
marioImg.fire.src = "assets/sprites/mario/fire_mario.png";

const goalFakeImg = new Image();
goalFakeImg.src = "assets/sprites/goal-poles/GoalPole_Fake.png";
const goalRealImg = new Image();
goalRealImg.src = "assets/sprites/goal-poles/Regular_GoalPole.png";

// Music
const music = new Audio("assets/music/overworld.mp3");
music.loop = true;
music.volume = 0.5;
music.play();

// Buttons
document.getElementById("muteBtn").onclick = () => {
  isMuted = !isMuted;
  music.muted = isMuted;
  document.getElementById("muteBtn").textContent = isMuted ? "🔇" : "🔊";
};

// Fire button
document.getElementById("fireBtn").onclick = () => {
  if(player.state === "fire") {
    fireballs.push({ x: player.x + player.width, y: player.y + 20, radius: 10, speed: 10 });
  }
};

// Controls
let keys = {};
onkeydown = (e) => keys[e.code] = true;
onkeyup = (e) => keys[e.code] = false;

// D-pad buttons
const buttonMap = { left: "ArrowLeft", right: "ArrowRight", up: "ArrowUp", down: "ArrowDown" };
for(let id in buttonMap){
  const key = buttonMap[id];
  const btn = document.getElementById(id);
  btn.addEventListener("touchstart", () => keys[key] = true);
  btn.addEventListener("touchend", () => keys[key] = false);
  btn.addEventListener("mousedown", () => keys[key] = true);
  btn.addEventListener("mouseup", () => keys[key] = false);
}

// Update
function update() {
  // Movement
  player.velocityX = 0;
  if(keys["ArrowRight"]) player.velocityX = player.speed;
  if(keys["ArrowLeft"]) player.velocityX = -player.speed;

  // Jump
  if(keys["ArrowUp"] && !player.jumping){
    player.velocityY = -15;
    player.jumping = true;
  }

  // Gravity
  player.velocityY += gravity;
  player.x += player.velocityX;
  player.y += player.velocityY;

  // Camera
  scrollOffset = player.x - 100;

  // Platform collision
  for(const plat of platforms){
    if(player.x + player.width > plat.x &&
       player.x < plat.x + plat.width &&
       player.y + player.height > plat.y &&
       player.y + player.height < plat.y + 20 &&
       player.velocityY >= 0
      ){
      player.y = plat.y - player.height;
      player.velocityY = 0;
      player.jumping = false;
    }
  }

  // Respawn if falls
  if(player.y > canvas.height){
    if(player.state === "fire") player.state = "big";
    else if(player.state === "big") player.state = "small";
    else { player.x = 100; player.y = canvas.height - groundHeight - 64; }
    player.x = 100;
    player.y = canvas.height - groundHeight - 64;
    player.velocityY = 0;
  }

  // Fireball update
  for(let i = fireballs.length - 1; i >= 0; i--){
    fireballs[i].x += fireballs[i].speed;
    if(fireballs[i].x > canvas.width + scrollOffset) fireballs.splice(i,1);
  }

  // Fake goal check
  if(player.x + player.width > fakeGoal.x &&
     player.x < fakeGoal.x + fakeGoal.width &&
     player.y + player.height > fakeGoal.y){
    alert("🚫 Fake Goal! Find the real one!");
    player.x = 100;
    player.y = canvas.height - groundHeight - 64;
  }

  // Real goal check
  if(player.x + player.width > realGoal.x &&
     player.x < realGoal.x + realGoal.width &&
     player.y + player.height > realGoal.y){
    alert("🎉 Level Complete!");
    player.x = 100;
    player.y = canvas.height - groundHeight - 64;
  }
}

// Draw
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Platforms
  ctx.fillStyle = "#8B4513";
  for(const plat of platforms) ctx.fillRect(plat.x - scrollOffset, plat.y, plat.width, plat.height);

  // Player
  ctx.drawImage(marioImg[player.state], player.x - scrollOffset, player.y, player.width, player.height);

  // Fireballs
  ctx.fillStyle = "orange";
  for(const f of fireballs){
    ctx.beginPath();
    ctx.arc(f.x - scrollOffset, f.y, f.radius, 0, Math.PI*2);
    ctx.fill();
  }

  // Goal poles
  ctx.drawImage(goalFakeImg, fakeGoal.x - scrollOffset, fakeGoal.y, fakeGoal.width, fakeGoal.height);
  ctx.drawImage(goalRealImg, realGoal.x - scrollOffset, realGoal.y, realGoal.width, realGoal.height);
}

// Loop
function gameLoop(){
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
gameLoop();
