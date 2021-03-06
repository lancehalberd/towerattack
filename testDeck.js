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
function genericAbility(effectFunction, description) {
    return copy(new Ability('', 0, effectFunction, {description: description}));
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
    'emperorPenguin': basicAbility('Emperor Penguin', 5, [0, 0], spawnAbility('emperorPenguin', 1)),
    'snake': basicAbility('Snake', 2, [0, 2], spawnAbility('snake', 1)),
    'twinSnakes': basicAbility('Twin Snakes', 5, [0, 2], spawnAbility('snake', 2)),
    'snakeArmy': basicAbility('Snake Army', 10, [0, 2], spawnAbility('snake', 4)),
    'zebra': basicAbility('Zebra', 4, [0, 1], spawnAbility('zebra', 1)),
    'zebraPack': basicAbility('Zebra Pack', 14, [0, 1], spawnAbility('zebra', 3)),
    //power ups
    'quickWings': basicAbility('Quick Wings', 4, [2.2, .2], powerUpAbility('level', 'bird', 'speedPlus', 5)),
    'birdFeed': basicAbility('Bird Seed', 3, [1, 2], powerUpAbility('level', 'bird', 'healthPlus', 10)),
    'tailWind': basicAbility('Tail Wind', 4, [2.2, .2], powerUpAbility('level', 'animal', 'speedPlus', 2)),
    'growthHormones': basicAbility('Growth Hormones', 5, [1, 2], powerUpAbility('level', 'animal', 'healthPlus', 10)),
    'fangs': basicAbility('Fangs', 5, [2.2, .2], powerUpAbility('level', 'animal', 'damagePlus', 1)),
    'scales': basicAbility('Scales', 5, [2.2, .2], powerUpAbility('level', 'animal', 'armorPlus', 1)),
    'spareLuggage': basicAbility('Spare Luggage', 2, [1, 1], powerUpAbility('level', 'animal', 'carryPlus', 1)),
    //etc
    'goodHarvest': basicAbility('Good Harvest', 0, [2.2, .2], calorieAbility(3)),
    'goodFortune': basicAbility('Good Fortune', 0, [2.2, .2], genericAbility(function (state, ability) {
        state.calories += 2;
        state.abilitiesUsedThisTurn--;
    }, 'Gain 2 calories and use an extra ability.')),
};
$.each(abilities, function (key, ability) {
    ability.key = key;
});
var cards = {
    'single': new CardType("Plain Card", 1),
    'double': new CardType("Double Card", 2),
    'triple': new CardType("Triple Card", 3)
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
        cards.push(['single', abilityType]);
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

/**
 * @param {String} key
 * @return {Card}
 */
function makeCardFromType(key) {
    /** @type CardType */
    var cardType = cards[key];
    var slots = [];
    for (var i = 0; i < cardType.numberOfSlots; i++) {
        slots.push(null);
    }
    return new Card(key, slots);
}

function createConcreteDeck(deck) {
    var concreteCards = [];
    for (var i = 0; i < deck.cards.length; i++) {
        var concreteAbilities = [];
        var cardTypeKey = deck.cards[i][0];
        //the other elements are the ability type keys
        for (var j = 1; j < deck.cards[i].length; j++) {
            concreteAbilities.push(copy(abilities[deck.cards[i][j]]));
        }
        var card = makeCardFromType(cardTypeKey);
        card.slots = concreteAbilities;
        concreteCards.push(card);
    }
    return concreteCards;
}