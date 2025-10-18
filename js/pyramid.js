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
  camera.position.set( 5, 5, 5 );

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

function basicPyramid(){
  var geometry = new THREE.BufferGeometry();

  var vertices = new Float32Array([
    // Cara 1
    0, 1.5, 0,
    1, 0, 1,
    1, 0, -1,
    // Cara 2
    0, 1.5, 0,
    1, 0, -1,
    -1, 0, -1,
    // Cara 3
    0, 1.5, 0,
    -1, 0, -1,
    -1, 0, 1,
    // Cara 4
    0, 1.5, 0,
    -1, 0, 1,
    1, 0, 1,
    // Base 1
    1, 0, 1,
    -1, 0, 1,
    -1, 0, -1,
    // Base 2
    1, 0, 1,
    -1, 0, -1,
    1, 0, -1,
  ]);

  // Añadir los vértices al objeto de geometría
  geometry.setAttribute('position',
  new THREE.BufferAttribute(vertices, 3));

  var colors = new Float32Array([
    // Cara 1
    1, 0, 0, // rojo
    1, 0, 0, // rojo
    1, 0, 0, // rojo
    // Cara 2
    0, 1, 0, // verde
    0, 1, 0, // verde
    0, 1, 0, // verde
    // Cara 3
    0, 0, 1, // azul
    0, 0, 1, // azul
    0, 0, 1, // azul
    // Cara 4
    1, 1, 0, // amarillo
    1, 1, 0, // amarillo
    1, 1, 0, // amarillo
    // Base 1
    1, 0, 0, // rojo
    1, 0, 0, // rojo
    1, 0, 0, // rojo
    // Base 2
    0, 1, 0, // verde
    0, 1, 0, // verde
    0, 1, 0, // verde
  ]);

  geometry.setAttribute('color', new
  THREE.BufferAttribute(colors, 3));

  var material = new THREE.MeshBasicMaterial({
    vertexColors: true,
    //side: THREE.DoubleSide
  });

  var mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
}

function pyramidIndexingVertex(){
  // Instancia la geometría
  var geometry = new THREE.BufferGeometry();
  // Define los vértices
  var vertices = new Float32Array([
  0, 1.5, 0, // Vértice 0 superior (pico de la pirámide)
  1, 0, 1, // Esquina 1 de la base
  1, 0, -1, // Esquina 2 de la base
  -1, 0, -1, // Esquina 3 de la base
  -1, 0, 1 // Esquina 4 de la base
  ]);
  // Añadir los vértices al objeto de geometría
  geometry.setAttribute('position',
  new THREE.BufferAttribute(vertices, 3));

  // Define las caras (triangulares) usando índices
  var indices = new Uint16Array([
  0, 1, 2, // Cara 1
  0, 2, 3, // Cara 2
  0, 3, 4, // Cara 3
  0, 4, 1, // Cara 4
  1, 4, 3, // Base (primer triángulo)
  1, 3, 2 // Base (segundo triángulo)
  ]);
  // Añadir los índices a la geometría
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));

  // Array de colores por vértice
  var colors = new Float32Array([
  1, 0, 0, // Rojo para el pico
  0, 1, 0, // Verde esquina frontal derecha
  0, 0, 1, // Azul esquina trasera derecha
  1, 1, 0, // Amarillo esquina trasera izquierda
  1, 0, 1 // Magenta esquina frontal izquierda
  ]);
  // Añadir los colores al objeto de geometría
  geometry.setAttribute('color', new
  THREE.BufferAttribute(colors, 3));

  var material = new THREE.MeshBasicMaterial({
    vertexColors: true,
    //side: THREE.DoubleSide
  });

  var mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
}

function basicCube(){
  var geometry = new THREE.BufferGeometry();

  var vertices = new Float32Array([
    // Cara 1
    0, 1, 1,
    0, 0, 1,
    1, 1, 1,
    // Parte 2
    1, 1, 1,
    0, 0, 1,
    1, 0, 1,
    // Cara 2
    1, 1, 1,
    1, 0, 1,
    1, 1, 0,
    // Parte 2
    1, 1, 0,
    1, 0, 1,
    1, 0, 0,
    // Cara 3
    1, 1, 0,
    1, 0, 0,
    0, 0, 0,
    // Parte 2
    1, 1, 0,
    0, 0, 0,
    0, 1, 0,
    // Cara 4
    0, 1, 0,
    0, 0, 0,
    0, 1, 1,
    // Parte 2
    0, 1, 1,
    0, 0, 0,
    0, 0, 1,
    // Cara 5
    0, 1, 0,
    0, 1, 1,
    1, 1, 1,
    // Parte 2
    0, 1, 0,
    1, 1, 1,
    1, 1, 0,
    // Cara 6
    0, 0, 0,
    1, 0, 1,
    0, 0, 1,
    // Parte 2
    0, 0, 0,
    1, 0, 0,
    1, 0, 1,
  ]);

  // Añadir los vértices al objeto de geometría
  geometry.setAttribute('position',
  new THREE.BufferAttribute(vertices, 3));

  var colors = new Float32Array([
    // Cara 1
    1, 0, 0, // rojo
    1, 0, 0, // rojo
    1, 0, 0, // rojo
    // Parte 2
    1, 0, 0, // rojo
    1, 0, 0, // rojo
    1, 0, 0, // rojo
    // Cara 2
    0, 0, 1, // azul
    0, 0, 1, // azul
    0, 0, 1, // azul
    // Parte 2
    0, 0, 1, // azul
    0, 0, 1, // azul
    0, 0, 1, // azul
    // Cara 3
    1, 1, 0, // amarillo
    1, 1, 0, // amarillo
    1, 1, 0, // amarillo
    // Parte 2
    1, 1, 0, // amarillo
    1, 1, 0, // amarillo
    1, 1, 0, // amarillo
    // Cara 4
    0, 1, 0, // verde
    0, 1, 0, // verde
    0, 1, 0, // verde
    // Parte 2
    0, 1, 0, // verde
    0, 1, 0, // verde
    0, 1, 0, // verde
    // Cara 5
    0.6, 0.6, 0.1,
    0.6, 0.6, 0.1,
    0.6, 0.6, 0.1,
    // Parte 2
    0.6, 0.6, 0.1,
    0.6, 0.6, 0.1,
    0.6, 0.6, 0.1,
    // Cara 6
    0.2, 0.6, 0.8,
    0.2, 0.6, 0.8,
    0.2, 0.6, 0.8,
    // Parte 2
    0.2, 0.6, 0.8,
    0.2, 0.6, 0.8,
    0.2, 0.6, 0.8,
  ]);

  geometry.setAttribute('color', new
  THREE.BufferAttribute(colors, 3));

  var material = new THREE.MeshBasicMaterial({
    vertexColors: true,
    //side: THREE.DoubleSide
  });

  var mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
}

function surfaceByFunction(){
  let a = 5, b = 5;  // parámetros
  let size = 400;     // divisiones de la malla
  let range = 4.6;     // rango de x e y

  let vertices = [];
  for (let i = 0; i <= size; i++) {
    for (let j = 0; j <= size; j++) {
      let x = -range + (2*range/size) * i;
      let y = -range + (2*range/size) * j;
      let z = Math.sin(Math.sqrt(a*x*x + b*y*y));
      vertices.push(x, z, y);
    }
  }

  let indices = [];
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let i0 = i*(size+1) + j;
      let i1 = i0 + 1;
      let i2 = i0 + (size+1);
      let i3 = i2 + 1;

      indices.push(i0, i1, i2);
      indices.push(i1, i3, i2);
    }
  }

  let colors = [];

  for (let i = 0; i <= vertices.length - 3; i += 3) {
    let height = vertices[i + 1];               // tu altura
    let t = (height + 1) / 2;                   // normaliza a [0,1]

    let r, g, b;

    if (t <= 0.5) {
      // azul (0,0,1) -> verde (0,1,0)
      let u = t / 0.5;          // 0..1
      r = 0;
      g = u;
      b = 1 - u;
    } else {
      // verde (0,1,0) -> rojo (1,0,0)
      let u = (t - 0.5) / 0.5;  // 0..1
      r = u;
      g = 1 - u;
      b = 0;
    }

    colors.push(r, g, b);
  }
  

  let geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  

  let material = new THREE.MeshBasicMaterial({ 
    vertexColors: true,
    side: THREE.DoubleSide, 
  });

  let surface = new THREE.Mesh(geometry, material);
  scene.add(surface);
}

function perlinNoise(seed){
  let size = 400;     // divisiones de la malla
  let range = 4.6;     // rango de x e y

  let vertices = [];
  for (let i = 0; i <= size; i++) {
    for (let j = 0; j <= size; j++) {
      let x = -range + (2*range/size) * i;
      let y = -range + (2*range/size) * j;
      let z = Math.sin(Math.sqrt(a*x*x + b*y*y));
      vertices.push(x, z, y);
    }
  }

  let indices = [];
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let i0 = i*(size+1) + j;
      let i1 = i0 + 1;
      let i2 = i0 + (size+1);
      let i3 = i2 + 1;

      indices.push(i0, i1, i2);
      indices.push(i1, i3, i2);
    }
  }

  let colors = [];

  for (let i = 0; i <= vertices.length - 3; i += 3) {
    let height = vertices[i + 1];               // tu altura
    let t = (height + 1) / 2;                   // normaliza a [0,1]

    let r, g, b;

    if (t <= 0.5) {
      // azul (0,0,1) -> verde (0,1,0)
      let u = t / 0.5;          // 0..1
      r = 0;
      g = u;
      b = 1 - u;
    } else {
      // verde (0,1,0) -> rojo (1,0,0)
      let u = (t - 0.5) / 0.5;  // 0..1
      r = u;
      g = 1 - u;
      b = 0;
    }

    colors.push(r, g, b);
  }
  

  let geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  

  let material = new THREE.MeshBasicMaterial({ 
    vertexColors: true,
    side: THREE.DoubleSide, 
  });

  let surface = new THREE.Mesh(geometry, material);
  scene.add(surface);
}

function loadScene()
{
    
  //createAxis(10, 0.2);
  surfaceByFunction()
  

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