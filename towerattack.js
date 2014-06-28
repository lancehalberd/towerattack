console.log('Javascript runs on this page!!!');

function getContext(id) {
    return document.getElementById(id).getContext("2d");
}

//create a grid of 0's and 1's
function createGrid(width, height) {
    var grid = [];
    for (var y = 0; y < height; y++) {
        var row = "";
        for (var x = 0; x < width; x++) {
            var randomNumber = Math.floor((Math.random() * 2));
            row = row + ['0', 'R'][randomNumber];
        }
        grid.push(row.split(''));
    }
    return grid;
}

var tileSize = 30;
function drawTile(context, x, y, color){
    context.fillStyle = color;
    context.fillRect(x*tileSize, y*tileSize, tileSize, tileSize);
}

function drawImageTile(context, x, y, src, srcX, srcY) {
    context.drawImage(src, srcX*tileSize, srcY*tileSize, tileSize, tileSize, x*tileSize, y*tileSize, tileSize, tileSize);
}

function drawAllRoads(context, grid) {
    for (var y = 0; y < grid.length; y++){
        for (var x = 0; x < grid[y].length; x++){
            if (grid[y][x] == 'R') {
                //reset to 0 every time we start checking
                var srcX = 0;
                var srcY = 0;

                //connection to the North?
                if (y-1 >= 0 && grid[y-1][x] == 'R') {
                    srcY = srcY+2;
                }
                //connection to the South?
                if (y+1 < grid.length && grid[y+1][x] == 'R') {
                    srcY = srcY+1;
                }
                //connection to the West?
                if (x-1 >= 0 && grid[y][x-1] == 'R') {
                    srcX = srcX+2;
                }
                //connection to the East?
                if (x+1 < grid[y].length && grid[y][x+1] == 'R') {
                    srcX = srcX+1;
                }
                drawImageTile(context, x, y, roadCanvas, srcX, srcY);
            }
        }
    }
}

function drawGrid(context, grid) {
    context.fillStyle="#aade87";
    context.fillRect(0, 0, 600, 600);
    drawAllRoads(context, grid);
    //drawWaterLikeRoads(context, grid);
}

var roadCanvas = $('<canvas width=120 height=120></canvas>')[0];
var roadPatternCanvas = $('<canvas width=120 height=120></canvas>')[0];
//var waterCanvas = $('<canvas width=120 height=120></canvas>')[0];
//var waterPatternCanvas = $('<canvas width=120 height=120></canvas>')[0];
var patternImage = new Image();
var creatureSprite = new Image();

//function loadWaterImages(onComplete) {
//    //use road logic temporarily
//    var waterContext = waterCanvas.getContext("2d");
//    var waterMaskImage = new Image();
//    waterMaskImage.src = 'graphics/roadSpriteSheet.png';
//    waterMaskImage.onload = function () {
//        waterContext.drawImage(waterMaskImage, 0, 0);
//        var waterPatternContext = waterPatternCanvas.getContext("2d");
//        for (var y = 0; y < 4; y++){
//            for (var x = 0; x < 4; x++){
//                drawImageTile(waterPatternContext, x, y, patternImage, 1, 3);
//            }
//        }
//        waterContext.globalCompositeOperation = 'source-in';
//        waterContext.drawImage(waterPatternCanvas, 0, 0);
//        $('body').append(waterCanvas);
//        onComplete();
//    };
//}
//
//function loadWaterImagesLikeRoads(onComplete) {
//    //use road logic temporarily
//    var waterContext = waterCanvas.getContext("2d");
//    var waterMaskImage = new Image();
//    waterMaskImage.src = 'graphics/roadSpriteSheet.png';
//    waterMaskImage.onload = function () {
//        waterContext.drawImage(waterMaskImage, 0, 0);
//        var waterPatternContext = waterPatternCanvas.getContext("2d");
//        for (var y = 0; y < 4; y++){
//            for (var x = 0; x < 4; x++){
//                drawImageTile(waterPatternContext, x, y, patternImage, 1, 3);
//            }
//        }
//        waterContext.globalCompositeOperation = 'source-in';
//        waterContext.drawImage(waterPatternCanvas, 0, 0);
//        $('body').append(waterCanvas);
//        onComplete();
//    }
//}

function loadImages(onComplete) {
    var roadContext = roadCanvas.getContext("2d");
    var roadMaskImage = new Image();
    roadMaskImage.src = 'graphics/roadSpriteSheet.png';
    roadMaskImage.onload = function () {
        roadContext.drawImage(roadMaskImage, 0, 0);
        patternImage.src = 'graphics/backgroundTextureSheet.png'
        patternImage.onload = function () {
            var roadPatternContext = roadPatternCanvas.getContext("2d");
            for (var y = 0; y < 4; y++){
                for (var x = 0; x < 4; x++){
                    drawImageTile(roadPatternContext, x, y, patternImage, 0, 3);
                }
            }
            roadContext.globalCompositeOperation = 'source-in';
            roadContext.drawImage(roadPatternCanvas, 0, 0);
            creatureSprite.src = 'graphics/creatureSpritesPenguin.png'; //just the penguin temporarily
            creatureSprite.onload = function () {
                //context = getContext('backgroundCanvas');
                //context.drawImage(creatureSprite, 0, 0);
                onComplete();

            }
            //loadWaterImagesLikeRoads(onComplete);
            //onComplete();
        }
    };
}
function getLevel1() {
    return [
        "0RRRR00RRR0RRR000000",
        "0R00RRRR0RRR0R000000",
        "0RRR000R0000RRR00000",
        "000R000RR0RRR0RRR000",
        "000RRR00R0R00000RR00",
        "00000R00RRRR00000R00",
        "000RRRRR0R0R00000R00",
        "RRRR000RRR0RRR000RR0",
        "R00R000R000R0R0000R0",
        "R00RRRRR0RRR0R0RRRR0",
        "RR0R000R0R00RR0R0000",
        "0RRRR00R0R00R00RR000",
        "0000RR0RRR0RRRR0R000",
        "00000RR0000R00RRRRRR",
        "000000R0000RRR00000R",
        "00000RR000000R00000R",
        "00000R000RRRRRR0000R",
        "00000RRR0R0000R0000R",
        "00000R0RRR0000R0000R",
        "00000RRR000000RRRRRR"];
}
function getLevel2() {
    return [
        "00RRRRRRRRRRRRRR0",
        "00R0000000000R0R0",
        "00RRRRRRRRR00RRR0",
        "00R0000000R00R000",
        "00R0000000R00RRR0",
        "RRR00000RRR00R0R0",
        "R0RRRRRRR000RRRRR",
        "R00R00R0RRRRR0R0R",
        "R00R00RRR00000R0R",
        "R00RRRR0000000R0R",
        "RRRR00R00000RRRRR",
        "00R000R00000R0R00",
        "00RRR0R00000R0R00",
        "0RR0RRR00RRRRRRRR",
        "0R00R000RR00R000R",
        "0R00R000R000R0R0R",
        "0R00RRRRR000RRRRR"];
}
function getLevelWaterTest() {
    return [
        "0R0000R0R0RRRRR0RRR0",
        "0RRRR000R00RR0RR000R",
        "000RRRRRR0R0000R0RR0",
        "0RRR00000RRRRR0000R0",
        "0RRR00RRRR0RRR0R00R0",
        "RRR000R0R0R0R0R0RRR0",
        "0RR000WW00RRR000RRRR",
        "00RR00WWR000RRRR00R0",
        "RR0RR0WWWRR0R0RRR0RR",
        "00R0RRWWWR000R0R0RRR",
        "0000RRWWWRR0R00R0R0R",
        "0R00R0RW0RR0RR00R0RR",
        "R0R0R0RWRR00RRR00RR0",
        "RRR000WWWWWWRR0RRR00",
        "R0R00RRR0RRR0RRR0R00",
        "RRRRR00RR00RR0R0R000",
        "00R000000RR0RR0RR0R0",
        "R0RR0R00R0000RR0RRRR",
        "RRR00RRRR0000RRRRR0R",
        "RR000R00R000RR0RR0R0"]
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
//context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);

//this triggers when page has finished loading
$(function () {
    var state = new State();
    state.deck = testDeck;
    initializeCardArea(state);
    //$('body').append(roadCanvas);
    //$('body').append(patternCanvas);
    $('.mapContainer').append(animationCanvas);
    loadImages(function(){
        context = getContext('backgroundCanvas');
        var grid = createGrid(17, 17);
        //grid = arrayToGrid(getLevel1());
        grid = arrayToGrid(getLevel2());
        //grid = arrayToGrid(getLevelWaterTest());
        drawGrid(context, grid);
        drawTravelPath(context, testCoordinates);
        //animateObject(context);
        animateCreature(context);
        drawImageTile(context, 0, 0, creatureSprite, 30, 0);
        $('.animationCanvas').on('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            var tileX = Math.floor(event.pageX / tileSize);
            var tileY = Math.floor((event.pageY - 2) / tileSize);
            var options = ['0', 'R'];
            var index = options.indexOf(grid[tileY][tileX]);
            grid[tileY][tileX] = options[(index + 1) % options.length];//0 1 2 0 1 2...
            console.log(grid[tileY][tileX]);
            drawGrid(context, grid);
        });
        $('.exportMap').on('click', function exportButton(event) {
            var exportRows = [];
            $.each(grid, function (i, row) {
                exportRows.push('"' + row.join('') + '"');
            });
            $('.output').val("[\n" + exportRows.join(",\n") + "]");
        });
    });
});