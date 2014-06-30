
/**
 * An animal that is part of an attack wave.
 */
function Animal() {
    /** @type AnimalType */
    this.type = null;
    this.maxHealth = 10;
    this.health = 10;
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

/**
 * Updates the stats of an animal based on the current state, applying growth
 * modifiers and ability modifiers to determine the actual stats.
 *
 * @param {Animal}
 */
function updateAnimal(animal) {
    //This code should be like:
    //floor(health + healthGrowth * wave + levelHealthPlus + waveHealthPlus) * levelHealthMultiplier * waveHealthMultiplier)
}