var controls = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    turnLeft: false,
    turnRight: false
};

var attackingPush = false;
var attackCooldown = 0;
var isAttackInProgress = false;
  
// Event listeners para controles
document.addEventListener('keydown', (event) => {
    switch (event.code) {
      case 'KeyW':
        controls.forward = true;
        break;
      case 'KeyS':
        controls.backward = true;
        break;
      case 'KeyA':
        controls.left = true;
        break;
      case 'KeyD':
        controls.right = true;
        break;
      case 'ArrowLeft':
        controls.turnLeft = true;
        break;
      case 'ArrowRight':
        controls.turnRight = true;
        break;
      case 'KeyQ':
        if (!isAttackInProgress) {
          startAttack();
        }
        break;
      case 'KeyG':
        console.log("God mode set on")
        playerHP = 2000;
        playerVelocity = 250;
        playerVelocityIncrement = 0;
        pushForce = 5000;
        pushForceIncrement = 0;
        damage = 100;
        damageIncrement = 0;
        battery = 1;
        break;
    }
});
  
document.addEventListener('keyup', (event) => {
    switch (event.code) {
      case 'KeyW':
        controls.forward = false;
        break;
      case 'KeyS':
        controls.backward = false;
        break;
      case 'KeyA':
        controls.left = false;
        break;
      case 'KeyD':
        controls.right = false;
        break;
      case 'ArrowLeft':
        controls.turnLeft = false;
        break;
      case 'ArrowRight':
        controls.turnRight = false;
        break;
    }
});

function startAttack() {
  console.log("Q - Iniciando ataque");
  isAttackInProgress = true;
  attackCooldown = 1.0;
  attackingPush = true;
  if (!isBatThrusting) {
      isBatThrusting = true;
      batThrustProgress = 0;
  }
}