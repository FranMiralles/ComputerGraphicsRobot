function createPowerUp(x, z, type) {
  // Cargar la textura
  const textureLoader = new THREE.TextureLoader();
  var texture;
  if (type == "heal"){
        texture = textureLoader.load('images/Heal.png');
    }
    if (type == "speed"){
        texture = textureLoader.load('images/Speed.png');
    }
    if (type == "push"){
        texture = textureLoader.load('images/Push.png');
    }
    if (type == "damage"){
        texture = textureLoader.load('images/Punch.png');
    }
    if (type == "battery"){
        texture = textureLoader.load('images/Battery.png');
    }
  

  // Crear el material básico (visible por ambos lados)
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide
  });

  // Crear el plano (1x1 unidades, puedes ajustar)
  const geometry = new THREE.PlaneGeometry(10, 10);
  const healPlane = new THREE.Mesh(geometry, material);

  // Posicionar en el mundo
  healPlane.position.set(x, 20, z); // un poco elevado sobre el suelo
  healPlane.rotation.y = 0;

  // Habilitar sombras si quieres interacción visual
  healPlane.castShadow = false;
  healPlane.receiveShadow = false;

  // Añadir al escenario
  scene.add(healPlane);

  return {
    "obj": healPlane,
    "type": type,
    };
}