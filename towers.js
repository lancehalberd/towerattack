
function Tower() {
    /** @type {TowerType} */
    this.type = null;
    this.baseDamage = 5;
    this.damageRange = 5;
    this.range = 90;
    this.attacksPerSecond = 1;
    this.brush = 'T';
    this.mapX = 0;
    this.mapY = 0;
    this.angle = Math.random() * 2 * Math.PI;
    this.targetAngle = Math.random() * 2 * Math.PI;
    /** @type Animal */
    this.currentTarget = null;
    this.lastTimeFired = -2000;
}

function TowerType() {
    this.baseDamage = 5;
    this.damageRange = 5;
    this.range = 90;
    this.attacksPerSecond = 1;
    this.spriteIndex = 0;
}
/**
 * @param {Object} data
 */
function createTowerType(data) {
    var type = new TowerType();
    for (var i in data) {
        if (data.hasOwnProperty(i)) {
            type[i] = data[i];
        }
    }
    return type;
}

function getRandomTower() {
    var tower = new Tower();
    tower.type = Random.element(towerTypes);
    tower.baseDamage = tower.type.baseDamage;
    tower.damageRange = tower.type.damageRange;
    tower.range = tower.type.range;
    tower.attacksPerSecond = tower.type.attacksPerSecond;
    return tower;
}

var towerTypes = {
    'basic': createTowerType({'name': 'Turret', 'baseDamage': 5, 'damageRange': 5, 'range': 90, 'attacksPerSecond': 1, 'spriteIndex': 1}),
    'lightning': createTowerType({'name': 'Laser', 'baseDamage': 2, 'damageRange': 4, 'range': 80, 'attacksPerSecond': 3, 'spriteIndex': 2}),
    'artillery': createTowerType({'name': 'Artillery', 'baseDamage': 12, 'damageRange': 6, 'range': 150, 'attacksPerSecond': .5, 'spriteIndex': 0}),
};

function readyToFire(tower) {
    return state.waveTime >= tower.lastTimeFired + 1000 / tower.attacksPerSecond;
}

function inTowerRange(tower, animal) {
    return tower.range * tower.range >= distanceSquared(tower.mapX, tower.mapY, animal.mapX, animal.mapY);
}

function Projectile() {
    /** @type TileSource */
    this.tileSource = null;
    /** @type Animal */
    this.target = null;
    this.targetX = 0;
    this.targetY = 0;
    /** @type Tower */
    this.tower = null;
    this.mapX = 0;
    this.mapY = 0;
    this.percent = 0;
    this.speed = .1;
    this.angle = 0;
}

/**
 * @param {Tower} tower
 * @param {Animal} animal
 */
function shootProjectile(tower, animal) {
    tower.lastTimeFired = state.waveTime;
    var projectile = new Projectile();
    projectile.tileSource = new TileSource(game.images.towers, 2, tower.type.spriteIndex);
    projectile.target = animal;
    projectile.targetX = animal.mapX;
    projectile.targetY = animal.mapY;
    projectile.tower = tower;
    projectile.mapX = tower.mapX;
    projectile.mapY = tower.mapY;
    state.projectiles.push(projectile);
}

function updateAllProjectiles() {
    for (var i = 0; i < state.projectiles.length; i++) {
        /** @type Projectile */
        var projectile = state.projectiles[i];
        updateProjectile(projectile);
        //damage and remove projectile when it reaches the target
        if (projectile.percent >= 1) {
            var damage = Math.max(0, projectile.tower.baseDamage - projectile.target.armor) + Math.floor(Math.random() * projectile.tower.damageRange);
            damageAnimal(projectile.target, damage);
            state.projectiles.splice(i--, 1);
        }
    }
}

/**
 * @param {Projectile} projectile
 */
function updateProjectile(projectile) {
    projectile.percent += projectile.speed;
    if (!projectile.target.dead && !projectile.target.finished) {
        projectile.targetX = projectile.target.mapX;
        projectile.targetY = projectile.target.mapY;
    }
    projectile.mapX = projectile.tower.mapX + projectile.percent * (projectile.targetX - projectile.tower.mapX);
    projectile.mapY = projectile.tower.mapY + projectile.percent * (projectile.targetY - projectile.tower.mapY);
    projectile.angle = atan2(projectile.tower.mapX, projectile.tower.mapY, projectile.targetX, projectile.targetY);
}

function drawProjectiles(context) {
    for (var i = 0; i < state.projectiles.length; i++) {
        /** @type Projectile */
        var projectile = state.projectiles[i];
        drawTileRotated(context, projectile.mapX, projectile.mapY, projectile.tileSource, projectile.angle);
    }
}

/**
 * Draws the towers to the context
 *
 * @param {context} context
 */
function drawTowers(context) {
    $.each(state.towers, function (index, tower) {
        drawTower(context, tower.mapX, tower.mapY, tower.angle, tower);
        if (tower == state.selectedElement) {
            context.strokeStyle = "#FFF";
            context.beginPath();
            context.arc(tower.mapX + 15, tower.mapY + 15, tower.range - 7, 0, 2*Math.PI);
            context.stroke();
        }
    });
}

/**
 * Draws the coty to the given context
 *
 * @param {context} context
 * @param {Number} x
 * @param {Number} y
 * @param {Number} angle
 * @param {Tower} tower
 */
function drawTower(context, x, y, angle, tower) {
    var frame = readyToFire(tower) ? 1 : 0;
    drawTileRotated(context, x, y, new TileSource(game.images.towers, frame, tower.type.spriteIndex), angle);
}
