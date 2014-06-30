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