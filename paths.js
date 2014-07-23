
function Path() {
    //timeline slots for this path. Each slot represents .2s interval
    this.slots = [];
    for (var i = 0; i < 25; i++) {
        this.slots.push(null);
    }
    //whether or not this path is finished and useable
    this.complete = false;
    //the list of coordinates that comprise a path
    this.points = [];
    //list of coordinates for the last complete path
    this.oldPoints = [];
}

/**
 * Edits the selected path, determining the shortest route (if any) between
 * the given coordinate, and the end of the current path.
 *
 * @param {Number} x  The x tile coordinate
 * @param {Number} y  The y tile coordinate
 */
function editPath(x, y) {
    //don't do anything if this square isn't a road
    if (!isRoad(state.mapGrid, x, y)) {
        return;
    }
    /** @type Path */
    var path = state.paths[state.selectedPath];
    if (path.points.length == 0) {
        return;
    }
    var lastPoint = path.points[path.points.length - 1];
    var visited = {};
    visited[x + 'x' + y] = true;
    var points = [{x: x, y: y, next: null}];
    var finalPoint = null;
    function addIfValid(newX, newY) {
        if (!isRoad(state.mapGrid, newX, newY)) {
            return;
        }
        if (visited[newX + 'x' + newY]) {
            return;
        }
        points.push({x: newX, y: newY, next: point});
        visited[newX + 'x' + newY] = true;
    }
    var safety = 0;
    while (points.length && safety++ < 200) {
        var point = points.shift();
        if (Math.abs(point.x - lastPoint[0]) + Math.abs(point.y - lastPoint[1]) <= 1) {
            finalPoint = point;
            break;
        }
        addIfValid(point.x - 1, point.y);
        addIfValid(point.x + 1, point.y);
        addIfValid(point.x, point.y - 1);
        addIfValid(point.x, point.y + 1);
    }
    //if a point was found that connects to the current path, fill in the
    //path between the clicked point and the connecting point
    while (finalPoint) {
        editPathSimple(state, finalPoint.x, finalPoint.y);
        finalPoint = finalPoint.next;
    }
    lastPoint = path.points[path.points.length - 1];
    if (path.points.length > 1 && state.mapGrid[lastPoint[1]][lastPoint[0]].classType == 'Nest') {
        path.complete = true;
    } else {
        path.complete = false;
    }
}

/**
 * Edits the selected path, only adjusting the path if the given tile coordinates
 * are adjacent to the head of the selected path.
 *
 * @param {State} state  state of the game
 * @param {Number} x  The x tile coordinate
 * @param {Number} y  The y tile coordinate
 */
function editPathSimple(state, x, y) {
    if (!isRoad(state.mapGrid, x, y)) {
        return;
    }
    /** @type Path */
    var path = state.paths[state.selectedPath];
    if (path.points.length > 1){
        var secondToLastPoint = path.points[path.points.length - 2];
        if (secondToLastPoint[0] == x && secondToLastPoint[1] == y) {
            path.points.pop();
            return;
        }
    }
    var lastPoint = path.points[path.points.length - 1];
    if (x == lastPoint[0] && Math.abs(y - lastPoint[1]) == 1 ||
        y == lastPoint[1] && Math.abs(x - lastPoint[0]) == 1) {
        path.points.push([x, y]);
    }
}

/**
 * Draws the paths defined in the current state to the given context.
 *
 * @param {State} state  state of the game
 * @param {context} context  The context to draw to
 */
function drawPaths(state, context) {
    context.clearRect(0, 0, 510, 510);
    //draw selected path first since it is thicker and can be seen underneath
    //the unselected paths
    var path = state.paths[state.selectedPath];
    context.lineWidth = 6;
    if (path.complete) {
        context.strokeStyle = state.editingPath ? '#6F6' : '#66F';
    } else {
        context.strokeStyle = '#F66';
    }
    drawTravelPath(context, path.points);
    context.lineWidth = 2;
    $.each(state.paths, function (index, path) {
        if (index == state.selectedPath) {
            return;
        }
        if (path.complete) {
            context.strokeStyle = '#AAF';
        } else {
            context.strokeStyle = '#FAA';
        }
        drawTravelPath(context, path.points);
    });
}

/**
 * Draws a path to the context.
 *
 * @param {context} context  The context to draw to
 * @param {Array} points  The array of points for the path to draw
 */
function drawTravelPath(context, points){
    var tileSize = defaultTileSize;
    if (points.length < 1) {
        return;
    }
    //points are an array of points represented like: [x, y],
    //where x and y represent tile coordinates.
    //looks like: [[0,2],[1,2],[1,3],[1,4]]
    context.beginPath();
    context.moveTo(points[0][0] * tileSize + (tileSize/2),
                   points[0][1] * tileSize + (tileSize/2));
    for (var i = 1; i < points.length; i++){
        var x = points[i][0] * tileSize + (tileSize/2); //the first value in my inner array
        var y = points[i][1] * tileSize + (tileSize/2); //the second value in my inner array
        context.lineTo(x,y);
    }
    context.stroke(); // Draw it
    var lastPoint = points[points.length - 1];
    context.fillStyle = context.strokeStyle;
    context.fillRect(lastPoint[0] * tileSize + (tileSize/2) - 6,
                     lastPoint[1] * tileSize + (tileSize/2) - 6, 12, 12);
    context.fillRect(points[0][0] * tileSize + (tileSize/2) - 6,
                     points[0][1] * tileSize + (tileSize/2) - 6, 12, 12);
}

function selectPath(index) {
    //fix the current path if it is broken
    fixPath(state.paths[state.selectedPath]);
    state.selectedPath = index;
    $('.js-editPath').css('top', (index * 30 + 5) + 'px');
    updateEditPathButton();
}

function updateEditPathButton() {
    var text = 'Edit';
    if (state.editingPath) {
        /** @type Path */
        var path = state.paths[state.selectedPath];
        text = path.complete ? 'Done' : 'Cancel';
    }
    $('.js-editPath').text(text);
}

function togglePathEditing() {
    if (state.step == 'cards' || state.step == 'build') {
        state.editingPath = !state.editingPath;
    } else {
        state.editingPath = false;
    }
    /** @type Path */
    var path = state.paths[state.selectedPath];
    fixPath(path);
    path.oldPoints = path.points.concat();
    updateEditPathButton();
    hideHelp('stopEditingToStartWave');
}

function handleEditPathClick(tileX, tileY) {
    drawingPath = true;
    if (state.mapGrid[tileY][tileX].classType == 'Nest') {
        state.paths[state.selectedPath].points = [[tileX, tileY]];
        state.paths[state.selectedPath].complete = false;
    } else {
        editPath(tileX, tileY);
    }
    updateEditPathButton();
}

/**
 * Reverts a path to its last completed state if it is not currently completed.
 *
 * @param {Path} path
 */
function fixPath(path) {
    if (!path.complete) {
        path.points = path.oldPoints.concat();
        path.complete = true;
    }
}

function handleEditPathDrag(tileX, tileY) {
    editPath(tileX, tileY);
    updateEditPathButton();
}