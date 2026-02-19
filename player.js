import { GermanLesson } from "./levels/german.js";

var player;
let tscene;
let groundContacts = 0;

var cursors;

let keyA;
let keySpace;
let keyD;
let keyW;

// Debug
let keyTab;
export function create(scene) {
  tscene = scene;
  groundContacts = [];

  // Player
  player = scene.matter.add.sprite(200, 800, "player");
  player.collisions = new Map();
  player.setFixedRotation();
  player.setFriction(0.0);
  player.setBounce(0.04);

  // Ground detection via collision events
  scene.matter.world.on("collisionstart", (event) => {
    event.pairs.forEach((pair) => {
      const { bodyA, bodyB, collision } = pair;

      if (bodyA.gameObject === player) {
        player.collisions.set(bodyB.gameObject, collision.normal);
      } else if (bodyB.gameObject === player) {
        player.collisions.set(bodyA.gameObject, {
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
        player.collisions.delete(bodyB.gameObject);
      } else if (bodyB.gameObject === player) {
        player.collisions.delete(bodyA.gameObject);
      }
    });
  });

  keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keySpace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  keyW = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

  // Debug
  keyTab = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);

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

  // Debug
  if (keyTab.isDown) {
    tscene.scene.start("ITLesson");
  }
}

function isOnGround() {
  for (const normal of player.collisions.values()) {
    if (normal.y < -0.5) {
      return true;
    }
  }
  return false;
}
