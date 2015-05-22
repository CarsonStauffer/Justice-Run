/*	main.js
 * 	author: Carson Stauffer
 * 	created: 5/21/2015
 */

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {preload: preload, create: create, update: update});

function preload() {
	game.load.image('block', 'assets/block.png');
	game.load.image('sky', 'assets/sky.png');
	game.load.image('star', 'assets/star.png');
	game.load.image('big mountains', 'assets/Mountain-background.png');
	game.load.image('small mountains', 'assets/Mountain-background-small.png');
	game.load.spritesheet('mario', 'assets/mario_run.png', 72, 88);

}

var platforms;
var player;
var cursors;

var farBackground;
var nearBackground;




function create() {

	// Set world size
	game.world.setBounds(0,0,800, 600);

	// enable 'arcade' physics
	game.physics.startSystem(Phaser.Physics.ARCADE);

	// add the sky background
	game.add.sprite(0, 0, 'sky');


	// Testing the scrolling background

	// add the large mountains in the background
	farBackground  = game.add.tileSprite( 0, 0, 800, game.cache.getImage('big mountains').height, 'big mountains');
	nearBackground = game.add.tileSprite( 0, -64, 800, game.cache.getImage('small mountains').height, 'small mountains');

	// create a group for the platforms and ground
	platforms = game.add.group();

	// add the platforms and ground to physics
	platforms.enableBody = true;


	// Create the ground
	var ground = platforms.create(0, game.world.height - 64, 'block');
	ground.scale.setTo(2);
	ground.body.immovable = true;

	// create some platforms
	var platform = platforms.create(-150, game.world.height/2 - 16, 'block');
	platform.body.immovable = true;

	platform = platforms.create(400, 400, 'block');
	platform.body.immovable = true;


	// create the player
	player = game.add.sprite(32, game.world.height - 150, 'mario');
	game.physics.arcade.enable(player);

	// Player physics properties
	player.body.gravity.y = 4500;
	player.body.collideWorldBounds = true;

	// Player animations
	player.animations.add('left',  [7,6,5,4,3,2,1,0], 24, true);
	player.animations.add('right', [0,1,2,3,4,5,6,7], 24, true);


	// initialize keyboard cursors
	cursors = game.input.keyboard.createCursorKeys();

	// Bind jumping to 'up' key
	cursors.up.onDown.add( function() { 
		this.jump();
	});

	// Camera
	game.camera.follow(player);

}

function update() {

	// Collision for player and the terrain
	game.physics.arcade.collide(player, platforms);

	/* Player movement */

	// horizontal movement
	player.body.velocity.x = 0;

	if(cursors.left.isDown){
		// Move left
		player.body.velocity.x = -450;

		player.animations.play('left');

	}else if(cursors.right.isDown){
		// Move right
		player.body.velocity.x = 450;

		player.animations.play('right');
	}else{
		// Stand still
		player.animations.stop();

		player.frame = 4;
	}

	/* Background */
	farBackground.tilePosition.x -= player.body.velocity.x * 0.005;
	nearBackground.tilePosition.x -= player.body.velocity.x * 0.009;



}

// Player jump from ground
function jump() {
	if(player.body.touching.down){
		player.body.velocity.y = -1500;
	}
}
