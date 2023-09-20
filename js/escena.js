/**
 * escena.js
 * 
 * Seminario #2 GPC: Pintar una escena básica con transformaciones,
 * animación y modelos importados
 * 
 * @author: ariel96cs@gmail.com
 */

// Modulos necesarios
import * as THREE from "../lib/three.module.js"
import {GLTFLoader} from "../lib/GLTFLoader.module.js"

// Variables de consenso
let renderer, scene, camera;

// Otras globales
let esferaCubo;
let angle = 0;


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

    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0,0,0.2);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight,
                                            0.1,1000);
    camera.position.set(0.5,2,7);
    camera.lookAt(0,1,0);

}

function loadScene(){
    // se crea un mesh
     const material = new THREE.MeshBasicMaterial({color:'yellow',wireframe: false});
    
     const geoCubo = new THREE.BoxGeometry(2,2,2);
    
    // se crea la malla
     const cubo = new THREE.Mesh(geoCubo,material);

     scene.add(cubo);

}

function update(){

}

function render(){
    requestAnimationFrame(render);
    update();
    renderer.render(scene,camera);
}