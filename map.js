
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
                drawBrush(context, x, y, grid[y][x]);
            }
        }
    }
}


/**
 * Draws the roads for the grid to the given context.
 *
 * @param {context} context
 * @param {array} grid
 */
function drawAllRoads(context, grid) {
    function isRoad(x, y) {
        var value = getGridValue(grid, x, y);
        //roads are drawn for any of these tiles
        return ['R', 'B', 'C', 'N', 'F', 'M'].indexOf(value) >= 0;
    }
    for (var y = 0; y < grid.length; y++){
        for (var x = 0; x < grid[y].length; x++){
            if (isRoad(x, y)) {
                //reset to 0 every time we start checking
                var srcX = 0;
                var srcY = 0;

                //connection to the North?
                if (isRoad(x, y - 1)) {
                    srcY = srcY+2;
                }
                //connection to the South?
                if (isRoad(x, y + 1)) {
                    srcY = srcY+1;
                }
                //connection to the West?
                if (isRoad(x - 1, y)) {
                    srcX = srcX+2;
                }
                //connection to the East?
                if (isRoad(x + 1, y)) {
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
        grid.push(string.split(''));
    });
    return grid;
}

var level1 = [
"00RRRRR0000RRR0",
"00R000R0RRRR0R0",
"00R000R0R00R0R0",
"00R000R0R00R0R0",
"00R000RRRRRR0R0",
"RRRRR0R000R00R0",
"R000RRR000R00R0",
"R000R00000RRRRR",
"R000R00000R000R",
"R00RRR0000R000R",
"RRRR0R0000R0RRR",
"00R00RRRRRRRR00",
"0RR0000R0000RR0",
"0R00000R00000R0",
"0RRRRRRRRRRRRR0"];