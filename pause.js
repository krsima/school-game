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

    // Store when pause started
    this.pauseStartTime = Date.now();

    // Also pause the HUD so update() stops running
    this.scene.pause("HUD");

    // Chalkboard image centered
    this.add.image(cx, cy, "chalkboard")
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setScale(0.3); // adjust to fit screen

    // Title on chalkboard
    this.add.text(cx, cy - 140, "PAUSIERT ", {
      fontSize: "56px",
      fontFamily: "Caveat",  // a nice chalk-like font
      color: "#ccccff",
    }).setOrigin(0.5).setScrollFactor(0);

    // Keybindings list
    const controls = [
      "[A] / [←]",
      "[D] / [→]",
      "[W] / [Space] / [↑]",
      "[R]",
      "[P]",
    ];

    const controlsDescription = [
      "Nach links bewegen",
      "Nach rechts bewegen",
      "Springen",
      "Checkpoint neu starten",
      "Pause / Fortsetzen",
    ];

    controls.forEach((line, index) => {
      this.add.text(cx - 20, cy - 50 + index * 50, line, {
        fontSize: "24px",
        fontFamily: "Courier",
        color: "#dddddd",
        align: "right",
        fontStyle: "bold",
      }).setOrigin(1, 0.5).setScrollFactor(0); // right edge snaps to cx - 20
    });

    controlsDescription.forEach((line, index) => {
      this.add.text(cx + 20, cy - 50 + index * 50, line, {
        fontSize: "32px",
        fontFamily: "Caveat",
        color: "#dddddd",
        align: "left",
      }).setOrigin(0, 0.5).setScrollFactor(0); // left edge snaps to cx + 20
    });

    // Resume hint at bottom
    this.add.text(cx, cy + 240, "Drücke [P] zum Fortsetzen", {
      fontSize: "24px",
      fontFamily: "Courier",
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