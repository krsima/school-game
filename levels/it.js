import { create as createPlayer, movement } from "../player.js";

const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 1000;

export class ITLesson extends Phaser.Scene {

  constructor( ...args ) {
    super({ key: 'ITLesson', ...args })
  }

  preload() {
    this.load.atlas("player", "assets/player.png", "assets/player.json");
    this.load.image("it-classroom", "assets/it-classroom.jpg");
    this.load.image("monitor", "assets/monitor.jpg");
    this.load.image("table", "assets/table.png");
    this.load.image("plank", "assets/plank.png");
  }

  create() {
      // Settings
      this.matter.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT + 100);
      this.cameras.main.setZoom(1.3);
  
      // Background
      this.add.image(1456, 571, "it-classroom");
      var player = createPlayer(this);
      this.cameras.main.startFollow(player, true, 0.1, 0.1);  
      this.cameras.main.setBackgroundColor("#ccccff");

      // Platforms (static Matter bodies)
      this.matter.add
      .image(460, 870, "monitor", null, { isStatic: true })
      .setScale(0.08);
      this.matter.add
      .image(430, 965, "table", null, { isStatic: true })
      .setScale(0.15);

      // Moving Platforms
      var movingPlank = this.matter.add
      .image(466, 600, "plank")
      .setScale(0.2)
      .setFixedRotation()
      .setMass(1000)
      .setIgnoreGravity(true);

      var tween = this.tweens.add({
        targets: movingPlank,
        x: [100, 300, 200, 600],
        y: 600,
        ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
        duration: 3000,
        repeat: -1,            // -1: infinity
        yoyo: true,

        // interpolation: null,
      });
    }

  update(time, delta) {
      movement();
  }
}
