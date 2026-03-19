export class PauseMenu extends Phaser.Scene {
  constructor() {
    super({ key: "PauseMenu" });
  }

	preload() {
		this.load.image("chalkboard", "assets/chalkboard.jpg");
	}

  create() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    /* Semi-transparent dark background
    this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.5)
      .setScrollFactor(0); */

    // Chalkboard image centered
    this.add.image(cx, cy, "chalkboard")
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setScale(0.3); // adjust to fit screen

    // Title on chalkboard
    this.add.text(cx, cy - 120, "PAUSIERT", {
      fontSize: "36px",
      fontFamily: "Arial",
      color: "#ffffff",
    }).setOrigin(0.5).setScrollFactor(0);

    // Keybindings list
    const controls = [
      "[A] / [←]  Nach links bewegen",
      "[D] / [→]  Nach rechts bewegen",
      "[W] / [Space] / [↑]  Springen",
      "[R]  Checkpoint neu starten",
      "[P]  Pause / Fortsetzen",
    ];

    controls.forEach((line, index) => {
      this.add.text(cx, cy - 50 + index * 40, line, {
        fontSize: "20px",
        fontFamily: "Courier",  // monospace looks nice on a chalkboard
        color: "#dddddd",
      }).setOrigin(0.5).setScrollFactor(0);
    });

    // Resume hint at bottom
    this.add.text(cx, cy + 160, "Press [P] to resume", {
      fontSize: "18px",
      fontFamily: "Arial",
      color: "#aaaaaa",
      fontStyle: "italic",
    }).setOrigin(0.5).setScrollFactor(0);

    // Resume on P key press
    this.input.keyboard.once("keydown-P", () => {
      this.resume();
    });
  }

	resume() {
		// Calculate how long the game was paused
		const pausedFor = Date.now() - this.pauseStartTime;

		// Shift timeStart forward so the timer doesn't count the pause
		const adjustedStart = this.registry.get("timeStart") + pausedFor;
		this.registry.set("timeStart", adjustedStart);

		// Resume both scenes
		this.scene.resume("HUD");
		this.scene.resume(this.scene.settings.data.caller);
		this.scene.stop();
	}
}