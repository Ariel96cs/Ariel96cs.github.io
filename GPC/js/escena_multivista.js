/**
 * escena_multivista.js
 * 
 * Seminario #3 GPC: Pintar una escena básica con transformaciones,
 * modelos importados en 4 vistas diferentes
 * 
 * @author: ariel96cs@gmail.com
 */

// Modulos necesarios
import * as THREE from "../lib/three.module.js"
import {GLTFLoader} from "../lib/GLTFLoader.module.js"
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
    // scene.background = new THREE.Color(0,0,0.2);

    // Camera
    const ar = window.innerWidth/window.innerHeight;
    setOrtograhicCameras(ar);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight,
                                            0.1,1000);
    camera.position.set(0.8,2,7);
    cameraControls = new OrbitControls(camera,renderer.domElement);
    // seleccionar el target que vamos a mirar
    cameraControls.target.set(0,1,0);
    camera.lookAt(0,1,0);

    // Eventos
    window.addEventListener('resize',updateAspectRatio);
    window.addEventListener('dblclick',rotateElement);

}

function setOrtograhicCameras(aspectr){
    let camaraOrtografica;

    if (aspectr > 1){
        camaraOrtografica = new THREE.OrthographicCamera(-L*aspectr,L*aspectr,L,-L,-100,100);
    }
    else{
        camaraOrtografica = new THREE.OrthographicCamera(-L,L,L/aspectr,-L/aspectr,-100,100);
    }

    alzado = camaraOrtografica.clone();
    alzado.position.set(0,0,L);
    alzado.lookAt(0,1,0);

    perfil = camaraOrtografica.clone();
    perfil.position.set(L,0,0);
    perfil.lookAt(0,1,0);

    planta = camaraOrtografica.clone();
    planta.position.set(0,L,0);
    planta.lookAt(0,1,0);

    planta.up = new THREE.Vector3(0,0,-1);
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
    esferaCubo.name = 'grupoEC';
    //transformaciones
    cubo.position.set(1,0,0);
    sphere.position.set(-1,0,0);

    esferaCubo.add(cubo);
    esferaCubo.add(sphere);

    esferaCubo.position.set(1,1,0);

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

/**Rotar el objeto seleccionado */
function rotateElement(event){
    // Capturo la posicion del click
    let x = event.clientX;
    let y = event.clientY;

    // Normalizo la posicion del click pq está en un sistema de referencia topLeft
    x = (x/window.innerWidth)*2-1;
    y = (y/window.innerHeight)*2-1;

    // Se crea un raycaster 
    let rayo = new THREE.Raycaster();
    rayo.setFromCamera(new THREE.Vector2(x,y),camera);

    // Se obtiene el objeto seleccionado
    let interseccion = rayo.intersectObjects(scene.children);//rayo.intersectObjects(scene.getObjectNameById('grupoEC').children,false)
    

    // Se rota el objeto seleccionado
    if(interseccion.length > 0){
        let obj = interseccion[0].object;
        obj.rotation.y += Math.PI/8;
    }


    
}

function updateAspectRatio(){
    renderer.setSize(window.innerWidth,window.innerHeight);

    const ar = window.innerWidth/window.innerHeight;
    camera.aspect = ar;
    camera.updateProjectionMatrix();

    if (ar > 1) {
        alzado.left = perfil.left = planta.left = -L * ar;
        alzado.right = perfil.right = planta.right = L * ar;
        alzado.top = perfil.top = planta.top = L;
        alzado.bottom = perfil.bottom = planta.bottom = -L; 

    }
    else{
        alzado.left = perfil.left = planta.left = -L;
        alzado.right = perfil.right = planta.right = L;
        alzado.top = perfil.top = planta.top = L/ar;
        alzado.bottom = perfil.bottom = planta.bottom = -L/ar; 
    }
    alzado.updateProjectionMatrix();
    perfil.updateProjectionMatrix();
    planta.updateProjectionMatrix();
}

function update(){
    angle+=0.01;
    // esferaCubo.rotation.y = angle;
}

function render(){
    renderer.clear();
    requestAnimationFrame(render);
    update();

    //Dividir la pantalla en 4 vistas
    // origen del viewport en la esquina inferior izquierda
    renderer.setViewport(0,0,window.innerWidth/2,window.innerHeight/2);
    renderer.render(scene,planta);

    renderer.setViewport(0,window.innerHeight/2,window.innerWidth/2,window.innerHeight/2);
    renderer.render(scene,alzado);

    renderer.setViewport(window.innerWidth/2,0,window.innerWidth/2,window.innerHeight/2);
    renderer.render(scene,perfil);

    renderer.setViewport(window.innerWidth/2,window.innerHeight/2,window.innerWidth/2,window.innerHeight/2);
    renderer.render(scene,camera);

    
}