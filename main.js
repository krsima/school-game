import { GermanLesson } from "./levels/german.js";
import { OutsideSchool } from "./levels/outside-school.js";
import { ITLesson } from "./levels/it.js";
import { BusStop } from "./levels/busstop.js";
import { SportsLesson } from "./levels/sports.js";

const config = {
  type: Phaser.AUTO,

  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  scene: [OutsideSchool, GermanLesson, ITLesson, SportsLesson, BusStop],
  physics: {
    default: "matter",
    matter: {
      gravity: { y: 2 },
      debug: false,
    },
  },
};

const game = new Phaser.Game(config);
