/**
 * Created by ThinkPad on 2016/1/22.
 */
document.addEventListener('touchmove', function (e) {
    e.preventDefault();   // 阻止即将发生的默认行为(禁止触摸移动)
});
var canvas = document.getElementsByTagName("canvas")[0];
var context = canvas.getContext("2d");
var devicePixelRatio = window.devicePixelRatio || 1;
var innerWidth = window.innerWidth;
var innerHeight = window.innerHeight;
var offset = 90;
var array;
var r = 0;

canvas.width=innerWidth*devicePixelRatio;
canvas.height=innerHeight*devicePixelRatio;
context.scale(devicePixelRatio,devicePixelRatio); // //缩放 Canvas pr = 1 = 100%
context.globalAlpha=0.6;  // 设置 canvas 透明度

function canvasClick(){
    context.clearRect(0,0,innerWidth,innerHeight);
    array=[{x:0,y:innerHeight*.7+offset},{x:0,y:innerHeight*.7-offset}];
    //循环，0 < 可视窗口宽度+90
    while (array[1].x < innerWidth+offset) {
        draw(array[0], array[1]);   //绘制函数传参
    }
}

function draw(i,j){
    context.beginPath();                   //开始路径
    context.moveTo(i.x, i.y);              //移动路径
    context.lineTo(j.x, j.y);              //创建线条
    var xEnd = j.x + (Math.random()*2-0.25)*offset,   //重新定义数组对象 q[1] 的变量对象，z() 随机数值
        yEnd = calEnd(j.y);                  //将 y() 传参函数赋值给 n
    context.lineTo(xEnd, yEnd);                  //创建线条
    context.closePath();                  //关闭路径
    r-=Math.PI*2/-50;
    //填充颜色，toString(16)转换为16进制颜色值
    //关于（<< 与 |）位运算操作参考：http://www.w3school.com.cn/js/pro_js_operators_bitwise.asp
    context.fillStyle = '#'+(Math.cos(r)*127+128<<16 | Math.cos(r+Math.PI*2/3)*127+128<<8 | Math.cos(r+Math.PI*2/3*2)*127+128).toString(16);
    context.fill();
    //重新定义数组对象，增加无限可变性
    array[0] = array[1];
    array[1] = {x:xEnd,y:yEnd}
}

//传参函数 return 返回数值
function calEnd(p){
    var t = p + (Math.random()*2-1.1)*offset;           //z() 随机数值
    return (t > innerHeight || t < 0) ? calEnd(p) : t;  //判断后返回不同数值后增加了更多的可变性
}

document.onclick = canvasClick;
document.ontouchstart = canvasClick;
canvasClick();
