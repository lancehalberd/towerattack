function performAction(event) {
    if (state.step == 'cards') {
        if (isValidAbilitySelected()) {
            playCard(state.selectedElement);
            state.selectedElement = null;
            hideHelp('useAbility', true);
            return;
        }
    }
    startNextStep();
}
function startNextStep() {
    switch (state.step) {
        case 'cards':
            endCardStep();
            return startBuildStep();
        case 'build':
            if (state.editingPath) {
                if (!state.paths[state.selectedPath].complete) {
                    showHelp($('.js-cardContainer'), 'stopEditingToStartWave', 'You must finish editing paths before starting the wave')
                        .css('bottom', '40px').css('left', '0px');
                    return;
                }
                togglePathEditing();
            }
            return startWaveStep();
        case 'wave':
            return startCardStep();
    }
    return;
}

function startCardStep() {
    state.step = 'cards';
    state.calories += state.currentLevel.caloriesPerWave;
    state.step = 'cards';
    if (state.deck.length <= 0) {
        shuffleDeck();
    }
    dealCard();
    if (state.discardedCards.length > 0) {
        showHelp($('.js-cardContainer'), 'shuffle', 'Click the discard pile to shuffle used cards back into the deck.').css('bottom', '40px').css('right', '95px');
    }
    showHelp($('.js-cardContainer'), 'deal', 'Click this deck to deal up to 6 cards.').css('bottom', '40px').css('right', '0px');
    showHelp($('.js-cardContainer'), 'selectAbility', 'Click an ability on a card to select it.').css('top', '100px').css('left', '0px');
    updateActionButton();
}

function endCardStep() {
    hideHelp('deal');
    hideHelp('selectAbility');
    hideHelp('shuffle');
    hideHelp('emptyAbility');
    //discard remaining dealt cards at start of build step
    while (state.dealtCards.length) {
        /** @type Card */
        var card = state.dealtCards.pop();
        if (card) {
            discardCard(state, card);
        }
    }
}

function startBuildStep () {
    state.step = 'build';
    //humans build towers for 20 gold in random locations
    while (state.humanGold > 20) {
        var x = Random.range(0, state.mapGrid[0].length - 1);
        var y = Random.range(0, state.mapGrid.length - 1);
        if (['0', '1', '2', '3'].indexOf(state.mapGrid[y][x]) >= 0) {
            /** @type Tower */
            var tower = getRandomTower();
            state.mapGrid[y][x] = tower;
            tower.mapX = x * defaultTileSize;
            tower.mapY = y * defaultTileSize;
            state.towers.push(tower);
            state.humanGold -= 20;
        } else {
            break;
        }
    }
    updateActionButton();
}

function startWaveStep() {
    state.waveNumber++;
    state.animals = getAnimals(state);
    $.each(state.animals, function (index, element) {
        /** @type Animal */
        var animal = element;
        animal.spawned = false;
        animal.dead = false;
        animal.finished = false;
        animal.distance = 0;
        animal.lastTile = null;
        animal.burden = 0;
    });
    for (var i = 0; i < state.paths.length; i++) {
        //if this path is incomplete but also empty, just erase it at the start of the wave
        if (!state.paths[i].complete) {
            state.paths[i].points = [];
        }
    }
    state.step = 'wave';
    updateActionButton();
}

function endWaveStep() {
    //update animals now that wave # has changed and wave modifiers are gone
    $.each(state.animals, function (i, animal) {
        updateAnimal(state, animal);
    });
    //humans get gold from mines that the animals failed to steal
    for (var i = 0; i < state.mines.length; i++) {
        /** @type Mine */
        var mine = state.mines[i];
        state.humanGold += mine.waveGold;
        mine.waveGold = mine.gold;

    }
    //humans get calories from mines that the animals failed to steal
    for (var i = 0; i < state.farms.length; i++) {
        /** @type Farm */
        var farm = state.farms[i];
        state.humanCalories += farm.waveCalories;
        farm.waveCalories = farm.calories;
    }
    var survivingCities = [];
    for (var i = 0; i < state.cities.length; i++) {
        /** @type City */
        var city = state.cities[i];
        state.humanGold += Math.floor(city.productivity * city.population);
        if (city.population > 0) {
            survivingCities.push(city);
        }
    }
    state.population = 0;
    $.each(survivingCities, function (index, city) {
        city.population += .1 * state.humanCalories / survivingCities.length;
        state.population += city.population;
    });
    state.humanCalories = 0;
    state.abilitiesUsedThisTurn = 0;
    for (var i = 0; i < state.paths.length; i++) {
        for (var j = 0; j < state.paths[i].slots.length; j++) {
            /** @type Animal */
            var animal = state.paths[i].slots[j];
            if (animal && animal.dead) {
                state.paths[i].slots[j] = null;
            }
        }
    }
    for (var towerIndex = 0; towerIndex < state.towers.length; towerIndex++) {
        /** @type Tower */
        var tower = state.towers[towerIndex];
        tower.lastTimeFired = -2000;
    }
    state.waveTime = 0;

    if (state.population <= 0) {
        updateRecord(state.currentLevel, state.waveNumber);
        $content = $('<div><p>You Won!</p></div>');
        $.each(state.rewardCards, function (index, card) {
            var $card = makeCard(card).css('position', 'relative');
            $content.append($card);
        });
        $content.append('<p>Click to continue.</p>');
        showMessage($content, returnToMap);
        state.step = "victory";
        return;
    }
    if (state.waveNumber == state.waveLimit) {
        showMessage('<p>You lost!</p><p>Click to continue.</p>', returnToMap);
        state.step = "defeat";
        return;
    }
    //clear all wave modifiers at the end of the wave
    state.waveModifiers = {};
    startNextStep();
}

function returnToMap() {
    state.waveNumber = 0;
    setScene('map');
}

function isValidAbilitySelected() {
    return (state.selectedElement && state.selectedElement.classType == 'Ability');
}

function updateActionButton() {
    switch (state.step) {
        case 'cards':
            if (isValidAbilitySelected()) {
                /** @type Ability */
                var ability = state.selectedElement;
                return $('.js-actionButton').text('Use Ability').prop('disabled', ability.cost > state.calories);
            }
            return $('.js-actionButton').text('End Turn').prop('disabled', false);
        case 'build':
            return $('.js-actionButton').text('Start Wave!').prop('disabled', false);
        case 'wave':
            return $('.js-actionButton').text('Running...').prop('disabled', true);
    }
    return;
}