import { formatTime } from "./levels/finish.js";

export class HUD extends Phaser.Scene {
  constructor() {
    super({ key: "HUD" });
  }

  preload() {
    this.load.image("heart", "assets/heart.png");
  }

  create() {
    this.hearts = [];

    this.keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    this.muted = false;

    // Draw 4 hearts side-by-side in the top-left corner
    for (let i = 0; i < 3; i++) {
      const heart = this.add.image(30 + i * 40, 30, "heart").setScale(0.2);
      heart.setScrollFactor(0); // remains fixed on the screen
      heart.setDepth(100);
      this.hearts.push(heart);
    }

    this.text = this.make.text({
      x: 20,
      y: 60,
      text: "",
      style: {
        fontSize: "24px",
        fontFamily: "Arial",
        color: "#ffffff",
        align: "center", // 'left'|'center'|'right'|'justify'
      },
      add: true,
    });

    this.updateHearts();
  }

  update() {
    this.updateHearts();
    this.text.text = formatTime(Date.now() - this.registry.get("timeStart"));
    if (Phaser.Input.Keyboard.JustDown(this.keyM)) {
    this.muted = !this.muted;
    this.sound.setMute(this.muted);  // mute ALL sounds globally
    }
  }

  updateHearts() {
    const lives = this.registry.get("lives") || 3;
    this.hearts.forEach((heart, index) => {
      // Heart is fully visible if index < lives, otherwise it's faded
      heart.setAlpha(index < lives ? 1 : 0.2);
    });
  }
}
