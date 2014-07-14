function City() {
    this.population = 100;
    this.productivity = .1;
    this.brush = 'C';
    this.mapX = 0;
    this.mapY = 0;
}
function Mine() {
    this.gold = 10;
    this.waveGold = 10;
    this.brush = 'M';
    this.mapX = 0;
    this.mapY = 0;
}
function Farm() {
    this.calories = 10;
    this.waveCalories = 10;
    this.brush = 'F';
    this.mapX = 0;
    this.mapY = 0;
}
function Tower() {
    this.baseDamage = 5;
    this.damageRange = 5;
    this.range = 90;
    this.attacksPerSecond = 1;
    this.brush = 'T';
    this.mapX = 0;
    this.mapY = 0;
    this.angle = Math.random() * 2 * Math.PI;
    this.targetAngle = Math.random() * 2 * Math.PI;
    this.spriteIndex = Math.floor(Math.random() * 3);
    /** @type Animal */
    this.currentTarget = null;
    this.lastTimeFired = -2000;
}

function Projectile() {
    /** @type TileSource */
    this.tileSource = null;
    /** @type Animal */
    this.target = null;
    this.targetX = 0;
    this.targetY = 0;
    /** @type Tower */
    this.tower = null;
    this.mapX = 0;
    this.mapY = 0;
    this.percent = 0;
    this.speed = .1;
    this.angle = 0;
}

/**
 * @param {Tower} tower
 * @param {Animal} animal
 */
function shootProjectile(tower, animal) {
    tower.lastTimeFired = state.waveTime;
    var projectile = new Projectile();
    projectile.tileSource = new TileSource(game.images.towers, 2, tower.spriteIndex);
    projectile.target = animal;
    projectile.targetX = animal.mapX;
    projectile.targetY = animal.mapY;
    projectile.tower = tower;
    projectile.mapX = tower.mapX;
    projectile.mapY = tower.mapY;
    state.projectiles.push(projectile);
}

function updateAllProjectiles() {
    for (var i = 0; i < state.projectiles.length; i++) {
        /** @type Projectile */
        var projectile = state.projectiles[i];
        updateProjectile(projectile);
        //damage and remove projectile when it reaches the target
        if (projectile.percent >= 1) {
            var damage = projectile.tower.baseDamage + Math.floor(Math.random() * projectile.tower.damageRange);
            damageAnimal(projectile.target, damage);
            state.projectiles.splice(i--, 1);
        }
    }
}

/**
 * @param {Projectile} projectile
 */
function updateProjectile(projectile) {
    projectile.percent += projectile.speed;
    if (!projectile.target.dead && !projectile.target.finished) {
        projectile.targetX = projectile.target.mapX;
        projectile.targetY = projectile.target.mapY;
    }
    projectile.mapX = projectile.tower.mapX + projectile.percent * (projectile.targetX - projectile.tower.mapX);
    projectile.mapY = projectile.tower.mapY + projectile.percent * (projectile.targetY - projectile.tower.mapY);
    projectile.angle = atan2(projectile.tower.mapX, projectile.tower.mapY, projectile.targetX, projectile.targetY);
}

function drawProjectiles(context) {
    for (var i = 0; i < state.projectiles.length; i++) {
        /** @type Projectile */
        var projectile = state.projectiles[i];
        drawTileRotated(context, projectile.mapX, projectile.mapY, projectile.tileSource, projectile.angle);
    }
}

/**
 * Draws the towers to the context
 *
 * @param {context} context
 */
function drawTowers(context) {
    $.each(state.towers, function (index, tower) {
        drawTower(context, tower.mapX, tower.mapY, tower);
        if (tower == state.selectedElement) {
            context.strokeStyle = "#FFF";
            context.beginPath();
            context.arc(tower.mapX + 15, tower.mapY + 15, tower.range - 7, 0, 2*Math.PI);
            context.stroke();
        }
    });
}

/**
 * Draws the coty to the given context
 *
 * @param {context} context
 * @param {Number} x
 * @param {Number} y
 * @param {Tower} tower
 */
function drawTower(context, x, y, tower) {
    var frame = readyToFire(tower) ? 1 : 0;
    drawTileRotated(context, x, y, new TileSource(game.images.towers, frame, tower.spriteIndex), tower.angle);
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
            if (grid[y][x] != 'W' && grid[y][x] != 'R') {
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
            if (string == 'T') {
                row[j] = new Tower();
            }
        });
    });
    return grid;
}
