export async function loadLevel(levelName) {
    const url = `assets/modules/levels/${levelName}.json`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to load level: ${levelName} (${response.status})`);
        }

        const json = await response.json();

        // Optional validation
        validateLevel(json, levelName);

        return json;
    } catch (err) {
        console.error(`LevelLoader ERROR for ${levelName}:`, err);
        return null;
    }
}

function validateLevel(level, name) {
    const requiredFields = ["tiles", "enemies", "playerStart"];

    for (const field of requiredFields) {
        if (!(field in level)) {
            console.warn(`⚠ Level "${name}" missing required field: "${field}"`);
        }
    }
}

/**
 * Preload all resources found inside the level JSON before the game starts
 * (sprites, audio, etc)
 */
export async function preloadLevelAssets(level) {
    const promises = [];

    // Preload tile sprites (if needed)
    if (level.tiles) {
        for (const tile of level.tiles) {
            if (tile.sprite) {
                promises.push(preloadImage(`assets/sprites/${tile.sprite}`));
            }
        }
    }

    // Preload enemy sprites
    if (level.enemies) {
        for (const enemy of level.enemies) {
            if (enemy.sprite) {
                promises.push(preloadImage(`assets/sprites/${enemy.sprite}`));
            }
        }
    }

    // Preload background music
    if (level.music) {
        promises.push(preloadAudio(`assets/audio/${level.music}`));
    }

    return Promise.all(promises);
}

function preloadImage(url) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = resolve;
        img.src = url;
    });
}

function preloadAudio(url) {
    return new Promise(resolve => {
        const audio = new Audio();
        audio.oncanplaythrough = resolve;
        audio.src = url;
    });
}
