/**
 * @param {String} name
 * @param {Array} cards
 */
function Deck(name, cards) {
    this.name = name;
    this.cards = cards;
}

function spawnAbility(name, cost, type, amount) {
    return copy(new Ability(name, cost, spawnAnimals, {animal: type, amount: amount}));
}
function powerUpAbility(name, cost, scope, tag, effectName, value) {
    return copy(new Ability(name, cost, powerUp, {scope: scope, tag: tag, effects: [{name: effectName, value: value}]}));
}
function calorieAbility(name, calories) {
    return copy(new Ability(name, 0, gainCalories, {calories: calories}));
}
var abilities = {
    //spawn creatures
    'cardinal': spawnAbility('Cardinal', 1, 'cardinal', 1),
    'cardinalFlock': spawnAbility('Cardinal Flock', 4, 'cardinal', 3),
    'penguin': spawnAbility('Penguin', 2, 'penguin', 1),
    'penguins': spawnAbility('Penguins', 5, 'penguin', 2),
    'snake': spawnAbility('Snake', 2, 'snake', 1),
    'twinSnakes': spawnAbility('Twin Snakes', 5, 'snake', 2),
    'snakeArmy': spawnAbility('Snake Army', 10, 'snake', 4),
    'zebra': spawnAbility('Zebra', 4, 'zebra', 1),
    'zebraPack': spawnAbility('Zebra', 14, 'zebra', 3),
    //power ups
    'quickWings': powerUpAbility('Quick Wings', 2, 'level', 'bird', 'speedPlus', 2),
    'birdFeed': powerUpAbility('Bird Seed', 3, 'level', 'bird', 'healthPlus', 10),
    'tailWind': powerUpAbility('Tail Wind', 4, 'level', 'animal', 'speedPlus', 2),
    'growthHormones': powerUpAbility('Growth Hormones', 5, 'level', 'animal', 'healthPlus', 10),
    'fangs': powerUpAbility('Fangs', 5, 'level', 'animal', 'damagePlus', 1),
    'scales': powerUpAbility('Scales', 5, 'level', 'animal', 'armorPlus', 1),
    'spareLuggage': powerUpAbility('Spare Luggage', 2, 'level', 'animal', 'carryPlus', 1),
    //etc
    'goodHarvest': calorieAbility('Good Harvest', 3)
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
    for (var i = 0; i < 3; i++) {
        addCardToDeck('cardinal');
        addCardToDeck('penguin');
        addCardToDeck('snake');
        addCardToDeck('zebra');
    }
    addCardToDeck('goodHarvest');
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