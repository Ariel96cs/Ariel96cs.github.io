/**
 * escenaAnimada.js
 * 
 * Seminario #2 GPC: Pintar una escena básica con transformaciones,
 * animación y modelos importados
 * 
 * @author: ariel96cs@gmail.com
 */

// Modulos necesarios
import * as THREE from "../lib/three.module.js"
import {GLTFLoader} from "../lib/GLTFLoader.module.js"
import {OrbitControls} from "../lib/OrbitControls.module.js"
import {TWEEN} from "../lib/tween.module.min.js"
import Stats from "../lib/stats.module.js"
import {GUI} from "../lib/lil-gui.module.min.js"

// Variables de consenso
let renderer, scene, camera;
let cameraControls;

// Otras globales
let esferaCubo;
let angle = 0;
let stats;
let effectControler;
let sphere,cubo;
let suelo;

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

    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0,0,0.2);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight,
                                            0.1,1000);

                                            
    camera.position.set(0.8,2,7);
    cameraControls = new OrbitControls(camera,renderer.domElement);
    // seleccionar el target que vamos a mirar
    cameraControls.target.set(0,1,0);
    camera.lookAt(0,1,0);

    //Monitor
    stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '30px';
    stats.domElement.style.left = '30px';
    document.getElementById("container").appendChild(stats.domElement);

    // Events
    window.addEventListener('resize',updateAspectRatio);
    renderer.domElement.addEventListener('dblclick',animate);


}

function loadScene(){
    // se crea un mesh
     const material = new THREE.MeshBasicMaterial({color:'yellow',wireframe: true});
    
     const geoCubo = new THREE.BoxGeometry(2,2,2);

     const geoEsfera = new THREE.SphereGeometry(1,20,20);
    
    // se crea la malla
    cubo = new THREE.Mesh(geoCubo,material);
    sphere = new THREE.Mesh(geoEsfera,material);

     // otro objeto
     esferaCubo = new THREE.Object3D();

     //transformaciones
     cubo.position.set(1,0,0);
     sphere.position.set(-1,0,0);

    esferaCubo.add(cubo);
    esferaCubo.add(sphere);

    esferaCubo.position.set(1,1,0);

    scene.background = new THREE.Color(0.7,0.6,0.9);
    scene.add(esferaCubo);
     scene.add(new THREE.AxisHelper(2));

     //suelo

     suelo = new THREE.Mesh(new THREE.PlaneGeometry(10,10,10,10),material);

     // rotamos el suelo 90 grados
     suelo.rotation.x = -Math.PI/2;

     scene.add(suelo);

     // importar un modelo json
     const loader = new THREE.ObjectLoader();
     loader.load('models/soldado/soldado.json',
        function (obj){
            cubo.add(obj);
            obj.position.set(0,1,0);
            obj.name = 'soldado';
     })
     
     // importar modelo en gltf
     const gltfLoader = new GLTFLoader();
     gltfLoader.load('./models/extra/scene.gltf',function (gltf){
        gltf.scene.position.y = 1;
        gltf.scene.rotation.y = -Math.PI/2;
        gltf.scene.scale.set(0.01,0.01,0.01);
        gltf.scene.name = 'robot';
        sphere.add(gltf.scene);
        
     });
}

function setupGUI(){  
    // Definicion de los controles
    effectControler = {
        mensaje: 'Soldado y robot',
        giroY:0.0,
        separacion: 0.0,
        colorAlambres: 'rgb(150,5,150)'
    }

    // Creacion interfaz
    const gui = new GUI();

    // Construccion del menu de widgets
    const menu = gui.addFolder('Controles');
    menu.add(effectControler,'mensaje').name('Mensaje');
    menu.add(effectControler,'giroY',-180,180,0.025).name('Giros Y');
    menu.add(effectControler,'separacion',{'Ninguna':0,'Media':2,'Total':5}).name('Separacion');
    menu.addColor(effectControler,'colorAlambres').name('Color alambres');

}

function animate(event){
    //Capturar posicion del click
    let x = event.clientX;
    let y = event.clientY;
    
    // Normalizar posicion del click
    x = (x/window.innerWidth)*2-1;
    y = -(y/window.innerHeight)*2+1;

    // COnstruir el rayo
    const rayo = new THREE.Raycaster();
    rayo.setFromCamera(new THREE.Vector2(x,y),camera);

    // Calcular intersecciones con soldado y robot
    const soldado = scene.getObjectByName('soldado');
    let intersecciones = rayo.intersectObject(soldado,false);

    if(intersecciones.length > 0){
        // Animación
        new TWEEN.Tween(soldado.position)
            .to({x:[0,0],y:[3,1],z:[0,0]},2000)
            .interpolation(TWEEN.Interpolation.Bezier)
            .easing(TWEEN.Easing.Bounce.Out)
            .start();
    }

    const robot = scene.getObjectByName('robot');
    intersecciones = rayo.intersectObjects(robot.children,true);

    if(intersecciones.length > 0){
        console.log("robot seleccionado ")
        // Animación
        new TWEEN.Tween(robot.rotation)
            .to({x:[0,0],y:[Math.PI,-Math.PI/2],z:[0,0]},5000)
            .interpolation(TWEEN.Interpolation.Linear)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
    }
}

function updateAspectRatio(){
    renderer.setSize(window.innerWidth,window.innerHeight);

    const ar = window.innerWidth/window.innerHeight;
    camera.aspect = ar;
    camera.updateProjectionMatrix();
}

function update(delta){
    // angle+=0.01;
    // esferaCubo.rotation.y = angle;

    TWEEN.update(delta);
    stats.update();

    cubo.position.set(1+effectControler.separacion/2,0,0);
    sphere.position.set(-1-effectControler.separacion/2,0,0);

    suelo.material.setValues({color: new THREE.Color(effectControler.colorAlambres)});
    esferaCubo.rotation.y = Math.PI*effectControler.giroY/180;
}

function render(delta){
    requestAnimationFrame(render);
    update(delta);
    renderer.render(scene,camera);
}