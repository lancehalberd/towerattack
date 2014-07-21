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
        $('.js-mapScene').append($levelMarker);
    }
    $('.js-mapScene').on('click', '.js-level', function () {
        /** @type Level */
        var level = $(this).data('level');
        startLevel(level);
        setScene('level');
    });
}