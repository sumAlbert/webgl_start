//全局的颜色变量
var RED=0.0;
var GREEN=0.0;
var BLUE=0.0;
var ALPHA=1.0;
//全局的尺寸大小：
var SIZE=1.0;
//绘制一个点用到的着色器
var canvas=document.getElementById("example");
var gl=getWebGLContext(canvas);

$(document).ready(function () {
   initMenuControl();
    $("#initCanvas").click(function () {
       GLclear(1.0,1.0,1.0,1.0);
       canvas.onmousedown=null;
    });
   // 画直线
    $("#drawLine").click(function () {
        if(SIZE>1.0)
            drawWidthLine(RED,GREEN,BLUE,ALPHA,SIZE);
        else
            drawThinLine(RED,GREEN,BLUE,SIZE);
    });
    //铅笔画
    $("#drawPen").click(function () {
        if(SIZE>1.0)
            drawContinueWidthLine(RED,GREEN,BLUE,ALPHA,SIZE);
        else
            drawContinueLine(RED,GREEN,BLUE,SIZE);

    });
    //画圆
    $("#drawCircle").click(function () {
        drawCircle(RED,GREEN,BLUE,ALPHA);
    });

    
});

//设置尺寸
function setSizes() {
    var val=document.getElementById("input-size").value;
    SIZE=val+0.0;
    GLclear(1.0, 1.0, 1.0, 1.0);
    canvas.onmousedown=null;
}

//设置颜色
function setColor() {
    var rgba_str=document.getElementById("input-color").value;
    var red=rgba_str.substring(1,3);
    var green=rgba_str.substring(3,5);
    var blue=rgba_str.substring(5,7);
    RED=get16To10(red)/255.0;
    GREEN=get16To10(green)/255.0;
    BLUE=get16To10(blue)/255.0;
    GLclear(1.0, 1.0, 1.0, 1.0);
    canvas.onmousedown=null;
}

//菜单尺寸控制器
function initMenuControl(){
    var menu_control=document.getElementsByClassName("menu-control")[0];
    var content=document.getElementsByClassName("content")[0];
    menu_control.onmousedown=function (ev) {
        content.onmousemove=function (ev) {
            var x=ev.clientX;
            var menu=document.getElementsByClassName("menu")[0];
            menu.style.width=x+'px';
            content.onmouseup=function (ev) {
                content.onmousemove=null;
            };
        };
    };
}
/*webgl部分*/
//初始化WebGL的着色器
function GLinit(vshader_source,fshader_source){
    if(!gl){
        console.log("Fail to get rendering context");
        return;
    }
    if(!initShaders(gl,vshader_source,fshader_source)){
        console.log("Fail to init shaders");
    }
    GLclear(1.0 ,1.0, 1.0, 1.0);
}

function GLinitNoClear(vshader_source,fshader_source){
    if(!gl){
        console.log("Fail to get rendering context");
        return;
    }
    if(!initShaders(gl,vshader_source,fshader_source)){
        console.log("Fail to init shaders");
    }
}

//清空画布
function GLclear(r,g,b,a){
    gl.clearColor(r,g,b,a);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

//获得WebGl里的横坐标
function getWebGLX(ev){
    var x=ev.clientX;
    var rect=ev.target.getBoundingClientRect();
    x=((x-rect.left)-(canvas.width/2))/(canvas.width/2);
    return x;
}

//获得WebGl里的纵坐标
function getWebGLY(ev){
    var y=ev.clientY;
    var rect=ev.target.getBoundingClientRect();
    y=((canvas.height/2)-(y-rect.top))/(canvas.height/2);
    return y;
}

//逆时针旋转90°,x方向的偏移量
function getOfferSetX(startX,startY,stopX,stopY,width) {
    console.log(width);
    var x=(startY-stopY)/Math.sqrt((stopY-startY)*(stopY-startY)+(stopX-startX)*(stopX-startX));
    x=x*((width/2)/(canvas.width/2));
    return x;
}

//逆时针旋转90°,y方向的偏移量
function getOfferSetY(startX,startY,stopX,stopY,width) {
    var y=(stopX-startX)/Math.sqrt((stopY-startY)*(stopY-startY)+(stopX-startX)*(stopX-startX));
    y=(y*(width/2)/(canvas.height/2));
    return y;
}

//16进制转10进制
function get16To10(num16){
   var num10=parseInt(num16,16);
   return num10;
}

/**
 * 绘制一个点
 * @param webGLX WebGL里面的横坐标
 * @param webGLY WebGL里面的纵坐标
 * @param webGLZ WebGL里面的z轴坐标
 * @param pointSize 点的大小
 * @param red rgba中的red
 * @param green rgba中的green
 * @param blue rgba中的blue
 * @param alpha rgba中的alpha
 */
function drawGLPoint(webGLX,webGLY,webGLZ,pointSize,red,green,blue,alpha){
    GLinit(VSHADER_SOURCE_POINT,FSHADER_SOURCE_POINT);
    var a_Position=gl.getAttribLocation(gl.program,"a_Position");
    var a_PointSize=gl.getAttribLocation(gl.program,"a_PointSize");
    var u_FragColor=gl.getUniformLocation(gl.program,"u_FragColor");
    gl.vertexAttrib3f(a_Position,webGLX,webGLY,webGLZ);
    gl.vertexAttrib1f(a_PointSize, pointSize);
    gl.uniform4f(u_FragColor,red, green, blue, alpha);
    gl.drawArrays(gl.POINTS,0,1);
}
//绘制一个点用到的着色器
var VSHADER_SOURCE_POINT=
    'attribute vec4 a_Position;\n'+
    'attribute vec4 a_PointSize;\n'+
    'void main(){\n'+
    'gl_Position=a_Position;\n'+
    'gl_PointSize=a_PointSize.x;\n'+
    '}\n';
var FSHADER_SOURCE_POINT=
    'precision mediump float;\n'+
    'uniform vec4 u_FragColor;\n'+
    'void main(){\n'+
    'gl_FragColor=u_FragColor;\n'+
    '}\n';

/**
 * 绘制一条粗线
 * @param red rgba中的red
 * @param green rgba中的green
 * @param blue rgba中的blue
 * @param alpha rgba中的alpha
 * @param width 线条的宽度
 */
function drawWidthLine(red,green,blue,alpha,width){
    var rectPoints=[];
    var centerPoints=[];
    var length=0;
    canvas.onmousedown=function (ev) {
        var webglStartX=getWebGLX(ev);
        var webglStartY=getWebGLY(ev);
        centerPoints.push(webglStartX);
        centerPoints.push(webglStartY);
        centerPoints.push(webglStartX);
        centerPoints.push(webglStartY);
        for(var j=0;j<12;j++){
            rectPoints.push(0.0);
        }
        canvas.onmousemove=function (ev) {
            var webglStopX=getWebGLX(ev);
            var webglStopY=getWebGLY(ev);
            centerPoints.pop();
            centerPoints.pop();
            centerPoints.push(webglStopX);
            centerPoints.push(webglStopY);
            length=centerPoints.length;
            var offsetX=getOfferSetX(centerPoints[length-4],centerPoints[length-3],centerPoints[length-2],centerPoints[length-1],width);
            var offsetY=getOfferSetY(centerPoints[length-4],centerPoints[length-3],centerPoints[length-2],centerPoints[length-1],width);
            for(var j=0;j<12;j++){
                rectPoints.pop();
            }
            rectPoints.push(centerPoints[length-4]+offsetX);
            rectPoints.push(centerPoints[length-3]+offsetY);
            rectPoints.push(centerPoints[length-4]-offsetX);
            rectPoints.push(centerPoints[length-3]-offsetY);
            rectPoints.push(centerPoints[length-2]+offsetX);
            rectPoints.push(centerPoints[length-1]+offsetY);
            rectPoints.push(centerPoints[length-2]+offsetX);
            rectPoints.push(centerPoints[length-1]+offsetY);
            rectPoints.push(centerPoints[length-4]-offsetX);
            rectPoints.push(centerPoints[length-3]-offsetY);
            rectPoints.push(centerPoints[length-2]-offsetX);
            rectPoints.push(centerPoints[length-1]-offsetY);
            GLinit(VSHADER_SOURCE_WIDTH_LINE,FSHADER_SOURCE_WIDTH_LINE);
            var vertexes=new Float32Array(rectPoints);
            var vertexBuffer=gl.createBuffer();
            if(!vertexBuffer){
                console.log("Failed to create the buffer object");
                return -1;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER,vertexes,gl.STATIC_DRAW);
            var a_Position=gl.getAttribLocation(gl.program,"a_Position");
            var u_FragColor=gl.getUniformLocation(gl.program,"u_FragColor");
            gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);
            gl.enableVertexAttribArray(a_Position);
            gl.uniform4f(u_FragColor,red, green, blue, alpha);
            gl.drawArrays(gl.TRIANGLES,0,rectPoints.length/2);
            canvas.onmouseup=function(ev){
                canvas.onmousemove=null;
                canvas.onmouseup=null;
            }
        }
    }
}
//绘制一条细线用到的着色器
var VSHADER_SOURCE_WIDTH_LINE=
    'attribute vec4 a_Position;\n'+
    'void main(){\n'+
    'gl_Position=a_Position;\n'+
    '}\n';
var FSHADER_SOURCE_WIDTH_LINE=
    'precision mediump float;\n'+
    'uniform vec4 u_FragColor;\n'+
    'void main(){\n'+
    'gl_FragColor=u_FragColor;\n'+
    '}\n';


/**
 * 绘制一条细线
 * @param red rgba中的red
 * @param green rgba中的green
 * @param blue rgba中的blue
 * @param alpha rgba中的alpha
 */
function drawThinLine(red,green,blue,alpha){
    var points=[];
    canvas.onmousedown=function (ev) {
        var webglStartX=getWebGLX(ev);
        var webglStartY=getWebGLY(ev);
        points.push(webglStartX);
        points.push(webglStartY);
        points.push(webglStartX);
        points.push(webglStartY);
        canvas.onmousemove=function (ev) {
            var webglStopX=getWebGLX(ev);
            var webglStopY=getWebGLY(ev);
            points.pop();
            points.pop();
            points.push(webglStopX);
            points.push(webglStopY);
            GLinit(VSHADER_SOURCE_THIN_LINE,FSHADER_SOURCE_THIN_LINE);
            var vertexes=new Float32Array(points);
            var vertexBuffer=gl.createBuffer();
            if(!vertexBuffer){
                console.log("Failed to create the buffer object");
                return -1;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER,vertexes,gl.STATIC_DRAW);
            var a_Position=gl.getAttribLocation(gl.program,"a_Position");
            var u_FragColor=gl.getUniformLocation(gl.program,"u_FragColor");
            gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);
            gl.enableVertexAttribArray(a_Position);
            gl.uniform4f(u_FragColor,red, green, blue, alpha);
            gl.drawArrays(gl.LINES,0,points.length/2);
            canvas.onmouseup=function(ev){
                canvas.onmousemove=null;
                canvas.onmouseup=null;
            }
        }
    }
}
//绘制一条细线用到的着色器
var VSHADER_SOURCE_THIN_LINE=
    'attribute vec4 a_Position;\n'+
    'void main(){\n'+
    'gl_Position=a_Position;\n'+
    '}\n';
var FSHADER_SOURCE_THIN_LINE=
    'precision mediump float;\n'+
    'uniform vec4 u_FragColor;\n'+
    'void main(){\n'+
    'gl_FragColor=u_FragColor;\n'+
    '}\n';


/**
 * 绘制一个圆
 * @param red rgba中的red
 * @param green rgba中的green
 * @param blue rgba中的blue
 * @param alpha rgba中的alpha
 */
function drawCircle(red,green,blue,alpha){
    var points=[];
    canvas.onmousedown=function (ev) {
        var startX=getWebGLX(ev);
        var startY=getWebGLY(ev);
        var unitRadius=5.0;
        var time=360.0/unitRadius;
        unitRadius=Math.PI*unitRadius/180;
        for(var j=0;j<time*6;j++) {
            points.push(0.0);
        }
        console.log(points);
        canvas.onmousemove=function (ev) {
            for(j=0;j<time*6;j++) {
                points.pop();
            }
            var stopX=getWebGLX(ev);
            var stopY=getWebGLY(ev);
            var a=Math.abs(stopX-startX)/2.0;
            var b=Math.abs(stopY-startY)/2.0;
            var centerX=(startX+stopX)/2.0;
            var centerY=(startY+stopY)/2.0;
            for(j=0;j<time;j++){
                if(j==0){
                    points.push(centerX);
                    points.push(centerY);
                    points.push(a+centerX);
                    points.push(centerY);
                    points.push(a*Math.cos(unitRadius*(j+1))+centerX);
                    points.push(b*Math.sin(unitRadius*(j+1))+centerY);
                }
                else{
                    points.push(centerX);
                    points.push(centerY);
                    points.push(points[points.length-4]);
                    points.push(points[points.length-4]);
                    points.push(a*Math.cos(unitRadius*(j+1))+centerX);
                    points.push(b*Math.sin(unitRadius*(j+1))+centerY);
                }
            }
            console.log(points);
            GLinit(VSHADER_SOURCE_CIRCLE,FSHADER_SOURCE_CIRCLE);
            var vertexes=new Float32Array(points);
            var vertexBuffer=gl.createBuffer();
            if(!vertexBuffer){
                console.log("Failed to create the buffer object");
                return -1;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER,vertexes,gl.STATIC_DRAW);
            var a_Position=gl.getAttribLocation(gl.program,"a_Position");
            var u_FragColor=gl.getUniformLocation(gl.program,"u_FragColor");
            gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);
            gl.enableVertexAttribArray(a_Position);
            gl.uniform4f(u_FragColor,red, green, blue, alpha);
            gl.drawArrays(gl.TRIANGLES,0,points.length/2);
            canvas.onmouseup=function(ev){
                canvas.onmousemove=null;
                canvas.onmouseup=null;
            }
        }
    };
}
var VSHADER_SOURCE_CIRCLE=
    'attribute vec4 a_Position;\n'+
    'void main(){\n'+
    'gl_Position=a_Position;\n'+
    '}\n';
var FSHADER_SOURCE_CIRCLE=
    'precision mediump float;\n'+
    'uniform vec4 u_FragColor;\n'+
    'void main(){\n'+
    'gl_FragColor=u_FragColor;\n'+
    '}\n';

/**
 * 绘制一个连续的细线
 * @param red rgba中的red
 * @param green rgba中的green
 * @param blue rgba中的blue
 * @param alpha rgba中的alpha
 */
function drawContinueLine(red,green,blue,alpha){
    var points=[];
    canvas.onmousedown=function (ev) {
        var startX=getWebGLX(ev);
        var startY=getWebGLY(ev);
        points.push(startX);
        points.push(startY);
        canvas.onmousemove=function (ev) {
            var stopX=getWebGLX(ev);
            var stopY=getWebGLY(ev);
            points.push(stopX);
            points.push(stopY);
            GLinit(VSHADER_SOURCE_CONTINUE_CIRCLE,FSHADER_SOURCE_CONTINUE_CIRCLE);
            var vertexes=new Float32Array(points);
            var vertexBuffer=gl.createBuffer();
            if(!vertexBuffer){
                console.log("Failed to create the buffer object");
                return -1;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER,vertexes,gl.STATIC_DRAW);
            var a_Position=gl.getAttribLocation(gl.program,"a_Position");
            var u_FragColor=gl.getUniformLocation(gl.program,"u_FragColor");
            gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);
            gl.enableVertexAttribArray(a_Position);
            gl.uniform4f(u_FragColor,red, green, blue, alpha);
            gl.drawArrays(gl.LINE_STRIP,0,points.length/2);
            canvas.onmouseup=function(ev){
                canvas.onmousemove=null;
                canvas.onmouseup=null;
            }
        }
    };
}
var VSHADER_SOURCE_CONTINUE_CIRCLE=
    'attribute vec4 a_Position;\n'+
    'void main(){\n'+
    'gl_Position=a_Position;\n'+
    '}\n';
var FSHADER_SOURCE_CONTINUE_CIRCLE=
    'precision mediump float;\n'+
    'uniform vec4 u_FragColor;\n'+
    'void main(){\n'+
    'gl_FragColor=u_FragColor;\n'+
    '}\n';

/**
 * 绘制一条连续的粗线
 * @param red rgba中的red
 * @param green rgba中的green
 * @param blue rgba中的blue
 * @param alpha rgba中的alpha
 * @param width 线条的宽度
 */
function drawContinueWidthLine(red,green,blue,alpha,width){
    var rectPoints=[];
    var centerPoints=[];
    var length=0;
    canvas.onmousedown=function (ev) {
        var flag=false;
        var webglStartX=getWebGLX(ev);
        var webglStartY=getWebGLY(ev);
        centerPoints.push(webglStartX);
        centerPoints.push(webglStartY);
        canvas.onmousemove=function (ev) {
            var webglStopX=getWebGLX(ev);
            var webglStopY=getWebGLY(ev);
            centerPoints.push(webglStopX);
            centerPoints.push(webglStopY);
            length=centerPoints.length;
            var offsetX=getOfferSetX(centerPoints[length-4],centerPoints[length-3],centerPoints[length-2],centerPoints[length-1],width);
            var offsetY=getOfferSetY(centerPoints[length-4],centerPoints[length-3],centerPoints[length-2],centerPoints[length-1],width);
            rectPoints.push(centerPoints[length - 4] + offsetX);
            rectPoints.push(centerPoints[length - 3] + offsetY);
            rectPoints.push(centerPoints[length - 4] - offsetX);
            rectPoints.push(centerPoints[length - 3] - offsetY);
            rectPoints.push(centerPoints[length - 2] + offsetX);
            rectPoints.push(centerPoints[length - 1] + offsetY);
            rectPoints.push(centerPoints[length - 2] + offsetX);
            rectPoints.push(centerPoints[length - 1] + offsetY);
            rectPoints.push(centerPoints[length - 4] - offsetX);
            rectPoints.push(centerPoints[length - 3] - offsetY);
            rectPoints.push(centerPoints[length - 2] - offsetX);
            rectPoints.push(centerPoints[length - 1] - offsetY);
            if(flag) {
                rectPoints.push(centerPoints[length - 4] + offsetX);
                rectPoints.push(centerPoints[length - 3] + offsetY);
                rectPoints.push(centerPoints[length - 4] - offsetX);
                rectPoints.push(centerPoints[length - 3] - offsetY);
                rectPoints.push(rectPoints[rectPoints.length-22]);
                rectPoints.push(rectPoints[rectPoints.length-22]);
                // rectPoints.push(rectPoints[rectPoints.length-20]);
                // rectPoints.push(rectPoints[rectPoints.length-20]);
                // rectPoints.push(centerPoints[length - 4] + offsetX);
                // rectPoints.push(centerPoints[length - 3] + offsetY);
                // rectPoints.push(centerPoints[length - 4] - offsetX);
                // rectPoints.push(centerPoints[length - 3] - offsetY);
            }
            flag=true;
            GLinitNoClear(VSHADER_SOURCE_CONTINUE_WIDTH_CIRCLE,FSHADER_SOURCE_CONTINUE_WIDTH_CIRCLE);
            var vertexes=new Float32Array(rectPoints);
            var vertexBuffer=gl.createBuffer();
            if(!vertexBuffer){
                console.log("Failed to create the buffer object");
                return -1;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER,vertexes,gl.STATIC_DRAW);
            var a_Position=gl.getAttribLocation(gl.program,"a_Position");
            var u_FragColor=gl.getUniformLocation(gl.program,"u_FragColor");
            gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);
            gl.enableVertexAttribArray(a_Position);
            gl.uniform4f(u_FragColor,red, green, blue, alpha);
            gl.drawArrays(gl.TRIANGLES,0,rectPoints.length/2);
            canvas.onmouseup=function(ev){
                flag=false;
                canvas.onmousemove=null;
                canvas.onmouseup=null;
            };
            canvas.onmouseout=function(ev){
                flag=false;
                canvas.onmousemove=null;
                canvas.onmouseup=null;
            }
        }
    }
}
//绘制一条细线用到的着色器
var VSHADER_SOURCE_CONTINUE_WIDTH_CIRCLE=
    'attribute vec4 a_Position;\n'+
    'void main(){\n'+
    'gl_Position=a_Position;\n'+
    '}\n';
var FSHADER_SOURCE_CONTINUE_WIDTH_CIRCLE=
    'precision mediump float;\n'+
    'uniform vec4 u_FragColor;\n'+
    'void main(){\n'+
    'gl_FragColor=u_FragColor;\n'+
    '}\n';