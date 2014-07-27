/**
 * Code that is only used by the map editor
 */
function addEditEventHandlers() {
    $('.js-edit').on('click', toggleEditing);
    $('.js-clearLevel').on('click', function () {
        state.currentLevel = getEmptyLevel();
        startLevel(state.currentLevel);
    });
    $('.js-exportMap').on('click', function (event) {
        copyStateToCurrentLevel();
        var string = '{'
        for (var i in state.currentLevel) {
            if (state.currentLevel.hasOwnProperty(i)) {
                if (i == 'grid') {
                    string += '"' + i + '": ' + JSON.stringify(state.currentLevel[i], undefined, 2) + ",\n";
                } else if (['$mapMarker', 'rewards'].indexOf(i) >= 0) {
                    /*var rewards = state.currentLevel.rewards.map(function (element) {
                        if (element.classType == 'CardType') {
                            return 'cards[' + element.key +']';
                        }
                        return 'abilities[' + element.key +']';
                    });*/
                } else {
                    string += '"' + i + '": ' + JSON.stringify(state.currentLevel[i]) + ",\n";
                }
            }
        }
        string = string.substring(0, string.length - 2) + "\n}";
        $('.output').val(string);
    });
    $('.js-paletteCanvas').on('click', function (event) {
        var x = event.pageX - $('.js-paletteCanvas').offset().left;
        var y = event.pageY - $('.js-paletteCanvas').offset().top;
        var tileX = Math.floor(x / 30);
        var tileY = Math.floor(y / 30);
        setBrush(game.paletteGrid[tileY][tileX]);
    });
}
function encodeGrid(grid) {
    var exportRows = [];
    $.each(grid, function (i, row) {
        var exportRow = '';
        $.each(row, function (j, tile) {
            if (tile.brush) {
                exportRow += tile.brush;
            } else {
                exportRow += tile;
            }
        });
        exportRows.push(exportRow);
    });
    return exportRows;
}

/**
 * @return {Object}
 */
function encodeStructure(structure) {
    return {'classType': structure.classType, 'tileX': structure.tileX, 'tileY': structure.tileY};
}

/**
 * @param {City} city
 * @return {Object}
 */
function encodeCity(city) {
    var data = encodeStructure(city);
    data.population = city.population;
    data.productivity = city.productivity;
    return data;
}

/**
 * @param {Nest} nest
 * @return {Object}
 */
function encodeNest(nest) {
    return encodeStructure(nest);
}

/**
 * @param {Farm} farm
 * @return {Object}
 */
function encodeFarm(farm) {
    var data = encodeStructure(farm);
    data.calories = farm.calories
    return data;
}

/**
 * @param {Mine} mine
 * @return {Object}
 */
function encodeMine(mine) {
    var data = encodeStructure(mine);
    data.gold = mine.gold;
    return data;
}

/**
 * @param {Tower} tower
 * @return {Object}
 */
function encodeTower(tower) {
    var data = encodeStructure(tower);
    data.typeKey = tower.type.key;
    return data;
}

/**
 * Applies a function to an array.
 *
 * @param {Array} array
 * @param {Function} encoder
 * @return {Array}
 */
function encodeArray(array, encoder) {
    var result = [];
    for (var i = 0; i < array.length; i++) {
        result.push(encoder(array[i]));
    }
    return result;
}

function copyStateToCurrentLevel() {
    state.currentLevel.grid = encodeGrid(state.mapGrid);
    state.currentLevel.towers = state.towers.map(encodeTower);
    state.currentLevel.nests = encodeArray(state.nests, encodeNest);
    state.currentLevel.farms = encodeArray(state.farms, encodeFarm);
    state.currentLevel.mines = encodeArray(state.mines, encodeMine);
    state.currentLevel.cities = encodeArray(state.cities, encodeCity);
    state.currentLevel.paths = [];
    for (var i = 0; i < state.paths.length; i++) {
        /** @type Path */
        var path = state.paths[i];
        state.currentLevel.paths.push(path.points);
    }
}

function toggleEditing() {
    copyStateToCurrentLevel();
    startLevel(state.currentLevel);
    state.editingMap = !state.editingMap;
    $('.js-edit').text(state.editingMap ? 'Stop Editing' : 'Start Editing');
    $('.js-mapEditor').toggle(state.editingMap);
    $('.js-cardContainer').toggle(!state.editingMap);
}

/**
 * Removes the given element from any of the structure arrays.
 */
function removeElement(element) {
    $.each([state.towers, state.cities, state.farms, state.mines, state.nests], function (index, collection) {
        var found = collection.indexOf(element);
        if (found >= 0) {
            collection.splice(found, 1);
            return false;
        }
        return true;
    });
}

function setBrush(value) {
    state.brush = value;
    game.brushContext.setTransform(2, 0, 0, 2, 0, 0);
    game.brushContext.clearRect(0, 0, 30, 30);
    drawBrush(game.brushContext, 0, 0, state.brush, true);
}

function setTile(grid, x, y, brush) {
    removeElement(grid[y][x]);
    if (brush == 'W' && (grid[y][x] == 'R' || grid[y][x] == 'B')) {
        grid[y][x] = 'B'
    } else if (brush == 'R' && (grid[y][x] == 'W' || grid[y][x] == 'B')) {
        grid[y][x] = 'B'
    } else if (brush.classType == 'City') {
        grid[y][x] = new City();
        state.cities.push(grid[y][x]);
    } else if (brush.classType == 'Mine') {
        grid[y][x] = new Mine();
        state.mines.push(grid[y][x]);
    } else if (brush.classType == 'Farm') {
        grid[y][x] = new Farm();
        state.farms.push(grid[y][x]);
    } else if (brush.classType == 'Nest') {
        grid[y][x] = new Nest();
        state.nests.push(grid[y][x]);
    } else if (brush.classType == 'Tower') {
        /** @type Tower */
        var tower = brush;
        grid[y][x] = getTower(tower.type);
        state.towers.push(grid[y][x]);
    } else {
        grid[y][x] = brush;
    }
    grid[y][x].tileX = x;
    grid[y][x].tileY = y;
    grid[y][x].mapX = x * defaultTileSize;
    grid[y][x].mapY = y * defaultTileSize;
    drawGrid(game.backgroundContext, grid);
    //structure graphics will get updated by the main game loop
}