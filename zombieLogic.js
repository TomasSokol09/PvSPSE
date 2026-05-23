const potatoMineExplosionSound = new Audio("potatoMineExplosionSound.mp3");
const zombieEatingSound = new Audio("zombieEatingSound.mp3");
zombieEatingSound.loop = true;

function startGame() {
    let spawnInterval = 10000;
    let gargantuarSpawnInterval = 10000;
    let eatingCount = 0; // ← moved here

    setInterval(() => {
        spawnInterval = Math.max(2000, spawnInterval - 300);
    }, 3000);

    setTimeout(() => {
        setInterval(() => {
            gargantuarSpawnInterval = Math.max(3000, gargantuarSpawnInterval - 300);
        }, 3000);
    }, 30000);

    function spawnZombie() {
        const zombie = document.createElement('img');
        zombie.className = 'enemy';
        zombie.src = 'zombie.png';
        zombie.dataset.hp = 4;
        zombie.style.position = 'fixed';
        zombie.style.width = '9vw';
        zombie.style.height = '16vh';
        zombie.style.zIndex = '10';

        const randomRow = Math.floor(Math.random() * RADEK);
        zombie.dataset.row = randomRow;
        const cell = document.querySelector(`.cell[data-row="${randomRow}"]`);
        const rect = cell.getBoundingClientRect();

        zombie.style.top = rect.top + 'px';
        zombie.style.left = window.innerWidth + 'px';
        document.body.appendChild(zombie);

        const walk = setInterval(() => {
            if (!document.body.contains(zombie) || zombie.dataset.hp <= 0) { clearInterval(walk); return; }

            document.querySelectorAll('.cell').forEach(cell => {
                const plant = cell.querySelector('img');
                if (!plant) return;

                const cellRect = cell.getBoundingClientRect();
                const zombieRect = zombie.getBoundingClientRect();
                const plantRect = plant.getBoundingClientRect();
                if (Math.abs(cellRect.top - zombieRect.top) > 50) return;

                const hit = zombieRect.left < plantRect.right &&
                    zombieRect.right > plantRect.left &&
                    zombieRect.top < plantRect.bottom &&
                    zombieRect.bottom > plantRect.top;

                if (hit && !zombie.dataset.eating) {
                    const plantImg = cell.querySelector('img');

                    if (plantImg && plantImg.src.includes('potatomine.png')) {
                        cell.innerHTML = '';
                        const explosion = document.createElement('img');
                        explosion.src = 'potatomineexplosion.png';
                        explosion.style.position = 'fixed';
                        explosion.style.width = '10vw';
                        explosion.style.height = '10vw';
                        explosion.style.zIndex = '50';
                        const cellRect = cell.getBoundingClientRect();
                        explosion.style.left = (cellRect.left - cellRect.width / 2) + 'px';
                        explosion.style.top = (cellRect.top - cellRect.height / 2) + 'px';
                        document.body.appendChild(explosion);
                        setTimeout(() => explosion.remove(), 500);
                        potatoMineExplosionSound.play();
                        document.querySelectorAll('.enemy').forEach(enemy => {
                            if (enemy.dataset.row !== cell.dataset.row) return;
                            const enemyRect = enemy.getBoundingClientRect();
                            const cellRect = cell.getBoundingClientRect();
                            if (enemyRect.left < cellRect.right + cellRect.width &&
                                enemyRect.right > cellRect.left - cellRect.width) {
                                enemy.dataset.hp = 0;
                                setTimeout(() => enemy.remove(), 0);
                            }
                        });
                        return;
                    }

                    zombie.dataset.eating = 'true';
                    eatingCount++;
                    if (eatingCount === 1) zombieEatingSound.play();

                    const eatInterval = setInterval(() => {
                        if (!document.body.contains(zombie)) {
                            clearInterval(eatInterval);
                            eatingCount--;
                            if (eatingCount <= 0) { eatingCount = 0; zombieEatingSound.pause(); zombieEatingSound.currentTime = 0; }
                            else if (zombieEatingSound.paused) zombieEatingSound.play();
                            delete zombie.dataset.eating;
                            return;
                        }

                        const plant = cell.querySelector('img');
                        if (!plant) {
                            clearInterval(eatInterval);
                            eatingCount--;
                            if (eatingCount <= 0) { eatingCount = 0; zombieEatingSound.pause(); zombieEatingSound.currentTime = 0; }
                            else if (zombieEatingSound.paused) zombieEatingSound.play();
                            delete zombie.dataset.eating;
                            return;
                        }

                        cell.dataset.hp = (parseInt(cell.dataset.hp) || 3) - 1;
                        if (cell.dataset.hp <= 0) {
                            if (cell.shootInterval) { clearInterval(cell.shootInterval); cell.shootInterval = null; }
                            if (cell.sunInterval) { clearInterval(cell.sunInterval); cell.sunInterval = null; }
                            cell.innerHTML = '';
                            cell.dataset.hp = 3;
                            clearInterval(eatInterval);
                            eatingCount--;
                            if (eatingCount <= 0) { eatingCount = 0; zombieEatingSound.pause(); zombieEatingSound.currentTime = 0; }
                            else if (zombieEatingSound.paused) zombieEatingSound.play();
                            delete zombie.dataset.eating;
                        }
                    }, 1500);
                }
            });

            if (!zombie.dataset.eating) {
                zombie.style.left = zombie.offsetLeft - 1 + 'px';
            }

            if (zombie.offsetLeft < -100) { clearInterval(walk); zombie.remove(); return; }
            if (zombie.offsetLeft <= window.innerWidth * 0.08) { gameOver(); }
        }, 16);
        setTimeout(spawnZombie, spawnInterval);
    }

    function spawnGargantuar() {
        const gargantuar = document.createElement('img');
        gargantuar.src = 'gargantuar.png';
        gargantuar.className = 'enemy';
        gargantuar.dataset.hp = 10;
        gargantuar.style.position = 'fixed';
        gargantuar.style.width = '20vw';
        gargantuar.style.height = '25vh';
        gargantuar.style.zIndex = '10';

        const randomRow = Math.floor(Math.random() * RADEK);
        gargantuar.dataset.row = randomRow;
        const cell = document.querySelector(`.cell[data-row="${randomRow}"]`);
        const rect = cell.getBoundingClientRect();

        gargantuar.style.top = (rect.top - 40) + 'px';
        gargantuar.style.left = window.innerWidth + 'px';
        document.body.appendChild(gargantuar);

        const walk = setInterval(() => {
            if (!document.body.contains(gargantuar) || gargantuar.dataset.hp <= 0) { clearInterval(walk); return; }

            document.querySelectorAll('.cell').forEach(cell => {
                const plant = cell.querySelector('img');
                if (!plant) return;

                const cellRect = cell.getBoundingClientRect();
                const zombieRect = gargantuar.getBoundingClientRect();
                const plantRect = plant.getBoundingClientRect();
                if (Math.abs(cellRect.top - zombieRect.top) > 50) return;

                const hit = zombieRect.left < plantRect.right &&
                    zombieRect.right > plantRect.left &&
                    zombieRect.top < plantRect.bottom &&
                    zombieRect.bottom > plantRect.top;

                if (hit && !gargantuar.dataset.eating) {
                    const plantImg = cell.querySelector('img');

                    if (plantImg && plantImg.src.includes('potatomine.png')) {
                        cell.innerHTML = '';
                        const explosion = document.createElement('img');
                        explosion.src = 'potatomineexplosion.png';
                        explosion.style.position = 'fixed';
                        explosion.style.width = '10vw';
                        explosion.style.height = '10vw';
                        explosion.style.zIndex = '50';
                        const cellRect = cell.getBoundingClientRect();
                        explosion.style.left = (cellRect.left - cellRect.width / 2) + 'px';
                        explosion.style.top = (cellRect.top - cellRect.height / 2) + 'px';
                        document.body.appendChild(explosion);
                        setTimeout(() => explosion.remove(), 500);
                        potatoMineExplosionSound.play();
                        document.querySelectorAll('.enemy').forEach(enemy => {
                            if (enemy.dataset.row !== cell.dataset.row) return;
                            const enemyRect = enemy.getBoundingClientRect();
                            const cellRect = cell.getBoundingClientRect();
                            if (enemyRect.left < cellRect.right + cellRect.width &&
                                enemyRect.right > cellRect.left - cellRect.width) {
                                enemy.dataset.hp = 0;
                                setTimeout(() => enemy.remove(), 0);
                            }
                        });
                        return;
                    }

                    gargantuar.dataset.eating = 'true';
                    eatingCount++;
                    if (eatingCount === 1) zombieEatingSound.play();

                    const eatInterval = setInterval(() => {
                        if (!document.body.contains(gargantuar)) {
                            clearInterval(eatInterval);
                            eatingCount--;
                            if (eatingCount <= 0) { eatingCount = 0; zombieEatingSound.pause(); zombieEatingSound.currentTime = 0; }
                            else if (zombieEatingSound.paused) zombieEatingSound.play();
                            delete gargantuar.dataset.eating;
                            return;
                        }

                        const plant = cell.querySelector('img');
                        if (!plant) {
                            clearInterval(eatInterval);
                            eatingCount--;
                            if (eatingCount <= 0) { eatingCount = 0; zombieEatingSound.pause(); zombieEatingSound.currentTime = 0; }
                            else if (zombieEatingSound.paused) zombieEatingSound.play();
                            delete gargantuar.dataset.eating;
                            return;
                        }

                        cell.dataset.hp = (parseInt(cell.dataset.hp) || 3) - 1;
                        if (cell.dataset.hp <= 0) {
                            if (cell.shootInterval) { clearInterval(cell.shootInterval); cell.shootInterval = null; }
                            if (cell.sunInterval) { clearInterval(cell.sunInterval); cell.sunInterval = null; }
                            cell.innerHTML = '';
                            cell.dataset.hp = 3;
                            clearInterval(eatInterval);
                            eatingCount--;
                            if (eatingCount <= 0) { eatingCount = 0; zombieEatingSound.pause(); zombieEatingSound.currentTime = 0; }
                            else if (zombieEatingSound.paused) zombieEatingSound.play();
                            delete gargantuar.dataset.eating;
                        }
                    }, 1000);
                }
            });

            if (!gargantuar.dataset.eating) {
                gargantuar.style.left = gargantuar.offsetLeft - 1 + 'px';
            }

            if (gargantuar.offsetLeft < -100) { clearInterval(walk); gargantuar.remove(); return; }
            if (gargantuar.offsetLeft <= window.innerWidth * 0.08) { gameOver(); }
        }, 16);
        setTimeout(spawnGargantuar, gargantuarSpawnInterval);
    }

    spawnZombie();
    setTimeout(spawnGargantuar, 30000);
}

function gameOver() {
    const highestId = setTimeout(() => {}, 0);
    for (let i = 0; i <= highestId; i++) clearInterval(i);

    document.body.innerHTML = '';
    document.body.style.background = "black";
    backgroundSong.pause();
    peaShooterFireSoundEffect.pause();
    zombieEatingSound.pause();
    const img = document.createElement("img");
    img.src = "gameOverScreen.png";
    img.style.width = "100vw";
    img.style.height = "100vh";
    document.body.appendChild(img);
}