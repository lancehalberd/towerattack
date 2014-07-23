function initializeTitleScene() {
    loadOrCreateSavedData();
    //Update the state of the new game button based on the input field
    $('.js-newGameName').on('keyup change paste', function (event) {
        var name = $.trim($(this).val());
        //name cannot be empty or already in use
        if (name != '' && !state.savedGames[name]) {
            $('.js-startNewGame').attr('disabled', null);
        } else {
            $('.js-startNewGame').attr('disabled', 'disabled');
        }
    });
    //Create a new save file
    $('.js-startNewGame').on('click', function (event) {
        var newGame = new SavedGame();
        newGame.name = $.trim($('.js-newGameName').val());
        $('.js-newGameName').val('');
        $('.js-startNewGame').attr('disabled', 'disabled');
        state.savedGames[newGame.name] = newGame;
        displaySavedGameOption(newGame);
        saveData();
    });
    //Clicking on a saved game loads the game and sends them to the map
    $('.js-titleScene').on('click', '.js-gameName', function (event) {
        var $game = $(this).closest('.js-savedGame');
        state.currentGame = $game.data('game');
        updateMapeScene();
        setScene('map');
    });
    //Delete a saved game
    $('.js-titleScene').on('click', '.js-deleteGame', function (event) {
        var $game = $(this).closest('.js-savedGame');
        var game = $game.data('game');
        $game.remove();
        delete state.savedGames[game.name];
        saveData();
    });
    //show initial list of games
    $.each(state.savedGames, function (index, game) {
        displaySavedGameOption(game);
    });
}

function displaySavedGameOption(game) {
    var $option = $('.js-savedGame').first().clone();
    $option.data('game', game).show().find('.js-gameName').text(game.name);
    $('.js-newGame').before($option);
}


function loadOrCreateSavedData() {
    /** @type Object */
    state.savedGames = $.jStorage.get("savedGames");
    if (!state.savedGames) {
        state.savedGames = {};
    }
    //filter out invalid save files (version of save does not match current game version)
    $.each(state.savedGames, function (key, savedGame) {
        if (savedGame.version != game.version) {
            delete state.savedGames[key];
        }
    });
}

function saveData() {
    $.jStorage.set("savedGames", state.savedGames);
}