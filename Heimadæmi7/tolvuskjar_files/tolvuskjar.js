/////////////////////////////////////////////////////////////////
//    Sýnislausn á dæmi 3 í heimadæmum 4 í Tölvugrafík
//     Sýnir tölvuskjá búinn til úr þremur teningum.
//
//    Hjálmtýr Hafsteinsson, febrúar 2022
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var NumVertices  = 36;
var numScrrenVertices  = 6;

var program1;
var program2;

var texture;

var points = [];
var colors = [];

var movement = false;     // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var zDist = -2.0;

var modelViewLoc;
var projectionLoc;
var projectionMatrix;


var locProjection1;
var locModelView1;
var locPosition1;
var locProjection2;
var locModelView2;
var locPosition2;
var locTexCoord;


var vBuffer;
var screenBuffer;

// Tveir þríhyrningar sem mynda spjald í z=0 planinu fyrir tölvuskjá
var vertices = [
    vec4( -0.5, -0.5, -0.7, 1.0 ),
    vec4(  0.5, -0.5, -0.7, 1.0 ),
    vec4(  0.5,  0.5, -0.7, 1.0 ),
    vec4(  0.5,  0.5, -0.7, 1.0 ),
    vec4( -0.5,  0.5, -0.7, 1.0 ),
    vec4( -0.5, -0.5, -0.7, 1.0 )
];

// Mynsturhnit fyrir spjaldið
var texCoords = [
    vec2( 0.0, 0.0 ),
    vec2( 1.0, 0.0 ),
    vec2( 1.0, 1.0 ),
    vec2( 1.0, 1.0 ),
    vec2( 0.0, 1.0 ),
    vec2( 0.0, 0.0 )
];

function configureTexture( image, prog ) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
    gl.useProgram(prog);
    gl.uniform1i(gl.getUniformLocation(prog, "texture"), 0);
}


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

   
    // Litarar sem lita með einum lit (sendur sem uniform-breyta)
    program1 = initShaders( gl, "vertex-shader", "fragment-shader" );
    // Litarar sem lita með mynstri
    program2 = initShaders( gl, "vertex-shader2", "fragment-shader2" );
        
    //gl.useProgram( program );
    
    /*var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );*/

    // Tölvan
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );


    locPosition1 = gl.getAttribLocation( program1, "vPosition" );
    gl.enableVertexAttribArray( locPosition1 );

    locProjection1 = gl.getUniformLocation( program1, "projection" );
    locModelView1 = gl.getUniformLocation( program1, "modelview" );

    
    screenBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, screenBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    
    locPosition2 = gl.getAttribLocation( program2, "vPosition" );
    gl.enableVertexAttribArray( locPosition2 );
    
    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW );


    locTexCoord = gl.getAttribLocation( program2, "vTexCoord" );
    gl.vertexAttribPointer( locTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( locTexCoord );
    
    var image = document.getElementById("texImage");
    configureTexture( image, program2 );

    locProjection2 = gl.getUniformLocation( program2, "projection" );
    locModelView2 = gl.getUniformLocation( program2, "modelview" );

   
    var proj = perspective( 50.0, 1.0, 0.2, 100.0 );
    
    gl.useProgram(program1);
    gl.uniformMatrix4fv(locProjection1, false, flatten(proj));
    
    gl.useProgram(program2);
    gl.uniformMatrix4fv(locProjection2, false, flatten(proj));

    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY = ( spinY + (origX - e.offsetX) ) % 360;
            spinX = ( spinX + (e.offsetY - origY) ) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );

    // Event listener for keyboard
     window.addEventListener("keydown", function(e){
         switch( e.keyCode ) {
            case 38:	// upp ör
                zDist += 0.1;
                break;
            case 40:	// niður ör
                zDist -= 0.1;
                break;
         }
     }  );  

    // Event listener for mousewheel
     window.addEventListener("wheel", function(e){
         if( e.deltaY > 0.0 ) {
             zDist += 0.2;
         } else {
             zDist -= 0.2;
         }
     }  );  
       
    
    render();
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) 
{
    var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        colors.push(vertexColors[a]);
    }
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var mv = lookAt( vec3(0.0, 0.0, zDist), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) ) ;

    var mv2 = mv;
    gl.useProgram(program1);
    // Smíða tölvuskjá
    // Fyrst botnplatan..
    mv1 = mult( mv, translate( 0.0, -0.2, 0.0 ) );
    mv1 = mult( mv1, scalem( 0.4, 0.04, 0.25 ) );
    gl.uniformMatrix4fv(locModelView1, false, flatten(mv1));
    gl.uniform4fv( gl.getUniformLocation( program1, "Color" ), vec4(0.0, 1.0, 0.0, 1.0) );
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.vertexAttribPointer( locPosition1, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

	// Svo stöngin...
    mv1 = mult( mv, translate( 0.0, 0., 0.0 ) );
    mv1 = mult( mv1, scalem( 0.1, 0.4, 0.05 ) );
    gl.uniformMatrix4fv(locModelView1, false, flatten(mv1));
    gl.uniform4fv( gl.getUniformLocation( program1, "Color" ), vec4(0.0, 1.0, 0.0, 1.0) );
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.vertexAttribPointer( locPosition1, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    // Loks skjárinn sjálfur...
    mv1 = mult( mv, translate( 0.0, 0.3, -0.02 ) );
    mv1 = mult( mv1, rotateX( 5 ));
    mv1 = mult( mv1, scalem( 0.7, 0.5, 0.02 ) );
    gl.uniformMatrix4fv(locModelView1, false, flatten(mv1));
    gl.uniform4fv( gl.getUniformLocation( program1, "Color" ), vec4(0.0, 1.0, 0.0, 1.0) );
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.vertexAttribPointer( locPosition1, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );


    gl.useProgram(program2);
    mv2 = mult( mv2, translate(0.0, 0.3, -0.02 ) );
    mv2 = mult( mv2, rotateX( 5 ));
    mv2 = mult( mv2, scalem(0.7, 0.5, 0.02) );
    gl.uniformMatrix4fv(locModelView2, false, flatten(mv2));

    gl.bindBuffer( gl.ARRAY_BUFFER, screenBuffer );
    gl.vertexAttribPointer( locPosition2, 4, gl.FLOAT, false, 0, 0 );

    gl.drawArrays( gl.TRIANGLES, 0, numScrrenVertices );

    requestAnimFrame( render );
}

