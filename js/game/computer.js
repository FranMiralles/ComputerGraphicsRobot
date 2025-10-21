function createServer({ position = { x: 0, y: 0, z: 0 }, scale = 1.0 }) {
  const group = new THREE.Group();
  group.position.set(position.x, position.y, position.z);
  group.scale.setScalar(scale);

  const colorChasis = 0x44484d;     // gris metálico
  const colorPanel = 0x222831;      // panel frontal más oscuro
  const colorBandejas = 0x111111;   // interior negro
  const colorLed = 0x00ff88;        // verde neón
  const colorPantalla = 0x1e90ff;   // azul brillante

  const matChasis = new THREE.MeshPhongMaterial({ color: colorChasis, shininess: 40 });
  const matPanel = new THREE.MeshPhongMaterial({ color: colorPanel, shininess: 10 });
  const matBandejas = new THREE.MeshPhongMaterial({ color: colorBandejas, shininess: 5 });
  const matLed = new THREE.MeshPhongMaterial({ color: colorLed, emissive: colorLed, emissiveIntensity: 0.8 });
  const matPantalla = new THREE.MeshPhongMaterial({ color: colorPantalla, emissive: colorPantalla, emissiveIntensity: 1.5 });

  const rackWidth = 0.6;
  const rackHeight = 1.8;
  const rackDepth = 0.9;

  // Chasis principal
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(rackWidth, rackHeight, rackDepth), matChasis);
  chassis.position.set(0, rackHeight / 2, 0);
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  group.add(chassis);

  // Panel frontal
  const frontPanel = new THREE.Mesh(new THREE.BoxGeometry(rackWidth * 0.98, rackHeight * 0.98, 0.05), matPanel);
  frontPanel.position.set(0, rackHeight / 2, rackDepth / 2 + 0.025);
  frontPanel.castShadow = true;
  group.add(frontPanel);

  // Bandejas horizontales internas
  const trayGeom = new THREE.BoxGeometry(rackWidth * 0.9, 0.02, rackDepth * 0.8);
  for (let i = 0; i < 5; i++) {
    const tray = new THREE.Mesh(trayGeom, matBandejas);
    tray.position.set(0, 0.3 + i * 0.25, 0);
    tray.castShadow = true;
    group.add(tray);
  }

  // LEDs
  const ledGeom = new THREE.SphereGeometry(0.015, 8, 8);
  for (let i = 0; i < 5; i++) {
    const led = new THREE.Mesh(ledGeom, matLed);
    led.position.set(-rackWidth / 2 + 0.05 + (i * 0.05), 0.15, rackDepth / 2 + 0.03);
    group.add(led);
  }

  // Pantalla
  const screenGeo = new THREE.PlaneGeometry(0.25, 0.12);
  const screenMesh = new THREE.Mesh(screenGeo, matPantalla);
  screenMesh.position.set(0, rackHeight * 0.75, rackDepth / 2 + 0.03);
  group.add(screenMesh);

  const screenLight = new THREE.PointLight(colorPantalla, 0.8, 3);
  screenLight.position.set(0, rackHeight * 0.75, rackDepth / 2 + 0.1);
  group.add(screenLight);

  // Añadir a escena
  if (scene) scene.add(group);

  const mass = 40 * scale;
  const body = new CANNON.Body({ mass });
  const mainBox = new CANNON.Box(new CANNON.Vec3((rackWidth / 2) * scale, (rackHeight / 2) * scale, (rackDepth / 2) * scale));
  body.addShape(mainBox, new CANNON.Vec3(0, (rackHeight / 2) * scale, 0));
  body.position.set(position.x, position.y, position.z);

  if (world) world.addBody(body);

  body.addEventListener('collide', function (e) {
    if (e.body.id === player.body.id && battery >= 1 && finishGame != true) {
        player.body.position.set(farRooms[0].x, farRooms[0].x)
        finishGame = true
        
    }
  });

  function setScale(newScale) {
    group.scale.setScalar(newScale);
  }

  function setPosition(x, y, z) {
    group.position.set(x, y, z);
    body.position.set(x, y, z);
  }

  return { meshGroup: group, body, setScale, setPosition };
}
