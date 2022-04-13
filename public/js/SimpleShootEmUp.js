/*****************\
  Jadon Steinmetz
* Classic shooter, with AI :)
* Not much of an artist.. :(
\*****************/

//First canvas declarations
var canvas = document.getElementById("canvas");
var canvasWidth = 600;
var canvasHeight = 400;
canvas.width = canvasWidth;
canvas.height = canvasHeight;
var c = canvas.getContext("2d");
//Set up arrays to hold world objects
var Projectiles = [
    [], //Enemy projectiles
    [] //Friendly projectiles
];
var World_Objects = [
    [], //World objects
    [] //Enemies
];
//Set up player data
let Bots = []
var Player = new Shooter(true, 100, 5, 3, { x: 50, y: 150 });
var healthBar = document.getElementById("health");
let moveSpeed = 2, framerate = 20; //Framerate used in ms
var gameStarted = true,
    gameOver = false;
let speedOfObjectSpawn = 1500,
    timeAtForObjectSpawn = 0;

/*
 * Shooter()
 * Object that holds information for players and enemies alike
 */
function Shooter(isPlayer, health, damage, velocity, position) {
    this.isPlayer = isPlayer;
    this.velocity = velocity; //Bullet velocity

    if (isPlayer) {
        this.color = "green";
        this.movingUp = false;
        this.movingDown = false;
        this.shooting = false;
        this.size = 20;
        this.width = this.size;
        this.height = this.size;
        this.score = 0;
    } else {
        this.size = 25;
        this.width = 25;
        this.height = 25;
        this.color = "red";
        this.lastShot = 0;
    }

    this.textColor = "black";
    this.maxHealth = health;
    this.health = health;
    this.healthDamage = health;
    this.damage = damage;
    this.x = position.x;
    this.y = position.y;

    //Adds a bullet to the bullet array
    this.shootBullet = function () {
        if (this.isPlayer === false)
            Projectiles[0].push(
                new Bullet({ x: this.x, y: this.y + this.size / 2 }, 3, this.velocity, this.damage)
            );
        else
            Projectiles[1].push(
                new Bullet({ x: this.x, y: this.y + this.size / 2 }, this.damage / 4, this.velocity, this.damage)
            );
    };

    //Activated when a projectile hits this object
    this.hit = function (proj, i, j, z) {
        this.health -= proj.damage;
        this.colorChange();
        if (!this.isPlayer && this.health <= 0) World_Objects[1].splice(z, 1);

        ProjectileAnimation(proj.x, proj.y, i);
        Projectiles[i].splice(j, 1);
    };

    //Activates when the player runs into an obstacle
    this.playerHit = function (obj, z, n) {
        this.health -= obj.healthDamage;
        World_Objects[n].splice(z, 1);
    };

    //Changes the color of text
    this.colorChange = function () {
        if (this.health > this.maxHealth * 0.7) this.textColor = "black";
        else if (this.health > this.maxHealth * 0.4) this.textColor = "orange";
        else this.textColor = "red";
    };
}

/*
 * WorldObstacle()
 * Programming object that holds information for obstacles in game
 */
function WorldObstacle(position, size, health, damage) {
    this.x = position.x;
    this.y = position.y;
    this.width = size.width;
    this.height = size.height;
    this.maxHealth = health;
    this.health = health;
    this.healthDamage = damage;
    this.textColor = "black";
    this.color = "black";

    //Triggered when projectile collision is detected
    this.hit = function (proj, i, j, z) {
        this.health -= proj.damage;
        this.colorChange();
        if (this.health <= 0) World_Objects[0].splice(z, 1);
        ProjectileAnimation(proj.x, proj.y, i);
        Projectiles[i].splice(j, 1);
    };

    this.colorChange = function () {
        if (this.health > this.maxHealth * 0.7) this.textColor = "black";
        else if (this.health > this.maxHealth * 0.4) this.textColor = "orange";
        else this.textColor = "red";
    };
}

/*
 * AddObject()
 * Adds world object. Just makes for cleaner code
 */
function AddObject(health, damage, width, height, x, y) {
    World_Objects[0].push(
        new WorldObstacle(
            { x: x, y: y },
            { width: width, height: height },
            health,
            damage
        )
    );
}
//Testing only
AddObject(100, 250, 50, 200, 550, 0);
/*
 * AddEnemy()
 * Adds enemy. Just makes for cleaner code
 */
function AddEnemy(health, damage, bulletVelocity, x, y) {
    World_Objects[1].push(
        new Shooter(false, health, damage, bulletVelocity, { x: x, y: y })
    );
}
AddEnemy(25, 7, -2, 550, 250);

/*
 * Bullet()
 * Bullet object that stores all the data on the bullet
 */
function Bullet(position, size, velocity, damage) {
    this.x = position.x;
    this.y = position.y;
    this.damage = damage;
    this.size = size;
    this.width = size;
    this.height = size;
    this.velocity = velocity;
}

/*
 * DrawMap()
 * Re-draws the map with all projectiles, obstacles, and player
 */
function DrawMap() {
    c.clearRect(0, 0, canvas.width, canvas.height);

    gameLogic();
    for (let i = 0; i < World_Objects.length; i++) {
        for (let j = 0; j < World_Objects[i].length; j++) {
            if (moveMap(i, j)) continue;
            if (worldCollision(i, j)) continue;
            if (i == 1) makeProjectiles(j); //Creates enemy projectiles
            drawObstacles(i, j);
            projectileCollision(Projectiles[i][j], i, j);
        }
    }
    drawProjectiles(); //Draw projectiles first so it's not drawn over anything
    drawPlayer();
    drawHP();
}

function normalize(value, min, max, newRange, newMin, reverse = false) {
    let normalized = (value - min) / (max - min)
    if (reverse) normalized = 1 - normalized
    normalized *= newRange
    normalized += newMin
    return normalized
}

/*
 * gameLogic()
 * Creates enemies and walls
 */
function gameLogic() {
    if (timeAtForObjectSpawn >= speedOfObjectSpawn)
        timeAtForObjectSpawn = 0;
    else {
        timeAtForObjectSpawn += framerate
        return;
    }

    //Creates enemies
    if (Math.random() < 0.5) {
        let hp = Math.floor(Math.random() * 75) + 25;
        let dmg = 25 / Math.ceil(hp / 25);
        AddEnemy(hp, dmg, normalize(dmg, 6.25, 25, -2.5, -0.5, true), 550, Math.floor(Math.random() * 300));
    } else {
        //Creates walls
        let hp = Math.floor(Math.random() * 200) + 100;
        let dmg = 25 / Math.ceil(hp / 25);
        AddObject(
            hp,
            dmg,
            Math.floor(Math.random() * 35) + 10,
            Math.floor(Math.random() * 75) + 125,
            550,
            Math.floor(Math.random() * 300)
        );
    }
}

/*
 * moveMap()
 * Subset of DrawMap, moves everything to the left so it appears that the player is moving
 */
function moveMap(i, j) {
    World_Objects[i][j].x -= moveSpeed;
    if (World_Objects[i][j].x + World_Objects[i][j].width <= 0) {
        return true;
        World_Objects[i].splice(j, 1);
    } else return false;
}

/*
 * makeProjectiles()
 * Creates enemy projectiles
 */
function makeProjectiles(j) {
    var rate = Math.floor(World_Objects[1][j].damage * 10);
    World_Objects[1][j].lastShot++;

    if (World_Objects[1][j].lastShot >= rate) {
        World_Objects[1][j].lastShot = 0;
        World_Objects[1][j].shootBullet();
    }
}

/*
 * drawProjectiles()
 * Subset of DrawMap, draws all projectiles at their current locations
 */
function drawProjectiles() {
    for (var i = 0; i < Projectiles.length; i++) {
        for (var j = 0; j < Projectiles[i].length; j++) {
            Projectiles[i][j].x -= moveSpeed;
            Projectiles[i][j].x += (Projectiles[i][j].velocity * moveSpeed);
            if (projectileCollision(Projectiles[i][j], i, j)) continue;
            c.beginPath();
            if (i === 0) c.fillStyle = "black";
            else c.fillStyle = "blue";

            c.arc(
                Projectiles[i][j].x,
                Projectiles[i][j].y,
                Projectiles[i][j].size,
                0,
                2 * Math.PI
            );
            c.fill();
        }
    }
}

/*
 * isCollide(a: {x, y, height, width}, b: {x, y, height, width})
 * Used to determine if two objects collided
 */
function isCollide(a, b) {
    return !(
        a.y + a.height < b.y ||
        a.y > b.y + b.height ||
        a.x + a.width < b.x ||
        a.x > b.x + b.width
    );
}

/*
 * projectileCollision()
 * Subset of drawProjectiles(), determines if the projectile has collided with anything
 */
function projectileCollision(proj, i, j) {
    if (proj == undefined) return true;
    let hadCollision = (proj.x > canvasWidth || proj.x < 0);
    //Removes if too far left or right
    if (hadCollision) {
        Projectiles[i].splice(j, 1);
    } else {
        let z;
        //Checks to see if projectile hits any world objects
        for (z = 0; z < World_Objects[0].length; z++)
            if (isCollide(proj, World_Objects[0][z])) {
                hadCollision = true;
                World_Objects[0][z].hit(proj, i, j, z);
                break;
            }

        //Checks to see if projectile is a player-shot or enemy-shot projectile, and if it is, if it hits
        if (!hadCollision) {
            for (z = 0; z < World_Objects[1].length; z++) {
                if (i === 1 && isCollide(proj, World_Objects[1][z])) {
                    World_Objects[1][z].hit(proj, i, j, z);
                    hadCollision = true;
                    break;
                }
            }
        }
        if (!hadCollision && i === 0 && isCollide(proj, Player)) {
            Player.hit(proj, i, j, z);
            hadCollision = true;
        }
    }
    return hadCollision
}

/*
 * worldCollision()
 * Subset of DrawMap, detects collision between world objects and acts accordingly
 */
function worldCollision(i, j) {
    //Checks if player hits world obstacle or enemies
    if (isCollide(Player, World_Objects[i][j])) {
        Player.playerHit(World_Objects[i][j], j, i);
        return true;
    } else return false;
}

/*
 * drawObstacles()
 * Subset of DrawMap, draws all obstacles and enemies at their current locations
 */
function drawObstacles(i, j) {
    //Handles enemy objects
    c.fillStyle = World_Objects[i][j].color;
    c.fillRect(
        World_Objects[i][j].x,
        World_Objects[i][j].y,
        World_Objects[i][j].width,
        World_Objects[i][j].height
    );
}

/*
 * drawPlayer()
 * Subset of DrawMap, draws the player at their current location
 */
function drawPlayer() {
    c.fillStyle = Player.color;
    c.fillRect(Player.x, Player.y, Player.size, Player.size);
}

/*
 * drawHP()
 * Subset of DrawMap, displays HP of players
 */
function drawHP() {
    if (Player.health < 0) Player.health = 0;
    document.getElementById("health").value = Player.health;
}

/*
 * KeyPressedEvent & KeyReleasedEvent
 * Handles player controls for moving and shooting
 */
document.onkeydown = KeyPressedEvent;
document.onkeyup = KeyReleasedEvent;

function KeyPressedEvent(e) {
    var myKey = e.keyCode;

    if (myKey == "38") Player.movingUp = true;
    if (myKey == "40") Player.movingDown = true;
    if (myKey == "32") Player.shootBullet();
}
function KeyReleasedEvent(e) {
    var myKey = e.keyCode;

    if (myKey == "38") Player.movingUp = false;
    if (myKey == "40") Player.movingDown = false;
}

/*
 * ProjectileAnimation
 * Handles animation effects on a separate canvas that overlays original canvas
 * @i represents location in Projectiles array, 0=Enemy, 1=Friendly. For color coding
 * WIP
 */
function ProjectileAnimation(x, y, i) { }

//This is where the magic happens
let overrideText = "";
let gameplayinterval = setInterval(function () {
    if (gameStarted && gameOver == false) {
        if (Player.movingUp) Player.y -= moveSpeed;
        if (Player.movingDown) Player.y += moveSpeed;

        try {
            DrawMap();
        } catch (e) {
            gameOver = true;
            overrideText = "Error";
            console.log(e);
        }
    }

    if (gameOver || Player.health <= 0) {
        clearInterval(gameplayinterval);
        c.font = "30px Arial";
        c.fillStyle = "red";
        c.fillText(
            (overrideText === "" ? "Game Over!" : overrideText),
            canvasWidth / 2,
            canvasHeight / 2
        );
    }
}, framerate);
//Original, 10
