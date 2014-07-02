

/**
 * @param {State} state  Current state
 */
function getNextTimelineSlot(state) {
    var pathIndex = state.selectedPath;
    while (true) {
        for (var i = 0; i < state.paths[pathIndex].slots.length; i++) {
            if (!state.paths[pathIndex].slots[i]) {
                return [pathIndex, i];
            }
        }
        pathIndex = (pathIndex + 1) % state.paths.length;
        if (pathIndex == state.selectedPath) {
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
    var context = $('.js-timelineCanvas')[0].getContext("2d");
    context.clearRect(0, 0, 750, 90);
    context.fillStyle = "#ccc";
    context.fillRect(0, state.selectedPath * tileSize, 750, 30);
    context.fillStyle = "black";
    context.fillRect(749, 0, 1, 90);
    $.each(state.paths, function (index, path){
        var y = tileSize * index;
        context.fillRect(0, y, 750, 1);
        context.fillRect(0, y + tileSize - 1, 750, 1);
        $.each(path.slots, function (slotIndex, slot){
            var x = tileSize * slotIndex;
            if (slot) {
                var image = slot.type.image;
                drawCreatureSprite(context, x, y, 0, 0);
            }
        });
    });
}