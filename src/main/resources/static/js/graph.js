//存储工具栏信息
var elementInfo = [];
var curElement = {};
var elementAttrList = [];
//新增元件相关全局变量
var attrCount = 0;
var curX;
var curY;
var curFile;
var imgsrc = ["单向阀.svg","阀室.svg","分输站.svg","管道（竖直）.svg",
"管道（水平）.svg","截断阀.svg","空冷器.svg","离心压缩机.svg","理想调节阀.svg",
"立管.svg","油库.svg","站场.svg","注入站.svg"];
//存放全局唯一的模型和图
var graph;
var model;
var tbContainer;
var headContainer;
var container;
var rightContainer;
var xml;
var doc;


//初始化
function init()
{
    //设置节点连接按钮的图标，点击图标拖动即可生成线
    mxConnectionHandler.prototype.connectImage = new mxImage('/images/connector.gif', 16, 16);
    doc = mxUtils.createXmlDocument();
    //生成工具栏容器
    tbContainer = document.createElement('div');
    tbContainer.id = "tbContainer";
    tbContainer.style.position = 'absolute';
    tbContainer.style.overflow = 'hidden';
    tbContainer.style.padding = '2px';
    tbContainer.style.left = '0px';
    tbContainer.style.top = '30px';
    tbContainer.style.bottom = '0px';
    tbContainer.style.width = '100px';
    document.body.appendChild(tbContainer);
    // graph所在容器生成
    container = document.createElement('div');
    container.style.position = 'absolute';
    //设为scroll/auto时右键平移就会失效，原因未知，需要使用平移时请改为hidden
    container.style.overflow = 'auto';
    container.style.left = '100px';
    container.style.top = '30px';
    container.style.right = '300px';
    container.style.bottom = '0px';
    container.style.background = 'url("/images/grid.gif")';
    document.body.appendChild(container);
    // headbar生成
    headContainer = document.createElement("div");
    headContainer.style.position = 'absolute';
    headContainer.style.overflow = 'hidden';
    headContainer.style.left = '0px';
    headContainer.style.top = '0px';
    headContainer.style.right = '0px';
    headContainer.style.buttom = '0px';
    headContainer.style.height = '30px';
    document.body.appendChild(headContainer);
    //rightbar生成
    rightContainer = document.createElement("div");
    rightContainer.style.position = 'absolute';
    rightContainer.style.overflow = 'auto';
    rightContainer.style.right = '0px';
    rightContainer.style.top = '30px';
    rightContainer.style.bottom = '0px';
    rightContainer.style.width = '300px';
    document.body.appendChild(rightContainer);
    var cellInfo = document.createElement("div");
    cellInfo.id = "cellInfo";
    rightContainer.appendChild(cellInfo);


    model = new mxGraphModel();
    graph = new mxGraph(container, model);
    //在container中禁用浏览器右键菜单，用于编写自定义菜单
    mxEvent.disableContextMenu(container);
    //自定义菜单，提供右键删除功能
    graph.popupMenuHandler.factoryMethod = function(menu, cell, evt) {
        return createPopupMenu(graph, menu, cell, evt);
    };
    //允许两个节点间出现双向连接
    graph.setMultigraph(true);
    //从中心/左上缩放
    graph.centerZoom = true;
    //按键响应
    const keyHandler = new mxKeyHandler(graph);	
    //按delete键删除元素
    keyHandler.bindKey(46, function(evt) {
          if (graph.isEnabled()) {
        graph.removeCells();
          }
    });
    //设置节点间可以连接
    graph.setConnectable(true);
    //右键可以移动选中节点
    graph.setPanning(true);
    //未选中节点时左键可以全局移动（会与框选冲突，改为false）
    graph.panningHandler.useLeftButtonForPanning = false;
    //显示导航线（用于对齐）
    mxGraphHandler.prototype.guidesEnabled = true;
    //允许没有连接元件的线存在
    graph.setAllowDanglingEdges(true);
    //允许左键框选多个节点移动
    new mxRubberband(graph);
    
    //从浏览器外拖拽至graph内生成节点的监听函数
    mxEvent.addListener(container, 'dragover', function(evt)
    {
        if (graph.isEnabled())
        {
            evt.stopPropagation();
            evt.preventDefault();
        }
    });	
    mxEvent.addListener(container, 'drop', function(evt)
    {
        if (graph.isEnabled())
        {
            evt.stopPropagation();
            evt.preventDefault();

            //取得落点坐标
            var pt = mxUtils.convertPoint(graph.container, mxEvent.getClientX(evt), mxEvent.getClientY(evt));
            var tr = graph.view.translate;
            var scale = graph.view.scale;
            var x = pt.x / scale - tr.x;
            var y = pt.y / scale - tr.y;
            
            //因为弹框限制，一次只能处理一个元件
            var filesArray = event.dataTransfer.files;
            attrCount = 0;
            curFile = filesArray[0];
            curX = x;
            curY = y;
            //展开layer弹出层赋值，暂时保存本地
            layer.open({
                type: 1,
                title: '新增元件赋值',
                content: $('#addModal'),
                area: '300px',
                offset: '150px',
                id: 'paramContent',
                success: function(layero, index){
                }
            });
        }
    });

    //左侧工具栏放置已知模型
    //根据POST逐个生成
    getElements(graph);
    // for(var i = 0; i < imgsrc.length; ++i)
    // {
    //     img[i] = document.createElement("img");
    //     img[i].src = "/elements/" + imgsrc[i];
    //     img[i].width = "100";
    //     img[i].height = "50";
    //     tbContainer.appendChild(img[i]);
    //     customFunct(graph, img[i]);
    // }

    //headbar放置按钮
    //放大/缩小
    headContainer.appendChild(mxUtils.button('放大', function()
    {
        graph.zoomIn();
    }));		
    headContainer.appendChild(mxUtils.button('缩小', function()
    {
        graph.zoomOut();
    }));
    //撤销/重做
    var undoManager = new mxUndoManager();
    var listener = function(sender, evt)
    {
        undoManager.undoableEditHappened(evt.getProperty('edit'));
    };
    graph.getModel().addListener(mxEvent.UNDO, listener);
    graph.getView().addListener(mxEvent.UNDO, listener);
    headContainer.appendChild(mxUtils.button('撤销', function()
    {
        undoManager.undo();
    }));
    headContainer.appendChild(mxUtils.button('重做', function()
    {
        undoManager.redo();
    }));
    //最佳大小
    headContainer.appendChild(mxUtils.button('最佳大小', function()
    {
        var bounds = (graph.getGraphBounds());
        var t = graph.view.translate;
        var s = graph.view.scale;
        bounds.width /= s;
        bounds.height /= s;
        bounds.x = bounds.x / s - t.x;
        bounds.y = bounds.y / s - t.y;

        var cw = graph.container.clientWidth - 10;
        var ch = graph.container.clientHeight - 10;
        var scale = Math.floor(20 * Math.min(cw / bounds.width, ch / bounds.height)) / 20;
        graph.zoomTo(scale);

        if (mxUtils.hasScrollbars(graph.container))
        {
            graph.container.scrollTop = (bounds.y + t.y) * scale -
                Math.max((ch - bounds.height * scale) / 2 + 5, 0);
            graph.container.scrollLeft = (bounds.x + t.x) * scale -
                Math.max((cw - bounds.width * scale) / 2 + 5, 0);
        }
    }));
    //原始大小
    headContainer.appendChild(mxUtils.button('原始大小', function()
    {
        var scale = 1;
        graph.zoomTo(scale);
    }));
    //导出pdf（图片渲染难点多,且需要后台处理）
    headContainer.appendChild(mxUtils.button('导出pdf', function()
    {
        // var bounds = graph.getGraphBounds();
        // var scale = graph.view.scale;
        // var format = "png";
        // var s = 1;
        // var b = 0;
        // var bg = null;
        // var dpi = 300;
        // var xmlDoc = mxUtils.createXmlDocument();
        // var root = xmlDoc.createElement('output');
        // xmlDoc.appendChild(root);
        //
        // var xmlCanvas = new mxXmlCanvas2D(root);
        // var imgExport = new mxImageExport();
        // imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);
        // var w = Math.ceil(bounds.x + bounds.width);
        // var h = Math.ceil(bounds.y + bounds.height);
        // var xml = mxUtils.getXml(root);
        // $.ajax({
        //     url:"/graph/uploadPng",//url地址
        //     dataType:"json",         //返回的数据类型
        //     type:"post",             //发起请求的方式
        //     data:{
        //         "file":xml
        //     },
        //     success:function(data) {
        //         if(data.code == 0) {
        //
        //         }
        //     },
        //     error:function(){
        //         alert('图片生成失败，请重试！');
        //     }
        // });
        var autoOrigin = true;
        var printScale = 1;

        // Workaround to match available paper size in actual print output
        printScale *= 0.75;

        var pf = graph.pageFormat;
        console.log(pf);
        var scale = 1 / graph.pageScale;

        if (autoOrigin)
        {
            var pageCount = 1;

            if (!isNaN(pageCount))
            {
                scale = mxUtils.getScaleForPageCount(pageCount, graph, pf);
                console.log(scale);
            }
        }

        // Negative coordinates are cropped or shifted if page visible
        var gb = graph.getGraphBounds();
        var border = 0;
        var x0 = 0;
        var y0 = 0;

        // Applies print scale
        pf = mxRectangle.fromRectangle(pf);
        pf.width = Math.ceil(pf.width * printScale);
        pf.height = Math.ceil(pf.height * printScale);
        scale *= printScale;

        // Starts at first visible page
        if (!autoOrigin && graph.pageVisible)
        {
            var layout = graph.getPageLayout();
            x0 -= layout.x * pf.width;
            y0 -= layout.y * pf.height;
        }
        else
        {
            autoOrigin = true;
        }

        var preview = createPrintPreview(graph, scale, pf, border, x0, y0, autoOrigin);
        preview.open();

        if (print)
        {
            printPreview(preview);
        }
    }));
    //导出xml(未写上传方法）
    headContainer.appendChild(mxUtils.button('导出xml', function()
    {
        var enc = new mxCodec(mxUtils.createXmlDocument());
        var node = enc.encode(graph.getModel());
        var file = mxUtils.getXml(node);
        //同时存入全局变量
        xml = node;
        //下载文件方法
        var funDownload = function (content, filename)
        {
            var eleLink = document.createElement('a');
            eleLink.download = filename;
            eleLink.style.display = 'none';
            // 字符内容转变成blob地址
            var blob = new Blob([content]);
            eleLink.href = URL.createObjectURL(blob);
            // 触发点击
            document.body.appendChild(eleLink);
            eleLink.click();
            // 然后移除
            document.body.removeChild(eleLink);
        }
        //从浏览器保存文件
        if ('download' in document.createElement('a')) {
                funDownload(file, 'model.xml');
        } else {
                alert('浏览器不支持导出文件!');
        }
        console.log(xml);
    }));
    //导入xml
    headContainer.appendChild(mxUtils.button('导入xml', function()
    {
        document.getElementById("importXML").click();
    }));

    //添加监听函数
    graph.getSelectionModel().addListener(mxEvent.CHANGE, function(sender, evt)
    {
        selectionChanged(graph);
    });

    var parent = graph.getDefaultParent();
    // //生成初始节点，begin和end位置必须固定，用于撤销和重做
    // graph.getModel().beginUpdate();
    // try
    // {
    // }
    // finally
    // {
    //     graph.getModel().endUpdate();
    // }

}
console.log("load ok");

//请求所有elements
function getElements(graph) {
    $.ajax({
        url:"/graph/getElements",//url地址
        dataType:"json",         //返回的数据类型
        type:"post",             //发起请求的方式
        data:{
        },
        success:function(data) {
            if(data.code == 0) {
                elementInfo = data.elements;
                for(var index in elementInfo) {
                    curElement = elementInfo[index];
                    var image = document.createElement("img");
                    image.id = curElement["id"];
                    image.src = curElement["path"];
                    image.width = "100";
                    image.height = "50";
                    tbContainer.appendChild(image);
                    var type = createElement(curElement["name"]);
                    getAttributes(graph, curElement["id"], type);
                    customFunct(graph, image, type);
                }
            }
        },
        error:function(){
            alert('获取管道元件信息错误，请重试！');
        }
    });
}

//根据elementID请求attr
function getAttributes(graph, elementID ,type) {
    $.ajax({
        url:"/graph/getAttributes",//url地址
        dataType:"json",         //返回的数据类型
        type:"post",             //发起请求的方式
        data:{
            "id":elementID
        },
        success:function(data) {
            if(data.code == 0) {
                var attributes = data.attributes;
                for(var index in attributes) {
                    var temp = attributes[index];
                    type.setAttribute(temp["name"],temp["value"]);
                }
            }
        },
        error:function(){
            alert('获取元件属性错误，请重试！');
        }
    });
}

//创建自定义菜单（右键删除功能）
function createPopupMenu(graph, menu, cell, evt)
{
    if (cell != null)
    {
        menu.addItem('删除', null, function()
        {
            graph.removeCells();
        });
    }
}

//拖拽生成节点，将该图片加入侧边工具栏
function handleDrop(graph, file, x, y, type)
{
    if (file.type.substring(0, 5) == 'image')
    {
        //生成节点
        var reader = new FileReader();
        reader.onload = function(e)
        {
            var data = e.target.result;
            var img = new Image();
            img.onload = function()
            {
                var w = Math.max(1, img.width/2);
                var h = Math.max(1, img.height/2);
                var semi = data.indexOf(';');
                if (semi > 0)
                {
                    data = data.substring(0, semi) + data.substring(data.indexOf(',', semi + 1));
                }
                var parent = graph.getDefaultParent();
                var vertex = graph.insertVertex(parent, null, type, x, y, w, h, 'shape=image;image='
                    + data + ';verticalLabelPosition=bottom;verticalAlign=top');
            };
            img.src = data;
            item = document.createElement("img");
            item.src = img.src;
            item.width = "100";
            item.height = "50";
            tbContainer.appendChild(item);
            addedCustomFunct(graph, item, type);
        };
        reader.readAsDataURL(file);
    }
}

//自定义拖拽函数的动作
function customFunct(graph, image, type)
{
    var funct = function(graph, evt, cell, x, y)
    {
        addCell(graph, image, x, y, type);
    }
    mxUtils.makeDraggable(image, graph, funct, null);
}

//新添加图片（data格式）拖拽函数的动作
function addedCustomFunct(graph, image, type)
{
    var funct = function(graph, evt, cell, x, y)
    {
        addDataCell(graph, image, x, y, type);
    }
    mxUtils.makeDraggable(image, graph, funct, null);
}

//toolbar拖拽添加data格式节点
function addDataCell(graph, image, x, y, type)
{
    var data = image["src"];
    var img = new Image();
    img.onload = function()
    {
        var w = Math.max(1, img.width/2);
        var h = Math.max(1, img.height/2);
        var semi = data.indexOf(';');
        if (semi > 0)
        {
            data = data.substring(0, semi) + data.substring(data.indexOf(',', semi + 1));
        }
        var parent = graph.getDefaultParent();
        var vertex = graph.insertVertex(parent, null, type, x, y, w, h, 'shape=image;image='
            + data + ';verticalLabelPosition=bottom;verticalAlign=top');
    };
    img.src = data;
}

//toolbar拖拽添加节点
function addCell(graph, image, x, y, type)
{
    var width = image["naturalWidth"]/2;
    var height = image["naturalHeight"]/2;
    var style = 'shape=image;image=' + image["src"] + ';verticalLabelPosition=bottom;verticalAlign=top';
    var parent = graph.getDefaultParent();
    // var element;
    // for(var index in elementInfo) {
    //     if(elementInfo[index]["id"] == image.id) {
    //         element = elementInfo[index];
    //         break;
    //     }
    // }
    graph.getModel().beginUpdate();
    try {
        var vertex = graph.insertVertex(parent, null, type, x, y, width, height, style);
        //console.log(vertex);
    } finally {
        graph.getModel().endUpdate();
    }
}

//动态新增右侧文本框
function createTextField(graph, form, cell, attribute)
{
    var input = form.addText(attribute.nodeName + ':', attribute.nodeValue);
    var applyHandler = function()
    {
        var newValue = input.value || '';
        var oldValue = cell.getAttribute(attribute.nodeName, '');

        if (newValue != oldValue)
        {
            graph.getModel().beginUpdate();

            try
            {
                var edit = new mxCellAttributeChange(
                    cell, attribute.nodeName,
                    newValue);
                graph.getModel().execute(edit);
            }
            finally
            {
                graph.getModel().endUpdate();
            }
        }
    };
    mxEvent.addListener(input, 'keypress', function (evt)
    {
        // Needs to take shift into account for textareas
        if (evt.keyCode == /*enter*/13 &&
            !mxEvent.isShiftDown(evt))
        {
            input.blur();
        }
    });

    if (mxClient.IS_IE)
    {
        mxEvent.addListener(input, 'focusout', applyHandler);
    }
    else
    {
        // Note: Known problem is the blurring of fields in
        // Firefox by changing the selection, in which case
        // no event is fired in FF and the change is lost.
        // As a workaround you should use a local variable
        // that stores the focused field and invoke blur
        // explicitely where we do the graph.focus above.
        mxEvent.addListener(input, 'blur', applyHandler);
    }
}

//更新rightbar内容
function selectionChanged(graph)
{
    var div = document.getElementById('cellInfo');
    graph.container.focus();
    div.innerHTML = '';
    var cell = graph.getSelectionCell();
    if (cell == null || cell.vertex == false)
    {
        mxUtils.writeln(div, '未选中元件！');
    }
    else
    {
        var center = document.createElement('center');
        mxUtils.writeln(center, cell.value.nodeName);
        div.appendChild(center);
        mxUtils.br(div);
        var form = new mxForm();
        var attrs = cell.value.attributes;
        for (var i = 0; i < attrs.length; i++)
        {
            createTextField(graph, form, cell, attrs[i]);
        }

        div.appendChild(form.getTable());
        mxUtils.br(div);
    }
}

//创建节点类型
function createElement(name)
{
    for(var index in elementAttrList) {
        var s = new XMLSerializer();
        if(s.serializeToString(elementAttrList[index]).startsWith("<"+name)) {
            return elementAttrList[index];
        }
    }
    var eletype = doc.createElement(name);
    elementAttrList.push(eletype);
    return eletype;
}

//拖拽新增节点类型
function addNewElement(graph)
{
    //var id = document.getElementById("new_id").value;
    var name = document.getElementById("new_name").value;
    var type = createElement(name);
    for(var i = 0; i < attrCount; ++i) {
        var input_name = document.getElementById("name" + i).value;
        var input_value = document.getElementById("value" + i).value;
        type.setAttribute(input_name, input_value);
    }
    attrCount = 0;
    handleDrop(graph, curFile, curX, curY, type);
    layer.closeAll();
    return;
}

//动态新增属性input
function addNewAttr()
{
    var name = document.getElementById("param_form");
    var input_name = document.createElement("input");
    input_name.id = "name" + attrCount;
    input_name.name = "name" + attrCount;
    input_name.placeholder = "请输入属性名...";
    var input_value = document.createElement("input");
    input_value.id = "value" + attrCount;
    input_value.name = "value" + attrCount;
    input_value.placeholder = "请输入属性值...";
    name.appendChild(input_name);
    name.appendChild(input_value);
    attrCount++;
    return;
}

//删除最下方的input
function delNewAttr()
{
    var name = document.getElementById("param_form");
    var count = attrCount - 1;
    var input_name = document.getElementById("name"+ count);
    var input_value = document.getElementById("value"+ count);
    input_value.remove();
    input_name.remove();
    attrCount--;
    return;
}

//生成预览
function createPrintPreview(graph, scale, pf, border, x0, y0, autoOrigin)
{
    var preview = new mxPrintPreview(graph, scale, pf, border, x0, y0);
//    preview.title = mxResources.get('preview');
    preview.printBackgroundImage = true;
    preview.autoOrigin = autoOrigin;
    var bg = '#ffffff';
    preview.backgroundColor = bg;

    var writeHead = preview.writeHead;

    // Adds a border in the preview
    preview.writeHead = function(doc)
    {
        writeHead.apply(this, arguments);

        doc.writeln('<style type="text/css">');
        doc.writeln('@media screen {');
        doc.writeln('  body > div { padding:30px;box-sizing:content-box; }');
        doc.writeln('}');
        doc.writeln('</style>');
    };
    return preview;
}

//打印预览
function printPreview(preview)
{
    try
    {
        if (preview.wnd != null)
        {
            var printFn = function()
            {
                preview.wnd.focus();
                preview.wnd.print();
                preview.wnd.close();
            };
            //needs a bit of delay in order to render the SVG contents
            window.setTimeout(printFn, 500);
            printFn();
        }
    }
    catch (e)
    {
    }
}

//处理上传的xml文件
function handle_file(graph, files)
{
    if (files != null) {
        var file = files[0];
        var reader = new FileReader();
        //判断是否为文本文件
        reader.onload = function(e) {
            var data = e.target.result;
            var model = mxUtils.parseXml(data);
            console.log(model);
            var dec = new mxCodec(model);
            dec.decode(model.documentElement, graph.getModel());
        }
        reader.readAsText(file);
    }
}

