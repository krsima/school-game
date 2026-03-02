import { create as createPlayer, movement, die } from "../player.js";

const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 1000;

export class GermanLesson extends Phaser.Scene {
  constructor(...args) {
    super({ key: "GermanLesson", ...args });
  }

  preload() {
    this.load.atlas("player", "assets/player.png", "assets/player.json");
    this.load.image("classroom", "assets/classroom.png");
    this.load.image("chair", "assets/chair.jpg");
  }

  create() {
    // Settings
    this.matter.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT + 100);
    this.cameras.main.setZoom(1);

    //Background
    this.add.image(1000, 500, "classroom").setScale(1.8);

    this.player = createPlayer(this);
    this.player.setPosition(1000, 500);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.cameras.main.setBackgroundColor("#ccccff");

    // World

    this.teacherspeach = this.make.text({
      x: 1000,
      y: 500,
      text: "A und D zum Bewegen\nLeertaste zum Springen",
      style: {
        fontSize: "24px",
        fontFamily: "Arial",
        color: "#ffffff",
        align: "center", // 'left'|'center'|'right'|'justify'
      },
      add: true,
    });

    // Chairs (dynamic Matter bodies)
    const chairPositions = [200, 400, 600, 900, 1100, 1400, 1600, 1800];
    this.chairs = chairPositions.map((x) => {
      const chair = this.matter.add.image(x, 668, "chair");
      chair.setScale(0.2).setBounce(0.5);
      return chair;
    });

    this.matter.world.on("collisionstart", (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB, collision } = pair;
        if (bodyA.gameObject === this.player && this.chairs.includes(bodyB.gameObject) && bodyB.gameObject.body.velocity.y - bodyA.gameObject.body.velocity.y > 15) {
          die();
        }
        if (bodyB.gameObject === this.player && this.chairs.includes(bodyA.gameObject) && bodyA.gameObject.body.velocity.y - bodyB.gameObject.body.velocity.y > 15) {
          die();
        }
      });
    });

    // Timetable

    this.time.addEvent({
      delay: 1000, // ms
      callback: () => {
        if (Math.random() < 0.3 && !this.cur) {
          this.throwChairs();
        }
        if (Math.random() < 0.2 && !this.cur) {
          this.sitDown();
        }
      },
      loop: true,
    });
  }

  update(time, delta) {
    movement();
  }

  throwChairs() {
    this.chairs.forEach((chair) => {
      if (Math.random() < 0.6) {
        return;
      }
      this.cur = true;
      chair.setVelocity(0, Math.max(0.8, Math.random()) * -45);
      this.time.delayedCall(500, () => {
        chair.setVelocityX(
          Math.ceil(Math.random() * 33) * (Math.round(Math.random()) ? 1 : -1),
        );
        this.cur = false;
      });
    });
  }

  sitDown() {
    this.cur = true;
    this.teacherspeach.setText("HINSETZEN!!!");
    this.time.delayedCall(3000, () => {
      var shoulddie = true;
      this.player.collisions.keys().forEach((obj) => {
        if (this.chairs.includes(obj)) {
          shoulddie = false;
        }
      });
      if (shoulddie) {
        die();
      }
      this.teacherspeach.setText("");
      this.cur = false;
    });
  }
}
