var player;
var playerPositionHead;
var playerVelocity = 50;
var playerRotationSpeed = Math.PI * 0.6;  // Velocidad de rotación (radianes por segundo)
let isPlayerDead = false;

function createPlayer(x, z){
    player = new THREE.Mesh(new THREE.BoxGeometry(WALL_HEIGHT / 7, WALL_HEIGHT / 2.5, WALL_HEIGHT / 7), playerMaterial);
    player.position.x = x;
    player.position.y = 100;
    player.position.z = z;
    playerPositionHead = 2 + WALL_HEIGHT / 4;
    scene.add(player);
  
    // Rigid body del player
    const boxShape = new CANNON.Box( new
      CANNON.Vec3(WALL_HEIGHT / 7 / 2, WALL_HEIGHT / 2.5 / 2, WALL_HEIGHT / 7 / 2));
    const boxBody = new CANNON.Body({
      mass: 1,
      material: playerMaterialCANNON
    });
    boxBody.addShape(boxShape);
    boxBody.position.x = x;
    boxBody.position.z = z;
    
    // Evitar que rote (ni por colisiones ni por inercia)
    boxBody.fixedRotation = true;
    boxBody.updateMassProperties();
    boxBody.linearDamping = 0.9;
    
    world.addBody(boxBody);
    player.body = boxBody;
  
    // Crear triángulo (flecha del minimapa)
    const arrowShape = new THREE.Shape();
    const size = WALL_HEIGHT / 3; // tamaño del triángulo
  
    // Definir el triángulo apuntando hacia +Z (ajustable)
    arrowShape.moveTo(0, size/1.5);
    arrowShape.lineTo(-size / 2, -size / 2);
    arrowShape.lineTo(size / 2, -size / 2);
    arrowShape.lineTo(0, size/1.5);
  
    const extrudeSettings = { depth: WALL_HEIGHT / 40, bevelEnabled: false };
    const arrowGeometry = new THREE.ExtrudeGeometry(arrowShape, extrudeSettings);
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const arrowMesh = new THREE.Mesh(arrowGeometry, arrowMaterial);
  
    // Colocar el triángulo arriba del jugador
    arrowMesh.position.y = WALL_HEIGHT + (WALL_HEIGHT / 10);
    arrowMesh.rotation.x = Math.PI / 2; // rotar para que mire hacia arriba en el eje Y
  
    // Agregar la flecha como hijo del jugador (seguirá su posición y rotación)
    player.add(arrowMesh);
  
    // Guardamos referencia por si quieres manipularla luego
    player.arrow = arrowMesh;
  }