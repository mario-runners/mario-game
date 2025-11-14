// -----------------------------
// ASSET PATHS
// -----------------------------
const BASE = "https://raw.githubusercontent.com/mario-runners/mario-game/main/assets/";

const ASSETS = {
    sprites: {
        small: BASE + "sprites/mario/small_mario.png",
        big: BASE + "sprites/mario/big_mario.png",
        fire: BASE + "sprites/mario/fire_mario.png",
        ground: BASE + "sprites/blocks/ground.png",
        qblock: BASE + "sprites/blocks/question.png",
        brick: BASE + "sprites/blocks/brick.png",
        goomba: BASE + "sprites/enemies/goomba.png",
        koopa: BASE + "sprites/enemies/koopa.png",
        koopaShell: BASE + "sprites/enemies/koopashelled.png",
        fireflower: BASE + "sprites/powerups/fireflower.png",
        mushroom: BASE + "sprites/powerups/mushroom.png",
        cloud: BASE + "sprites/bg/cloud.png"
    },
    music: {
        title: BASE + "music/title.mp3",
        overworld: BASE + "music/overworld.mp3"
    },
    intro: BASE + "intros/1-1.mp4"
};

// -----------------------------
// PRELOADER
// -----------------------------
function preloadAssets(callback) {
    let total = 0;
    let loaded = 0;

    function count(obj) {
        for (let i in obj) total++;
    }

    function loadImage(src) {
        const img = new Image();
        img.onload = done;
        img.onerror = done;
        img.src = src;
    }

    function loadAudio(src) {
        const audio = new Audio();
        audio.oncanplaythrough = done;
        audio.onerror = done;
        audio.src = src;
    }

    count(ASSETS.sprites);
    count(ASSETS.music);
    total++; // Intro video

    for (let key in ASSETS.sprites) loadImage(ASSETS.sprites[key]);
    for (let key in ASSETS.music) loadAudio(ASSETS.music[key]);

    let vid = document.createElement("video");
    vid.onloadeddata = done;
    vid.src = ASSETS.intro;

    function done() {
        loaded++;
        if (loaded >= total) callback();
    }
}

// -----------------------------
// STARTUP LOGIC
// -----------------------------
const titleScreen = document.getElementById("title-screen");
const startButton = document.getElementById("start-button");
const introVideo = document.getElementById("intro-video");
const canvas = document.getElementById("gameCanvas");
const controls = document.getElementById("controls");

// Title Music
const titleMusic = new Audio(ASSETS.music.title);
titleMusic.loop = true;

// Overworld Music
const overworldMusic = new Audio(ASSETS.music.overworld);
overworldMusic.loop = true;

// Start sequence
startButton.onclick = () => {
    titleMusic.pause();
    titleScreen.classList.add("hidden");

    introVideo.classList.remove("hidden");
    introVideo.play();

    introVideo.onended = () => {
        introVideo.classList.add("hidden");
        startGame();
    };
};

preloadAssets(() => {
    console.log("All assets loaded!");
    titleMusic.play();
});

// -----------------------------
// MAIN GAME
// -----------------------------
let ctx = canvas.getContext("2d");

let mario = {
    x: 50,
    y: 300,
    vx: 0,
    vy: 0,
    size: "small",
    facing: "right",
    canShoot: false
};

let keys = {
    left: false,
    right: false,
    jump: false
};

// Fireball Array
let fireballs = [];

// -----------------------------
// Game Start
// -----------------------------
function startGame() {
    canvas.classList.remove("hidden");
    controls.classList.remove("hidden");
    overworldMusic.play();

    requestAnimationFrame(update);
}

// -----------------------------
// Update Loop
// -----------------------------
function update() {
    // Movement
    if (keys.left) mario.vx = -3;
    else if (keys.right) mario.vx = 3;
    else mario.vx = 0;

    mario.x += mario.vx;

    // Gravity
    mario.vy += 0.4;
    mario.y += mario.vy;

    // Ground collision
    if (mario.y > 380) {
        mario.y = 380;
        mario.vy = 0;
    }

    // Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMario();

    requestAnimationFrame(update);
}

// -----------------------------
// Draw Mario
// -----------------------------
function drawMario() {
    let img = new Image();
    if (mario.size === "small") img.src = ASSETS.sprites.small;
    if (mario.size === "big") img.src = ASSETS.sprites.big;
    if (mario.size === "fire") img.src = ASSETS.sprites.fire;

    ctx.save();
    if (mario.facing === "left") {
        ctx.scale(-1, 1);
        ctx.drawImage(img, -mario.x - 32, mario.y - 32, 32, 32);
    } else {
        ctx.drawImage(img, mario.x, mario.y - 32, 32, 32);
    }
    ctx.restore();
}

// -----------------------------
// Input
// -----------------------------
document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") { keys.left = true; mario.facing = "left"; }
    if (e.key === "ArrowRight") { keys.right = true; mario.facing = "right"; }
    if (e.key === " ") shootFireball();
});

document.addEventListener("keyup", e => {
    if (e.key === "ArrowLeft") keys.left = false;
    if (e.key === "ArrowRight") keys.right = false;
});

// Mobile Controls
document.getElementById("btnLeft").onmousedown = () => { keys.left = true; mario.facing = "left"; };
document.getElementById("btnLeft").onmouseup = () => { keys.left = false; };

document.getElementById("btnRight").onmousedown = () => { keys.right = true; mario.facing = "right"; };
document.getElementById("btnRight").onmouseup = () => { keys.right = false; };

document.getElementById("btnFire").onclick = shootFireball;

// -----------------------------
// Fireball
// -----------------------------
function shootFireball() {
    if (mario.size !== "fire") return;

    fireballs.push({
        x: mario.x + (mario.facing === "right" ? 20 : -20),
        y: mario.y,
        vx: mario.facing === "right" ? 6 : -6
    });
}
