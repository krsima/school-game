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
  }

  create() {
    // Settings
    this.matter.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT + 100);
    this.cameras.main.setZoom((window.innerWidth / 1920) * 1.3);

    //Background
    this.add.image(1000, 700, "busstop").setScale(1.5);
    this.player = createPlayer(this);
    this.player.checkpoint = "BusStop";
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBackgroundColor("#ccccff");

    // World
    this.make
      .text({
        x: 1000,
        y: 300,
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

    this.cur = false;
    this.time.addEvent({
      delay: 1000, // ms
      callback: () => {
        if (!this.cur) {
          if (Math.random() < 0.1) {
            this.cur = true;
            const fromRight = Math.random() < 0.5;
            let alert = this.add
              .image(fromRight ? 1800 : 200, 900, "alert")
              .setScale(0.3);

            this.time.delayedCall(2000, () => {
              alert.destroy();
              const bus = this.matter.add
                .image(fromRight ? 2200 : -200, 900, "bus", null, {
                  isStatic: true,
                })
                .setScale(0.5);
              bus.body.instaKill = true;
              console.log(bus);
              this.tweens.add({
                targets: bus,
                x: fromRight ? -200 : 2200,
                duration: 2000,
                onComplete: () => {
                  bus.destroy();
                  this.cur = false;
                },
              });
            });
          }
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
        let instaDeathInvolved = bodyA.instaKill || bodyB.instaKill;
        if (playerInvolved && instaDeathInvolved) {
          die();
        }
      });
    });
  }

  update(time, delta) {
    movement();
  }
}
