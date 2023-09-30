/**
 * Brazo robot seminario 2
 * 
 * @author ariel96cs@gmail.com
 */

// Modulos necesarios
import * as THREE from "../lib/three.module.js"

// Variables de consenso
let renderer, scene, camera;

// Otras globales

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

    let trans = 1;
    camera.position.set(1,3,2);
    camera.lookAt(2,0,0);

}

function loadScene(){

    // Crear una geometría para el suelo
    const groundGeometry = new THREE.PlaneGeometry(1000, 10000); // Ancho y largo del suelo

    // Crear un material para el suelo
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Color del suelo

    // Crear una malla para el suelo
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2; // Rotar el suelo para que sea horizontal en el plano XZ
    scene.add(groundMesh);

    // Crear el brazo del robot
    const robot = new THREE.Object3D();
    const brazo = new THREE.Object3D();
    const antebrazo = new THREE.Object3D();
    const mano = new THREE.Object3D();
    

    // Se crea el material del robot
    const robotMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff,wireframe: true }); // Color del robot
    
    
    // Crear la base cilíndrica del brazo del robot
    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.15, 32); // Radio superior, radio inferior, altura, número de caras
    const baseMesh = new THREE.Mesh(baseGeometry, robotMaterial);
    baseMesh.position.y = 0.1; // Levantar la base 0.1 unidades para que no esté enterrada en el suelo
    

    // El brazo de robot está formado por 4 partes: eje, esparrago, rotula y antebrazo
    // Se crea el eje
    const ejeGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.18, 32); // Radio superior, radio inferior, altura, número de caras
    const ejeMesh = new THREE.Mesh(ejeGeometry, robotMaterial);
    ejeMesh.position.y = 0.25; // Levantar el eje 0.6 unidades para que esté sobre la base
    // rotar eje 90 grados sobre el eje x para que este en vertical
    ejeMesh.rotation.x = Math.PI / 2;

    // Se crea el esparrago
    const esparragoGeometry = new THREE.BoxGeometry(0.18, 1.2, 0.12); // Ancho, alto, profundidad
    const esparragoMesh = new THREE.Mesh(esparragoGeometry, robotMaterial);
    esparragoMesh.position.y = 0.8; // Levantar el espárrago 1.1 unidades para que esté sobre el eje

    // Se crea la rótula
    const rotulaGeometry = new THREE.SphereGeometry(0.2, 32, 32); // Radio, número de caras en ancho y alto    
    const rotulaMesh = new THREE.Mesh(rotulaGeometry, robotMaterial);
    rotulaMesh.position.y = 1.4; // Levantar la rótula 1.2 unidades para que esté sobre el espárrago

    // Se crea el antebrazo
    // Un atebrazo está formado por 3 partes: disco, nervios y mano
    // Se crea el disco
    const discoGeometry = new THREE.CylinderGeometry(0.22, 0.22, 0.06, 32); // Radio superior, radio inferior, altura, número de caras
    const discoMesh = new THREE.Mesh(discoGeometry, robotMaterial);
    // Levantar el disco para que esté centrado sobre la rotula
    discoMesh.position.y = 1.4;

    // Se crean los 4 nervios
    

    const numNervios = 4;
    const radiusPrisms = 0.1; // Distancia desde el centro del cilindro
    const nervioHeight = 0.8; // Altura de los prismas
    const nervioWidth = 0.04; // Ancho de los nervios

    const nervioGeometry = new THREE.BoxGeometry(nervioWidth, nervioHeight, nervioWidth); // Ancho, alto, profundidad
    // Se añaden los nervios al antebrazo
    for (let i = 0; i < numNervios; i++) {
        const angle = (Math.PI * 2 * i) / numNervios; // Ángulo igual entre los prismas
        const x = Math.cos(angle) * radiusPrisms;
        const z = Math.sin(angle) * radiusPrisms;

        const nervio = new THREE.Mesh(nervioGeometry, robotMaterial);

        nervio.position.set(x, 1.4+nervioHeight/2, z);
        antebrazo.add(nervio);
    }




    // //Se crea la mano, que está formada por dos pinzas sobre un cilindro
    const pinzaIzq = crearPinza(robotMaterial);
    const pinzaDer = crearPinza(robotMaterial);
    const cilindroGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 32); // Radio superior, radio inferior, altura, número de caras
    const cilindroMesh = new THREE.Mesh(cilindroGeometry, robotMaterial);
    // Levantar el cilindro para que esté sobre los nervios, los nervios deben entrar en el cilindro
    cilindroMesh.position.y = 2.3;
    // Rotar el cilindro 90 grados sobre el eje X para que esté en vertical
    cilindroMesh.rotation.x = Math.PI / 2;
    // Levantar la pinza 
    pinzaIzq.position.y = 2.3;
    pinzaIzq.position.z = 0.1;
    // // Rotar la pinza izquierda 90 grados sobre el eje X para que esté en vertical
    pinzaIzq.rotation.x = Math.PI / 2;
    pinzaIzq.rotation.z = -Math.PI / 2;
    
    // Levantar la pinza 
    pinzaDer.position.y = 2.3;
    pinzaDer.position.z = -0.1;
    // // Rotar la pinza izquierda 90 grados sobre el eje X para que esté en vertical
    pinzaDer.rotation.x = Math.PI / 2;
    pinzaDer.rotation.z = -Math.PI / 2;

    // Se añade la pinza izquierda a la mano
    mano.add(pinzaIzq);
    // // Se añade la pinza derecha a la mano
    mano.add(pinzaDer);
    // Se añade el cilindro a la mano
    mano.add(cilindroMesh);
    // // Levantar la mano 0.1 unidades para que esté centrada sobre los nervios
    // mano.position.y = 0.1;


    // Se  crea el grafo de escena en este orden, robot -> base -> brazo -> eje esparrago rotula antebrazo -> disco nervios mano
    // Se añade la base al robot
    
    robot.add(baseMesh);
    // Se añade el brazo al robot
   
    robot.add(brazo);
    // Se añade el eje al brazo
    brazo.add(ejeMesh);
    // Se añade el espárrago al brazo
    brazo.add(esparragoMesh);
    // Se añade la rótula al brazo
    brazo.add(rotulaMesh);
    // Se añade el antebrazo al brazo
   
    brazo.add(antebrazo);
    // Se añade el disco al antebrazo
    antebrazo.add(discoMesh);
    
    
    // Se añade la mano al antebrazo
    antebrazo.add(mano);
    
    //se añade el robot a la escena
    scene.add(robot);

}
function update(){

}

function render(){
    requestAnimationFrame(render);
    update();
    renderer.render(scene,camera);
}

// funcion para crear una pinza
// una pinza está formada por una palma y un dedo
function crearPinza(material){
    // Se crea la palma
    const palmaGeometry = new THREE.BoxGeometry(0.04, 0.2, 0.19); // Ancho, alto, profundidad
    const palmaMesh = new THREE.Mesh(palmaGeometry, material);
    // Levantar la palma para que esté centrada sobre la mano
    palmaMesh.position.y = 0.2;
    
    const trapezoidGeometry = new THREE.BufferGeometry();

    
    const topWidth = 0.04; // Ancho superior 
    const topHeight = 0.2; // Altura de la base superior
    const bottomWidth = topWidth/2; // Ancho inferior
    const bottomHeight = topHeight/2; // Altura de la base inferior
    const depth = 0.19; // Profundidad


    // Crear una geometría personalizada para el trapezoide tridimensional
    const vertices = new Float32Array([
        -topWidth / 2, -topHeight / 2, -depth / 2,
        topWidth / 2, -topHeight / 2, -depth / 2,
        -bottomWidth / 2, bottomHeight / 2, -depth / 2,
        bottomWidth / 2, bottomHeight / 2, -depth / 2,
        -topWidth / 2, -topHeight / 2, depth / 2,
        topWidth / 2, -topHeight / 2, depth / 2,
        -bottomWidth / 2, bottomHeight / 2, depth / 2,
        bottomWidth / 2, bottomHeight / 2, depth / 2,
    ]);
    const indices = new Uint16Array([
        0, 1, 2, 1, 3, 2, // Front face
        4, 5, 6, 5, 7, 6, // Back face
        0, 1, 4, 1, 5, 4, // Top face
        2, 3, 6, 3, 7, 6, // Bottom face
        0, 2, 4, 2, 6, 4, // Left face
        1, 3, 5, 3, 7, 5, // Right face
    ]);

    trapezoidGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    trapezoidGeometry.setIndex(new THREE.BufferAttribute(indices, 1));

    const dedoMesh = new THREE.Mesh(trapezoidGeometry, material);

    // Levantar el dedo 0.1 unidades para que esté centrado sobre la palma
    dedoMesh.position.y = palmaMesh.position.y+0.2;

    const pinza = new THREE.Object3D();
    pinza.add(palmaMesh);
    // Se añade el dedo a la pinza
    pinza.add(dedoMesh);
    return pinza;
}

// 