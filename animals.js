
/**
 * An animal that is part of an attack wave.
 */
function Animal() {
    /** @type AnimalType */
    this.type = null;
    this.health = 10;
    this.currentHealth = 10;
    this.speed = 10;
    this.armor = 0;
    this.carry = 1;
    this.damage = 1;
    this.pathIndex = 0;
    this.pathSlot = 0;
    //Distance from start of path to current position. How far the animal has traveled.
    this.distance = 0;
    //actual coordinates on the map in pixels
    this.mapX = 0;
    this.mapY = 0;
    //actualy coordinates on the timeline in pixels
    this.timelineX = 0;
    this.timelineY = 0;
}

/**
 * Definition of an animal type
 */
function AnimalType() {
    this.health = 10;
    this.healthGrowth = 0;
    this.speed = 10;
    this.speedGrowth = 0;
    this.armor = 0;
    this.armorGrowth = 0;
    this.carry = 1;
    this.carryGrowth = 0;
    this.damage = 1;
    this.damageGrowth = 0;
    //these tags are used for matching modifier abilities like
    //"increase the armor of all 'birds'"
    this.tags = ['animal'];
}

var animalTypes = {
    'cardinal': new AnimalType(),
    'penguin': new AnimalType(),
    'zebra': new AnimalType()
}

/**
 * Creates an animal for the given type string.
 *
 * @param {State} state  state of the game
 * @param {String} typeString  id of the type to use
 * @return {Animal}  The instantiated animatl
 */
function createAnimal(state, typeString) {
    var animal = new Animal();
    animal.type = animalTypes[typeString];
    updateAnimal(state, animal);
    animal.currentHealth = animal.health;
    return animal;
}

/**
 * Updates the stats of an animal based on the current state, applying growth
 * modifiers and ability modifiers to determine the actual stats.
 *
 * @param {State} state  state of the game
 * @param {Animal} animal  the animal to update
 */
function updateAnimal(state, animal) {
    //This code should be like:
    var modifiers = [];
    $.each(animal.type.tags, function (index, tag) {
        if (state.levelModifiers[tag]) {
            modifiers = modifiers.concat(state.levelModifiers[tag]);
        }
        if (state.waveModifiers[tag]) {
            modifiers = modifiers.concat(state.waveModifiers[tag]);
        }
    });
    $.each(['health', 'speed', 'armor', 'carry', 'damage'], function (index, stat) {
        var plusModifier = 0;
        var multiplier = 1;
        $.each(modifiers, function (index, modifier) {
            if (modifier[stat + 'Plus']) {
                plusModifier += modifier[stat + 'Plus'];
            }
            if (modifier[stat + 'Times']) {
                multiplier *= modifier[stat + 'Times'];
            }
        });
        animal[stat] = Math.floor((animal.type[stat] + animal.type[stat + 'Growth'] * state.waveNumber + plusModifier) * multiplier);
    });
}