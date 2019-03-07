function keyboard(value) {
  let key = {};
  key.value = value;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = event => {
    if (event.key === key.value) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
      event.preventDefault();
    }
  };

  //The `upHandler`
  key.upHandler = event => {
    if (event.key === key.value) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
      event.preventDefault();
    }
  };

  //Attach event listeners
  const downListener = key.downHandler.bind(key);
  const upListener = key.upHandler.bind(key);
  
  window.addEventListener(
    "keydown", downListener, false
  );
  window.addEventListener(
    "keyup", upListener, false
  );
  
  // Detach event listeners
  key.unsubscribe = () => {
    window.removeEventListener("keydown", downListener);
    window.removeEventListener("keyup", upListener);
  };
  
  return key;
}

function hitTestRectangle(r1, r2) {

  //Define the variables we'll need to calculate
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

  //hit will determine whether there's a collision
  hit = false;

  //Find the center points of each sprite
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;

  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

  //Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {

    //A collision might be occurring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {

      //There's definitely a collision happening
      hit = true;
    } else {

      //There's no collision on the y axis
      hit = false;
    }
  } else {

    //There's no collision on the x axis
    hit = false;
  }

  //`hit` will be either `true` or `false`
  return hit;
};

let rightKeyObject = keyboard("ArrowRight");
let leftKeyObject = keyboard("ArrowLeft");
//-------------------------------------------------

function FallBlock() {

    this.sprite = new PIXI.Graphics();
    this.sprite.beginFill(0xFF0000);
    this.sprite.drawRect(0, 0, 16, 16);
    this.sprite.x = 0.0;
    this.sprite.y = 0.0;
    this.sprite.vx = 0.0;
    this.sprite.vy = 0.0;
    this.sprite.ax = 0.0;
    this.sprite.ay = 0.0;

}

FallBlock.prototype.think = function(delta) {
    this.sprite.vx += this.sprite.ax;
    this.sprite.vy += this.sprite.ay;
    this.sprite.x += this.sprite.vx;
    this.sprite.y += this.sprite.vy;
};

//-------------------------------------------------

//Game related stuff
let gameClock = 0.0;
let meanArrival = 60.0;
let FBA = [];
let timeToSpawn = 0.0;
//------------------------------------------------
let type = "WebGL"
if(!PIXI.utils.isWebGLSupported()){
    type = "canvas"
}

//Create a Pixi Application
let app = new PIXI.Application({width: 256, height: 256});

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

let rect = new PIXI.Graphics();
rect.beginFill(0x00FF00);
rect.drawRect(0, 0, 8, 8);
rect.x = 0;
rect.y = 248;
rect.vx = 0.0;
rect.vy = 0.0;
app.stage.addChild(rect);

rightKeyObject.press = () => {
    rect.vx = 5.0;
}

rightKeyObject.release = () => {
    if(!leftKeyObject.isDown) rect.vx = 0.0;
}

leftKeyObject.press = () => {
    rect.vx = -5.0;
}

leftKeyObject.release = () => {
    if(!rightKeyObject.isDown) rect.vx = 0.0;
}

function gameState(delta) {
    rect.x += rect.vx;
    rect.y += rect.vy;
    if(rect.x > 248) rect.x = 248;
    if(rect.x < 0.0) rect.x = 0.0;

    for(i = 0; i < FBA.length; i++) {
	FBA[i].think(delta);
	if(hitTestRectangle(FBA[i].sprite, rect)) {
	    //player got hit
	    state = failState;
	}
	if(FBA[i].y > 248) {
	    //the fallblock should be destroyed
	    console.log("test");
	    FBA[i].sprite.visible = false;
	    app.stage.removeChild(FBA[i].sprite);
	    FBA.splice(i, 1);
	}
    }
    if(gameClock >= timeToSpawn) {
	nfb = new FallBlock();
	app.stage.addChild(nfb.sprite);
	nfb.sprite.x = Math.random()*256;
	nfb.sprite.ay = .25;
	FBA.push(nfb);
	timeToSpawn = gameClock + Math.random()*meanArrival;
    }
    gameClock += 1.0;

}
let state = gameState;

function failState(delta) {}

function gameLoop(delta) {
    state(delta);
}

app.ticker.add(delta => gameLoop(delta));
