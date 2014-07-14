/**
 * Class for storing global game information, such as the various dom elements
 * and drawing contexts.
 */
function Game() {
    /** @type context */
    this.backgroundContext = null;
    /** @type context */
    this.pathContext = null;
    /** @type context */
    this.animalContext = null;
    /** @type context */
    this.timelineContext = null;
    /** @type context */
    this.paletteContext = null;
    /** @type context */
    this.brushContext = null;
    this.paletteGrid = [];
    //* @type canvas  Stores the masked road image */
    this.roadCanvas = null;
    //* @type canvas  Stores the masked water image */
    this.waterCanvas = null;
    this.images = {};
}

function Level(name, gridData, structures) {
    this.name = name;
    this.grid = gridData;
    this.structures = structures;
}

var game = new Game();

function initializeGame() {
    game.backgroundContext = $('.js-backgroundCanvas')[0].getContext('2d');
    game.pathContext = $('.js-pathCanvas')[0].getContext('2d');
    game.animalContext = $('.js-animalCanvas')[0].getContext('2d');
    game.timelineContext = $('.js-timelineCanvas')[0].getContext('2d');
    game.paletteContext = $('.js-paletteCanvas')[0].getContext('2d');
    game.brushContext = $('.js-brushCanvas')[0].getContext('2d');
    game.paletteGrid = [['0', 'R', 'W', 'N'],
                        ['C', 'M', 'F', 'T'],
                        ['1', '2', '3', '0']];
    game.mapSources = {
        'R' : new TileSource(game.paletteCanvas)
    }
    game.images = {
        'animals' : 'graphics/creatureSprites.png',
        'water' : 'graphics/water.png',
        'roadMask' : 'graphics/roadSpriteSheet.png',
        'background' : 'graphics/meadowsBackgroundSprites.png',
        'towers' : 'graphics/turretSprites.png'
    };
    loadImages();
}
function loadImages() {
    var loading = 0;
    $.each(game.images, function (id, source) {
        loading++;
        game.images[id] = new Image();
        game.images[id].src = source;
        game.images[id].onload = function () {
            loading--;
            if (loading == 0) {
                processImages();
            }
        }
    });
}
/**
 * @param {Number} width
 * @param {Number} height
 * @return {Element}
 */
function createCanvas(width, height) {
    return $('<canvas width="' + width + '" height="' + height + '"></canvas>')[0];
}
function processImages() {
    var roadPattern = new TileSource(game.images.background, 3, 3);
    game.roadCanvas = createMaskedPattern(game.images.roadMask, roadPattern, 4, 4);
    var waterPattern = new TileSource(game.images.water, 2, 3, 10);
    game.waterCanvas = createMaskedPattern(game.images.water, waterPattern, 4, 4);
    drawPalette();
}
/**
 * @param {Image} maskImage
 * @param {TileSource} patternSource
 */
function createMaskedPattern(maskImage, patternSource, rows, columns) {
    var tileSize = patternSource.tileSize;
    var canvas = createCanvas(columns * tileSize, rows * tileSize);
    var context = canvas.getContext('2d');
    var patternCanvas = createCanvas(columns * tileSize, rows * tileSize);
    var patternContext = patternCanvas.getContext('2d');
    for (var y = 0; y < rows; y++){
        for (var x = 0; x < columns; x++){
            drawImageTile(patternContext, x, y, patternSource);
        }
    }
    context.drawImage(maskImage, 0, 0);
    context.globalCompositeOperation = 'source-in';
    context.drawImage(patternCanvas, 0, 0);
    return canvas;
}
function drawPalette() {
    $.each(game.paletteGrid, function (y, row) {
        $.each(row, function (x, brush) {
            drawBrush(game.paletteContext, x * defaultTileSize, y * defaultTileSize, brush);
        });
    })
    startGame();
    $('.js-paletteCanvas').on('click', function (event) {
        var x = event.pageX - $('.js-paletteCanvas').offset().left;
        var y = event.pageY - $('.js-paletteCanvas').offset().top;
        var tileX = Math.floor(x / 30);
        var tileY = Math.floor(y / 30);
        setBrush(game.paletteGrid[tileY][tileX]);
    });
    setBrush(state.brush);
}
function setBrush(value) {
    state.brush = value;
    game.brushContext.setTransform(2, 0, 0, 2, 0, 0);
    game.brushContext.clearRect(0, 0, 30, 30);
    drawBrush(game.brushContext, 0, 0, state.brush);

}