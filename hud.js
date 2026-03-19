export class HUD extends Phaser.Scene {
  constructor() {
    super({ key: "HUD" });
  }

  preload() {
    this.load.image("heart", "assets/heart.png");
  }

  create() {
    this.hearts = [];

    // Draw 4 hearts side-by-side in the top-left corner
    for (let i = 0; i < 3; i++) {
      const heart = this.add.image(30 + i * 40, 30, "heart").setScale(0.2);
      heart.setScrollFactor(0);     // remains fixed on the screen
      heart.setDepth(100);
      this.hearts.push(heart);
    }

    this.updateHearts();
  }

  update() {
    this.updateHearts();
  }

  updateHearts() {
    const lives = this.registry.get("lives") || 3;
    this.hearts.forEach((heart, index) => {
      // Heart is fully visible if index < lives, otherwise it's faded
      heart.setAlpha(index < lives ? 1 : 0.2);
    });
  }
}
