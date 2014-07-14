var state = new State();

//this triggers when page has finished loading
$(function () {
    initializeGame();
    startLevel(level1);
    updateInformation();
    state.deck = testDeck;
    initializeCardArea(state);
    $('.js-edit').on('click', toggleEditing);
    $('.js-play').on('click', startWave);
    $('.js-fastForward').on('click', changeSpeed);
    addTimelineInteractions(state);
});

function startGame() {
    dealCard(state);
    drawGrid(game.backgroundContext, state.mapGrid);
    drawPaths(state, game.pathContext);
    setInterval(mainLoop, frameLength);
    var drawingPath = false;
    var drawingTiles = false;
    $('.js-mapContainer').on('mousedown', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var x = event.pageX - $('.js-mapContainer').offset().left;
        var y = event.pageY - $('.js-mapContainer').offset().top - 2;
        var tileX = Math.floor(x / 30);
        var tileY = Math.floor(y / 30);
        if (state.editingMap) {
            setTile(state.mapGrid, tileX, tileY, state.brush);
            drawingTiles = true;
        } else if (state.step == 'cards') {
            drawingPath = true;
            //clicking on a nest restarts the path
            if (getGridValue(state.mapGrid, tileX, tileY) == 'N') {
                state.paths[state.selectedPath].points = [[tileX, tileY]];
                state.paths[state.selectedPath].complete = false;
            } else if (state.mapGrid[tileY][tileX].brush) {
                state.selectedElement = state.mapGrid[tileY][tileX];
            } else {
                state.selectedElement = null;
                editPath(state, tileX, tileY);
            }
        }
    });
    $(document).on('mousemove', function (event) {
        var x = event.pageX - $('.js-mapContainer').offset().left;
        var y = event.pageY - $('.js-mapContainer').offset().top - 2;
        var tileX = Math.floor(x / 30);
        var tileY = Math.floor(y / 30);
        if (drawingTiles && inGrid(state.mapGrid, tileX, tileY)) {
            setTile(state.mapGrid, tileX, tileY, state.brush);
        }
        if (!drawingPath) {
            return;
        }
        if (tileX < 0 || tileY < 0 || tileX >= 15 || tileY >= 15) {
            return;
        }
        if (!state.editingMap) {
            editPath(state, tileX, tileY);
        }
    });
    $(document).on('mouseup', function (event) {
        drawingPath = false;
        drawingTiles= false;
    });
    $('.exportMap').on('click', function (event) {
        var exportRows = [];
        $.each(state.mapGrid, function (i, row) {
            exportRows.push('"' + row.join('') + '"');
        });
        var result = "[\n" + exportRows.join(",\n") + "];\n";
        $.each(state.paths, function (i, path) {
            result += JSON.stringify(path.points) + ";\n";
        });
        $('.output').val(result);
    });
}
function setTile(grid, x, y, brush) {
    if (brush == 'W' && (grid[y][x] == 'R' || grid[y][x] == 'B')) {
        grid[y][x] = 'B'
    } else if (brush == 'R' && (grid[y][x] == 'W' || grid[y][x] == 'B')) {
        grid[y][x] = 'B'
    } else if (brush == 'C') {
        grid[y][x] = new City();
    } else if (brush == 'M') {
        grid[y][x] = new Mine();
    } else if (brush == 'F') {
        grid[y][x] = new Farm();
    } else if (brush == 'T') {
        grid[y][x] = getRandomTower();
    } else {
        grid[y][x] = brush;
    }
    drawGrid(game.backgroundContext, grid);
}

function toggleEditing() {
    state.editingMap = !state.editingMap;
    $('.js-edit').text(state.editingMap ? 'Stop Editing' : 'Start Editing');
    $('.js-mapEditor').toggle(state.editingMap);
    $('.js-cardContainer').toggle(!state.editingMap);
}

var frameLength = 20;
function mainLoop() {
    var tileSize = defaultTileSize;
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
                //move the animal each frame after it spawns
                if (state.waveTime > animal.spawnTime) {
                    animal.distance += 10 * animal.speed * frameLength / 1000;
                    var tileValue = state.mapGrid[animal.tileY][animal.tileX];
                    if (tileValue != animal.lastTile) {
                        if (tileValue.brush == 'C') {
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
                        if (tileValue.brush == 'M') {
                            /** @type Mine */
                            var mine = tileValue;
                            if (animal.burden < animal.carry && mine.waveGold > 0) {
                                mine.waveGold--;
                                state.gold++;
                                animal.burden++;
                            }
                        }
                        if (tileValue.brush == 'F') {
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
                endWave();
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
                    if (animal.finished || animal.dead) {
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
        drawBrush(game.animalContext, mine.mapX, mine.mapY, 'M');
    }
    //humans get calories from mines that the animals failed to steal
    for (var i = 0; i < state.farms.length; i++) {
        /** @type Farm */
        var farm = state.farms[i];
        drawBrush(game.animalContext, farm.mapX, farm.mapY, 'F');
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
}

function readyToFire(tower) {
    return state.waveTime >= tower.lastTimeFired + 1000 / tower.attacksPerSecond;
}

function inTowerRange(tower, animal) {
    return tower.range * tower.range >= distanceSquared(tower.mapX, tower.mapY, animal.mapX, animal.mapY);
}

function startWave() {
    if (state.step == 'wave') {
        return;
    }
    state.animals = getAnimals(state);
    var invalidPath = false;
    $.each(state.animals, function (index, element) {
        /** @type Animal */
        var animal = element;
        animal.dead = false;
        animal.finished = false;
        animal.distance = 0;
        animal.lastTile = null;
        animal.burden = 0;
        if (!animal.path.complete) {
            state.selectedPath = state.paths.indexOf(animal.path);
            invalidPath = true;
            return false;
        }
        return true;
    });
    if (invalidPath) {
        return;
    }
    for (var i = 0; i < state.paths.length; i++) {
        //if this path is incomplete but also empty, just erase it at the start of the wave
        if (!state.paths[i].complete) {
            state.paths[i].points = [];
        }
    }
    state.step = 'wave';
    //discard remainign dealt cards at start of wave
    while (state.dealtCards.length) {
        /** @type Card */
        var card = state.dealtCards.pop();
        if (card) {
            discardCard(state, card);
        }
    }
}

function endWave() {
    //clear all wave modifiers at the end of the wave
    state.waveModifiers = {};
    state.waveNumber++;
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
    state.step = 'cards';
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
    state.calories += state.currentLevel.caloriesPerWave;
    state.waveTime = 0;
    for (var towerIndex = 0; towerIndex < state.towers.length; towerIndex++) {
        /** @type Tower */
        var tower = state.towers[towerIndex];
        tower.lastTimeFired = -2000;
    }
    dealCard(state);
    updateInformation();
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
    $('.js-myCalories').text('Calories: ' + state.calories);
    $('.js-myGold').text('Gold: ' + state.gold);
    if (state.selectedElement) {
        /** @type context */
        var context = $('.js-details .js-cardCanvas')[0].getContext('2d');
        context.clearRect(0, 0, 30, 30);
        $('.js-details').show();
        switch (state.selectedElement.brush) {
            case 'C':
                /** @type City */
                var city = state.selectedElement;
                drawCity(context, 0, 0, city);
                $('.js-details .js-title').html('City');
                $('.js-details .js-description').html('Pop. ' + city.population.toFixed(1) + 'K <br /> Prod. ' + city.productivity);
                break;
            case 'T':
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
            case 'F':
                /** @type Farm */
                var farm = state.selectedElement;
                drawBrush(context, 0, 0, 'F');
                $('.js-details .js-title').html('Calorie Farm');
                $('.js-details .js-description').html('Cal. ' + farm.waveCalories + ' / ' + farm.calories);
                break;
            case 'M':
                /** @type Mine */
                var mine = state.selectedElement;
                drawBrush(context, 0, 0, 'M');
                $('.js-details .js-title').html('Gold Mine');
                $('.js-details .js-description').html('Gold ' + mine.waveGold + ' / ' + mine.gold);
                break;
            case 'A':
                /** @type Animal */
                var animal = state.selectedElement;
                if (animal.dead && state.step != 'wave') {
                    state.selectedElement = null;
                }
                drawAnimalSprite(context, 0, 0, animal, 0, 0);
                $('.js-details .js-title').html(properCase(animal.type.single));
                var details = [
                    'H: ' + animal.currentHealth + '/' + animal.health,
                    'S: ' + animal.speed + ' C: ' + animal.carry,
                    'D: ' + animal.damage + ' A: ' + animal.armor,
                ]
                $('.js-details .js-description').html(details.join('<br />'));
        }
    } else {
        $('.js-details').hide();
    }
}

function properCase(string) {
    return string.charAt(0).toUpperCase() + string.substring(1);
}