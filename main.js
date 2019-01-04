// conway's game of life
// each tile (cell) has two states, dead and alive
// each tile's status can be updated if certain conditions are met
/*
    Any live cell with fewer than two live neighbors dies, as if by underpopulation.
    Any live cell with two or three live neighbors lives on to the next generation.
    Any live cell with more than three live neighbors dies, as if by overpopulation.
    Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
*/

// DOM elems
let playElem = document.querySelector(".play_icon");
let pauseElem = document.querySelector(".pause_icon");
let fpsElem = document.querySelector(".fps");
let fpsUpElem = document.querySelector(".fps_up");
let fpsDownElem = document.querySelector(".fps_down");
let restartElem = document.querySelector(".restart");
let randomModeElem = document.querySelector(".random_mode");
let drawModeElem = document.querySelector(".draw_mode");
let clearAllElem = document.querySelector(".clear_all");
let displayIsPaused = document.querySelector(".display_is_paused");
let numTicksElem = document.querySelector(".num_ticks");
let totalAliveElem = document.querySelector(".total_alive");
let tilesChangedElem = document.querySelector(".tiles_changed");
let spawnChanceElem = document.querySelector(".spawn_chance_elem");
let canvas = document.querySelector(".canvas");

let ctx = canvas.getContext("2d");
// event listeners
canvas.addEventListener("mousedown", mouseDown);
canvas.addEventListener("mouseup", ()=>{mouseIsDown = false});
canvas.addEventListener("mousemove", mouseMove);
playElem.addEventListener("click", ()=>{pauseOrPlay(true)});
pauseElem.addEventListener("click", ()=>{pauseOrPlay(false)});
fpsElem.addEventListener("input", (e) => setUiValue(e));
spawnChanceElem.addEventListener("input", (e) => setUiValue(e));
restartElem.addEventListener("click", restart);
randomModeElem.addEventListener("click", ()=>{setMode('random')});
drawModeElem.addEventListener("click", ()=>{setMode('draw')});
clearAllElem.addEventListener("click", ()=>{killAllTiles()});
document.addEventListener('keydown', keyboardInput);

canvas.height = window.innerHeight;
canvas.width = window.innerWidth - 150; // 150px is for left_nav_ui

let screenRatio = canvas.height / canvas.width;

let tilesPerRow = 200;
let tilesPerCol = Math.round(tilesPerRow * screenRatio);

let tileWidth = Math.round(canvas.width / tilesPerRow);
let tileHeight = Math.round(canvas.height / tilesPerCol);

console.log(tileWidth);
console.log(tileHeight)

let tiles = [];

let Tile = {
    x: null,
    y: null,
    h: tileHeight,
    w: tileWidth,
    alive: false,
    neighbors: [],
    nextGenAlive: false, // determines state for next gen
    hasBeenDiscovered: false,
    worldX: null,
    worldY: null
}

let aliveColor = '#222222';
let deadColor = '#dddddd';
let discoveredColor = '#2ea548';
let spawnAliveChance = 0.1;
let numTicks = 0;

let totalAlive = 0;
let lastTotalAlive = 0;

//fps related / timing
let timeNow = performance.now(); 
let timeLastUpdate = performance.now();
let targetFPS = 10;

let clickedTile = null;
pauseOrPlay(true);

let mouseIsDown = false;
let shiftIsDown = false;
let mousePos = {x: null, y: null};

// // //

function mouseMove(e) {
    mousePos = {x: e.clientX, y: e.clientY};
    if(e.shiftKey) {
        shiftIsDown = true;
    } else {
        shiftIsDown = false;
    }
}

function mouseDown(e) {
    mousePos = {x: e.clientX, y: e.clientY};
    mouseIsDown = true
}

function keyboardInput(e) {
  // on space press toggle paused
  if(e.code == 'Space') {
    if(isPaused) {
      pauseOrPlay(true);
    } else {
      pauseOrPlay(false);
    }
  }
}

function click(e) {
    // console.log('click')
    // // clear old selected tiles
    // if(clickedTile) {
    //     clickedTile.isSelected = false;
    //     clickedTile.neighbors.forEach((neighbor) => {
    //         neighbor.isSelected = false;
    //     });
    // }

    // // get and display new selected tiles and neighbors
    // // convert click pos to tile coords
    // let x = Math.floor((e.clientX - 150)/ tileWidth); // -150 for left_ui offset
    // let y = Math.floor(e.clientY / tileHeight);
    
    // clickedTile = tiles[x][y];

    // // onclick toggle the alive status of clicked tile
    // clickedTile.alive = !clickedTile.alive;
    // clickedTile.nextGenAlive = !clickedTile.nextGenAlive;

    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    // drawTiles();
}

function pauseOrPlay(setToPlay) {
  if(setToPlay) {
    isPaused = false;
    displayIsPaused.style.opacity = 0;
  } else {
    isPaused = true;
    displayIsPaused.style.opacity = 1;
  }
}

function createTiles() {
    for (let x = 0; x < tilesPerRow; x++) {
        tiles.push([]);
        for (let y = 0; y < tilesPerCol; y++) {
            let t = Object.assign({}, Tile); 
            t.x = x;
            t.y = y;
            t.worldX = x * tileWidth;
            t.worldY = y * tileHeight;

            // set dead or alive
            let r = Math.random();
            if (r > (1 - spawnAliveChance)) t.alive = true;

            tiles[x].push(t);
        }
    }

    // once all tiles are created set their neighbors
    for (let x = 0; x < tilesPerRow; x++) {
        for (let y = 0; y < tilesPerCol; y++) {
            // set neighbors
            let neighbors = getNeighbors(tiles[x][y]);
            tiles[x][y].neighbors = neighbors;
        }
    }
}

function drawTiles() {

    let aliveTiles = [];
    let deadTiles = [];
    let discoveredTiles = [];

    for (let x = 0; x < tilesPerRow; x++) {
        for (let y = 0; y < tilesPerCol; y++) {
            let tile = tiles[x][y];

            if(tile.alive) {
                //ctx.fillStyle = aliveColor;
                aliveTiles.push(tile);
            } else { // dead
                if(tile.hasBeenDiscovered) {
                    //ctx.fillStyle = discoveredColor;
                    discoveredTiles.push(tile);
                } else {
                    //ctx.fillStyle = deadColor;
                    deadTiles.push(tile);
                }
            }

            // ctx.beginPath();
            // ctx.moveTo(tile.x * tile.w, tile.y * tile.h);
            // ctx.rect(tile.x * tile.w, tile.y * tile.h, tile.w - 1, tile.h - 1); // -1 to show spacing between tiles
            // ctx.fill();
        }
    }

    //
    // seperating the draw operations seems to help speed alot!
    //

    ctx.fillStyle = aliveColor;
    ctx.beginPath();
    aliveTiles.forEach((tile) => {
        ctx.moveTo(tile.worldX, tile.worldY);
        ctx.rect(tile.worldX, tile.worldY, tile.w - 1, tile.h - 1); // -1 to show spacing between tiles
    });
    ctx.fill();

    // dead tiles take BY FAR the most time to render
    // this is just cause there are so many of them
    // do we really need to draw each blank tiles?
    // another way to get grid lines would be to draw one large image with lines
    // or just go with no grid lines
    ctx.fillStyle = deadColor;
    ctx.beginPath();
    deadTiles.forEach((tile) => {
        ctx.moveTo(tile.worldX, tile.worldY);
        ctx.rect(tile.worldX, tile.worldY, tile.w - 1, tile.h - 1); // -1 to show spacing between tiles
    });
    ctx.fill();

    ctx.fillStyle = discoveredColor;
    ctx.beginPath();
    discoveredTiles.forEach((tile) => {
        ctx.moveTo(tile.worldX, tile.worldY);
        ctx.rect(tile.worldX, tile.worldY, tile.w - 1, tile.h - 1); // -1 to show spacing between tiles
    });
    ctx.fill();
}

function getNeighbors(tile) {
    let neighbors = [];

    // left, right, top, bot
    if(tile.x > 0) neighbors.push(tiles[tile.x - 1][tile.y]);
    if(tile.x < tilesPerRow - 1) neighbors.push(tiles[tile.x + 1][tile.y]);
    if(tile.y > 0) neighbors.push(tiles[tile.x][tile.y - 1]);
    if(tile.y < tilesPerCol - 1) neighbors.push(tiles[tile.x][tile.y + 1]);

    // topleft, topright, botleft, botright
    if(tile.x > 0 && tile.y > 0) neighbors.push(tiles[tile.x - 1][tile.y - 1]);
    if(tile.x < tilesPerRow - 1 && tile.y > 0) neighbors.push(tiles[tile.x + 1][tile.y - 1]);
    if(tile.x > 0 && tile.y < tilesPerCol - 1) neighbors.push(tiles[tile.x - 1][tile.y + 1]);
    if(tile.x < tilesPerRow - 1 && tile.y < tilesPerCol - 1) neighbors.push(tiles[tile.x + 1][tile.y + 1]);

    return neighbors;
}

function checkTilesNextGen() {
    // every frame check each tile to determine its status for the next frame
    
    /*
        Any live cell with fewer than two live neighbors dies, as if by underpopulation.
        Any live cell with two or three live neighbors lives on to the next generation.
        Any live cell with more than three live neighbors dies, as if by overpopulation.
        Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
    */

    // count how many there are alive this frame
    let totalAlive = 0;

    // get next gen alive or dead
    for (let x = 0; x < tilesPerRow; x++) {
        for (let y = 0; y < tilesPerCol; y++) {
            let tile = tiles[x][y];
            
            let neighborsAlive = 0;
            tile.neighbors.forEach((neighbor) => {
                if(neighbor.alive) {
                    neighborsAlive++;
                }
            });
            
            // determine what to do to the tile based on the number of neighbors alive
            if(tile.alive) {
                if(neighborsAlive < 2 || neighborsAlive > 3) { // under 2 die underpopulation, over 3 die overpop
                    tile.nextGenAlive = false;
                } else {
                    tile.nextGenAlive = true; // 2 or 3 live on
                    // if tile is alive mark as discovered
                   tile.hasBeenDiscovered = true;
                }

                totalAlive++;
            } else if(!tile.alive) {
                if(neighborsAlive == 3) { // if dead w/ 3 live neighbors make alive from reproduction / colonization
                    tile.nextGenAlive = true;
                }
            }
        }
    }
    
    
    // update to nextGenAlive or dead
    for (let x = 0; x < tilesPerRow; x++) {
        for (let y = 0; y < tilesPerCol; y++) {        
            tiles[x][y].alive = tiles[x][y].nextGenAlive;
        }
    }

    // display total alive
    totalAliveElem.innerHTML = "Alive: " + totalAlive;
    tilesChangedElem.innerHTML = "Changed: " + (totalAlive - lastTotalAlive);
    lastTotalAlive = totalAlive;
}

function setMode(modeType) {
  console.log('set to mode: ' + modeType);

  if(modeType == 'random') {
    pauseOrPlay(true)
    restart();
  }

  if(modeType == 'draw') {
    pauseOrPlay(false)
  }
}

function toggleAlive() {
    // if mouse is over a tile and mouseDown then draw the tile
    let x = Math.floor((mousePos.x - 150)/ tileWidth); // -150 for left_ui offset
    let y = Math.floor(mousePos.y / tileHeight);
    let overTile = tiles[x][y];

    // if shift is down set dead
    // else set alive
    if(shiftIsDown) {
        overTile.alive = false;
        overTile.nextGenAlive = false;
    } else {
        overTile.alive = true;
        overTile.nextGenAlive = true;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTiles();
}

function update() {

    if(mouseIsDown) toggleAlive();

    if(!isPaused) { // if not paused do update stuff
      timeNow = performance.now();
      let elapsed = timeNow - timeLastUpdate;
      // only actually redraw at our desired framerate
      // actual update happens in here
      if(elapsed / (1000 / targetFPS) >= 1) {
          numTicks++;
          numTicksElem.innerHTML = "Num Ticks: " + numTicks;
          timeLastUpdate = timeNow;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          checkTilesNextGen();
          drawTiles();
      }
    }
    requestAnimationFrame(update);
}

function killAllTiles() {
  for (let x = 0; x < tilesPerRow; x++) {
    for (let y = 0; y < tilesPerCol; y++) {   
        tiles[x][y].alive = false;     
        tiles[x][y].nextGenAlive = false;
    }
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTiles();
}

function restart() {
  // reset all the things
  for (let x = 0; x < tilesPerRow; x++) {
    for (let y = 0; y < tilesPerCol; y++) {   
        // set dead or alive
        let r = Math.random();
        if (r > (1 - spawnAliveChance)) {
          tiles[x][y].alive = true;     
        }
    }
  }
}

function start() {
    createTiles();
    drawTiles();
    setInitialUI();

    //console.log(tiles)
    update();
}
start();