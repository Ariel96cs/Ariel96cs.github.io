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
    camera.position.set(0.8,2,7);
    camera.lookAt(0,1,0);

}

function loadScene(){
    // se crea un mesh
     const material = new THREE.MeshBasicMaterial({color:'yellow',wireframe: true});
    
     const geoCubo = new THREE.BoxGeometry(2,2,2);

     const geoEsfera = new THREE.SphereGeometry(1,20,20);
    
    // se crea la malla
     const cubo = new THREE.Mesh(geoCubo,material);
     const sphere = new THREE.Mesh(geoEsfera,material);

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

     const suelo = new THREE.Mesh(new THREE.PlaneGeometry(10,10,10,10),material);

     // rotamos el suelo 90 grados
     suelo.rotation.x = -Math.PI/2;

     scene.add(suelo);

     // importar un modelo json
     const loader = new THREE.ObjectLoader();
     loader.load('models/soldado/soldado.json',
        function (obj){
            cubo.add(obj);
            obj.position.set(0,1,0);
     })
     
     // importar modelo en gltf
     const gltfLoader = new GLTFLoader();
     gltfLoader.load('./models/extra/scene.gltf',function (gltf){
        gltf.scene.position.y = 1;
        gltf.scene.rotation.y = -Math.PI/2;
        gltf.scene.scale.set(0.01,0.01,0.01);
        sphere.add(gltf.scene);
     });
}

function update(){
    angle+=0.01;
    esferaCubo.rotation.y = angle;
}

function render(){
    requestAnimationFrame(render);
    update();
    renderer.render(scene,camera);
}