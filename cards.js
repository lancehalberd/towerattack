
/**
 * A card with 1 or more slots to hold abilities that can be used during play.
 *
 * @param {Array} slots  The array of slots, which can either be null for empty,
 *     or set to Ability instances.
 */
function Card(slots) {
    this.slots = slots;
    this.element = null;
}

/**
 * An ability that can be assigned to a card and used when that card has been
 * dealt. A card may have multiple ablities, but typically only 1 ability can
 * be used from that card at a time.
 *
 * @param {Number} cost  The cost in calories to play this. Negative values give calories for using the ability.
 * @param {Function} effectFunction  The function called when this ability is used.
 * @param {Object} data  Object to store additional fields which the effect function
 *     might use, such as number and type of animals to spawn.
 */
function Ability(cost, effectFunction, data) {
    this.cost = cost;
    this.effectFunction = effectFunction;
    this.data = data;
    this.element = null;
}

/**
 * Apply the given ability to the given state.
 *
 * @param {State} state  The current state of the game.
 * @param {Ability} ability  The ability to use.
 * @return {State}  The state after using this ability.
 */
function useAbility(state, ability) {
    state.calories += ability.cost;
    if (state.calories < 0) {
        state.invalid = "You need " + (-state.calories) + " more calories to use this ability";
        return state;
    }
    //call the particular effect associated with this ability
    return ability.effectFunction(state, ability);
}

/**
 * An effect for adding animals to the current wave.
 *
 * @param {State} state  The current state of the game.
 * @param {Ability} ability  The ability triggering this effect.
 * @return {State}  The state with the animals added to the current wave.
 */
function spawnAnimals(state, ability) {
    for (var i = 0; i < ability.data.amount; i++) {
        var slotInfo = getNextTimelineSlot(state);
        var path = slotInfo[0];
        var slot = slotInfo[1];
        state.paths[path].slots[slot] = createAnimal(state, ability.data.animal);
    }
    return state;
}

/**
 * An effect for adding a power up to the current level or wave, such as
 * increasing the health of animals by 1, or doubling the defense of snakes.
 *
 * @param {State} state  The current state of the game.
 * @param {Ability} ability  The ability triggering this effect.
 * @return {State}  The state with the animals added to the current wave.
 */
function powerUp(state, ability) {
    var modifiers = state.waveModifiers;
    if (ability.data.scope == 'level') {
        modifiers = state.levelModifiers;
    }
    $.each(ability.data.effects, function (index, effect) {
        if (!modifiers[effect.name]) {
            modifiers[effect.name] = [];
        }
        modifiers[effect.name].push(effect.value);
    })
    return state;
}

/**
 * An effect that does nothing. Use to make abilities that just change calories.
 *
 * @param {State} state  The current state of the game.
 * @param {Ability} ability  The ability triggering this effect.
 * @return {State}  The state with the animals added to the current wave.
 */
function nullOp(state, ability) {
    return state;
}

/**
 * @param {State} state
 */
function initializeCardArea(state) {
    displayDeck(state);
    addCardHandlers(state);
}

/**
 * @param {State} state
 */
function displayDeck(state) {
    var top = 5;
    $.each(state.deck, function (index, card) {
        var $card = makeCard(card);
        card.element = $card;
        $card.css('bottom', top + 'px');
        $card.css('right', '5px');
        $('.cardContainer').append($card);
        top += 2;
    });
}

/**
 * @param {State} state
 */
function addCardHandlers(state) {
    $('.cardContainer').on('click', '.card.back', function () {
        dealCard(state);
    });
    $('.cardContainer').on('click', '.card.dealt .ability', function () {
        playCard(state, $(this).data('ability'), $(this).closest('.card').data('card'));
    });
    $('.cardContainer').on('click', '.card.discarded', function () {
        shuffleDeck(state);
    });
}

/**
 * @param {State} state
 */
function dealCard(state) {
    var nextSpace = state.dealtCards.length;
    //can't deal more than 6 cards
    if (nextSpace > 5 || state.deck.length == 0) {
        return;
    }
    var dealtCard = state.deck.pop();
    state.dealtCards[nextSpace] = dealtCard;
    var top = 10 + Math.floor(nextSpace / 3) * 120;
    var left = 10 + (nextSpace % 3) * 90;
    dealtCard.element.css('top', top + 'px');
    dealtCard.element.css('left', left + 'px');
    dealtCard.element.removeClass('back');
    dealtCard.element.addClass('dealt');
}

/**
 * @param {State} state
 * @param {Ability} ability
 * @param {Card} card
 */
function playCard(state, ability, card) {
    //can only use 3 abilities a turn
    if (state.abilitiesUsedThisTurn > 2) {
        return;
    }
    state[state.dealtCards.indexOf(card)] = null;
    useAbility(state, ability);
    card.element.css('top', '');
    card.element.css('left', '');
    card.element.css('bottom', (5 + (state.discardedCards.length) * 5) + 'px');
    card.element.css('right', '105px');
    state.discardedCards.push(card);
    card.element.removeClass('dealt');
    card.element.addClass('discarded');
    $('.cardContainer').append(card.element);
    state.abilitiesUsedThisTurn++;
}

/**
 * @param {State} state
 */
function shuffleDeck(state) {
    //move discarded cards back into deck
    while (state.discardedCards.length) {
        state.deck.push(state.discardedCards.pop());
    }
    //randomize order of deck
    var l = state.deck.length;
    for (var i = 0; i < l; i++) {
        var j = Math.floor(Math.random() * (l - i)) + i;
        var temp = state.deck[i];
        state.deck[i] = state.deck[j];
        state.deck[j] = temp;
    }
    //clear the discard and deck elements
    $('.cardContainer .card.back').remove();
    $('.cardContainer .card.discarded').remove();
    //add the deck elements to the screen again
    displayDeck(state);
}

/**
 * Creates a new DOM element for a card representing the given card
 *
 * @param {Card} card  The card to make the dom element for
 */
function makeCard(card) {
    var $card = $('<div class="card back"></div>');
    $card.addClass('a' + card.slots.length);
    $.each(card.slots, function (index, ability) {
        var $ability = $('<div class="ability"></div>');
        $ability.data('ability', ability);
        $ability.text(ability.cost);
        $card.append($ability);
    })
    $card.data('card', card);
    return $card;
}
