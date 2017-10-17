var VSHADER_SOURCE=
    'attribute vec4 a_Position;\n'+
    'void main(){\n'+
    'gl_Position=a_Position;\n'+
    'gl_PointSize=10.0;\n'+
    '}\n';

var FSHADER_SOURCE=
    'void main(){\n'+
    'gl_FragColor=vec4(1.0, 1.0, 1.0, 1.0);\n'+
    '}\n';

function main(){
    var canvas=document.getElementById("example");
    var gl=getWebGLContext(canvas);

    if(!gl){
        console.log("Fail to get rendering context");
        return;
    }

    if(!initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE)){
        console.log("Fail to init shaders");
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);


    var n=initVertexBuffers(gl);
    gl.drawArrays(gl.POINTS,0,n);
}

function initVertexBuffers(gl){
    var vertexes = new Float32Array([
        0.0, 0.5,-0.5,-0.5,0.5,-0.5
    ]);
    var n=3;

    var vertexBuffer = gl.createBuffer();
    if(!vertexBuffer){
        console.log("Failed to create the buffer object");
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,vertexes,gl.STATIC_DRAW);
    var a_Position=gl.getAttribLocation(gl.program,'a_Position');
    gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(a_Position);
    return n;
}