var player;
var playerPositionHead;

var playerRotationSpeed = Math.PI * 0.6;  // Velocidad de rotación (radianes por segundo)
let isPlayerDead = false;
let attackTriggerPlayerPush; // Trigger
let attackTriggerPlayerPushMesh; // Trigger

let triggerMesh;

let pushDirection;

let baseballBat;
let batSwingProgress = 0;
let isBatSwinging = false;

var playerHP = 100;
var playerVelocity = 50;
var playerVelocityIncrement = 20;
var pushForce = 1000;
var pushForceIncrement = 500;
var damage = 20;
var damageIncrement = 20;
var battery = 0;

let isBatThrusting = false;
let batThrustProgress = 0;
const batThrustDuration = 0.25; // segundos para ida y vuelta (~250 ms)
const batStartPos = new THREE.Vector3(-10, 12, 10);
const batEndPos = new THREE.Vector3(-4, 10, 16); // avanza +4 en Z
const batStartRotX = 0.1;
const batEndRotX = 1.5;


function createPlayer(x, z){
    player = new THREE.Mesh(new THREE.BoxGeometry(WALL_HEIGHT / 7, WALL_HEIGHT / 2.5, WALL_HEIGHT / 7), playerMaterial);
    player.position.x = x;
    player.position.y = 100;
    player.position.z = z;
    playerPositionHead = 2 + WALL_HEIGHT / 4;
    scene.add(player);

    const batGeometry = new THREE.CylinderGeometry(1.2, 0.6, 18, 16);
    
    baseballBat = new THREE.Mesh(batGeometry, batMaterial);
    baseballBat.castShadow = true;

    // Posición relativa a la cámara
    baseballBat.position.set(-10, 12, 10);
    
    // Inclinación inicial
    baseballBat.rotation.x = batStartRotX; // apuntando un poco hacia arriba
    //baseballBat.rotation.z = Math.PI / 2;
    
    // Añadirlo como hijo de la cámara (siempre solidario)
    player.add(baseballBat);


  
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



    // AttackTrigger
    const triggerRadius = 10;
    const triggerShape = new CANNON.Sphere(triggerRadius);
    attackTriggerPlayerPush = new CANNON.Body({ mass: 0 });
    attackTriggerPlayerPush.addShape(triggerShape);
    attackTriggerPlayerPush.collisionResponse = false;

    world.addBody(attackTriggerPlayerPush);

    attackTriggerPlayerPush.addEventListener('collide', function(e) {
    zombiBodies.forEach(zombieObj => {
        if (e.body.id === zombieObj.zombie.body.id) {
            // Dirección con un poco de componente vertical para efecto más dramático
            const forceVector = new CANNON.Vec3(
                pushDirection.x * pushForce,
                pushDirection.y * pushForce + (pushForce * 0.3), // +30% fuerza vertical
                pushDirection.z * pushForce
            );
            zombieObj.zombie.body.applyForce(forceVector, zombieObj.zombie.body.position);
            // Reduce zombie hp
            zombieObj.reduceHP(damage);
            console.log(`EMPUJADO ZOMBI ${zombieObj.zombie.body.id}`);
        }
    });
    });
    
    
    const triggerGeometry = new THREE.SphereGeometry(triggerRadius, 16, 16);
const triggerMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xff0000, 
    transparent: true, 
    opacity: 0.3,
    wireframe: true 
});
triggerMesh = new THREE.Mesh(triggerGeometry, triggerMaterial);
scene.add(triggerMesh);

  
  }