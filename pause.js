export class PauseMenu extends Phaser.Scene {
  constructor() {
    super({ key: "PauseMenu" });
  }

  create() {
    // Store when pause started
    this.pauseStartTime = Date.now();

    // Also pause the HUD so update() stops running
    this.scene.pause("HUD");
    
    // Semi-transparent dark background
    this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.5
    ).setScrollFactor(0);

    // "PAUSE" text centered
    this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      "PAUSE",
      { fontSize: "48px", fill: "#ffffff" }
    ).setOrigin(0.5).setScrollFactor(0);

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