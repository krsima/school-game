import { GermanLesson } from "./levels/german.js";
import { OutsideSchool } from "./levels/outside-school.js";

const config = {
  type: Phaser.AUTO,

  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  scene: [ OutsideSchool, GermanLesson ],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 2000 },
      debug: false,
    },
  },
};

const game = new Phaser.Game(config);