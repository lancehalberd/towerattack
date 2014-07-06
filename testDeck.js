function spawnAbility(cost, type, amount) {
    return copy(new Ability(cost, spawnAnimals, {animal: type, amount: amount}));
}
function powerUpAbility(cost, scope, tag, name, value) {
    return copy(new Ability(cost, powerUp, {scope: scope, tag: tag, effects: [{name: name, value: value}]}));
}
function calorieAbility(calories) {
    return copy(new Ability(0, gainCalories, {calories: calories}));
}
var cardinalCard = copy(new Card([spawnAbility(1, 'cardinal', 3), powerUpAbility(2, 'level', 'bird', 'speedPlus', 1), powerUpAbility(3, 'level', 'bird', 'healthPlus', 2)]));
var penguinCard = copy(new Card([spawnAbility(1, 'penguin', 1), powerUpAbility(1, 'level', 'animal', 'carryPlus', 1)]));
var snakeCard = copy(new Card([spawnAbility(1, 'snake', 2), spawnAbility(3, 'snake', 4), powerUpAbility(3, 'level', 'animal', 'damagePlus', 1)]));
var zebraCard = copy(new Card([spawnAbility(3, 'zebra', 1), spawnAbility(7, 'zebra', 3)]));
var caloryCard = copy(new Card([calorieAbility(3)]));

var testDeck = [
    copy(cardinalCard),
    copy(penguinCard),
    copy(zebraCard),
    copy(snakeCard),
    copy(caloryCard),
    copy(cardinalCard),
    copy(penguinCard),
    copy(zebraCard),
    copy(snakeCard),
    copy(caloryCard),
    copy(cardinalCard),
    copy(penguinCard),
    copy(zebraCard),
    copy(snakeCard),
    copy(caloryCard)
];