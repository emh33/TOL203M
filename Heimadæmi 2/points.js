/////////////////////////////////////////////////////////////////
//    S�nid�mi � T�lvugraf�k
//     Teiknar punkt � strigann �ar sem notandinn smellir m�sinni
//
//    Hj�lmt�r Hafsteinsson, jan�ar 2021
/////////////////////////////////////////////////////////////////
var canvas;
var gl;


var maxNumPoints = 200;       // H�marksfj�ldi punkta sem forriti� r��ur vi�!
var index = 0;                // N�mer n�verandi punkts

var vertices = [
    vec2( -0.1, -0.1 ),
    vec2(  0,  0.1 ),
    vec2(  0.1, -0.1 )
];

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 1.0, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    // Tökum frá minnispláss á grafíkminni fyrir maxNumPoints tv�v�� hnit (float er 4 b�ýti)
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 8*maxNumPoints, gl.DYNAMIC_DRAW);
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    // Meðhöndlun á músarsmellum
    canvas.addEventListener('mousedown', function (e) {
        if (typeof e === 'object') {
            switch (e.buttons) {
            case 2:
                index=0;
                break;
            default:
                gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
        
                // Reikna heimshnit músarinnar út frá skjáhnitum
                var t = vec2(2*e.offsetX/canvas.width-1, 2*(canvas.height-e.offsetY)/canvas.height-1);
                
                var points = createTrianglesPoints(t);
                
                // Færa þessi hnit yfir á grafíkminni, á réttan stað
                // eyða hnitunum eða heinsa 
                gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(points));
              
                index=index+3;
    }
  }
});
    render();
}


// Create the points of the circle
function createTrianglesPoints(centerPoint){
    var points =[];
    for ( var i = 0; i < 3; ++i ) {
        var p = add( centerPoint, vertices[i]);
        points.push( p );
    }
    return points;
}

function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, index);

    window.requestAnimFrame(render);
}
