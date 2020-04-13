export class OilRig {
    platforms: MatterJS.BodyType[];

    constructor(public scene: Phaser.Scene, x: number, y: number) {
        scene.add.image(x, y, "misc", "oil-rig/rig").setDepth(-2).setOrigin(0);

        scene.matter.add.rectangle(x + 707, y + 720, 1150, 10, { isStatic: true });

        this.platforms = [
            scene.matter.add.rectangle(x + 510, y + 590, 220, 10, { isStatic: true }),
            scene.matter.add.rectangle(x + 877, y + 605, 170, 10, { isStatic: true }),
            scene.matter.add.rectangle(x + 315, y + 165, 275, 10, { isStatic: true }),
            scene.matter.add.rectangle(x + 690, y + 75, 187, 10, { isStatic: true }),
            scene.matter.add.rectangle(x + 690, y + 323, 205, 10, { isStatic: true }),
            scene.matter.add.rectangle(x + 1142, y + 455, 188, 10, { isStatic: true }),
        ];
    }

    update(playerYPos: number){
        for (const platform of this.platforms){
            if (playerYPos < platform.position.y){
                platform.collisionFilter.mask = 1;
            } else {
                platform.collisionFilter.mask = -8;
            }
        }
    }
}