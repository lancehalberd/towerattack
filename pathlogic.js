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

function drawTestObject(context, x, y, color){
    context.fillStyle = color;
    context.fillRect(x,y,0.9*tileSize,0.9*tileSize);
}

function drawCreatureSprite(context, x, y, srcY, rotation){ //temporarily just the penguin. srcY determines what row (0 is penguin)
    var date = new Date();
    var milliseconds = date.getTime();
    var frameDuration = 200;
    var numberOfFrames = 6;
    srcX = (Math.floor(milliseconds/frameDuration)%numberOfFrames)*tileSize;
    //context.drawImage(creatureSprite, srcX, srcY, tileSize, tileSize, x, y, tileSize, tileSize);
    context.translate(x+15, y+15);
    context.rotate(rotation);
    context.drawImage(creatureSprite, srcX, srcY, tileSize, tileSize, -15, -15, tileSize, tileSize);
    context.rotate(-rotation);
    context.translate(-x-15, -y-15);
}

function drawTravelPath(context, coordinates){
    //coordinates are an array of arrays with [x,y] position in them.
    //looks like: [[0,2][3,6][45,157][310,10]]
    var array = [];
    context.beginPath();
    context.lineWidth="4";
    context.strokeStyle="yellow"; // Yellow path
    context.moveTo(coordinates[0][0]*tileSize+(tileSize/2),coordinates[0][1]*tileSize+(tileSize/2));
    for (var i = 1; i < coordinates.length; i++){
        var x = coordinates[i][0]*tileSize+(tileSize/2); //the first value in my inner array
        var y = coordinates[i][1]*tileSize+(tileSize/2); //the second value in my inner array
        array.push(coordinates[i]);
        context.lineTo(x,y);
    }
    context.stroke(); // Draw it
}

var animationTiming = 30;

function clearRectForAnimation(context) {
    context.clearRect(0, 0, 510, 510);
    //console.log('clearRectForAnimation is running');
}

var animationCanvas = $('<canvas class="animationCanvas" width=510 height=510 style="position: absolute; top: 0; left: 0;"></canvas>')[0];

function animateCreature(grid, coordinates){
    var animationContext = animationCanvas.getContext("2d");
    var direction = 1;
    var i = 0;
    var array = [];
    coordinates = testCoordinates;
    var subIndex = 0;

    setInterval(function(){
        clearRectForAnimation(animationContext);
        var maxSubIndex = 10;
        var nextIndex = i + direction;
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
        drawCreatureSprite(animationContext, x, y, 0, rotation);
        //drawImageTile(animationContext, x, y, creatureSprite, 0, 0);
        if (subIndex >= maxSubIndex){
            i = nextIndex;
            if (i == coordinates.length - 1 || i == 0) {
                direction = -direction;
            }
            subIndex = 0;
        }
        subIndex++;
    }, animationTiming);
}