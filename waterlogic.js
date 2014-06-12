function drawMiniImageTile(context, x, y, src, srcX, srcY) {
    context.drawImage(src, srcX*miniTileSize, srcY*miniTileSize, miniTileSize, miniTileSize, x*miniTileSize, y*miniTileSize, miniTileSize, miniTileSize);
}

var miniTileSize = 10;
function drawWater(context, grid) {
    for (var y = 0; y < grid.length; y++){
        for (var x = 0; x < grid[y].length; x++){
            var miniX = x*3;
            var miniY = y*3;
            //drawMiniImageTile(context, miniX+1, miniY+1, waterCanvas, 1, 1);
            //continue;
            if (grid[y][x] == 'W') {
                //reset to 0 every time we start checking
                var srcX = 0;
                var srcY = 0;
                
                /* _ _ _
                 *|1 2 3|
                 *|4 5 6|
                 *|7 8 9|
                 * - - -
                */
                
                drawMiniImageTile(context, miniX+1, miniY+1, waterCanvas, 1, 1);
                
                //connection straight to the North?
                if (y-1 >= 0 && grid[y-1][x] == 'W') {
                    //Full square. '2' spot.
                    drawMiniImageTile(context, miniX+1, miniY, waterCanvas, 1, 1);
                }
                //connection straight to the South?
                if (y+1 < grid.length && grid[y+1][x] == 'W') {
                    //Full square. '8' spot.
                    drawMiniImageTile(context, miniX+1, miniY+2, waterCanvas, 1, 1);
                }
                //connection straight to the West?
                if (x-1 >= 0 && grid[y][x-1] == 'W') {
                    //Full square. '4' spot.
                    drawMiniImageTile(context, miniX, miniY+1, waterCanvas, 1, 1);
                }
                //connection straight to the East?
                if (x+1 < grid[y].length && grid[y][x+1] == 'W') {
                    //Full square. '6' spot.
                    drawMiniImageTile(context, miniX+2, miniY+1, waterCanvas, 1, 1);
                }
                //connection NW-diagonal or both North and West?
                if (y-1 >= 0 && x-1 >= 0
                    && (grid[y-1][x-1] == 'W'
                        || (grid[y-1][x] == 'W' && grid[y][x-1] == 'W')
                        )
                    ){
                    //Full square. '1' spot.
                    drawMiniImageTile(context, miniX, miniY, waterCanvas, 1, 1);
                }
                //connection NE-diagonal or both North and East?
                if (y-1 >= 0 && x+1 < grid[y].length
                    && (grid[y-1][x+1] == 'W'
                        || (grid[y-1][x] == 'W' && grid[y][x+1] == 'W')
                        )
                    ) {
                    //Full square. '3' spot.
                    drawMiniImageTile(context, miniX+2, miniY, waterCanvas, 1, 1);
                }
                //connection SE-diagonal or both South and East?
                if (y+1 < grid.length && x+1 < grid[y].length
                    && (grid[y+1][x+1] == 'W'
                        || (grid[y+1][x] == 'W' && grid[y][x+1] == 'W')
                        )
                    ) {
                    //Full square. '9' spot.
                    drawMiniImageTile(context, miniX+2, miniY+2, waterCanvas, 1, 1);
                }
                //connection SW-diagonal or both South and West?
                if (y+1 < grid.length && x-1 >= 0
                    && (grid[y+1][x-1] == 'W'
                        || (grid[y+1][x] == 'W' && grid[y][x-1] == 'W')
                        )
                    ) {
                    //Full square. '7' spot.
                    drawMiniImageTile(context, miniX, miniY+2, waterCanvas, 1, 1);
                }
            }
        }
    }
}

function drawWaterLikeRoads(context, grid) {
    for (var y = 0; y < grid.length; y++){
        for (var x = 0; x < grid[y].length; x++){
            if (grid[y][x] == 'W') {
                //reset to 0 every time we start checking
                var srcX = 0;
                var srcY = 0;
                
                //connection to the North?
                if (y-1 >= 0 && grid[y-1][x] == 'W') {
                    srcY = srcY+2;
                }
                //connection to the South?
                if (y+1 < grid.length && grid[y+1][x] == 'W') {
                    srcY = srcY+1;
                }
                //connection to the West?
                if (x-1 >= 0 && grid[y][x-1] == 'W') {
                    srcX = srcX+2;
                }
                //connection to the East?
                if (x+1 < grid[y].length && grid[y][x+1] == 'W') {
                    srcX = srcX+1;
                }
                drawImageTile(context, x, y, waterCanvas, srcX, srcY);
            }
        }
    }
}