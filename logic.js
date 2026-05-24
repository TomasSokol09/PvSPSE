const backgroundSong = new Audio("backgroundSong.mp3");
backgroundSong.loop = true;
const sunCollectSound = new Audio("sunCollectSound.mp3");
const plocha = document.getElementById('grid');
const RADEK = 5;
const SLOUPEC = 9;
let sunCount = 150;

function updateSunDisplay() {
    document.getElementById('sunCounter').innerHTML = '<img src="sun.png" alt="sun" style="width:30px; height:30px">' + sunCount;
}

const plantCosts = {
    'sunflower.png': 50,
    'wallnut.png': 50,
    'peashooter.png': 100,
    'potatomine.png': 25,
    'snowpeashooter.png': 175
};

for (let r = 0; r < RADEK; r++) {
    for (let c = 0; c < SLOUPEC; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        plocha.appendChild(cell);
    }
}

let selected = null;
let shoveling = false;

function deselect() {
    selected = null;
    shoveling = false;
    document.querySelectorAll('.shop-item').forEach(i => i.classList.remove('active'));
    document.getElementById('shovel').classList.remove('active');
}

document.querySelectorAll('.shop-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        if (item.classList.contains('active')) {
            deselect();
        } else {
            deselect();
            selected = item.src;
            item.classList.add('active');
        }
    });
});

document.getElementById('shovel').addEventListener('click', (e) => {
    e.stopPropagation();
    if (shoveling) {
        deselect();
    } else {
        shoveling = true;
        document.getElementById('shovel').classList.add('active');
    }
});

plocha.addEventListener('click', (e) => {
    const cell = e.target.closest('.cell');
    if (!cell) return;
    if (!plocha.contains(cell)) return;

    if (shoveling) {
        const plantImg = cell.querySelector('img');
        if (plantImg) {
            const filename = plantImg.src.split('/').pop();
            const cost = plantCosts[filename] ?? 0;
            sunCount += cost / 2;
            updateSunDisplay();
        }
            if (cell.shootInterval) { clearInterval(cell.shootInterval); cell.shootInterval = null; }
            if (cell.sunInterval) { clearInterval(cell.sunInterval); cell.sunInterval = null; }
            cell.innerHTML = '';

    } else if (selected) {
        if (cell.querySelector('img')) return;

        const cost = plantCosts[selected.split('/').pop()] ?? 0;
        if (sunCount < cost) return;

        sunCount -= cost;
        updateSunDisplay();

        const placed = document.createElement('img');
        placed.src = selected;
        placed.style.width = '100%';
        placed.style.height = '100%';

        const plantHP = { 'sunflower.png': 3, 'wallnut.png': 10, 'peashooter.png': 5, 'potatomine.png': 1, 'potatomineinground.png': 1, 'snowpeashooter.png': 5};
        cell.dataset.hp = plantHP[selected.split('/').pop()] ?? 3;

        cell.appendChild(placed);

        if (placed.src.includes('sunflower.png')) {
            sunFlowerSunSpawn(cell);
        }

        if (placed.src.includes('peashooter.png')) {
            peaShooterStartShooting(cell);
        }

        if (placed.src.includes('snowpeashooter.png')) {
            snowPeaShooterStartShooting(cell);
        }

        if (placed.src.includes('potatomine.png')) {
            placed.src = 'potatomineinground.png';
            setTimeout(() => {
                if (cell.querySelector('img')) {
                    placed.src = 'potatomine.png';
                }
            }, 10000); // becomes active after 3 seconds
        }
    }
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('#grid') && !e.target.closest('#shop')) {
        deselect();
    }
});

function startSunSpawning() {
    setInterval(() => {
        const sun = document.createElement('img');
        sun.src = 'sun.png';
        sun.style.position = 'fixed';
        sun.style.width = '5vw';
        sun.style.height = '5vw';
        sun.style.zIndex = '20';
        sun.style.cursor = 'pointer';

        const shopWidth = document.getElementById('shop').getBoundingClientRect().right;
        const randomX = shopWidth + Math.random() * (window.innerWidth - shopWidth - 80);
        sun.style.left = randomX + 'px';
        sun.style.top = '0px';
        document.body.appendChild(sun);

        const fall = setInterval(() => {
            sun.style.top = sun.offsetTop + 1 + 'px';
            if (sun.offsetTop > window.innerHeight) {
                clearInterval(fall);
                sun.remove();
            }
        }, 16);

        sun.addEventListener('mouseenter', () => {
            clearInterval(fall);
            sunCollectSound.play();
            sun.remove();
            sunCount += 25;
            updateSunDisplay();
        });
    }, 8000);
}

document.getElementById('start-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('start-screen').remove();
    backgroundSong.play();
    startGame();
    startSunSpawning();
});