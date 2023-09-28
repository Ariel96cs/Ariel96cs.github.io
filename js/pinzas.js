/**
 * Pinzas del robot con base prisma y dedos trapezoidales
 * 
 * @author ariel96cs
 * 
 */

// Modulos necesarios
import * as THREE from "../lib/three.module.js"
import {OrbitControls} from "../lib/OrbitControls.module.js"

// Variables de consenso
let renderer, scene, camera;

// Otras globales
let esferaCubo;
let angle = 0;
// Controlador de camera
let cameraControls;

// Cámaras adicionales
let planta, alzado, perfil;
const L = 5;


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
    renderer.setClearColor(new THREE.Color(0,0,0.7));
    renderer.autoClear = false;

    // Escena
    scene = new THREE.Scene();

    // Camera
    const ar = window.innerWidth/window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight,
                                            0.1,1000);
    camera.position.set(0.8,2,7);
    cameraControls = new OrbitControls(camera,renderer.domElement);
    // seleccionar el target que vamos a mirar
    cameraControls.target.set(0,1,0);
    camera.lookAt(0,1,0);

}

function loadScene(){
    // crear el material de las pinzas
    const pinzasMaterial = new THREE.MeshBasicMaterial({color: 'red',wireframe: true});
    
    // crear la palma de la pinza
    const palma = new THREE.Mesh(new THREE.BoxGeometry(0.19,0.2,0.04),pinzasMaterial);
    // palma.position.x = 0;

    // crear el dedo de la pinza
    // el dedo es un prisma que tiene bases rectangulares y caras laterales trapezoidales
    const dedo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
                    0,0,0, // 0
                    0.04,0,0, // 1
                    0,0,0.2, // 2
                    0.04,0,0.2, // 3
                    0,0.19,0.02, // 4
                    0.02,0.19,0.02, // 5
                    0.0,0.19,0.18, // 6

                    0.02,0.19,0.18, // 7
    ]);
    const indices = new Uint16Array([
                    0,1,2, // lateral izquierdo
                    1,3,2, // lateral izquierdo
                    0,1,4, // base inferior
                    1,5,4, // base inferior
                    5,4,6, // lateral derecho
                    5,6,7, // lateral derecho
                    2,3,7, // base superior
                    2,7,6, // base superior


    ]);
    dedo.setIndex(new THREE.BufferAttribute(indices,1));
    dedo.setAttribute('position',new THREE.BufferAttribute(vertices,3));
    const dedoMesh = new THREE.Mesh(dedo,pinzasMaterial);
    // juntar el dedo con la palma
    dedoMesh.position.x = 0.1;

    // crear la pinza
    const pinza = new THREE.Object3D();
    pinza.add(palma);
    pinza.add(dedoMesh);

    scene.add(pinza);

}

function update(){
    
}

function render(){
    requestAnimationFrame(render);
    update();
    renderer.render(scene,camera);
}