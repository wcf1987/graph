<template>
  <div id="graph">
    <div class="main-div">
      <div id="headContainer" class="head-container">
        <el-row style="margin-left: 110px">
          <el-button-group>
            <el-button type="primary" size="small" @click="readModel" icon="el-icon-refresh">读取模型</el-button>
            <el-button type="primary" size="small" @click="saveModel" icon="el-icon-upload">保存模型</el-button>
          </el-button-group>
          <el-button-group>
            <el-button type="primary" size="small" @click="zoomOut" icon="el-icon-zoom-out">缩小</el-button>
            <el-button type="primary" size="small" @click="zoomIn" icon="el-icon-zoom-in">放大</el-button>
          </el-button-group>
          <el-button-group>
            <el-button type="primary" size="small" @click="selectAll" icon="el-icon-thumb">全选</el-button>
          </el-button-group>
          <el-button-group>
            <el-button type="danger" size="small" @click="remove" icon="el-icon-delete-solid">删除</el-button>
          </el-button-group>
          <el-button-group>
            <el-button type="primary" size="small" @click="undo" icon="el-icon-back">撤销</el-button>
            <el-button type="primary" size="small" @click="redo" icon="el-icon-right">重做</el-button>
          </el-button-group>
          <el-button-group>
            <el-button type="primary" size="small" @click="scaleRaw">原始大小</el-button>
            <el-button type="primary" size="small" @click="scaleBest">最佳大小</el-button>
          </el-button-group>
          <el-button-group>
            <el-button type="success" size="small" @click="_import" icon="el-icon-download">导入XML</el-button>
            <el-button type="success" size="small" @click="exportXML" icon="el-icon-upload2">导出XML</el-button>
            <el-button type="success" size="small" @click="exportPDF" icon="el-icon-picture-outline">导出PDF</el-button>
          </el-button-group>
        </el-row>
      </div>
      <div id="tbContainer" class="left-container"></div>
      <div id="container" class="main-container"></div>
      <div id="rightContainer" class="right-container">

      </div>
    </div>

    <input type="file" id="importXML" @change="handle_file($event)" accept=".xml" style="display: none;">

    <el-dialog title="新增元件赋值" :visible.sync="dialogFormVisible" width="40%" @close="closeDialog" center>
      <el-form ref="form" :model="form" :rules="rules" :inline="true">
        <el-form-item
          label="元件名称" label-width="120px"
          prop="itemName">
          <el-input v-model="form.itemName" placeholder="请输入元件名称"></el-input>
        </el-form-item>
        <div v-for="(item, index) in form.attrs" :key="index">
          <el-form-item
            label="属性名" label-width="120px"
            :prop="'attrs.' + index + '.attrName'"
            :rules="[
              {pattern: /^[\u4E00-\u9FA5A-Za-z].*$/, message: '不能以数字或特殊字符开头', trigger: 'change'},
              {required: true, message: '属性名不能为空', trigger: 'change'},
              ]">
            <el-input v-model="item.attrName" placeholder="请输入属性名"></el-input>
          </el-form-item>
          <el-form-item
            label="属性值" label-width="120px"
            :prop="'attrs.' + index + '.attrValue'"
          >
            <el-input v-model="item.attrValue" placeholder="请输入属性值"></el-input>
          </el-form-item>
          <el-form-item>
            <i class="el-icon-delete" @click="delCurAttr(index)"></i>
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button id="addAttr" @click="addAttr">新增属性</el-button>
        <el-button id="delAttr" @click="delAttr">删除属性</el-button>
        <el-button type="primary" @click="addNewElement('form')">提交</el-button>
      </div>
    </el-dialog>
  </div>

</template>

<script>
  // const {mxGraph, mxClient, mxCodec, mxUtils, mxConnectionHandler, mxEvent, mxGraphHandler,
  //   mxKeyHandler, mxImage, mxGraphModel, mxRubberband, mxUndoManager, mxForm, mxRectangle, mxPrintPreview} = mxgraph;
  // import {
  //   mxToolbar,
  //   mxGraphModel,
  //   mxGraph,
  //   mxCell,
  //   mxGeometry,
  //   mxEvent,
  //   mxUtils,
  //   mxConnectionHandler,
  //   mxImage,
  //   mxKeyHandler,
  //   mxGraphHandler,
  //   mxRubberband,
  //   mxUndoManager,
  //   mxClient
  // } from 'mxgraph/javascript/mxClient'
  var graph;
  var model;
  var tbContainer;
  var headContainer;
  var container;
  var rightContainer;
  var undoManager;
  var xml;
  var doc;
  //存储工具栏信息
  var elementInfo = [];
  var curElement = {};
  var elementAttrList = [];
  //新增元件相关全局变量
  var curX;
  var curY;
  var curFile;

  export default {
    name: "graph",
    data() {
      return {
        form: {
          itemName: "",
          attrs: [],
        },
        rules: {
          itemName: [
            {pattern: /^[\u4E00-\u9FA5A-Za-z].*$/, message: '不能以数字或特殊字符开头', trigger: 'change'},
            {required: true, message: '元件名称不能为空', trigger: 'change'},
          ],
        },
        dialogFormVisible: false,
      }
    },
    methods: {
      //放大
      zoomIn() {
        graph.zoomIn();
        this.$message("放大到"+(graph.view.scale*100).toString() + "%");
      },
      //缩小
      zoomOut() {
        graph.zoomOut();
        this.$message("缩小到"+(graph.view.scale*100).toString() + "%");
      },
      //全选
      selectAll() {
        graph.selectAll();
      },
      //删除
      remove() {
        if(graph.isEnabled()) {
          graph.removeCells(graph.getSelectionCells());
        }
      },
      //撤销
      undo() {
        undoManager.undo();
      },
      //重做
      redo() {
        undoManager.redo();
      },
      //最佳大小
      scaleBest() {
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
        this.$message("自动调整比例到"+(graph.view.scale*100).toString() + "%");
        if (mxUtils.hasScrollbars(graph.container)) {
          graph.container.scrollTop = (bounds.y + t.y) * scale -
            Math.max((ch - bounds.height * scale) / 2 , 0);
          graph.container.scrollLeft = (bounds.x + t.x) * scale -
            Math.max((cw - bounds.width * scale) / 2 , 0);
        }
      },
      //原始大小
      scaleRaw() {
        var scale = 1;
        graph.zoomTo(scale);
        this.$message("还原到"+(graph.view.scale*100).toString() + "%");
      },
      //导入XML
      _import() {
        document.getElementById("importXML").click();
      },
      //导出PDF
      exportPDF() {
        var autoOrigin = true;
        var printScale = 1;
        printScale *= 0.75;
        var pf = graph.pageFormat;
        var scale = 1 / graph.pageScale;
        if (autoOrigin) {
          var pageCount = 1;
          if (!isNaN(pageCount)) {
            scale = mxUtils.getScaleForPageCount(pageCount, graph, pf);
            console.log(scale);
          }
        }
        var gb = graph.getGraphBounds();
        var border = 0;
        var x0 = 0;
        var y0 = 0;
        pf = mxRectangle.fromRectangle(pf);
        pf.width = Math.ceil(pf.width * printScale);
        pf.height = Math.ceil(pf.height * printScale);
        scale *= printScale;
        var preview = this.createPrintPreview(graph, scale, pf, border, x0, y0, autoOrigin);
        preview.open();
        if (print) {
          this.printPreview(preview);
        }
      },
      //生成预览
      createPrintPreview(graph, scale, pf, border, x0, y0, autoOrigin) {
        var preview = new mxPrintPreview(graph, scale, pf, border, x0, y0);
        preview.printBackgroundImage = true;
        preview.autoOrigin = autoOrigin;
        var bg = '#ffffff';
        preview.backgroundColor = bg;
        var writeHead = preview.writeHead;
        preview.writeHead = function(doc) {
          writeHead.apply(this, arguments);
          doc.writeln('<style type="text/css">');
          doc.writeln('@media screen {');
          doc.writeln('  body > div { padding:30px;box-sizing:content-box; }');
          doc.writeln('}');
          doc.writeln('</style>');
        };
        return preview;
      },
      //打印预览
      printPreview(preview) {
        try {
          if (preview.wnd != null) {
            var printFn = function() {
              preview.wnd.focus();
              preview.wnd.print();
              preview.wnd.close();
            };
            window.setTimeout(printFn, 500);
            printFn();
          }
        }
        catch (e) {
        }
      },
      //导出XML
      exportXML() {
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
          this.$message('浏览器不支持导出文件!');
        }
      },
      //创建节点类型
      createElement(name) {
        for(var index in elementAttrList) {
          var s = new XMLSerializer();
          if(s.serializeToString(elementAttrList[index]).startsWith("<"+name)) {
            return elementAttrList[index];
          }
        }
        var eletype = doc.createElement(name);
        elementAttrList.push(eletype);
        return eletype;
      },
      //处理上传的xml文件
      handle_file(event) {
        var files = event.target.files;
        if (files != null) {
          var file = files[0];
          var reader = new FileReader();
          reader.onload = function (e) {
            var data = e.target.result;
            var model = mxUtils.parseXml(data);
            var dec = new mxCodec(model);
            dec.decode(model.documentElement, graph.getModel());
          }
          reader.readAsText(file);
        }
      },
      //动态新增input
      addAttr() {
        this.form.attrs.push({
          attrName: '',
          attrValue: '',
        })
      },
      //删除最后一个input
      delAttr() {
        this.form.attrs.splice(-1, 1);
      },
      //删除当前input
      delCurAttr(index) {
        this.form.attrs.splice(index, 1);
      },
      //拖拽新增节点类型
      addNewElement(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            var type = this.$options.methods.createElement(this.form.itemName);
            for(var index in this.form.attrs) {
              type.setAttribute(this.form.attrs[index].attrName, this.form.attrs[index].attrValue);
            }
            this.handleDrop(graph, curFile, curX, curY, type);
            this.dialogFormVisible = false;
            this.form.itemName = "";
            this.form.attrs = [];
          } else {
            return false;
          }
        });
      },
      //关闭弹框
      closeDialog() {
        this.form.itemName = "";
        this.form.attrs = [];
      },
      //保存模型到服务器
      saveModel() {
        var enc = new mxCodec(mxUtils.createXmlDocument());
        var node = enc.encode(graph.getModel());
        var file = mxUtils.getXml(node);
        var data = new FormData();
        data.append("file", file);
        var _this = this;
        _this.$axios
        .post("/graph/saveTestModel",
          data,{
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
        .then(function (response) {
          if(response.data.code == 0) {
            _this.$message("保存成功！");
          }
          else {
            _this.$message("保存模型失败，请重试！");
          }
        })
        .catch(function (error) {
          console.log(error);
          _this.$message("保存模型失败，请重试！");
        })
      },
      //从服务器读取模型
      readModel() {
        var _this = this;
        _this.$axios
          .post("/graph/getTestModel",
            "",{
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            })
          .then(function (response) {
            var model = mxUtils.parseXml(response.data);
            var dec = new mxCodec(model);
            dec.decode(model.documentElement, graph.getModel());
            _this.$message('模型加载完成！');
          })
          .catch(function (error) {
            console.log(error);
            _this.$message('获取模型文件错误，请重试！');
          })
      },
    },
    mounted() {
      mxConnectionHandler.prototype.connectImage = new mxImage('../../../static/images/connector.gif', 18, 18);
      doc = mxUtils.createXmlDocument();
      var _this = this;

      tbContainer = document.getElementById("tbContainer");
      container = document.getElementById("container");
      container.style.background = 'url("../../../static/images/bg.svg")';
      headContainer = document.getElementById("headContainer");
      rightContainer = document.getElementById("rightContainer");
      var cellInfo = document.createElement("div");
      cellInfo.id = "cellInfo";
      rightContainer.appendChild(cellInfo);

      model = new mxGraphModel();
      graph = new mxGraph(container, model);
      //在container中禁用浏览器右键菜单，用于编写自定义菜单
      mxEvent.disableContextMenu(container);
      //允许两个节点间出现双向连接
      graph.setMultigraph(true);
      //从中心/左上缩放
      graph.centerZoom = true;
      //自定义菜单
      graph.popupMenuHandler.factoryMethod = function(menu, cell, evt) {
        return createPopupMenu(graph, menu, cell, evt);
      };
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
      //显示导航线（用于对齐）
      mxGraphHandler.prototype.guidesEnabled = true;
      //允许没有连接元件的线存在
      graph.setAllowDanglingEdges(true);
      //允许左键框选多个节点移动
      new mxRubberband(graph);
      //撤销重做
      undoManager = new mxUndoManager();
      var listener = function(sender, evt) {
        undoManager.undoableEditHappened(evt.getProperty('edit'));
      };
      graph.getModel().addListener(mxEvent.UNDO, listener);
      graph.getView().addListener(mxEvent.UNDO, listener);
      getElements(graph);
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
          curFile = filesArray[0];
          curX = x;
          curY = y;
          _this.dialogFormVisible = true;
          document.getElementById("addAttr").click();
        }
      });
      //添加监听函数
      graph.getSelectionModel().addListener(mxEvent.CHANGE, function(sender, evt) {
        selectionChanged(graph);
      });
      getModel(graph);
      //创建自定义菜单（删除,全选）
      function createPopupMenu(graph, menu, cell, evt) {
        if (cell != null) {
          menu.addItem('删除', null, function() {
            graph.removeCells();
          });
        }
        else {
          menu.addItem('全选', null, function() {
            graph.selectAll();
          });
        }
      }
      //请求所有elements
      function getElements(graph) {
        _this.$axios
        .post("/graph/getElements")
        .then(function (response) {
          if(response.data.code == 0) {
            elementInfo = response.data.elements;
            var basePath = "http://localhost:8080";
            for(var index in elementInfo) {
              curElement = elementInfo[index];
              var image = document.createElement("img");
              image.id = curElement["id"];
              image.src =  basePath + curElement["path"];
              image.width = 100;
              image.height = 50;
              var center = document.createElement("center");
              center.appendChild(image);
              tbContainer.appendChild(center);
              var type = createElement(curElement["name"]);
              getAttributes(graph, curElement["id"], type);
              customFunct(graph, image, type);
            }
          }
          else {
            _this.$message('获取管道元件信息错误，请重试！');
          }
        })
        .catch(function (error) {
          console.log(error);
          _this.$message('获取管道元件信息错误，请重试！');
        })
      }
      //获取模型文件
      function getModel(graph) {
        // var data = new FormData();
        // data.append();
        _this.$axios
        .post("/graph/getTestModel",
          "",{
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          })
        .then(function (response) {
          var model = mxUtils.parseXml(response.data);
          var dec = new mxCodec(model);
          dec.decode(model.documentElement, graph.getModel());
          _this.$message('模型加载完成！');
        })
        .catch(function (error) {
          console.log(error);
          _this.$message('获取模型文件错误，请重试！');
        })
      }
      //创建节点类型
      function createElement(name) {
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
      //自定义拖拽函数的动作
      function customFunct(graph, image, type) {
        var funct = function(graph, evt, cell, x, y)
        {
          addCell(graph, image, x, y, type);
        }
        mxUtils.makeDraggable(image, graph, funct, null);
      }
      //toolbar拖拽添加节点
      function addCell(graph, image, x, y, type) {
        var width = image["naturalWidth"]/2;
        var height = image["naturalHeight"]/2;
        var style = 'shape=image;image=' + image["src"] + ';verticalLabelPosition=bottom;verticalAlign=top';
        var parent = graph.getDefaultParent();
        graph.getModel().beginUpdate();
        try {
          var vertex = graph.insertVertex(parent, null, type, x, y, width, height, style);
        } finally {
          graph.getModel().endUpdate();
        }
      }
      //根据elementID请求attr
      function getAttributes(graph, elementID ,type) {
        var data = new FormData();
        data.append('id', elementID);
        _this.$axios.
          post("/graph/getAttributes",
            data, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
          .then(function (response) {
            if(response.data.code == 0) {
              var attributes = response.data.attributes;
              for(var index in attributes) {
                var temp = attributes[index];
                type.setAttribute(temp["name"],temp["value"]);
              }
            }
            else {
              _this.$message('获取'+elementID+'号元件属性错误，请重试！');
            }
          })
          .catch(function (error) {
            console.log(error);
            _this.$message('获取'+elementID+'号元件属性错误，请重试！');
          })
      }
      //拖拽生成节点，将该图片加入侧边工具栏
      _this.handleDrop = function(graph, file, x, y, type) {
        if (file.type.substring(0, 5) == 'image') {
          //生成节点
          var reader = new FileReader();
          reader.onload = function(e) {
            var data = e.target.result;
            var img = new Image();
            img.onload = function() {
              var w = Math.max(1, img.width/2);
              var h = Math.max(1, img.height/2);
              var semi = data.indexOf(';');
              if (semi > 0) {
                data = data.substring(0, semi) + data.substring(data.indexOf(',', semi + 1));
              }
              var parent = graph.getDefaultParent();
              var vertex = graph.insertVertex(parent, null, type, x, y, w, h, 'shape=image;image='
                + data + ';verticalLabelPosition=bottom;verticalAlign=top');
            };
            img.src = data;
            var item = document.createElement("img");
            item.src = img.src;
            item.width = 100;
            item.height = 50;
            var center = document.createElement("center");
            center.appendChild(item);
            tbContainer.appendChild(center);
            addedCustomFunct(graph, item, type);
          };
          reader.readAsDataURL(file);
        }
      }
      //新添加图片（data格式）拖拽函数的动作
      function addedCustomFunct(graph, image, type) {
        var funct = function(graph, evt, cell, x, y) {
          addDataCell(graph, image, x, y, type);
        }
        mxUtils.makeDraggable(image, graph, funct, null);
      }
      //toolbar拖拽添加data格式节点
      function addDataCell(graph, image, x, y, type) {
        var data = image["src"];
        var img = new Image();
        img.onload = function() {
          var w = Math.max(1, img.width/2);
          var h = Math.max(1, img.height/2);
          var semi = data.indexOf(';');
          if (semi > 0) {
            data = data.substring(0, semi) + data.substring(data.indexOf(',', semi + 1));
          }
          var parent = graph.getDefaultParent();
          var vertex = graph.insertVertex(parent, null, type, x, y, w, h, 'shape=image;image='
            + data + ';verticalLabelPosition=bottom;verticalAlign=top');
        };
        img.src = data;
      }
      //动态新增右侧文本框
      function createTextField(graph, form, cell, attribute) {
        var input = form.addText(attribute.nodeName + ':', attribute.nodeValue);
        var applyHandler = function() {
          var newValue = input.value || '';
          var oldValue = cell.getAttribute(attribute.nodeName, '');
          if (newValue != oldValue) {
            graph.getModel().beginUpdate();
            try {
              cell.setAttribute(attribute.nodeName, newValue);
              graph.refresh();
            }
            finally {
              graph.getModel().endUpdate();
            }
          }
        };
        mxEvent.addListener(input, 'keypress', function (evt) {
          if (evt.keyCode == /*enter*/13 &&
            !mxEvent.isShiftDown(evt)) {
            input.blur();
          }
        });

        if (mxClient.IS_IE) {
          mxEvent.addListener(input, 'focusout', applyHandler);
        }
        else {
          mxEvent.addListener(input, 'blur', applyHandler);
        }
      }
      //更新rightbar内容
      function selectionChanged(graph) {
        var div = document.getElementById('cellInfo');
        graph.container.focus();
        div.innerHTML = '';
        var cell = graph.getSelectionCell();
        if (cell == null || cell.vertex == false) {
          const center = document.createElement('center');
          mxUtils.writeln(center, '未选中元件！');
          div.appendChild(center);
        }
        else {
          var center = document.createElement('center');
          mxUtils.writeln(center, cell.value.nodeName);
          var form = new mxForm();
          var attrs = cell.value.attributes;
          for (var i = 0; i < attrs.length; i++) {
            createTextField(graph, form, cell, attrs[i]);
          }
          var br = document.createElement('br');
          center.appendChild(br);
          center.appendChild(form.getTable());
          div.appendChild(center);
        }
      }
    }
  }
</script>

<style scoped>

  #graph {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
  }

  .main-div {
    height: 100%;
    width: 100%;
  }

  .head-container {
    overflow: auto;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    height: 40px;
    background-color: #F2F6FC;
  }

  .left-container {
    overflow: auto;
    position: absolute;
    background-color: #F2F6FC;
    left: 0;
    top: 40px;
    bottom: 10px;
    width: 110px;
  }

  .main-container {
    overflow: auto;
    position: absolute;
    top: 40px;
    left: 110px;
    right: 300px;
    bottom: 10px;
    border: thin solid #2E2D3C;
  }

  .right-container {
    overflow: auto;
    position: absolute;
    background-color: #F2F6FC;
    width: 300px;
    right: 0;
    bottom: 10px;
    top: 40px;
  }

</style>
