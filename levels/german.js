import { create as createPlayer, movement } from "../player.js";

const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 1000;

export class GermanLesson extends Phaser.Scene {

  constructor( ...args ) {
    super({ key: 'GermanLesson', ...args })
  }

  preload() {
    this.load.atlas("player", "assets/player.png", "assets/player.json");
    this.load.image("classroom", "assets/classroom.png");
    this.load.image("chair", "assets/chair.jpg")
  }

  create() {
    // Settings
    this.physics.world.TILE_BIAS = 32;
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setZoom(1);

    //Background
    this.add.image(1000, 500, "classroom").setScale(1.8);

    var player = createPlayer(this);

    this.cameras.main.startFollow(player, true, 0.1, 0.1);

    this.cameras.main.setBackgroundColor("#ccccff");

    // World

    this.chairs = this.physics.add.group();

    // Platforms
    this.chairs.create(300, 668, 'chair');
    this.chairs.create(600, 668, 'chair');
    this.chairs.create(900, 668, 'chair');
    this.chairs.create(1200, 668, 'chair');
    this.chairs.create(1500, 668, 'chair');
    this.chairs.create(1800, 668, 'chair');

    this.chairs.children.each((chair) => {
      chair.setScale(0.3).setCollideWorldBounds(true).setDrag(500, 0).setBounce(0.5, 0.5).setImmovable(true).refreshBody();
    });
    this.physics.add.collider(player, this.chairs);
    this.physics.add.collider(this.chairs, this.chairs);
  }

  update(time, delta) {
    movement();
  }
}
