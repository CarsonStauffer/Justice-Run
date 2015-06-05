/* player.js
 * author: carson stauffer
 * created: 6/4/2015
 */


function Player(game){
	Phaser.Sprite.call(this, game, 100, 0, 'mario atlas');

	// Properties
	this.state = stateEnum.RUNNING;
	this.canDoubleJump = true;
	this.runSpeed = 350;

	// Physics
	game.physics.arcade.enable(this);
	this.body.gravity.y = 4500;
	this.body.collideWorldBounds = true;
	this.body.checkCollision.up = false;
	this.body.checkCollision.left = false;
	this.body.checkCollision.right = false;
	this.body.setSize(32, 72, 20, 16);

	// Animations
	this.animations.add('run', Phaser.Animation.generateFrameNames('mario_run_', 1, 8, '.png'), 24, true);
	this.animations.add('jumpsquat', ['mario jumpsquat.png'], 1, true);
	this.animations.add('jump', ['mario_jump.png'], 1, true);
	this.animations.add('kick', ['mario_kick.png'], 1, true);

	game.add.existing(this);

	this.updateAnimation();
}

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;



/*************************************** States *********************************************
 * 
 * 
 * 
 *******************************************************************************************/

Player.prototype.changeState = function(newstate){

	// call onExit
	switch(this.state){

		case stateEnum.RUNNING:
			this.onExitRunning();
			break;
		case stateEnum.JUMPING:
			this.onExitJumping();
			break;
		case stateEnum.JUMPSQUAT:
			this.onExitJumpsquat();
			break;
		case stateEnum.ATTACKING:
			this.onExitAttacking();
			break;
		case stateEnum.FROZEN:
			this.onExitFrozen();
			break;
		default:
			console.log("error in changeState: somehow exiting a state that doesn't exist");
			break;
	}

	// change state and call onEnter
	newstate = newstate.toUpperCase();

	switch(newstate){

		case "RUNNING":
			this.state = stateEnum.RUNNING;
			this.onEnterRunning();
			break;
		case "JUMPING":
			this.state = stateEnum.JUMPING;
			this.onEnterJumping();
			break;
		case "JUMPSQUAT":
			this.state = stateEnum.JUMPSQUAT;
			this.onEnterJumpsquat();
			break;
		case "ATTACKING":
			this.state = stateEnum.ATTACKING;
			this.onEnterAttacking();
			break;
		case "FROZEN":
			this.state = stateEnum.FROZEN;
			this.onEnterFrozen();
			break;
		default:
			console.log("error in changeState: trying to change to invalid state. Ignoring.");
			break;
	}

	this.updateAnimation();

}

// RUNNING
Player.prototype.onEnterRunning = function(){
	this.canDoubleJump = true;
}

Player.prototype.onExitRunning = function(){

}


// JUMPING
Player.prototype.onEnterJumping = function(){

}

Player.prototype.onExitJumping = function(){
	
}


// JUMPSQUAT
Player.prototype.onEnterJumpsquat = function(){
	// attempt to execute a fullhop after a short time
	var fullHopTimer = game.time.events.add( 150, this.fullhop, this);
}

Player.prototype.onExitJumpsquat = function(){
	
}


// ATTACKING
Player.prototype.onEnterAttacking = function(){

}

Player.prototype.onExitAttacking = function(){
	disableAllHitboxes();
	// make all enemies vulnerable to attacks again
	for(var i = 0; i < enemies.children.length; i++){
		enemies.children[i].invincible = false;
	}
}

// FROZEN
Player.prototype.onEnterFrozen = function(){
	player.body.gravity.y = 0;
	player.body.velocity.y = 0;
}

Player.prototype.onExitFrozen = function(){
	player.body.gravity.y = 4500;
}



/*************************************** Jumping ********************************************
 * 
 * 
 * 
 *******************************************************************************************/

// double jump, if possible
Player.prototype.doubleJump = function(){
	if(this.canDoubleJump === true){
		this.body.velocity.y = -1300;
		this.canDoubleJump = false;
	}
}

// Immediately perform a shorthop
Player.prototype.shorthop = function(){
	this.body.velocity.y = -800;
	// playerState = stateEnum.JUMPING;
	this.changeState("JUMPING");

}

// Full hop if player didn't short hop
Player.prototype.fullhop = function(){
	// Check that the player is still in jumpsquat (he didn't short hop)
	if(this.state === stateEnum.JUMPSQUAT){
		this.body.velocity.y = -1500;
		// playerState = stateEnum.JUMPING;
		this.changeState("JUMPING");
	}	
}


/*************************************** Attacks ********************************************
 * 
 * 
 * 
 *******************************************************************************************/

Player.prototype.endAttack = function(){
	// If still attacking (haven't landed, been hit, etc)
	if(this.state === stateEnum.ATTACKING){
		this.changeState("JUMPING");
	}
}

// a basic attack. Proof of concept
Player.prototype.kick = function(){
	// playerState = stateEnum.ATTACKING;
	this.changeState("ATTACKING");

	enableHitbox("kick");
	// testing ending attacks
	game.time.events.add(500, this.endAttack, this);
}

/************************************* Update Loop ******************************************
 * 
 * 
 * 
 *******************************************************************************************/

// Set animation to match current state
Player.prototype.updateAnimation = function(){

	switch(this.state){

		case stateEnum.RUNNING:
			this.animations.play('run');
			break;

		case stateEnum.JUMPSQUAT:
			this.animations.play('jumpsquat');
			break;

		case stateEnum.JUMPING:
			this.animations.play('jump');
			break;

		case stateEnum.ATTACKING:
			this.animations.play('kick');
			break;

		case stateEnum.FROZEN:
			// player.animations.stop();
			break;

		default:
			console.log("error: no animation for player state: " + this.state );
			break;
	}

}

// Main update function
Player.prototype.update = function(){

	var grounded = false;

	if(game.physics.arcade.collide(this, platforms) ){
		grounded = true;
	}

		switch(this.state){

		case stateEnum.RUNNING:
			break;

		case stateEnum.JUMPSQUAT:
			break;

		case stateEnum.JUMPING:
			if(this.body.touching.down){
				this.changeState("RUNNING");
			}
			break;

		case stateEnum.ATTACKING:
			if(grounded){
				this.endAttack();
			}
			break;

		case stateEnum.FROZEN:
			// player.body.velocity.y = 0;
			break;

		default:
			console.log("error in updatePlayer: player in invalid state: " + playerState);
			break;
	}

}