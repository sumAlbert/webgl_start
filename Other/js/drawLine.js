var VSHADER_SOURCE=
    'attribute vec4 a_Position;\n'+
    'void main(){\n'+
    'gl_Position=a_Position;\n'+
    'gl_PointSize=10.0;\n'+
    '}\n';

var FSHADER_SOURCE=
    'void main(){\n'+
    'gl_FragColor=vec4(1.0, 0.0, 0.0, 1.0);\n'+
    '}\n';

function main(){
    var canvas=document.getElementById("example");
    var gl=getWebGLContext(canvas);
    var points=[];
    if(!gl){
        console.log("Fail to get rendering context");
        return;
    }
    if(!initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE)){
        console.log("Fail to init shaders");
        return;
    }
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    canvas.onmousemove=function (ev) {
        var x=ev.clientX;
        var y=ev.clientY;
        var rect=canvas.getBoundingClientRect();
        x=((x-rect.left)-(canvas.width/2))/(canvas.width/2);
        y=((canvas.height/2)-(y-rect.top))/(canvas.height/2);
        points.push(x);
        points.push(y);
        var vertexes=new Float32Array(points);
        var vertexBuffer=gl.createBuffer();
        if(!vertexBuffer){
            console.log("Failed to create the buffer object");
            return -1;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertexes,gl.STATIC_DRAW);
        var a_Position=gl.getAttribLocation(gl.program,'a_Position');
        gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);
        gl.enableVertexAttribArray(a_Position);
        var len=points.length;
        canvas.lineWidth= 5;
        for(var i=0;i<len;i+=2){
            gl.drawArrays(gl.LINE_STRIP,0,len/2);
        }
    };


    //初始化vertexBuffer
    // function initVertexBuffers(gl){
    //     var points = [0.0, 0.5,-0.5,-0.5];
    //     var vertexes = new Float32Array(points);
    //     var n=2;
    //
    //     var vertexBuffer = gl.createBuffer();
    //     if(!vertexBuffer){
    //         console.log("Failed to create the buffer object");
    //         return -1;
    //     }
    //
    //     gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
    //     gl.bufferData(gl.ARRAY_BUFFER,vertexes,gl.STATIC_DRAW);
    //     var a_Position=gl.getAttribLocation(gl.program,'a_Position');
    //     gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);
    //     gl.enableVertexAttribArray(a_Position);
    //     return n;
    // }
}
