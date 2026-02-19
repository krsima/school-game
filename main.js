import { GermanLesson } from "./levels/german.js";
import { OutsideSchool } from "./levels/outside-school.js";
import { ITLesson } from "./levels/it.js";

const config = {
  type: Phaser.AUTO,

  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  scene: [OutsideSchool, GermanLesson, ITLesson],
  physics: {
    default: "matter",
    matter: {
      gravity: { y: 2 },
      debug: false,
    },
  },
};

const game = new Phaser.Game(config);

