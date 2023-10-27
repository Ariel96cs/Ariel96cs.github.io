/**
 * Tic Tac Toe Board Game class
 * 
 * author:  @acotsan
 */

// imports
import * as THREE from "../../lib/three.module.js"
import * as CANNON from "../../lib/cannon-es.module.js"
import {TWEEN} from "../../lib/tween.module.min.js"

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
        this.player1ObjTex = 'wood';
        this.player2ObjTex = 'chess';
        
        this.balls = [];
        this.physicBalls = [];
        this.color1 = 'blue';
        this.color2 = 'red';

        // logic
        this.player1Turn = true;
        this.player1StartedGame = true;

        this.gameOver = false;
        this.playerGeometry = new THREE.SphereGeometry(1,50,50);
        this.winner = -1;
        
        this.score1 = 0;
        this.score2 = 0;
        this.updatedScore = false;
        this.totalFreeCells = 9;
      
        
    }


    checkGameOver(){
        // check rows
        if (this.totalFreeCells == 0) this.gameOver = true;
        for(let i=0;i<3;i++){
            // check if theres an empty cell

            if (this.occupiedCells[i][0] == this.occupiedCells[i][1] && this.occupiedCells[i][1] == this.occupiedCells[i][2] && this.occupiedCells[i][0] != -1){
                this.gameOver = true;
                this.winner = this.occupiedCells[i][0];
                
                return;
            }
        }
        // check columns
        for(let j=0;j<3;j++){
            if (this.occupiedCells[0][j] == this.occupiedCells[1][j] && this.occupiedCells[1][j] == this.occupiedCells[2][j] && this.occupiedCells[0][j] != -1){
                this.gameOver = true;
                this.winner = this.occupiedCells[0][j];
                return;
            }
        }
        // check diagonals
        if (this.occupiedCells[0][0] == this.occupiedCells[1][1] && this.occupiedCells[1][1] == this.occupiedCells[2][2] && this.occupiedCells[0][0] != -1){
            this.gameOver = true;
            this.winner = this.occupiedCells[0][0];
            return;
        }
        if (this.occupiedCells[0][2] == this.occupiedCells[1][1] && this.occupiedCells[1][1] == this.occupiedCells[2][0] && this.occupiedCells[0][2] != -1){
            this.gameOver = true;
            this.winner = this.occupiedCells[0][2];
            return;
        }
        
        
    }

    updateScore(){
        if (!this.updatedScore && this.gameOver) {
            if (this.winner==2){
                this.score2 +=1;
                this.player1StartedGame = false;
            }
            else if (this.winner==1){
                this.score1 +=1;
                this.player1StartedGame = true;
            }
            this.player1Turn = this.winner==1;
            this.updatedScore = true;
            
        }
        
    }
    play(i,j){
        
        if (this.gameOver){

            if(this.totalFreeCells == 0 && this.winner==-1){
                this.player1Turn = !this.player1StartedGame;
            }
            return;
        } 
        if (this.player1Turn){
            this.addPlayer1ObjOverCell(i,j);
        }
        else{
            this.addPlayer2ObjOverCell(i,j);
        }
        this.checkGameOver();
        this.updateScore();
        if (this.gameOver && this.totalFreeCells == 0 && this.winner==-1){
                this.player1Turn = !this.player1StartedGame;
        } 
    }
    setPlayer1ObjTex(tex){
        this.player1ObjTex = tex;
    }

    setPlayer2ObjTex(tex){
        this.player2ObjTex = tex;
    }

    getBallMaterial(textureName,color){
        let texture;
        let material;
        switch(textureName){
            case 'chess':
                texture = new THREE.TextureLoader().load("./imgs/chess.png");
                material = new THREE.MeshLambertMaterial({map:texture,color:color});
                break;
            case 'cube':
                const entorno = ["./imgs/Yokohama2/posx.jpg","./imgs/Yokohama2/negx.jpg",
                                "./imgs/Yokohama2/posy.jpg","./imgs/Yokohama2/negy.jpg",
                                "./imgs/Yokohama2/posz.jpg","./imgs/Yokohama2/negz.jpg"];
                texture = new THREE.CubeTextureLoader().load(entorno);
                material = new THREE.MeshPhongMaterial({envMap: texture, 
                                                        color: color,
                                                        specular:'gray',
                                                        shininess: 30,
                                                        });
                break;
            case 'rust':
                texture = new THREE.TextureLoader().load("./imgs/rust_coarse_01_diff_1k.jpg");
                material = new THREE.MeshLambertMaterial({map:texture,color:color});
                break;
            case 'wood':
                texture = new THREE.TextureLoader().load("./imgs/wood512.jpg");
                material = new THREE.MeshLambertMaterial({map:texture,color:color});
                break;
            default:
                texture = new THREE.TextureLoader().load("./imgs/chess.jpg");
                material = new THREE.MeshLambertMaterial({map:texture,color:color});
                break;
        }
        return material;
    }

    createPlayer1Obj(){
        const material = this.getBallMaterial(this.player1ObjTex,this.color1);
        const obj = new THREE.Mesh(this.playerGeometry,material);
        obj.name = "player1";
        obj.castShadow = true;
        obj.receiveShadow = true;
        return obj;
    }

    createPlayer2Obj(){
        const material = this.getBallMaterial(this.player2ObjTex,this.color2);
        const obj = new THREE.Mesh(this.playerGeometry,material);
        obj.castShadow = true;
        obj.receiveShadow = true;
        obj.name = "player2";
        return obj;
    }

    

    createPhysicPlayer(){
        const bouncingMaterial = new CANNON.Material("bouncingMaterial");
        bouncingMaterial.restitution = 1; 

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
        this.balls.forEach(ball => {
            scene.add(ball);
        });

        this.physicBalls.forEach(ball => {
            this.world.addBody(ball);
        });
    }
    addPlayerObjOverCell(obj,i,j,playerId){

        // check that the cell is not occupied
        if(this.occupiedCells[i][j] != -1){
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
        cell.color = this.color1;

        obj.userData = {playerId:playerId};
        this.player1Turn = !this.player1Turn;
        this.world.addBody(physicPlayer);
        this.scene.add(obj);
        this.updatedScore = false;
        this.totalFreeCells -=1;
    }
    removeBallsFromScene(){
        // remove the balls from the scene
        this.balls.forEach(ball => {
            this.scene.remove(ball);
        });
        // remove the physic balls from the world
        this.physicBalls.forEach(ball => {
            this.world.removeBody(ball);
        });
    }
    // resetGame
    resetGame(){
        
        // reset the occupied cells matrix
        for(let i=0;i<3;i++){
            for(let j=0;j<3;j++){
                this.occupiedCells[i][j] = -1;
            }
        }
        // reset the logic
        this.gameOver = false;
        this.winner = -1;
        this.totalFreeCells=9;

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

                setTimeout(() => {
                    physicBall.applyLocalForce(force, new CANNON.Vec3(0, 0, 0));
                }, 1000);
                
                
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
        this.updateBoardPosition(0,0,0);
       
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
            }
        }
        this.createPhysicBoard();

    }
    addPhysics(world){  
        world.addBody(this.physicBoard);
    }

    createPhysicBoard(){
        const groundMaterial = new CANNON.Material("groundMaterial");
        groundMaterial.restitution = 0.1;
        // create the physic board  
        this.physicBoard = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(new CANNON.Vec3(this.boardWidth/2,0.1,this.boardHeight/2)),
            position: new CANNON.Vec3(0,0,0),
            material: groundMaterial
        });

        return this.physicBoard;
    }

    createCell(material){
        const cell = new THREE.Mesh(new THREE.BoxGeometry(5,0.2,5),material);
        cell.receiveShadow = true;
        return cell;
    }

    rotateBoard(angleX,angleZ){

        this.rotation.x = angleX * Math.PI/180;
        this.rotation.z = angleZ * Math.PI/180;

        this.physicBoard.quaternion.copy(this.quaternion);
    }

    updateBoardPosition(x,y,z){
        this.physicBoard.position.set(x,y,z);
        this.position.copy(this.physicBoard.position);
        this.quaternion.copy(this.physicBoard.quaternion);
    }

    animate(){
        const coords = {boardPosX:this.position.x,boardPosY:this.position.y,
            boardPosZ:this.position.z,  
            angleX:this.rotation.x,
            angleZ:this.rotation.z};
        const board = this
        const anim1 = new TWEEN.Tween(coords)
            .to({boardPosX:[0,0,0],boardPosY:[3,4,5],boardPosZ:[0,-3,-13],angleX:[0,0,-3,20,30]},3000)
            .interpolation(TWEEN.Interpolation.CatmullRom)
            .easing(TWEEN.Easing.Cubic.Out)
            .onUpdate(function(){
                board.rotateBoard(coords.angleX,coords.angleZ);
                board.updateBoardPosition(coords.boardPosX,coords.boardPosY,coords.boardPosZ);
                
            });
            const anim2 = new TWEEN.Tween(coords)
            .to({boardPosX:[0,0,0],boardPosY:[4,3,-3.5],boardPosZ:[-13,-3,0],angleX:[20,10,0]},3000)
            .interpolation(TWEEN.Interpolation.CatmullRom)
            .easing(TWEEN.Easing.Circular.In)
            .onUpdate(function(){
                board.rotateBoard(coords.angleX,coords.angleZ);
                board.updateBoardPosition(coords.boardPosX,coords.boardPosY,coords.boardPosZ);
                
            });
            anim1.onComplete(function(){
                setTimeout(function(){
                    anim2.start();
                },1000);
            })
            .start();
        

   }

    
}