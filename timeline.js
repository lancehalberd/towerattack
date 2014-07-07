

/**
 * @param {State} state  Current state
 */
function getNextTimelineSlot(state, firstIndex, firstSlot) {
    var pathIndex = firstIndex;
    var pathSlot = firstSlot;
    while (true) {
        if (!state.paths[pathIndex].slots[pathSlot]) {
            return [pathIndex, pathSlot];
        }
        pathSlot++;
        if (pathSlot >= state.paths[pathIndex].slots.length) {
            pathSlot = 0;
            pathIndex = (pathIndex + 1) % state.paths.length;
        }
        if (pathIndex == firstIndex && pathSlot == firstSlot) {
            console.log("failed to find an empty timeline slot");
            return [0, 0];
        }
    }
}

/**
 * Draws the current state to the timeline canvas
 *
 * @param {State} state  Current state
 */
function drawTimeline(state) {
    var tileSize = 30;
    var context = game.timelineContext;
    context.clearRect(0, 0, 750, 90);
    context.fillStyle = "#ccc";
    context.fillRect(0, state.selectedPath * tileSize, 750, 30);
    context.fillStyle = "black";
    context.fillRect(749, 0, 1, 90);
    $.each(state.paths, function (index, path){
        var y = tileSize * index;
        context.fillStyle = "black";
        context.fillRect(0, y, 750, 1);
        context.fillRect(0, y + tileSize - 1, 750, 1);
        $.each(path.slots, function (slotIndex, animal){
            var x = tileSize * slotIndex;
            if (animal) {
                if (animal == state.selectedElement) {
                    context.fillStyle = "#aaa";
                    context.fillRect(x, y + 1, tileSize - 1, tileSize - 2);
                } else if (animal.moved) {
                    context.fillStyle = "#faa";
                    context.fillRect(x, y + 1, tileSize - 1, tileSize - 2);
                }
                var image = animal.type.image;
                drawAnimalSprite(context, x, y, animal, state.gameTime, 0);
                drawAnimalHealth(context, animal, x, y);
            }
            if (slotIndex < path.slots.length - 1) {
                context.fillStyle = "#eee";
                context.fillRect(x + tileSize - 1, y + 1, 1, tileSize - 2);
            }
        });
    });
    if (state.step == 'wave') {
        var playHeadX = Math.min(749, Math.floor(tileSize * state.waveTime / 200));
        context.fillStyle = "#F44";
        context.fillRect(playHeadX - 1, 0, 2, 120);
    }
}

/**
 * Adds event handlers for interacting with the timeline
 *
 * @param {State} state  Current state
 */
function addTimelineInteractions(state) {
    var tileSize = 30;
    var currentPath = 0;
    var currentSlot = 0;
    //clicking the timeline allows you to select a path
    $('.js-timeline').on('mousedown', function (event) {
        var y = event.pageY - $(this).offset().top;
        var x = event.pageX - $(this).offset().left;
        currentPath = Math.floor(y / tileSize);

        state.selectedPath = currentPath;
        currentSlot = Math.floor(x / tileSize) - 1;
        state.selectedElement = state.draggingAnimal = state.paths[currentPath].slots[currentSlot];
        state.lastAnimalMoved = null;
    });
    //clicking on an animal and dragging allows you to move it on the timeline
    $(document).on('mousemove', function (event) {
        if (!state.draggingAnimal) {
            return;
        }
        var y = event.pageY - $('.js-timeline').offset().top;
        var x = event.pageX - $('.js-timeline').offset().left - 30;
        var timelineX = Math.min(720, Math.max(0, x - tileSize / 2));
        var timelineY = Math.min(60, Math.max(0, y - tileSize / 2));
        var slot = Math.round(timelineX / tileSize);
        var path = Math.round(timelineY / tileSize);
        var arr = [];
        if (currentPath != path || currentSlot != slot) {
            //combine all paths into a single array, since animals that overflow
            //off of one path get moved onto the next path
            var allSlots = state.paths[0].slots.concat(state.paths[1].slots, state.paths[2].slots);
            //set current slot to the slot in the combined path array
            currentSlot = currentPath * 25 + currentSlot;
            var newSlot = path * 25 + slot;
            if (state.lastAnimalMoved) {
                while (allSlots[currentSlot] != state.lastAnimalMoved) {
                    var nextSlot = (currentSlot + 1) % 75;
                    allSlots[currentSlot] = allSlots[nextSlot];
                    allSlots[currentSlot].moved = false;
                    currentSlot = nextSlot;
                }
                //set the slot of the last animal moved to be null, now that
                //it is back in it's original location
                allSlots[currentSlot] = null;
            } else {
                allSlots[currentSlot] = null;
            }
            if (allSlots[newSlot]) {
                var currentAnimal = state.draggingAnimal;
                var nextSlot = newSlot;
                while (currentAnimal) {
                    state.lastAnimalMoved = currentAnimal;
                    state.lastAnimalMoved.moved = true;
                    var nextAnimal = allSlots[nextSlot];
                    allSlots[nextSlot] = currentAnimal;
                    currentAnimal = nextAnimal;
                    nextSlot = (nextSlot + 1) % 75;
                }
            } else {
                allSlots[newSlot] = state.draggingAnimal;
                state.lastAnimalMoved = null;
            }
            //split the combined slots back into slots for each path
            state.paths[0].slots = allSlots.splice(0, 25);
            state.paths[1].slots = allSlots.splice(0, 25);
            state.paths[2].slots = allSlots.splice(0, 25);
            currentSlot = slot;
            currentPath = path;
            state.selectedPath = currentPath;
        }
    });
    //releasing the dragged animal finalizes its position
    $(document).on('mouseup', function (event) {
        if (!state.draggingAnimal) {
            return;
        }
        state.draggingAnimal = null;
        //clear all the moved flags from the animals
        $.each(state.paths, function (pathIndex, path) {
            $.each(path.slots, function (pathSlot, slot) {
                if (slot) {
                    slot.moved = false;
                }
            });
        });
    });
}