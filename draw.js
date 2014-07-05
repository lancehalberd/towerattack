var defaultTileSize = 30;
/**
 * Class that holds information for the source of a tile.
 *
 * @param {Image} image  Canvas or Image element that can be drawn from
 * @param {Number} tileX
 * @param {Number} tileY
 * @param {Number} tileSize
 */
function TileSource(image, tileX, tileY, tileSize) {
    this.image = image;
    this.tileX = tileX;
    this.tileY = tileY;
    this.tileSize = tileSize ? tileSize : defaultTileSize;
}

/**
 * Draws a tile to a context
 *
 * @param {context} context
 * @param {Number} x
 * @param {Number} y
 * @param {TileSource} tileSource
 */
function drawImageTile(context, x, y, tileSource) {
    var tileSize = tileSource.tileSize ? tileSource.tileSize : tileSize;
    context.drawImage(tileSource.image,
                      tileSource.tileX*tileSize, tileSource.tileY*tileSize, tileSize, tileSize,
                      x*tileSize, y*tileSize, tileSize, tileSize);
}


/**
 * Draws a brush tile to the context.
 *
 * @param {context} context
 * @param {Number} x
 * @param {Number} y
 * @param {String} brush
 */
function drawBrush(context, x, y, brush) {
    switch (brush) {
        case '0':
        case 'B':
            break;
        case 'R':
            drawImageTile(context, x, y, new TileSource(game.roadCanvas, 3, 3));
            break;
        case 'W':
            drawImageTile(context, x, y, new TileSource(game.images.background, 2, 0));
            break;
        case 'C':
            drawImageTile(context, x, y, new TileSource(game.images.background, 0, 1));
            break;
        case 'N':
            drawImageTile(context, x, y, new TileSource(game.images.background, 0, 2));
            break;
        default:
            //temporary code for drawing letters for graphics we don't have
            context.fillStyle = "black";
            context.font = "29pt Arial";
            context.fillText(brush, x * 30, y * 30 + 29, 30);
    }
}
