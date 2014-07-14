/**
 * Stores the current state of the game
 */
function State () {
    /** @type Level */
    this.currentLevel = null;
    this.step = "cards";
    //indicates whether the user is editing the map
    this.editingMap = false;
    this.mapGrid = [];
    this.brush = 'R';
    this.gold = 0;
    this.calories = 100;
    //index of the currently selected path
    this.selectedPath = 0;
    //array of paths
    this.paths = [
        new Path(),
        new Path(),
        new Path()
    ];
    //array of all animals, gets set when the wave step starts
    this.animals = [];
    //array of all farms
    this.farms = [];
    //array of all mines
    this.mines = [];
    //array of all towers, set at start of level and appended to as towers are created
    this.towers = [];
    //array of all cities, set at start of level
    this.cities = [];
    //array of projectiles
    this.projectiles = [];
    /** @type {Animal}  The animal currently being moved in the timeline */
    this.draggingAnimal = null;
    this.selectedElement = null;
    /** @type {Animal}  The last animal that was displaced by the current drag operation */
    this.lastAnimalMoved = null;
    this.levelModifiers = {
        //any
        'animal' : [new Modifier('healthPlus', 2)]
    };
    this.waveModifiers = {};
    this.waveNumber = 1;
    this.gameTime = 0;
    this.waveTime = 0;
    this.waveSpeed = 1;
    this.abilitiesUsedThisTurn = 0;
    //cards the user has dealt and can use this wave
    this.dealtCards = [];
    //cards that have been used/discarded and cannot be used until they shuffle
    this.discardedCards = [];
    //undealt cards in the users deck
    this.deck = [];
    this.humanGold = 0;
    this.humanCalories = 0;
    this.population = 0;
}


/**
 * Makes a deep copy of an object. Note that this will not make deep copies of
 * objects with prototypes.
 */
function copy(object) {
    return jQuery.extend(true, {}, object);
}