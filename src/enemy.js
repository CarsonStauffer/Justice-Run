/* enemy.js
 * author: carson stauffer
 * created: 6/4/2015
 */

// NOTE: 'this' refers to the instance of this class (aka: this individual enemy)

function Enemy(game){
	Phaser.Sprite.call(this, game, game.world.randomX / 2 + 500, game.world.randomY / 2, 'enemy');
	
	// Enemy properties
	this.hitstun = false;
	this.invincible = false;
	this.anchor.set(0.5);

	// Enemy physics
	game.physics.arcade.enable(this);
	this.body.gravity.y = 300;

	// Enemy animation
	this.animations.add('run left', [0,1,2,3], 8, true);
	this.animations.play('run left');

	game.add.existing(this);
}

Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.getHit = function(enemy, hitbox){
	
	if(enemy.invincible === false){
		enemy.invincible = true;
		enemy.body.velocity.x = 0;
		enemy.body.velocity.y = 0;

		// temp: just knockback. future: freeze frames
		enemy.applyKnockback(hitbox);
	}
}

Enemy.prototype.applyKnockback = function(hitbox){
	this.hitstun = true;
	this.rotation = hitbox.knockbackDir;
	this.body.velocity.x = Math.cos(hitbox.knockbackDir) * hitbox.knockbackBase * hitbox.knockbackScaling;
	this.body.velocity.y = -Math.sin(hitbox.knockbackDir) * hitbox.knockbackBase * hitbox.knockbackScaling;

	// temporary: reset after a moment
	game.time.events.add(500, this.stopFlyingThroughTheAir, this);
}

// temporary
Enemy.prototype.stopFlyingThroughTheAir = function(){
	this.body.velocity.x = 0;
	this.body.velocity.y = 0;
	this.rotation = 0;
	this.hitstun = false;
}

Enemy.prototype.update = function(){

	game.physics.arcade.collide(enemies, platforms);

	// wrap horizontally
	if(this.body.x < 0 - this.body.width){
		this.body.x = game.world.width;
	}

	if(this.hitstun === false){
		// move left
		this.body.velocity.x = -150;
	}
	else{
		// rotate with trajectory during hitstun
		this.rotation = (Math.PI / 2) + Math.atan(this.body.velocity.y / this.body.velocity.x);
	}

	// check if hit by attack
	if(player.state === stateEnum.ATTACKING){
		game.physics.arcade.overlap(this, hitboxes, this.getHit);
	}



}