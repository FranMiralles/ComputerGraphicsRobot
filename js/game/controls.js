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


// Añade estas variables globales
var nearestDoor = null;
var isOpeningDoor = false;
var doorOpeningSpeed = 15; // Velocidad de apertura
var numOpenedDoors = 0
  
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
      case 'KeyE': // Tecla para abrir puerta
        if (nearestDoor && !nearestDoor.isOpen && !isOpeningDoor) {
            openDoor(nearestDoor);
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

function findNearestDoor() {
    if (doors.length === 0) {
        nearestDoor = null;
        return;
    }

    let minDistance = Infinity;
    let closestDoor = null;

    doors.forEach(door => {
        if (door.isOpen) return; // Ignorar puertas ya abiertas

        const distance = Math.sqrt(
            Math.pow(player.position.x - door.mesh.position.x, 2) +
            Math.pow(player.position.z - door.mesh.position.z, 2)
        );

        if (distance < minDistance) {
            minDistance = distance;
            closestDoor = door;
        }
    });

    // Solo considerar puertas a menos de 15 unidades
    if (minDistance <= 100) {
        nearestDoor = closestDoor;
        
        if (!closestDoor.userData) closestDoor.userData = {};
        closestDoor.userData.isNearPlayer = true;
        
    } else {
        nearestDoor = null;
    }
}

function openDoor(door) {
    if (door.isOpen || isOpeningDoor) return;
    
    isOpeningDoor = true;
    door.isOpening = true;
    
    const centerRoomA = {
        x: door.roomA.x + 75,
        z: door.roomA.z + 75
    };
    const centerRoomB = {
        x: door.roomB.x + 75,
        z: door.roomB.z + 75
    };
    const distToRoomA = Math.sqrt(
        Math.pow(player.position.x - centerRoomA.x, 2) +
        Math.pow(player.position.z - centerRoomA.z, 2)
    );
    const distToRoomB = Math.sqrt(
        Math.pow(player.position.x - centerRoomB.x, 2) +
        Math.pow(player.position.z - centerRoomB.z, 2)
    );
    
    // Devolver la room más lejana
    if (distToRoomA > distToRoomB) {
      reiniciarZombis(door.roomA)
    }else{
      reiniciarZombis(door.roomB)
    }
    numOpenedDoors = numOpenedDoors + 1
}


function updateDoors(delta) {
    // Buscar puerta más cercana cada frame
    findNearestDoor();
    
    // Actualizar puertas que se están abriendo
    doors.forEach(door => {
        if (door.isOpening) {
            // Mover la puerta hacia arriba
            const targetY = door.mesh.position.y + doorOpeningSpeed * delta;
            door.mesh.position.y = targetY;
            
            // Mover también el cuerpo físico
            if (door.body) {
              console.log("MOVIENDO CUERPO")
                door.body.position.y = targetY;
            }
            
            // Si la puerta ha subido lo suficiente, marcarla como abierta
            if (targetY >= WALL_HEIGHT * 1.2) {
                door.isOpen = true;
                door.isOpening = false;
                isOpeningDoor = false;
                console.log("Puerta abierta completamente");
            }
        }
    });
}