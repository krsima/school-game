import { create as createPlayer, movement } from "../player.js";

const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 1000;

export class GermanLesson extends Phaser.Scene {
  preload() {
    this.load.atlas("player", "assets/player.png", "assets/player.json");
    this.load.image("background", "assets/background.jpg");
    this.load.image("backpack", "assets/backpack.png")
  }

  create() {
    // Settings
    this.physics.world.TILE_BIAS = 32;
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setZoom(0.6);

    //Background
    this.add.image(1024, 500, "background");

    var player = createPlayer(this);

    this.cameras.main.startFollow(player, true, 0.1, 0.1);

    this.cameras.main.setBackgroundColor("#ccccff");

    // World
    this.make.text({
      x: 150,
      y: 700,
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: "#999999",
        blur: 5,
        stroke: true,
        fill: true,
      },
      padding: {
        left: 0,
        right: 16,
        top: 20,
        bottom: 40,
        //x: 32,    // 32px padding on the left/right
        //y: 16     // 16px padding on the top/bottom
      },
      text: "A und D zum Bewegen\nLeertaste zum Springen",
      style: {
        fontSize: "24px",
        fontFamily: "Arial",
        color: "#ffffff",
        align: "center", // 'left'|'center'|'right'|'justify'
      },
      add: true,
    });

    this.platforms = this.physics.add.staticGroup();

    // Platforms
    this.platforms.create(400, 668, 'backpack').setScale(0.2).refreshBody();

    this.physics.add.collider(player, this.platforms);
  }

  update(time, delta) {
    movement();
  }
}
