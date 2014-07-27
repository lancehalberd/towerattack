function initializeLevelScene() {
    var draggingMouse = false;
    $(document).on('mousedown', function (event) {
        if (state.scene != 'level') {
            return;
        }
        //don't apply generic mouse down handler to button clicks
        if ($(event.target).is('button')) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        var tileX = getTileX(event.pageX);
        var tileY = getTileY(event.pageY);
        //set that we should unselect when the next click event fires.
        //elements that should not trigger unselect either need to set this
        //to false if they happen after this even, or call stopPropogation
        //to prevent this logic from getting called
        state.unselectElement = true;
        if (tileX < 0 || tileY < 0 || tileX >= 17 || tileY >= 17) {
            return;
        }
        draggingMouse = true;
        if (state.editingPath) {
            handleEditPathClick(tileX, tileY);
            return;
        }
        if (state.editingMap) {
            setTile(state.mapGrid, tileX, tileY, state.brush);
            return;
        }
        if (state.mapGrid[tileY][tileX].classType) {
            selectElement(state.mapGrid[tileY][tileX]);
        }
    });
    $(document).on('mousemove', function (event) {
        if (state.scene != 'level') {
            return;
        }
        if (!draggingMouse) {
            return;
        }
        var tileX = getTileX(event.pageX);
        var tileY = getTileY(event.pageY);
        if (tileX < 0 || tileY < 0 || tileX >= 17 || tileY >= 17) {
            return;
        }
        if (state.editingPath) {
            handleEditPathDrag(tileX, tileY);
            return;
        }
        if (state.editingMap && inGrid(state.mapGrid, tileX, tileY)) {
            setTile(state.mapGrid, tileX, tileY, state.brush);
        }
    });
    $(document).on('mouseup', function (event) {
        if (state.scene != 'level') {
            return;
        }
        if (draggingMouse && state.editingPath && state.paths[state.selectedPath].complete) {
            togglePathEditing();
            hideHelp('editPathDetails', true);
        }
        draggingMouse = false;
    });
    $('.js-editPath').on('click', togglePathEditing);
    $('.js-actionButton').on('click', performAction);
    $('.js-fastForward').on('click', changeSpeed);
    $('.js-exitLevel').on('click', returnToMap);
    addTimelineInteractions(state);
    $('body').on('click', '.js-popupHelp', function () {
        $(this).remove();
        state.unselectElement = false;
    });
    $('body').on('click', '.details', function () {
        state.unselectElement = false;
    });
     $('.js-overlay').on('click', function () {
        $('.js-overlay').hide();
        if (dismissOverlayFunction) {
            dismissOverlayFunction();
        }
    });
    addEditEventHandlers();
    $('body').on('keydown', function (event) {
        if (state.scene != 'level') {
            return;
        }
        if (String.fromCharCode(event.which) == 'E') {
            $('.js-editingControls').show();
        }
    });
    initializeCardArea();
    $(document).on('click', function (event) {
        if (state.unselectElement) {
            state.selectedElement = null;
        }
    });
}
function levelSceneMainLoop () {
    //update the model for N frames
    for (var frame = 0; frame < state.waveSpeed; frame++) {
        state.gameTime += frameLength;
        if (state.step == 'wave') {
            state.waveTime += frameLength;
            var finished = true;
            for (var i = 0; i < state.animals.length; i++) {
                /** @type Animal */
                var animal = state.animals[i];
                if (animal.finished) {
                    continue;
                }
                finished = false;
                //do nothing if the animal isn't spawned yet
                if (state.waveTime < animal.spawnTime) {
                    continue;
                }
                animal.spawned = true;
                //move the animal each frame after it spawns
                if (state.waveTime > animal.spawnTime) {
                    animal.distance += 10 * animal.speed * frameLength / 1000;
                    var tileValue = state.mapGrid[animal.tileY][animal.tileX];
                    if (tileValue != animal.lastTile) {
                        if (tileValue.classType == 'City') {
                            /** @type City */
                            var city = tileValue;
                            if (city.population < animal.damage) {
                                state.population -= city.population;
                                city.population = 0;
                            } else {
                                city.population -= animal.damage;
                                state.population -= animal.damage;
                            }
                        }
                        if (tileValue.classType == 'Mine') {
                            /** @type Mine */
                            var mine = tileValue;
                            if (animal.burden < animal.carry && mine.waveGold > 0) {
                                mine.waveGold--;
                                state.gold++;
                                animal.burden++;
                            }
                        }
                        if (tileValue.classType == 'Farm') {
                            /** @type Farm */
                            var farm = tileValue;
                            if (animal.burden < animal.carry && farm.waveCalories > 0) {
                                farm.waveCalories--;
                                state.calories++;
                                animal.burden++;
                            }
                        }
                        animal.lastTile = tileValue;
                    }
                }
                updateAnimalPosition(animal);
            }
            if (finished) {
                endWaveStep();
            }
        }
        for (var towerIndex = 0; towerIndex < state.towers.length; towerIndex++) {
            /** @type Tower */
            var tower = state.towers[towerIndex];
            if (!tower.currentTarget || !inTowerRange(tower, tower.currentTarget) || tower.currentTarget.dead || tower.currentTarget.finished) {
                tower.currentTarget = null;
                for (var animalIndex = 0; animalIndex < state.animals.length; animalIndex++) {
                    /** @type Animal */
                    var animal = state.animals[animalIndex];
                    if (!animal.spawned || animal.finished || animal.dead) {
                        continue;
                    }
                    if (inTowerRange(tower, animal)) {
                        tower.currentTarget = animal;
                        break;
                    }
                }
            }
            if (tower.currentTarget) {
                /** @type Animal */
                var animal = tower.currentTarget;
                tower.targetAngle = atan2(tower.mapX, tower.mapY, animal.mapX, animal.mapY);
                //console.log([state.waveTime,tower.lastTimeFired + 1000 / tower.attacksPerSecond]);
                if (readyToFire(tower)) {
                    shootProjectile(tower, animal);
                }
            }
            var newAngle = (tower.targetAngle + tower.angle) / 2;
            if (absoluteAngleSize(tower.angle - newAngle) > absoluteAngleSize(tower.angle - (newAngle + Math.PI))) {
                newAngle += Math.PI;
            }
            tower.angle = newAngle;
        }
        updateAllProjectiles();
    }
    drawLevelScene(false);
}

function drawLevelScene(redrawBackground) {
    if (redrawBackground) {
        drawGrid(game.backgroundContext, state.mapGrid);
    }
    //draw the current state
    game.animalContext.clearRect(0, 0, 510, 510);
    drawTimeline(state);
    drawPaths(state, game.pathContext);
    //structures are drawn underneath the animals, but on the same layer
    drawCities(game.animalContext);
    drawTowers(game.animalContext);
    for (var i = 0; i < state.mines.length; i++) {
        /** @type Mine */
        var mine = state.mines[i];
        drawMine(game.animalContext, mine.mapX, mine.mapY);
    }
    for (var i = 0; i < state.farms.length; i++) {
        /** @type Farm */
        var farm = state.farms[i];
        drawFarm(game.animalContext, farm.mapX, farm.mapY);
    }
    for (var i = 0; i < state.nests.length; i++) {
        /** @type Nest */
        var nest = state.nests[i];
        drawNest(game.animalContext, nest.mapX, nest.mapY);
    }
    if (state.step == 'wave') {
        for (var i = 0; i < state.animals.length; i++) {
            /** @type Animal */
            var animal = state.animals[i];
            if (animal.finished || state.waveTime < animal.spawnTime) {
                continue;
            }
            drawAnimalSprite(game.animalContext, animal.mapX, animal.mapY, animal, state.waveTime, animal.angle);
            drawAnimalHealth(game.animalContext, animal, animal.mapX, animal.mapY);
        }
    }
    drawProjectiles(game.animalContext);
    updateInformation();
    if (state.lastSelectedElement != state.selectedElement) {
        state.lastSelectedElement = state.selectedElement;
        updateActionButton();
        if (!state.selectedElement || state.selectedElement.classType != 'Ability') {
            hideHelp('useAbility');
            hideHelp('insufficientCalories');
            hideHelp('calories');
        }
    }
}

function getTileX(pageX) {
    return Math.floor((pageX - $('.js-mapContainer').offset().left) / 30) + 1;
}
function getTileY(pageY) {
    return Math.floor((pageY - $('.js-mapContainer').offset().top - 2) / 30) + 1;
}

function changeSpeed() {
    state.waveSpeed *= 2;
    if (state.waveSpeed > 8) {
        state.waveSpeed = 1;
    }
    $('.js-fastForward').text('x ' + state.waveSpeed);
}

function updateInformation() {
    $('.js-levelName').text(state.currentLevel.name);
    $('.js-population').text('Population: ' + state.population.toFixed(1) + 'K');
    $('.js-humanGold').text('Gold: ' + state.humanGold);
    $('.js-wavesLeft').text('Waves left: ' + (state.waveLimit - state.waveNumber));
    $('.js-myCalories').text('Calories: ' + state.calories);
    $('.js-myGold').text('Gold: ' + state.gold);
    if (state.selectedElement) {
        /** @type context */
        var context = $('.js-details .js-cardCanvas')[0].getContext('2d');
        context.clearRect(0, 0, 30, 30);
        $('.js-details').show();
        $('.js-details .js-cost').hide();
        $('.js-details .js-amount').hide();
        $('.js-details .js-ability').hide();
        $('.js-details .js-cardCanvas').show();
        switch (state.selectedElement.classType) {
            case 'City':
                /** @type City */
                var city = state.selectedElement;
                drawCity(context, 0, 0, city);
                $('.js-details .js-title').html('City');
                $('.js-details .js-description').html('Pop. ' + city.population.toFixed(1) + 'K <br /> Prod. ' + city.productivity);
                break;
            case 'Tower':
                /** @type Tower */
                var tower = state.selectedElement;
                drawTower(context, 0, 0, 0, tower);
                $('.js-details .js-title').html(tower.type.name);
                var details = [
                    'Attack ' + tower.baseDamage + '-' + (tower.baseDamage +  tower.damageRange),
                    'Speed ' + tower.attacksPerSecond.toFixed(1)
                ]
                $('.js-details .js-description').html(details.join('<br />'));
                break;
            case 'Farm':
                /** @type Farm */
                var farm = state.selectedElement;
                drawFarm(context, 0, 0);
                $('.js-details .js-title').html('Calorie Farm');
                $('.js-details .js-description').html('Cal. ' + farm.waveCalories + ' / ' + farm.calories);
                break;
            case 'Mine':
                /** @type Mine */
                var mine = state.selectedElement;
                drawMine(context, 0, 0);
                $('.js-details .js-title').html('Gold Mine');
                $('.js-details .js-description').html('Gold ' + mine.waveGold + ' / ' + mine.gold);
                break;
            case 'Nest':
                /** @type Nest */
                var nest = state.selectedElement;
                drawNest(context, 0, 0);
                $('.js-details .js-title').html('Nest');
                $('.js-details .js-description').html('Animal paths must start and end on nests.');
                break;
            case 'Animal':
                /** @type Animal */
                var animal = state.selectedElement;
                if (animal.dead && state.step != 'wave') {
                    state.selectedElement = null;
                }
                drawAnimalSprite(context, 0, 0, animal, 0, 0);
                $('.js-details .js-title').html(properCase(animal.type.single));
                $('.js-details .js-description').html(getAnimalDetailsMarkup(animal));
                break;
            case 'Ability':
                /** @type Ability */
                var ability = state.selectedElement;
                $('.js-details .js-ability').show().css('background-position', -(180 + 70 * ability.imageColumn)+'px '+ -(40 * ability.imageRow) + 'px');
                $('.js-details .js-cardCanvas').hide();
                $('.js-details .js-title').html(ability.name);
                $('.js-details .js-cost').text(ability.cost).show();
                if (ability.data.amount) {
                    $('.js-details .js-amount').html('&#215;' + ability.data.amount).show();
                }
                context.clearRect(0, 0, 30, 30);
                $('.js-details .js-description').html(getAbilityDetailsMarkup(ability, state.waveNumber));
        }
    } else {
        $('.js-details').hide();
    }
}
