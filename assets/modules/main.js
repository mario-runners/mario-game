import { startGameEngine } from "../thegame.js";

const titleScreen = document.getElementById("titleScreen");
const startBtn = document.getElementById("startBtn");
const intro = document.getElementById("levelIntro");
const canvas = document.getElementById("gameCanvas");

const LEVEL_INTRO_PATH = "assets/intros/1-1.mp4";

async function startIntro() {
    titleScreen.style.display = "none";
    intro.src = LEVEL_INTRO_PATH;
    intro.style.display = "block";

    await intro.play();

    return new Promise(res => {
        intro.onended = () => {
            intro.style.display = "none";
            res();
        };
    });
}

async function startGame() {
    canvas.style.display = "block";
    startGameEngine(canvas);
}

startBtn.addEventListener("click", async () => {
    startBtn.disabled = true;
    await startIntro();
    await startGame();
});
