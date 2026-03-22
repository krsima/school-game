import { create as createPlayer, movement } from "../player.js";

const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 1000;
const API_URL = "https://https-proxy.tamion.workers.dev/";

export class Finish extends Phaser.Scene {
  constructor(...args) {
    super({ key: "Finish", ...args });
  }

  preload() {
    this.load.atlas("player", "assets/player.png", "assets/player.json");
    this.load.image("chalkboard", "assets/chalkboard.jpg");
    this.load.image("background", "assets/outside.jpg");
    this.load.image("backpack", "assets/backpack.png");
    this.load.image("plank", "assets/plank.png");
    this.load.image("door", "assets/door.png");
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
    this.cameras.main.setZoom((window.innerWidth / 1920) * 1.3);
    this.registry.set("checkpoint", "OutsideSchool");

    //Background
    this.add.image(1024, 500, "background");

    var player = createPlayer(this, () => {
      // Pause this scene and launch PauseMenu
      if (!this.scene.isActive("PauseMenu")) {
        this.scene.pause();
        this.scene.launch("PauseMenu", {
          caller: this.scene.key,
          guide:
            "Du hast es geschafft! Du kannst hier die Bestenliste sehen.\n\nDrücke [R] um das Spiel neu zu beginnen.",
        });
      }
    });

    this.cameras.main.startFollow(player, true, 0.1, 0.1);
    this.cameras.main.setBackgroundColor("#ccccff");

    // World
    this.text = this.make.text({
      x: 150,
      y: 700,
      text: "Leaderboard loading...",
      style: {
        fontSize: "24px",
        fontFamily: "Arial",
        color: "#ffffff",
        align: "center", // 'left'|'center'|'right'|'justify'
      },
      add: true,
    });

    this.make.text({
      x: 700,
      y: 500,
      text: "Danke fürs Spielen!",
      style: {
        fontSize: "24px",
        fontFamily: "Arial",
        color: "#ffffff",
        align: "center", // 'left'|'center'|'right'|'justify'
      },
      add: true,
    });
    if (this.registry.get("timeStartLoading") != null) {
      this.registry.set(
        "timeStart",
        this.registry.get("timeStart") +
          (Date.now() - this.registry.get("timeStartLoading")),
      );
      this.registry.set("timeStartLoading", null);
    }

    this.time.delayedCall(2000, () => {
      const top10 = this.getTop10();
    });

    this.time.delayedCall(100, () => {
      var playerName = prompt(
        "Gib deinen Namen ein, um dich in die Bestenliste einzutragen.",
      );
      this.submitScore(playerName, Date.now() - this.registry.get("timeStart"));
    });

    // Start Head-Up Display (HUD) scene
    if (!this.scene.isActive("HUD")) {
      this.scene.launch("HUD");
    }
  }

  update(time, delta) {
    movement();
  }

  async getTop10() {
    const res = await fetch(`${API_URL}/top`);

    if (!res.ok) {
      throw new Error("Failed to fetch leaderboard");
    }

    const data = await res.json();
    this.text.text = formatLeaderboard(data);
  }

  async submitScore(name, time) {
    if (!name || typeof time !== "number") {
      throw new Error("Invalid name or time");
    }

    const res = await fetch(`${API_URL}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, time }),
    });

    if (!res.ok) {
      throw new Error("Failed to submit score");
    }

    return true;
  }
}

function formatLeaderboard(leaderboard) {
  console.log(leaderboard, typeof leaderboard);
  return leaderboard
    .map((entry, index) => {
      return `${index + 1}. ${entry.name} (${formatTime(entry.time)})`;
    })
    .join("\n");
}

export function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;

  return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
}
