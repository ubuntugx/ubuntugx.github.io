/**
 * Created by ThinkPad on 2016/1/17.
 */
var $subMenuItem = $(".sub-menu").find(".menu-item");
console.log($subMenuItem);
$subMenuItem.hover(function(){
    var that = $(this);
    that.css("background","#000");
    //that.find("svg").child().css("fill","rgb(76, 175, 80)");
},function(){
    var that = $(this);
    that.css("background","#000");
});