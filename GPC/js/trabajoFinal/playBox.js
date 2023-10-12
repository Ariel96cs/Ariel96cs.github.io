/**
 * Mesa rotatoria object class
 * 
 * author: ariel96cs
 */
// Modulos necesarios
import * as THREE from "../../lib/three.module.js"
import {GLTFLoader} from "../../lib/GLTFLoader.module.js"
import { findObjectByNameRecursive,object3DToXML } from "./utils.js";
export {PlayBox};

class PlayBox extends THREE.Object3D{
    constructor(scale=3){
        super();
        // Añadadir objetos a la escena
    // importar modelo en gltf
    const gltfLoader = new GLTFLoader();
    const currentObject = this;
    gltfLoader.load('models/caja_rotatoria/scene.gltf', (gltf)=>{
    // poner la caja sobre el suelo
         gltf.scene.position.y = 1.5;
         this.add(gltf.scene);
         this.playBox = gltf.scene;
        //  console.log(object3DToXML(this.playBox));
        this.handleLR = findObjectByNameRecursive(gltf.scene,'Handle');
        this.handleUD = findObjectByNameRecursive(gltf.scene,'Handle_1');
        this.mazeWalls = findObjectByNameRecursive(gltf.scene,'Cube001');
        this.mazeFloor = findObjectByNameRecursive(gltf.scene,'Main001');
        this.root = findObjectByNameRecursive(gltf.scene,'Collada_visual_scene_group');
        this.maze = new THREE.Group();
        this.maze.add(this.mazeWalls);
        this.maze.add(this.mazeFloor);
        this.root.add(this.maze);
        
    });

    
    }

    addToScene(scene) {
        scene.add(this);
    }

    // rotar la manivela Izquierda-Derecha de la caja
    rotateHandleLR(angle){
        if (this.handleLR){
            this.handleLR.rotation.x = angle;
            this.maze.rotation.x = angle;
        }
            

    }

    // rotar la manivela Arriba-Abajo de la caja
    rotateHandleUD(angle){
        if (this.handleUD){
            this.handleUD.rotation.y = angle;
            this.maze.rotation.z = angle;
        }
            
    }
}