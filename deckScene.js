function initializeDeckScene() {
    $('.js-exitDeck').on('click', function () {
        setScene('map');
    });
}

function displayDeckToEdit(cards) {
    //erase all the cards in the card area
    $('.js-deckScene .js-cardArea').children().each(function (index, element) {
        var card = $(element).data('card');
        card.element = null;
        $(element).data('card', null).remove();
    });
    for (var i = 0; i < cards.length; i++) {
        /** @type Card */
        var card = cards[i];
        var $card = makeCard(card).removeClass('back');
        var row = Math.floor(i / 8);
        var col = i % 8;
        $card.css('left', 10 + col * 95 + 'px').css('top', 25 + row * 125 + 'px');
        $('.js-cardArea').append($card);
    }
}