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
    $('.js-play').on('click', startWave);
    $('.js-fastForward').on('click', changeSpeed);

    addTimelineInteractions(state);
});

function startGame() {
    dealCard(state);
    drawGrid(game.backgroundContext, state.mapGrid);
    drawPaths(state, game.pathContext);
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
        } else if (state.step == 'cards') {
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

var lastTime = 0;
function mainLoop(args) {
    var now = new Date().getTime();
    drawTimeline(state);
    drawPaths(state, game.pathContext);
    if (lastTime) {
        state.gameTime += (now - lastTime) * state.waveSpeed;
    }
    game.animalContext.clearRect(0, 0, 510, 510);
    if (state.step == 'cards') {
        //animatePreviewCreature();
    }
    if (state.step == 'wave') {
        state.waveTime += (now - lastTime) * state.waveSpeed;
        var finished = true;
        for (var i = 0; i < state.paths.length; i++) {
            /** @type Path */
            var path = state.paths[i];
            for (var j = 0; j < path.slots.length; j++) {
                if (state.waveTime < j * 200) {
                    finished = false;
                    break;
                }
                /** @type Animal */
                var animal = path.slots[j]
                if (!animal) {
                    continue;
                }
                var timeOut = state.waveTime - 200 * j;
                var distance = Math.floor(animal.speed * timeOut / 100);
                var coords = drawCreatureOnPath(path.points, distance, state.waveTime);
                if (coords) {
                    finished = false;
                    animal.mapX = coords[0];
                    animal.mapY = coords[1];
                }
            }
        }
        if (finished) {
            endWave();
        }
    }
    lastTime = now;
}

function startWave() {
    for (var i = 0; i < state.paths.length; i++) {
        if (!state.paths[i].complete) {
            for (var j = 0; j < state.paths[i].slots.length; j++) {
                if (state.paths[i].slots[j]) {
                    state.selectedPath = i;
                    return;
                }
            }
            state.paths[i].points = [];
        }
    }
    state.step = "wave";
    state.waveTime = 0;
    //discard remainign dealt cards at start of wave
    while (state.dealtCards.length) {
        /** @type Card */
        var card = state.dealtCards.pop();
        if (card) {
            discardCard(state, card);
        }
    }
}

function endWave() {
    state.waveNumber++;
    state.step = 'cards';
    state.abilitiesUsedThisTurn = 0;
    dealCard(state);
}

function changeSpeed() {
    state.waveSpeed*=2;
    if (state.waveSpeed > 8) {
        state.waveSpeed = 1;
    }
    $('.js-fastForward').text('x ' + state.waveSpeed);
}