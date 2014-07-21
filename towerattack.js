var state = new State();
var helpFlags = [];
function showHelp($element, flag, text) {
    if (helpFlags[flag]) {
        return $();
    }
    hideHelp(flag);
    var $help = $('<div class="js-popupHelp popupHelp js-help-' + flag +'"></div>').html(text);
    $element.append($help);
    return $help;
}
function hideHelp(flag, forever) {
    $('.js-help-' + flag).remove();
    if (forever) {
        helpFlags[flag] = true;
    }
}
var dismissOverlayFunction;
function showMessage(markup, onDismiss) {
    $('.js-overlay').show().html('<p>' + markup + '</p>');
    dismissOverlayFunction = onDismiss;
}

//this triggers when page has finished loading
$(function () {
    initializeGame();
});

function setScene(newScene) {
    $('.js-' + state.scene + 'Scene').hide();
    state.scene = newScene;
    $('.js-' + state.scene + 'Scene').show();
}

function startGame() {
    setTimeout(function () {
        setScene('map');
    }, 200);
    initializeLevelScene();
    initializeMapScene();
    setInterval(mainLoop, frameLength);
}

function selectElement(element) {
    state.unselectElement = false;
    state.selectedElement = element;
}

var frameLength = 20;
function mainLoop() {
    if (state.scene == 'level') {
        levelSceneMainLoop();
    }
}

