/**
 * Class for storing global game information, such as the various dom elements
 * and drawing contexts.
 */
function Game() {
    /** @type {context} */
    this.backgroundContext = null;
    /** @type {context} */
    this.pathContext = null;
    /** @type {context} */
    this.animalContext = null;
    /** @type {context} */
    this.timelineContext = null;
}

var game = new Game();

function initializeGame() {
    game.backgroundContext = $('.js-backgroundCanvas')[0].getContext('2d');
    game.pathContext = $('.js-pathCanvas')[0].getContext('2d');
    game.animalContext = $('.js-animalCanvas')[0].getContext('2d');
    game.timelineContext = $('.js-timelineCanvas')[0].getContext('2d');
}