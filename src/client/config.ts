const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

declare var __DEV__: boolean;

const config = {
    startPos: { x: 300 , y: -100 },
    speed: 7,
    crouchSpeed: 3,
    jump: 17,
    knockbackX: 7,
    knockbackY: 20,
    time: 180, // seconds
    rubbishAdds: 10, // seconds
    maxHealth: 5,
    logSpawnRate: 2, // seconds
    iceFriction: 0.01,
    harvesterRate: 3, // seconds
    immunityTime: 1.5,
    tutorialEnabled: true,
    musicEnabled: localStorage.getItem("musicEnabled") === "true",
    sfxEnabled: localStorage.getItem("sfxEnabled") === "true",
    deathMessages: [
        "It's the end of the world as we know it...",
        "At least it's not the end of the world... Oh wait",
        "Greta Thunberg would be disappointed in you",
        "Leave it to Extinction Rebellion...",
        "Rip Earth..."
    ],
    sounds: {
        music: ["title-loop", "game", "game-loop"],
        sfx: ["birds", "bulldozer", "button", "drill1", "drill2", "drill3", "footsteps", "gameover", "jump", "sea", "wind"]
    }
};

if (__DEV__){
    config.startPos = { x: 9312 , y: -100 };
}

for (const [key, value] of Array.from(urlParams.entries())){
    if (key in config){
        (config as any)[key] = parseFloat(value);
    }
}

export default config;