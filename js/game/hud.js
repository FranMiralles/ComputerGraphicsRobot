function updateHUD() {
    document.getElementById('hp-value').textContent = playerHP;
    document.getElementById('velocity-value').textContent = playerVelocity;
    document.getElementById('damage-value').textContent = damage;
    document.getElementById('push-value').textContent = pushForce;
    document.getElementById('battery-value').textContent = battery;
}