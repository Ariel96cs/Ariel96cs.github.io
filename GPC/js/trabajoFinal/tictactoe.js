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
    constructor(world,scene){
        this.heightFromDrop = 5;
        this.world = world;
        this.scene = scene;
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
        this.board.position.copy(this.physicBoard.position);
        this.balls = [];
        this.physicBalls = [];
        this.color1 = 'blue';
        this.color2 = 'red';

        // logic
        this.player1Turn = true;
        this.gameOver = false;
        this.playerGeometry = new THREE.SphereGeometry(1,50,50);
        this.winner = -1;
        this.newGame = true;
        this.score1 = 0;
        this.score2 = 0;
        
    }
    rotateBoard(angleX,angleZ){

        this.board.rotation.x = angleX * Math.PI/180;
        this.board.rotation.z = angleZ * Math.PI/180;

        this.physicBoard.quaternion.copy(this.board.quaternion);
    }

    checkGameOver(){
        // check rows
        const emptyCell = false;
        for(let i=0;i<3;i++){
            if (this.occupiedCells[i][0] == this.occupiedCells[i][1] && this.occupiedCells[i][1] == this.occupiedCells[i][2] && this.occupiedCells[i][0] != -1){
                console.log("player "+this.occupiedCells[i][0]+" wins");
                this.gameOver = true;
                this.winner = this.occupiedCells[i][0];
                
                return;
            }
        }
        // check columns
        for(let j=0;j<3;j++){
            if (this.occupiedCells[0][j] == this.occupiedCells[1][j] && this.occupiedCells[1][j] == this.occupiedCells[2][j] && this.occupiedCells[0][j] != -1){
                console.log("player "+this.occupiedCells[0][j]+" wins");
                this.gameOver = true;
                this.winner = this.occupiedCells[0][j];
                return;
            }
        }
        // check diagonals
        if (this.occupiedCells[0][0] == this.occupiedCells[1][1] && this.occupiedCells[1][1] == this.occupiedCells[2][2] && this.occupiedCells[0][0] != -1){
            console.log("player "+this.occupiedCells[0][0]+" wins");
            this.gameOver = true;
            this.winner = this.occupiedCells[0][0];
            return;
        }
        if (this.occupiedCells[0][2] == this.occupiedCells[1][1] && this.occupiedCells[1][1] == this.occupiedCells[2][0] && this.occupiedCells[0][2] != -1){
            console.log("player "+this.occupiedCells[0][2]+" wins");
            this.gameOver = true;
            this.winner = this.occupiedCells[0][2];
            return;
        }
        this.updateScore();
    }
    updateScore(){
        if (this.newGame) return;
        if (this.winner==2){
            this.score2 +=1;
            this.newGame = false;
        }
        else if (this.winner==1){
            this.score1 +=1;
            this.newGame = false;
        }
    }
    play(i,j){
        console.log("playing "+i+","+j);
        if (this.gameOver) return;
        console.log("player1Turn: "+this.player1Turn);
        if (this.player1Turn){
            this.addPlayer1ObjOverCell(i,j);
        }
        else{
            this.addPlayer2ObjOverCell(i,j);
        }
        this.checkGameOver();
    }
    setPlayer1ObjTex(tex){
        this.player1ObjTex = tex;
    }

    setPlayer2ObjTex(tex){
        this.player2ObjTex = tex;
    }

    createPlayer1Obj(){
        const entorno = ["./imgs/posx.jpg","./imgs/negx.jpg",
        "./imgs/posy.jpg","./imgs/negy.jpg",
        "./imgs/posz.jpg","./imgs/negz.jpg"];
        const entornoTex = new THREE.CubeTextureLoader().load(entorno);
        const material = new THREE.MeshPhongMaterial({envMap: entornoTex, 
                                                        color: this.color1,
                                                        specular:'gray',
                                                        shininess: 30,
                                                        });
        const obj = new THREE.Mesh(this.playerGeometry,material);
        obj.name = "player1";
        obj.castShadow = true;
        obj.receiveShadow = true;
        return obj;
    }

    createPlayer2Obj(){
        
        const obj = new THREE.Mesh(this.playerGeometry,new THREE.MeshLambertMaterial({map:this.player2ObjTex,color:this.color2}));
        obj.castShadow = true;
        obj.receiveShadow = true;
        obj.name = "player2";
        return obj;
    }

    createPhysicBoard(){
        const groundMaterial = new CANNON.Material("groundMaterial");
        groundMaterial.restitution = 0.1;
        // create the physic board  
        this.physicBoard = new CANNON.Body({
            mass: 0,

            shape: new CANNON.Box(new CANNON.Vec3(this.board.boardWidth/2,0.1,this.board.boardHeight/2)),
            position: new CANNON.Vec3(0,0,0),
            material: groundMaterial
        });
        // this.physicBoard.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
        this.world.addBody(this.physicBoard);
    }

    createPhysicPlayer(){
        const bouncingMaterial = new CANNON.Material("bouncingMaterial");
        bouncingMaterial.restitution = 5; 

        const physicPlayer = new CANNON.Body({
            mass: 0.1,
            shape: new CANNON.Sphere(1),
            position: new CANNON.Vec3(0,this.heightFromDrop,0),
            material: bouncingMaterial
        });
        return physicPlayer;
    }


    addPlayer1ObjOverCell(i,j){
        this.addPlayerObjOverCell(this.createPlayer1Obj(),i,j,1);
    }
    addPlayer2ObjOverCell(i,j){
        this.addPlayerObjOverCell(this.createPlayer2Obj(),i,j,2);
    }
    updateObjectPositions(){
        for(let i=0;i<this.balls.length;i++){
            this.balls[i].position.copy(this.physicBalls[i].position);
            this.balls[i].quaternion.copy(this.physicBalls[i].quaternion);
        }

    }
    addBallsToScene(scene){
        console.log("adding balls to scene");
        this.balls.forEach(ball => {
            scene.add(ball);
            console.log("view ball added to scene",ball.name);
        });

        this.physicBalls.forEach(ball => {
            this.world.addBody(ball);
            console.log("physic ball added to world");
        });
    }
    addPlayerObjOverCell(obj,i,j,playerId){
        console.log("adding player "+playerId+" over cell "+i+","+j);

        // check that the cell is not occupied
        if(this.occupiedCells[i][j] != -1){
            console.log("cell "+i+","+j+" is occupied");
            return;
        }
        
        const physicPlayer = this.createPhysicPlayer();
        
        
        // add the object to the cell
        const cell = this.board.getObjectByName("cell"+i+","+j);

        // drop the player object over the cell
        physicPlayer.position.set(cell.position.x,this.heightFromDrop,cell.position.z);
        obj.position.copy(physicPlayer.position);
        
        // update the occupied cells matrix
        this.occupiedCells[i][j] = playerId;
        this.balls.push(obj);
        this.physicBalls.push(physicPlayer);

        obj.userData = {playerId:playerId};
        this.player1Turn = !this.player1Turn;
        this.world.addBody(physicPlayer);
        this.scene.add(obj);
    }
    // resetGame
    resetGame(){
        // remove the balls from the scene
        this.balls.forEach(ball => {
            this.scene.remove(ball);
        });
        // remove the physic balls from the world
        this.physicBalls.forEach(ball => {
            this.world.removeBody(ball);
        });
        // reset the occupied cells matrix
        for(let i=0;i<3;i++){
            for(let j=0;j<3;j++){
                this.occupiedCells[i][j] = -1;
            }
        }
        // reset the logic
        this.gameOver = false;
        this.player1Turn = true;
        this.winner = -1;
        this.balls = [];
        this.physicBalls = [];
        this.newGame = true;

        this.board.rotation.set(0,0,0);
        this.physicBoard.quaternion.copy(this.board.quaternion);
    }

    // Animations
    jumpWinnerBalls() {
        if (this.gameOver) {
        const force = new CANNON.Vec3(0, 3, 0); // Apply an upward force
    
        for (let index = 0; index < this.physicBalls.length; index++) {
            const physicBall = this.physicBalls[index];
            const viewBall = this.balls[index];
    
            if (viewBall.userData.playerId == this.winner) {
                // Apply an upward force to the winner balls
                physicBall.applyLocalForce(force, new CANNON.Vec3(0, 0, 0));
                
                // Wait for 2 seconds (adjust the time as needed) and then apply a downward force
                setTimeout(() => {
                    const reverseForce = new CANNON.Vec3(0, -force.y, 0); // Fuerza en sentido opuesto
                    physicBall.applyLocalForce(reverseForce, new CANNON.Vec3(0, 0, 0));
                }, 2000); // 2000 milliseconds (2 seconds)
                }
            }
        }
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
        this.name = "TicTacToeBoard";
        
       
    }

    createBoard(){
        const cell = this.createCell(this.cellMaterial);
        const cellSize = cell.geometry.parameters.width;
        this.boardWidth = this.cols*cellSize;
        this.boardHeight = this.rows*cellSize;
        for(let i=0;i<this.cols;i++){
            for(let j=0;j<this.rows;j++){
                const cell = this.createCell(this.cellMaterial);
                cell.position.set((i-1)*cellSize,0,(j-1)*cellSize);
                cell.name = "cell"+i+","+j;
                cell.userData = {i:i,j:j};
                this.add(cell);
                console.log("cell "+i+","+j+" created");
            }
        }

    }

    createCell(material){
        const cell = new THREE.Mesh(new THREE.BoxGeometry(5,0.2,5),material);
        cell.receiveShadow = true;
        return cell;
    }
    
}