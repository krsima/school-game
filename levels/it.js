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
    //this.load.image("walker", "assets/walker.png");
  }

  create() {
      this.dead = false

      // Enemy texture (placeholder)
      this.textures.generate("enemyBox", {
        data: ["2222","2222","2222","2222"],
        pixelWidth: 8
      });

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
      .image(550, 500, "plank")
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
        y: 750,
        ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
        duration: 3000,
        repeat: -1,            // -1: infinity
        yoyo: true
      })

      var tween = this.tweens.add({
        targets: movingPlank2,
        x: 1180,
        y: 300,
        ease: 'Linear',
        duration: 4000,
        repeat: -1,
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

      // Enemy spawn
      this.enemies = this.add.group();
      spawnEnemy.call(this, 670, 400);

      // Player death by enemy collision
      this.matter.world.on("collisionstart", (event) => {
        event.pairs.forEach(pair => {

          const a = pair.bodyA.gameObject;
          const b = pair.bodyB.gameObject;

          if (!a || !b) return;

          if (
              (a === this.player && this.enemies.contains(b)) ||
              (b === this.player && this.enemies.contains(a))
          ) {
              die();
          }

        });
      });

  }

  update(time, delta) {
      movement();
      
      // Player death by falling
      if (!this.dead && player.body.position.y > 940) {
        this.dead = true;
        die()
      }

      // Enemy despawn
      this.enemies.getChildren().forEach(enemy => {
        if (enemy.y > 940) {
          enemy.destroy();
        }
      });
  }

}

// Spawn enemies
function spawnEnemy(x, y) {
  const enemy = this.matter.add.sprite(x, y, "enemyBox");

  enemy.setVelocityX(-2);      // walks left
  enemy.setFriction(0);
  enemy.setFrictionAir(0);
  enemy.setFrictionStatic(0);
  enemy.setBounce(0.2);
  enemy.setFixedRotation();

  this.enemies.add(enemy);
};
