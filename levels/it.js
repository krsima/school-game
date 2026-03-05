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

      // Enemy texture (placeholder)
      this.textures.generate("enemyBox", {
        data: ["2222","2222","2222","2222"],
        pixelWidth: 6
      });

      // Rocket texture (placeholder)
      this.textures.generate("rocketBox", {
        data: ["2222","2222","2222","2222"],
        pixelWidth: 6
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
      .image(600, 480, "monitor", null, { isStatic: true })
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
      .image(500, 500, "plank")
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
        x: 500,
        y: 750,
        ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
        duration: 3000,
        repeat: -1,            // -1: infinity
        yoyo: true

        // interpolation: null,
      })

      var tween = this.tweens.add({
        targets: movingPlank2,
        x: 1180,
        y: 300,
        ease: 'Linear',
        duration: 4000,
        repeat: -1,
        yoyo: true,
      });

      // Floor
      this.matter.add.rectangle(200, 925, 400, 20, {        // physics body for spawn platform
        isStatic: true
      });
      this.add
      .image(100, 965, "table")
      .setScale(0.15)
      this.add
      .image(200, 965, "table")
      .setScale(0.15);
      this.add
      .image(300, 965, "table")
      .setScale(0.15);
      this.matter.add
      .image(850, 965, "table", null, { isStatic: true })
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

      // Enemy groups
      this.enemies = this.add.group();
      this.rockets = this.add.group();

      // Enemy spawns
      this.time.delayedCall(3000, () => {
        spawnEnemy.call(this, 650, 410);
      });
      spawnRocket.call(this, 0, 380, 7);
      spawnRocket.call(this, WORLD_WIDTH - 50, 250, -5);

      // Handle collisions
      this.matter.world.on("collisionstart", (event) => {

        event.pairs.forEach(pair => {

          const objA = pair.bodyA.gameObject;
          const objB = pair.bodyB.gameObject;

          if (!objA || !objB) return;

          // Player touches enemy → death
          if (
              (objA === this.player && (this.enemies.contains(objB) || this.rockets.contains(objB))) ||
              (objB === this.player && (this.enemies.contains(objA) || this.rockets.contains(objA)))
          ) {
            if (!this.dead) {
              this.dead = true;
              die();
            }
            return;
          }

          // Enemy hits a wall (static object) → turn around
          const normal = pair.collision.normal;

          if (objA && this.enemies.contains(objA) && pair.bodyB.isStatic) {
            if (Math.abs(normal.x) > 0.5) {
              objA.direction *= -1;
            }
          }

          if (objB && this.enemies.contains(objB) && pair.bodyA.isStatic) {
            if (Math.abs(normal.x) > 0.5) {
              objB.direction *= -1;
            }
          }

        });

      });


  }

  update(time, delta) {

    movement();

    // Player falls off the map
    if (!this.dead && this.player && this.player.body.position.y > 940) {
      this.dead = true;
      die();
    }

    // Enemy behaviour
    this.enemies.getChildren().forEach(enemy => {

      // Maintain constant horizontal movement
      enemy.setVelocityX(2 * enemy.direction);

      // Turn around only at the left wall
      if (enemy.x <= 20) {
        enemy.direction = 1;
      }

      // Despawn if fallen
      if (enemy.y > 940) {
        enemy.destroy();
      }

    });

    // Rocket movement
    this.rockets.getChildren().forEach(rocket => {

      // moving right
      if (rocket.body.velocity.x > 0 && rocket.x > WORLD_WIDTH - 50) {
        rocket.setPosition(50, rocket.y);
      }

      // moving left
      if (rocket.body.velocity.x < 0 && rocket.x < 50) {
        rocket.setPosition(WORLD_WIDTH - 50, rocket.y);
      }

    });

  }

}

// Spawn enemies
function spawnEnemy(x, y) {
  const enemy = this.matter.add.sprite(x, y, "enemyBox");

  enemy.direction = -1;

  enemy.setFriction(0);
  enemy.setFrictionAir(0);
  enemy.setFrictionStatic(0);
  enemy.setBounce(0.2);
  enemy.setFixedRotation();

  this.enemies.add(enemy);
}

function spawnRocket(x, y, speed) {
  const rocket = this.matter.add.sprite(x, y, "rocketBox");

  rocket.setVelocityX(speed);
  rocket.setIgnoreGravity(true);

  rocket.setFriction(0);
  rocket.setFrictionAir(0);
  rocket.setFrictionStatic(0);
  rocket.setBounce(0);
  rocket.setFixedRotation();

  this.rockets.add(rocket);
}
