// Variables globales que van siempre
var renderer, scene, camera;
var cameraControls;
var angulo = -0.01;

var cameraOrtho;
var miniMapSize;

var robot; // Referencia al robot
var base; // Referencia a la base
var brazo; // Referencia del brazo
var antebrazo; // Referencia del antebrazo
var mano; // Referencia de la mano
var pinzaIzq; // Referencia a la pinzaIzq
var pinzaDer; // Referencia a la pinzaDer
var previousWireframeState = false;
var moveVelocity = 5;

var animating = false;
var velAnimacion = 5;
const clock = new THREE.Clock();



// Materiales guardados para cambiar de alambre a sólido en ejcución
var materials = {
  base: new THREE.MeshBasicMaterial({ color: 0xeb4334 }),
  eje: new THREE.MeshBasicMaterial({ color: 0x34a4eb }),
  esparrago: new THREE.MeshBasicMaterial({ color: 0x332ded }),
  esfera: new THREE.MeshBasicMaterial({ color: 0xeb349b }),
  disco: new THREE.MeshBasicMaterial({ color: 0x34a4eb }),
  nervio: new THREE.MeshBasicMaterial({ color: 0x332ded }),
  muñeca: new THREE.MeshBasicMaterial({ color: 0x34a4eb }),
  pinza: new THREE.MeshBasicMaterial({ vertexColors: true })
};

var controls = {
  pos_x: 0,
  pos_z: 0,
  giro_base: 0,
  giro_brazo: 0,
  giro_antebrazo_y: 0,
  giro_antebrazo_z: 0,
  giro_pinza: 0,
  separacion_pinza: 0,
  alambres: false,
  iniciarAnimacion: function() {
    if (animating)
    {
      stopAnimationVariables();
    }
    else
    {
      startAnimationVariables();
    }
  }
};

function stopAnimationVariables(){
  animating = false;
  // Flags para las animaciones
  GIRO_BASE_POSI = false
  GIRO_BASE_NEGA = false
  GIRO_BRAZO_POSI = false
  GIRO_BRAZO_NEGA = false
  GIRO_ANTEBRAZO_Y_POSI = false
  GIRO_ANTEBRAZO_Y_NEGA = false
  GIRO_ANTEBRAZO_Z_POSI = false
  GIRO_ANTEBRAZO_Z_NEGA = false
  GIRO_PINZA_POSI = false
  GIRO_PINZA_NEGA = false
  SEPARACION_PINZA_POSI = false
  SEPARACION_PINZA_NEGA = false
}

function startAnimationVariables(){
  animating = true;
  // Flags para las animaciones
  GIRO_BASE_POSI = true
  GIRO_BASE_NEGA = false
  GIRO_BRAZO_POSI = false
  GIRO_BRAZO_NEGA = false
  GIRO_ANTEBRAZO_Y_POSI = false
  GIRO_ANTEBRAZO_Y_NEGA = false
  GIRO_ANTEBRAZO_Z_POSI = false
  GIRO_ANTEBRAZO_Z_NEGA = false
  GIRO_PINZA_POSI = false
  GIRO_PINZA_NEGA = false
  SEPARACION_PINZA_POSI = false
  SEPARACION_PINZA_NEGA = false
  // Estado inicial
  base.rotation.y = -Math.PI;
  brazo.rotation.z = 0 / 180 * Math.PI;
  antebrazo.rotation.y = 0 / 180 * Math.PI;
  antebrazo.rotation.z = 0 / 180 * Math.PI;
  mano.rotation.z = 0 / 180 * Math.PI;
  pinzaIzq.position.z = 0;
  pinzaDer.position.z = 0;
}

function animateRobot(delta){

  if (GIRO_BASE_POSI){
    base.rotation.y += velAnimacion * delta
    if (base.rotation.y >= Math.PI){
      GIRO_BASE_POSI = false; GIRO_BASE_NEGA = true;
    }
  }

  if (GIRO_BASE_NEGA){
    base.rotation.y -= velAnimacion * delta
    if (base.rotation.y <= -Math.PI){
      GIRO_BASE_NEGA = false; GIRO_BRAZO_POSI = true;
    }
  }

  if (GIRO_BRAZO_POSI){
    brazo.rotation.z += velAnimacion * delta * 0.75
    if (brazo.rotation.z >= 45 / 180 * Math.PI){
      GIRO_BRAZO_POSI = false; GIRO_BRAZO_NEGA = true;
    }
  }

  if (GIRO_BRAZO_NEGA){
    brazo.rotation.z -= velAnimacion * delta * 0.75
    if (brazo.rotation.z <= -45 / 180 * Math.PI){
      GIRO_BRAZO_NEGA = false; GIRO_ANTEBRAZO_Y_POSI = true;
    }
  }

  if (GIRO_ANTEBRAZO_Y_POSI){
    antebrazo.rotation.y += velAnimacion * delta * 0.5
    if (antebrazo.rotation.y >= Math.PI){
      GIRO_ANTEBRAZO_Y_POSI = false; GIRO_ANTEBRAZO_Y_NEGA = true;
    }
  }

  if (GIRO_ANTEBRAZO_Y_NEGA){
    antebrazo.rotation.y -= velAnimacion * delta * 0.5
    if (antebrazo.rotation.y <= -Math.PI){
      GIRO_ANTEBRAZO_Y_NEGA = false; GIRO_ANTEBRAZO_Z_POSI = true;
    }
  }

  if (GIRO_ANTEBRAZO_Z_POSI){
    antebrazo.rotation.z += velAnimacion * delta * 0.75
    if (antebrazo.rotation.z >= 90 / 180 * Math.PI){
      GIRO_ANTEBRAZO_Z_POSI = false; GIRO_ANTEBRAZO_Z_NEGA = true;
    }
  }

  if (GIRO_ANTEBRAZO_Z_NEGA){
    antebrazo.rotation.z -= velAnimacion * delta * 0.75
    if (antebrazo.rotation.z <= -90 / 180 * Math.PI){
      GIRO_ANTEBRAZO_Z_NEGA = false; GIRO_PINZA_POSI = true;
    }
  }

  if (GIRO_PINZA_POSI){
    mano.rotation.z += velAnimacion * delta * 0.75
    if (mano.rotation.z >= 220 / 180 * Math.PI){
      GIRO_PINZA_POSI = false; GIRO_PINZA_NEGA = true;
    }
  }

  if (GIRO_PINZA_NEGA){
    mano.rotation.z -= velAnimacion * delta * 0.75
    if (mano.rotation.z <= -40 / 180 * Math.PI){
      GIRO_PINZA_NEGA = false; SEPARACION_PINZA_POSI = true;
    }
  }

  if (SEPARACION_PINZA_POSI){
    pinzaIzq.position.z += velAnimacion * delta * 2;
    pinzaDer.position.z += -velAnimacion * delta * 2;
    if (pinzaIzq.position.z >= 15){
      SEPARACION_PINZA_POSI = false; SEPARACION_PINZA_NEGA = true;
    }
  }

  if (SEPARACION_PINZA_NEGA){
    pinzaIzq.position.z -= velAnimacion * delta * 2;
    pinzaDer.position.z -= -velAnimacion * delta * 2;
    if (pinzaIzq.position.z <= 0){
      SEPARACION_PINZA_NEGA = false; animating = false;
    }
  }

}

// Event listeners para controles
document.addEventListener('keydown', (event) => {
  switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
          controls.pos_x += 1 * moveVelocity;
          break;
      case 'ArrowDown':
      case 'KeyS':
          controls.pos_x -= 1 * moveVelocity;
          break;
      case 'ArrowLeft':
      case 'KeyA':
          controls.pos_z += 1 * moveVelocity;
          break;
      case 'ArrowRight':
      case 'KeyD':
          controls.pos_z -= 1 * moveVelocity;
          break;
  }
});

// 1-inicializa 
init();
// 2-Crea una escena
loadScene();
// 3-renderiza
render();

function init()
{
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( new THREE.Color(0xFFFFFF) );
  document.getElementById('container').appendChild( renderer.domElement );

  scene = new THREE.Scene();

  var aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera( 50, aspectRatio , 0.1, 3000 );
  camera.position.set( 400, 400, 400 );

  cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
  cameraControls.target.set( 0, 0, 0 );

  var viewSize = 300; // Tamaño de la vista ortográfica
  cameraOrtho = new THREE.OrthographicCamera(
    -viewSize, viewSize,   // left, right
    viewSize, -viewSize,   // top, bottom (invertido para que coincida con la orientación)
    0.1, 2000    // near, far
  );
  
  // Posicionar la cámara ortográfica arriba del todo
  cameraOrtho.position.set(0, 1000, 0);
  cameraOrtho.lookAt(0, 0, 0);
  cameraOrtho.up = new THREE.Vector3(0, 0, 1); // Orientación correcta

  // Calcular tamaño inicial del mini mapa
  calculateMiniMapSize();

  // interface de usuario
  var gui = new dat.GUI();

  // Carpeta Tamaño
  var gui_size = gui.addFolder('Control Robot');
  gui_size.add(controls, 'giro_base', -180, +180).name("Giro Base");
  gui_size.add(controls, 'giro_brazo', -45, 45).name("Giro Brazo");
  gui_size.add(controls, 'giro_antebrazo_y', -180, 180).name("Giro Antebrazo Y");
  gui_size.add(controls, 'giro_antebrazo_z', -90, 90).name("Giro Antebrazo Z");
  gui_size.add(controls, 'giro_pinza', -40, 220).name("Giro Pinza");
  gui_size.add(controls, 'separacion_pinza', 0, 15).name("Separación Pinza");
  gui_size.add(controls, 'alambres').name("Alambres");
  gui_size.add(controls, 'iniciarAnimacion').name("Anima");
  gui_size.open();

  window.addEventListener('resize', updateAspectRatio );

}

function calculateMiniMapSize() {
  // 1/4 de la dimensión menor de la vista general
  var minDimension = Math.min(window.innerWidth, window.innerHeight);
  miniMapSize = Math.floor(minDimension / 4);
}

function createAxis(longitudEjes, grosor)
{
  let ejes = new THREE.Object3D();
  let ejex = new THREE.Mesh(
    new THREE.BoxGeometry(grosor, longitudEjes, grosor),
    new THREE.MeshBasicMaterial(
      { color: 0xed2d2d, transparent: true, opacity: 1 })
  );
  ejex.position.x = longitudEjes / 2;
  ejex.position.y = 0;
  ejex.position.z = 0;
  ejex.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI/2) ;
  ejes.add(ejex)
  let ejey = new THREE.Mesh(
    new THREE.BoxGeometry(grosor, longitudEjes, grosor),
    new THREE.MeshBasicMaterial(
      { color: 0x01ff00, transparent: true, opacity: 1 })
  );
  ejey.position.x = 0;
  ejey.position.y = longitudEjes / 2;
  ejey.position.z = 0;
  ejes.add(ejey)
  let ejez = new THREE.Mesh(
    new THREE.BoxGeometry(grosor, longitudEjes, grosor),
    new THREE.MeshBasicMaterial(
      { color: 0x2dd3ed, transparent: true, opacity: 1 })
  );
  ejez.position.x = 0;
  ejez.position.y = 0;
  ejez.position.z = longitudEjes / 2;
  ejez.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI/2) ;
  ejes.add(ejez)
  scene.add(ejes)
}

function createGround(x, z)
{
  let materialPiso = new THREE.MeshBasicMaterial({ color: 0x01ff00, transparent: true, opacity: 0.6 });
  let geometriaPiso = new THREE.PlaneGeometry(x, z, 25, 25);
  let piso = new THREE.Mesh(geometriaPiso ,materialPiso);
  piso.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI/2) ;
  piso.position.x = 0;
  piso.position.y = 0;
  scene.add(piso);
}

function createBase(parent){
  let base = new THREE.Mesh(
      new THREE.CylinderGeometry(50, 50, 15, 32), 
      materials.base);
  base.position.y = 15/2;
  parent.add(base);
  return base
}

function createBrazo(parent){
  let brazo = new THREE.Object3D()
  let eje = new THREE.Mesh(
    new THREE.CylinderGeometry(20, 20, 18, 32), 
    materials.eje)
  eje.position.y = 0;
  eje.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI/2)
  brazo.add(eje)
  let esparrago = new THREE.Mesh(
    new THREE.BoxGeometry(18, 120, 12),
    materials.esparrago);
  esparrago.position.y = 120/2;
  brazo.add(esparrago)
  let esphere = new THREE.Mesh(
    new THREE.SphereGeometry(20, 32, 32), 
    materials.esfera);
  esphere.position.y = 120;
  brazo.add(esphere)
  parent.add(brazo);
  return brazo
}

function createAntebrazo(parent){
  let antebrazo = new THREE.Object3D()
  let disco = new THREE.Mesh(
    new THREE.CylinderGeometry(22, 22, 6, 32), 
    materials.disco
  )
  disco.position.y = 0;
  antebrazo.add(disco)

  let separacionX = 6
  let separacionZ = 6

  let nervio1 = new THREE.Mesh(
    new THREE.BoxGeometry(4, 80, 4),
    materials.nervio
  )
  nervio1.position.x = separacionX;
  nervio1.position.y = 43;
  nervio1.position.z = separacionZ;
  antebrazo.add(nervio1)

  let nervio2 = new THREE.Mesh(
    new THREE.BoxGeometry(4, 80, 4),
    materials.nervio
  )
  nervio2.position.x = separacionX;
  nervio2.position.y = 43;
  nervio2.position.z = -separacionZ;
  antebrazo.add(nervio2)

  let nervio3 = new THREE.Mesh(
    new THREE.BoxGeometry(4, 80, 4),
    materials.nervio
  )
  nervio3.position.x = -separacionX;
  nervio3.position.y = 43;
  nervio3.position.z = separacionZ;
  antebrazo.add(nervio3)

  let nervio4 = new THREE.Mesh(
    new THREE.BoxGeometry(4, 80, 4),
    materials.nervio
  )
  nervio4.position.x = -separacionX;
  nervio4.position.y = 43;
  nervio4.position.z = -separacionZ;
  antebrazo.add(nervio4)

  mano = createMano(antebrazo)
  mano.position.y = 83

  parent.add(antebrazo);
  return antebrazo
}

function createMano(parent){
  let mano = new THREE.Object3D()
  let muñeca = new THREE.Mesh(
    new THREE.CylinderGeometry(15, 15, 40, 32), 
    materials.muñeca
  )
  muñeca.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI/2)
  mano.add(muñeca)
  
  pinzaIzq = createPinza(mano)
  pinzaIzq.position.z = 6
  pinzaIzq.position.y = -10
  
  pinzaDer = createPinza(mano)
  pinzaDer.position.z = -6
  pinzaDer.position.y = 10
  pinzaDer.rotateOnAxis(new THREE.Vector3(1, 0, 0), -2*Math.PI/2)
  pinzaDer.tras
  mano.add(muñeca)
  parent.add(mano);
  return mano
}

function createPinza(parent){
  let pinzaGeometry = new THREE.BufferGeometry()

  var vertices = new Float32Array([
    // Triángulo
    0, 0, 0,
    0, 20, 0,
    19, 20, 0,
    // Triángulo
    0, 0, 0,
    19, 20, 0,
    19, 0, 0,
    
    // Triángulo
    0, 0, 4,
    19, 20, 4,
    0, 20, 4,
    // Triángulo
    0, 0, 4,
    19, 0, 4,
    19, 20, 4,
    
    // Triángulo
    0, 20, 0,
    0, 0, 0,
    0, 0, 4,
    // Triángulo
    0, 20, 4,
    0, 20, 0,
    0, 0, 4,
    // Triángulo
    0, 20, 0,
    0, 20, 4,
    19, 20, 0,
    // Triángulo
    0, 20, 4,
    19, 20, 4,
    19, 20, 0,
    // Triángulo
    0, 0, 0,
    19, 0, 0,
    0, 0, 4,
    // Triángulo
    0, 0, 4,
    19, 0, 0,
    19, 0, 4,

    // Triángulo
    19, 0, 0,
    19, 20, 0,
    38, 15, 2,
    // Triángulo
    19, 0, 0,
    38, 15, 2,
    38, 5, 2,
    // Triángulo
    19, 0, 4,
    38, 15, 4,
    19, 20, 4,
    // Triángulo
    19, 0, 4,
    38, 5, 4,
    38, 15, 4,
    // Triángulo
    19, 20, 0,
    19, 20, 4,
    38, 15, 2,
    // Triángulo
    19, 20, 4,
    38, 15, 4,
    38, 15, 2,
    // Triángulo
    38, 15, 2,
    38, 15, 4,
    38, 5, 2,
    // Triángulo
    38, 15, 4,
    38, 5, 4,
    38, 5, 2,
    // Triángulo
    19, 0, 0,
    38, 5, 2,
    19, 0, 4,
    // Triángulo
    19, 0, 4,
    38, 5, 2,
    38, 5, 4,
    
  ]);

  // Añadir los vértices al objeto de geometría
  pinzaGeometry.setAttribute('position',
  new THREE.BufferAttribute(vertices, 3));

  var colors = new Float32Array([
    // Triángulo
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    // Triángulo
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    
    // Triángulo
    0.9, 0, 0,
    0.9, 0, 0,
    0.9, 0, 0,
    // Triángulo
    0.9, 0, 0,
    0.9, 0, 0,
    0.9, 0, 0,
    
    // Triángulo
    0.9, 0.1, 0,
    0.9, 0.1, 0,
    0.9, 0.1, 0,
    // Triángulo
    0.9, 0.1, 0,
    0.9, 0.1, 0,
    0.9, 0.1, 0,

    // Triángulo
    0.8, 0.1, 0,
    0.8, 0.1, 0,
    0.8, 0.1, 0,
    // Triángulo
    0.8, 0.1, 0,
    0.8, 0.1, 0,
    0.8, 0.1, 0,

    // Triángulo
    0.8, 0.2, 0,
    0.8, 0.2, 0,
    0.8, 0.2, 0,
    // Triángulo
    0.8, 0.2, 0,
    0.8, 0.2, 0,
    0.8, 0.2, 0,

    // Triángulo
    0.7, 0.2, 0,
    0.7, 0.2, 0,
    0.7, 0.2, 0,
    // Triángulo
    0.7, 0.2, 0,
    0.7, 0.2, 0,
    0.7, 0.2, 0,

    // Triángulo
    0.7, 0.3, 0,
    0.7, 0.3, 0,
    0.7, 0.3, 0,
    // Triángulo
    0.7, 0.3, 0,
    0.7, 0.3, 0,
    0.7, 0.3, 0,

    // Triángulo
    0.8, 0.3, 0,
    0.8, 0.3, 0,
    0.8, 0.3, 0,
    // Triángulo
    0.8, 0.3, 0,
    0.8, 0.3, 0,
    0.8, 0.3, 0,

    // Triángulo
    0.8, 0.2, 0,
    0.8, 0.2, 0,
    0.8, 0.2, 0,
    // Triángulo
    0.8, 0.2, 0,
    0.8, 0.2, 0,
    0.8, 0.2, 0,

    // Triángulo
    0.9, 0.2, 0,
    0.9, 0.2, 0,
    0.9, 0.2, 0,
    // Triángulo
    0.9, 0.2, 0,
    0.9, 0.2, 0,
    0.9, 0.2, 0,
    
  ]);

  pinzaGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  var pinza = new THREE.Mesh(pinzaGeometry, materials.pinza);

  parent.add(pinza)
  return pinza
}

function robotArm(){
  let robot = new THREE.Object3D()
  base = createBase(robot)
  brazo = createBrazo(base)
  antebrazo = createAntebrazo(brazo)
  antebrazo.position.y = 120;
  scene.add(robot);
  return robot
}

function loadScene()
{

  var light = new THREE.AmbientLight(0x404040)
  scene.add(light)
  
  // createAxis(50, 1)
  createGround(1000, 1000)
  robot = robotArm();

}


function updateAspectRatio()
{
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  calculateMiniMapSize()
}

function update()
{
  // Obtener delta time, sin importar el estado
  const delta = clock.getDelta();

  // Cambios para actualizar la camara segun mvto del raton
  cameraControls.update();

  if(!animating){

    robot.position.x = controls.pos_x;
    robot.position.z = controls.pos_z;

    // Rotación de los elementos del brazo
    base.rotation.y = controls.giro_base / 180 * Math.PI;
    brazo.rotation.z = controls.giro_brazo / 180 * Math.PI;
    antebrazo.rotation.y = controls.giro_antebrazo_y / 180 * Math.PI;
    antebrazo.rotation.z = controls.giro_antebrazo_z / 180 * Math.PI;
    mano.rotation.z = controls.giro_pinza / 180 * Math.PI;

    // Separación de las pinzas
    pinzaIzq.position.z = controls.separacion_pinza;
    pinzaDer.position.z = -1 * controls.separacion_pinza;

    // Alambre o sólido
    if (previousWireframeState !== controls.alambres) {
      Object.values(materials).forEach(material => {
        material.wireframe = controls.alambres;
      });
      // Forzar actualización de la renderización
      renderer.render(scene, camera);
      previousWireframeState = controls.alambres;
    }

  }
  else{
    animateRobot(delta)
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

function renderMiniMap()
{
	// Guardar el estado actual del renderer
	renderer.clearDepth(); // Limpiar el buffer de profundidad
	
	// Configurar viewport para el mini mapa (esquina superior izquierda)
	var x = 10; // Margen izquierdo
	var y = window.innerHeight - miniMapSize - 10; // Margen superior
	renderer.setViewport(x, y, miniMapSize, miniMapSize);
	renderer.setScissor(x, y, miniMapSize, miniMapSize);
	renderer.setScissorTest(true);
	
	// Renderizar la escena con la cámara ortográfica
	renderer.render(scene, cameraOrtho);
	
	// Restaurar el scissor test
	renderer.setScissorTest(false);
}