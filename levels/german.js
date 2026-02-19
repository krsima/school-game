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
    this.matter.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setZoom(1);

    //Background
    this.add.image(1000, 500, "classroom").setScale(1.8);

    this.player = createPlayer(this);
    this.player.setPosition(1000, 500);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.cameras.main.setBackgroundColor("#ccccff");

    // World

    // Chairs (dynamic Matter bodies)
    const chairPositions = [200, 400, 600, 900, 1100, 1400, 1600, 1800];
    this.chairs = chairPositions.map((x) => {
      const chair = this.matter.add.image(x, 668, "chair");
      chair.setScale(0.2).setBounce(0.5);
      return chair;
    });

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
    this.chairs.forEach((chair) => {
      if (Math.random() < 0.6) {
        console.log("failed");
        return;
      }
      chair.setVelocity(0, Math.max(0.8, Math.random()) * -45);
      this.time.delayedCall(500, () => {
        chair.setVelocityX(
          Math.ceil(Math.random() * 33) * (Math.round(Math.random()) ? 1 : -1),
        );
        this.prev = false;
      });
    });
  }
}
