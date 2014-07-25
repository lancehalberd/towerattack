
/**
 * An animal that is part of an attack wave.
 */
function Animal() {
    /** @type AnimalType */
    this.type = null;
    this.health = 10;
    this.currentHealth = 10;
    //used to update currentHealth proportionally when health changes
    this.healthPercent = 1;
    this.speed = 10;
    this.armor = 0;
    this.carry = 1;
    this.burden = 0;
    this.damage = 1;
    //last structure the animal damaged. Used to figure out if they have
    //attacked the structure they are passing through yet
    this.lastTile = null;
    //Distance from start of path to current position. How far the animal has traveled.
    this.distance = 0;
    this.angle = 0;
    this.finished = false;
    this.dead = false;
    //actual coordinates on the map in pixels
    this.mapX = 0;
    this.mapY = 0;
    //coordinates of the tile most recently reached
    this.tileX = 0;
    this.tileY = 0;
    this.spawnTime = 0;
    /** @type Path */
    this.path = null;
    //marks that the animal is being displaced in the timeline by the current
    //drag operation
    this.moved = false;
    this.classType = 'Animal';
}

/**
 * Definition of an animal type
 */
function AnimalType() {
    this.single = '';
    this.plural = '';
    this.health = 10;
    this.healthGrowth = 1;
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
    this.tags = [];
    this.spriteIndex = 0;
    this.numberOfFrames = 6;
}
/**
 * @param {Object} data
 */
function createAnimalType(data) {
    var type = new AnimalType();
    for (var i in data) {
        if (data.hasOwnProperty(i)) {
            type[i] = data[i];
        }
    }
    return type;
}

var animalTypes = {
    'cardinal': createAnimalType({'single': 'cardinal', 'plural': 'cardinals',
                                    'health': 10, 'healthGrowth': 1, 'speed': 20, 'speedGrowth': 1,
                                    'armor': 0, 'armorGrowth': 0, 'carry': 1, 'carryGrowth': 0,
                                    'damage': 1, 'damageGrowth': .1, tags: ['flying', 'bird'],
                                    'spriteIndex': 0, 'numberOfFrames': 5}),
    'snake': createAnimalType({'single': 'snake', 'plural': 'snakes',
                                    'health': 10, 'healthGrowth': 1, 'speed': 15, 'speedGrowth': 0,
                                    'armor': 0, 'armorGrowth': .2, 'carry': 1, 'carryGrowth': 0,
                                    'damage': 2, 'damageGrowth': .5, tags: ['reptile'], 'spriteIndex': 2}),
    'penguin': createAnimalType({'single': 'penguin', 'plural': 'penguins',
                                    'health': 20, 'healthGrowth': 2, 'speed': 10, 'speedGrowth': 0,
                                    'armor': 0, 'armorGrowth': .2, 'carry': 2, 'carryGrowth': 0,
                                    'damage': 1, 'damageGrowth': .1, tags: ['bird'], 'spriteIndex': 1}),
    'zebra': createAnimalType({'single': 'zebra', 'plural': 'zebras',
                                    'health': 30, 'healthGrowth': 3, 'speed': 20, 'speedGrowth': 0,
                                    'armor': 1, 'armorGrowth': .1, 'carry': 1, 'carryGrowth': 0,
                                    'damage': 2, 'damageGrowth': .1, tags: ['mammal'],
                                    'spriteIndex': 3, 'numberOfFrames': 4}),
}

/**
 * Creates an animal for the given type string.
 *
 * @param {String} typeString  id of the type to use
 * @return {Animal}  The instantiated animatl
 */
function createAnimal(typeString) {
    var animal = new Animal();
    animal.type = animalTypes[typeString];
    updateAnimal(state, animal);
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
    $.each(animal.type.tags.concat('animal'), function (index, tag) {
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
            if (modifier.name == stat + 'Plus') {
                plusModifier += modifier.value;
            }
            if (modifier.name == stat + 'Times') {
                multiplier *= modifier.value;
            }
        });
        animal[stat] = Math.floor((animal.type[stat] + animal.type[stat + 'Growth'] * state.waveNumber + plusModifier) * multiplier);
    });
    if (animal.currentHealth > 0) {
        animal.currentHealth = Math.max(1, Math.round(animal.health * animal.healthPercent));
    }
}

/**
 * Draw an animal sprite to a given context.
 *
 * @param {context} context  The context to draw to
 * @param {Number} x  The x coordinate to draw to
 * @param {Number} y  The y coordinate to draw to
 * @param {Animal} animal  The animal to draw
 * @param {Number} time  The time in milliseconds
 * @param {Number} rotation  The rotation to draw the sprite at
 */
function drawAnimalSprite(context, x, y, animal, time, rotation){ //temporarily just the penguin. srcY determines what row (0 is penguin)
    var frameDuration = 200;
    var numberOfFrames = animal.type.numberOfFrames;
    var sourceX = (Math.floor(time / frameDuration) % numberOfFrames);
    drawTileRotated(context, x, y, new TileSource(game.images.animals, sourceX, animal.type.spriteIndex, defaultTileSize), rotation);
}

/**
 *
 * @param {context} context  The context to draw to
 * @param {Animal} animal
 * @param {Number} x  The x coordinate to draw to
 * @param {Number} y  The y coordinate to draw to
 */
function drawAnimalHealth(context, animal, x, y) {
    var percent = animal.currentHealth / animal.health;
    context.fillStyle = "black";
    context.fillRect(x + 2, y + 2, 26, 2);
    if (percent > .6) {
        context.fillStyle = "#0C0";
    } else if (percent > .3) {
        context.fillStyle = "yellow";
    } else {
        context.fillStyle = "red";
    }
    context.fillRect(x + 2, y + 2, Math.ceil(percent * 26), 2);
}

/**
 * @param {Animal} animal
 */
function updateAnimalPosition(animal) {
    var tileSize = 30;
    var points = animal.path.points;
    var index = Math.floor(animal.distance / tileSize);
    //has already finished or not yet started
    if (index < 0) {
        return;
    }
    if (index >= points.length - 1) {
        animal.finished = true;
        return;
    }
    var percent = (animal.distance % tileSize) / tileSize;
    var x2 = points[index + 1][0];
    var y2 = points[index + 1][1];
    var x1 = points[index][0];
    var y1 = points[index][1];
    animal.tileX = x1;
    animal.tileY = y1;
    animal.mapX = (x1 + percent * (x2 - x1)) * tileSize;
    animal.mapY = (y1 + percent * (y2 - y1)) * tileSize;
    animal.angle = atan2(x1, y1, x2, y2);
}

/**
 * @param {State} state
 * @return {Array}
 */
function getAnimals(state) {
    var animals = [];
    for (var i = 0; i < state.paths.length; i++) {
        for (var j = 0; j < state.paths[i].slots.length; j++) {
            /** @type Animal */
            var animal = state.paths[i].slots[j];
            if (animal) {
                animal.path = state.paths[i];
                animal.spawnTime = j * 200;
                animals.push(animal);
            }
        }
    }
    return animals;
}

/**
 * @param {Animal} animal
 * @param {Number} damage
 */
function damageAnimal(animal, damage) {
    animal.currentHealth -= damage;
    if (animal.currentHealth <= 0) {
        animal.currentHealth = 0;
        animal.finished = true;
        animal.dead = true;
    }
    animal.healthPercent = animal.currentHealth / animal.health;
}