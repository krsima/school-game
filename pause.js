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

    const guide = this.scene.settings.data.guide || "Keine Anleitung verfügbar.";

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
    this.add.text(cx, cy - 200, "PAUSIERT ", {
      fontSize: "56px",
      fontFamily: "Caveat",  // a nice chalk-like font
      color: "#ccccff",
    }).setOrigin(0.5).setScrollFactor(0);


    // Keybindings list
    this.add.text(cx * 0.6, cy - 110, "Steuerung:", {
      fontSize: "40px",
      fontFamily: "Caveat",
      color: "#ccccff",
    }).setOrigin(0.5).setScrollFactor(0);

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
      this.add.text(cx * 0.6 - 20, cy - 50 + index * 50, line, {
        fontSize: "24px",
        fontFamily: "Courier",
        color: "#dddddd",
        align: "right",
        fontStyle: "bold",
      }).setOrigin(1, 0.5).setScrollFactor(0); // right edge snaps to cx - 20
    });

    controlsDescription.forEach((line, index) => {
      this.add.text(cx * 0.6 + 20, cy - 50 + index * 50, line, {
        fontSize: "32px",
        fontFamily: "Caveat",
        color: "#dddddd",
        align: "left",
      }).setOrigin(0, 0.5).setScrollFactor(0); // left edge snaps to cx + 20
    });


    // Level-specific guide
    this.add.text(cx * 1.4, cy - 80, "Level-Anleitung:", {
      fontSize: "40px",
      fontFamily: "Caveat",
      color: "#ccccff",
    }).setOrigin(0.5).setScrollFactor(0);

    this.add.text(cx * 1.4, cy - 40, guide, {
      fontSize: "36px",
      fontFamily: "Caveat",
      color: "#dddddd",
      align: "center",
      wordWrap: { width: cx * 0.6 }, // wraps text so it stays within right half
    }).setOrigin(0.5, 0).setScrollFactor(0);


    // Resume hint at bottom
    this.add.text(cx, cy + 260, "Drücke [P] zum Fortsetzen", {
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