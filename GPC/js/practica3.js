/**
 * Brazo robot practica 3
 * Movimiento de cámaras
 * 
 * @author ariel96cs@gmail.com
 */


// Modulos necesarios
import * as THREE from "../lib/three.module.js"
import {OrbitControls} from "../lib/OrbitControls.module.js"
import {crearPinza} from "./pinzas.js"

// Variables de consenso
let renderer, scene, camera;

// Camaras adicionales
let miniaturaCamera;
const L = 4;

// Controlador de camera
let cameraControls;

// Otras variables globales
let robotX = 0;
let robotY = 0;
let robotZ = 0;

// Acciones

init();
loadScene();
render();


function init(){
    // Motor de render
    renderer = new THREE.WebGLRenderer();
    // se setea a toda la pantalla del navegador
    renderer.setSize(window.innerWidth,window.innerHeight);

    // se añade el canvas 
    document.getElementById("container").appendChild(renderer.domElement);
    renderer.setClearColor(new THREE.Color(1,1,1));
    renderer.autoClear = false

    // Escena
    scene = new THREE.Scene();
    // scene.background = new THREE.Color(0,0,0.2);

    // Camera
    setCameras(window.innerWidth/window.innerHeight);

    cameraControls = new OrbitControls(camera,renderer.domElement);
    cameraControls.enableRotate = true;
    cameraControls.enablePan = true;
    cameraControls.enableZoom = true;

    //configurar el click derecho para hacer panning
    cameraControls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
    };

    // seleccionar el target que vamos a mirar
    cameraControls.target.set(0,0,0);

    // se añade el listener para el evento 
    window.addEventListener('resize',updateAspectRatio);
}

function setCameras(ar) {

    // Configurar miniCameraOrtografica
    var camaraOrtografica
    camaraOrtografica = new THREE.OrthographicCamera(-L, L, L, -L, -2, 20);
    camaraOrtografica.lookAt(new THREE.Vector3(0, 0, 0));

    miniaturaCamera = camaraOrtografica.clone()
    miniaturaCamera.position.set(0, 10, 0);
    miniaturaCamera.up = new THREE.Vector3(0, 0, -1)
    miniaturaCamera.lookAt(new THREE.Vector3(0, 0, 0))

    // Configurar cámara general perspectiva
    var camaraPerspectiva = new THREE.PerspectiveCamera(75, ar, 0.1, 100);
    camaraPerspectiva.position.set(1, 2, 10);
    camaraPerspectiva.lookAt(new THREE.Vector3(0, 0, 0))
    camera = camaraPerspectiva.clone()

    //Añadir las cámaras a la escena
    scene.add(camera)
    scene.add(miniaturaCamera)

}
/**
 * Función que se llama cuando se cambia el tamaño de la ventana
 * 
 */
function updateAspectRatio(){
    renderer.setSize(window.innerWidth,window.innerHeight);

    const ar = window.innerWidth/window.innerHeight;
    camera.aspect = ar;
    camera.updateProjectionMatrix();

    if (ar > 1) {
        miniaturaCamera.left = -L * ar;
        miniaturaCamera.right  = L * ar;
        miniaturaCamera.top = L;
        miniaturaCamera.bottom = -L; 

    }
    else{
        miniaturaCamera.left = -L;
        miniaturaCamera.right = L;
        miniaturaCamera.top = L/ar;
        miniaturaCamera.bottom = -L/ar; 
    }
    miniaturaCamera.updateProjectionMatrix();
    camera.updateProjectionMatrix();
}

function loadScene(){

    // Crear una geometría para el suelo
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000,50,50); // Ancho y largo del suelo

    // Crear un material para el suelo

    const groundMaterial = new THREE.MeshNormalMaterial({wireframe: false, flatShading: true});// Color del suelo

    // Crear una malla para el suelo
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2; // Rotar el suelo para que sea horizontal en el plano XZ
    scene.add(groundMesh);

    // Crear el brazo del robot
    const robot = new THREE.Object3D();
    const brazo = new THREE.Object3D();
    const antebrazo = new THREE.Object3D();
    const mano = new THREE.Object3D();

    // Se crea el material del robot
    const robotMaterial = new THREE.MeshNormalMaterial({wireframe: false, flatShading: true}); //new THREE.MeshBasicMaterial({ color: 0x0000ff,wireframe: false }); // Color del robot
    
    // Crear la base cilíndrica del brazo del robot
    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.15, 32); // Radio superior, radio inferior, altura, número de caras
    const baseMesh = new THREE.Mesh(baseGeometry, robotMaterial);
    baseMesh.position.y = 0.1; // Levantar la base 0.1 unidades para que no esté enterrada en el suelo

    // El brazo de robot está formado por 4 partes: eje, esparrago, rotula y antebrazo
    // Se crea el eje
    const ejeGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.18, 32); // Radio superior, radio inferior, altura, número de caras
    const ejeMesh = new THREE.Mesh(ejeGeometry, robotMaterial);
    ejeMesh.position.y = 0.25; // Levantar el eje 0.6 unidades para que esté sobre la base
    // rotar eje 90 grados sobre el eje x para que este en vertical
    ejeMesh.rotation.x = Math.PI / 2;

    // Se crea el esparrago
    const esparragoGeometry = new THREE.BoxGeometry(0.18, 1.2, 0.12); // Ancho, alto, profundidad
    const esparragoMesh = new THREE.Mesh(esparragoGeometry, robotMaterial);
    esparragoMesh.position.y = 0.8; // Levantar el espárrago 1.1 unidades para que esté sobre el eje

    // Se crea la rótula
    const rotulaGeometry = new THREE.SphereGeometry(0.2, 32, 32); // Radio, número de caras en ancho y alto    
    const rotulaMesh = new THREE.Mesh(rotulaGeometry, robotMaterial);
    rotulaMesh.position.y = 1.4; // Levantar la rótula 1.2 unidades para que esté sobre el espárrago

    // Se crea el antebrazo
    // Un atebrazo está formado por 3 partes: disco, nervios y mano
    // Se crea el disco
    const discoGeometry = new THREE.CylinderGeometry(0.22, 0.22, 0.06, 32); // Radio superior, radio inferior, altura, número de caras
    const discoMesh = new THREE.Mesh(discoGeometry, robotMaterial);
    // Levantar el disco para que esté centrado sobre la rotula
    discoMesh.position.y = 1.4;

    // Se crean los 4 nervios del antebrazo
    const numNervios = 4;
    const radiusPrisms = 0.1; // Distancia desde el centro del cilindro
    const nervioHeight = 0.8; // Altura de los prismas
    const nervioWidth = 0.04; // Ancho de los nervios

    const nervioGeometry = new THREE.BoxGeometry(nervioWidth, nervioHeight, nervioWidth); // Ancho, alto, profundidad
    // Se añaden los nervios al antebrazo
    for (let i = 0; i < numNervios; i++) {
        const angle = (Math.PI * 2 * i) / numNervios; // Ángulo igual entre los prismas
        const x = Math.cos(angle) * radiusPrisms;
        const z = Math.sin(angle) * radiusPrisms;

        const nervio = new THREE.Mesh(nervioGeometry, robotMaterial);

        nervio.position.set(x, 1.4+nervioHeight/2, z);
        antebrazo.add(nervio);
    }


    // Se crea la mano, que está formada por dos pinzas sobre un cilindro
    // se crea el material de la pinza
    // const pinzasMaterial = new THREE.MeshNormalMaterial({wireframe: fa, flatShading: true}); //new THREE.MeshBasicMaterial({ color: 0x0000ff,wireframe: false }); // Color del robot
    const pinzaIzq = crearPinza(robotMaterial);
    const pinzaDer = crearPinza(robotMaterial);
    const cilindroGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 32); // Radio superior, radio inferior, altura, número de caras
    const cilindroMesh = new THREE.Mesh(cilindroGeometry, robotMaterial);
    // Levantar el cilindro para que esté sobre los nervios, los nervios deben entrar en el cilindro
    cilindroMesh.position.y = 2.3;
    // Rotar el cilindro 90 grados sobre el eje X para que esté en vertical
    cilindroMesh.rotation.x = Math.PI / 2;
    
    // Levantar la pinza
    pinzaIzq.position.y = 2.2;
    pinzaDer.position.y = 2.2;
    // Separar las pinzas
    pinzaIzq.position.z = -0.1;
    pinzaDer.position.z = 0.1;

    // trasladar las pinzas hacia adelante
    pinzaIzq.position.x = 0.1;
    pinzaDer.position.x = 0.1;

    pinzaDer.scale.z = -1; // Invertir la pinza derecha para que ambas pinzas estén enfrentadas

    // Se añade la pinza izquierda a la mano
    mano.add(pinzaIzq);
    // // Se añade la pinza derecha a la mano
    mano.add(pinzaDer);
    // Se añade el cilindro a la mano
    mano.add(cilindroMesh);

    // Se  crea el grafo de escena en este orden, robot -> base -> brazo -> eje esparrago rotula antebrazo -> disco nervios mano
    // Se añade la base al robot    
    robot.add(baseMesh);
    // Se añade el brazo al robot
   
    robot.add(brazo);
    // Se añade el eje al brazo
    brazo.add(ejeMesh);
    // Se añade el espárrago al brazo
    brazo.add(esparragoMesh);
    // Se añade la rótula al brazo
    brazo.add(rotulaMesh);
    // Se añade el antebrazo al brazo
   
    brazo.add(antebrazo);
    // Se añade el disco al antebrazo
    antebrazo.add(discoMesh);
    
    
    // Se añade la mano al antebrazo
    antebrazo.add(mano);
    
    const scale = 3;
    robot.scale.set(scale,scale,scale);
    //se añade el robot a la escena
    scene.add(robot);

    robot.position.set(robotX,robotY,robotZ);
    scene.add(new THREE.AxesHelper(1000));
}

function update(){

}

function render(){
    renderer.clear();
    requestAnimationFrame(render);
    update();
    

    // Renderiza la vista miniatura en la esquina superior izquierda
    var miniaturaSize = 1/4*Math.min(window.innerHeight,window.innerWidth); // Tamaño de la vista miniatura
    var padding = 0; // Espacio entre la vista miniatura y los bordes de la ventana

    renderer.setViewport(padding, window.innerHeight - miniaturaSize - padding, miniaturaSize, miniaturaSize);
    renderer.setScissor(padding, window.innerHeight - miniaturaSize - padding, miniaturaSize, miniaturaSize);

    renderer.render(scene,miniaturaCamera);

    renderer.setViewport(0,0,window.innerWidth,window.innerHeight);
    renderer.render(scene,camera);


}

// 