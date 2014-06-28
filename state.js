/**
 * Stores the current state of the game
 */
function State () {
    this.step = "cards";
    this.gold = 0;
    this.calories = 0;
    this.currentWave = [];
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

/**
 * Makes a deep copy of an object. Note that this will not make deep copies of
 * objects with prototypes.
 */
function copy(object) {
    return jQuery.extend(true, {}, object);
}