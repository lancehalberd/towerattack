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
    $('.js-edit').on('click', function (event){
        state.editingMap = !state.editingMap;
        $(this).text(state.editingMap ? 'Stop Editing' : 'Start Editing');
    });
    state.deck = testDeck;
    state.paths[0].points = testCoordinates;
    initializeCardArea(state);
    //$('body').append(roadCanvas);
    //$('body').append(patternCanvas);
    $('.mapContainer').append(animationCanvas);
    loadImages(function(){
        context = getContext('backgroundCanvas');
        var grid =  arrayToGrid(level1);//createGrid(15, 15);
        //grid = arrayToGrid(getLevel1());
        //grid = arrayToGrid(getLevel2());
        //grid = arrayToGrid(getLevelWaterTest());
        drawGrid(context, grid);
        drawTravelPath(context, state.paths[state.selectedPath].points);
        //animateObject(context);
        animateCreature(context);
        drawImageTile(context, 0, 0, creatureSprite, 30, 0);
        $('.js-mapContainer').on('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            var x = event.pageX - $(this).offset().left;
            var y = event.pageY - $(this).offset().top - 2;
            var tileX = Math.floor(x / tileSize);
            var tileY = Math.floor(y / tileSize);
            if (state.editingMap) {
                var options = ['0', 'R'];
                var index = options.indexOf(grid[tileY][tileX]);
                grid[tileY][tileX] = options[(index + 1) % options.length];//0 1 2 0 1 2...
                drawGrid(context, grid);
                drawTravelPath(context, state.paths[state.selectedPath].points);
            } else {

            }
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