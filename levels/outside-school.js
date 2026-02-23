import { create as createPlayer, movement } from "../player.js";

const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 1000;

export class OutsideSchool extends Phaser.Scene {
  constructor(...args) {
    super({ key: "OutsideSchool", ...args });
  }

  preload() {
    this.load.atlas("player", "assets/player.png", "assets/player.json");
    this.load.image("background", "assets/background.jpg");
    this.load.image("backpack", "assets/backpack.png");
    this.load.image("plank", "assets/plank.png");
    this.load.image("door", "assets/door.jpg");
  }

  create() {
    // Settings
    this.matter.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setZoom(1.3);

    //Background
    this.add.image(1024, 500, "background");

    var player = createPlayer(this);

    this.cameras.main.startFollow(player, true, 0.1, 0.1);

    this.cameras.main.setBackgroundColor("#ccccff");

    // World
    this.make.text({
      x: 150,
      y: 700,
      text: "A und D zum Bewegen\nLeertaste zum Springen",
      style: {
        fontSize: "24px",
        fontFamily: "Arial",
        color: "#ffffff",
        align: "center", // 'left'|'center'|'right'|'justify'
      },
      add: true,
    });

    // Platforms (static Matter bodies)
    this.matter.add
      .image(550, 868, "backpack", null, { isStatic: true })
      .setScale(0.1);
    this.matter.add
      .image(650, 860, "backpack", null, { isStatic: true })
      .setScale(0.08);
    this.matter.add
      .image(800, 800, "plank", null, { isStatic: true })
      .setScale(0.2);
    this.matter.add
      .image(870, 800, "plank", null, { isStatic: true })
      .setScale(0.2);
    this.matter.add
      .image(940, 800, "plank", null, { isStatic: true })
      .setScale(0.2);
    this.matter.add
      .image(1150, 765, "backpack", null, { isStatic: true })
      .setScale(0.1);
    this.matter.add
      .image(790, 600, "backpack", null, { isStatic: true })
      .setScale(0.08);
    this.matter.add
      .image(550, 450, "backpack", null, { isStatic: true })
      .setScale(0.08);
    this.matter.add
      .image(1400, 860, "backpack", null, { isStatic: true })
      .setScale(0.1);
    this.matter.add
      .image(240, 440, "plank", null, { isStatic: true })
      .setScale(0.17);

    // Door (sensor for scene transition)
    const door = this.matter.add.image(240, 370, "door", null, {
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
          this.scene.start("GermanLesson");
        }
      }
    });
  }

  update(time, delta) {
    movement();
  }
}
