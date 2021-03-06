
/**
 * A card with 1 or more slots to hold abilities that can be used during play.
 *
 * @param {String} cardTypeKey  Key indicating what type of card this is
 * @param {Array} slots  The array of slots, which can either be null for empty,
 *     or set to Ability instances.
 */
function Card(cardTypeKey, slots) {
    this.cardTypeKey = cardTypeKey;
    this.slots = slots;
    this.element = null;
    this.classType = 'Card';
}

/**
 * Defines a type of card. Right now this is just a number of slots 1-3, but
 * eventually there will also be ability modifiers on the card.
 *
 * @param {String} name  Name to call this card type to players
 * @param {Number} numberOfSlots  Number of slots on this card type
 */
function CardType(name, numberOfSlots) {
    this.key = '';
    this.name = name;
    this.numberOfSlots = numberOfSlots;
    this.classType = 'CardType';
}

/**
 * An ability that can be assigned to a card and used when that card has been
 * dealt. A card may have multiple ablities, but typically only 1 ability can
 * be used from that card at a time.
 *
 * @param {String} name  The name of the card
 * @param {Number} cost  The cost in calories to play this. Negative values give calories for using the ability.
 * @param {Function} effectFunction  The function called when this ability is used.
 * @param {Object} data  Object to store additional fields which the effect function
 *     might use, such as number and type of animals to spawn.
 */
function Ability(name, cost, effectFunction, data) {
    this.key = '';
    this.name = name;
    this.cost = cost;
    this.effectFunction = effectFunction;
    this.data = data;
    this.element = null;
    this.classType = 'Ability';
    this.imageColumn = 0;
    this.imageRow = 0;
}

/**
 * @param {String} name  functional name like healthPlus or healthTimes
 * @param {Number} value  Value to change stat by
 */
function Modifier(name, value) {
    this.name = name;
    this.value = value;
    this.classType = 'Modifier';
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
    for (var i = 0; i < state.dealtCards.length; i++) {
        updateCardElement(state.dealtCards[i]);
    }
    var numDiscarded = state.discardedCards.length
    if (numDiscarded > 0) {
        //only update the last discarded card since it is the only one visible
        updateCardElement(state.discardedCards[numDiscarded - 1]);
    }
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
        var animal = createAnimal(ability.data.animal, state.waveNumber);
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
    //workaround to avoid deleting the details card
    $detailsCard = $('.js-details .card').detach();
    $('.js-cardContainer .card').remove();
    $('.js-details').append($detailsCard);
}

/**
 * @param {State} state
 */
function displayDeck() {
    $('.js-cardContainer .card.back:not(.dealt)').remove();
    var top = 5;
    $.each(state.deck, function (index, card) {
        var $card = makeCard(card).addClass('back');
        $card.css('bottom', top + 'px');
        $card.css('right', '5px');
        $('.js-cardContainer').append($card);
        top += 2;
    });
}

function addCardHandlers() {
    $('.js-cardContainer').on('click', '.card.back', function () {
        if (state.step == 'cards') {
            state.unselectElement = false;
            dealCard();
            hideHelp('deal', true);
        }
    });
    $('.js-cardContainer').on('click', '.card.dealt', function (event) {
        /** @type Card */
        var card = $(this).data('card');
        var yOffset = event.pageY - $(this).offset().top;
        var abilityIndex = Math.floor(yOffset / (120 / card.slots.length));
        hideHelp('selectAbility', true);
        hideHelp('emptyAbility');
        hideHelp('useAbility');
        hideHelp('insufficientCalories');
        hideHelp('calories');
        var ability = card.slots[abilityIndex];
        selectElement(ability);
        if (!ability) {
            showHelp($('.js-cardContainer'), 'emptyAbility', 'This ability slot is empty and cannot be used.').css('bottom', '30px').css('left', '0px');
        } else if (state.selectedElement.cost <= state.calories) {
            showHelp($('.js-cardContainer'), 'useAbility', 'Click "Use Ability" to activate this ability.').css('bottom', '30px').css('left', '0px');
        } else {
            showHelp($('.js-cardContainer'), 'insufficientCalories', 'You need more calories to use this ability.').css('bottom', '20px').css('left', '0px');
            showHelp($('.js-cardContainer'), 'calories', 'You gain calories every wave or from sending animals to attack a farm.').css('left', '150px').css('top', '-10px');
        }
    });
    $('.js-cardContainer').on('click', '.card.discarded', function () {
        if (state.step == 'cards') {
            state.unselectElement = false;
            hideHelp('shuffle', true);
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
    updateCardElement(dealtCard);
    dealtCard.element.css('top', top + 'px');
    dealtCard.element.css('left', left + 'px');
    dealtCard.element.removeClass('back');
    dealtCard.element.addClass('dealt');
}

/**
 * @param {Ability} ability
 */
function playCard(ability) {
    hideHelp('useAbility');
    /** @type Card */
    var card = ability.element.closest('.card').data('card');
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
        updateAnimal(state, animal, state.waveNumber);
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
    card.element.css('right', '103px');
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
 * @param {Boolean} ignoreWaveNumber  Whether to show stats based on wave number
 */
function makeCard(card, ignoreWaveNumber) {
    var $card = $('<div class="card"></div>');
    $card.data('card', card);
    card.element = $card;
    updateCardElement(card, ignoreWaveNumber);
    return $card;
}

/**
 * Updates the display of a card to reflect the changes in the model
 * @param {Card} card
 */
function updateCardElement(card, ignoreWaveNumber) {
    var $card = card.element;
    destructAbilities($card);
    $card.empty();
    $card.removeClass('a1 a2 a3');
    $card.addClass('a' + card.slots.length);
    $.each(card.slots, function (index, ability) {
        var $ability = $('<div class="ability"></div>');
        $ability.data('abilitySlot', index);
        $ability.data('ability', ability);
        if (ability) {
            ability.element = $ability;
        }
        $ability.append('<div class="name">' + (ability ? ability.name : 'empty') + '</div>');
        $ability.append('<div class="cost">' + (ability ? ability.cost : '-') + '</div>');
        var column = (ability ? ability.imageColumn : 2.2);
        var row = (ability ? ability.imageRow : 0.2);
        $ability.css('background-position', -(180 + 70 * column)+'px '+ -(40 * row) + 'px');
        $card.append($ability);
    });
    if (card.slots.length == 1 && card.slots[0]) {
        /** @type Ability */
        var ability = card.slots[0];
        $card.prepend('<p class="js-title title">' + ability.name + '</p>');
        $card.prepend('<p class="js-cost cost">' + ability.cost + '</p>');
        if (ability.data.amount) {
            $card.prepend('<p class="js-amount amount">&#215;' + ability.data.amount + '</p>')
        }
        $card.append('<p class="js-description description">' + getAbilityDetailsMarkup(ability, (ignoreWaveNumber ? 0 : state.waveNumber)) + '</p>');
    }
}

function destructCard($card) {
    destructAbilities($card);
    var card = $card.data('card');
    card.element = null;
    $card.data('card', null).remove();
}

function destructAbilities($card) {
    $card.find('.ability').each(function (index, element) {
        var ability = $(element).data('ability');
        if (ability) {
            ability.element = null;
        }
        $(element).data('ability', null).remove();
    });
}

function iconSpan(cssClass, markup) {
    return '<span class="statusDetail"><span class="icon ' + cssClass + '"></span> '+ markup + '</span>';
}
function getAbilityDetailsMarkup(ability, waveNumber) {
    if (!ability) {
        return 'This ability slot is empty';
    }
    var details = [];
    if (ability.data.description) {
        return ability.data.description;
    }
    if (ability.effectFunction == spawnAnimals) {
        /** @type Animal */
        var animal = createAnimal(ability.data.animal, waveNumber);
        return getAnimalDetailsMarkup(animal);
    }
    if (ability.effectFunction == gainCalories) {
        return 'Gain ' + ability.data.calories + ' calories.';
    }
    if (ability.effectFunction == powerUp) {
        var effectName = ability.data.effects[0].name;
        if (effectName.indexOf('Plus') >= 0) {
            effectName = effectName.substring(0, effectName.indexOf('Plus'));
            return ability.data.tag + 's gain ' + ability.data.effects[0].value + ' ' + effectName;
        }
    }
    return '';
}

/**
 * @param {Animal} animal
 */
function getAnimalDetailsMarkup(animal) {
    return [animal.type.tags.join(' '),
        iconSpan('health', animal.currentHealth + '/' + animal.health) + ' ' + iconSpan('armor', animal.armor),
        iconSpan('damage', animal.damage) + ' ' + iconSpan('speed', animal.speed) + ' ' + iconSpan('carry',  animal.carry)].join('<br />');
}