```js
var arr = [];
for (var i = 0; i < 500; i++) {
    arr.push({
        x: Math.random() * 5000 + 1,
        y: Math.random() * 4000 + 1,
        type: parseInt(Math.random() * 4)
    });
}
var dituObj = new CustomMapJs({
    $box: document.getElementById("box"),
    markerArr: arr,

    clickImg: function(opt) {
        //点击图片后，返回点击相对于图片原图的位置
        this.opt.markerArr.push({ x: opt.x, y: opt.y, type: 1 });
        this.RenderMarker();
    },
    clickMarker: function(marker) {
        // 点击marker后返回marker
        console.log(marker);
    },
    createMarker: function(x, y, element) {
        // 自定义marker
        var newElement = document.createElement("div");
        if (element.type == 0) {
            newElement.className = "markerType1";
        } else if (element.type == 1) {
            newElement.className = "markerType2";
        } else if (element.type == 2) {
            newElement.className = "markerType3";
        } else if (element.type == 3) {
            newElement.className = "markerType4";
        }
        newElement.style.left = parseInt(x) + "px";
        newElement.style.top = parseInt(y) + "px";

        return newElement;
    }
});
```
