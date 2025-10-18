

// Variables globales que van siempre
var renderer, scene, camera;
var cameraControls;
var angulo = -0.01;

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
  camera = new THREE.PerspectiveCamera( 50, aspectRatio , 0.1, 100 );
  camera.position.set( 10, 15, 20 );

  cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
  cameraControls.target.set( 0, 0, 0 );

  window.addEventListener('resize', updateAspectRatio );
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

function createGround()
{
  let materialPiso = new THREE.MeshBasicMaterial({ color: 0x01ff00, transparent: true, opacity: 0.6 });
  let geometriaPiso = new THREE.PlaneGeometry(25, 25, 25, 25);
  let piso = new THREE.Mesh(geometriaPiso ,materialPiso);
  piso.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI/2) ;
  piso.position.x = -0.5;
  piso.position.y = -0.5;
  scene.add(piso);
}

function loadScene()
{
    
  createAxis(10, 0.2);
  createGround();

  let base = new THREE.Mesh(
    new THREE.CylinderGeometry(2, 2, 1, 32), 
    new THREE.MeshBasicMaterial({ color: 0xeb4334 }));
  base.position.y = 0;
  scene.add(base);


  let brazo = new THREE.Object3D();

  let hombro = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 1, 32), 
    new THREE.MeshBasicMaterial({ color: 0xeb349b })
  );
  hombro.position.y = 0;
  hombro.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI/2) ;
  brazo.add(hombro);

  let cubo = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 6, 1.1),
    new THREE.MeshBasicMaterial(
      { color: 0x332ded, transparent: true, opacity: 0.5 })
  );
  cubo.position.y = 6/2;
  brazo.add(cubo)


  let circle = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32), 
    new THREE.MeshBasicMaterial(
      { color: 0xeb349b, transparent: true, opacity: 0.5 })
    );
  circle.position.y = 6;
  brazo.add(circle);


  

  brazo.position.y = 0.5;


  scene.add(brazo);


}


function updateAspectRatio()
{
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function update()
{
  // Cambios para actualizar la camara segun mvto del raton
  cameraControls.update();
}

function render()
{
	requestAnimationFrame( render );
	update();
	renderer.render( scene, camera );
}