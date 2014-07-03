
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
}

/**
 * Draws the paths defined in the current state to the given context.
 *
 * @param {State} state  state of the game
 * @param {Number} x  The x tile coordinate
 * @param {Number} y  The y tile coordinate
 */
function getGridValue(state, x, y) {
    if (x < 0 || y < 0 || x >= state.mapGrid[0].length || y >= state.mapGrid.length) {
        return null;
    }
    return state.mapGrid[y][x];
}

/**
 * Edits the selected path, determining the shortest route (if any) between
 * the given coordinate, and the end of the current path.
 *
 * @param {State} state  state of the game
 * @param {Number} x  The x tile coordinate
 * @param {Number} y  The y tile coordinate
 */
function editPath(state, x, y) {
    //don't do anything if this square isn't a road
    if (getGridValue(state, x, y) != 'R') {
        return;
    }
    /** @type Path */
    var path = state.paths[state.selectedPath];
    if (path.points.length == 0) {
        editPathSimple(state, x, y);
        return;
    }
    var lastPoint = path.points[path.points.length - 1];
    var visited = {};
    visited[x + 'x' + y] = true;
    var points = [{x: x, y: y, next: null}];
    var finalPoint = null;
    function addIfValid(newX, newY) {
        if (getGridValue(state, newX, newY) != 'R') {
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
    if (state.mapGrid[y][x] != 'R') {
        return;
    }
    /** @type Path */
    var path = state.paths[state.selectedPath];
    if (path.points.length == 0) {
        path.points.push([x, y]);
        return;
    }
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
    context.clearRect(0, 0, 450, 450);
    //draw selected path first since it is thicker and can be seen underneath
    //the unselected paths
    var path = state.paths[state.selectedPath];
    context.lineWidth = 4;
    if (path.complete) {
        context.strokeStyle = '#FFF';
    } else {
        context.strokeStyle = '#F88';
    }
    drawTravelPath(context, path.points);
    context.lineWidth = 2;
    $.each(state.paths, function (index, path) {
        if (index == state.selectedPath) {
            return;
        }
        if (path.complete) {
            context.strokeStyle = '#DDD';
        } else {
            context.strokeStyle = '#800';
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

function animateCreature(grid, coordinates){
    var direction = 1;
    var i = 0;
    var array = [];
    coordinates = testCoordinates;
    var subIndex = 0;
    setInterval(function(){
        game.animalContext.clearRect(0, 0, 510, 510);
        var maxSubIndex = 10;
        if (coordinates.length < 2) {
            return;
        }
        //added a couple of lines to fix the animation if the path gets
        //deleted underneath the animal
        if (i >= coordinates.length) {
            i = coordinates.length - 1
        }
        var nextIndex = i + direction;
        if (nextIndex >= coordinates.length) {
            direction = -1;
            nextIndex = i + direction;
        }
        var futureX = coordinates[nextIndex][0]*tileSize; //the next x coordinate. does not loop.
        var futureY = coordinates[nextIndex][1]*tileSize; //the next y coordinate. does not loop.
        var currentX = coordinates[i][0]*tileSize; //the first value in my inner array
        var currentY = coordinates[i][1]*tileSize; //the second value in my inner array
        //formula for smooth movement between two points: currentX + (subIndex/maxSubIndex) * (futureX - currentX)
        //console.log('The current percent to move is ' + (subIndex/maxSubIndex));
        //console.log('The current amount to add to currentX is ' + (futureX-currentX));
        //console.log('future coordinates are ' + futureX + ', ' + futureY);
        //console.log('current coordinates are ' + currentX + ', ' + currentY)
        var x = currentX + (subIndex/10)*(futureX-currentX);
        var y = currentY + (subIndex/10)*(futureY-currentY);
        array.push(coordinates[i]);
        var rotation = 0;
        if (futureX == currentX) {
            //  condition ? trueValue : falseValue;
            // facing down ? rotateDown : rotateUp
            rotation = (futureY > currentY) ? Math.PI / 2 : -Math.PI / 2;
        } else {
            rotation = Math.atan( (futureY - currentY) / (futureX - currentX));
            if (futureX < currentX) {
                rotation = rotation + Math.PI;
            }
        }
        drawAnimalSprite(game.animalContext, x, y, 0, rotation);
        //drawImageTile(animationContext, x, y, creatureSprite, 0, 0);
        if (subIndex >= maxSubIndex){
            i = nextIndex;
            if (i == coordinates.length - 1 || i == 0) {
                direction = -direction;
            }
            subIndex = 0;
        }
        subIndex++;
    }, 30);
}

var testCoordinates = [
        [5, 0],
        [4, 0],
        [3, 0],
        [2, 0],
        [2, 1],
        [2, 2],
        [2, 3],
        [2, 4],
        [2, 5],
        [1, 5],
        [0, 5],
        [0, 6],
        [0, 7],
        [0, 8],
        [0, 9],
        [0, 10],
        [1, 10],
        [2, 10],
        [2, 11]
    ];