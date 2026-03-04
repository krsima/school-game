import { create as createPlayer, movement, die, player } from "../player.js";

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
      this.dead = false

      // Settings
      this.matter.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT + 100);
      this.cameras.main.setZoom(window.innerWidth / 1920 * 1.3);
  
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
      .image(650, 480, "monitor", null, { isStatic: true })
      .setScale(0.09);
      this.matter.add
      .image(1250, 313, "monitor", null, { isStatic: true })
      .setScale(0.075);
      this.matter.add
      .image(1400, 600, "monitor", null, { isStatic: true })
      .setScale(0.08);
      this.matter.add
      .image(1480, 600, "monitor", null, { isStatic: true })
      .setScale(0.08);
      this.matter.add
      .image(1560, 600, "monitor", null, { isStatic: true })
      .setScale(0.08);
      this.matter.add
      .image(1850, 550, "plank", null, { isStatic: true })
      .setScale(0.2);
      this.matter.add
      .image(1920, 550, "plank", null, { isStatic: true })
      .setScale(0.2);

      // Moving Platforms
      var movingPlank1 = this.matter.add
      .image(550, 750, "plank")
      .setScale(0.2)
      .setFixedRotation()
      .setMass(1000)
      .setIgnoreGravity(true);

      var movingPlank2 = this.matter.add
      .image(800, 300, "plank")
      .setScale(0.2)
      .setFixedRotation()
      .setMass(1000)
      .setIgnoreGravity(true);

      var tween = this.tweens.add({
        targets: movingPlank1,
        x: 550,
        y: 500,
        ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
        duration: 3000,
        repeat: -1,            // -1: infinity
        yoyo: true
      })

      var tween = this.tweens.add({
        targets: movingPlank2,
        x: 1180,
        y: 300,
        ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
        duration: 4000,
        repeat: -1,            // -1: infinity
        yoyo: true,

        // interpolation: null,
      });

      // Floor
      this.matter.add
      .image(280, 965, "table", null, { isStatic: true })
      .setScale(0.15);
      this.matter.add
      .image(380, 965, "table", null, { isStatic: true })
      .setScale(0.15);
      this.matter.add
      .image(900, 965, "table", null, { isStatic: true })
      .setScale(0.15);
      this.matter.add
      .image(1450, 965, "table", null, { isStatic: true })
      .setScale(0.15);
      this.matter.add
      .image(1550, 965, "table", null, { isStatic: true })
      .setScale(0.15);
  

      // Door (sensor for scene transition)
      const door = this.matter.add.image(1920, 475, "door", null, {
      isStatic: true,
      isSensor: true,
      });
      door.setScale(0.1);
    }

  update(time, delta) {
      movement();
      
      if (!this.dead && player.body.position.y > 900) {
        this.dead = true;
        die()
      }
  }

}
