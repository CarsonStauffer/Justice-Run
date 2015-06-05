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
var enemies;
var cursors;

var farBackground;
var nearBackground;
var foreground;


// Enum for different player states
var stateEnum = Object.freeze(
		{
			RUNNING: {},
			JUMPSQUAT: {},
			JUMPING: {},
			ATTACKING: {},
			FROZEN: {}
		}
	);

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
	platforms.enableBody = true;


	// Create the foreground
	foreground = game.add.tileSprite(0, game.world.height - 64, 800, 64, 'ground');
	platforms.add(foreground);
	foreground.body.immovable = true;



	player = new Player(game);





	/* Player Hitboxes */
	// todo: move into player or their own prototype
	hitboxes = game.add.group();
	hitboxes.enableBody = true;
	player.addChild(hitboxes);


	var kickHitbox = hitboxes.create(0, 0, null);
	kickHitbox.body.setSize(50, 50, player.width, player.height * 0.6);
	kickHitbox.name = "kick";
	kickHitbox.damage = 100;
	kickHitbox.knockbackDir = 0.5;
	kickHitbox.knockbackBase = 1000;
	kickHitbox.knockbackScaling = 1.0;
	kickHitbox.freezeFrames = 5;
	kickHitbox.anchor.set(0.5);



	// Enemies
	enemies = game.add.group();

	for(var i = 0; i < 10; i++){
		
		var enemy = new Enemy(game);
		enemies.add(enemy);

	}


	// testing hitbox reset bug
	// dude = game.add.sprite(30,30, 'enemy');
	// game.physics.arcade.enable(dude);


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

	disableAllHitboxes();

}



/*************************************** Attacks ********************************************
 * 
 * 
 * 
 *******************************************************************************************/

// temp: freeze player during attack impact
function freezePlayer(hitbox){
	console.log("warning: bug: loses all momentum if hitting multiple enemies" ) ;
	var currentFallSpeed = player.body.velocity.y;
	// console.log("saving speed: " + currentFallSpeed);

	// freeze player
	player.changeState("FROZEN");

	// unfreeze after freeze time ends
	game.time.events.add(75, function(){
		player.changeState("ATTACKING");
		player.body.velocity.y = currentFallSpeed;
	}, game);
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


/***************************************** Input ********************************************
 * leftButtonPressed()
 * leftButtonReleased()
 * rightButtonPressed()
 * rightButtonReleased()
 *******************************************************************************************/


function leftButtonPressed(){
	switch(player.state){

		case stateEnum.RUNNING:

			// jumpsquat();
			player.changeState("JUMPSQUAT");
			break;

		case stateEnum.JUMPING:
			player.doubleJump();
			break;

		default:
			// do nothing
			break;
	}
}

function leftButtonReleased(){
	switch(player.state){

		case stateEnum.JUMPSQUAT:
			player.shorthop();
			break;
	}
}

function rightButtonPressed(){

	switch(player.state){

		case(stateEnum.JUMPING):
			player.kick();
			break;

		default:
			// do nothing
			break;
	}
	

}

function rightButtonReleased(){

}


/*********************************** Main Game Loop *****************************************
 * update()
 * render()
 * renderGroup()
 *******************************************************************************************/


// 	// testing hitbox reset bug
// 	// game.physics.arcade.overlap(hitboxes, dude, function(){
// 	// 	console.log("Hit! :(");
// 	// });
// 	// game.physics.arcade.overlap(hitboxes, enemies, function(){
// 	// 	console.log("FUCKING CHRIST :(");
// 	// });
	

// }

function update() {

	// updatePlayer();
	// updateEnemies();
	
	// runSpeed = 350;

	/* Background */
	farBackground.tilePosition.x 	-= player.runSpeed * 0.001;
	nearBackground.tilePosition.x 	-= player.runSpeed * 0.003;
	foreground.tilePosition.x 		-= player.runSpeed * 0.012;

	// temp
	// console.log("player fall speed: " + player.body.velocity.y );


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



