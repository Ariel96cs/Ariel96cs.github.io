/**
 * Brazo robot practica 4
 * Interacción Animación
 * 
 * @author ariel96cs@gmail.com
 */


// Modulos necesarios
import * as THREE from "../lib/three.module.js"
import {OrbitControls} from "../lib/OrbitControls.module.js"
import {Robot} from "./robot.js"
import {GUI} from "../lib/lil-gui.module.min.js"
import {TWEEN} from "../lib/tween.module.min.js"

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

let robot;

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
    window.addEventListener('keydown', onRobotMoveKeyDown, false);
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
function onRobotMoveKeyDown(event){
    console.log("Evento de tecla presionada");
    console.log(event.key);
    const step = 1;
        if (event.key === "ArrowLeft") {
            // Tecla de flecha izquierda
            //mover el robot a la izquierda
            robot.position.x -= step;
        } else if (event.key === "ArrowUp") {
            // Tecla de flecha arriba
            // mover el robot hacia delante
            robot.position.z -= step;
        } else if (event.key === "ArrowRight") {
            // Tecla de flecha derecha
            // mover el robot a la derecha
            robot.position.x += step;
          
        } else if (event.key === "ArrowDown") {
            // Tecla de flecha abajo
           // mover el robot hacia atrás
              robot.position.z += step;
        }
    
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

    miniaturaCamera.updateProjectionMatrix();
    
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

    // Crear el robot
    robot = new Robot();
    
    //se añade el robot a la escena
    scene.add(robot);

    // Posicionar el robot
    robot.setPosition(robotX,robotY,robotZ);
    robot.addToScene(scene);

    scene.add(new THREE.AxesHelper(1000));

    // events
    
}
function setupGUI(){  
    // Definicion de los controles
    effectControler = {
        giroBase: 0.0,
        giroBrazo:0.0,
        giroAntebrazoY: 0.0,
        giroAntebrazoZ: 0.0,
        giroPinza: 0.0,
        separacionPinza: 10.0,
        solidAlambres: true,
    }

    // Creacion interfaz
    const gui = new GUI();

    // Construccion del menu de widgets
    const menu = gui.addFolder('Control Robot');
    menu.add(effectControler,'giroBase',-180,180,0.025).name('Giro Base').listen().
        onChange(function(value){
            robot.setGiroBase(value);
        });
    menu.add(effectControler,'giroBrazo',-45,45,0.025).name('Giro Brazo').listen()
        .onChange(function(value){
            robot.setGiroBrazo(value);
        });
    menu.add(effectControler,'giroAntebrazoY',-180,180,0.025).name('Giro Antebrazo Y').listen()
        .onChange(function(value){
            robot.setGiroAntebrazoY(value);
        });
    menu.add(effectControler,'giroAntebrazoZ',-90,90,0.025).name('Giro Antebrazo Z').listen()
        .onChange(function(value){
            robot.setGiroAntebrazoZ(value);
        });
    menu.add(effectControler,'giroPinza',-40,220,0.025).name('Giro Pinza').listen()
        .onChange(function(value){
            robot.setGiroPinza(value);
        });
    menu.add(effectControler,'separacionPinza',0,15,0.025).name('Separacion Pinza')
        .onChange(function(value){
            robot.setSeparacionPinza(value);
        });
    menu.add(effectControler,'solidAlambres').name('Solid/Alambres')
        .onChange(function(value){
            robot.setSolidAlambres(value);
        });
    // añadir  boton para lanzar animacion de robot
    menu.add({playAnimation: function(){
        playAnimation();
    }},'playAnimation').name('Animacion');

}
function playAnimation(){
    let animation1 = robot.animationMoveObject(effectControler);
    animation1.start();
}

function update(delta){

    
    // Actualizar el robot          
    // robot.setGiroBase(effectControler.giroBase);
    // robot.setGiroBrazo(effectControler.giroBrazo);
    // robot.setGiroAntebrazoY(effectControler.giroAntebrazoY);
    // robot.setGiroAntebrazoZ(effectControler.giroAntebrazoZ);
    // robot.setGiroPinza(effectControler.giroPinza);
    // robot.setSeparacionPinza(effectControler.separacionPinza);
    // robot.setSolidAlambres(effectControler.solidAlambres);
    
    TWEEN.update(delta);
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

// 