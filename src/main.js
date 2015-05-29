/*	main.js
 * 	author: Carson Stauffer
 * 	created: 5/21/2015
 */
"use strict";

// Phaser.AUTO = use webGL or canvas
// Phaser.CANVAS = use canvas only
// 		use canvas for debugging; use auto for release
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {preload: preload, create: create, update: update, render: render});
// var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', {preload: preload, create: create, update: update, render: render});


// function loadUpdate()	// <- use for a progress bar some day

function preload() {
	game.load.image('block', 'assets/block.png');
	game.load.image('sky', 'assets/sky.png');
	game.load.image('star', 'assets/star.png');
	game.load.image('big mountains', 'assets/Mountain-background.png');
	game.load.image('small mountains', 'assets/Mountain-background-small.png');
	game.load.image('ground', 'assets/mario ground violated.png');
	// game.load.image('mario_jumpsquat', 'assets/mario jumpsquat.png');
	// game.load.spritesheet('mario', 'assets/mario_run.png', 72, 88);

	// Testing texture atlas
	// game.load.atlas('mario atlas', 'assets/marioHash.png', 'assets/marioHash.json', null, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
	game.load.atlasJSONHash('mario atlas', 'assets/marioHash.png', 'assets/marioHash.json');
}

var platforms;
var player;
var cursors;
var jumpsquatTimer;

var farBackground;
var nearBackground;
var foreground;

var runSpeed;
var canDoubleJump = false;

// Enum for different player states
var stateEnum = Object.freeze(
		{
			RUNNING: {},
			JUMPSQUAT: {},
			JUMPING: {},
			ATTACKING: {}
		}
	);
var playerState;

// testing: hitboxes
var kickHitbox;


function create() {

	// Set world size
	game.world.setBounds( 0, 0, 800, 600);

	// enable 'arcade' physics
	game.physics.startSystem(Phaser.Physics.ARCADE);

	// add the sky background
	game.add.sprite(0, 0, 'sky');

	// add the large mountains in the background
	farBackground  = game.add.tileSprite( 0, 0, 800, game.cache.getImage('big mountains').height, 'big mountains');
	nearBackground = game.add.tileSprite( 0, -64, 800, game.cache.getImage('small mountains').height, 'small mountains');

	// create a group for the platforms and ground
	platforms = game.add.group();

	// add the platforms and ground to physics
	platforms.enableBody = true;


	// Testing the attack hitboxes
	// kickHitbox = game.add.sprite(0,0);


	// Create the foreground
	foreground = game.add.tileSprite(0, game.world.height - 64, 800, 64, 'ground');
	platforms.add(foreground);
	foreground.body.immovable = true;

	// create some platforms
	// var platform = platforms.create(-150, game.world.height/2 - 16, 'block');
	// platform.body.immovable = true;

	// platform = platforms.create(400, 400, 'block');
	// platform.body.immovable = true;

	/* Player animations */
	player = game.add.sprite(100,0, 'mario atlas');
	player.animations.add('run', Phaser.Animation.generateFrameNames('mario_run_', 1, 8, '.png'), 24, true);
	player.animations.add('jumpsquat', ['mario jumpsquat.png'], 1, true);
	player.animations.add('jump', ['mario_jump.png'], 1, true);
	// player.animations.add('kick', Phaser.Animation.generateFrameNames('mario_kick_', 1, 5, '.png'), 24, false);
	player.animations.add('kick', ['mario_kick.png'], 1, true);

	



	// create the player
	game.physics.arcade.enable(player);
	player.body.checkCollision.up = false;
	player.body.checkCollision.left = false;
	player.body.checkCollision.right = false;

	// player.body.setSize(30,45, 0,0);	// <- use this to change collision size for the player

	// Player physics properties
	player.body.gravity.y = 4500;
	player.body.collideWorldBounds = true;


	// initialize keyboard cursors
	cursors = game.input.keyboard.createCursorKeys();


	/* Keyboard Input */

	// pressing 'left'
	cursors.left.onDown.add( function() { 
		leftButtonPressed();
	});

	// releasing 'left'
	cursors.left.onUp.add( function() {
		leftButtonReleased();
	});

	// pressing 'right'
	cursors.right.onDown.add( function() { 
		rightButtonPressed();
	});

	// releasing 'right'
	cursors.right.onUp.add( function() {
		rightButtonReleased();
	});



	// create the jumpsquat timer for enabling short hops and full hops
	// jumpsquatTimer = new Phaser.Timer(game, false);
	jumpsquatTimer = new Phaser.Timer(game, false);
	

	// Camera
	// necessary?
	game.camera.follow(player);


	// player.frameName = 'mario_run_5.png';	// <- how to set to a specific frame

	playerState = stateEnum.RUNNING;


}

function update() {

	// Collision for player and the terrain
	game.physics.arcade.collide(player, platforms);

	/* Player movement */
	
	runSpeed = 350;

	// Enable double jump when grounded
	// Warning: may also count as touching when landing on sprites other than 'ground'
	if(player.body.touching.down){
		canDoubleJump = true;
	}


	/* Background */
	farBackground.tilePosition.x 	-= runSpeed * 0.001;
	nearBackground.tilePosition.x 	-= runSpeed * 0.003;
	foreground.tilePosition.x 		-= runSpeed * 0.012;


	// testing the timer
	// console.log("elapsed: " + game.jumpsquatTimer.ms);

	// console.log("elapsed: " + jumpsquatTimer.ms);


	if(player.body.touching.down && playerState != stateEnum.JUMPSQUAT){
		// player.animations.play('right');
		playerState = stateEnum.RUNNING;
		// player.animations.play('kick');
	}

	updatePlayerAnimation();
}

// Set the player's animation based on his state
function updatePlayerAnimation(){

	switch(playerState){

		case stateEnum.RUNNING:
			player.animations.play('run');
			break;

		case stateEnum.JUMPSQUAT:
			player.animations.play('jumpsquat');
			break;

		case stateEnum.JUMPING:
			player.animations.play('jump');
			break;

		case stateEnum.ATTACKING:
			player.animations.play('kick');
			console.log("playing kick animation");
			break;

		default:
			console.log("error: no animation for player state: " + playerState );
			break;
	}

	// player.animations.play('kick');
}



/* Input Handling */

function leftButtonPressed(){
	switch(playerState){

		case stateEnum.RUNNING:
			jumpsquat();
			break;

		case stateEnum.JUMPING:
			doubleJump();
			break;

		default:
			// do nothing
			break;
	}
}

function leftButtonReleased(){
	switch(playerState){

		case stateEnum.JUMPSQUAT:
			shorthop();
			break;
	}
}

function rightButtonPressed(){
	kick();
}

function rightButtonReleased(){

}



// testing an attack
function kick(){
	console.log("entering attacking state");
	playerState = stateEnum.ATTACKING;
}





// use 'onEnterJumpsquat'?
function jumpsquat(){
	playerState = stateEnum.JUMPSQUAT;

	// execute a full hop if the timer runs out
	var fullHopTimer = game.time.events.add( 150, fullhop, game);
}

// Double jump if player hasn't already
function doubleJump(){
	if(canDoubleJump === true){
		player.body.velocity.y = -1300;
		canDoubleJump = false;
	}
}

// Immediately perform a shorthop
function shorthop() {

	player.body.velocity.y = -800;
	playerState = stateEnum.JUMPING;

}

// Full hop if player didn't short hop
function fullhop(){

	// Check that the player is still in jumpsquat (he didn't short hop)
	if(playerState === stateEnum.JUMPSQUAT){
		player.body.velocity.y = -1500;
		playerState = stateEnum.JUMPING;
	}	
}

function render(){
	// game.debug.body(player);
}

/* **** outdated functions ******/

// Player jumps
// function jump() {
// 	if(player.body.touching.down){

// 		// testing. still
// 		// one stop timer approach
// 		var fullHopTimer = game.time.events.add( 150, fullhop, game);
// 		playerState = stateEnum.JUMPSQUAT;
// 		// player.animations.stop();
// 		// player.animations.play('jumpsquat');


// 		// First jump
		
// 	} else if(canDoubleJump === true) {
// 		// Double jump
// 		player.body.velocity.y = -1300;
// 		canDoubleJump = false;

// 	}
// }


