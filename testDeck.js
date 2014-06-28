function spawnAbility(cost, type, amount) {
    return copy(new Ability(cost, spawnAnimals, {animal: type, amount: amount}));
}
function powerUpAbility(cost, scope, name, value) {
    return copy(new Ability(cost, powerUp, {scope: scope, effects: [{name: name, value: value}]}));
}
function calorieAbility(amount) {
    return copy(new Ability(amount, nullOp, {}));
}
var cardinalCard = copy(new Card([spawnAbility(-1, 'cardinal', 3), powerUpAbility(1, 'level', 'speedPlus', 1), powerUpAbility(2, 'level', 'lifePlus', 2)]));
var penguinCard = copy(new Card([spawnAbility(-1, 'penguin', 1), powerUpAbility(1, 'level', 'carryPlus', 1)]));
var zebraCard = copy(new Card([spawnAbility(3, 'zebra', 1), spawnAbility(7, 'zebra', 3)]));
var caloryCard = copy(new Card([calorieAbility(-3)]));

var testDeck = [
    copy(cardinalCard),
    copy(penguinCard),
    copy(zebraCard),
    copy(caloryCard),
    copy(cardinalCard),
    copy(penguinCard),
    copy(zebraCard),
    copy(caloryCard),
    copy(cardinalCard),
    copy(penguinCard),
    copy(zebraCard),
    copy(caloryCard)
];