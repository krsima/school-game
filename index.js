var player;
var cursors;
var text;

let keyA;
let keySpace;
let keyD;
let keyW;

class OutsideSchool extends Phaser.Scene {
  preload() {

    this.load.image("coin", "assets/coinGold.png");
    this.load.atlas("player", "assets/player.png", "assets/player.json");
    this.load.image('background', 'assets/background.jpg');
  }

  create() {
    // Settings
    this.physics.world.TILE_BIAS = 32;
    
    //Background
    this.add.image(1024, 500, 'background');

    // Player
    player = this.physics.add.sprite(200, 800, "player");
    player.setBounce(0.04);
    player.setCollideWorldBounds(true);
    player.body.setSize(player.width, player.height - 8);
    keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    cursors = this.input.keyboard.createCursorKeys();

    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNames("player", {
        prefix: "p1_walk",
        start: 1,
        end: 11,
        zeroPad: 2,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "idle",
      frames: [{ key: "player", frame: "p1_stand" }],
      frameRate: 10,
    });

    this.cameras.main.setBounds(0, 0, 400, 300);
    this.cameras.main.startFollow(player);

    this.cameras.main.setBackgroundColor("#ccccff");

    // World
    var txt = this.make.text({
    	x: 150,
    	y: 700,
	shadow: {
        offsetX: 0,
        offsetY: 0,
        color: '#999999',
        blur: 5,
        stroke: true,
        fill: true
      },
    	padding: {
        left: 0,
        right: 16,
        top: 20,
        bottom: 40
        //x: 32,    // 32px padding on the left/right
        //y: 16     // 16px padding on the top/bottom
    	},
    	  text: 'A und D zum Bewegen\nLeertaste zum Springen',
    	  style: {
          fontSize: '24px',
          fontFamily: 'Arial',
          color: '#ffffff',
          align: 'center',  // 'left'|'center'|'right'|'justify'
      },
      add: true
    });
  }

  update(time, delta) {
    movement();
  }
}

function movement() {
  if (cursors.left.isDown || keyA.isDown) {
    player.body.setVelocityX(-400);
    player.anims.play("walk", true);
    player.flipX = true;
  } else if (cursors.right.isDown || keyD.isDown) {
    player.body.setVelocityX(400);
    player.anims.play("walk", true);
    player.flipX = false;
  } else {
    console.log(player.body.velocity.x);
    player.body.setVelocityX(player.body.velocity.x * 0.8);
    player.anims.play("idle", true);
  }
  // jump
  if ((cursors.up.isDown || keyW.isDown || keySpace.isDown) && player.body.onFloor()) {
    player.body.setVelocityY(-950);
  }
}

const config = {
  type: Phaser.AUTO,

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1920,
    height: 1080,
  },

  scene: OutsideSchool,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 2000 },
      debug: false,
    },
  },
};

const game = new Phaser.Game(config);
