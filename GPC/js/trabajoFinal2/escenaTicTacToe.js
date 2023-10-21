/**
 * Tic Tac Toe Game
 * 
 * author:  @acotsan
 * 
 * 
 */


// imports
import * as THREE from "../../lib/three.module.js"
import {OrbitControls} from "../../lib/OrbitControls.module.js"
import {GUI} from "../../lib/lil-gui.module.min.js"
import {TWEEN} from "../../lib/tween.module.min.js"
import {GLTFLoader} from "../../lib/GLTFLoader.module.js"
import {TicTacToe} from "./tictactoe.js"
import Stats from "../../lib/stats.module.js"
import * as CANNON from "../../lib/cannon-es.module.js"

// Global variables
let renderer, scene, camera;
let cameraControls;
let stats;

// Extra variables
let world;

// Additional cameras
let miniCamera;
const L = 4;

// Game variables
let game;
let player1Obj, player2Obj;
let player1Turn = true;
let gameStarted = false;
let gameEnded = false;
let gameWinner = null;


// Actions

init();
loadScene();
setupGUI();
render();


function init(){
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth,window.innerHeight);

    document.getElementById("container").appendChild(renderer.domElement);
    renderer.setClearColor(new THREE.Color(1,1,1));
    renderer.autoClear = false

    world = new CANNON.World({
        gravity: new CANNON.Vec3(0,-9.81,0)
    });

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

    // Luces
    const ambiental = new THREE.AmbientLight(0x222222);
    scene.add(ambiental);

    // const direccional = new THREE.DirectionalLight(0xFFFFFF,0.5);
    // direccional.position.set(-1,5,-1);
    // direccional.castShadow = true;
    // scene.add(direccional);

    // const puntual = new THREE.PointLight(0xFFFFFF,0.4);
    // puntual.position.set(2,7,-4);
    // scene.add(puntual);

    const focal = new THREE.SpotLight(0xFFFFFF,0.5);
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
}


function setCameras(ar) {

    // Configurar miniCameraOrtografica
    var camaraOrtografica
    camaraOrtografica = new THREE.OrthographicCamera(-L, L, L, -L, -2, 20);
    camaraOrtografica.lookAt(new THREE.Vector3(0, 0, 0));

    miniCamera = camaraOrtografica.clone()
    miniCamera.position.set(0, 10, 0);
    miniCamera.up = new THREE.Vector3(0, 0, -1)
    miniCamera.lookAt(new THREE.Vector3(0, 0, 0))

    // Configurar cámara general perspectiva
    var camaraPerspectiva = new THREE.PerspectiveCamera(75, ar, 0.1, 100);
    camaraPerspectiva.position.set(1, 2, 10);
    camaraPerspectiva.lookAt(new THREE.Vector3(0, 0, 0))
    camera = camaraPerspectiva.clone()

    //Añadir las cámaras a la escena
    scene.add(camera)
    scene.add(miniCamera)

}

function updateAspectRatio(){
    renderer.setSize(window.innerWidth,window.innerHeight);

    const ar = window.innerWidth/window.innerHeight;
    camera.aspect = ar;
    camera.updateProjectionMatrix();

    if (ar > 1) {
        miniCamera.left = -L * ar;
        miniCamera.right  = L * ar;
        miniCamera.top = L;
        miniCamera.bottom = -L; 

    }
    else{
        miniCamera.left = -L;
        miniCamera.right = L;
        miniCamera.top = L/ar;
        miniCamera.bottom = -L/ar; 
    }
    miniCamera.updateProjectionMatrix();
    camera.updateProjectionMatrix();
}
    

function loadScene(){
    game = new TicTacToe(world);
    scene.add(game.board);

    // Habitacion
    const walls = [];
    walls.push(new THREE.MeshBasicMaterial({side:THREE.BackSide,
                                            map:new THREE.TextureLoader().load("./imgs/posx.jpg")}));
    walls.push(new THREE.MeshBasicMaterial({side:THREE.BackSide,
                                            map:new THREE.TextureLoader().load("./imgs/negx.jpg")}));
    walls.push(new THREE.MeshBasicMaterial({side:THREE.BackSide,
                                            map:new THREE.TextureLoader().load("./imgs/posy.jpg")}));
    walls.push(new THREE.MeshBasicMaterial({side:THREE.BackSide,
                                            map:new THREE.TextureLoader().load("./imgs/negy.jpg")}));
    walls.push(new THREE.MeshBasicMaterial({side:THREE.BackSide,
                                            map:new THREE.TextureLoader().load("./imgs/posz.jpg")}));
    walls.push(new THREE.MeshBasicMaterial({side:THREE.BackSide,
                                            map:new THREE.TextureLoader().load("./imgs/negz.jpg")}));

    const geoHabitacion = new THREE.BoxGeometry(50,50,25);
    const habitacion = new THREE.Mesh(geoHabitacion,walls);
    scene.add(habitacion);
    scene.add(new THREE.AxesHelper(1000));
}
function setupGUI(){}
function update(delta){

    TWEEN.update(delta);
}

function render(delta){
    renderer.clear();
    requestAnimationFrame(render);
    update(delta);

     // Tamaño de la vista miniatura
    var miniSIze = 1/4*Math.min(window.innerHeight,window.innerWidth);
    // Espacio entre la vista miniatura y los bordes de la ventana
    var padding = 0; 

    renderer.setViewport(padding, window.innerHeight - miniSIze - padding, miniSIze, miniSIze);
    renderer.setScissor(padding, window.innerHeight - miniSIze - padding, miniSIze, miniSIze);

    renderer.render(scene,miniCamera);

    renderer.setViewport(0,0,window.innerWidth,window.innerHeight);
    renderer.render(scene,camera);
}
