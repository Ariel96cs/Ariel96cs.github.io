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
let effectControler;

// Extra variables
let world;
const timeStep = 1/60;
const maxSubSteps = 3; 
// Additional cameras
let miniCamera;
const L = 10;

// Game variables
let game;
let score1 = 0;
let score2 = 0;

const initialX = 0;
const initialY = -3.5;
const initialZ = 0;

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
    renderer.antialias = true;
    renderer.shadowMap.enabled = true;

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
    const ambiental = new THREE.AmbientLight(0x404040);
    scene.add(ambiental);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4); // Luz direccional
    directionalLight.position.set(0, 10, 0); // Ajusta la posición de la luz
    directionalLight.castShadow = true; // Habilita que la luz proyecte sombras
    scene.add(directionalLight);

    // // Ajusta la configuración de las sombras
    // directionalLight.shadow.mapSize.width = 1024;
    // directionalLight.shadow.mapSize.height = 1024;
    // directionalLight.shadow.camera.near = 0.5;
    // directionalLight.shadow.camera.far = 50;

    // const puntual = new THREE.PointLight(0xFFFFFF,0.4);
    // puntual.position.set(2,7,-4);
    // scene.add(puntual);

    const focal = new THREE.SpotLight(0xFFFFFF,0.6);
    focal.position.set(0,11,8);
    focal.target.position.set(0,0,8);
    focal.angle = Math.PI/4;
    focal.penumbra = 0.2;
    focal.castShadow = true;


    scene.add(focal);
    scene.add(focal.target);
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

    //capture double click event to place a ball on the board
    renderer.domElement.addEventListener('dblclick',placeBall);
    // window.addEventListener('keydown',onRobotMoveKeyDown,false);
}
function onRobotMoveKeyDown(event){
    console.log("Evento de tecla presionada");
    console.log(event.key);
    const step = 3;
        if (event.key === "ArrowLeft") {
            // Tecla de flecha izquierda
            game.board.rotation.z+=step;

        } else if (event.key === "ArrowUp") {
            // Tecla de flecha arriba
            game.board.rotation.x+=step;
            
        } else if (event.key === "ArrowRight") {
            // Tecla de flecha derecha
            game.board.rotation.z-=step;
          
        } else if (event.key === "ArrowDown") {
            // Tecla de flecha abajo
           
            game.board.rotation.x-=step;
        }
        effectControler.angleX = game.board.rotation.x;
        effectControler.angleZ = game.board.rotation.z;
        game.board.physicBoard.quaternion.copy(game.board.quaternion);
    
}
function placeBall(event){
    console.log("double click");

    // capture the click position
    let x = event.clientX;
    let y = event.clientY;

    x = (x/window.innerWidth)*2-1;
    y = -(y/window.innerHeight)*2+1;

    // Construir el rayo
    const rayo = new THREE.Raycaster();
    rayo.setFromCamera(new THREE.Vector2(x,y),camera);

    // Iterar sobre las celdas del board y verificar si existen intersectos
    game.board.children.forEach(cell => {
        console.log("Checking cell:",cell.name);
        const intersections = rayo.intersectObject(cell,false);
        if (intersections.length > 0){
            // obtener las coordenadas de la celda i,j
            const i = cell.userData.i;
            const j = cell.userData.j;

            game.play(i,j);
        }
    });

}


function setCameras(ar) {

    // Configurar miniCameraOrtografica
    var camaraOrtografica
    camaraOrtografica = new THREE.OrthographicCamera(-L, L, L, -L, -2, 20);
    camaraOrtografica.lookAt(new THREE.Vector3(0, 0, 0));

    miniCamera = camaraOrtografica.clone()
    miniCamera.position.set(0, 15, 0);
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
    game = new TicTacToe(world,scene);
    game.board.addPhysics(world);
    game.board.updateBoardPosition(initialX,initialY,initialZ);
    scene.add(game.board);

    const room = makeRoom();
    scene.add(room);
    addGLTFBox();
    addUrbanLampGLTF();
    scene.add(new THREE.AxesHelper(1000));

}

function addUrbanLampGLTF(){
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('./models/urban_street_light/scene.gltf',function (gltf){
        gltf.scene.position.set(0,-7.5,15)
        gltf.scene.rotation.y = -Math.PI;
        gltf.scene.scale.set(5,5,5);
        gltf.scene.name = 'lamp';
        scene.add(gltf.scene);

        // agregar un cuerpo físico prisma rectangular en el lugar de la lámpara
        const groundMaterial = new CANNON.Material("groundMaterial");
        groundMaterial.restitution = 1;
        const lampShape = new CANNON.Vec3(1,10,1);
        const lampBody = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(lampShape),
            position: new CANNON.Vec3(0,-7.5,15),
            material: groundMaterial
        });
        world.addBody(lampBody);

    });


}

function addGLTFBox(){
    // importar modelo en gltf
    const gltfLoader = new GLTFLoader();
        gltfLoader.load('./models/wooden_box/scene.gltf',function (gltf){
        gltf.scene.position.y = -7.5;
        gltf.scene.rotation.y = -Math.PI/2;
        gltf.scene.scale.set(0.5,0.5,0.5);
        gltf.scene.name = 'box';
        scene.add(gltf.scene);

        //añadirle paredes físicas a la caja
        const wallsShape1 = new CANNON.Vec3(5,0.25,3.7);
        const wallsShape2 = new CANNON.Vec3(3.7,0.25,5);
        const wallDistance = 5.5;
        const y = -7.5;
        const groundMaterial = new CANNON.Material("groundMaterial");
        groundMaterial.restitution = 0.3;

        const physicWall1 = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(wallsShape1),
            position: new CANNON.Vec3(0,y,-wallDistance),
            material: groundMaterial
        });
        physicWall1.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
        world.addBody(physicWall1); 
        
        const physicWall2 = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(wallsShape1),
            position: new CANNON.Vec3(0,y,wallDistance),
            material: groundMaterial
        });
        physicWall2.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
        world.addBody(physicWall2);
    
        const physicWall3 = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(wallsShape2),
            position: new CANNON.Vec3(wallDistance,y,0),
            material: groundMaterial
        });
        physicWall3.quaternion.setFromAxisAngle(new CANNON.Vec3(0,0,1),-Math.PI/2);
        world.addBody(physicWall3);
    
        const physicWall4 = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(wallsShape2),
            position: new CANNON.Vec3(-wallDistance,y,0),
            material: groundMaterial
        });
        physicWall4.quaternion.setFromAxisAngle(new CANNON.Vec3(0,0,1),-Math.PI/2);
        
        world.addBody(physicWall4);
    });


}

function makeRoom(){
    // Habitacion
    const walls = [];
    walls.push(new THREE.MeshBasicMaterial({side:THREE.BackSide,
                                            map:new THREE.TextureLoader().load("./imgs/Yokohama2/posx.jpg")}));
    walls.push(new THREE.MeshBasicMaterial({side:THREE.BackSide,
                                            map:new THREE.TextureLoader().load("./imgs/Yokohama2/negx.jpg")}));
    walls.push(new THREE.MeshBasicMaterial({side:THREE.BackSide,
                                            map:new THREE.TextureLoader().load("./imgs/Yokohama2/posy.jpg")}));
    walls.push(new THREE.MeshBasicMaterial({side:THREE.BackSide,
                                            map:new THREE.TextureLoader().load("./imgs/Yokohama2/negy.jpg")}));
    walls.push(new THREE.MeshBasicMaterial({side:THREE.BackSide,
                                            map:new THREE.TextureLoader().load("./imgs/Yokohama2/posz.jpg")}));
    walls.push(new THREE.MeshBasicMaterial({side:THREE.BackSide,
                                            map:new THREE.TextureLoader().load("./imgs/Yokohama2/negz.jpg")}));
    
    const width = game.board.boardWidth*game.board.cols;
    const height = game.board.boardHeight*game.board.rows;                       
    const geoRoom = new THREE.BoxGeometry(width,width,height);
    const room = new THREE.Mesh(geoRoom,walls);
    room.position.set(0,height/3,0);

    // añadir fisica
    const wallsShape = new CANNON.Vec3(50,0.1,50);
    const wallDistance = 22.5;
    const groundMaterial = new CANNON.Material("groundMaterial");
    groundMaterial.restitution = 0.001;
    // create the physic floor  
    const physicFloor = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(wallsShape),
        position: new CANNON.Vec3(0,-7.5,0),
        material: groundMaterial
    });
    //physicWall1.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    world.addBody(physicFloor);
   
    const physicWall1 = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(wallsShape),
        position: new CANNON.Vec3(0,0,-wallDistance),
        material: groundMaterial
    });
    physicWall1.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    world.addBody(physicWall1); 
    
    const physicWall2 = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(wallsShape),
        position: new CANNON.Vec3(0,0,wallDistance),
        material: groundMaterial
    });
    physicWall2.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    world.addBody(physicWall2);

    const physicWall3 = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(wallsShape),
        position: new CANNON.Vec3(wallDistance,0,0),
        material: groundMaterial
    });
    physicWall3.quaternion.setFromAxisAngle(new CANNON.Vec3(0,0,1),-Math.PI/2);
    world.addBody(physicWall3);

    const physicWall4 = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(wallsShape),
        position: new CANNON.Vec3(-wallDistance,0,0),
        material: groundMaterial
    });
    physicWall4.quaternion.setFromAxisAngle(new CANNON.Vec3(0,0,1),-Math.PI/2);
    
    world.addBody(physicWall4);
    


    return room
}

function setupGUI(){
    effectControler = {
        mensaje: 'TIC TAC TOE',
        score1:0,
        score2:0,
        player1Color: 'rgb(150,150,150)',
        player2Color: 'rgb(150,0,150)',
        player1Texture: 'wood',
        player2Texture: 'chess',
        playerTurn: 'Player1'
    }

    // Creacion interfaz
    const gui = new GUI();

    // Construccion del menu de widgets
    const menu = gui.addFolder('Controles');
    menu.add(effectControler,'mensaje').name('Game').disable();
    menu.add(effectControler,'score1').name('Score Player1').listen().disable();
    menu.add(effectControler,'score2').name('Score Player2').listen().disable();
    menu.add(effectControler,'playerTurn').name('Current Turn').listen().disable();
    menu.add(effectControler,'player1Texture',{chess:'chess', cube:'cube', rust:'rust', wood:'wood'}).name('Player1 Texture');
    menu.add(effectControler,'player2Texture',{chess:'chess', cube:'cube', rust:'rust', wood:'wood'}).name('Player2 Texture');
    menu.addColor(effectControler,'player1Color').name('Color Player1');
    menu.addColor(effectControler,'player2Color').name('Color Player2');

    menu.add({resetGame: function(){
        resetGame();
    }},'resetGame').name('Reset Game');

}
function resetGame(){
    game.resetGame();

    game.board.animate();

}


function update(delta){
    game.color1 = new THREE.Color(effectControler.player1Color);
    game.color2 = new THREE.Color(effectControler.player2Color);

    
    effectControler.score1 = game.score1;
    effectControler.score2 = game.score2;

    game.player1ObjTex = effectControler.player1Texture;
    game.player2ObjTex = effectControler.player2Texture;

    if (game.player1Turn){
        effectControler.playerTurn = 'Player 1';
    }else{
        effectControler.playerTurn = 'Player 2';
    }

    TWEEN.update(delta);
}

function animate(delta){
    game.jumpWinnerBalls();
    // Step the Cannon.js physics world
    // Maximum number of sub-steps to use
    world.step(timeStep, delta, maxSubSteps);
    
    // Update the positions and rotations of objects based on physics bodies
    game.updateObjectPositions();

}

function render(delta){
    renderer.clear();
    animate(delta);
    requestAnimationFrame(render);
    update(delta);

     // Tamaño de la vista miniatura
    var miniSIze = 1/4*Math.min(window.innerHeight,window.innerWidth);
    // Espacio entre la vista miniatura y los bordes de la ventana
    var padding = 50; 

    renderer.setViewport(padding, window.innerHeight - miniSIze - padding, miniSIze, miniSIze);
    renderer.setScissor(padding, window.innerHeight - miniSIze - padding, miniSIze, miniSIze);

    renderer.render(scene,miniCamera);

    renderer.setViewport(0,0,window.innerWidth,window.innerHeight);
    renderer.render(scene,camera);
    stats.update();

    // console.log("render");
}
