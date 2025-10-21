// Variables globales que van siempre
var renderer, scene, camera;
var cameraControls;
var angulo = -0.01;

var cameraOrtho;

const clock = new THREE.Clock();

var CAMARA_CENITAL = false;

let world;

let zombies = [];

let zombieManager;

let delta;


powerUps = []

var flashlight;
let flashlightTime = 0;
let flashlightBaseIntensity = 2.5;
let flashlightOffTimer = 0;



// 1-inicializa 
init();
// 2-Crea una escena
loadScene();
// 3-renderiza
render();

var redLight;

function init()
{
  // Mundo fisico
  world = new CANNON.World(); 
  world.gravity.set(0,-9.8,0); 
  const groundShape = new CANNON.Plane();
  const ground = new CANNON.Body({ mass: 0, material: groundMaterialCANNON });
  ground.addShape(groundShape);
	ground.position.y = -0.01;
  ground.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
  world.addBody(ground);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( new THREE.Color(0xFFFFFF) );
  document.getElementById('container').appendChild( renderer.domElement );

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  var aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera( 75, aspectRatio , 0.1, 3000 );
  if (CAMARA_CENITAL){
    camera.position.set( -405, WALL_HEIGHT, -565 );
    cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
    cameraControls.target.set( -405, 5, -565 );
  }
  var viewSize = WALL_HEIGHT * 2.5; // Tamaño de la vista ortográfica
  cameraOrtho = new THREE.OrthographicCamera(
    -viewSize, viewSize,   // left, right
    viewSize, -viewSize,   // top, bottom (invertido para que coincida con la orientación)
    0.1, 2000    // near, far
  );
  
  // Posicionar la cámara ortográfica arriba del todo
  cameraOrtho.position.set(0, 200, 0);
  cameraOrtho.lookAt(0, 0, 0);
  cameraOrtho.up = new THREE.Vector3(0, 0, 1); // Orientación correcta

  // Calcular tamaño inicial del mini mapa
  calculateMiniMapSize();

  window.addEventListener('resize', updateAspectRatio );

}

var farRooms;

//  ESCENA PRINCIPAL 
function loadScene() {

  const ambient = new THREE.AmbientLight(0x333333, 0.1);
  scene.add(ambient);

  // --- LUZ DIRECCIONAL (luna o luz distante) ---
  // Baja intensidad y color azulado
  /*
  const directional = new THREE.DirectionalLight(0x88aaff, 0.8); // 0.3
  directional.position.set(10, 20, 10);
  directional.castShadow = true;
  scene.add(directional);
  */
  // --- Luz roja intensa tipo alarma ---
  /*
  redLight = new THREE.PointLight(0xff0000, 2, 250); // color, intensidad, distancia
  redLight.position.set(-450, WALL_HEIGHT- 10, -470);
  redLight.castShadow = true;
  redLight.shadow.mapSize.width = 1024;
  redLight.shadow.mapSize.height = 1024;
  scene.add(redLight);
  */
  flashlight = new THREE.SpotLight(0xffffff, flashlightBaseIntensity, 220, Math.PI / 5, 0.8, 2);
  // color, intensidad, distancia, ángulo, penumbra, decaimiento
  flashlight.position.set(-450, 10, -470);
  flashlight.castShadow = true;
  flashlight.shadow.mapSize.width = 1024;
  flashlight.shadow.mapSize.height = 1024;

  // Luz de destino (donde apunta el foco)
  flashlight.target.position.set(-450 + 10, 1, -470); // mirando hacia +X
  scene.add(flashlight.target);
  scene.add(flashlight);

  // Guardar referencia global
  scene.userData.flashlight = flashlight;

  

  // --- NIEBLA ---
  scene.fog = new THREE.FogExp2(0x000000, 0.005);

  // --- SOMBRAS ---
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Crear mapa
  
  const rows = 4;
  const cols = 3;
  const rooms = createGridRooms(rows, cols, 250, 20);
  farRooms = selectFarRooms(rooms)
  const sceneData = createConnectingCorridors(rooms, rows, cols); // sceneData.corridors, sceneData.walls, sceneData.connections

  const ceilingData = createCeiling(rooms, sceneData.corridors)


  

  rooms.forEach(room => {
    // Verificar si esta room NO está en farRooms
    const isFarRoom = farRooms.some(farRoom => 
        farRoom.x === room.x && farRoom.z === room.z
    );
    
    if (!isFarRoom) {
        // Tipos de power-up disponibles
        const powerUpTypes = ["heal", "damage", "push", "speed"];
        
        // Elegir un tipo aleatorio
        const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        
        // Crear el power-up
        const powerUp = createPowerUp(room.x, room.z, randomType);
        powerUps.push(powerUp);
    }
  });

  var powerUp = createPowerUp(farRooms[1].x, farRooms[1].z, "battery");
  powerUps.push(powerUp);
  createPlayer(farRooms[0].x, farRooms[0].z - 80)


  var spawnPosition = getDirectionAndPosition( new THREE.Vector3(farRooms[1].x, 0, farRooms[1].z), new THREE.Vector3(farRooms[0].x, 0, farRooms[0].z))

  
  zombieManager = new ZombieManager(zombies, [
    [spawnPosition.x + 5, spawnPosition.z],
    [spawnPosition.x, spawnPosition.z + 5],
    [spawnPosition.x, spawnPosition.z],
    [spawnPosition.x + 5, spawnPosition.z + 5],
    [spawnPosition.x, spawnPosition.z - 5],
    [spawnPosition.x - 5, spawnPosition.z],
    [spawnPosition.x- 5, spawnPosition.z- 5],
    [spawnPosition.x- 5, spawnPosition.z + 5],
  ], scene, world, player)

  createServer({
    scene: scene,
    world: world,
    position: { x: farRooms[0].x, y: 0, z: farRooms[0].z - 110 },
    scale: 20.0
  });
  createServer({
    scene: scene,
    world: world,
    position: { x: farRooms[0].x + 15, y: 0, z: farRooms[0].z - 110 },
    scale: 20.0
  });
  createServer({
    scene: scene,
    world: world,
    position: { x: farRooms[0].x - 15, y: 0, z: farRooms[0].z - 110 },
    scale: 20.0
  });
}

function getDirectionAndPosition(positionA, positionB, distance = 250) {
    // Calcular dirección desde B hacia A
    const direction = new THREE.Vector3();
    direction.subVectors(positionA, positionB).normalize();
    
    // Calcular nueva posición desde A en esa dirección
    const newPosition = new THREE.Vector3();
    newPosition.copy(positionA).add(direction.multiplyScalar(distance));
    
    return newPosition
}
























function updateAspectRatio()
{
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  calculateMiniMapSize()
}

function getBodyYaw(body) {
  const q = body.quaternion;
  const siny_cosp = 2 * (q.w * q.y + q.x * q.z);
  const cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z);
  return Math.atan2(siny_cosp, cosy_cosp);
}

function setBodyYaw(body, yaw) {
  const q = new CANNON.Quaternion();
  q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), yaw);
  body.quaternion.copy(q);
}








function update()
{
  stats.update()
  // Obtener delta time, sin importar el estado
  delta = clock.getDelta();
  world.step(1 / 60); // avanza la simulación física

  if (!isPlayerDead && !finishGame){
    updateDoors(delta);
    // Rotar powerups
    for (let i = powerUps.length - 1; i >= 0; i--) {
      const powerUp = powerUps[i];
      
      // Rotación del power-up
      powerUp.obj.rotation.y = powerUp.obj.rotation.y + 1 * delta;
      if (powerUp.obj.rotation.y > 2 * Math.PI) {
          powerUp.obj.rotation.y = powerUp.obj.rotation.y - 2 * Math.PI;
      }
      
      // Calcular distancia al jugador
      const distance = powerUp.obj.position.distanceTo(player.position);
      
      // Si la distancia es menor que 12, eliminar el power-up
      if (distance < 15) {
          // Eliminar de la escena
          scene.remove(powerUp.obj);
          
          // Eliminar del array
          powerUps.splice(i, 1);
          
          
          // Aquí puedes agregar efectos de recolección
          if (powerUp.type == "heal"){
            playerHP = 100
          }
          if (powerUp.type == "speed"){
            playerVelocity = playerVelocity + playerVelocityIncrement
          }
          if (powerUp.type == "push"){
            pushForce = pushForce + pushForceIncrement
          }
          if (powerUp.type == "damage"){
            damage = damage + damageIncrement
          }
          if (powerUp.type == "battery"){
            closeAllDoors();
            battery = battery + 1
          }
      }
    }



    player.body.position.y = 12;
    player.body.velocity.y = 0;

    player.position.copy(player.body.position);
    player.quaternion.copy(player.body.quaternion);

    const rotateAngle = playerRotationSpeed * delta;

    // Rotación sobre el eje Y
    if (controls.turnLeft) {
      setBodyYaw(player.body, getBodyYaw(player.body) + rotateAngle);
    }
    if (controls.turnRight) {
      setBodyYaw(player.body, getBodyYaw(player.body) - rotateAngle);
    }

    // Vector forward del cuerpo físico (según rotación actual)
    const forward = new CANNON.Vec3(
      Math.sin(getBodyYaw(player.body)),
      0,
      Math.cos(getBodyYaw(player.body))
    );

    const right = new CANNON.Vec3(
      Math.cos(getBodyYaw(player.body)),
      0,
      -Math.sin(getBodyYaw(player.body))
    );

    // Velocidad constante
    let moveDir = new CANNON.Vec3(0, 0, 0);

    if (controls.forward) moveDir.vadd(forward, moveDir);
    if (controls.backward) moveDir.vsub(forward, moveDir);
    if (controls.left) moveDir.vadd(right, moveDir);
    if (controls.right) moveDir.vsub(right, moveDir);

    // Normalizar dirección si hay movimiento
    if (moveDir.lengthSquared() > 0) {
      moveDir.normalize();
      moveDir.scale(playerVelocity, moveDir);
    }

    // Fijar velocidad (solo XZ)
    player.body.velocity.x = moveDir.x;
    player.body.velocity.z = moveDir.z;
    player.body.velocity.y = 0;


    // Attack Player Push
    if (isAttackInProgress) {
      if (!isBatSwinging) {
          isBatSwinging = true;
          batSwingProgress = 0;
      }
    }
    // Animación del bate
    if (isBatThrusting && baseballBat) {
      // Aumentar el progreso normalizado (0 → 1)
      batThrustProgress += delta / batThrustDuration;

      // Progresión tipo "ida y vuelta" (usamos sinusoide para suavizar)
      const t = Math.sin(Math.min(batThrustProgress, 1) * Math.PI);

      // Interpolar posición y rotación
      baseballBat.position.lerpVectors(batStartPos, batEndPos, t);
      baseballBat.rotation.x = THREE.MathUtils.lerp(batStartRotX, batEndRotX, t);

      // Cuando termina la animación (ida y vuelta completa)
      if (batThrustProgress >= 1) {
          isBatThrusting = false;
          baseballBat.position.copy(batStartPos);
          baseballBat.rotation.x = batStartRotX;
      }
    }
        

    if (isAttackInProgress) {
      attackCooldown -= delta;
      
      // Desactivar el push a los 0.5 segundos
      if (attackCooldown <= 0.5 && attackingPush) {
          attackingPush = false;
          console.log("Ataque desactivado");
      }
      
      // Terminar el ataque completamente a los 1 segundo
      if (attackCooldown <= 0) {
          isAttackInProgress = false;
          console.log("Ataque terminado, listo para nuevo ataque");
      }
    }

    if (attackingPush) {
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      pushDirection = direction;
      
      // Multiplicar por la distancia deseada
      direction.multiplyScalar(20);
      
      attackTriggerPlayerPush.position.set(
          player.position.x + direction.x,
          player.position.y + 2,  // Altura fija sobre el jugador
          player.position.z + direction.z
      );
    } else {
        attackTriggerPlayerPush.position.set(player.position.x, -50, player.position.z);
    }


    // Sincronizar el Mesh con el cuerpo físico
    player.position.copy(player.body.position);
    player.quaternion.copy(player.body.quaternion);

    // Sincronizar el Mesh con el cuerpo físico del zombi
    zombies.forEach(zombie => zombie.update(delta));
    
    

    // Cámara
    cameraOrtho.position.x = player.position.x;
    cameraOrtho.position.z = player.position.z;
    cameraOrtho.rotation.z = getBodyYaw(player.body) + Math.PI;
  }
  updateHUD()
  if (!CAMARA_CENITAL) {
    const headHeight = playerPositionHead;
    const cameraOffset = new THREE.Vector3(0, headHeight, 0);
    camera.position.copy(new THREE.Vector3(player.position.x, player.position.y, player.position.z)).add(cameraOffset);

    const lookAtOffset = new THREE.Vector3(
      Math.sin(getBodyYaw(player.body)),
      headHeight,
      Math.cos(getBodyYaw(player.body))
    );
    camera.lookAt(player.position.clone().add(lookAtOffset));


    if (scene.userData.flashlight) {
      const flashlight = scene.userData.flashlight;

      // Posicionar la linterna en el mismo punto que la cámara
      flashlight.position.x = camera.position.x 
      flashlight.position.y = camera.position.y + 2
      flashlight.position.z = camera.position.z 

      // Calcular el punto hacia donde la cámara mira
      const flashlightTarget = new THREE.Vector3();
      camera.getWorldDirection(flashlightTarget);

      // Mover el target un poco hacia adelante
      flashlight.target.position.copy(camera.position.clone().add(flashlightTarget.multiplyScalar(10)));

      updateFlashLight()
    }

  } else {
    cameraControls.update();
  }

  
}

function render()
{
	requestAnimationFrame( render );
	update();
	
	// RENDERIZADO PRINCIPAL (vista normal)
	renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
	renderer.render(scene, camera);
	
	// NUEVO: RENDERIZADO DEL MINI MAPA
	renderMiniMap();
}

function updateFlashLight() {
  if (!flashlight) return;

  flashlightTime += delta; // delta = tiempo entre frames

  // --- Parpadeo suave normal ---
  const flicker = Math.sin(flashlightTime * 12) * 0.25 + (Math.random() - 0.5) * 0.15;
  flashlight.intensity = flashlightBaseIntensity + flicker;
  flashlight.intensity = Math.max(1.8, Math.min(3.0, flashlight.intensity));

  // --- Variación de ángulo (temblor del haz) ---
  const angleBase = Math.PI / 5;
  const angleVariation = Math.sin(flashlightTime * 6) * 0.03 + (Math.random() - 0.5) * 0.01;
  flashlight.angle = angleBase + angleVariation;

  // --- Penumbra más dinámica ---
  flashlight.penumbra = 0.5 + Math.abs(Math.sin(flashlightTime * 8)) * 0.3;
}