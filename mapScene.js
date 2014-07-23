function initializeMapScene() {
    $('.js-mapScene').append(game.images.worldMap);
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