// Configuración global de las paredes
const WALL_HEIGHT = 70;
const WALL_THICKNESS = 2;
const doors = []

// UTILIDADES
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
  
// CREACIÓN DE HABITACIONES
function createRoom(x, z, width, depth) {
  const geometry = new THREE.PlaneGeometry(width, depth);
  //geometry.rotateX(Math.PI); // <- corrige las normales

  const mesh = new THREE.Mesh(geometry, roomMaterial);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, 0, z);
  scene.add(mesh);

  return { mesh, x, z, width, depth };
}

function fixBoxUVs(geometry, repeatX, repeatY) {
  const uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    const u = uv.getX(i) * repeatX;
    const v = uv.getY(i) * repeatY;
    uv.setXY(i, u, v);
  }
  uv.needsUpdate = true;
}


// CREACIÓN DE PAREDES
function createWall(x, z, widthX, widthZ, material = wallMaterialWithTexture) {
  const wallGeometry = new THREE.BoxGeometry(widthX, WALL_HEIGHT, widthZ);
  const wall = new THREE.Mesh(wallGeometry, material);
  if (widthX == WALL_THICKNESS){
    fixBoxUVs(wallGeometry, widthZ * repeatPerUnit, WALL_HEIGHT * repeatPerUnit);
  }else{
    fixBoxUVs(wallGeometry, widthX * repeatPerUnit, WALL_HEIGHT * repeatPerUnit);
  }
  
  wall.position.set(x, WALL_HEIGHT / 2, z);
  scene.add(wall);
  
  // Configurar las coordenadas UV para que la textura se aplique correctamente a todas las caras
  
  const boxShape = new CANNON.Box(new CANNON.Vec3(widthX / 2, WALL_HEIGHT / 2, widthZ / 2));
  const boxBody = new CANNON.Body({ 
      mass: 0,
      material: wallMaterialCANNON 
  });
  boxBody.addShape(boxShape);
  boxBody.position.set(x, WALL_HEIGHT / 2, z);

  world.addBody(boxBody);
  wallGeometry.body = boxBody;
  
  return {
      mesh: wall,
      type: 'wall',
      position: { x, z },
      dimensions: { widthX, widthZ, height: WALL_HEIGHT },
      material: wallMaterial
  };
}

function createDoor(x, z, widthX, widthZ, material = doorMaterialWithTexture, roomA, roomB) {
  const door = createDoorWithProperUVs(widthX, WALL_HEIGHT, widthZ);
  wall = door[0]
  wallGeometry = door[1]
  /*
  if (widthX == WALL_THICKNESS){
    fixBoxUVs(wallGeometry, widthZ * repeatPerUnit, WALL_HEIGHT * repeatPerUnit);
  }else{
    fixBoxUVs(wallGeometry, widthX * repeatPerUnit, WALL_HEIGHT * repeatPerUnit);
  }*/
  
  wall.position.set(x, WALL_HEIGHT / 2, z);
  scene.add(wall);
  
  // Configurar las coordenadas UV para que la textura se aplique correctamente a todas las caras
  
  const boxShape = new CANNON.Box(new CANNON.Vec3(widthX / 2, WALL_HEIGHT / 2, widthZ / 2));
  const boxBody = new CANNON.Body({ 
      mass: 0,
      material: wallMaterialCANNON 
  });
  boxBody.addShape(boxShape);
  boxBody.position.set(x, WALL_HEIGHT / 2, z);

  world.addBody(boxBody);
  wallGeometry.body = boxBody;
  
  return {
    mesh: wall,
    body: boxBody, // Guardar referencia al cuerpo físico
    type: 'door',
    position: { x, z },
    dimensions: { widthX, widthZ, height: WALL_HEIGHT },
    material: wallMaterial,
    roomA: roomA, 
    roomB: roomB,
    isOpen: false,     // Nueva propiedad
    isOpening: false,  // Nueva propiedad
    originalY: WALL_HEIGHT / 2 // Guardar posición original
  };
}
  
function createWallsForRoom(room, connections, material) {
    const { x, z, width, depth } = room;
    const halfW = width / 2;
    const halfD = depth / 2;
    const connectedDirs = new Set(connections.map(c => c.dir));
    
    const walls = [];
  
    // Norte (+Z)
    if (!connectedDirs.has("N")) {
      walls.push(createWall(x, z + halfD + WALL_THICKNESS / 2, width, WALL_THICKNESS, material));
    }
  
    // Sur (-Z)
    if (!connectedDirs.has("S")) {
      walls.push(createWall(x, z - halfD - WALL_THICKNESS / 2, width, WALL_THICKNESS, material));
    }
  
    // Este (+X)
    if (!connectedDirs.has("E")) {
      walls.push(createWall(x + halfW + WALL_THICKNESS / 2, z, WALL_THICKNESS, depth, material));
    }
  
    // Oeste (-X)
    if (!connectedDirs.has("W")) {
      walls.push(createWall(x - halfW - WALL_THICKNESS / 2, z, WALL_THICKNESS, depth, material));
    }
  
    return walls;
}
  
  //  HABITACIONES EN CUADRÍCULA 
 function createGridRooms(rows = 5, cols = 5, roomSize = 100, spacing = 20) {
    const rooms = [];
    var mapWidth = cols * (roomSize + spacing);
    var mapDepth = rows * (roomSize + spacing);
    const startX = -mapWidth / 2 + roomSize / 2;
    const startZ = -mapDepth / 2 + roomSize / 2;
  
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * (roomSize + spacing);
        const z = startZ + row * (roomSize + spacing);
        rooms.push(createRoom(x, z, roomSize, roomSize));
      }
    }
  
    return rooms;
}
  
//  CREACIÓN DE PASILLOS 
function createCorridor(roomA, roomB, material) {
  const dx = roomB.x - roomA.x;
  const dz = roomB.z - roomA.z;
  const corridorWidth = 60;

  const corridorData = {
    roomA: roomA,
    roomB: roomB,
    corridor: null,
    walls: [],
    type: 'corridor'
  };

  // === HORIZONTAL ===
  if (Math.abs(dx) > Math.abs(dz)) {
    const widthX = Math.abs(dx) - roomA.width;

    if (widthX > 0) {
      // Suelo del pasillo
      const corridor = new THREE.Mesh(
        new THREE.PlaneGeometry(widthX, corridorWidth),
        material
      );
      corridor.rotation.x = -Math.PI / 2;
      corridor.position.set((roomA.x + roomB.x) / 2, 0.05, roomA.z);
      scene.add(corridor);

      corridorData.corridor = {
        mesh: corridor,
        dimensions: { width: widthX, depth: corridorWidth },
        position: { x: (roomA.x + roomB.x) / 2, z: roomA.z },
        orientation: 'horizontal'
      };

      // === Pared central del pasillo ===
      const midX = (roomA.x + roomB.x) / 2;
      const midZ = roomA.z;

      const door = createDoor(
        midX,           // posición x en el centro
        midZ,           // posición z en el centro
        WALL_THICKNESS + 5, // grosor
        corridorWidth,  // ancho del pasillo
        doorMaterial,
        roomA,
        roomB
      );
      // Ajustar la altura visual del muro
      door.mesh.position.y = WALL_HEIGHT / 2;
      doors.push(door)

      // === Paredes laterales ===
      const wallOffset = corridorWidth / 2 + WALL_THICKNESS / 2;

      // Superior (+Z)
      corridorData.walls.push(createWall(midX, midZ + wallOffset, widthX - WALL_THICKNESS, WALL_THICKNESS, wallMaterial));

      // Inferior (-Z)
      corridorData.walls.push(createWall(midX, midZ - wallOffset, widthX - WALL_THICKNESS, WALL_THICKNESS, wallMaterial));

      // Paredes del lado de la habitación A
      let posx = roomA.x + roomA.width / 2;
      let posz = roomA.z + roomA.depth / 2 - (roomA.depth / 2 - corridorWidth / 2) / 2;
      corridorData.walls.push(createWall(posx, posz, WALL_THICKNESS, roomA.depth / 2 - corridorWidth / 2, wallMaterial));

      posz = roomA.z - roomA.depth / 2 + (roomA.depth / 2 - corridorWidth / 2) / 2;
      corridorData.walls.push(createWall(posx, posz, WALL_THICKNESS, roomA.depth / 2 - corridorWidth / 2, wallMaterial));

      // Paredes del lado de la habitación B
      posx = roomB.x - roomB.width / 2;
      posz = roomB.z + roomB.depth / 2 - (roomB.depth / 2 - corridorWidth / 2) / 2;
      corridorData.walls.push(createWall(posx, posz, WALL_THICKNESS, roomB.depth / 2 - corridorWidth / 2, wallMaterial));

      posz = roomB.z - roomB.depth / 2 + (roomB.depth / 2 - corridorWidth / 2) / 2;
      corridorData.walls.push(createWall(posx, posz, WALL_THICKNESS, roomB.depth / 2 - corridorWidth / 2, wallMaterial));
    }
  }

  // === VERTICAL ===
  else {
    const widthZ = Math.abs(dz) - roomA.depth;

    if (widthZ > 0) {
      // Suelo del pasillo
      const corridor = new THREE.Mesh(
        new THREE.PlaneGeometry(corridorWidth, widthZ),
        material
      );
      corridor.rotation.x = -Math.PI / 2;
      corridor.position.set(roomA.x, 0.05, (roomA.z + roomB.z) / 2);
      scene.add(corridor);

      corridorData.corridor = {
        mesh: corridor,
        dimensions: { width: corridorWidth, depth: widthZ },
        position: { x: roomA.x, z: (roomA.z + roomB.z) / 2 },
        orientation: 'vertical'
      };

      // === Pared central del pasillo ===
      const midX = roomA.x;
      const midZ = (roomA.z + roomB.z) / 2;

      const door = createDoor(
        midX,           // posición X centro
        midZ,           // posición Z centro
        corridorWidth,  // ancho del pasillo
        WALL_THICKNESS + 5, // grosor
        doorMaterial,
        roomA,
        roomB
      );
      door.mesh.position.y = WALL_HEIGHT / 2;
      doors.push(door)

      // === Paredes laterales ===
      const wallOffset = corridorWidth / 2 + WALL_THICKNESS / 2;

      // Izquierda (-X)
      corridorData.walls.push(createWall(midX - wallOffset, midZ, WALL_THICKNESS, widthZ - WALL_THICKNESS, wallMaterial));

      // Derecha (+X)
      corridorData.walls.push(createWall(midX + wallOffset, midZ, WALL_THICKNESS, widthZ - WALL_THICKNESS, wallMaterial));

      // Paredes del lado de la habitación A
      let posx = roomA.x + roomA.width / 2 - (roomA.width / 2 - corridorWidth / 2) / 2;
      let posz = roomA.z + roomA.depth / 2;
      corridorData.walls.push(createWall(posx, posz, roomA.width / 2 - corridorWidth / 2, WALL_THICKNESS, wallMaterial));

      posx = roomA.x - roomA.width / 2 + (roomA.width / 2 - corridorWidth / 2) / 2;
      corridorData.walls.push(createWall(posx, posz, roomA.width / 2 - corridorWidth / 2, WALL_THICKNESS, wallMaterial));

      // Paredes del lado de la habitación B
      posx = roomB.x + roomB.width / 2 - (roomB.width / 2 - corridorWidth / 2) / 2;
      posz = roomB.z - roomB.depth / 2;
      corridorData.walls.push(createWall(posx, posz, roomB.width / 2 - corridorWidth / 2, WALL_THICKNESS, wallMaterial));

      posx = roomB.x - roomB.width / 2 + (roomB.width / 2 - corridorWidth / 2) / 2;
      corridorData.walls.push(createWall(posx, posz, roomB.width / 2 - corridorWidth / 2, WALL_THICKNESS, wallMaterial));
    }
  }

  return corridorData;
}
  
  //  CONEXIONES ALEATORIAS PERO CONEXAS (MST tipo Kruskal) 
 function createConnectingCorridors(rooms, rows, cols) {
    const edges = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const room = rooms[i];
  
        // Vecino derecha
        if (c < cols - 1) {
          edges.push({ a: i, b: i + 1, dirA: "E", dirB: "W", weight: Math.random() });
        }
        // Vecino abajo
        if (r < rows - 1) {
          edges.push({ a: i, b: i + cols, dirA: "N", dirB: "S", weight: Math.random() });
        }
      }
    }
  
    edges.sort((a, b) => a.weight - b.weight);
  
    const parent = Array(rooms.length).fill(0).map((_, i) => i);
    function find(i) {
      if (parent[i] !== i) parent[i] = find(parent[i]);
      return parent[i];
    }
    function union(a, b) {
      parent[find(a)] = find(b);
    }
  
    const connections = new Map(rooms.map(r => [r, []]));
    const allCorridors = []; // Array para guardar todos los pasillos
    const allWalls = []; // Array para guardar todas las paredes
  
    for (const e of edges) {
      if (find(e.a) !== find(e.b)) {
        union(e.a, e.b);
  
        const roomA = rooms[e.a];
        const roomB = rooms[e.b];
        
        // Crear pasillo y guardar referencia
        const corridorData = createCorridor(roomA, roomB, corridorMaterial);
        allCorridors.push(corridorData);
        
        // Agregar paredes del pasillo a la lista general
        allWalls.push(...corridorData.walls);
  
        connections.get(roomA).push({ target: roomB, dir: e.dirA });
        connections.get(roomB).push({ target: roomA, dir: e.dirB });
      }
    }
  
    // ---- Crear paredes de las habitaciones y guardar referencias
    for (const room of rooms) {
      const roomWalls = createWallsForRoom(room, connections.get(room), wallMaterial);
      allWalls.push(...roomWalls);
    }
  
    return {
      corridors: allCorridors,
      walls: allWalls,
      connections: connections
    };
}
  
  
 function createCeiling(rooms, corridors) {
    const ceilingData = {
      roomCeilings: [],
      corridorCeilings: []
    };
  
    // 1. Copiar habitaciones (techos)
    rooms.forEach(room => {
      const ceilingGeometry = room.mesh.geometry.clone();
      const ceilingMaterial = room.mesh.material.clone();
      ceilingMaterial.color.setHex(0x88888888); // Color diferente para techo

      // Invertir las normales para que apunten hacia abajo
      ceilingGeometry.rotateX(Math.PI);

      const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
      ceiling.rotation.x = -Math.PI / 2;
      ceiling.position.set(room.x, WALL_HEIGHT + 0.1, room.z);
      scene.add(ceiling);
      
      ceilingData.roomCeilings.push({
        mesh: ceiling,
        originalRoom: room,
        type: 'room_ceiling'
      });

      // Techo para el minimapa
      const ceilingMapGeometry = room.mesh.geometry.clone();
      const ceilingMapMaterial = new THREE.MeshBasicMaterial({
        color: "#8ff",
        transparent: true,
        opacity: 1,
      });
      const ceilingMap = new THREE.Mesh(ceilingMapGeometry, ceilingMapMaterial);
      ceilingMap.rotation.x = -Math.PI / 2;
      ceilingMap.position.set(room.x, WALL_HEIGHT  * 2, room.z);
      scene.add(ceilingMap);

    });
  
    // 2. Copiar pasillos (techos)
    corridors.forEach(corridor => {
      if (corridor.corridor && corridor.corridor.mesh) {
        const corridorCeilingGeometry = corridor.corridor.mesh.geometry.clone();
        //const corridorCeilingMaterial = corridor.corridor.mesh.material.clone();
        //corridorCeilingMaterial.color.setHex(0xAAAAAA);
        
        const corridorCeiling = new THREE.Mesh(corridorCeilingGeometry, corridorMaterial);
        corridorCeiling.rotation.x = -Math.PI / 2;
        corridorCeiling.position.copy(corridor.corridor.mesh.position);
        corridorCeiling.position.y = WALL_HEIGHT + 0.1; // Mover a altura de paredes
        scene.add(corridorCeiling);
        
        ceilingData.corridorCeilings.push({
          mesh: corridorCeiling,
          originalCorridor: corridor,
          type: 'corridor_ceiling'
        });

        // Techo para el minimapa
        const ceilingMapGeometry = corridor.corridor.mesh.geometry.clone();
        const ceilingMapMaterial = new THREE.MeshBasicMaterial({
          color: "#8ff",
          transparent: true,
          opacity: 1,
        });
        const ceilingMap = new THREE.Mesh(ceilingMapGeometry, ceilingMapMaterial);
        ceilingMap.rotation.x = -Math.PI / 2;
        ceilingMap.position.copy(corridor.corridor.mesh.position);
        ceilingMap.position.y = WALL_HEIGHT * 2; // Mover a altura de paredes
        scene.add(ceilingMap);

      }
    });
  
    return ceilingData
}



function selectFarRooms(rooms){
    let maxDistance = 0;
    let roomA = null;
    let roomB = null;
  
    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
  
        const dx = rooms[i].x - rooms[j].x;
        const dz = rooms[i].z - rooms[j].z;
        const dist = Math.sqrt(dx * dx + dz * dz);
  
        if (dist > maxDistance) {
          maxDistance = dist;
          roomA = rooms[i];
          roomB = rooms[j];
        }
      }
    }
    return [roomA, roomB]
  }
  

function createDoorWithProperUVs(widthX, height, widthZ) {
    const geometry = new THREE.BoxGeometry(widthX, height, widthZ);
    
    // Obtener atributos UV
    const uvs = geometry.attributes.uv;
    
    // Ajustar UVs para que la textura se muestre correctamente en cada cara
    for (let i = 0; i < uvs.count; i++) {
        const u = uvs.getX(i);
        const v = uvs.getY(i);
        
        // Escalar UVs para que la textura ocupe toda la cara
        uvs.setX(i, u);
        uvs.setY(i, v);
    }
    
    // Forzar actualización
    uvs.needsUpdate = true;
    
    return [new THREE.Mesh(geometry, doorMaterial), geometry];
}