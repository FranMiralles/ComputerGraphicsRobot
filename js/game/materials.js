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
const roomMaterial = new THREE.MeshLambertMaterial({
    map: roomTexture,
    roughness: 0.8,
    side: THREE.DoubleSide
});
  "metal_128"

const corridorTexture = new THREE.TextureLoader().load('images/metal_128.jpg');
corridorTexture.wrapS = corridorTexture.wrapT = THREE.RepeatWrapping;
corridorTexture.minFilter = THREE.LinearMipMapLinearFilter;
corridorTexture.magFilter = THREE.LinearFilter;


const corridorMaterial = new THREE.MeshLambertMaterial({
    map: corridorTexture,
    roughness: 0.8,
    side: THREE.DoubleSide
});
  
const wallTexture = new THREE.TextureLoader().load('images/brick.jpg');
wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
wallTexture.minFilter = THREE.LinearMipMapLinearFilter;
wallTexture.magFilter = THREE.LinearFilter;

const repeatPerUnit = 0.05;

const wallMaterial = new THREE.MeshLambertMaterial({
  map: wallTexture,
  roughness: 0.8,
  metalness: 0.2
});

const groundMaterial = new THREE.MeshBasicMaterial({
    color: "black",
    side: THREE.DoubleSide
});