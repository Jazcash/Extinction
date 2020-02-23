import { Physics } from "phaser";

// import { Body, Bodies } from "matter";

export class Player extends Phaser.Physics.Matter.Sprite {
    //body: Phaser.Types.Physics.Matter.MatterBody;
    //body: MatterJS.Body;
    body: MatterJS.BodyType;
    jumping = false;

    sensors: { [key: string]: MatterJS.BodyType}

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene.matter.world, x, y, texture, 0);

        this.scene.add.existing(this);

        const physicsEditorConfig: Phaser.Types.Physics.Matter.MatterSetBodyConfig = this.scene.cache.json.get('shapes')[texture];

        this.setBody(physicsEditorConfig);

        this.setFixedRotation();

        const friction = this.body.friction;
        
        this.world.on("collisionstart", (event: Physics.Matter.Events.CollisionStartEvent) => {
            event.pairs.forEach(pair => {
                if (pair.bodyA.label === "feet" || pair.bodyB.label === "feet"){
                    this.jumping = false;
                    this.body.friction = friction;
                }
            });
        });

        this.world.on("collisionend", (event: Physics.Matter.Events.CollisionStartEvent, a: MatterJS.BodyType, b: any) => {
            event.pairs.forEach(pair => {
                if (pair.bodyA.label === "feet" || pair.bodyB.label === "feet"){
                    this.jumping = true;
                    this.body.friction = 0;
                }
            });
        });
    }
}