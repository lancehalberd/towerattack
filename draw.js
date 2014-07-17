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
 * Returns the angle from (x1, y1) to (x2,y2) which when given an image facing
 * right at angle 0, will point the image from x1,y1 towards x2,y2 when
 * context.rotate(angle) is used.
 *
 * @param {Number} x1
 * @param {Number} y1
 * @param {Number} x2
 * @param {Number} y2
 * @return {Number}
 */
function atan2(x1, y1, x2, y2) {
    if (x1 == x2) {
        return(y2 > y1) ? Math.PI / 2 : -Math.PI / 2;
    }
    return Math.atan((y2 - y1) / (x2 - x1)) + (x2 < x1 ? Math.PI : 0);
}

/**
 * Returns the distance squared between two points.
 *
 * @param {Number} x1
 * @param {Number} y1
 * @param {Number} x2
 * @param {Number} y2
 * @return {Number}
 */
function distanceSquared(x1,y1,x2,y2) {
    return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
}

function absoluteAngleSize(angle) {
    while (angle < -Math.PI) angle += Math.PI * 2;
    while (angle >= Math.PI) angle -= Math.PI * 2;
    return Math.abs(angle);
}

/**
 * Draw an animal sprite to a given context.
 *
 * @param {context} context  The context to draw to
 * @param {Number} x  The x coordinate to draw to
 * @param {Number} y  The y coordinate to draw to
 * @param {TileSource} tileSource  The row to grab the sprite from the creatureSprite sheet
 * @param {Number} rotation  The rotation to draw the sprite at
 */
function drawTileRotated(context, x, y, tileSource, rotation) {
    var tileSize = tileSource.tileSize;
    //context.drawImage(creatureSprite, srcX, srcY, tileSize, tileSize, x, y, tileSize, tileSize);
    context.translate(x + tileSize / 2, y + tileSize / 2);
    context.rotate(rotation);
    context.drawImage(tileSource.image, tileSource.tileX * tileSize, tileSource.tileY * tileSize, tileSize, tileSize, -tileSize / 2, -tileSize / 2, tileSize, tileSize);
    context.rotate(-rotation);
    context.translate(-x - tileSize / 2, -y - tileSize / 2);
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
 * @param {String} tile
 */
function drawBrush(context, x, y, tile) {
    switch (tile.brush ? null : tile) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
            var num = parseInt(tile) - 1;
            drawTileRotated(context, x, y, new TileSource(game.images.background, num % 4, Math.floor(num / 4)));
        case '0':
        case 'B':
            break;
        case 'R':
            drawTileRotated(context, x, y, new TileSource(game.roadCanvas, 3, 3));
            break;
        case 'W':
            drawTileRotated(context, x, y, new TileSource(game.waterCanvas, 3, 3, 10), 0);
            drawTileRotated(context, x + 10, y, new TileSource(game.waterCanvas, 0, 1, 10), 0);
            drawTileRotated(context, x + 20, y, new TileSource(game.waterCanvas, 0, 3, 10), 0);
            drawTileRotated(context, x, y + 10, new TileSource(game.waterCanvas, 1, 0, 10), 0);
            drawTileRotated(context, x + 10, y + 10, new TileSource(game.waterCanvas, 2, 3, 10), 0);
            drawTileRotated(context, x + 20, y + 10, new TileSource(game.waterCanvas, 2, 0, 10), 0);
            drawTileRotated(context, x, y + 20, new TileSource(game.waterCanvas, 3, 0, 10), 0);
            drawTileRotated(context, x + 10, y + 20, new TileSource(game.waterCanvas, 0, 2, 10), 0);
            drawTileRotated(context, x + 20, y + 20, new TileSource(game.waterCanvas, 0, 0, 10), 0);
            break;
        case 'C':
            drawTileRotated(context, x, y, new TileSource(game.images.background, 0, 2));
            break;
        case 'N':
            drawTileRotated(context, x, y, new TileSource(game.images.background, 1, 3));
            break;
        case 'M':
            drawTileRotated(context, x, y, new TileSource(game.images.background, 0, 3));
            break;
        case 'F':
            drawTileRotated(context, x, y, new TileSource(game.images.background, 2, 3));
            break;
        case 'T':
            drawTileRotated(context, x, y, new TileSource(game.images.towers, 0, 0));
            break;
        default:
            //temporary code for drawing letters for graphics we don't have
            context.fillStyle = "black";
            context.font = "29pt Arial";
            context.fillText(tile.brush ? tile.brush : tile, x * 30, y * 30 + 29, 30);
    }
}
