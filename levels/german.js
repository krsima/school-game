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
    this.load.image("teacher", "assets/teacher.jpg");
    this.load.image("chair", "assets/chair.jpg");
    this.load.image("clock", "assets/clock.jpg");
  }

  create() {
    // Settings
    this.matter.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT + 100);
    this.cameras.main.setZoom((window.innerWidth / 1920) * 1);

    //Background
    this.add.image(1000, 500, "classroom").setScale(1.8);
    this.add.image(1000, 700, "teacher").setScale(1.4);

    this.player = createPlayer(this);
    this.player.setPosition(1000, 500);
    this.player.checkpoint = "GermanLesson";

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.cameras.main.setBackgroundColor("#ccccff");

    // World
    this.clock = null;
    this.timerText = this.make
      .text({
        x: 1000,
        y: 300,
        text: "",
        style: {
          fontSize: "24px",
          fontFamily: "Arial",
          color: "#ffffff",
          align: "center", // 'left'|'center'|'right'|'justify'
        },
        add: true,
      })
      .setOrigin(0.5, 0.5);

    this.teacherspeach = this.make
      .text({
        x: 1000,
        y: 500,
        text: "",
        style: {
          fontSize: "24px",
          fontFamily: "Arial",
          color: "#ffffff",
          align: "center", // 'left'|'center'|'right'|'justify'
        },
        add: true,
      })
      .setOrigin(0.5, 0.5);

    // Chairs (dynamic Matter bodies)
    const chairPositions = [200, 400, 600, 900, 1100, 1400, 1600, 1800];
    this.chairs = chairPositions.map((x) => {
      const chair = this.matter.add.image(x, 750, "chair");
      chair.setScale(0.2).setBounce(0.5);
      return chair;
    });

    this.matter.world.on("collisionstart", (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB, collision } = pair;
        if (
          bodyB.gameObject === this.player &&
          this.chairs.includes(bodyA.gameObject)
        ) {
          var bodyTmp = bodyA;
          bodyA = bodyB;
          bodyB = bodyTmp;
        }
        let velocity =
          Math.pow(bodyB.velocity.y - bodyA.velocity.y, 2) +
          Math.pow(bodyB.velocity.x - bodyA.velocity.x, 2);
        if (
          bodyA.gameObject === this.player &&
          this.chairs.includes(bodyB.gameObject) &&
          velocity > 400
        ) {
          die();
        }
        if (this.clock != null) {
          const involvesPlayer =
            bodyA === this.player.body || pair.bodyB === this.player.body;
          const involvesClock =
            pair.bodyA === this.clock.body || pair.bodyB === this.clock.body;
          if (involvesPlayer && involvesClock) {
            timer = Math.max(timer - 10, 0);
            this.matter.world.remove(this.clock.body);
            this.clock.destroy();
            this.clock = null;
          }
        }
      });
    });

    // Timetable

    let timer = 120;

    this.cur = false;
    this.time.addEvent({
      delay: 1000, // ms
      callback: () => {
        this.timerText.setText(
          "Überlebe\n" + new Date(timer * 1000).toISOString().slice(14, 19),
        );
        timer--;
        if (timer < 0) {
          this.timerText.setText("GESCHAFFT!!!");
          this.time.removeAllEvents();
          this.time.delayedCall(2500, () => {
            this.scene.start("ITLesson");
          });
        }
        if (Math.random() < 0.3 && !this.cur) {
          this.throwChairs();
        }
        if (Math.random() < 0.2 && !this.cur) {
          this.sitDown();
        }

        if (this.clock == null && Math.random() < 0.1) {
          this.clock = this.matter.add.image(
            Math.random() * WORLD_WIDTH,
            700,
            "clock",
            null,
            {
              isStatic: true,
              isSensor: true,
            },
          );
          this.clock.setScale(0.1);
          this.time.delayedCall(5000, () => {
            if (this.clock != null) {
              this.matter.world.remove(this.clock.body);
              this.clock.destroy();
              this.clock = null;
            }
          });
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
      if (Math.random() < 0.4 || chair.body.velocity.y != 0) {
        return;
      }
      var remaining = 40;
      this.time.addEvent({
        delay: 20, // ms
        callback: () => {
          chair.setVelocity(remaining % 2 == 0 ? -10 : 10, 0);
          remaining -= 1;
          if (remaining < 0) {
            chair.setVelocity(0, 0);
          }
        },
        callbackScope: this,
        repeat: 40,
      });
      this.cur = true;
      this.time.delayedCall(1000, () => {
        chair.setVelocity(0, Math.max(0.8, Math.random()) * -45);
      });
      this.time.delayedCall(1400, () => {
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
