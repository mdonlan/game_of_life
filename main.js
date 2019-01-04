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
let canvas = document.querySelector(".canvas");
let ctx = canvas.getContext("2d");
// event listeners
canvas.addEventListener("click", click);
playElem.addEventListener("click", ()=>{pauseOrPlay(true)});
pauseElem.addEventListener("click", ()=>{pauseOrPlay(false)});
fpsElem.addEventListener("input", (e) => setFps(e));
restartElem.addEventListener("click", restart);

canvas.height = window.innerHeight;
canvas.width = window.innerWidth - 300; // 300px is for left_nav_ui

let screenRatio = canvas.height / canvas.width;

let tilesPerRow = 100;
let tilesPerCol = Math.round(tilesPerRow * screenRatio);

let tileWidth = canvas.width / tilesPerRow;
let tileHeight = canvas.height / tilesPerCol;

let tiles = [];

let Tile = {
    x: null,
    y: null,
    h: tileHeight,
    w: tileWidth,
    alive: false,
    neighbors: [],
    isSelected: false,
    nextGenAlive: false, // determines state for next gen
}

let aliveColor = '#222222';
let deadColor = '#dddddd';
let aliveSpawnChance = 0.2;

//fps related / timing
let timeNow = performance.now(); 
let timeLastUpdate = performance.now();
let targetFPS = 10;

let clickedTile = null;
let isPaused = false;

// // //

function click(e) {
    // clear old selected tiles
    if(clickedTile) {
        clickedTile.isSelected = false;
        clickedTile.neighbors.forEach((neighbor) => {
            neighbor.isSelected = false;
        });
    }

    // get and display new selected tiles and neighbors
    // convert click pos to tile coords
    let x = Math.floor(e.clientX / tileWidth);
    let y = Math.floor(e.clientY / tileHeight);
    
    clickedTile = tiles[x][y];

    clickedTile.isSelected = true;
    clickedTile.neighbors.forEach((neighbor) => {
        neighbor.isSelected = true;
    });
}

function pauseOrPlay(setToPlay) {
  console.log(setToPlay)
  if(setToPlay) {
    isPaused = false;
  } else {
    isPaused = true;
  }
}

function createTiles() {
    for (let x = 0; x < tilesPerRow; x++) {
        tiles.push([]);
        for (let y = 0; y < tilesPerCol; y++) {
            let t = Object.assign({}, Tile); 
            t.x = x;
            t.y = y;

            // set dead or alive
            let r = Math.random();
            if (r > (1 - aliveSpawnChance)) t.alive = true;

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
    for (let x = 0; x < tilesPerRow; x++) {
        for (let y = 0; y < tilesPerCol; y++) {
            let tile = tiles[x][y];

            if(tile.isSelected) {
                ctx.fillStyle = "Green";
            } else {
                ctx.fillStyle = tile.alive ? aliveColor : deadColor;
            }

            ctx.beginPath();
            ctx.moveTo(tile.x * tile.w, tile.y * tile.h);
            ctx.rect(tile.x * tile.w, tile.y * tile.h, tile.w - 1, tile.h - 1); // -1 to show spacing between tiles
            ctx.fill();
        }
    }
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
                }
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
}

function update() {

    if(!isPaused) { // if not paused do update stuff
      timeNow = performance.now();
      let elapsed = timeNow - timeLastUpdate;
      // only actually redraw at our desired framerate
      if(elapsed / (1000 / targetFPS) >= 1) {
          timeLastUpdate = timeNow;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          checkTilesNextGen();
          drawTiles();
      }
    }
    requestAnimationFrame(update);
}

function restart() {
  // reset all the things
  for (let x = 0; x < tilesPerRow; x++) {
    for (let y = 0; y < tilesPerCol; y++) {   
        // set dead or alive
        let r = Math.random();
        if (r > (1 - aliveSpawnChance)) tiles[x][y].alive = true;     
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