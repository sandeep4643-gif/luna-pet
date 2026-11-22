
// ==========================================
// LUNA - LITTLE COMFORT PET
// Main Game Logic - Video Version
// ==========================================


// 1. GAME ELEMENTS

const lunaVideo = document.getElementById("lunaVideo");
const lunaMessage = document.getElementById("lunaMessage");
const moodText = document.getElementById("moodText");

const happinessBar = document.getElementById("happinessBar");
const hungerBar = document.getElementById("hungerBar");
const energyBar = document.getElementById("energyBar");
const comfortBar = document.getElementById("comfortBar");

const happinessValue = document.getElementById("happinessValue");
const hungerValue = document.getElementById("hungerValue");
const energyValue = document.getElementById("energyValue");
const comfortValue = document.getElementById("comfortValue");

const levelText = document.getElementById("levelText");
const xpText = document.getElementById("xpText");
const xpBar = document.getElementById("xpBar");

const backgroundMusic = document.getElementById("backgroundMusic");
const meowSound = document.getElementById("meowSound");
const purrSound = document.getElementById("purrSound");


// 2. GAME DATA

const defaultGame = {
    happiness: 80,
    hunger: 30,
    energy: 80,
    comfort: 70,
    xp: 0,
    level: 1,
    musicEnabled: true,
    soundEnabled: true
};

let game = loadGame();

let breathingInterval = null;
let breathingTimeout = null;
let breathingRunning = false;


// 3. SAVE AND LOAD GAME

function loadGame() {
    try {
        const saved = JSON.parse(localStorage.getItem("lunaGame"));

        if (!saved) return { ...defaultGame };

        return {
            ...defaultGame,
            ...saved
        };

    } catch (error) {
        return { ...defaultGame };
    }
}

function saveGame() {
    localStorage.setItem("lunaGame", JSON.stringify(game));
}


// 4. UPDATE STATISTICS

function updateStats() {

    const stats = [
        ["happiness", happinessBar, happinessValue],
        ["hunger", hungerBar, hungerValue],
        ["energy", energyBar, energyValue],
        ["comfort", comfortBar, comfortValue]
    ];

    stats.forEach(([key, bar, value]) => {

        game[key] = Math.max(0, Math.min(100, game[key]));

        bar.style.width = game[key] + "%";
        value.textContent = game[key] + "%";

    });

    updateLevel();

    saveGame();
}


// 5. XP AND LEVEL SYSTEM

function addXP(amount) {

    game.xp += amount;

    while (game.xp >= 100) {

        game.xp -= 100;
        game.level++;

        showMessage("Yay! We reached level " + game.level + "! 💗");

        playSound("meow");
    }

    updateLevel();
    saveGame();
}

function updateLevel() {

    levelText.textContent = "Level " + game.level;

    xpText.textContent = game.xp + " / 100 XP";

    xpBar.style.width = game.xp + "%";
}


// 6. LUNA VIDEO CONTROLS

const videoPaths = {
    idle: "assets/videos/idle.mp4",
    eating: "assets/videos/eating.mp4",
    playing: "assets/videos/playing.mp4",
    purring: "assets/videos/purring.mp4",
    story: "assets/videos/story.mp4"
};


// Play idle video continuously

function playIdleVideo() {

    if (!lunaVideo) return;

    lunaVideo.muted = true;
    lunaVideo.volume = 0;
    lunaVideo.loop = true;

    const idlePath = videoPaths.idle;

    if (!lunaVideo.getAttribute("src")?.endsWith("idle.mp4")) {

        lunaVideo.src = idlePath;
        lunaVideo.load();

    }

    lunaVideo.play().catch(error => {
        console.error("Idle video playback error:", error);
    });
}


// Play an interaction video once

function playActionVideo(action) {

    if (!lunaVideo || !videoPaths[action]) return;

    lunaVideo.pause();

    lunaVideo.muted = true;
    lunaVideo.volume = 0;
    lunaVideo.loop = false;

    lunaVideo.src = videoPaths[action];

    lunaVideo.load();

    lunaVideo.play().catch(error => {

        console.error("Action video playback error:", error);

        playIdleVideo();

    });
}


// Return to idle when an action video finishes

lunaVideo.addEventListener("ended", () => {

    playIdleVideo();

});


// 7. LUNA'S MESSAGES

function showMessage(message) {

    lunaMessage.textContent = message;

}


// 8. SOUND EFFECTS

function playSound(type) {

    if (!game.soundEnabled) return;

    let sound;

    if (type === "meow") {

        sound = meowSound;

    } else if (type === "purr") {

        sound = purrSound;

    }

    if (sound) {

        sound.pause();
        sound.currentTime = 0;

        sound.play().catch(error => {
            console.error("Sound playback error:", error);
        });

    }
}


// 9. BACKGROUND MUSIC

let musicStarted = false;

async function startMusic() {

    if (musicStarted || !game.musicEnabled) return;

    try {

        backgroundMusic.volume = 0.10;

        await backgroundMusic.play();

        musicStarted = true;

        document.getElementById("musicToggle").textContent = "♫";

    } catch (error) {

        console.error("Music playback error:", error);

    }
}


// Start background music after first user interaction

document.addEventListener("click", startMusic, { once: true });


// 10. PET INTERACTIONS

function interact(action) {

    switch (action) {

        case "feed":

            if (game.hunger <= 0) {

                showMessage("My tummy is full! Thank you! 💗");

                break;

            }

            game.hunger -= 25;
            game.happiness += 10;
            game.energy += 5;

            showMessage("Yummy! Thank you for feeding me! 🍓");

            playActionVideo("eating");

            playSound("meow");

            addXP(10);

            break;


        case "play":

            if (game.energy < 20) {

                showMessage("I'm a little tired. Can we rest first? 🥺");

                break;

            }

            game.happiness += 20;
            game.energy -= 15;
            game.hunger += 10;

            showMessage("That was so much fun! Let's play again! 🧶");

            playActionVideo("playing");

            playSound("meow");

            addXP(15);

            break;


        case "cuddle":

    game.comfort += 20;
    game.happiness += 10;

    showMessage("Purr... I love your hugs! You're my favourite! 💗");

    playActionVideo("purring");

    playSound("purr");

    setTimeout(() => {
        purrSound.pause();
        purrSound.currentTime = 0;
    }, 3000);

    addXP(12);

    break;

        case "sleep":

            game.energy += 30;
            game.happiness += 5;

            showMessage("Zzz... Thank you for letting me rest! 🌙");

            playActionVideo("purring");

            addXP(10);

            break;


        case "story":

            game.comfort += 15;
            game.energy += 5;

            showMessage("Once upon a time, a little kitten found a magical star... ✨");

            playActionVideo("story");

            playSound("purr");

            addXP(15);

            break;

    }

    updateStats();

}


// Connect interaction buttons

document.querySelectorAll(".action-button").forEach(button => {

    button.addEventListener("click", () => {

        const action = button.dataset.action;

        interact(action);

    });

});


// 11. MOOD CHECK-IN

const moodResponses = {

    "not-great": {
        message: "It's okay to have difficult days. You don't have to pretend to be happy. I'm right here. 💗",
        mood: "Mood: Comforting"
    },

    "okay": {
        message: "That's okay too! We don't have to be amazing every single day. Let's take it slowly. 🌷",
        mood: "Mood: Gentle"
    },

    "good": {
        message: "Yayyy! Your happiness makes my little heart jump! Let's celebrate! ✨",
        mood: "Mood: Excited"
    },

    "peaceful": {
        message: "A peaceful moment is a beautiful thing. Let's enjoy it together. 🌸",
        mood: "Mood: Peaceful"
    }

};


document.querySelectorAll(".mood-button").forEach(button => {

    button.addEventListener("click", () => {

        const selectedMood = button.dataset.mood;

        const response = moodResponses[selectedMood];

        document.getElementById("moodResponse").textContent =
            response.message;

        moodText.textContent = response.mood;

        showMessage(response.message);

        playSound("purr");

        document.querySelectorAll(".mood-button").forEach(btn => {

            btn.style.outline = "none";

        });

        button.style.outline = "3px solid #e9a3c0";

    });

});


// 12. COMFORT CORNER - BREATHING ACTIVITY

const breathingButton = document.getElementById("breathingButton");

const breathingVisual = document.getElementById("breathingVisual");

const breathingText = document.getElementById("breathingText");

const breathingTitle = document.getElementById("breathingTitle");

const breathingDescription =
    document.getElementById("breathingDescription");


function startBreathing() {

    if (breathingRunning) {

        stopBreathing();

        return;

    }

    breathingRunning = true;

    breathingButton.textContent = "Stop Exercise";

    breathingVisual.classList.add("breathing-active");

    breathingTitle.textContent = "Let's breathe together";

    showMessage("Let's take a peaceful moment together. 💗");

    let phase = 0;

    const phases = [
        { text: "Breathe in", seconds: 4 },
        { text: "Breathe out", seconds: 4 }
    ];

    function nextPhase() {

        if (!breathingRunning) return;

        const current = phases[phase];

        breathingText.textContent = current.text;

        breathingDescription.textContent =
            "Take your time. No need to rush.";

        phase = (phase + 1) % phases.length;

    }

    nextPhase();

    breathingInterval = setInterval(nextPhase, 4000);

    breathingTimeout = setTimeout(() => {

        if (breathingRunning) {

            stopBreathing();

            breathingTitle.textContent = "Beautifully done! 🌷";

            breathingDescription.textContent =
                "You gave yourself a peaceful moment. Well done!";

            breathingText.textContent = "Done!";

            game.comfort += 5;

            updateStats();

            addXP(10);

            showMessage("I'm proud of you. Let's keep taking care of ourselves! 💗");

        }

    }, 32000);

}


function stopBreathing() {

    breathingRunning = false;

    clearInterval(breathingInterval);

    clearTimeout(breathingTimeout);

    breathingVisual.classList.remove("breathing-active");

    breathingButton.textContent = "Start Breathing";

    breathingText.textContent = "Breathe";

    breathingTitle.textContent = "A moment just for you";

    breathingDescription.textContent =
        "Follow the circle and take a few gentle breaths.";

}


breathingButton.addEventListener("click", startBreathing);


// 13. POSITIVE AFFIRMATIONS

const affirmations = [

    "You don't have to do everything today. One small step is enough.",

    "You deserve kindness, especially from yourself.",

    "It's okay to slow down. Rest is productive too.",

    "You are doing better than you think.",

    "Your feelings are valid. Give yourself some space.",

    "You don't need to be perfect to be wonderful.",

    "Take a breath. This moment will pass too.",

    "You deserve moments of peace and happiness.",

    "Small progress is still progress.",

    "Be gentle with yourself. You're learning every day."

];


document.getElementById("newAffirmation").addEventListener("click", () => {

    const randomIndex = Math.floor(Math.random() * affirmations.length);

    document.getElementById("affirmationText").textContent =
        affirmations[randomIndex];

});


// 14. MUSIC CONTROLS

document.getElementById("musicToggle").addEventListener("click", async () => {

    if (game.musicEnabled) {

        backgroundMusic.pause();

        game.musicEnabled = false;

        musicStarted = false;

        document.getElementById("musicToggle").textContent = "♪";

    } else {

        game.musicEnabled = true;

        backgroundMusic.volume = 0.10;

        try {

            await backgroundMusic.play();

            musicStarted = true;

        } catch (error) {

            showMessage("Click again to start Luna's music. 💗");

        }

        document.getElementById("musicToggle").textContent = "♫";

    }

    saveGame();

});


document.getElementById("soundToggle").addEventListener("click", () => {

    game.soundEnabled = !game.soundEnabled;

    document.getElementById("soundToggle").textContent =
        game.soundEnabled ? "🔊" : "🔇";

    saveGame();

});


// 15. START GAME

function startGame() {

    updateStats();

    playIdleVideo();

    moodText.textContent = "Mood: Happy";

    backgroundMusic.volume = 0.10;

    document.getElementById("musicToggle").textContent =
        game.musicEnabled ? "♫" : "♪";

    document.getElementById("soundToggle").textContent =
        game.soundEnabled ? "🔊" : "🔇";

}


// 16. START THE GAME

startGame();
