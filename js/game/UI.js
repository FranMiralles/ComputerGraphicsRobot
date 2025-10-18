var miniMapSize;

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

function calculateMiniMapSize() {
    // 1/4 de la dimensión menor de la vista general
    var minDimension = Math.min(window.innerWidth, window.innerHeight);
    miniMapSize = Math.floor(minDimension / 4);
}


// FPS
const stats = new Stats();
stats.showPanel(0);
document.getElementById('container').appendChild(stats.domElement);

// Aplicar estilos
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '10px';
stats.domElement.style.right = '10px';
stats.domElement.style.left = 'auto';
stats.domElement.style.zIndex = '1000';