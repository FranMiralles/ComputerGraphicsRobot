function updateHUD() {
    document.getElementById('hp-value').textContent = playerHP;
    document.getElementById('velocity-value').textContent = playerVelocity;
    document.getElementById('damage-value').textContent = damage;
    document.getElementById('push-value').textContent = pushForce;
    document.getElementById('battery-value').textContent = battery;

    const gameOverText = document.getElementById("game-over");
    if (isPlayerDead) {
        gameOverText.style.opacity = "1";
        gameOverText.style.transition= "opacity 1s ease";
		gameOverText.style.animation= "flicker 3s infinite";
    } else {
        gameOverText.style.opacity = "0";
    }
}