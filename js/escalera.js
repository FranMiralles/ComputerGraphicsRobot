

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


function loadScene()
{
	// Añade el objeto grafico a la escena
    //let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Verde
    let material = new THREE.MeshNormalMaterial();
    for (let i = 0; i < 10; i++) {
      let cubo = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 5), material);
      cubo.position.x = 0 + i;
      cubo.position.y = 0 + i;
      scene.add(cubo);
    }

    let geometriaPiso = new THREE.PlaneGeometry(40, 40, 40, 40);
    let piso = new THREE.Mesh(geometriaPiso,material);
    piso.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI/2) ;
    piso.position.x = -0.5;
    piso.position.y = -0.5;
    scene.add(piso);
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