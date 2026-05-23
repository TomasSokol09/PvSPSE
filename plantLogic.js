const peaShooterFireSoundEffect = new Audio("peaShooterSoundEffect.mp3");

function peaShooterStartShooting(cell) {
    if (cell.shootInterval) {
        clearInterval(cell.shootInterval);
    }

    cell.shootInterval = setInterval(() => {
        if (!cell.querySelector('img')) {
            return;
        }

        const cellRow = cell.dataset.row;

        const rect = cell.getBoundingClientRect();

        const peaProjectile = document.createElement('img');
        peaProjectile.src = 'peaShooterProjectile.png';
        peaProjectile.style.position = 'fixed';
        peaProjectile.style.width = '3vw';
        peaProjectile.style.height = '3vw';
        peaProjectile.style.zIndex = '10';
        peaProjectile.style.top = (rect.top + rect.height / 2 - 50) + 'px';
        peaProjectile.style.left = rect.right + 'px';
        document.body.appendChild(peaProjectile);
        peaShooterFireSoundEffect.play();

        const fly = setInterval(() => {
            if (!document.body.contains(peaProjectile)) { clearInterval(fly); return; }

            peaProjectile.style.left = peaProjectile.offsetLeft + 5 + 'px';

            let hit_something = false;

            document.querySelectorAll('.enemy').forEach(zombie => {
                console.log('cell row:', cellRow, 'zombie row:', zombie.dataset.row); // add this
                if (hit_something) return;
                if (zombie.dataset.row !== cellRow) return;

                const peaRect = peaProjectile.getBoundingClientRect();
                const zombieRect = zombie.getBoundingClientRect();

                const hit = peaRect.right > zombieRect.left &&
                    peaRect.left < zombieRect.right &&
                    peaRect.bottom > zombieRect.top &&
                    peaRect.top < zombieRect.bottom;

                if (hit) {
                    hit_something = true;
                    clearInterval(fly);
                    peaProjectile.remove();

                    zombie.dataset.hp -= 1;
                    if (zombie.dataset.hp <= 0) {
                        zombie.remove();
                    }
                }
            });

            if (peaProjectile.offsetLeft > window.innerWidth) {
                clearInterval(fly);
                peaProjectile.remove();
            }
        }, 10);
    }, 1500);
}

function sunFlowerSunSpawn(cell) {
    if (cell.sunInterval) {
        clearInterval(cell.sunInterval);
    }

    cell.sunInterval = setInterval(() => {
        if (!cell.querySelector('img')) { clearInterval(cell.sunInterval); return; }

        const sun = document.createElement('img');
        sun.src = 'sun.png';
        sun.style.position = 'fixed';
        sun.style.width = '5vw';
        sun.style.height = '5vw';
        sun.style.zIndex = '20';
        sun.style.cursor = 'pointer';

        const rect = cell.getBoundingClientRect();
        sun.style.left = (rect.left + rect.width / 2) + 'px';
        sun.style.top = rect.top + 'px';
        document.body.appendChild(sun);

        const fall = setInterval(() => {
            sun.style.top = sun.offsetTop + 1 + 'px';
            if (sun.offsetTop > window.innerHeight) { clearInterval(fall); sun.remove(); }
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