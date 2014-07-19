function spawnAbility(name, cost, type, amount) {
    return copy(new Ability(name, cost, spawnAnimals, {animal: type, amount: amount}));
}
function powerUpAbility(name, cost, scope, tag, effectName, value) {
    return copy(new Ability(name, cost, powerUp, {scope: scope, tag: tag, effects: [{name: effectName, value: value}]}));
}
function calorieAbility(name, calories) {
    return copy(new Ability(name, 0, gainCalories, {calories: calories}));
}
var cardinalCard = copy(new Card([spawnAbility('Cardinal Flock', 1, 'cardinal', 3), powerUpAbility('Quick Wings', 2, 'level', 'bird', 'speedPlus', 1), powerUpAbility('Bird Seed', 3, 'level', 'bird', 'healthPlus', 5)]));
var penguinCard = copy(new Card([spawnAbility('Penguin', 1, 'penguin', 1), powerUpAbility('Spare Luggage', 1, 'level', 'animal', 'carryPlus', 1)]));
var snakeCard = copy(new Card([spawnAbility('Twin Snakes', 1, 'snake', 2), spawnAbility('Snake Army', 3, 'snake', 4), powerUpAbility('Fangs', 3, 'level', 'animal', 'damagePlus', 1)]));
var zebraCard = copy(new Card([spawnAbility('Zebra', 3, 'zebra', 1), spawnAbility('Zebra Pack', 7, 'zebra', 3)]));
var caloryCard = copy(new Card([calorieAbility('Good Harvest', 3)]));

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