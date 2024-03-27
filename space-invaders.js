const canvas = document.getElementById(".gameCanvas");
ctx = canvas.getContext("2d");
canvas.style.backgroundColor = "#0e0d4f";

const pixelSize = 16;

let score = 0;
let meteorFrequency = 5000;
let meteorDelay = 500;

function drawPixel(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, pixelSize, pixelSize);
}

function erasePixel(x, y) {
    ctx.clearRect(x, y, pixelSize, pixelSize);
}

const ship = {
    width: 5,
    height: 4,
    data: ["00100",
            "01110",
            "11111",
            "10001"],
    color: "#f2ff00",
    x: 23,
    y: 46,
};

class Shot {
    constructor() {
        this.width = 1;
        this.height = 1;
        this.data = ["1"];
        this.color = "#f2ff00";
        this.x = ship.x + 2;
        this.y = ship.y - 1;
    }
}
var shots = [];
var lastShot = Date.now();

class Meteor {
    constructor() {
        this.width = 4;
        this.height = 4;
        this.data = ["0110",
                     "1111",
                     "1111",
                     "0110"];
        this.color = "#ff0000";
        this.x = Math.floor(Math.random() * 47)
        this.y = -4;
    }
}

var meteors = [];
var lastMeteor = Date.now() - 3000;
var meteorTimer = Date.now();

function drawObject(x, y, obj) {
    x *= pixelSize;
    y *= pixelSize;
    for (let i = 0; i < obj.height; i++) {
        for (let j = 0; j < obj.width; j++) {
            if (obj.data[i][j] == "1") drawPixel(x, y, obj.color);
            x += pixelSize;
        }
        x -= obj.width * pixelSize;
        y += pixelSize;
    }
}

function eraseObject(obj) {
    x = obj.x * pixelSize;
    y = obj.y * pixelSize;
    for (let i = 0; i < obj.height; i++) {
        for (let j = 0; j < obj.width; j++) {
            if (obj.data[i][j] == "1") erasePixel(x, y);
            x += pixelSize;
        }
        x -= obj.width * pixelSize;
        y += pixelSize;
    }
}

function moveObject(x, y, obj) {
    eraseObject(obj);
    drawObject(x, y, obj);
    obj.x = x;
    obj.y = y;
}

function shoot() {
    newShot = new Shot();
    shots.push(newShot);
    drawObject(newShot.x, newShot.y, newShot);
}


function handleKeyPress(event) {
    const key = event.key;
    
    if (key === "ArrowRight" && ship.x < 46) {
        moveObject(ship.x+1, ship.y, ship);
    }
    
    if (key === "ArrowLeft" && ship.x > 0) {
        moveObject(ship.x-1, ship.y, ship);
    }
    
    if (key === "ArrowUp" && Date.now() - lastShot > 1000) {
        shoot();
        lastShot = Date.now();
    }
    
}

function detectCollisions(o1, o2) {
    return (o1.x + o1.width > o2.x &&
            o1.x < o2.x + o2.width &&
            o1.y + o1.height > o2.y &&
            o1.y < o2.y + o2.height);
}

function updateCollisions() {
    for (let i = 0; i < meteors.length; i++) {
        if (detectCollisions(meteors[i], ship)) {
            resetGame();
        }
        
        for (let j = 0; j < shots.length; j++) {
            if (detectCollisions(meteors[i], shots[j])) {
                eraseObject(meteors[i]);
                meteors.splice(i, 1);
                i--;
                eraseObject(shots[j]);
                shots.splice(j, 1);
                j--;
                score++;
                updateSpeeds();
                break;
            }
        }

    }
}

function resetGame() {
    ctx.clearRect(0, 0, 816, 816);
    score = 0;
    meteorDelay = 500;
    meteorFrequency = 5000;
    meteors = [];
    shots = [];
    lastMeteor = Date.now();
    meteorTimer = Date.now();
    lastShot = 0;
    drawObject(23, 46, ship);
    ship.x = 23;
    ship.y = 46;
}

function updateSpeeds() {
    if (meteorDelay > 50) meteorDelay -= 10;
    if (meteorFrequency > 1000) meteorFrequency -= 100;
}

function update() {
    for (let i = 0; i < shots.length; i++) {
        moveObject(shots[i].x, shots[i].y - 1, shots[i]);
        if (shots[i].y < 0) {
            eraseObject(shots[i]);
            shots.splice(i, 1);
            i--;
        }
    }

    if (Date.now() - lastMeteor > meteorFrequency) {
        newMeteor = new Meteor();
        drawObject(newMeteor.x, newMeteor.y, newMeteor);
        meteors.push(newMeteor);
        lastMeteor = Date.now();
    }

    if (Date.now() - meteorTimer > meteorDelay) {
        for (let i = 0; i < meteors.length; i++) {
            moveObject(meteors[i].x, meteors[i].y + 1, meteors[i]);
            if (meteors[i].y > 51) {
                eraseObject(meteors[i]);
                meteors.splice(i, 1);
                i--;
            }
        }
        meteorTimer = Date.now();
    }

    updateCollisions();
    document.querySelector(".score").innerHTML = score;
}

setInterval(update, 100);

drawObject(23, 46, ship);
document.addEventListener("keydown", handleKeyPress);