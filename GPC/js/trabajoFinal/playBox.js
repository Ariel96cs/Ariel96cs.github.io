/**
 * Mesa rotatoria object class
 * 
 * author: ariel96cs
 */
// Modulos necesarios
import * as THREE from "../../lib/three.module.js"
import {GLTFLoader} from "../../lib/GLTFLoader.module.js"
import * as CANNON from "../../lib/cannon-es.module.js"
import { findObjectByNameRecursive,object3DToXML } from "./utils.js";
export {PlayBox};



class PlayBox extends THREE.Object3D{
    constructor(world,scale=3){
        super();
        // Añadadir objetos a la escena
    // importar modelo en gltf
    const gltfLoader = new GLTFLoader();
    this.raycaster = new THREE.Raycaster();
    this.world = world;
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
        this.outsideMazeWalls = findObjectByNameRecursive(gltf.scene,'Inner');
        this.root = findObjectByNameRecursive(gltf.scene,'Collada_visual_scene_group');
        this.ball = findObjectByNameRecursive(gltf.scene,'Icosphere001');

        // agrupar las paredes del laberinto y el suelo para rotarlas como un todo
        this.maze = new THREE.Group();
        this.maze.add(this.mazeWalls);
        this.maze.add(this.mazeFloor);        
        this.root.add(this.maze);

        
        // agrupar las paredes de la caja y el suelo
        this.lateralWalls = findObjectByNameRecursive(gltf.scene,'Wall');
        this.floor = findObjectByNameRecursive(gltf.scene,'Floor001');
        this.mazeBoxWalls = new THREE.Group();
        this.mazeBoxWalls.add(this.lateralWalls);
        this.mazeBoxWalls.add(this.floor);
        this.root.add(this.mazeBoxWalls);

        // crear el mundo fisico

        this.physicGroundMaze = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Plane(),
            position: new CANNON.Vec3(0,-1,0)
        });
        // rotar el suelo para que quede plano
        this.physicGroundMaze.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);

        this.world.addBody(this.physicGroundMaze);

        // extract ball ratio
        const ballRatio = this.ball.scale.x;

        // crear la bola
        this.physicBall = new CANNON.Body({
            mass: 0.1,
            shape: new CANNON.Sphere(ballRatio),
            // position: new CANNON.Vec3()
        });

        this.world.addBody(this.physicBall);

        // Define una velocidad inicial en el eje Y (hacia arriba)
        const initialVelocity = new CANNON.Vec3(0, 5, 0);

        // Aplica la velocidad inicial al cuerpo rígido de la pelota
        this.phisicBall.velocity.copy(initialVelocity);
        // // crear el suelo de la caja
        // this.physicFloor = new CANNON.Body({
        //     mass: 0,
        //     shape: new CANNON.Box(new CANNON.Vec3(1,1,1)),
        //     position: this.mazeBoxWalls.position
        // });

    });

    
    }

    animate(){
        if (this.mazeFloor && this.physicGroundMaze){
            // this.mazeFloor.position.copy(this.physicGroundMaze.position);
            // this.mazeFloor.quaternion.copy(this.physicGroundMaze.quaternion);
            
            this.ball.position.copy(this.physicBall.position);
            this.ball.quaternion.copy(this.physicBall.quaternion);
        }
        
    }

    addToScene(scene) {
        scene.add(this);
    }

    // rotar la manivela Izquierda-Derecha de la caja
    rotateHandleLR(angle){
        if (this.handleLR){
            const handleLRBeforeRot = this.handleUD.rotation.x;
            const mazeBeforeRot = this.maze.rotation.x;

            this.handleLR.rotation.x = angle;
            this.maze.rotation.x = angle;

            if (this.checkCollisions(this.maze,this.outsideMazeWalls)){
                this.handleLR.rotation.x = handleLRBeforeRot;
                this.maze.rotation.x = mazeBeforeRot;
            }

            
        }
            

    }

    // rotar la manivela Arriba-Abajo de la caja
    rotateHandleUD(angle){
        if (this.handleUD){
            const handleUDBeforeRot = this.handleUD.rotation.y;
            const mazeBeforeRot = this.maze.rotation.z;

            this.handleUD.rotation.y = angle;
            this.maze.rotation.z = angle;

            if (this.checkCollisions(this.maze,this.outsideMazeWalls)){
                this.handleUD.rotation.y = handleUDBeforeRot;
                this.maze.rotation.z = mazeBeforeRot;
            }
            
        }
            
    }
    checkCollisions(object1,object2) {

        const origin = object1.position.clone();
        const direction = object2.position.clone().sub(object1.position).normalize();
        this.raycaster.set(origin, direction);

        const intersections = this.raycaster.intersectObjects([object1, object2]);
    
        if (intersections.length > 0) {
            // Colisión detectada, toma las acciones apropiadas
            return true;
        }
        return false;

    }
}