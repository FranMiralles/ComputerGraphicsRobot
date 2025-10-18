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


// 1-inicializa 
init();
// 2-Crea una escena
loadScene();
// 3-renderiza
render();


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
  var viewSize = 100; // Tamaño de la vista ortográfica
  cameraOrtho = new THREE.OrthographicCamera(
    -viewSize, viewSize,   // left, right
    viewSize, -viewSize,   // top, bottom (invertido para que coincida con la orientación)
    0.1, 2000    // near, far
  );
  
  // Posicionar la cámara ortográfica arriba del todo
  cameraOrtho.position.set(0, 100, 0);
  cameraOrtho.lookAt(0, 0, 0);
  cameraOrtho.up = new THREE.Vector3(0, 0, 1); // Orientación correcta

  // Calcular tamaño inicial del mini mapa
  calculateMiniMapSize();

  window.addEventListener('resize', updateAspectRatio );

}

//  ESCENA PRINCIPAL 
function loadScene() {

  const ambient = new THREE.AmbientLight(0x222233, 0.2);
  scene.add(ambient);

  // --- LUZ DIRECCIONAL (luna o luz distante) ---
  // Baja intensidad y color azulado
  const directional = new THREE.DirectionalLight(0x88aaff, 0.3);
  directional.position.set(10, 20, 10);
  directional.castShadow = true;
  scene.add(directional);

  // Niebla
  scene.fog = new THREE.FogExp2(0x000000, 0.01);

  // Sombras
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Crear mapa
  
  const rows = 3;
  const cols = 3;
  const rooms = createGridRooms(rows, cols, 150, 10);
  const farRooms = selectFarRooms(rooms)
  const sceneData = createConnectingCorridors(rooms, rows, cols); // sceneData.corridors, sceneData.walls, sceneData.connections

  const ceilingData = createCeiling(rooms, sceneData.corridors)
  addCreepyLights(scene, rooms)
  
  // Crear jugador
  createPlayer(farRooms[0].x, farRooms[0].z)

  
  zombieManager = new ZombieManager(zombies, [
    [farRooms[0].x, farRooms[0].z + 50],
    [farRooms[0].x, farRooms[0].z + 80],
    [farRooms[0].x, farRooms[0].z + 70],
    [farRooms[0].x, farRooms[0].z + 80],
  ], scene, world, player)
  
}

function addCreepyLights(scene, rooms) {
  rooms.forEach((room) => {
    // 1️⃣ Selecciona color al azar
    const r = Math.random();
    let color;
    if (r < 0.25) color = 0xff0000;       // rojo
    else if (r < 0.5) color = 0xaa00ff;   // morado
    else if (r < 0.75) color = 0x00ff00;  // verde
    else color = 0x222222;                // luz muy oscura

    // 2️⃣ Crea la luz CON PARÁMETROS CORRECTOS
    const light = new THREE.PointLight(color, 0.8, 30, 1.5); // (color, intensity, distance, decay)
    light.position.set(room.x, WALL_HEIGHT - 2, room.z); // Un poco más baja
    
    // Habilita sombras si quieres
    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    
    scene.add(light);

    // 3️⃣ AÑADIR ESFERA VISUAL (opcional, para debugging)
    const sphereGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const sphereMaterial = new THREE.MeshBasicMaterial({ 
      color: color,
      transparent: true,
      opacity: 0.6
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.copy(light.position);
    scene.add(sphere);

    // 4️⃣ Efecto de parpadeo corregido
    const baseIntensity = 0.8; // Usar valor fijo en lugar de light.intensity

    function flicker() {
      const duration = 100 + Math.random() * 300;
      const nextIntensity = baseIntensity * (0.2 + Math.random() * 0.8);
      const startIntensity = light.intensity;
      const startTime = performance.now();

      function animateFlicker(time) {
        const elapsed = time - startTime;
        const t = Math.min(elapsed / duration, 1);
        light.intensity = THREE.MathUtils.lerp(startIntensity, nextIntensity, t);

        if (t < 1) {
          requestAnimationFrame(animateFlicker);
        } else {
          setTimeout(flicker, 200 + Math.random() * 800);
        }
      }
      requestAnimationFrame(animateFlicker);
    }

    flicker();
  });
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
  const delta = clock.getDelta();
  world.step(1 / 60); // avanza la simulación física

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



  // Sincronizar el Mesh con el cuerpo físico
  player.position.copy(player.body.position);
  player.quaternion.copy(player.body.quaternion);

  // Sincronizar el Mesh con el cuerpo físico del zombi
  zombies.forEach(zombie => zombie.update(delta));
  
  

  // Cámara
  cameraOrtho.position.x = player.position.x;
  cameraOrtho.position.z = player.position.z;
  cameraOrtho.rotation.z = getBodyYaw(player.body) + Math.PI;

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

