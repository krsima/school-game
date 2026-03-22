export class PauseMenu extends Phaser.Scene {
  constructor() {
    super({ key: "PauseMenu" });
  }

  create() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    const guide   = this.scene.settings.data.guide   || "Keine Anleitung verfügbar.";
    this.isWelcome = this.scene.settings.data.welcome || false;

    this.pauseStartTime = Date.now();

    // Pause HUD so its update() stops running
    this.scene.pause("HUD");

    // Mute all game sounds while paused, remembering the previous state
    // so the user's own [M] mute preference is correctly restored on resume.
    this.wasMuted = this.game.sound.mute;
    this.game.sound.setMute(true);

    // --- Background (always visible, not part of any page) ---
    this.add.image(cx, cy, "chalkboard")
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setScale(0.3);

    // Page dot indicators
    this.pageDots = [];
    for (let i = 0; i < 2; i++) {
      const dot = this.add.circle(cx - 10 + i * 20, cy + 292, 5, 0x888888);
      dot.setScrollFactor(0).setDepth(10);
      this.pageDots.push(dot);
    }

    // Footer hint — different text in welcome mode
    const resumeHint = this.isWelcome
      ? "[←] [→] Seite wechseln  ·  [P] / [Space] Spiel starten"
      : "[←] [→] Seite wechseln  ·  [P] Fortsetzen";
    this.add.text(cx, cy + 262, resumeHint, {
      fontSize: "19px",
      fontFamily: "Courier",
      color: "#aaaaaa",
      fontStyle: "italic",
    }).setOrigin(0.5).setScrollFactor(0);

    // --- Build pages ---
    this.pages = [];
    this.buildPage0(cx, cy);        // Page 0: Controls
    this.buildPage1(cx, cy, guide); // Page 1: Level guide

    this.currentPage = -1; // force refresh on first showPage call
    // Welcome mode: show guide (page 1) first so new players see what to do
    this.showPage(this.isWelcome ? 1 : 0);

    // --- Input ---
    this.input.keyboard.on("keydown-LEFT",  () => this.showPage(0));
    this.input.keyboard.on("keydown-RIGHT", () => this.showPage(1));
    this.input.keyboard.once("keydown-P",     () => this.resume());
    // In welcome mode also allow Space to start
    if (this.isWelcome) {
      this.input.keyboard.once("keydown-SPACE", () => this.resume());
    }
  }

  // Page 0: title + keybindings
  buildPage0(cx, cy) {
    const objects = [];
    const title = this.isWelcome ? "WILLKOMMEN! " : "PAUSIERT ";

    objects.push(
      this.add.text(cx, cy - 200, title, {
        fontSize: "56px", fontFamily: "Caveat", color: "#ccccff",
      }).setOrigin(0.5).setScrollFactor(0)
    );

    objects.push(
      this.add.text(cx, cy - 130, "Steuerung:", {
        fontSize: "40px", fontFamily: "Caveat", color: "#ccccff",
      }).setOrigin(0.5).setScrollFactor(0)
    );

    const controls = [
      "[A] / [←]", "[D] / [→]", "[W] / [Space] / [↑]",
      "[R]", "[P]", "[M]",
    ];
    const descriptions = [
      "Nach links bewegen", "Nach rechts bewegen", "Springen",
      "Checkpoint neu starten", "Pause / Fortsetzen", "Ton an/aus",
    ];

    controls.forEach((key, i) => {
      objects.push(
        this.add.text(cx - 20, cy - 60 + i * 50, key, {
          fontSize: "24px", fontFamily: "Courier",
          color: "#dddddd", fontStyle: "bold",
        }).setOrigin(1, 0.5).setScrollFactor(0)
      );
      objects.push(
        this.add.text(cx + 20, cy - 60 + i * 50, descriptions[i], {
          fontSize: "32px", fontFamily: "Caveat", color: "#dddddd",
        }).setOrigin(0, 0.5).setScrollFactor(0)
      );
    });

    this.pages.push(objects);
  }

  // Page 1: title + level guide, vertically centered as a block
  buildPage1(cx, cy, guide) {
    const objects = [];
    const title = this.isWelcome ? "WILLKOMMEN! " : "PAUSIERT ";

    objects.push(
      this.add.text(cx, cy - 200, title, {
        fontSize: "56px", fontFamily: "Caveat", color: "#ccccff",
      }).setOrigin(0.5).setScrollFactor(0)
    );

    // D: Center the guide block (title + text) vertically in the available area.
    // Available area runs from cy-140 (below big title) to cy+245 (above footer).
    const areaTop    = cy - 140;
    const areaBottom = cy + 245;

    const guideTitle = this.add.text(0, 0, "Level-Anleitung:", {
      fontSize: "40px", fontFamily: "Caveat", color: "#ccccff",
    }).setOrigin(0.5, 0).setScrollFactor(0);

    const guideText = this.add.text(0, 0, guide, {
      fontSize: "34px", fontFamily: "Caveat", color: "#dddddd",
      align: "center",
      wordWrap: { width: cx * 1.3 },
    }).setOrigin(0.5, 0).setScrollFactor(0);

    // Calculate positions after text is created (heights are now known)
    const gap         = 12;
    const blockHeight = guideTitle.height + gap + guideText.height;
    const blockTop    = areaTop + ((areaBottom - areaTop) - blockHeight) / 2;

    guideTitle.setPosition(cx, blockTop);
    guideText.setPosition(cx, blockTop + guideTitle.height + gap);

    objects.push(guideTitle, guideText);
    this.pages.push(objects);
  }

  showPage(index) {
    if (index === this.currentPage) return;
    this.currentPage = index;

    // Toggle visibility of each page's objects
    this.pages.forEach((page, i) => {
      page.forEach(obj => obj.setVisible(i === index));
    });

    // Update dot indicators
    this.pageDots.forEach((dot, i) => {
      dot.setFillStyle(i === index ? 0xffffff : 0x555555);
    });
  }

  resume() {
    // Only shift the timer when actually pausing mid-game.
    // In welcome mode the timer hasn't started counting yet.
    if (!this.isWelcome) {
      const pausedFor = Date.now() - this.pauseStartTime;
      this.registry.set("timeStart", this.registry.get("timeStart") + pausedFor);
    } else {
      // Reset timer so it starts at the moment the player dismisses the welcome screen
      this.registry.set("timeStart", Date.now());
    }

    // Restore whatever mute state the player had before pausing
    this.game.sound.setMute(this.wasMuted);

    this.scene.resume("HUD");
    this.scene.resume(this.scene.settings.data.caller);
    this.scene.stop();
  }
}