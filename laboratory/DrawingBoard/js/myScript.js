/**
 * Created by ThinkPad on 2016/1/17.
 */
var $modalIndicator = $(".modal-indicator");
var $subMenuItem = $(".sub-menu").find(".menu-item");

$modalIndicator.fastClick(function(){
    var that = $(this);
    that.toggleClass("menu-open");
    that.siblings(".menu-open").removeClass("menu-open");
});

$subMenuItem.fastClick(function(){
    var that = $(this);   // 当前子菜单项
    var $MenuItem = that.parents(".modal-indicator");  // 当前父菜单项
    if($MenuItem.hasClass("colors")) {
        // 更改颜色为子菜单选中颜色
        $MenuItem.css("background-color", that.children().css("background-color"));
    // size 部分也可以只改变类名，不复制全部的 html
    }else if($MenuItem.hasClass("sizes")){
        $MenuItem.children("div:first-child")
            .attr("class","")
            .addClass(that.find("div:first-child").attr("class"))
    }
    else{
        $MenuItem.children("div:first-child").html(that.html());
    }
    $MenuItem.removeClass("menu-open")
});

// canvas 部分
var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var position = {x: 0, y: window.innerHeight/2};
var mouse = {x: 0, y: 0, down: false};


if(canvas.getContext) {
    var context = canvas.getContext("2d");

    canvas.addEventListener("mousedown", mousedown, false);
    canvas.addEventListener("mousemove", mousemove, false);
    canvas.addEventListener("mouseup", mouseup, false);

//监听可视窗口尺寸
//    window.onresize = function (event) {
//        console.log(window.innerWidth+" "+window.innerHeight)
//        canvas.width = window.innerWidth;
//        canvas.height = window.innerHeight;
//    };

    function distance(pt, pt2) {
        var xs = 0;
        var ys = 0;
        xs = pt2.x - pt.x;
        ys = pt2.y - pt.y;
        xs = xs * xs;
        ys = ys * ys;
        return Math.sqrt(xs + ys);
    }

    function draw() {
        if (mouse.down) {
            var d = distance(position, mouse);
            if (d >= 1) {
                var $canvas = $(canvas);
                context.beginPath();
                context.lineCap = "round";
                context.strokeStyle = $(".colors").css("background-color");
                var chosenSvg = $(".sizes").find("svg").get(0);
                console.log(chosenSvg.getBoundingClientRect().width);
                context.lineWidth = chosenSvg.getBoundingClientRect().width;
                var $offest = $(canvas).offset(); // 并不是很有用
                var docScrollLeft = document.documentElement.scrollLeft;
                var docScrollTop = document.documentElement.scrollTop;
                context.moveTo(position.x - $offest.left + docScrollLeft, position.y - $offest.top + docScrollTop);
                context.lineTo(mouse.x - $offest.left + docScrollLeft, mouse.y - $offest.top + docScrollTop);

                context.stroke();
                //context.fill();
                context.closePath();
                position.x = mouse.x;
                position.y = mouse.y;
                //draw();
            }
        }
    }

    function mousemove(event) {
        //console.log(canvas.offsetLeft);
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        draw();
    }

    function mousedown(event) {
        mouse.down = true;
        position.x = event.clientX;
        position.y = event.clientY;
    }

    function mouseup() {
        mouse.down = false;
    }
}




