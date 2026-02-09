import { GermanLesson } from "./levels/german.js";

var player;
let tscene;

var cursors;

let keyA;
let keySpace;
let keyD;
let keyW;

// Debug
let keyTab;
export function create(scene) {
  tscene = scene;
  // Player
  player = scene.physics.add.sprite(200, 800, "player");
  player.setBounce(0.04);
  player.setCollideWorldBounds(true);
  player.body.setSize(player.width, player.height - 8);
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
    player.body.setVelocityX(Math.max(-400, player.body.velocity.x - 40));
    player.anims.play("walk", true);
    player.flipX = true;
  } else if (cursors.right.isDown || keyD.isDown) {
    player.body.setVelocityX(Math.min(400, player.body.velocity.x + 40));
    player.anims.play("walk", true);
    player.flipX = false;
  } else {
    var deacceleration = player.body.onFloor() ? 40 : 10;
    var newVelocity = Math.max(Math.abs(player.body.velocity.x) - deacceleration, 0);
    player.body.setVelocityX(player.body.velocity.x > 0 ? newVelocity : -newVelocity);
    player.anims.play("idle", true);
  }
  // jump
  if (
    (cursors.up.isDown || keyW.isDown || keySpace.isDown) &&
    player.body.onFloor()
  ) {
    player.body.setVelocityY(-950);
  }
  
  // Debug
  if (keyTab.isDown) {
    tscene.scene.start("GermanLesson")
  }
}
