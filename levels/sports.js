import { create as createPlayer, movement, die, player } from "../player.js";

const WORLD_WIDTH = 2300;
const WORLD_HEIGHT = 1000;

export class SportsLesson extends Phaser.Scene {
  constructor(...args) {
    super({ key: "SportsLesson", ...args });
  }

  preload() {
    this.load.atlas("player", "assets/player.png", "assets/player.json");
    this.load.image("sports-hall", "assets/sports-hall.jpg");     // sports-hall resolution: 1728 * 1152
    this.load.image("walker", "assets/walker.png");
    this.load.image("table", "assets/table.png");
    this.load.image("key", "assets/key.png");
    this.load.image("lock", "assets/lock.png")
    this.load.image("door", "assets/door.jpg")
  }

  create() {

    this.dead = false;
    this.keysCollected = 0;

    // Settings
    this.matter.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT + 100);
    this.cameras.main.setZoom((window.innerWidth / 1920) * 1.3);

    //Background
    this.add.image(1150, 500, "sports-hall").setScale(1.4);

    this.player = createPlayer(this);
    this.player.setPosition(50, 500);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBackgroundColor("#ccccff");

    // World
    this.make.text({
      x: 100,
      y: 740,
      text: "Sammle die zwei Schlüssel ein um die Tür zu öffnen",
      style: {
        fontSize: "24px",
        fontFamily: "Arial",
        color: "#ffffff",
        align: "center", // 'left'|'center'|'right'|'justify'
      },
      add: true,
    });


    // Platforms (static Matter bodies)


    // Door (sensor for scene transition)
    const door = this.matter.add.image(400, 950, "door", null, {
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
        if (involvesPlayer && involvesDoor && this.doorUnlocked) {
          this.teacherspeach = this.make
            .text({
              x: player.x,
              y: player.y - 100,
              text: "Gewonnen!",
              style: {
                fontSize: "24px",
                fontFamily: "Arial",
                color: "#ffffff",
                align: "center",  // 'left'|'center'|'right'|'justify'
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

    // Keys and locks
    this.keys = [];

    const key1 = this.matter.add.image(300, 800, "key", null, {
      isStatic: true,
      isSensor: true
    }).setScale(0.1);

    const key2 = this.matter.add.image(500, 800, "key", null, {
      isStatic: true,
      isSensor: true
    }).setScale(0.1);

    this.keys.push(key1, key2);

    this.lock = this.add.image(400, 950, "lock").setScale(0.08);


    // Enemy groups
    this.walkers = this.add.group();
    this.rockets = this.add.group();

    // Walker spawns
    this.time.delayedCall(1000, () => {
      spawnWalker.call(this, 900, 1000, 800, WORLD_WIDTH - 30);   // x, y, leftBound, rightBound, direction (optional, default left/-1)
    });
    this.time.delayedCall(5000, () => {
      spawnWalker.call(this, 900, 1000, 800, WORLD_WIDTH - 30);
    });


    // Handle collisions
    this.matter.world.on("collisionstart", (event) => {
      event.pairs.forEach((pair) => {
        const objA = pair.bodyA.gameObject;
        const objB = pair.bodyB.gameObject;

        if (!objA || !objB) return;

        // Player touches key
        if (objA === this.player && this.keys.includes(objB)) {
          collectKey.call(this, objB);
        }
        if (objB === this.player && this.keys.includes(objA)) {
          collectKey.call(this, objA);
        }

        // Player touches enemy → death
        if (
          (objA === this.player &&
            (this.walkers.contains(objB))) ||
          (objB === this.player &&
            (this.walkers.contains(objA)))
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

    // Walker behaviour
    this.walkers.getChildren().forEach((walker) => {
      if (!walker.body) return; // walker might have been destroyed in a previous iteration

      walker.setVelocityX(2 * walker.direction); // Maintain constant horizontal movement

      // Turn around at boundaries
      if (walker.body.velocity.x < 0 && walker.x <= walker.leftBound) {
        walker.direction = 1;
      }
      if (walker.body.velocity.x > 0 && walker.x >= walker.rightBound) {
        walker.direction = -1;
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

function collectKey(key) {

  key.destroy();    // hide key
  this.keysCollected++;

  // remove lock when both keys collected
  if (this.keysCollected >= 2) {
    this.lock.destroy();
    this.doorUnlocked = true;
  }

}
