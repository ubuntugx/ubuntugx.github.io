/**
 * Created by ThinkPad on 2016/1/17.
 */
;(function(window) {
    var $modalIndicator = $(".modal-indicator");
    var $subMenuItem = $(".sub-menu").find(".menu-item");
    var $fileInput = $("#fileInput");
    var imgObjArr = [];
    var startDraw = true;

    // canvas 部分
    var canvas = document.getElementById("canvas");
    var context = null;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var position = {x: window.innerWidth / 2, y: window.innerHeight / 2};
    var mouse = {x: 0, y: 0, down: false};
    document.body.classList.add('pointer');

    if (canvas.getContext) {
        context = canvas.getContext("2d");

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

        // 可能不需要 scroll 的偏移，元素的位置区别！！！
        var $colorItem = $(".modal-indicator.colors");
        var $chosenSvg = $(".sizes").find("svg").get(0);              // 选中的画笔
        var chosenWidth = 0;                                          // 选中的画笔大小
        var $offest = $(canvas).offset();                             // canvas 偏移值
        var docScrollLeft = document.documentElement.scrollLeft;
        var docScrollTop = document.documentElement.scrollTop;
        var moveLeft = docScrollLeft - $offest.left;                  // 最终偏移x
        var moveTop = docScrollTop - $offest.top;                     // 最终偏移y

        function draw() {
            if (mouse.down) {
                var d = distance(position, mouse);
                if (d >= 1) {
                    context.beginPath();
                    context.lineCap = "round";
                    context.strokeStyle = $colorItem.css("background-color");
                    //console.log(chosenSvg.getBoundingClientRect().width);
                    context.lineWidth = chosenWidth;
                    context.moveTo(position.x + moveLeft, position.y + moveTop);
                    context.lineTo(mouse.x + moveLeft, mouse.y + moveTop);
                    context.stroke();
                    context.closePath();
                    position.x = mouse.x;
                    position.y = mouse.y;
                    //draw();
                }
            }
        }

        function mousemove(event) {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
            draw();
        }

        function mousedown(event) {
            mouse.down = true;
            position.x = event.clientX;
            position.y = event.clientY;
            chosenWidth = $chosenSvg.getBoundingClientRect().width;
            context.beginPath();
            context.fillStyle = $colorItem.css("background-color"); // 合并！
            context.arc(position.x + moveLeft, position.y + moveTop, chosenWidth / 2, 0, 2 * Math.PI);
            context.fill();
            context.closePath();
        }

        function mouseup() {
            mouse.down = false;
        }
    }

    fileInput.addEventListener('change', onFileInputChange, false);

    $modalIndicator.fastClick(function () {
        var that = $(this);
        that.toggleClass("menu-open");
        that.siblings(".menu-open").removeClass("menu-open");
    });

    function getImage(file, callback) {
        if (!window.FileReader) {
            alert('当前浏览器不支持 FileReader 对象，请升级到最新浏览器。');
            return;
        }

        var reader = new FileReader();

        reader.onload = function (ev) {
            var img = new Image();

            img.onload = function () {
                if (typeof callback === 'function') callback.call(this, img);
            };

            img.src = ev.target.result;
        };

        reader.readAsDataURL(file);
    }

    function createImgObj(file) {
        var obj = {};
        obj.image = null;
        obj.left = obj.top = obj.width = obj.height = 0;
        obj.data = null;
        obj.zIndex = 0;

        obj.drawFromFile = function (mouseX, mouseY, callback) {
            getImage(file, function (img) {
                var _left = mouseX - img.width / 2;
                var _top = mouseY - img.height / 2;

                obj.image = img;
                obj.left = _left;
                obj.top = _top;
                obj.width = img.width;
                obj.height = img.height;

                obj.updateData(_left, top);
                context.drawImage(img, _left, _top, obj.width, obj.height);
                obj.zIndex = imgObjArr.length;

                if (typeof callback === 'function')callback.call(obj, obj);
                // checkUndoable();
            });
        };

        obj.updateData = function () {
            this.data = context.getImageData(this.left, this.top, this.width + 2, this.height + 2);
        };

        obj.drawFromData = function (left, top) {
            if (!this.image) return;

            this.left = left || this.left;
            this.top = top || this.top;

            this.updateData();
            context.drawImage(this.image, this.left, this.top, this.width, this.height);

        };

        obj.move = function (left, top) {
            this.drawFromData(left, top);
            this.focus(false);
        };

        obj.focused = false;

        obj.focus = function (changeState) {
            var oL = this.left, oT = this.top, oR = this.left + this.width, oB = this.top + this.height;

            if (this.focused) return;

            if (changeState) this.focused = true;

            this.updateLineDatas();

            context.save();
            context.strokeStyle = 'rgb(0, 255, 0)';
            context.beginPath();
            context.moveTo(oL, 0);
            context.lineTo(oL, boardHeight);
            context.moveTo(oR, 0);
            context.lineTo(oR, boardHeight);
            context.moveTo(0, oT);
            context.lineTo(boardWidth, oT);
            context.moveTo(0, oB);
            context.lineTo(boardWidth, oB);
            context.stroke();
            context.restore();

        };

        obj.blur = function () {
            if (!this.focused || this.linesData === undefined) return;

            this.focused = false;

            var data = this.linesData;
            context.putImageData(data.oL.data, data.oL.left, data.oL.top);
            context.putImageData(data.oT.data, data.oT.left, data.oT.top);
            context.putImageData(data.oR.data, data.oR.left, data.oR.top);
            context.putImageData(data.oB.data, data.oB.left, data.oB.top);

            delete this.linesData;
        };

        obj.updateLineDatas = function () {
            var oL = this.left, oT = this.top, oR = this.left + this.width, oB = this.top + this.height;

            this.linesData = {
                oL: {
                    left: oL - 1,
                    top: 0,
                    data: context.getImageData(oL - 1, 0, 2, boardHeight)
                },
                oT: {
                    left: 0,
                    top: oT - 1,
                    data: context.getImageData(0, oT - 1, boardWidth, 2)
                },
                oR: {
                    left: oR - 1,
                    top: 0,
                    data: context.getImageData(oR - 1, 0, 2, boardHeight)
                },
                oB: {
                    left: 0,
                    top: oB - 1,
                    data: context.getImageData(0, oB - 1, boardWidth, 2)
                }
            };
        };

        obj.remove = function (isRemoveData) {
            context.putImageData(this.data, this.left, this.top);
            if (isRemoveData) {
                console.log(imgObjArr.indexOf(this));
                imgObjArr.splice(imgObjArr.indexOf(this), 1);
            }
        };

        return obj;
    }

    function fileUpload(files) {
        console.log(files);
        var fileList = files;
        if (fileList.length === 0) return false;

        if(startDraw){
            startDraw = false;
            document.body.classList.remove('pointer');
            canvas.removeEventListener("mousedown", mousedown, false);
            canvas.removeEventListener("mousemove", mousemove, false);
            canvas.removeEventListener("mouseup", mouseup, false);
        }

        var left = position.x;
        var top = position.y;
        var exitLastObj = imgObjArr[imgObjArr.length - 1];

        Array.prototype.slice.call(fileList).forEach(function (file, i) {
            console.log(file.type.match(/^image/));
            if (file.type.search(/^image/) === -1) {
                alert("您上传的不是图片文件。");
                return false;
            }

            var obj = createImgObj(file);

            if (exitLastObj) exitLastObj.blur();

            obj.drawFromFile(left + i * 20, top + i * 20, function (imgObj) {
                imgObjArr.push(imgObj);
                //if (i === fileList.length - 1) drawAllPoints();
            });
        });


    }

    function onFileInputChange() {
        console.log("enter");
        console.log($fileInput.files);
        fileUpload($fileInput.get(0).files)
    }

    $subMenuItem.fastClick(function () {
        var that = $(this);   // 当前子菜单项
        var $MenuItem = that.parents(".modal-indicator");  // 当前父菜单项
        if ($MenuItem.hasClass("colors")) {
            // 更改颜色为子菜单选中颜色
            $MenuItem.css("background-color", that.children().css("background-color"));
            // size 部分也可以只改变类名，不复制全部的 html
        } else if ($MenuItem.hasClass("sizes")) {
            $MenuItem.children("div:first-child")
                .attr("class", "")
                .addClass(that.find("div:first-child").attr("class"))
        }
        else {
            console.log("第几个元素：" + that.index());
            var toolsIndex = that.index();
            if (toolsIndex < 4) {
                $MenuItem.children("div:first-child").html(that.html());
            }
            switch (toolsIndex) {
                case 0:
                    // 笔
                    document.body.classList.add('pointer');
                    canvas.addEventListener("mousedown", mousedown, false);
                    canvas.addEventListener("mousemove", mousemove, false);
                    canvas.addEventListener("mouseup", mouseup, false);
                    startDraw = true;
                    break;
                case 1:
                    // 橡皮
                    break;
                case 2:
                    // 文字
                    break;
                case 3:
                    // 图片
                    console.log("click");
                    $fileInput.click();
                    break;
                case 4:
                    // 撤销
                    break;
                case 5:
                    // 删除
                    break;
                default :
                    break;
            }

        }
        $MenuItem.removeClass("menu-open")
    });
})(window);




