function City() {
    this.population = 100;
    this.productivity = .1;
    this.tileX = 0;
    this.tileY = 0;
    this.mapX = 0;
    this.mapY = 0;
    this.classType = 'City';
    this.brush = 'R';
}
function Mine() {
    this.gold = 10;
    this.waveGold = 10;
    this.tileX = 0;
    this.tileY = 0;
    this.mapX = 0;
    this.mapY = 0;
    this.classType = 'Mine';
    this.brush = 'R';
}
function Farm() {
    this.calories = 10;
    this.waveCalories = 10;
    this.tileX = 0;
    this.tileY = 0;
    this.mapX = 0;
    this.mapY = 0;
    this.classType = 'Farm';
    this.brush = 'R';
}
function Nest() {
    this.tileX = 0;
    this.tileY = 0;
    this.mapX = 0;
    this.mapY = 0;
    this.classType = 'Nest';
    this.brush = 'R';
}

/**
 * Draws the cities to the context
 *
 * @param {context} context
 */
function drawCities(context) {
    $.each(state.cities, function (index, city) {
        drawCity(context, city.mapX, city.mapY, city);
    });
}

/**
 * Draws the coty to the given context
 *
 * @param {context} context
 * @param {Number} x
 * @param {Number} y
 * @param {City} city
 */
function drawCity(context, x, y, city) {
    var frame = 0;
    if (city.population == 0) {
        frame = 3;
    } else if (city.population <= 30) {
        frame = 2;
    } else if (city.population <= 60) {
        frame = 1;
    }
    drawTileRotated(context, x, y, new TileSource(game.images.background, frame, 2), 0);
}

/**
 * Draws the map grid to the given context.
 *
 * @param {context} context
 * @param {array} grid
 */
function drawGrid(context, grid) {
    context.fillStyle="#aade87";
    context.fillRect(0, 0, 600, 600);
    drawWater(context, grid);
    drawAllRoads(context, grid);
    for (var y = 0; y < grid.length; y++){
        for (var x = 0; x < grid[y].length; x++){
            if (!grid[y][x].classType && grid[y][x] != 'W' && grid[y][x] != 'R') {
                drawBrush(context, x * defaultTileSize, y * defaultTileSize, grid[y][x]);
            }
        }
    }
}

/**
 * Draws the paths defined in the current state to the given context.
 *
 * @param {Array} grid  state of the game
 * @param {Number} x  The x tile coordinate
 * @param {Number} y  The y tile coordinate
 * @return {String}
 */
function getGridValue(grid, x, y) {
    if (!inGrid(grid, x, y)) {
        return null;
    }
    return grid[y][x].brush ? grid[y][x].brush : grid[y][x];
}

/**
 * Returns true if the coordinates are on the given grid
 *
 * @param {Array} grid  state of the game
 * @param {Number} x  The x tile coordinate
 * @param {Number} y  The y tile coordinate
 * @return {Boolean}
 */
function inGrid(grid, x, y) {
    return (x >= 0 && y >= 0 && x < grid[0].length && y < grid.length);
}

/**
 *
 * @param {array} grid
 * @param {Number} x
 * @param {Number} y
 */
function isRoad(grid, x, y) {
    var value = getGridValue(grid, x, y);
    //roads are drawn for any of these tiles
    return ['R', 'B', 'C', 'N', 'F', 'M'].indexOf(value) >= 0;
}


/**
 * Draws the roads for the grid to the given context.
 *
 * @param {context} context
 * @param {array} grid
 */
function drawAllRoads(context, grid) {
    for (var y = 0; y < grid.length; y++){
        for (var x = 0; x < grid[y].length; x++){
            if (isRoad(grid, x, y)) {
                //reset to 0 every time we start checking
                var srcX = 0;
                var srcY = 0;

                //connection to the North?
                if (isRoad(grid, x, y - 1)) {
                    srcY = srcY+2;
                }
                //connection to the South?
                if (isRoad(grid, x, y + 1)) {
                    srcY = srcY+1;
                }
                //connection to the West?
                if (isRoad(grid, x - 1, y)) {
                    srcX = srcX+2;
                }
                //connection to the East?
                if (isRoad(grid, x + 1, y)) {
                    srcX = srcX+1;
                }
                drawImageTile(context, x, y, new TileSource(game.roadCanvas, srcX, srcY));
            }
        }
    }
}

function isFullWater(grid, miniX, miniY) {
    var tileX = Math.floor(miniX / 3);
    var subX = miniX % 3;
    var tileY = Math.floor(miniY / 3);
    var subY = miniY % 3;
    function isWater(tileX, tileY) {
        var value = getGridValue(grid, tileX, tileY);
        return value == 'W' || value == 'B';
    }
    if (!isWater(tileX, tileY)) {
        return false;
    }
    //center case
    if (subX == 1 && subY == 1) {
        return true;
    }
    //edges cases
    if (subX == 1 && subY == 0) {
        return isWater(tileX, tileY - 1);
    }
    if (subX == 1 && subY == 2) {
        return isWater(tileX, tileY + 1);
    }
    if (subX == 0 && subY == 1) {
        return isWater(tileX - 1, tileY);
    }
    if (subX == 2 && subY == 1) {
        return isWater(tileX + 1, tileY);
    }
    //corner cases are the most complicated
    if (subX == 0 && subY == 0) {
        return isWater(tileX - 1, tileY - 1) || (isWater(tileX - 1, tileY) && isWater(tileX, tileY - 1));
    }
    if (subX == 2 && subY == 0) {
        return isWater(tileX + 1, tileY - 1) || (isWater(tileX + 1, tileY) && isWater(tileX, tileY - 1));
    }
    if (subX == 0 && subY == 2) {
        return isWater(tileX - 1, tileY + 1) || (isWater(tileX - 1, tileY) && isWater(tileX, tileY + 1));
    }
    if (subX == 2 && subY == 2) {
        return isWater(tileX + 1, tileY + 1) || (isWater(tileX + 1, tileY) && isWater(tileX, tileY + 1));
    }
    return false;
}

function drawWater(context, grid) {
    var waterTileSize = 10;
    var fullWaterSquare = new TileSource(game.waterCanvas, 1, 3, 10);
    for (var miniY = 0; miniY < grid.length * 3; miniY++){
        for (var miniX = 0; miniX < grid[0].length * 3; miniX++){
            if (isFullWater(grid, miniX, miniY)) {
                drawImageTile(context, miniX, miniY, fullWaterSquare);
            } else {
                //reset to 0 every time we start checking
                var srcX = 0;
                var srcY = 0;
                if (isFullWater(grid, miniX, miniY - 1)) {//N
                    srcY = srcY+2;
                }
                if (isFullWater(grid, miniX, miniY + 1)) {//S
                    srcY = srcY+1;
                }
                if (isFullWater(grid, miniX - 1, miniY)) {//W
                    srcX = srcX+2;
                }
                if (isFullWater(grid, miniX + 1, miniY)) {//E
                    srcX = srcX+1;
                }
                if (srcX || srcY) {
                    drawImageTile(context, miniX, miniY, new TileSource(game.waterCanvas, srcX, srcY, 10));
                } else {
                    if (isFullWater(grid, miniX - 1, miniY - 1)) {//NW
                        drawImageTile(context, miniX, miniY, new TileSource(game.waterCanvas, 0, 0, 10));
                    }
                    if (isFullWater(grid, miniX + 1, miniY - 1)) {//NE
                        drawImageTile(context, miniX, miniY, new TileSource(game.waterCanvas, 3, 0, 10));
                    }
                    if (isFullWater(grid, miniX - 1, miniY + 1)) {//SW
                        drawImageTile(context, miniX, miniY, new TileSource(game.waterCanvas, 0, 3, 10));
                    }
                    if (isFullWater(grid, miniX + 1, miniY + 1)) {//SE
                        drawImageTile(context, miniX, miniY, new TileSource(game.waterCanvas, 3, 3, 10));
                    }
                }
            }
        }
    }
}

function arrayToGrid(arrayOfStrings) {
    var grid = [];
    //for (var i = 0; i < arrayOfStrings.length; i++) {
    //    var string = arrayOfStrings[i]
    //    [code]
    //}
    $.each(arrayOfStrings, function (i, string) {
        var row = string.split('');
        grid.push(row);
        $.each(row, function (j, string) {
            if (string == 'C') {
                row[j] = new City();
            }
            if (string == 'F') {
                row[j] = new Farm();
            }
            if (string == 'M') {
                row[j] = new Mine();
            }
            if (string == 'N') {
                row[j] = new Nest();
            }
            if (string == 'T') {
                row[j] = getRandomTower();
            }
        });
    });
    return grid;
}
