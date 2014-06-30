/**
 * Stores the current state of the game
 */
function State () {
    this.step = "cards";
    //indicates whether the user is editing the map
    this.editingMap = false;
    this.brush = 'R';
    this.gold = 0;
    this.calories = 0;
    //index of the currently selected path
    this.selectedPath = 0;
    //array of paths
    this.paths = [
        new Path(),
        new Path(),
        new Path()
    ]
    this.levelModifiers = {
        //any
        'animal' : {'lifePlus' : 2}
    };
    this.waveModifiers = {

    };
    this.abilitiesUsedThisTurn = 0;
    //cards the user has dealt and can use this wave
    this.dealtCards = [];
    //cards that have been used/discarded and cannot be used until they shuffle
    this.discardedCards = [];
    //undealt cards in the users deck
    this.deck = [];
}

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
 * Makes a deep copy of an object. Note that this will not make deep copies of
 * objects with prototypes.
 */
function copy(object) {
    return jQuery.extend(true, {}, object);
}