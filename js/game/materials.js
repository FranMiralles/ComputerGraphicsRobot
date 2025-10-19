const groundMaterialCANNON = new CANNON.Material("groundMaterial");
const wallMaterialCANNON = new CANNON.Material("wallMaterial");
const playerMaterialCANNON = new CANNON.Material("playerMaterial");

const playerMaterial = new THREE.MeshBasicMaterial({
    color: "blue",
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide
});
  
const roomTexture = new THREE.TextureLoader().load('images/ground.jpg');
roomTexture.wrapS = roomTexture.wrapT = THREE.RepeatWrapping;
roomTexture.minFilter = THREE.LinearMipMapLinearFilter;
roomTexture.magFilter = THREE.LinearFilter;
const roomMaterial = new THREE.MeshPhongMaterial({
    map: roomTexture,
    side: THREE.DoubleSide
});


const corridorTexture = new THREE.TextureLoader().load('images/metal_128.jpg');
corridorTexture.wrapS = corridorTexture.wrapT = THREE.RepeatWrapping;
corridorTexture.minFilter = THREE.LinearMipMapLinearFilter;
corridorTexture.magFilter = THREE.LinearFilter;


const corridorMaterial = new THREE.MeshPhongMaterial({
    map: corridorTexture,
    side: THREE.DoubleSide
});
  
const wallTexture = new THREE.TextureLoader().load('images/brick.jpg');
wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
wallTexture.minFilter = THREE.LinearMipMapLinearFilter;
wallTexture.magFilter = THREE.LinearFilter;

const repeatPerUnit = 0.05;

const wallMaterial = new THREE.MeshPhongMaterial({
  map: wallTexture,
  metalness: 0.2,
  side: THREE.DoubleSide
});

const groundMaterial = new THREE.MeshBasicMaterial({
    color: "black",
    side: THREE.DoubleSide
});


const WoodTexture = new THREE.TextureLoader().load('images/wood512.jpg');
const batMaterial = new THREE.MeshPhongMaterial({ map: WoodTexture, shininess: 60 });


const doorTexture = new THREE.TextureLoader().load('images/door.jpg');
doorTexture.wrapS = THREE.RepeatWrapping;
doorTexture.wrapT = THREE.RepeatWrapping;
doorTexture.repeat.set(1, 1); // Mostrar la textura una vez

const doorMaterial = new THREE.MeshPhongMaterial({
    map: doorTexture,
    metalness: 0.2,
    side: THREE.DoubleSide
});