/**
 * @param {String} name
 * @param {Array} cards
 */
function Deck(name, cards) {
    this.name = name;
    this.cards = cards;
}

function spawnAbility(type, amount) {
    return copy(new Ability('', 0, spawnAnimals, {animal: type, amount: amount}));
}
function powerUpAbility(scope, tag, effectName, value) {
    return copy(new Ability('', 0, powerUp, {scope: scope, tag: tag, effects: [{name: effectName, value: value}]}));
}
function calorieAbility(calories) {
    return copy(new Ability('', 0, gainCalories, {calories: calories}));
}
function basicAbility(name, cost, imagePosition, ability) {
    ability.name = name;
    ability.cost = cost;
    ability.imageColumn = imagePosition[0];
    ability.imageRow = imagePosition[1];
    return ability;
}
var abilities = {
    //spawn creatures
    'cardinal': basicAbility('Cardinal', 1, [1, 0], spawnAbility('cardinal', 1)),
    'cardinalFlock': basicAbility('Cardinal Flock', 4, [1, 0], spawnAbility('cardinal', 3)),
    'penguin': basicAbility('Penguin', 2, [0, 0], spawnAbility('penguin', 1)),
    'penguins': basicAbility('Penguins', 5, [0, 0], spawnAbility('penguin', 2)),
    'snake': basicAbility('Snake', 2, [0, 2], spawnAbility('snake', 1)),
    'twinSnakes': basicAbility('Twin Snakes', 5, [0, 2], spawnAbility('snake', 2)),
    'snakeArmy': basicAbility('Snake Army', 10, [0, 2], spawnAbility('snake', 4)),
    'zebra': basicAbility('Zebra', 4, [0, 1], spawnAbility('zebra', 1)),
    'zebraPack': basicAbility('Zebra Pack', 14, [0, 1], spawnAbility('zebra', 3)),
    //power ups
    'quickWings': basicAbility('Quick Wings', 2, [2.2, .2], powerUpAbility('level', 'bird', 'speedPlus', 2)),
    'birdFeed': basicAbility('Bird Seed', 3, [1, 2], powerUpAbility('level', 'bird', 'healthPlus', 10)),
    'tailWind': basicAbility('Tail Wind', 4, [2.2, .2], powerUpAbility('level', 'animal', 'speedPlus', 2)),
    'growthHormones': basicAbility('Growth Hormones', 5, [1, 2], powerUpAbility('level', 'animal', 'healthPlus', 10)),
    'fangs': basicAbility('Fangs', 5, [2.2, .2], powerUpAbility('level', 'animal', 'damagePlus', 1)),
    'scales': basicAbility('Scales', 5, [2.2, .2], powerUpAbility('level', 'animal', 'armorPlus', 1)),
    'spareLuggage': basicAbility('Spare Luggage', 2, [1, 1], powerUpAbility('level', 'animal', 'carryPlus', 1)),
    //etc
    'goodHarvest': basicAbility('Good Harvest', 0, [2.2, .2], calorieAbility(3))
};
$.each(abilities, function (key, ability) {
    ability.key = key;
});
var cards = {
    'single': new CardType(1),
    'double': new CardType(2),
    'triple': new CardType(3)
};
$.each(cards, function (key, card) {
    card.key = key;
});

/**
 * @param {SavedGame} savedGame
 */
function initializeCardsForGame(savedGame) {
    savedGame.abilities = [];
    savedGame.cards = [];
    savedGame.decks = [];
    var cards = [];
    function addCardToDeck(abilityType) {
        savedGame.cards.push('single');
        savedGame.abilities.push(abilityType);
        cards.push(new Card([abilityType]));
    }
    for (var i = 0; i < 4; i++) {
        addCardToDeck('cardinal');
        addCardToDeck('penguin');
        addCardToDeck('snake');
        addCardToDeck('zebra');
        addCardToDeck('goodHarvest');
    }
    addCardToDeck('tailWind');
    addCardToDeck('growthHormones');
    addCardToDeck('fangs');
    addCardToDeck('scales');
    savedGame.decks.push(new Deck('Starter Deck', cards));
}

function createConcreteDeck(deck) {
    var concreteCards = [];
    for (var i = 0; i < deck.cards.length; i++) {
        var concreteAbilities = [];
        for (var j = 0; j < deck.cards[i].slots.length; j++) {
            concreteAbilities.push(copy(abilities[deck.cards[i].slots[j]]));
        }
        concreteCards.push(new Card(concreteAbilities));
    }
    return concreteCards;
}