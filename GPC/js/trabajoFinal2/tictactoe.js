/**
 * Tic Tac Toe Board Game class
 * 
 * author:  @acotsan
 */

// imports
import * as THREE from "../../lib/three.module.js"
import * as CANNON from "../../lib/cannon-es.module.js"

export {TicTacToe};

class TicTacToe {
    constructor(world){
        this.heightFromDrop = 10;
        this.world = world;
        this.board = new TicTacToeBoard(3,3);   
        // instanciate a boolena matrix to keep track of the cells that are occupied
        this.occupiedCells = new Array(3);
        for(let i=0;i<3;i++){
            this.occupiedCells[i] = new Array(3);
            for(let j=0;j<3;j++){
                this.occupiedCells[i][j] = -1;
            }
        }
        this.player1ObjTex = new THREE.TextureLoader().load('imgs/wood512.jpg');
        this.player2ObjTex = new THREE.TextureLoader().load('imgs/chess.png');
        this.createPhysicBoard();
    }

    createPhysicBoard(){
        // create the physic board
        this.physicBoard = new CANNON.Body({
            mass: 0,

            shape: new CANNON.Box(new CANNON.Vec3(this.board.boardWidth/2,0.1,this.board.boardHeight/2)),
            position: new CANNON.Vec3(0,0,0)
        });
        this.physicBoard.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
        this.world.addBody(this.physicBoard);
    }

    setPlayer1ObjTex(tex){
        this.player1ObjTex = tex;
    }

    setPlayer2ObjTex(tex){
        this.player2ObjTex = tex;
    }

    createPlayer1Obj(){
        const obj = new THREE.Mesh(new THREE.SphereGeometry( 1, 2, 2 ),new THREE.MeshLambertMaterial({map:this.player1ObjTex,color:'blue'}));
        return obj;
    }
    
    createPhysicPlayer(){
        const physicPlayer = new CANNON.Body({
            mass: 0.1,
            shape: new CANNON.Sphere(1),
            position: new CANNON.Vec3(0,this.heightFromDrop,0)
        });
        return physicPlayer;
    }

    createPlayer2Obj(){
        const obj = new THREE.Mesh(new THREE.SphereGeometry( 1, 2,2 ),new THREE.MeshLambertMaterial({map:this.player2ObjTex,color:'red'}));
        return obj;
    }

    addPlayer1ObjOverCell(i,j){
        this.addPlayerObjOverCell(this.createPlayer1Obj(),i,j);
    }
    addPlayerObj2OverCell(i,j){
        this.addPlayerObjOverCell(this.createPlayer2Obj(),i,j);
    }
    addPlayerObjOverCell(obj,i,j){
        // check that the cell is not occupied
        if(this.occupiedCells[i][j] != -1){
            console.log("cell "+i+","+j+" is occupied");
            return;
        }
        
        const physicPlayer = this.createPhysicPlayer();
        this.world.addBody(physicPlayer);
        
        // add the object to the cell
        const cell = this.board.board.getObjectByName("cell"+i+","+j);

        // drop the player object over the cell
        physicPlayer.position.set(cell.position.x,this.heightFromDrop,cell.position.z);
        obj.position.copy(physicPlayer.position);
        
        // update the occupied cells matrix
        this.occupiedCells[i][j] = 2;

    }
    
}
class TicTacToeBoard extends THREE.Object3D {
    constructor(cols, rows, padding=0.1){
        super();
        this.cellTex = new THREE.TextureLoader().load('imgs/wood512.jpg');
        this.cellMaterial =  new THREE.MeshLambertMaterial({map:this.cellTex});
        this.cols = cols;
        this.rows = rows;
        this.boardWidth = this.cols;
        this.boardHeight = this.rows;
        this.padding = padding;
        this.createBoard();
        this.add(this.board);
        this.name = "TicTacToeBoard";
        
        // rotar el tablero para que quede plano
        // this.rotation.x = -Math.PI/2;
       
    }
    createBoard(){
        const board = new THREE.Object3D();
        const cell = this.createCell(this.cellMaterial);
        const cellSize = cell.geometry.parameters.width;
        this.boardWidth = this.cols*cellSize;
        this.boardHeight = this.rows*cellSize;
        for(let i=0;i<this.cols;i++){
            for(let j=0;j<this.rows;j++){
                const cell = this.createCell(this.cellMaterial);
                cell.position.set(i*cellSize,0,j*cellSize);
                cell.name = "cell"+i+","+j;
                board.add(cell);
                console.log("cell "+i+","+j+" created");
            }
        }

        board.position.set(0,0,0);

        this.board = board;
        
        return board;
    }

    createCell(material){
        const cell = new THREE.Mesh(new THREE.BoxGeometry(3,0.2,3),material);
        return cell;
    }
    
}