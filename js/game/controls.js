var controls = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    turnLeft: false,
    turnRight: false
};
  
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