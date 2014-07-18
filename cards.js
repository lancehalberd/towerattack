
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
 * @param {String} name  functional name like healthPlus or healthTimes
 * @param {Number} value  Value to change stat by
 */
function Modifier(name, value) {
    this.name = name;
    this.value = value;
}

/**
 * Apply the given ability to the given state.
 *
 * @param {State} state  The current state of the game.
 * @param {Ability} ability  The ability to use.
 * @return {String}  error message if the ability may not be used
 */
function useAbility(state, ability) {
    if (state.calories < ability.cost) {
        return "You need " + (state.calories - ability.cost) + " more calories to use this ability";
    }
    state.calories -= ability.cost;
    //call the particular effect associated with this ability
    ability.effectFunction(state, ability);
    updateInformation();
    return null;
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
        var slotInfo = getNextTimelineSlot(state, state.selectedPath, 0);
        var animal = createAnimal(state, ability.data.animal);
        var pathIndex = slotInfo[0];
        var pathSlot = slotInfo[1];
        state.paths[pathIndex].slots[pathSlot] = animal;
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
    if (!modifiers[ability.data.tag]) {
        modifiers[ability.data.tag] = [];
    }
    $.each(ability.data.effects, function (index, effect) {
        modifiers[ability.data.tag].push(new Modifier(effect.name, effect.value));
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
function gainCalories(state, ability) {
    return state.calories += ability.data.calories;
}

function initializeCardArea() {
    addCardHandlers();
}

function clearCardArea() {
    $('.js-cardContainer .card').remove();
}

/**
 * @param {State} state
 */
function displayDeck() {
    $('.js-cardContainer .card.back:not(.dealt)').remove();
    var top = 5;
    $.each(state.deck, function (index, card) {
        var $card = makeCard(card);
        card.element = $card;
        $card.css('bottom', top + 'px');
        $card.css('right', '5px');
        $('.js-cardContainer').append($card);
        top += 2;
    });
}

function addCardHandlers() {
    $('.js-cardContainer').on('click', '.card.back', function () {
        if (state.step == 'cards') {
            dealCard();
            hideHelp('deal', true);
        }
    });
    $('.js-cardContainer').on('click', '.card.dealt .ability', function () {
        if (state.step == 'cards') {
            playCard(state, $(this).data('ability'), $(this).closest('.card').data('card'));
            hideHelp('ability', true);
        }
    });
    $('.js-cardContainer').on('click', '.card.discarded', function () {
        if (state.step == 'cards') {
            shuffleDeck();
        }
    });
}

function dealCard() {
    var nextSpace = state.dealtCards.length;
    //can't deal more than 6 cards
    if (nextSpace > 5 || state.deck.length == 0) {
        return;
    }
    var dealtCard = state.deck.pop();
    state.dealtCards[nextSpace] = dealtCard;
    var top = 10 + Math.floor(nextSpace / 3) * 130;
    var left = 10 + (nextSpace % 3) * 100;
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
    var error = useAbility(state, ability);
    if (error) {
        return;
    }
    card.element.addClass('back');
    state.abilitiesUsedThisTurn++;
    if (state.abilitiesUsedThisTurn >= 3) {
        startNextStep();
    }
    //update animals now that wave # has changed and wave modifiers are gone
    $.each(getAnimals(state), function (i, animal) {
        updateAnimal(state, animal);
    });
    updateInformation();
}

/**
 * @param {State} state
 * @param {Card} card
 */
function discardCard(state, card) {
    card.element.css('top', '');
    card.element.css('left', '');
    card.element.css('bottom', (5 + (state.discardedCards.length) * 2) + 'px');
    card.element.css('right', '105px');
    state.discardedCards.push(card);
    card.element.removeClass('dealt');
    card.element.removeClass('back');
    card.element.addClass('discarded');
    $('.js-cardContainer').append(card.element);
}

function shuffleDeck() {
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
    $('.js-cardContainer .card.discarded').remove();
    //add the deck elements to the screen again
    displayDeck();
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
        if (ability.data.animal) {
            $ability.text(ability.cost + ":" + ability.data.animal);
        } else if (ability.data.effects) {
            var effect = ability.data.effects[0];
            $ability.text(ability.cost + ":"+ effect.name + ' ' + effect.value);
        } else if (ability.data.calories) {
            $ability.text('+' + ability.data.calories + ' Cal');
        }
        $card.append($ability);
    })
    $card.data('card', card);
    return $card;
}
