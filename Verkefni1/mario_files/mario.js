/////////////////////////////////////////////////////////////////
//    Tölvugrafík 
//    Verkefni 1
//    Eva Margrét
/////////////////////////////////////////////////////////////////

var canvas;
var gl;
var vPosition;

//Buffers 
var bufferMario;
var bufferGround;
var bufferGold;

// Color on object 
const colorMario = vec4( 1.0, 0.0, 0.0, 1.0 );
const colorGround = vec4( 0.0, 1.0, 0.0, 1.0 );
const colorGold = vec4( 1.0, 1.0, 0.0, 1.0 );

// get local position
var locColor;

//Mario stuff
let mario ;
let isJumping = false;
let goingLeft = false;
let falling= false;
let score = 0;

//Ground stuff
let ground;

//Gold stuff
let gold;
let goldX = Math.random() * (0.9 + 0.9) -0.9;
let goldY = Math.random() * (0.1 + 0.7) -0.7;
let goldInGame = true;
let iniTime;

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );

    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.77, 0.89, 0.98, 1 );

     //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    mario = [ vec2( -0.6, -0.8 ),
        vec2( -0.6, -0.5 ),
        vec2( -0.4, -0.65 )];

    ground = [
        vec2( -1, -1 ),
        vec2( -1, -0.8 ),
        vec2( 1, -1 ),
        vec2( -1, -0.8 ),
        vec2( 1, -0.8 ),
        vec2( 1, -1 ),

        vec2( 0, -0.8 ),
        vec2( 0, -0.60 ),
        vec2( 0.2, -0.8 ),
        vec2( 0, -0.60 ),
        vec2( 0.2, -0.60),
        vec2( 0.2, -0.8 )];

    gold = [
        vec2( goldX, goldY),
        vec2( goldX, goldY - 0.1 ),
        vec2( goldX + 0.1,  goldY -0.1),
        vec2( goldX, goldY),
        vec2( goldX + 0.1,  goldY -0.1 ),
        vec2( goldX + 0.1, goldY)]
    
    // Load the data into the GPU
    bufferMario= gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferMario);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(mario), gl.STATIC_DRAW);

    bufferGround= gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferGround);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(ground),gl.STATIC_DRAW);

    bufferGold= gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferGold);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(gold),gl.STATIC_DRAW);
 
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( vPosition );

    locColor = gl.getUniformLocation( program, "rcolor" );

    document.getElementById("score-mario").innerHTML =`Stig : ${score}`;
    iniTime = Date.now();

    
    // Event listener for keyboard
    window.addEventListener("keydown", function(e){
        let xmove = 0.0;
        const direction= 0.4;
        let inCanvas=true;
        let dx= 0.04;
        // mario can't go out of canvas
        if (mario[2][0] - dx <= -1 || mario[2][0] + dx >= 1 ){
            inCanvas = false;
        }
        switch( e.keyCode ) {
            case 37:	// vinstri ör
                if (!isJumping){
                    if(inCanvas && !collisionTrap(dx,0)) {
                        xmove =- dx;
                    }
                    if(!goingLeft){
                        goingLeft = true;
                        mario[2][0] -= direction;
                    }
                }
                break;

            case 39:	// hægri ör
               if (!isJumping){
                if(goingLeft){
                    goingLeft = false;
                    mario[2][0] += direction;
                   } 
                if(inCanvas && !collisionTrap(dx,0)) {
                    xmove = dx;
                }
        
               }
                break;

            case 32:   // spacebar
                if (!isJumping){
                    isJumping = true;
                }
                break;
        }
        for(i=0; i<3; i++) {
            mario[i][0] += xmove;
        }
        gl.bindBuffer( gl.ARRAY_BUFFER, bufferMario);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(mario));
    } );

    render();
}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );
    collisionGold()
    renderMario();
    renderGround();
    renderGold();


    if (score === 10){
        document.getElementById("score-mario").innerHTML =`ÞÚ VANST LEIKINN !!`;  
    }
    else{
        window.requestAnimFrame(render); 
    }
}


function renderMario(){
    marioJumping();
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0 , 0);
    gl.uniform4fv( locColor, flatten(colorMario));
    gl.drawArrays( gl.TRIANGLES, 0, 3 );

}
function renderGround(){
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferGround);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0 , 0);
    gl.uniform4fv( locColor, flatten(colorGround));
    gl.drawArrays( gl.TRIANGLES, 0, 12);
}

function renderGold(){
    let showGold = 6;
    let disappear = 4;

    if(goldInGame){
        let time = (Date.now() - iniTime)/ 1000;
        if(Math.floor(time)!== 0 && Math.floor(time) % showGold === 0){
            goldInGame = false;
            showGold =  Math.floor(Math.random() * (7 - 3 + 1) + 3);
        }

        gl.bindBuffer( gl.ARRAY_BUFFER, bufferGold);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0 , 0);
        gl.uniform4fv( locColor, flatten(colorGold));
        gl.drawArrays( gl.TRIANGLES, 0, 6 );
    }
    else{
        // seconds
        let time = (Date.now() - iniTime)/ 1000;
        if(Math.floor(time) % disappear === 0){    
            goldX = Math.random() * (0.9 + 0.9) -0.9;
            goldY = Math.random() * (0.1 + 0.7) -0.7;
            gold = [
                vec2( goldX, goldY),
                vec2( goldX, goldY - 0.1 ),
                vec2( goldX + 0.1,  goldY -0.1),
                vec2( goldX, goldY),
                vec2( goldX + 0.1,  goldY -0.1 ),
                vec2( goldX + 0.1, goldY)];
            gl.bindBuffer( gl.ARRAY_BUFFER, bufferGold);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0 , flatten(gold));

            iniTime=Date.now();  
            goldInGame = true
            disappear =  Math.floor(Math.random() * (5 - 2 + 1) + 2);
        }
    }
}

function collisionGold(){
    let getGold = false;
    for(i=0; i<3; i++){
        for(j=0; j<3; j++){
            if(mario[i][0] >= goldX && mario[i][0] <= goldX + 0.1){
                if (mario[j][1]>= goldY-0.1 && mario[j][1]>= goldY){
                    getGold= true;
                }
            }
        }
    }
    if(getGold){
        if(goldInGame){
            score +=1;
            document.getElementById("score-mario").innerHTML =`Stig : ${score}`;
        }
        goldInGame=false;
    }
}

function collisionTrap(dx,dy){
    let collision = false;
    for(i=0; i<3; i++){
        for(j=0; j<3; j++){
            if(mario[i][0] +dx >= ground[7][0] && mario[i][0] -dx <= ground[8][0]){
                if (mario[j][1] - dy <= ground[7][1]){
                    collision= true;
                }
            }
        }
    }
    return collision;
}


function marioJumping(){
    let dy=0.03;
    let dx=0.01;
    const maxjump = 0.1;
    const onGround= -0.8;
    let inCanvas=true;


    // collision canvas
    if (mario[2][0] - dx <= -1 || mario[2][0] + dx >= 1 ){
        inCanvas = false;
    }

    //Jumping up
    if (isJumping && ! falling){
        if(goingLeft){
            for(i=0; i<3; i++) {
                mario[i][1] += dy;
                if(inCanvas){
                    mario[i][0] -= dx; 
                } 
            }
        }
        else{
            for(i=0; i<3; i++) {
                mario[i][1] += dy;
                if(inCanvas){
                    mario[i][0] += dx; 
                } 
            }
        }   
        if(mario[0][1]> maxjump){
            falling = true;
        }
    }
    // Falling down
    if (falling){
        if(collisionTrap(0,dy)){
            dy=0.0
        }
        if(goingLeft){
            for(i=0; i<3; i++) {
                mario[i][1] -= dy;
                if(inCanvas){
                    mario[i][0] -= dx; 
                } 
            }
        }
        else{
            if(collisionTrap(0,dy)){
                dy=0.0
            }
            for(i=0; i<3; i++) {
                mario[i][1] -= dy;
            
                if(inCanvas){
                    mario[i][0] += dx; 
                } 
            }
        }
        if(mario[0][1] <= onGround){
            falling=false;
            isJumping=false;
        }
    }
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferMario);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0 , flatten(mario));
}