import { create as createPlayer, die, movement } from "../player.js";

const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 1000;

export class BusStop extends Phaser.Scene {
  constructor(...args) {
    super({ key: "BusStop", ...args });
  }

  preload() {
    this.load.atlas("player", "assets/player.png", "assets/player.json");
    this.load.image("busstop", "assets/busstop.png");
    this.load.image("bus", "assets/bus.png");
    this.load.image("alert", "assets/alert.png");
    this.load.image("trophy", "assets/trophy.png");
    this.load.image("student", "assets/student.png");
    this.load.image("vaper", "assets/vaper.png");
    this.load.image("phone", "assets/phone.jpg");
  }

  create() {
    // Settings
    this.matter.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT + 100);
    this.cameras.main.setZoom((window.innerWidth / 1920) * 1.3);
    this.registry.set("checkpoint", "BusStop");

    //Background
    this.add.image(1000, 700, "busstop").setScale(1.5).setDepth(-2);

    this.player = createPlayer(this, () => {
      // Pause this scene and launch PauseMenu
      if (!this.scene.isActive("PauseMenu")) {
        this.scene.pause();
        this.scene.launch("PauseMenu", {
          caller: this.scene.key,
          guide: "Weiche den Bussen aus und achte auf die Vaper, die gefährliche Dämpfe ausstoßen. Ein Warnsymbol zeigt an, wenn ein Bus naht. Wenn ein Vaper gleich in deiner Nähe dampft, wird dies ebenfalls angezeigt. Wenn du den Pokal siehst, lasse dich vom Bus erwischen, um einzusteigen und das Spiel zu beenden!"
        });
      }
    });

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBackgroundColor("#ccccff");

    // World
    this.text = this.make
      .text({
        x: 1000,
        y: 450,
        text: "Steig in deinen Bus ein!",
        style: {
          fontSize: "24px",
          fontFamily: "Arial",
          color: "#ffffff",
          align: "center", // 'left'|'center'|'right'|'justify'
        },
        add: true,
      })
      .setOrigin(0.5, 0.5);

    this.phones = [];
    for (let i = 0; i < 2; i++) {
      const phone = this.matter.add.image(
        i == 0 ? 400 : 1600,
        850,
        "phone",
        null,
        {
          isStatic: true,
          isSensor: true,
        },
      );
      phone.setScale(0.4);
      this.phones.push(phone);
    }

    const studentCount = 15;
    const vaperCount = 4;
    const scheduleStudentMove = (s) => {
      const wait = 500 + Math.random() * 3000;
      this.time.delayedCall(wait, () => {
        if (!s.active) return;
        if (Math.random() < 0.4) {
          // stand still, then reschedule
          scheduleStudentMove(s);
        } else {
          const targetX = 300 + Math.random() * 1400;
          const targetY = 1000 - Math.random() * 200;
          const dist = Math.abs(targetX - s.x);
          this.tweens.add({
            targets: s,
            x: targetX,
            y: targetY,
            duration: (dist / 200) * 1000,
            ease: "Linear",
            onComplete: () => scheduleStudentMove(s),
          });
        }
      });
    };

    // Generate vape cloud texture
    const cloudGfx = this.make.graphics({ add: false });
    cloudGfx.fillStyle(0x99ccff, 1);
    cloudGfx.fillEllipse(80, 30, 120, 55);
    cloudGfx.fillEllipse(140, 25, 100, 50);
    cloudGfx.fillEllipse(60, 38, 80, 48);
    cloudGfx.fillEllipse(115, 42, 120, 55);
    cloudGfx.generateTexture("vapecloud", 220, 80);
    cloudGfx.destroy();

    // Vaper NPCs at fixed positions
    const scheduleVaperMove = (vaper) => {
      const wait = 500 + Math.random() * 3000;
      this.time.delayedCall(wait, () => {
        if (!vaper.active) return;
        if (vaper.isVaping) {
          scheduleVaperMove(vaper);
          return;
        }
        if (Math.random() < 0.4) {
          scheduleVaperMove(vaper);
        } else {
          const targetX = 200 + Math.random() * 1600;
          const targetY = 1000 - Math.random() * 200;
          const dist = Math.abs(targetX - vaper.x);
          vaper.moveTween = this.tweens.add({
            targets: vaper,
            x: targetX,
            y: targetY,
            duration: (dist / 200) * 1000,
            ease: "Linear",
            onComplete: () => {
              vaper.moveTween = null;
              scheduleVaperMove(vaper);
            },
          });
        }
      });
    };
    this.vapers = [];
    for (let i = 0; i < vaperCount; i++) {
      const vaper = this.add
        .image(300 + Math.random() * 1400, 1000 - Math.random() * 200, "vaper")
        .setScale(0.3)
        .setDepth(-1);
      this.vapers.push(vaper);
      vaper.isVaping = false;
      vaper.moveTween = null;
      scheduleVaperMove(vaper);
    }

    for (let i = 0; i < studentCount; i++) {
      const s = this.add
        .image(
          300 + Math.random() * 1400,
          1000 - Math.random() * 200,
          "student",
        )
        .setScale(0.3)
        .setDepth(-1);
      scheduleStudentMove(s);
    }
    this.vapeClouds = [];
    this.vapeCur = false;
    this.vapeAlert = null;

    // Vape attack event
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        if (!this.vapeCur && Math.random() < 0.2) {
          this.vapeCur = true;
          const vaper = Phaser.Utils.Array.GetRandom(this.vapers);
          vaper.isVaping = true;
          if (vaper.moveTween) {
            vaper.moveTween.stop();
            vaper.moveTween = null;
          }
          this.tweens.add({
            targets: vaper,
            scaleX: 1,
            duration: 2000,
            ease: "Quad.easeOut",
            onComplete: () => {
              vaper.scaleX = 0.3;
            },
          });
          this.time.delayedCall(2000, () => {
            const cloud = this.add
              .image(vaper.x, vaper.y - 20, "vapecloud")
              .setScale(0.25)
              .setAlpha(0.75)
              .setDepth(1);
            this.vapeClouds.push(cloud);
            this.tweens.add({
              targets: cloud,
              scaleX: 2.8,
              scaleY: 6,
              alpha: 0,
              duration: 5000,
              ease: "Quad.easeOut",
              onComplete: () => {
                const idx = this.vapeClouds.indexOf(cloud);
                if (idx !== -1) this.vapeClouds.splice(idx, 1);
                cloud.destroy();
                vaper.isVaping = false;
                scheduleVaperMove(vaper);
                this.vapeCur = false;
              },
            });
          });
        }
      },
      loop: true,
    });

    this.timer = 60;

    this.cur = false;
    this.time.addEvent({
      delay: 1000, // ms
      callback: () => {
        this.timer--;
        if (!this.cur) {
          if (Math.random() < 0.1 || this.timer < 1) {
            this.cur = true;
            const fromRight = Math.random() < 0.5;
            let winner = this.timer < 1;
            this.alert = this.add
              .image(200, 500, winner ? "trophy" : "alert")
              .setScale(0.3);
            this.time.delayedCall(2000, () => {
              this.alert.destroy();
              this.alert = null;
            });

            this.time.delayedCall(2000 + Math.random() * 1500, () => {
              const bus = this.matter.add
                .image(fromRight ? 2200 : -200, 950, "bus", null, {
                  isStatic: true,
                })
                .setScale(0.9);
              if (winner) {
                bus.body.winner = true;
              } else {
                bus.body.instaKill = true;
              }
              this.tweens.add({
                targets: bus,
                x: fromRight ? -200 : 2200,
                duration: 2500,
                onComplete: () => {
                  bus.destroy();
                  this.cur = false;
                },
              });
            });
          }
        }
        if (Math.random() < 0.2) {
          const phone = Phaser.Utils.Array.GetRandom(this.phones);
          if (phone.body.ringing) {
            return;
          }
          const originalX = phone.x;
          const originalY = phone.y;
          phone.body.ringing = this.tweens.add({
            targets: phone,
            x: originalX + (Math.random() - 0.5) * 20,
            y: originalY + (Math.random() - 0.5) * 20,
            duration: 100,
            ease: "Sine.easeInOut",
            yoyo: true,
            repeat: 5,
            loop: 2,
            loopDelay: 1200,
            onComplete: () => {
              phone.setPosition(originalX, originalY);
              phone.body.ringing = null;
              this.timer += 10;
            },
          });
        }
          
          
      },
      loop: true,
    });

    this.matter.world.on("collisionstart", (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB, collision } = pair;
        let playerInvolved =
          bodyA === this.player.body || bodyB === this.player.body;
        console.log(bodyA, bodyB);
        if (playerInvolved) {
          let instaDeathInvolved = bodyA.instaKill || bodyB.instaKill;
          let winnerInvolved = bodyA.winner || bodyB.winner;
          let ringing = bodyA.ringing || bodyB.ringing;

          if (instaDeathInvolved) {
            die();
          }
          if (winnerInvolved) {
            this.registry.set("timeStartLoading", Date.now());
            this.scene.start("Finish");
          }
          if (ringing) {
            ringing.stop();
            bodyA.ringing = null;
            bodyB.ringing = null;
          }
        }
      });
    });

    // Start Head-Up Display (HUD) scene
    if (!this.scene.isActive("HUD")) {
      this.scene.launch("HUD");
    }

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
    this.text.text = this.timer;
    if (this.alert != null) {
      this.alert.setPosition(
        this.cameras.main.scrollX + this.cameras.main.width / 2,
        500,
      );
    }
    for (const cloud of this.vapeClouds) {
      if (!cloud.active) continue;
      const dx = Math.abs(this.player.x - cloud.x);
      const dy = Math.abs(this.player.y - cloud.y);
      if (
        dx < cloud.displayWidth * 0.45 &&
        dy < cloud.displayHeight * 0.45 &&
        cloud.alpha > 0.15
      ) {
        die();
        break;
      }
    }
    movement();
  }
}
