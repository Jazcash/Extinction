const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const config = {
    startPos: { x: 8900 , y: -100 },
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
    deathMessages: [
        "It's the end of the world as we know it...",
        "At least it's not the end of the world... Oh wait",
        "Greta Thunberg would be disappointed in you",
        "Leave it to Extinction Rebellion...",
        "Rip Earth..."
    ],
};

for (const [key, value] of Array.from(urlParams.entries())){
    if (key in config){
        (config as any)[key] = parseInt(value);
    }
}

export default config;