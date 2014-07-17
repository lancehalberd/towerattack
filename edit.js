/**
 * Code that is only used by the map editor
 */
function addEditEventHandlers() {
    $('.js-edit').on('click', toggleEditing);
    $('.exportMap').on('click', function (event) {
        var exportRows = [];
        $.each(state.mapGrid, function (i, row) {
            var exportRow = [];
            $.each(row, function (j, tile) {
                exportRow.push(tile.brush ? tile.brush : tile);
            });
            exportRows.push('"' + exportRow.join('') + '"');
        });
        var result = "[\n" + exportRows.join(",\n") + "];\n";
        $.each(state.paths, function (i, path) {
            result += JSON.stringify(path.points) + ";\n";
        });
        $('.output').val(result);
    });
}

function toggleEditing() {
    state.editingMap = !state.editingMap;
    $('.js-edit').text(state.editingMap ? 'Stop Editing' : 'Start Editing');
    $('.js-mapEditor').toggle(state.editingMap);
    $('.js-cardContainer').toggle(!state.editingMap);
}


function setTile(grid, x, y, brush) {
    if (brush == 'W' && (grid[y][x] == 'R' || grid[y][x] == 'B')) {
        grid[y][x] = 'B'
    } else if (brush == 'R' && (grid[y][x] == 'W' || grid[y][x] == 'B')) {
        grid[y][x] = 'B'
    } else if (brush == 'C') {
        grid[y][x] = new City();
    } else if (brush == 'M') {
        grid[y][x] = new Mine();
    } else if (brush == 'F') {
        grid[y][x] = new Farm();
    } else if (brush == 'N') {
        grid[y][x] = new Nest();
    } else if (brush == 'T') {
        grid[y][x] = getRandomTower();
    } else {
        grid[y][x] = brush;
    }
    grid[y][x].mapX = x * defaultTileSize;
    grid[y][x].mapY = y * defaultTileSize;
    drawGrid(game.backgroundContext, grid);
}