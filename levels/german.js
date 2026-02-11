import { create as createPlayer, movement } from "../player.js";

const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 1000;

export class GermanLesson extends Phaser.Scene {
  constructor(...args) {
    super({ key: "GermanLesson", ...args });
  }

  preload() {
    this.load.atlas("player", "assets/player.png", "assets/player.json");
    this.load.image("classroom", "assets/classroom.png");
    this.load.image("chair", "assets/chair.jpg");
  }

  create() {
    // Settings
    this.physics.world.TILE_BIAS = 16;
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setZoom(1);

    //Background
    this.add.image(1000, 500, "classroom").setScale(1.8);

    this.player = createPlayer(this);
    this.player.setPosition(1000, 500);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.cameras.main.setBackgroundColor("#ccccff");

    // World

    this.chairs = this.physics.add.group();

    // Platforms
    this.chairs.create(200, 668, "chair");
    this.chairs.create(400, 668, "chair");
    this.chairs.create(600, 668, "chair");
    this.chairs.create(900, 668, "chair");
    this.chairs.create(1100, 668, "chair");
    this.chairs.create(1400, 668, "chair");
    this.chairs.create(1600, 668, "chair");
    this.chairs.create(1800, 668, "chair");

    this.chairs.children.each((chair) => {
      chair
        .setScale(0.2)
        .setCollideWorldBounds(true)
        .setDrag(500, 0)
        .setBounce(0.5, 0.5)
        //.setImmovable(true)
        .refreshBody();
    });
    this.physics.add.collider(this.player, this.chairs);
    this.physics.add.collider(this.chairs, this.chairs);

    this.keyK = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
  }

  update(time, delta) {
    movement();
    if (this.keyK.isDown && !this.prev) {
      this.prev = true;
      this.throwChairs();
    }
  }

  throwChairs() {
    this.chairs.children.each((chair) => {
      if (Math.random() < 0.6) {
        console.log("failed");
        return;
      }
      chair.body.setVelocity(0, Math.max(0.8, Math.random()) * 4000);
      this.time.delayedCall(500, () => {
        chair.body.setVelocityX(
          Math.ceil(Math.random() * 2000) *
            (Math.round(Math.random()) ? 1 : -1),
        );
        this.prev = false;
      });
    });
  }
}
