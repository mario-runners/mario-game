// -----------------------
// GLOBAL STATE
// -----------------------
let ctx;
let mario = {
    x: 100,
    y: 280,
    w: 32,
    h: 48,
    vx: 0,
    vy: 0,
    facing: 1
};

let keys = {
    left: false,
    right: false,
    up: false,
    fire: false
};

let sprites = {};
let level = null;
let cameraX = 0;


// -----------------------
// ASSET LOADER
// -----------------------
async function loadImage(name, path) {
    return new Promise(res => {
        const img = new Image();
        img.onload = () => res(img);
        img.src = path;
    });
}

async function loadAssets() {
    sprites.marioSmall = await loadImage("marioSmall",
        "assets/sprites/mario/small_mario.png");

    sprites.ground = await loadImage("ground",
        "assets/sprites/blocks/ground.png");

    return true;
}


// -----------------------
// LEVEL LOADER
// -----------------------
async function loadLevel(path) {
    const res = await fetch(path);
    return await res.json();
}


// -----------------------
// INPUT HANDLING
// -----------------------
function attachControls() {
    document.getElementById("btnLeft").onclick = () => keys.left = true;
    document.getElementById("btnLeft").onmouseup =
    document.getElementById("btnLeft").ontouchend = () => keys.left = false;

    document.getElementById("btnRight").onclick = () => keys.right = true;
    document.getElementById("btnRight").onmouseup =
    document.getElementById("btnRight").ontouchend = () => keys.right = false;

    document.getElementById("btnUp").onclick = () => keys.up = true;
    document.getElementById("btnUp").onmouseup =
    document.getElementById("btnUp").ontouchend = () => keys.up = false;

    document.getElementById("btnFire").onclick = () => keys.fire = true;
}


// -----------------------
// PHYSICS
// -----------------------
function updateMario() {
    if (keys.left) {
        mario.vx = -2;
        mario.facing = -1;
    } else if (keys.right) {
        mario.vx = 2;
        mario.facing = 1;
    } else {
        mario.vx = 0;
    }

    mario.x += mario.vx;

    // gravity
    mario.vy += 0.5;
    mario.y += mario.vy;

    // simple ground collision:
    if (mario.y > 350) {
        mario.y = 350;
        mario.vy = 0;
    }

    // camera follows mario
    cameraX = mario.x - 200;
}


// -----------------------
// DRAWING
// -----------------------
function drawGround() {
    for (let i = -10; i < 300; i++) {
        ctx.drawImage(sprites.ground,
            i * 32 - cameraX,
            400);
    }
}

function drawMario() {
    ctx.save();
    ctx.translate(mario.x - cameraX + (mario.facing === -1 ? mario.w : 0), mario.y);
    ctx.scale(mario.facing, 1);
    ctx.drawImage(sprites.marioSmall, 0, 0, mario.w, mario.h);
    ctx.restore();
}

function render() {
    ctx.clearRect(0, 0, 800, 450);
    drawGround();
    drawMario();
}


// -----------------------
// MAIN LOOP
// -----------------------
function loop() {
    updateMario();
    render();
    requestAnimationFrame(loop);
}


// -----------------------
// EXPORTED STARTER
// -----------------------
export async function startGameEngine(canvas) {
    ctx = canvas.getContext("2d");

    await loadAssets();
    level = await loadLevel("modules/levels/1-1.json");
    attachControls();

    loop();
}
