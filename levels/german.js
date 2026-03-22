import { create as createPlayer, movement, die } from "../player.js";

const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 1000;

export class GermanLesson extends Phaser.Scene {
  constructor(...args) {
    super({ key: "GermanLesson", ...args });
  }

  preload() {
    this.load.atlas("player", "assets/player.png", "assets/player.json");
    this.load.image("classroom", "assets/classroom.jpg");
    this.load.image("chalkboard", "assets/chalkboard.jpg");
    this.load.image("teacher", "assets/teacher.png");
    this.load.image("chair", "assets/chair.png");
    this.load.image("clock", "assets/clock.png");
    this.load.audio("classroom_noises", "assets/sounds/classroom_noises.mp3");
    this.load.audio("sit_down", "assets/sounds/sit_down.mp3");
    this.load.audio("throw", "assets/sounds/throw.mp3");
    this.load.audio("win", ["assets/sounds/win.wav", "assets/sounds/win.mp4"]);
    this.load.audio("death", [
      "assets/sounds/death.wav",
      "assets/sounds/death.mp3",
    ]);
    this.load.audio("footstep", [
      "assets/sounds/footstep.ogg",
      "assets/sounds/footstep.mp3",
    ]);
  }

  create() {
    // Settings
    this.sound.stopByKey("classroom_noises");
    this.sound.stopByKey("collect");
    this.sound.stopByKey("footstep");
    this.sound.stopByKey("bg_music");
    this.sound.stopByKey("sit_down");
    this.sound.stopByKey("throw");
    this.sound.stopByKey("whoosh");
    this.matter.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT + 100);
    this.cameras.main.setZoom((window.innerWidth / 1920) * 1);
    this.registry.set("checkpoint", "GermanLesson");

    this.sound.add("classroom_noises").setVolume(0.4).setLoop(true).play();

    //Background
    this.add.image(1000, 500, "classroom").setScale(0.6);
    this.add.image(1000, 700, "teacher").setScale(1.4);

    this.player = createPlayer(this, () => {
      // Pause this scene and launch PauseMenu
      if (!this.scene.isActive("PauseMenu")) {
        this.scene.pause();
        this.scene.launch("PauseMenu", {
          caller: this.scene.key,
          guide:
            "Überlebe den Deutschunterricht, indem du den Stühlen ausweichst und dich auf einen Stuhl setzt, wenn dies vom Lehrer verlangt wird. Du kannst die Uhren einsammeln, um Zeit zu gewinnen.",
        });
      }
    });

    this.player.setPosition(1000, 500);

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
            this.clockTimer.remove();
            this.time.delayedCall(3000, () => {
              this.createClock();
            });
          }
        }
      });
    });

    // Timetable

    let timer = 180;

    this.curThrowing = false;
    this.curSitting = false;
    this.time.addEvent({
      delay: 1000, // ms
      callback: () => {
        this.timerText.setText(
          "Überlebe den Unterricht\n" +
            new Date(timer * 1000).toISOString().slice(14, 19),
        );
        timer--;
        if (timer < 0) {
          this.timerText.setText("GESCHAFFT!!!");
          this.time.removeAllEvents();
          this.sound.play("win");
          this.time.delayedCall(2500, () => {
            this.registry.set("timeStartLoading", Date.now());
            this.scene.start("ITLesson");
          });
        }
        if (Math.random() < 0.4 && !this.curThrowing) {
          this.throwChairs();
        }
        if (Math.random() < 0.2 && !this.curSitting) {
          this.sitDown();
        }
      },
      loop: true,
    });

    // Start Head-Up Display (HUD) scene
    if (!this.scene.isActive("HUD")) {
      this.scene.launch("HUD");
    }

    this.createClock();
    if (this.registry.get("timeStartLoading") != null) {
      this.registry.set(
        "timeStart",
        this.registry.get("timeStart") +
          (Date.now() - this.registry.get("timeStartLoading")),
      );
      this.registry.set("timeStartLoading", null);
    }
  }

  update(time, delta) {
    movement();
  }

  createClock() {
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
    this.clockTimer = this.time.delayedCall(5000, () => {
      if (this.clock != null) {
        this.matter.world.remove(this.clock.body);
        this.clock.destroy();
        this.clock = null;
        this.time.delayedCall(3000, () => {
          this.createClock();
        });
      }
    });
  }

  throwChairs() {
    this.chairs.forEach((chair) => {
      if (
        Math.random() < 0.4 ||
        chair.body.velocity.y != 0 ||
        (this.curSitting &&
          this.player.collisions.keys().some((v) => v.gameObject === chair))
      ) {
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
      this.curThrowing = true;
      this.time.delayedCall(700, () => {
        this.sound.play("throw");
      });
      this.time.delayedCall(1000, () => {
        chair.setVelocity(0, Math.max(0.8, Math.random()) * -45);
      });
      this.time.delayedCall(1400, () => {
        chair.setVelocityX(
          Math.ceil(Math.random() * 33) * (Math.round(Math.random()) ? 1 : -1),
        );
        this.curThrowing = false;
      });
    });
  }

  sitDown() {
    this.curSitting = true;
    this.teacherspeach.setText("HINSETZEN!!!");
    this.sound.play("sit_down");
    this.time.delayedCall(3000, () => {
      var shoulddie = true;
      this.player.collisions.keys().forEach((body) => {
        if (this.chairs.includes(body.gameObject)) {
          shoulddie = false;
        }
      });
      if (shoulddie) {
        die();
      }
      this.teacherspeach.setText("");
      this.curSitting = false;
    });
  }
}
