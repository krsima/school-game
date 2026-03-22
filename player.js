var player;
let tscene;

var cursors;

let keyA;
let keySpace;
let keyD;
let keyW;
let keyR;
let keyP;

let onPauseCallback; // called when P is pressed, set in create()

let footstepCooldown = 0;

export { player };

// Debug
let keySemicolon;
let key1;
let key2;
let key3;
let key4;
let key5;
let key6;

export function create(scene, onPause) {
  onPauseCallback = onPause; // store the callback
  tscene = scene;
  tscene.sound.stopByKey("footstep"); // kill leftover instances

  // Player
  scene.player = scene.matter.add.sprite(200, 800, "player");
  player = scene.player;
  player.collisions = new Map();
  player.setFixedRotation();
  player.setFriction(0.0);
  player.setBounce(0.04);

  // Ground detection via collision events
  scene.matter.world.on("collisionstart", (event) => {
    event.pairs.forEach((pair) => {
      const { bodyA, bodyB, collision } = pair;

      if (pair.bodyA.isSensor || pair.bodyB.isSensor) return;

      if (bodyA.gameObject === player) {
        player.collisions.set(bodyB, collision.normal); // use body as key, not gameObject
      } else if (bodyB.gameObject === player) {
        player.collisions.set(bodyA, {
          // use body as key, not gameObject
          x: -collision.normal.x,
          y: -collision.normal.y,
        });
      }
    });
  });

  scene.matter.world.on("collisionend", (event) => {
    event.pairs.forEach((pair) => {
      const { bodyA, bodyB } = pair;

      if (bodyA.gameObject === player) {
        player.collisions.delete(bodyB); // use body as key, not gameObject
      } else if (bodyB.gameObject === player) {
        player.collisions.delete(bodyA); // use body as key, not gameObject
      }
    });
  });

  keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keySpace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  keyW = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keyR = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  keyP = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

  // Debug
  keySemicolon = scene.input.keyboard.addKey(
    Phaser.Input.Keyboard.KeyCodes.SEMICOLON,
  );
  key1 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
  key2 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
  key3 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
  key4 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.V);
  key5 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
  key6 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);

  cursors = scene.input.keyboard.createCursorKeys();

  scene.anims.create({
    key: "walk",
    frames: scene.anims.generateFrameNames("player", {
      prefix: "p1_walk",
      start: 1,
      end: 11,
      zeroPad: 2,
    }),
    frameRate: 10,
    repeat: -1,
  });
  scene.anims.create({
    key: "idle",
    frames: [{ key: "player", frame: "p1_stand" }],
    frameRate: 10,
  });
  return player;
}

export function movement() {
  if (cursors.left.isDown || keyA.isDown) {
    player.setVelocityX(Math.max(-7, player.body.velocity.x - 0.7));
    player.anims.play("walk", true);
    player.flipX = true;
  } else if (cursors.right.isDown || keyD.isDown) {
    player.setVelocityX(Math.min(7, player.body.velocity.x + 0.7));
    player.anims.play("walk", true);
    player.flipX = false;
  } else {
    const deacceleration = isOnGround() ? 0.7 : 0.17;
    var newVelocity = Math.max(
      Math.abs(player.body.velocity.x) - deacceleration,
      0,
    );
    player.setVelocityX(
      player.body.velocity.x > 0 ? newVelocity : -newVelocity,
    );
    player.anims.play("idle", true);
  }
  // jump
  if ((cursors.up.isDown || keyW.isDown || keySpace.isDown) && isOnGround()) {
    player.setVelocityY(-18);
  }

  // Reset
  if (keyR.isDown) {
    die();
  }

  // Pause
  if (Phaser.Input.Keyboard.JustDown(keyP) && onPauseCallback) {
    onPauseCallback();
  }

  // Debug
  if (keySemicolon.isDown) {
    tscene.registry.set("cheats", true);
  }

  if (tscene.registry.get("cheats")) {
    if (key1.isDown) {
      tscene.scene.start("OutsideSchool");
    }
    if (key2.isDown) {
      tscene.scene.start("GermanLesson");
    }
    if (key3.isDown) {
      tscene.scene.start("ITLesson");
    }
    if (key4.isDown) {
      tscene.scene.start("SportsLesson");
    }
    if (key5.isDown) {
      tscene.scene.start("BusStop");
    }
    if (key6.isDown) {
      tscene.scene.start("Finish");
    }
  }

  // Footstep sound
  const moving = Math.abs(player.body.velocity.x) > 0.5;
  footstepCooldown -= 1;

  if (moving && isOnGround() && footstepCooldown <= 0) {
    tscene.sound.stopByKey("footstep"); // dont overlap
    tscene.sound.play("footstep", { volume: 0.3 });
    footstepCooldown = 22; // ~22 frames @ 60fps ≈ 0.37s Pause
  }

  player.lastVelocity = player.body.velocity;
}

export function die() {
  tscene.sound.play("death", { volume: 0.8 });
  if (tscene.registry.get("lives") > 1) {
    tscene.registry.set("lives", tscene.registry.get("lives") - 1);
    tscene.scene.start(tscene.registry.get("checkpoint"));
  } else {
    tscene.scene.start("OutsideSchool");
  }
}

function isOnGround() {
  for (const normal of player.collisions.values()) {
    if (
      normal.y < -0.5 ||
      (player.body.velocity.y == 0 && player.lastVelocity.y == 0)
    ) {
      return true;
    }
  }
  return false;
}
