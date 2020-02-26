function CustomMapJs(customOptions) {
    if (!window.Hammer) {
        console.log("need import Hammer.js");
        return;
    }
    var _this = this;
    var options = {
        isRun: false, //是否拖动（按下鼠标）

        rX: 0, //图片距离容器的距离
        rY: 0,
        bgX: 0, //图片距离容器的距离 = rX
        bgY: 0,

        $box: null, //容器
        boxWidth: 0, //容器宽度
        boxHeight: 0, //容器高度

        img: null, //图片
        imgw: 0, //图片本身宽度
        imgh: 0,
        scaleSize: 1, //遗留，考虑最小缩放，最大缩放
        minSscaleSize: 0.001, //最小缩放比例为初始的0.6；最大为1，图原始尺寸

        clickTime: 0,
        markerArr: [{ x: 0, y: 0 }],
        createMarker: function(x, y, element) {
            // var div = document.createElement('div');
            // div.className = 'marker';
            // return div
        },

        clickImg: function() {},
        clickMarker: function() {},
        move: function() {}
    };
    this.opt = options;
    for (var key in customOptions) {
        if (customOptions.hasOwnProperty(key)) {
            options[key] = customOptions[key];
        }
    }

    // Object.assign(options, customOptions); //合并选项

    this.getOffset = function(o) {
        var left = 0,
            top = 0;
        while (o != null && o != document.body) {
            top += o.offsetTop;
            left += o.offsetLeft;
            o = o.offsetParent;
        }
        return {
            left: left,
            top: top
        };
    };

    var throttle = function(func, delay) {
        var prev = Date.now();
        var timeout = null;
        return function() {
            var context = this;
            var args = arguments;
            var now = Date.now();
            clearTimeout(timeout);
            if (now - prev >= delay) {
                func.apply(context, args);
                prev = Date.now();
            } else {
                timeout = setTimeout(function() {
                    func.apply(context, args);
                }, delay);
            }
        };
    };
    var markerContainer = options.$box.getElementsByClassName(
        "markerContainer"
    )[0];
    if (!markerContainer) {
        return log.error("not found div.markerContainer");
    }
    this.moveMarker = function() {
        markerContainer.style.transform =
            "translate(" + options.rX + "px," + options.rY + "px)";
        markerContainer.style.msTransform =
            "translate(" + options.rX + "px," + options.rY + "px)";
        markerContainer.style.webkitTransform =
            "translate(" + options.rX + "px," + options.rY + "px)";
        markerContainer.style.oTransform =
            "translate(" + options.rX + "px," + options.rY + "px)";
        markerContainer.style.mozTransform =
            "translate(" + options.rX + "px," + options.rY + "px)";
    };
    this.RenderMarker = throttle(function() {
        markerContainer.innerHTML = "";
        var fragment = document.createDocumentFragment();
        for (var i = 0; i < options.markerArr.length; i++) {
            var element = options.markerArr[i];
            var x = element.x * options.scaleSize;
            var y = element.y * options.scaleSize;

            var ele = options.createMarker(x, y, element);
            if (ele) {
                ele.setAttribute("data-marker-index", i);
                fragment.appendChild(ele);
            }
        }
        markerContainer.appendChild(fragment);
        _this.moveMarker();
    }, 50);

    this.InitImgSize = function() {
        //设置初始位置，大小
        var w, h;
        var boxWidth = parseInt(options.$box.offsetWidth); //容器宽度
        var boxHeight = parseInt(options.$box.offsetHeight); //容器高度

        //以完全显示图片为基准,如果改为>，则为以铺满屏幕为基准
        if (boxWidth / boxHeight < options.imgw / options.imgh) {
            //容器的比例大于图片比例
            options.minScaleSize = options.scaleSize = boxWidth / options.imgw; //初始比率
            w = boxWidth;
            h = options.imgh * options.scaleSize;
            options.bgX = options.rX = 0;
            options.bgY = options.rY = -(h - boxHeight) / 2;
        } else {
            options.scaleSize = boxHeight / options.imgh; //初始比率
            w = options.imgw * options.scaleSize;
            h = boxHeight;
            options.bgX = options.rX = -(w - boxWidth) / 2;
            options.bgY = options.rY = 0;
        }
        options.minScaleSize = options.scaleSize * 1; //最小缩放比例为初始的0.6

        options.img.style.width = w + "px";
        options.img.style.height = h + "px";
        options.img.style.left = options.bgX + "px";
        options.img.style.top = options.bgY + "px";
        console.log("init");

        _this.RenderMarker();
    };

    this.init = function() {
        options.img = options.$box.getElementsByTagName("img")[0]; //图片

        options.img.onload = function() {
            options.imgw = parseInt(options.img.naturalWidth); //图片宽度
            options.imgh = parseInt(options.img.naturalHeight); //图片高度
            _this.InitImgSize();
        };
        var imgUrl = options.img.getAttribute("url");
        if (imgUrl) {
            options.img.src = imgUrl;
        } else {
            console.log("没有填写图片地址");
        }
    };
    this.init();

    this.evnt = function(event) {
        var evn = event,
            eventDoc, //当前节点的顶层的 document 对象
            doc; //document.documentElement
        evn.target = evn.target || evn.srcElement;
        if (evn.pageX == null && evn.clientX != null) {
            eventDoc = evn.target.ownerDocument || document; //返回当前节点的顶层的 document 对象
            doc = eventDoc.documentElement || eventDoc.body;
            evn.pageX = evn.clientX + doc.scrollLeft - doc.clientLeft;
            evn.pageY = evn.clientY + doc.scrollTop - doc.clientTop;
        }
        if (!evn.preventDefault) {
            evn.preventDefault = function() {
                this.returnValue = false; //取消发生事件源元素的默认动作
            };
        }
        if (!evn.stopPropagation) {
            evn.stopPropagation = function() {
                this.cancelBubble = true; //ie冒泡行为
            };
        }
        return evn;
    };

    var eventObj = {
        move: function(e) {
            options.$box.style.cursor = "move";
            options.rX = options.bgX + e.deltaX; //移动时图片距离容器的距离
            options.rY = options.bgY + e.deltaY;
            options.img.style.left = options.rX + "px";
            options.img.style.top = options.rY + "px";
            _this.moveMarker();
        },
        moveEnd: function(e) {
            options.$box.style.cursor = "default";
            options.bgX = options.rX; //移动时图片距离容器的距离
            options.bgY = options.rY;
        },
        tap: function(e) {
            console.log(e);
            if (e.target == options.img) {
                console.log("img");
                var rect = options.img.getBoundingClientRect(); //获取元素距离视口距离

                options.clickImg.call(_this, {
                    x:
                        (options.imgw / options.img.offsetWidth) *
                        (e.center.x - rect.left),
                    y:
                        (options.imgh / options.img.offsetHeight) *
                        (e.center.y - rect.top)
                });
            } else if (e.target == options.$box) {
                console.log("box");
            } else {
                console.log("marker");
                var markerIndex = e.target.getAttribute("data-marker-index");
                if (markerIndex && options.markerArr[markerIndex]) {
                    options.clickMarker.call(
                        _this,
                        options.markerArr[markerIndex]
                    );
                }
            }
        },
        scaleSize: function(obj) {
            options.img.style.width = options.imgw * options.scaleSize + "px";
            options.img.style.height = options.imgh * options.scaleSize + "px";
            options.img.style.top = options.bgY + "px";
            options.img.style.left = options.bgX + "px";

            _this.RenderMarker();
        },
        mousewheel: function(e) {
            //以鼠标为中心缩放，同时进行位置调整
            e.preventDefault();
            var x = e.pageX; //鼠标在屏幕中包含滚动条的位置
            var y = e.pageY;
            var wheelDelta = e.wheelDelta ? e.wheelDelta : -e.detail; ////>0滚轮向前走, -e.detail兼容火狐
            // if (e.target && (e.target === img)) {
            var l = _this.getOffset(options.$box); //box容器元素到根节点的距离
            x = x - l.left; //鼠标在box容器元素中位置
            y = y - l.top;
            console.log(x, y);

            var p = wheelDelta > 0 ? 0.1 : -0.1; //0.1,-0.1
            var ns = options.scaleSize; //缩放比例
            ns += p;
            if (ns < options.minScaleSize) {
                //可以缩小到0.1,放大到5倍
                ns = options.minScaleSize;
            } else if (ns > 1) {
                ns = 1;
            }

            //计算位置，以鼠标所在位置为中心
            //以每个点的x、y位置，计算其相对于图片的位置，再计算其相对放大后的图片的位置
            options.bgX =
                options.bgX -
                ((x - options.bgX) * (ns - options.scaleSize)) /
                    options.scaleSize; //图片距离容器的距离
            options.bgY =
                options.bgY -
                ((y - options.bgY) * (ns - options.scaleSize)) /
                    options.scaleSize;

            options.rX = options.bgX; //移动时图片距离容器的距离
            options.rY = options.bgY;

            options.scaleSize = ns; //更新倍率

            eventObj.scaleSize();
            // }
        }
    };

    this.bindEvent = function(el, eventName, eventFn) {
        if (el.addEventListener) {
            el.addEventListener(
                eventName,
                function(event) {
                    eventFn.call(el, _this.evnt(event));
                },
                { passive: false }
            );
        } else {
            el.attachEvent("on" + eventName, function(event) {
                eventFn.call(el, _this.evnt(window.event));
            });
        }
    };

    this.bindEvent(options.img, "mousewheel", eventObj.mousewheel);
    this.bindEvent(options.img, "DOMMouseScroll", eventObj.mousewheel);

    var hammerBox = new Hammer(options.$box);

    hammerBox.get("pinch").set({ enable: true }); //启用捏放
    hammerBox.get("pan").set({ direction: Hammer.DIRECTION_ALL }); //全方位平移

    hammerBox.on("panmove", eventObj.move);
    hammerBox.on("panend", eventObj.moveEnd);

    hammerBox.on("tap", eventObj.tap);

    var pinchstartCenter = { x: 0, y: 0 };
    hammerBox.on("pinchstart", function(e) {
        pinchstartCenter = e.center;
        console.log("pinchstart");
    });
    hammerBox.on("pinchmove", function(e) {
        console.log("pinch");
        var p = 0;
        if (e.scale > 1) {
            console.log("放大");
            p = 0.02;
        } else if (e.scale < 1) {
            console.log("缩放");
            p = -0.02;
        }

        var ns = options.scaleSize; //缩放比例
        ns += p;
        if (ns < options.minScaleSize) {
            ns = options.minScaleSize;
        } else if (ns > 1) {
            ns = 1;
        }

        var rect = options.img.getBoundingClientRect(); //获取元素距离视口距离
        var x = pinchstartCenter.x - rect.left; //手指在视图中位置-图片在视图中位置,剩余手指在元素中位置(x)
        var y = pinchstartCenter.y - rect.top;

        options.bgX =
            options.bgX - (x * (ns - options.scaleSize)) / options.scaleSize; //图片距离容器的距离
        options.bgY =
            options.bgY - (y * (ns - options.scaleSize)) / options.scaleSize;

        options.rX = options.bgX; //移动时图片距离容器的距离
        options.rY = options.bgY;

        options.scaleSize = ns; //更新倍率

        eventObj.scaleSize();
    });

    options.img.ondragstart = function(event) {
        return false;
    };
}
