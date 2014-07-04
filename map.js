
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
        grid.push(string.split(''));
    });
    return grid;
}

var level1 = {
    grid: [
"00RRRRR0000RRR0",
"00R000R0RRRR0R0",
"00R000R0R00R0R0",
"00R000R0R00R0R0",
"00R000RRRRRR0R0",
"RRRRR0R000R00R0",
"R000RRR000R00R0",
"R000R00000RRRRN",
"R000R00000R000R",
"R00RRR0000R000R",
"RRRR0R0000R0RRR",
"00R00RRRRRRRR00",
"0RR0000R0000RR0",
"0R00000R00000R0",
"0NRRRRRRRRRRRR0"],
    paths:[
        [[1,14],[1,13],[1,12],[2,12],[2,11],[2,10],[1,10],[0,10],[0,9],[0,8],[0,7],[0,6],[0,5],[1,5],[2,5],[2,4],[2,3],[2,2],[2,1],[2,0],[3,0],[4,0],[5,0],[6,0],[6,1],[6,2],[6,3],[6,4],[7,4],[8,4],[8,3],[8,2],[8,1],[9,1],[10,1],[11,1],[11,0],[12,0],[13,0],[13,1],[13,2],[13,3],[13,4],[13,5],[13,6],[13,7],[14,7]],
        [[1,14],[2,14],[3,14],[4,14],[5,14],[6,14],[7,14],[8,14],[9,14],[10,14],[11,14],[12,14],[13,14],[13,13],[13,12],[12,12],[12,11],[12,10],[13,10],[14,10],[14,9],[14,8],[14,7]],
        [[14,7],[13,7],[12,7],[11,7],[10,7],[10,6],[10,5],[10,4],[9,4],[8,4],[7,4],[6,4],[6,5],[6,6],[5,6],[4,6],[4,7],[4,8],[4,9],[5,9],[5,10],[5,11],[6,11],[7,11],[8,11],[9,11],[10,11],[11,11],[12,11],[12,10],[13,10],[14,10],[14,9],[14,8],[14,7]]
    ]
};