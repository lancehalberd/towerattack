function initializeMapScene() {
    var $worldMap = $(game.images.worldMap);
    $worldMap.css('position', 'absolute');
    $('.js-mapScene').prepend($worldMap);
    for (var i = 0; i < levels.length; i++) {
        /** @type Level */
        var level = levels[i];
        var $levelMarker = $('<div class="js-level level"></div>').text(level.name)
            .css('position', 'absolute')
            .css('left', level.location[0] + 'px')
            .css('top', level.location[1] + 'px')
            .data('level', level);
        level.$mapMarker = $levelMarker;
        $('.js-mapScene').append($levelMarker);
    }
    $('.js-mapScene').on('click', '.js-level', function () {
        /** @type Level */
        var level = $(this).data('level');
        startLevel(level);
        setScene('level');
    });
    $('.js-editDeck').on('click', function () {
        displayDeckToEdit(createConcreteDeck(state.currentGame.decks[0]));
        setScene('deck');
    });
    $('.js-loadGame').on('click', function () {
        setScene('title');
    });
}

function updateMapeScene() {
    for (var i = 0; i < levels.length; i++) {
        /** @type Level */
        var level = levels[i];
        updateMedalMarker(level.$mapMarker);
    }
}

/**
 * @param {Level} level
 * @param {Number} wavesCompleted
 */
function updateRecord(level, wavesCompleted) {
    var record = state.currentGame.records[level.name];
    var lastPrizeLevel = getPrizeLevel(level, record);
    var currentPrizeLevel = getPrizeLevel(level, wavesCompleted);
    state.rewardCards = [];
    for (var newPrize = lastPrizeLevel + 1; newPrize <= currentPrizeLevel; newPrize++) {
        var prize = level.rewards[newPrize];
        if (prize.classType == 'CardType') {
            state.currentGame.cards.push(prize.key);
            state.rewardCards.push(makeCardFromType(prize.key));
        }
        if (prize.classType == 'Ability') {
            state.currentGame.abilities.push(prize.key);
            var card = makeCardFromType('single');
            card.slots[0] = copy(abilities[prize.key]);
            state.rewardCards.push(card);
        }
    }
    if (!record || wavesCompleted < record) {
        state.currentGame.records[level.name] = wavesCompleted;
        saveData();
    }
    updateMedalMarker(level.$mapMarker);
}

function updateMedalMarker($levelMarker) {
    $levelMarker.find('.medal').remove();
    /** @type Level */
    var level = $levelMarker.data('level');
    var record = state.currentGame.records[level.name];
    if (!record) {
        return;
    }
    var medalType = 'bronze';
    if (record <= level.waveLimits[0]) {
        medalType = 'gold';
    } else if (record <= level.waveLimits[1]) {
        medalType = 'silver';
    }
    $levelMarker.prepend('<div class="medal '+ medalType + '"></div>');
}

/**
 * @param {Level} level
 * @param {Number} wavesCompleted
 */
function getPrizeLevel(level, wavesCompleted) {
    if (!wavesCompleted) {
        return  -1;
    }
    if (wavesCompleted <= level.waveLimits[0]) {
        return 2;
    }
    if (wavesCompleted <= level.waveLimits[1]) {
        return 1;
    }
    return 0; //assumes the level was actually completed
}