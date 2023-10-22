/**
 * Brazo robot practica 5
 * Luces y Materiales
 * 
 * @author ariel96cs@gmail.com
 */


// Modulos necesarios
import * as THREE from "../lib/three.module.js"
import {OrbitControls} from "../lib/OrbitControls.module.js"
import {Robot} from "./robot.js"
import {GUI} from "../lib/lil-gui.module.min.js"
import {TWEEN} from "../lib/tween.module.min.js"
import Stats from "../lib/stats.module.js"

// Variables de consenso
let renderer, scene, camera;

// Camaras adicionales
let miniaturaCamera;
const L = 4;

// Controlador de camera
let cameraControls;

// Otras variables globales
let stats;

let robot;
let groundMesh;

let effectControler;

// Acciones

init();
loadScene();
setupGUI();
render();


function init(){
    // Motor de render
    renderer = new THREE.WebGLRenderer({antialias:true});
    // se setea a toda la pantalla del navegador
    renderer.setSize(window.innerWidth,window.innerHeight);

    // se añade el canvas 
    document.getElementById("container").appendChild(renderer.domElement);
    renderer.setClearColor(new THREE.Color(1,1,1));
    renderer.autoClear = false
    renderer.antialias = true;
    renderer.shadowMap.enabled = true;

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

    // Luces
    const ambiental = new THREE.AmbientLight(0x222222);
    scene.add(ambiental);

    const direccional = new THREE.DirectionalLight(0xFFFFFF,0.5);
    direccional.position.set(-1,5,-1);
    direccional.castShadow = true;
    scene.add(direccional);

    const puntual = new THREE.PointLight(0xFFFFFF,0.4);
    puntual.position.set(2,7,-4);
    scene.add(puntual);

    const focal = new THREE.SpotLight(0xFFFFFF,0.4);
    focal.position.set(0,20,10);
    focal.target.position.set(0,0,0);
    focal.angle = Math.PI/8;
    focal.penumbra = 0.2;
    focal.castShadow = true;

    scene.add(focal);
    const spotLightHelper = new THREE.SpotLightHelper(focal);
    scene.add(spotLightHelper);

    // Monitor
    stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '30px';
    stats.domElement.style.left = '0px';

    document.getElementById('container').appendChild(stats.domElement);

    // se añade el listener para el evento 
    window.addEventListener('resize',updateAspectRatio);
    window.addEventListener('keydown',onRobotMoveKeyDown,false);
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
function enableCastShadow(object) {
    if (object instanceof THREE.Object3D) {
        object.castShadow = true; // Enable castShadow for the current object
        object.children.forEach((child) => enableCastShadow(child)); // Recursively enable castShadow for children
    }
}

function enableReceiveShadow(object) {
    if (object instanceof THREE.Object3D) {
        object.receiveShadow = true; // Enable receiveShadow for the current object
        object.children.forEach((child) => enableReceiveShadow(child)); // Recursively enable receiveShadow for children
    }
}

function loadScene(){

    // Crear una geometría para el suelo
    const groundGeometry = new THREE.PlaneGeometry(50, 50,2,2); // Ancho y largo del suelo

    // Crear un material para el suelo
    const groundTex = new THREE.TextureLoader().load('./imgs/pisometalico_1024.jpg');
    groundTex.repeat.set(2,2);
    groundTex.wrapS = groundTex.wrapT = THREE.RepeatWrapping;
    groundTex.magFilter = THREE.LinearFilter;
    groundTex.minFilter = THREE.LinearFilter;

    const groundMaterial = new THREE.MeshLambertMaterial({map: groundTex}); // Color del suelo

    // Crear una malla para el suelo
    groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2; // Rotar el suelo para que sea horizontal en el plano XZ
    groundMesh.receiveShadow = true;
   

    // Crear el robot
    robot = new Robot(3,true);
    enableCastShadow(robot);
    enableReceiveShadow(robot);
    
    //se añade el robot a la escena
    scene.add(robot);

    // Posicionar el robot
    // robot.setPosition(robotX,robotY,robotZ);
    //robot.addToScene(scene);


    // Habitacion
    const paredes = [];
    paredes.push(new THREE.MeshBasicMaterial({side:THREE.BackSide,
                                            map:new THREE.TextureLoader().load("./imgs/posx.jpg")}));
    paredes.push(new THREE.MeshBasicMaterial({side:THREE.BackSide,
                                            map:new THREE.TextureLoader().load("./imgs/negx.jpg")}));
    paredes.push(new THREE.MeshBasicMaterial({side:THREE.BackSide,
                                            map:new THREE.TextureLoader().load("./imgs/posy.jpg")}));
    paredes.push(new THREE.MeshBasicMaterial({side:THREE.BackSide,
                                            map:new THREE.TextureLoader().load("./imgs/negy.jpg")}));
    paredes.push(new THREE.MeshBasicMaterial({side:THREE.BackSide,
                                            map:new THREE.TextureLoader().load("./imgs/posz.jpg")}));
    paredes.push(new THREE.MeshBasicMaterial({side:THREE.BackSide,
                                            map:new THREE.TextureLoader().load("./imgs/negz.jpg")}));

    const geoHabitacion = new THREE.BoxGeometry(50,50,25);
    const habitacion = new THREE.Mesh(geoHabitacion,paredes);
    scene.add(habitacion);
    scene.add(groundMesh);
    scene.add(new THREE.AxesHelper(1000));

    
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
    menu.add(effectControler,'giroBase',-180,180,0.025).name('Giro Base').listen();
    menu.add(effectControler,'giroBrazo',-45,45,0.025).name('Giro Brazo').listen();
    menu.add(effectControler,'giroAntebrazoY',-180,180,0.025).name('Giro Antebrazo Y').listen();
    menu.add(effectControler,'giroAntebrazoZ',-90,90,0.025).name('Giro Antebrazo Z').listen();
    menu.add(effectControler,'giroPinza',-40,220,0.025).name('Giro Pinza').listen();
    menu.add(effectControler,'separacionPinza',0,15,0.025).name('Separacion Pinza');
    menu.add(effectControler,'solidAlambres').name('Solid/Alambres');
    // añadir  boton para lanzar animacion de robot
    menu.add({playAnimation: function(){
        playAnimation();
    }},'playAnimation').name('Animacion');

}
function playAnimation(){
    let animation1 = robot.animationShutDown();
    animation1.start();
}

function update(delta){

    // Actualizar el robot          
    robot.rotation.set(0,effectControler.giroBase*Math.PI / 180,0);
    robot.brazo.rotation.set(0,0,effectControler.giroBrazo*Math.PI / 180);
    robot.antebrazo.rotation.set(0,effectControler.giroAntebrazoY*Math.PI / 180,0);
    robot.antebrazo.rotation.set(0,0,effectControler.giroAntebrazoZ*Math.PI / 180);
    robot.mano.rotation.set(0,0,effectControler.giroPinza*Math.PI / 180);
    robot.setSeparacionPinza(effectControler.separacionPinza);
    robot.setSolidAlambres(effectControler.solidAlambres);
    
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