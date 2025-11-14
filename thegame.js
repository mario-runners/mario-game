//------------------------------------
// ASSET PATHS
//------------------------------------
const ASSET = "https://raw.githubusercontent.com/mario-runners/mario-game/main/assets/";

const IMAGES = {
    marioSmall: ASSET + "sprites/mario/small_mario.png",
    marioBig:   ASSET + "sprites/mario/big_mario.png",
    marioFire:  ASSET + "sprites/mario/fire_mario.png",
    goomba:     ASSET + "sprites/enemies/goomba.png",
    qblock:     ASSET + "sprites/blocks/%3Fblock.png",
    brick:      ASSET + "sprites/blocks/brick.png",
    ground:     ASSET + "sprites/blocks/ground.png",
    flower:     ASSET + "sprites/powerups/fireflower.png",
    goal:       ASSET + "sprites/goal-poles/GoalPole_Normal.png",
    cloud:      ASSET + "sprites/bg/cloud.png"
};

const MUSIC = {
    title: ASSET + "music/title.mp3",
    overworld: ASSET + "music/overworld.mp3",
};

const INTRO = ASSET + "intros/1-1.mp4";


//------------------------------------
// PRELOAD SYSTEM
//------------------------------------
let loadCount = 0;
let loadTotal = 0;

function preload(src, type = "image") {
    loadTotal++;
    if (type === "image") {
        let img = new Image();
        img.src = src;
        img.onload = () => loadCount++;
        return img;
    } else if (type === "audio") {
        let audio = new Audio(src);
        audio.oncanplaythrough = () => loadCount++;
        return audio;
    }
}

const titleScreen = document.getElementById("titleScreen");
const introVideo = document.getElementById("introVideo");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const controls = document.getElementById("controls");


//------------------------------------
// LOAD IMAGES
//------------------------------------
const marioSmallImg = preload(IMAGES.marioSmall);
const marioBigImg   = preload(IMAGES.marioBig);
const marioFireImg  = preload(IMAGES.marioFire);
const goombaImg     = preload(IMAGES.goomba);
const qblockImg     = preload(IMAGES.qblock);
const brickImg      = preload(IMAGES.brick);
const groundImg     = preload(IMAGES.ground);
const flowerImg     = preload(IMAGES.flower);
const goalImg       = preload(IMAGES.goal);
const cloudImg      = preload(IMAGES.cloud);

const titleMusic    = preload(MUSIC.title, "audio");
const overworldMusic = preload(MUSIC.overworld, "audio");


//------------------------------------
// WAIT FOR EVERYTHING TO LOAD
//------------------------------------
let checkLoad = setInterval(() => {
    if (loadCount >= loadTotal) {
        clearInterval(checkLoad);
        titleMusic.loop = true;
        titleMusic.play();
    }
}, 100);


//------------------------------------
// GAME STATE
//------------------------------------
let gameStarted = false;
let player = {
    x: 100,
    y: 300,
    w: 40,
    h: 50,
    vx: 0,
    vy: 0,
    onGround: false,
    facing: 1,
    state: "small"   // small, big, fire
};


//------------------------------------
// TITLE SCREEN -> INTRO -> GAME
//------------------------------------
document.getElementById("startButton").onclick = () => {
    titleScreen.style.display = "none";
    titleMusic.pause();

    introVideo.src = INTRO;
    introVideo.style.display = "block";
    introVideo.play();

    introVideo.onended = () => {
        introVideo.style.display = "none";
        setTimeout(() => startGame(), 500);
    };
};


function startGame() {
    canvas.style.display = "block";
    controls.style.display = "block";
    overworldMusic.currentTime = 0;
    overworldMusic.loop = true;
    overworldMusic.play();
    gameStarted = true;
    gameLoop();
}


//------------------------------------
// LEVEL GEOMETRY (includes staircase)
//------------------------------------
const groundY = canvas.height - 80;
let platforms = [];

// Main ground
platforms.push({
    x: 0,
    y: groundY,
    width: 10000,
    height: 80,
    img: groundImg
});

// Staircase
const stairStartX = 9200;
const stairSteps = 8;
const stairSize = 40;

for (let i = 0; i < stairSteps; i++) {
    platforms.push({
        x: stairStartX + i * 40,
        y: groundY - (i + 1) * stairSize,
        width: 40,
        height: stairSize,
        img: brickImg
    });
}

// Goal
const goalPole = {
    x: stairStartX + stairSteps * 40 + 120,
    y: groundY - 150,
    w: 40,
    h: 150
};


//------------------------------------
// MAIN GAME LOOP
//------------------------------------
function gameLoop() {
    if (!gameStarted) return;

    update();
    draw();

    requestAnimationFrame(gameLoop);
}


//------------------------------------
// UPDATE
//------------------------------------
function update() {
    player.vy += 0.5; // gravity
    player.x += player.vx;
    player.y += player.vy;

    player.onGround = false;

    // Collision
    for (let p of platforms) {
        if (player.x < p.x + p.width &&
            player.x + player.w > p.x &&
            player.y + player.h > p.y &&
            player.y + player.h < p.y + p.height + player.vy) {

            player.y = p.y - player.h;
            player.vy = 0;
            player.onGround = true;
        }
    }

    // Flip left/right
    if (player.vx < 0) player.facing = -1;
    if (player.vx > 0) player.facing = 1;

    // Goal
    if (player.x > goalPole.x) {
        alert("🏁 Level Complete!");
        location.reload();
    }

    // Death
    if (player.y > canvas.height + 200) {
        overworldMusic.pause();
        alert("💀 You Died!");
        location.reload();
    }
}


//------------------------------------
// DRAW
//------------------------------------
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Player sprite based on state
    let sprite =
        player.state === "small" ? marioSmallImg :
        player.state === "big"   ? marioBigImg :
        marioFireImg;

    ctx.save();
    ctx.scale(player.facing, 1);
    ctx.drawImage(
        sprite,
        player.facing === 1 ? player.x : -player.x - player.w,
        player.y,
        player.w,
        player.h
    );
    ctx.restore();

    // Draw ground + blocks
    for (let p of platforms) {
        ctx.drawImage(p.img, p.x, p.y, p.width, p.height);
    }

    // Goal pole
    ctx.drawImage(goalImg, goalPole.x, goalPole.y, goalPole.w, goalPole.h);
}


//------------------------------------
// MOBILE BUTTONS
//------------------------------------
document.getElementById("leftBtn").onmousedown = () => player.vx = -4;
document.getElementById("rightBtn").onmousedown = () => player.vx = 4;
document.getElementById("leftBtn").onmouseup =
document.getElementById("rightBtn").onmouseup = () => player.vx = 0;

document.getElementById("jumpBtn").onclick = () => {
    if (player.onGround) player.vy = -10;
};

document.getElementById("fireBtn").onclick = () => {
    if (player.state === "fire") {
        console.log("FIREBALL!");
    }
};
