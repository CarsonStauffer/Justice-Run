/*	main.js
 * 	author: Carson Stauffer
 * 	created: 5/21/2015
 */
"use strict";

// Phaser.AUTO = use webGL or canvas
// Phaser.CANVAS = use canvas only
// 		use canvas for debugging; use auto for release
// var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {preload: preload, create: create, update: update, render: render});
var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', {preload: preload, create: create, update: update, render: render});


// function loadUpdate()	// <- use for a progress bar some day


/*********************************** Global Variables ***************************************
 * 
 * 
 * 
 *******************************************************************************************/


var self = this;

var platforms;
var player;
var enemy;
var enemies;
var cursors;

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

// var kickHitbox;
var hitboxes;

// testing hitbox reset bug
// var dude;



/*********************************** Init Functions *****************************************
 * preload()
 * create()
 * 
 *******************************************************************************************/


// Preload all required assets
function preload() {
	game.load.image('block', 'assets/block.png');
	game.load.image('sky', 'assets/sky.png');
	game.load.image('star', 'assets/star.png');
	game.load.image('big mountains', 'assets/Mountain-background.png');
	game.load.image('small mountains', 'assets/Mountain-background-small.png');
	game.load.image('ground', 'assets/mario ground violated.png');

	// testing the enemy
	game.load.spritesheet('enemy', 'assets/test_enemy.png', 32, 48);
	game.load.spritesheet('blood splatter', 'assets/blood_splatter.png', 32, 32);

	// game.load.spritesheet('mario', 'assets/mario_run.png', 72, 88);

	// game.load.atlas('mario atlas', 'assets/marioHash.png', 'assets/marioHash.json', null, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
	game.load.atlasJSONHash('mario atlas', 'assets/marioHash.png', 'assets/marioHash.json');
}

// Set up the game world
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
	player.animations.add('kick', ['mario_kick.png'], 1, true);



	



	// create the player
	game.physics.arcade.enable(player);
	player.body.checkCollision.up = false;
	player.body.checkCollision.left = false;
	player.body.checkCollision.right = false;
	player.body.setSize(32, 72, 20, 16);

	// player.body.setSize(30,45, 0,0);	// <- use this to change collision size for the player

	// Player physics properties
	player.body.gravity.y = 4500;
	player.body.collideWorldBounds = true;


	/* Player Hitboxes */
	// kickHitbox = game.add.sprite(player.width,player.height/3*2, null);
	hitboxes = game.add.group();
	hitboxes.enableBody = true;
	player.addChild(hitboxes);

	// testing creating a hitbox without needing a global variable
	// ...it works!
	// var transientHitbox = hitboxes.create(0, 0, null);
	// transientHitbox.body.setSize(180, 45, player.width, 0);
	// transientHitbox.name = "gay";
	// transientHitbox.anchor.set(0.5);


	var kickHitbox = hitboxes.create(0, 0, null);
	kickHitbox.body.setSize(50, 50, player.width, player.height * 0.6);
	kickHitbox.name = "kick";
	kickHitbox.damage = 100;
	kickHitbox.knockbackDir = 0.5;
	kickHitbox.knockbackBase = 1000;
	kickHitbox.knockbackScaling = 1.0;
	kickHitbox.anchor.set(0.5);



	// testing enemy
	enemies = game.add.group();
	enemies.enableBody = true;
	// enemies.createMultiple(10, 'enemy');
	for(var i = 0; i < 10; i++){
		enemies.create(game.world.randomX + 300, game.world.randomY / 2, 'enemy');
		enemies.children[i].hitstun = false;
		enemies.children[i].anchor.set(0.5);
		// enemies.children[i].body.bounce = 1;

	}
	enemies.setAll('body.gravity.y', 100);

	// testing hitbox reset bug
	// dude = game.add.sprite(30,30, 'enemy');
	// game.physics.arcade.enable(dude);


	// enemy = game.add.sprite(game.world.width - 100, 0, 'enemy');
	// game.physics.arcade.enable(enemy);
	// enemy.body.gravity.y = 100;
	// enemy.animations.add('run left', [0,1,2,3], 8, true);
	// enemy.animations.play('run left');
	// enemy.hitstun = false;


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

	

	// Camera
	// necessary?
	game.camera.follow(player);


	// player.frameName = 'mario_run_5.png';	// <- how to set to a specific frame

	playerState = stateEnum.RUNNING;
	updatePlayerAnimation();
	disableAllHitboxes();

}



/*************************************** Attacks ********************************************
 * 
 * 
 * 
 *******************************************************************************************/


// Temporary: demonstrate enemy hit by attack
function onEnemyKick(hitbox, enemy){

	// todo:
	//		use enemy health
	//		freeze frames
	// 		ensure each attack can only hit an enemy once

	enemy.body.velocity.x = 0;
	enemy.body.velocity.y = 0;
	enemy.hitstun = true;
	enemy.rotation = hitbox.knockbackDir;
	enemy.body.velocity.x = Math.cos(hitbox.knockbackDir) * hitbox.knockbackBase * hitbox.knockbackScaling;
	enemy.body.velocity.y = -Math.sin(hitbox.knockbackDir) * hitbox.knockbackBase * hitbox.knockbackScaling;

	// Temporary: reset enemy after a moment
	game.time.events.add( 	500, 
							function() {
								enemy.body.velocity.y = 0;
								enemy.rotation = 0;
								enemy.hitstun = false;
							}, 
							game);

}


// a kick attack
function kick(){
	// playerState = stateEnum.ATTACKING;
	changeState("ATTACKING");

	enableHitbox("kick");
	// testing ending attacks
	game.time.events.add(500, endAttack, game);
}

// temp: end the kick attack
		// then somehow return to correct state
function endAttack(){
	// If still attacking (haven't landed, been hit, etc)
	if(playerState === stateEnum.ATTACKING){
		changeState("JUMPING");
	}
}


// enable a hitbox by name
function enableHitbox(hitbox){
	for(var i = 0; i < hitboxes.children.length; i++){
		if(hitboxes.children[i].name === hitbox){
			hitboxes.children[i].reset(0,0);
		}
	}
}

function disableAllHitboxes(){
	hitboxes.forEachExists(function(hitbox) {
		hitbox.kill();
	});
}


/*********************************** States (player) ****************************************
 * changeState()
 * onExit functions
 * onEnter functions
 *******************************************************************************************/

function changeState(newstate){

	// call onExit
	switch(playerState){

		case stateEnum.RUNNING:
			onExitRunning();
			break;
		case stateEnum.JUMPING:
			onExitJumping();
			break;
		case stateEnum.JUMPSQUAT:
			onExitJumpsquat();
			break;
		case stateEnum.ATTACKING:
			onExitAttacking();
			break;
		default:
			console.log("error in changeState: somehow exiting a state that doesn't exist");
			break;
	}

	// change state and call onEnter
	newstate = newstate.toUpperCase();

	switch(newstate){

		case "RUNNING":
			playerState = stateEnum.RUNNING;
			onEnterRunning();
			break;
		case "JUMPING":
			playerState = stateEnum.JUMPING;
			onEnterJumping();
			break;
		case "JUMPSQUAT":
			playerState = stateEnum.JUMPSQUAT;
			onEnterJumpsquat();
			break;
		case "ATTACKING":
			playerState = stateEnum.ATTACKING;
			onEnterAttacking();
			break;
		default:
			console.log("error in changeState: trying to change to invalid state. Ignoring.");
			break;
	}

	updatePlayerAnimation();

}

// RUNNING
function onEnterRunning(){
	canDoubleJump = true;
}

function onExitRunning(){

}


// JUMPING
function onEnterJumping(){

}

function onExitJumping(){
	
}


// JUMPSQUAT
function onEnterJumpsquat(){
	// attempt to execute a fullhop after a short time
	var fullHopTimer = game.time.events.add( 150, fullhop, game);
}

function onExitJumpsquat(){
	
}


// ATTACKING
function onEnterAttacking(){

}

function onExitAttacking(){
	disableAllHitboxes();
}

/*********************************** Jumping (player) ***************************************
 * jumpsquat()
 * doubleJump()
 * shorthop()
 * fullhop()
 *******************************************************************************************/


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
	// playerState = stateEnum.JUMPING;
	changeState("JUMPING");

}

// Full hop if player didn't short hop
function fullhop(){

	// Check that the player is still in jumpsquat (he didn't short hop)
	if(playerState === stateEnum.JUMPSQUAT){
		player.body.velocity.y = -1500;
		// playerState = stateEnum.JUMPING;
		changeState("JUMPING");
	}	
}



/***************************************** Input ********************************************
 * leftButtonPressed()
 * leftButtonReleased()
 * rightButtonPressed()
 * rightButtonReleased()
 *******************************************************************************************/


function leftButtonPressed(){
	switch(playerState){

		case stateEnum.RUNNING:

			// jumpsquat();
			changeState("JUMPSQUAT");
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

	switch(playerState){

		case(stateEnum.JUMPING):
			kick();
			break;

		default:
			// do nothing
			break;
	}
	

}

function rightButtonReleased(){

}


/*********************************** Main Game Loop *****************************************
 * updatePlayerAnimation()
 * updateEnemies()
 * update()
 * render()
 * renderGroup()
 *******************************************************************************************/


// temporary: update the player based on state
function updatePlayer(){

	var grounded = false;

	if(game.physics.arcade.collide(player, platforms) ){
		grounded = true;
	}

	switch(playerState){

		case stateEnum.RUNNING:
			break;

		case stateEnum.JUMPSQUAT:
			break;

		case stateEnum.JUMPING:
			if(player.body.touching.down){
				changeState("RUNNING");
			}
			break;

		case stateEnum.ATTACKING:
			if(grounded){
				endAttack();
			}
			break;

		default:
			console.log("error in updatePlayer: player in invalid state");
			break;
	}

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
			break;

		default:
			console.log("error: no animation for player state: " + playerState );
			break;
	}

}

// testing group enemy update
function updateEnemies(){

	game.physics.arcade.collide(enemies, platforms);

	for(var i = 0; i < enemies.children.length; i++){

		// wrap horizontally
		if(enemies.children[i].body.x < 0 - enemies.children[i].body.width){
			enemies.children[i].body.x = game.world.width;
		}

		// Move if not hit
		if(enemies.children[i].hitstun === false){
			enemies.children[i].body.velocity.x = -150;
		}

		// Rotate during hitstun
		else{
			enemies.children[i].rotation = (Math.PI / 2) + Math.atan(enemies.children[i].body.velocity.y / enemies.children[i].body.velocity.x);
		}

	}


	// check if enemy hit by attack
	if(playerState === stateEnum.ATTACKING){
		game.physics.arcade.overlap(hitboxes, enemies, onEnemyKick);
	}

	// testing hitbox reset bug
	// game.physics.arcade.overlap(hitboxes, dude, function(){
	// 	console.log("Hit! :(");
	// });
	// game.physics.arcade.overlap(hitboxes, enemies, function(){
	// 	console.log("FUCKING CHRIST :(");
	// });
	

}

function update() {

	updatePlayer();
	updateEnemies();
	
	runSpeed = 350;

	/* Background */
	farBackground.tilePosition.x 	-= runSpeed * 0.001;
	nearBackground.tilePosition.x 	-= runSpeed * 0.003;
	foreground.tilePosition.x 		-= runSpeed * 0.012;


}

function render(){
	game.debug.body(player);
	hitboxes.forEachExists(renderGroup, this);
	enemies.forEachAlive(renderGroup, this);

	// testing hitbox reset bug
	 // game.debug.body(dude);
}

function renderGroup(member){
	game.debug.body(member);
}



