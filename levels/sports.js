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
    this.load.image("lock", "assets/lock.png");
    this.load.image("door", "assets/door.jpg");
    this.load.image("box", "assets/box.png");
    this.load.image("plank", "assets/plank.png");
  }

  create() {

    // State variables
    this.dead = false;
    this.keysCollected = 0;
    this.doorUnlocked = false;

    // Settings
    this.matter.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT + 100);
    this.cameras.main.setZoom((window.innerWidth / 1920) * 1.3);

    // Background
    this.add.image(1150, 500, "sports-hall").setScale(1.4);

    // Player & Cams
    this.player = createPlayer(this);
    this.player
      .setPosition(50, 500)
      .setDepth(10);    // rendering order

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
    }).setDepth(15);


    // Platforms (static Matter bodies)
    this.matter.add
      .image(1800, 740, "box", null, { isStatic: true })
      .setScale(0.12);
    this.matter.add
      .image(650, 400, "box", null, { isStatic: true })
      .setScale(0.12)

    this.matter.add.rectangle(200, 400, 320, 70, { isStatic: true });   // physics body for box platform (x, y, width, height)

    const boxPositions1 = [
      50, 150, 250, 350
    ];
    this.boxes = boxPositions1.map((x) => {
      const box = this.add.image(x, 400, "backpack");    // visual for box platform
      box.setScale(0.08);
      return box;
    });


    // Moving Platforms
    var movingPlank1 = this.matter.add
      .image(1500, 550, "plank")
      .setScale(0.2)
      .setFixedRotation()
      .setMass(1000)
      .setIgnoreGravity(true);

    this.tweens.add({
      targets: movingPlank1,
      x: 900,
      y: 450,
      ease: "Linear",   // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 3000,
      repeat: -1,   // -1: infinity
      yoyo: true,

      // interpolation: null,
    });

    var movingPlank2 = this.matter.add
      .image(2200, 650, "plank")
      .setScale(0.2)
      .setFixedRotation()
      .setMass(1000)
      .setIgnoreGravity(true);

    this.tweens.add({
      targets: movingPlank2,
      x: 2200,
      y: 150,
      ease: "Linear",
      duration: 3000,
      repeat: -1,
      yoyo: true,
    });
    

    // Floor
    this.matter.add.rectangle(200, 925, 400, 20, { isStatic: true });   // physics body for spawn platform
    this.add.image(100, 965, "table").setScale(0.15);
    this.add.image(200, 965, "table").setScale(0.15);
    this.add.image(300, 965, "table").setScale(0.15);

    this.matter.add
      .image(900, 965, "table", null, { isStatic: true })
      .setScale(0.15);

    this.matter.add.rectangle(1530, 925, 400, 20, { isStatic: true });   // physics body for platform
    this.add.image(1480, 965, "table").setScale(0.15);    // visual for platform
    this.add.image(1580, 965, "table").setScale(0.15);

    // Door (sensor for scene transition)
    const door = this.matter.add.image(300, 865, "door", null, {
      isStatic: true,
      isSensor: true,
    });
    door.setScale(0.1).setDepth(5);

    this.matter.world.on("collisionstart", (event) => {
      for (const pair of event.pairs) {

        const involvesPlayer =
          pair.bodyA === this.player.body || pair.bodyB === this.player.body;
        const involvesDoor =
          pair.bodyA === door.body || pair.bodyB === door.body;
        if (involvesPlayer && involvesDoor && this.doorUnlocked) {
          this.teacherspeach = this.make
            .text({
              x: this.player.x,
              y: this.player.y - 100,
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

    const key1 = this.matter.add.image(1800, 200, "key", null, {
      isStatic: true,
      isSensor: true
    }).setScale(0.1);

    const key2 = this.matter.add.image(50, 150, "key", null, {
      isStatic: true,
      isSensor: true
    }).setScale(0.1);

    this.keys.push(key1, key2);

    this.lock = this.add.image(300, 865, "lock").setScale(0.08).setDepth(6);


    // Enemy groups
    this.walkers = this.add.group();
    this.rockets = this.add.group();

    // Walker spawns
    this.time.delayedCall(1000, () => {
      spawnWalker.call(this, 200, 880, 33, 400);   // x, y, leftBound, rightBound, direction (optional, default left/-1)
    });
    this.time.delayedCall(4000, () => {
      spawnWalker.call(this, 1600, 880, 1395, 1675);
    });
    this.time.delayedCall(1000, () => {
      spawnWalker.call(this, 200, 350, 33, 380);
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

// Collect keys and unlock door
function collectKey(key) {

  // safety: ignore if key already collected
  if (!key || key._collected) return;

  // mark collected so this function is idempotent
  key._collected = true;

  // 1) hide and deactivate the visual immediately
  key.setVisible(false);
  key.setActive(false);

  // 2) prevent any further collisions right away
  if (key.body) {
    key.body.collisionFilter.mask = 0;        // set collision mask to 0 so it collides with nothing
    key.body.collisionFilter.category = 0;    // optionally also set category to 0
    key.body.isSensor = true;                 // ensure it's a sensor (no blocking)
  }

  // 3) remove from your keys array so checks like this.keys.includes() won't find it
  if (Array.isArray(this.keys)) {
    this.keys = this.keys.filter(k => k !== key);
  } else if (this.keys && typeof this.keys.remove === 'function') {
    // if keys was a Group
    this.keys.remove(key, true, true);
  }

  // 4) increment counter and handle unlocking
  this.keysCollected = (this.keysCollected || 0) + 1;

  if (this.keysCollected >= 2) {
    // hide lock graphic
    if (this.lock) {
      this.lock.setVisible(false);
      this.lock.setActive(false);
    }
    this.doorUnlocked = true;
  }

  // 5) remove physics body from world AFTER the current step to avoid messing with current collision processing
  //    schedule a delayedCall with 0 ms which runs on next tick / after current event loop
  if (key.body) {
    this.time.delayedCall(0, () => {
      try {
        if (key.body && this.matter.world && this.matter.world.engine) {
          // remove the body safely
          this.matter.world.remove(key.body);
        }
      } catch (e) {
        // ignore removal errors
      }
    });
  }

}
