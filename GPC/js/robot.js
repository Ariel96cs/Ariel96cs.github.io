/**
 * Robot class object
 * 
 * author: ariel96cs
 */

// Modulos necesarios
import * as THREE from "../lib/three.module.js"
import {TWEEN} from "../lib/tween.module.min.js"

export {Robot};

class Robot extends THREE.Object3D{ 
    constructor(scale=3,applytextures=false){
        super();
        // Texturas
        this.robotMaterial = new THREE.MeshNormalMaterial({wireframe: false, flatShading: true}); 

        const metalTex = new THREE.TextureLoader().load('imgs/metal_128.jpg');
        const rustyMetalTex = new THREE.TextureLoader().load('imgs/rust_coarse_01_diff_1k.jpg');
        const rustyMetalTex2 = new THREE.TextureLoader().load('imgs/rusty_metal_sheet_diff_1k.jpg');
        const entorno = ["./imgs/posx.jpg","./imgs/negx.jpg",
        "./imgs/posy.jpg","./imgs/negy.jpg",
        "./imgs/posz.jpg","./imgs/negz.jpg"];
        const entornoTex = new THREE.CubeTextureLoader().load(entorno);

        this.baseMaterial = new THREE.MeshLambertMaterial({map: rustyMetalTex, color:'gray' });
        this.antebrazoMaterial = new THREE.MeshLambertMaterial({map: rustyMetalTex2, color:'yellow'});
        this.pinzasMaterial = new THREE.MeshLambertMaterial({map: metalTex, color:'gray'});
        this.rotulaMaterial = new THREE.MeshPhongMaterial({envMap: entornoTex, color:'white',
                                                                                specular:'gray',
                                                                                shininess: 30});
        
        this.applyTextures = applytextures;
        this.generateRobotGraph();
        this.scaleRobot(scale);
        this.scaleValue = scale;
        this.pinzasSep = this.pinzaIzq.position.z;

    }

    generateRobotGraph(){
        const eje = this.createEje();
        this.eje = eje;
        const esparrago = this.createEsparrago();
        this.esparrago = esparrago;
        const rotula = this.createrotula();
        this.rotula = rotula;
        const disco = this.createDisco();
        this.disco = disco;
        const nervios = this.createNervios();
        this.nervios = nervios;
        const mano = this.createHand();
        mano.position.y = 0.9;
        // Se crea el antebrazo, que está formado por el disco, los nervios y la mano
        const antebrazo = new THREE.Object3D();
        // Se añaden los nervios al antebrazo
        nervios.forEach((nervio) => {
            antebrazo.add(nervio);
        });
        // Se añade la mano al antebrazo
        antebrazo.add(mano);
        // Se añade el disco al antebrazo
        antebrazo.add(disco);
        this.antebrazo = antebrazo;
        this.antebrazo.position.y = 1.15;

        // Se crea el brazo, que está formado por el eje, el espárrago, la rótula y el antebrazo
        const brazo = new THREE.Object3D();
        // Se añade el eje al brazo
        brazo.add(eje);
        // Se añade el espárrago al brazo
        brazo.add(esparrago);
        // Se añade la rótula al brazo
        brazo.add(rotula);
        // Se añade el antebrazo al brazo
        brazo.add(antebrazo);
        this.brazo = brazo;
        // Se crea la base del robot
        const base = this.createBase();
        this.base = base;
        // // Se crea el robot, que está formado por la base y el brazo

        this.brazo.position.y = 0;
        base.add(brazo)
        this.add(base);
        return this;
    }

    // scale robot
    scaleRobot(scale=3){
        this.scale.set(scale,scale,scale);
    }

    // crear la base del robot
    createBase(){
        // Crear la base cilíndrica del brazo del robot
        const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.15, 32); // Radio superior, radio inferior, altura, número de caras
        const material = this.applyTextures ? this.baseMaterial : this.robotMaterial;
        const baseMesh = new THREE.Mesh(baseGeometry, material);
        baseMesh.position.y = 0.1; // Levantar la base 0.1 unidades para que no esté enterrada en el suelo
        // baseMesh.receiveShadow = true;
        // baseMesh.castShadow = true;

        return baseMesh;
    }

    createEje(){
        // Se crea el eje
        const ejeGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.18, 32); // Radio superior, radio inferior, altura, número de caras
        const material = this.applyTextures ? this.baseMaterial : this.robotMaterial;
        const ejeMesh = new THREE.Mesh(ejeGeometry, material);
        ejeMesh.rotateX(Math.PI / 2);
        // ejeMesh.receiveShadow = true;
        // ejeMesh.castShadow = true;
        return ejeMesh;
    }

    createEsparrago(){
            // Se crea el esparrago
    const esparragoGeometry = new THREE.BoxGeometry(0.18, 1.2, 0.12); // Ancho, alto, profundidad
    const material = this.applyTextures ? this.baseMaterial : this.robotMaterial;
    const esparragoMesh = new THREE.Mesh(esparragoGeometry, material);
    esparragoMesh.position.y = 0.55; // Levantar el espárrago 1.1 unidades para que esté sobre el eje
    return esparragoMesh;
    }

    createrotula(){
            // Se crea la rótula
    const rotulaGeometry = new THREE.SphereGeometry(0.2, 32, 32); // Radio, número de caras en ancho y alto    
    const material = this.applyTextures ? this.rotulaMaterial : this.robotMaterial;
    const rotulaMesh = new THREE.Mesh(rotulaGeometry, material);
    rotulaMesh.position.y = 1.15; // Levantar la rótula 1.2 unidades para que esté sobre el espárrago
    // rotulaMesh.receiveShadow = true;
    // rotulaMesh.castShadow = true;
    return rotulaMesh;
    }

    createDisco(){
        const discoGeometry = new THREE.CylinderGeometry(0.22, 0.22, 0.06, 32); // Radio superior, radio inferior, altura, número de caras
        const material = this.applyTextures ? this.antebrazoMaterial : this.robotMaterial;
        const discoMesh = new THREE.Mesh(discoGeometry, material);
        // Levantar el disco para que esté centrado sobre la rotula
        // discoMesh.receiveShadow = true; 
        // discoMesh.castShadow = true;
        return discoMesh;
    }

    // Crea la lista de nervios para añadir al antebrazo
    createNervios(){
    // Se crean los 4 nervios del antebrazo
    const numNervios = 4;
    const radiusPrisms = 0.1; // Distancia desde el centro del cilindro
    const nervioHeight = 0.8; // Altura de los prismas
    const nervioWidth = 0.04; // Ancho de los nervios
    
    // se instancia la lista de nervios
    const nervios = [];

    const nervioGeometry = new THREE.BoxGeometry(nervioWidth, nervioHeight, nervioWidth); // Ancho, alto, profundidad
    const material = this.applyTextures ? this.antebrazoMaterial : this.robotMaterial;
    // Se añaden los nervios al antebrazo
    for (let i = 0; i < numNervios; i++) {
        const angle = (Math.PI * 2 * i) / numNervios; // Ángulo igual entre los prismas
        const x = Math.cos(angle) * radiusPrisms;
        const z = Math.sin(angle) * radiusPrisms;

        const nervio = new THREE.Mesh(nervioGeometry, material);
        // nervio.receiveShadow = true;
        // nervio.castShadow = true;

        nervio.position.set(x, nervioHeight/2, z);
        nervios.push(nervio);
    }
    return nervios;

    }

    createDedoGeo(){
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
            1,7,3, // cara frontal
            1,5,7, // cara frontal
            0,6,2, // cara trasera
            0,4,6, // cara trasera
        ]);
        const uVS = new Float32Array( [
            0.0, 0.0,
            0.0, 1.0, 
            1.0, 0.0, 
            0.0, 1.0,
            1.0, 1.0,
            1.0, 0.0, 
            
            0.0, 1.0, 
            0.0, 0.0, 
            1.0, 0.0, 
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
    
            0.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
            1.0, 1.0,
            1.0, 0.0,
            0.0, 0.0,
    
            0.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
            1.0, 1.0,
            1.0, 0.0,
            0.0, 0.0,
    
            0.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
            1.0, 1.0,
            1.0, 0.0,
            0.0, 0.0,
        ] );

        
        dedo.setIndex(new THREE.BufferAttribute(indices,1));
        dedo.setAttribute('position',new THREE.BufferAttribute(vertices,3));

        dedo.computeVertexNormals();
        dedo.setAttribute('uv', new THREE.BufferAttribute(uVS, 2));
        return dedo;
    }

    createHand(){
    // Se crea la mano, que está formada por dos pinzas sobre un cilindro
    const mano = new THREE.Object3D();
    let material = this.applyTextures ? this.antebrazoMaterial : this.robotMaterial;
    
    const cilindroGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 32); // Radio superior, radio inferior, altura, número de caras
    const cilindroMesh = new THREE.Mesh(cilindroGeometry, material); 
    cilindroMesh.rotation.x = Math.PI / 2;
    // cilindroMesh.receiveShadow = true;
    // cilindroMesh.castShadow = true;
    
    const palmaGeo = new THREE.BoxGeometry(0.19,0.2,0.04);
    const dedoGeo = this.createDedoGeo();
    
    material = this.applyTextures ? this.pinzasMaterial : this.robotMaterial;
    const pinzaIzq = this.createPinza(dedoGeo,palmaGeo,material);
    const pinzaDer = pinzaIzq.clone();

    // Separar las pinzas
    pinzaIzq.position.z = -0.1;
    pinzaDer.position.z = 0.1;

    // trasladar las pinzas hacia adelante
    pinzaIzq.position.x = 0.1;
    pinzaDer.position.x = 0.1;

    pinzaDer.scale.z = -1; // Invertir la pinza derecha para que ambas pinzas estén enfrentadas
    
    // Se añade la pinza izquierda a la mano
    mano.add(pinzaIzq);
    // // Se añade la pinza derecha a la mano
    mano.add(pinzaDer);
    // Se añade el cilindro a la mano
    mano.add(cilindroMesh);
    this.pinzaIzq = pinzaIzq;
    this.pinzaDer = pinzaDer;
    this.mano = mano;

    return mano;
    }

    createPinza(dedoGeo,palmaGeo,material){


        // crear la palma de la pinza
        const palma = new THREE.Mesh(palmaGeo,material);
        // palma.receiveShadow = true;
        // palma.castShadow = true;

        
        const dedoMesh = new THREE.Mesh(dedoGeo,material);
        // dedoMesh.receiveShadow = true;
        // dedoMesh.castShadow = true;

        // rotar 90 grados sobre el eje y 
        dedoMesh.rotateY(Math.PI/2);
        dedoMesh.rotateX(Math.PI/2);
    
        // levantar el dedo 0.1 unidades para que esté centrado sobre la palma
        dedoMesh.position.y = 0.1;
        dedoMesh.position.x = 0.19/2;
        dedoMesh.position.z = 0.04/2;
    
        // crear la pinza
        const pinza = new THREE.Object3D();
        pinza.add(palma);
        pinza.add(dedoMesh);
    
        material.side = THREE.DoubleSide;
    
        return pinza;
    }

    // añadir robot a la escena
    addToScene(scene){
        scene.add(this);
    }

    // setear posicion del robot
    setPosition(x,y,z){
        this.position.set(x,y,z);
    }

    setGiroBase(giro){
        // girar la base
        this.rotation.y = giro * Math.PI / 180;
        
    }
    
    setGiroBrazo(giro){
        // Rotar el brazo sobre el eje del cilindro
        
        const angle = giro * Math.PI / 180;
        this.brazo.rotation.z = angle;
    }

    setGiroAntebrazoY(giro){
        const angle = giro * Math.PI / 180;
        this.antebrazo.rotation.y = angle;
    }

    setGiroAntebrazoZ(giro){
        const angle = giro * Math.PI / 180;
        this.antebrazo.rotation.z = angle;
    }

    setGiroPinza(giro){
        const angle = giro * Math.PI / 180;
        this.mano.rotation.z = angle;
    }
    setSeparacionPinza(sep){
        const pIni = 0.02;
        const pFin = 0.2;
       
        this.pinzaIzq.position.z = -(0.0093*sep+pIni);
        this.pinzaDer.position.z = 0.0093*sep+pIni;
        
    }

    setSolidAlambres(solid){
        this.robotMaterial.wireframe = !solid;
    }

    animationMoveObject(effectControler){
        const sep = {sepValue:effectControler.separacionPinza};
        const robot = this;
        this.setGiroBrazo(0);
        this.setGiroAntebrazoZ(0);
        this.setGiroAntebrazoY(0);
        this.setGiroPinza(0);
        this.setSeparacionPinza(10);
        
        
        const rotateBaseAnim = new TWEEN.Tween(robot.rotation)
                            .to({y:[this.rotation.y,this.rotation.y+Math.PI/6]},1000)
                            .interpolation(TWEEN.Interpolation.Bezier)
                            .easing(TWEEN.Easing.Quadratic.In)
                            .onUpdate(function(){
                                effectControler.giroBase = robot.rotation.y;
                            });

        const rotateArmAnim = new TWEEN.Tween(this.brazo.rotation)
                                    .to({z:[0, - Math.PI/6]},1000)
                                    .interpolation(TWEEN.Interpolation.Bezier)
                                    .easing(TWEEN.Easing.Quadratic.In)
                                    .onUpdate(function(){
                                        effectControler.giroBrazo = robot.brazo.rotation.z;
                                    });
        const rotateAntiArmAnim = new TWEEN.Tween(this.antebrazo.rotation)
                                .to({z:[0, - Math.PI/3]},1000)
                                .interpolation(TWEEN.Interpolation.Bezier)
                                .easing(TWEEN.Easing.Quadratic.In)
                                .onUpdate(function(){
                                    effectControler.giroAntebrazoZ = robot.antebrazo.rotation.z;
                                });

        const grabObjectAnim = new TWEEN.Tween(sep)
                                .to({sepValue:[11,9,5]},1000)
                                .interpolation(TWEEN.Interpolation.Bezier)
                                .easing(TWEEN.Easing.Quadratic.In)
                                .onUpdate(function(){
                                   robot.setSeparacionPinza(sep.sepValue);
                                   effectControler.separacionPinza = sep.sepValue;
                                });
        
        const rotateArmBack = new TWEEN.Tween(this.brazo.rotation)
                                .to({z:[-Math.PI/6,0]},1000)
                                .interpolation(TWEEN.Interpolation.Bezier)
                                .easing(TWEEN.Easing.Quadratic.In)
                                .onUpdate(function(){
                                    effectControler.giroBrazo = robot.brazo.rotation.z;
                                });


        const rotateBaseAnim2 = new TWEEN.Tween(this.rotation)
                            .to({y:[this.rotation.y,this.rotation.y+Math.PI/2]},1000)
                            .interpolation(TWEEN.Interpolation.Bezier)
                            .easing(TWEEN.Easing.Quadratic.In)
                            .onUpdate(function(){
                                effectControler.giroBase = robot.rotation.y;
                            });

        const rotateArmAgain = new TWEEN.Tween(this.brazo.rotation)
                                .to({z:[0, - Math.PI/6]},1000)
                                .interpolation(TWEEN.Interpolation.Bezier)
                                .easing(TWEEN.Easing.Quadratic.In)
                                .onUpdate(function(){
                                    effectControler.giroBrazo = robot.brazo.rotation.z;
                                });
        
        const dropObjectAnim =  new TWEEN.Tween(sep)
                                .to({sepValue:[5,9,11]},1000)
                                .interpolation(TWEEN.Interpolation.Bezier)
                                .easing(TWEEN.Easing.Quadratic.In)
                                .onUpdate(function(){
                                   robot.setSeparacionPinza(sep.sepValue);
                                      effectControler.separacionPinza = sep.sepValue;
                                });
        const coords = {antArmZ:-Math.PI/3,armZ:-Math.PI/6};
        const returnToOriginAntiArmAnim = new TWEEN.Tween(coords)
                                        .to({antArmZ:[-Math.PI/6,0],armZ:[-Math.PI/6,0]},1000)
                                        .interpolation(TWEEN.Interpolation.Bezier)
                                        .easing(TWEEN.Easing.Quadratic.In)
                                        .onUpdate(function(){
                                                robot.antebrazo.rotation.z = coords.antArmZ;
                                                robot.brazo.rotation.z = coords.armZ;
                                                effectControler.giroAntebrazoZ = robot.antebrazo.rotation.z;
                                                effectControler.giroBrazo = robot.brazo.rotation.z;
                                        });

        rotateBaseAnim.chain(rotateArmAnim);
        rotateArmAnim.chain(rotateAntiArmAnim);
        rotateAntiArmAnim.chain(grabObjectAnim);
        grabObjectAnim.chain(rotateArmBack);
        rotateArmBack.chain(rotateBaseAnim2);
        rotateBaseAnim2.chain(rotateArmAgain);
        rotateArmAgain.chain(dropObjectAnim);
        dropObjectAnim.chain(returnToOriginAntiArmAnim);                        

        return rotateBaseAnim;
                            
    }

}
