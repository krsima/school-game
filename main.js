import { HUD } from "./hud.js";
import { PauseMenu } from "./pause.js";
import { GermanLesson } from "./levels/german.js";
import { OutsideSchool } from "./levels/outside-school.js";
import { ITLesson } from "./levels/it.js";
import { BusStop } from "./levels/busstop.js";
import { SportsLesson } from "./levels/sports.js";
import { Finish } from "./levels/finish.js";

const config = {
  type: Phaser.AUTO,

  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  scene: [OutsideSchool, GermanLesson, ITLesson, SportsLesson, BusStop, Finish, HUD, PauseMenu],
  physics: {
    default: "matter",
    matter: {
      gravity: { y: 2 },
      debug: false,
    },
  },
};

// Wait for font to load before starting Phaser
document.fonts.ready.then(() => {
  const game = new Phaser.Game(config);
});
