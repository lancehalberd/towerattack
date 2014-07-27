var availableCards = [];
var availableAbilities = [];
/** @type Card */
var selectedCard = null;
/** @type Number */
var selectedAbilitySlot = 0;
var editedDeck = [];
function initializeDeckScene() {
    $('.js-saveDeck').on('click', function () {
        //save the changes to the current deck
        var updatedCards = editedDeck.map(function (card) {
            return [card.cardTypeKey].concat(card.slots.map(function (ability) {
                return ability ? ability.key : null;
            }));
        });
        state.currentGame.decks[0] = new Deck('Custom Deck', updatedCards);
        cleanUpDeckEditor();
        saveData();
        setScene('map');
    });
    $('.js-cancelDeck').on('click', function () {
        cleanUpDeckEditor();
        setScene('map');
    });

    //Change card type handlers
    $('.js-deckScene').on('click', '.card', function () {
        selectedCard = $(this).data('card');
        $('.js-changeCard').show();
        $('.js-changeAbility').hide();
        $('.js-changeCard .js-cardTypes').empty();
        if (availableCards.length) {
            $('.js-changeCard .js-cardTypes').append('<option>Choose new card type</option>');
        } else {
            $('.js-changeCard .js-cardTypes').append('<option>No extra cards available</option>');
        }
        $.each(availableCards, function (index, cardTypeKey) {
            /** @type CardType */
            var cardType = cards[cardTypeKey];
            $('.js-changeCard .js-cardTypes').append('<option value="' + index + '">' + cardType.name + '</option>');
        });
    });
    $('.js-deckScene .js-cardTypes').on('change', function () {
        var index = $(this).val();
        var newCardTypeKey = availableCards[index];
        availableCards.splice(index, 1);
        availableCards.push(selectedCard.cardTypeKey);
        selectedCard.cardTypeKey = newCardTypeKey;
        var newSlots = [];
        /** @type CardType */
        var cardType = cards[newCardTypeKey];
        for (var i = 0; i < cardType.numberOfSlots; i++) {
            newSlots[i] = selectedCard.slots.length ? selectedCard.slots.shift() : null;
        }
        //some abilities will be left if the new card type has fewer slots than
        //the current card type. Add these abilities back to the pool of available abilities
        while (selectedCard.slots.length) {
            var ability = selectedCard.slots.pop();
            if (ability) {
                availableAbilities.push(ability.key);
            }
        }
        selectedCard.slots = newSlots;
        updateCardElement(selectedCard);
        selectedCard = null;
        $('.js-changeCard').hide();
    });
    $('.js-changeCard .js-cancel').on('click', function () {
        selectedCard = null;
        $('.js-changeCard').hide();
    });

    //Change ability type handlers
    $('.js-deckScene').on('click', '.ability', function (event) {
        event.stopPropagation();
        selectedAbilitySlot = $(this).data('abilitySlot');
        selectedCard = $(this).closest('.card').data('card');
        $('.js-changeCard').hide();
        $('.js-changeAbility').show();
        $('.js-changeAbility .js-abilityTypes').empty();
        if (availableAbilities.length) {
            $('.js-changeAbility .js-abilityTypes').append('<option>Choose new ability</option>');
        } else {
            $('.js-changeAbility .js-abilityTypes').append('<option>No extra abilities available</option>');
        }
        $.each(availableAbilities, function (index, abilityKey) {
            /** @type Ability */
            var ability = abilities[abilityKey];
            $('.js-changeAbility .js-abilityTypes').append('<option value="' + index + '">' + ability.name + '</option>');
        });
    });
    $('.js-deckScene .js-abilityTypes').on('change', function () {
        var index = $(this).val();
        var newAbilityKey = availableAbilities[index];
        availableAbilities.splice(index, 1);
        /** @type Ability */
        var selectedAbility = selectedCard.slots[selectedAbilitySlot];
        if (selectedAbility) {
            //add current ability back to available abilities
            availableAbilities.push(selectedAbility.key);
        }
        //set current ability to the selected ability
        selectedCard.slots[selectedAbilitySlot] = copy(abilities[newAbilityKey]);
        updateCardElement(selectedCard);
        selectedCard = null;
        $('.js-changeAbility').hide();
    });
    $('.js-changeAbility .js-cancel').on('click', function () {
        selectedCard = null;
        $('.js-changeAbility').hide();
    });
}

function displayDeckToEdit(cards) {
    editedDeck = cards;
    availableCards = copy(state.currentGame.cards);
    availableAbilities = copy(state.currentGame.abilities);
    for (var i = 0; i < cards.length; i++) {
        /** @type Card */
        var card = cards[i];
        var $card = makeCard(card, true).css('position', 'relative');
        $('.js-cardArea').append($card);
        availableCards.splice(availableCards.indexOf(card.cardTypeKey), 1);
        for (var j = 0; j < card.slots.length; j++) {
            /** @type Ability */
            var ability = card.slots[j];
            if (ability) {
                availableAbilities.splice(availableAbilities.indexOf(ability.key), 1);
            }
        }
    }
}

function cleanUpDeckEditor() {
    //erase all the cards in the card area
    $('.js-deckScene .js-cardArea').children().each(function (index, element) {
        destructCard($(element));
    });
    $('.js-changeCard').hide();
    $('.js-changeAbility').hide();
}
