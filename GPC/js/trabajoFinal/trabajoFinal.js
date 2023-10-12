/**
 * Trabajo final GPC
 * Laberinto 3D rotativo con texturas
 * 
 * Se trata de un laberinto circular en 3D que gira sobre sí mismo. 
 * Al comenzar el juego, se pone una bola en el centro del laberinto y el usuario debe
 * rotar el tablero para que la bola llegue al final del laberinto, donde hay un agujero.
 * 
 * Las paredes del laberinto tienen texturas de ladrillo y el suelo tiene una textura de
 * madera. La bola tiene una textura de mármol. A medida que pasa el tiempo   
 * van apareciendo más bolas en el tablero que aparecen en el centro. El usuario debe
 * colar todas las bolas en el agujero sin que se caigan del tablero.
 *  
 * Las rotaciones del tablero se hacen con las flechas del teclado.
 * Al pulsar la tecla 'r' se reinicia el juego.
 * Al pulsar la tecla 'p' se pausa el juego.
 * Al pulsar la tecla 's' se reanuda el juego.
 * Al pulsar la tecla 'c' se cambia la cámara.
 * 
 * author: Ariel Coto Santiesteban
 * email: acotsan@upv.edu.es
 */

// Modulos necesarios
import * as THREE from "../../lib/three.module.js"
import {OrbitControls} from "../../lib/OrbitControls.module.js"
import {GUI} from "../../lib/lil-gui.module.min.js"
import {TWEEN} from "../../lib/tween.module.min.js"

import {PlayBox} from "./playBox.js"

// Variables de consenso
let renderer, scene, camera;

// Camaras adicionales
let miniaturaCamera;
const L = 4;

// Controlador de camera
let cameraControls;

// Otras variables globales
let playBox;
let effectControler;

// Acciones

init();
loadScene();
setupGUI();
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

    //Añadir una luz
    const luzAmbiente = new THREE.AmbientLight(0xFFFFFF,0.5);
    luzAmbiente.position.set(0,0,0);
    scene.add(luzAmbiente);


    // Añadadir objetos a la escena
    playBox = new PlayBox();
    playBox.addToScene(scene);   

    scene.add(new THREE.AxesHelper(1000));
    // Llama a la función para visualizar la escena
    

}
function setupGUI(){  
    // Definicion de los controles
    effectControler = {
        rotateHandleLR: 0,
        rotateHandleUD: 0,
        initial_balls: 1,
    }

    // Creacion interfaz
    const gui = new GUI();

    // Construccion del menu de widgets
    const menu = gui.addFolder('Control Robot');
    menu.add(effectControler,'rotateHandleLR',-0.25,0.25,0.005).name('Giro X');
    menu.add(effectControler,'rotateHandleUD',-0.25,0.25,0.005).name('Giro Z');

}

function update(delta){

    TWEEN.update(delta);

    // Actualizar el mesa rotatoria
    playBox.rotateHandleLR(effectControler.rotateHandleLR);
    playBox.rotateHandleUD(effectControler.rotateHandleUD);
    // playBox.update(delta);
    

}

function render(delta){
    renderer.clear();
    requestAnimationFrame(render);
    update(delta);
    

    // Renderiza la vista miniatura en la esquina superior izquierda
    var miniaturaSize = 1/4*Math.min(window.innerHeight,window.innerWidth); // Tamaño de la vista miniatura
    var padding = 0; // Espacio entre la vista miniatura y los bordes de la ventana

    renderer.setViewport(padding, window.innerHeight - miniaturaSize - padding, miniaturaSize, miniaturaSize);
    renderer.setScissor(padding, window.innerHeight - miniaturaSize - padding, miniaturaSize, miniaturaSize);

    renderer.render(scene,miniaturaCamera);

    renderer.setViewport(0,0,window.innerWidth,window.innerHeight);
    renderer.render(scene,camera);

}