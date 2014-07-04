var state = new State();

//this triggers when page has finished loading
$(function () {
    initializeGame();
    state.mapGrid =  arrayToGrid(level1.grid);
    for (var i = 0; i < level1.paths.length; i++) {
        state.paths[i].points = level1.paths[i];
        state.paths[i].complete = true;
    }
    state.deck = testDeck;
    initializeCardArea(state);
    $('.js-edit').on('click', toggleEditing);
    addTimelineInteractions(state);
});

function startGame() {
    drawGrid(game.backgroundContext, state.mapGrid);
    drawPaths(state, game.pathContext);
    animateCreature(game.animalContext);
    setInterval(mainLoop, 30);
    var drawingPath = false;
    var drawingTiles = false;
    $('.js-mapContainer').on('mousedown', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var x = event.pageX - $('.js-mapContainer').offset().left;
        var y = event.pageY - $('.js-mapContainer').offset().top - 2;
        var tileX = Math.floor(x / 30);
        var tileY = Math.floor(y / 30);
        if (state.editingMap) {
            drawTile(state.mapGrid, tileX, tileY, state.brush);
            drawingTiles = true;
        } else {
            drawingPath = true;
            //clicking on a nest restarts the path
            if (getGridValue(state.mapGrid, tileX, tileY) == 'N') {
                state.paths[state.selectedPath].points = [[tileX, tileY]];
                state.paths[state.selectedPath].complete = false;
            } else {
                editPath(state, tileX, tileY);
            }
        }
    });
    $(document).on('mousemove', function (event) {
        var x = event.pageX - $('.js-mapContainer').offset().left;
        var y = event.pageY - $('.js-mapContainer').offset().top - 2;
        var tileX = Math.floor(x / 30);
        var tileY = Math.floor(y / 30);
        if (drawingTiles && inGrid(state.mapGrid, tileX, tileY)) {
            drawTile(state.mapGrid, tileX, tileY, state.brush);
        }
        if (!drawingPath) {
            return;
        }
        if (tileX < 0 || tileY < 0 || tileX >= 15 || tileY >= 15) {
            return;
        }
        if (!state.editingMap) {
            editPath(state, tileX, tileY);
        }
    });
    $(document).on('mouseup', function (event) {
        drawingPath = false;
        drawingTiles= false;
    });
    $('.exportMap').on('click', function (event) {
        var exportRows = [];
        $.each(state.mapGrid, function (i, row) {
            exportRows.push('"' + row.join('') + '"');
        });
        var result = "[\n" + exportRows.join(",\n") + "];\n";
        $.each(state.paths, function (i, path) {
            result += JSON.stringify(path.points) + ";\n";
        });
        $('.output').val(result);
    });
}
function drawTile(grid, x, y, brush) {
    if (brush == 'W' && (grid[y][x] == 'R' || grid[y][x] == 'B')) {
        grid[y][x] = 'B'
    } else if (brush == 'R' && (grid[y][x] == 'W' || grid[y][x] == 'B')) {
        grid[y][x] = 'B'
    } else {
        grid[y][x] = brush;
    }
    drawGrid(game.backgroundContext, grid);
}

function toggleEditing() {
    state.editingMap = !state.editingMap;
    $('.js-edit').text(state.editingMap ? 'Stop Editing' : 'Start Editing');
    $('.js-mapEditor').toggle(state.editingMap);
    $('.js-cardContainer').toggle(!state.editingMap);
}

function mainLoop(args) {
    drawTimeline(state);
    drawPaths(state, game.pathContext);
}