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
function showMessage($content, onDismiss) {
    $('.js-overlay').show().empty().append($content);
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
    //make sure level editing controls are not seen outside of the level scene
    if (newScene != 'level') {
        if (state.editingMap) {
            toggleEditing();
        }
        $('.js-editingControls').hide();
    }
}

function startGame() {
    setTimeout(function () {
        setScene('title');
    }, 200);
    initializeTitleScene();
    initializeMapScene();
    initializeDeckScene();
    initializeLevelScene();
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
