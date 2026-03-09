import { create as createPlayer, movement, die, player } from "../player.js";

const WORLD_WIDTH = 3000;
const WORLD_HEIGHT = 1000;

export class ITLesson extends Phaser.Scene {
  constructor(...args) {
    super({ key: "ITLesson", ...args });
  }

  preload() {
    this.load.atlas("player", "assets/player.png", "assets/player.json");
    this.load.image("it-classroom", "assets/it-classroom.jpg");
    this.load.image("walker", "assets/walker.png");
    this.load.image("rocketL", "assets/rocketL.png");
    this.load.image("rocketR", "assets/rocketR.png");
    this.load.image("monitor", "assets/monitor.jpg");
    this.load.image("table", "assets/table.png");
    this.load.image("plank", "assets/plank.png");
    this.load.image("door", "assets/door.jpg");
  }

  create() {
    this.dead = false;

    // Settings
    this.matter.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT + 100);
    this.cameras.main.setZoom((window.innerWidth / 1920) * 1.3);

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
      .setScale(0.08);
    this.matter.add
      .image(1330, 313, "monitor", null, { isStatic: true })
      .setScale(0.08);
    this.matter.add
      .image(1410, 313, "monitor", null, { isStatic: true })
      .setScale(0.08);
    this.matter.add
      .image(1490, 313, "monitor", null, { isStatic: true })
      .setScale(0.08);

    this.matter.add.rectangle(2120, 600, 720, 77, { isStatic: true }); // physics body for monitor platform
    const monitorPositions1 = [
      1800, 1880, 1960, 2040, 2120, 2200, 2280, 2360, 2440,
    ];
    this.monitors = monitorPositions1.map((x) => {
      const monitor = this.add.image(x, 600, "monitor");
      monitor.setScale(0.08);
      return monitor;
    });

    this.matter.add.rectangle(2760, 440, 400, 77, { isStatic: true }); // physics body for door platform
    const monitorPositions2 = [2600, 2680, 2760, 2840, 2920];
    this.monitors = monitorPositions2.map((x) => {
      const monitor = this.add.image(x, 440, "monitor");
      monitor.setScale(0.08);
      return monitor;
    });

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
      ease: "Linear", // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 3000,
      repeat: -1, // -1: infinity
      yoyo: true,

      // interpolation: null,
    });

    var tween = this.tweens.add({
      targets: movingPlank2,
      x: 1180,
      y: 300,
      ease: "Linear",
      duration: 4000,
      repeat: -1,
      yoyo: true,
    });

    // Floor
    this.matter.add.rectangle(200, 925, 400, 20, { isStatic: true }); // physics body for spawn platform
    this.add.image(100, 965, "table").setScale(0.15);
    this.add.image(200, 965, "table").setScale(0.15);
    this.add.image(300, 965, "table").setScale(0.15);
    this.matter.add
      .image(850, 965, "table", null, { isStatic: true })
      .setScale(0.15);
    this.matter.add
      .image(1480, 965, "table", null, { isStatic: true })
      .setScale(0.15);

    // Door (sensor for scene transition)
    const door = this.matter.add.image(2870, 350, "door", null, {
      isStatic: true,
      isSensor: true,
    });
    door.setScale(0.1);
    this.matter.world.on("collisionstart", (event) => {
      for (const pair of event.pairs) {
        const involvesPlayer =
          pair.bodyA === player.body || pair.bodyB === player.body;
        const involvesDoor =
          pair.bodyA === door.body || pair.bodyB === door.body;
        if (involvesPlayer && involvesDoor) {
          this.teacherspeach = this.make
            .text({
              x: player.x,
              y: player.y - 100,
              text: "Gewonnen!",
              style: {
                fontSize: "24px",
                fontFamily: "Arial",
                color: "#ffffff",
                align: "center", // 'left'|'center'|'right'|'justify'
              },
              add: true,
            })
            .setOrigin(0.5, 0.5);

          this.player.checkpoint = "OutsideSchool";
          this.time.delayedCall(3000, () => {
            this.scene.start("OutsideSchool");
          });
        }
      }
    });

    // Enemy groups
    this.walkers = this.add.group();
    this.rockets = this.add.group();

    // Walker spawns
    this.time.delayedCall(3000, () => {
      spawnWalker.call(this, 650, 410, 33, 400); // x, y, leftBound, rightBound, direction (optional, default left)
    });
    this.time.delayedCall(9000, () => {
      spawnWalker.call(this, 2380, 575, 1775, 2465, -1); // left
    });
    this.time.delayedCall(10000, () => {
      spawnWalker.call(this, 2380, 575, 1775, 2465, 1); // right
    });
    this.time.delayedCall(12500, () => {
      spawnWalker.call(this, 2380, 575, 1775, 2465, 1); // right
    });

    // Rocket spawns
    spawnRocket.call(this, 0, 378, 8);
    spawnRocket.call(this, WORLD_WIDTH - 50, 247, -6);

    // Handle collisions
    this.matter.world.on("collisionstart", (event) => {
      event.pairs.forEach((pair) => {
        const objA = pair.bodyA.gameObject;
        const objB = pair.bodyB.gameObject;

        if (!objA || !objB) return;

        // Player touches enemy → death
        if (
          (objA === this.player &&
            (this.walkers.contains(objB) || this.rockets.contains(objB))) ||
          (objB === this.player &&
            (this.walkers.contains(objA) || this.rockets.contains(objA)))
        ) {
          if (!this.dead) {
            this.dead = true;
            die();
          }
          return;
        }

        // Walker hits a wall (static object) → turn around
        const normal = pair.collision.normal;

        if (objA && this.walkers.contains(objA) && pair.bodyB.isStatic) {
          if (Math.abs(normal.x) > 0.5) {
            objA.direction *= -1;
          }
        }

        if (objB && this.walkers.contains(objB) && pair.bodyA.isStatic) {
          if (Math.abs(normal.x) > 0.5) {
            objB.direction *= -1;
          }
        }

        // Turn around if colliding with another walker
        if (
          objA &&
          objB &&
          this.walkers.contains(objA) &&
          this.walkers.contains(objB)
        ) {
          objA.direction *= -1;
          objB.direction *= -1;
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

    // Walker behaviour
    this.walkers.getChildren().forEach((walker) => {
      if (!walker.body) return; // walker might have been destroyed in a previous iteration

      walker.setVelocityX(2 * walker.direction); // Maintain constant horizontal movement

      // Despawn if fallen
      if (walker.y > 940) {
        walker.destroy(true);
      }

      // Turn around at boundaries
      if (walker.body.velocity.x < 0 && walker.x <= walker.leftBound) {
        walker.direction = 1;
      }
      if (walker.body.velocity.x > 0 && walker.x >= walker.rightBound) {
        walker.direction = -1;
      }
    });

    // Rocket movement
    this.rockets.getChildren().forEach((rocket) => {
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
function spawnWalker(x, y, leftBound, rightBound, direction = -1) {
  const walker = this.matter.add.sprite(x, y, "walker").setScale(0.45);

  walker.direction = direction;

  walker.leftBound = leftBound;
  walker.rightBound = rightBound;

  walker.setFriction(0);
  walker.setFrictionAir(0);
  walker.setFrictionStatic(0);
  walker.setBounce(0.2);
  walker.setFixedRotation();

  this.walkers.add(walker);
}

function spawnRocket(x, y, speed) {
  const sprite = speed > 0 ? "rocketR" : "rocketL";

  const rocket = this.matter.add.sprite(x, y, sprite).setScale(0.15);

  rocket.setVelocityX(speed);
  rocket.setIgnoreGravity(true);

  rocket.setFriction(0);
  rocket.setFrictionAir(0);
  rocket.setFrictionStatic(0);
  rocket.setBounce(0);
  rocket.setFixedRotation();

  this.rockets.add(rocket);
}
