var Modal;

(function($,$$) {

Modal = new Class({

  Implements : [Options, Events],

  options : {
    className : 'modal',
    width : 700,
    height : 500,
    zIndex : 2000,
    closeModalGraphic : true,
    overlay : true,
    overlayOpacity : 0.5,
    overlayZIndex : 1000,
    overlayStyles : {
      'background-color':'#000000'
    },
    overlayActsAsHide : true,
    escapeKeyActsAsHide : true,
    hidePositions : {
      x : -9999,
      y : -9999
    },
    fxOptions : {
      transition: 'circ:in',
      link:'cancel'
    },
    overlayFxOptions : {
      link:'cancel'
    },
    loadingOptions : {

    }
  },

  initialize : function(options) {
    this.setOptions(options);

    var klass = this.options.className;
    this.container = new Element('div',{
      'class' : klass + ' ' + klass + '-container',
      'styles':{
        'position':'absolute',
        'z-index' : this.options.zIndex
      }
    }).inject(document.body);
    this.container.store('Modal',this);

    this.stage = new Element('div',{
      'class': klass + '-stage',
      'styles':{
        'left':0,
        'right':0,
        'top':0,
        'bottom':0
      }
    }).inject(this.container);
    this.stage.set('spinner',{
      'class':klass+'-spinner',
      style : {
        'opacity':0.3,
        'background-color':'#ffffff',
        'left':0,
        'top':0
      }
    });

    this.closeModal = new Element('div',{
      'class': klass + '-close',
      'styles':{
        'position':'absolute'
      },
      'events':{
        'click':this.hideEverything.bind(this)
      }
    }).injectInside(this.container);

    this.animator = new Fx.Morph(this.container,this.options.fxOptions);
    this.resize(this.options.width,this.options.height);

    this.getContainer().setStyle('display','none');
    this.position(this.options.hidePositions.x,this.options.hidePositions.y);

    window.addEvent('keydown',function(event) {
      if(this.options.escapeKeyActsAsHide) {
        var key = event.key;
        if(key == 'esc') {
          event.stop();
          this.hideEverything();
        }
      }
    }.bind(this));
  },

  position : function(x,y) {
    this.getContainer().setStyles({
      'left' : x,
      'top' : y
    });
  },

  positionInCenter : function() {
    var w = this.getWidth();
    var h = this.getHeight();
    var sc = window.getScrollSize();
    var wc = window.getSize();
    var x = Math.floor((sc.x - w)/2);
    var y = Math.floor((wc.y - h)/2);
    this.position(x,y);
  },

  getWidth : function() {
    return this.getDimensions().width;
  },

  getHeight : function() {
    return this.getDimensions().height;
  },

  getOverlay : function() {
    if(!this.overlay) {
      var klass = this.options.className;
      var abs = Browser.ie6 ? 'absolute' : 'fixed';
      this.overlay = new Element('div',{
        'class' : klass + '-overlay',
        'styles':{
          'opacity':0,
          'display':'none',
          'position':abs,
          'top':0,
          'left':0,
          'right':0,
          'bottom':0
        }
      }).inject(document.body);

      this.overlay.addEvent('click',function(event) {
        if(this.options.overlayActsAsHide) {
          this.hideEverything();
        }
      }.bind(this));
    }
    return this.overlay;
  },

  showOverlay : function(fast) {
    if(this.options.overlay) {

      fast = fast === true;
      var overlay = this.getOverlay();
      var o = this.options.overlayOpacity || 0.5;
      if(overlay.getStyle('display') == 'block' && overlay.getStyle('opacity')==o) {
        return;
      }

      this.overlay.setStyles(this.options.overlayStyles);
      overlay.setStyles({
        'display':'block',
        'z-index':this.options.overlayZIndex
      });

      if(this.options.overlayActsAsHide) {
        overlay.setStyle('cursor','pointer');
      }
      if(fast) {
        overlay.setStyle('opacity',o);
      }
      else {
        overlay.set('morph',this.options.overlayFxOptions);
        overlay.get('morph').start({
          'opacity':o
        }).chain(function() {
          this.showOverlay(true);
        }.bind(this));
      }
    }
  },

  hideOverlay : function(fast) {
    var overlay = this.getOverlay();
    fast = fast === true;
    if(overlay.getStyle('display') == 'block') {
      if(fast) {
        overlay.setStyle('display','none');
      }
      else {
        overlay.get('morph').start({
          'opacity':0
        }).chain(function() {
          this.hideOverlay(true);
        }.bind(this));
      }
    }
  },

  setHeight : function(height) {
    this.resize(this.getWidth(),height);
  },

  setWidth : function(width) {
    this.resize(width,this.getHeight());
  },

  resize : function(width,height) {
    var container = this.getContainer();
    container.setStyles({
      width : width
      //height : height
    });
    this.positionInCenter();
  },

  getDimensions : function() {
    return this.toElement().getDimensions();
  },

  toElement : function() {
    return this.container;
  },

  getContainer : function() {
    return this.container;
  },

  getStage : function() {
    return this.stage;
  },

  setContent : function(content) {
    this.getStage().set('html',content);
  },

  clear : function() {
    this.getStage().empty();
  },

  setAsLoading : function(bool) {
    bool = bool || true;
    var options = this.options.loadingOptions;
    var klass = options.className;
    var container = this.getContainer();
  },

  hideEverything : function() {
    this.hide();
    if(this.options.overlay) {
      this.hideOverlay();
    }
  },

  hide : function(fast) {
    if(this.isShowing()) {
      var H = function() {
        this.getContainer().setStyle('display','none');
        this.position(this.options.hidePositions.x,this.options.hidePositions.y);
        this.fireEvent('afterHide');
      }.bind(this);

      fast = fast === true;
      this.fireEvent('beforeHide');
      if(fast) {
        H();
      }
      else {
        this.animator.start({
          'opacity' : 0
        }).chain(H);
      }
      this.fireEvent('hide');
    }
  },

  hideAndDestroy : function() {
    this.addEvent('hide',function() {
      this.destroy();
    }.bind(this)); 
    this.hideEverything();
  },

  isShowing : function() {
    return this.getContainer().getStyle('display') == 'block';
  },

  show : function(fast) {
    fast = fast === true;
    var container = this.getContainer();
    this.positionInCenter();
    if(container.getStyle('display') == 'block' && container.getStyle('opacity')==1) {
      return;
    }
    container.setStyles({
      'opacity':0,
      'display':'block'
    });
    if(fast) {
      container.setStyle('opacity',1);
      this.fireEvent('show');
    }
    else {
      this.animator.start({
        'opacity' : [0,1]
      }).chain(function() {
        this.show(true);
      }.bind(this));
    }
  },

  showEverything : function() {
    if(this.options.overlay) {
      this.showOverlay();
    }
    this.show();
  },

  showAndPosition : function() {
    this.positionInCenter();
    this.showEverything();
  },

  destroy : function() {
    this.getStage().destroy();
    this.getContainer().destroy();
    this.getOverlay().destroy();
  }

}); 

Modal.Image = new Class({

  Extends : Modal,

  options : {
    setAsLoadingWhenLoadingImage : true,
    maxWidth : 800,
    maxHeight : 800
  },

  load : function(image) {
    if(typeOf(image) == 'string') {
      new Asset.image(image,{
        onload : function(image) {
          if(image && image.width && image.height) {
            this.resizeImage(image);
            this.setImage(image);
            this.fireEvent('imageSuccess');
          }
        }.bind(this)
      });
      this.getStage().spin();
      this.fireEvent('imageRequest');
    }
    else {
      this.fireEvent('imageFailure');
    }
  },

  resizeImage : function(image) {
    if(image.width > this.options.maxWidth) {
      var ratio = this.options.maxWidth / image.width;
      image.width = this.options.maxWidth;
      image.height = parseInt(image.height) * ratio;
    }
    if(image.height > this.options.maxHeight) {
      var ratio = this.options.maxHeight / image.height;
      image.height = this.options.maxheight;
      image.width = parseInt(image.width) * ratio;
    }
  },

  setImage : function(image) {

    var attachImage = function(image) {
      var width = image.width;
      var height = image.height;
      var stage = this.getStage();
      var klass = this.options.className;
      this.imageContainer = new Element('div',{
        'class':klass+'-image',
        'styles':{
          'position':'relative'
        }
      }).inject(stage).adopt(image);
      this.image = image;
    }.bind(this);

    if(this.isShowing() && this.imageContainer) {
      var previous = this.imageContainer;
      attachImage(image);
      previous.destroy();
      var current = this.imageContainer;
      this.fireEvent('show');
    }
    else {
      this.clear();
      attachImage(image);
      this.setAsLoading(false);
      this.resize(this.getImageWidth(),this.getImageHeight());
      this.showEverything();
      return;
    }
    this.getStage().unspin();
  },

  getImage : function() {
    return this.image;
  },

  getImageContainer : function() {
    return this.imageContainer;
  },

  getImageSrc : function() {
    return this.getImage().src;
  },

  getImageWidth : function() {
    return this.getImage().width;
  },

  getImageHeight : function() {
    return this.getImage().height;
  }

});

Modal.Request = new Class({

  Extends : Modal,

  options : {
    showModalWhenOnRequest : true,
    requestLoadingMessage : 'Loading Please Wait...',
    requestLoadingClassName : 'modal-loading'
  },

  initialize : function(options) {
    this.parent(options);
  },

  hideEverything : function() {
    var req = this.getRequest();
    if(req) {
      req.cancel();
    }
    else {
      this.parent();
    }
  },

  load : function(url,options) {
    this.cancel();
    options = Object.append(options || {},{
      onRequest : this.onRequest.bind(this),
      onCancel : this.onCancel.bind(this),
      onSuccess : function(content) {
        this.onSuccess(content); 
      }.bind(this),
      onFailure : this.onFailure.bind(this),
      url : url
    });

    if(!options.method) {
      options.method = 'GET';
    }

    this.request = new Request(options).send();
  },

  getRequest : function() {
    return this.request;
  },
  
  filterContent : function(html) {
    var response = Elements.from(html);
    var content = response.getElement('.xmodal-content');
    var meta = response.getElement('.xmodal-header');
    var assets = [];
    if(meta) {
      var metaData = meta.get('html').toString();
      metaData = JSON.decode(metaData);
      var jsFiles = metaData['javascripts'];
      var cssFiles = metaData['stylesheets'];
      if(jsFiles.length + cssFiles.length > 0) {
        assets = [jsFiles,cssFiles].flatten();
      }
    }

    return {
      content : content,
      assets : assets
    }
  },

  onSuccess : function(html) {

    if(this.isShowing()) {
      this.getStage().tween('background-color',['#eeeeee','#ffffff']);
    }

    var response = this.filterContent(html);
    var content = response.content;
    var assets = response.assets;

    var stage = this.getStage();
    stage.empty();
    if(typeOf(content) == 'string') {
      stage.set('html',content);
    }
    else {
      stage.adopt(content);
    }

    var C = this.onContentReady.bind(this);
    if(assets.length > 0) {
      Asset.load(assets,{
        onReady : C 
      });
    }
    else {
      C();
    }
  },

  onContentReady : function() {
    var stage = this.getStage();
    if(this.options.showModalWhenOnRequest) {
      var className = this.options.requestLoadingClassName;
      if(className) {
        stage.removeClass(className);
      }
    }

    stage.addClass('stage-ready');

    this.positionInCenter();
    this.showEverything();
    this.fireEvent('requestSuccess',[stage]);
    this.onComplete();
  },

  onRequest : function() {
    var stage = this.getStage();
    if(this.options.showModalWhenOnRequest) {
      var message = this.options.requestLoadingMessage;
      if(this.options.requestLoadingMessage) {
        stage.set('html',message);
      }

      var className = this.options.requestLoadingClassName;
      if(className) {
        stage.addClass(className);
      }

      this.positionInCenter();
      this.showEverything();
    }
    this.fireEvent('requestRequest',[stage]);
  },

  onCancel : function() {
    delete this.request;
    this.hideEverything();
  },

  cancel : function() {
    var req = this.getRequest();
    if(req) {
      req.cancel();
    }
  },

  onFailure : function() {
    this.setContent('unable to load page');
    this.positionInCenter();
    this.showEverything();
    this.fireEvent('requestFailure');
    this.onComplete();
  },

  onComplete : function() {
    delete this.request;
    this.fireEvent('requestComplete');
  }

});

Modal.IFrame = new Class({

  Extends : Modal,

  options : {
    width : 800,
    height : 500
  },

  load : function(url,options) {
    var stage = this.getStage();
    stage.empty();
    var frame = this.getIFrame(url)
    frame.inject(stage);
    this.fireEvent('requestRequest');
  },

  getIFrame : function(url) {
    return new IFrame({
      'src' : url,
      'class' : 'modal-iframe',
      'width' : this.options.width,
      'height' : this.options.height,
      'events' : {
        'load' : function() {
          this.onIFrameLoad();
        }.bind(this)
      }
    });
  },

  onIFrameLoad : function() {
    this.positionInCenter();
    this.showEverything();
    this.fireEvent('requestSuccess');
    this.fireEvent('requestComplete');
    this.onComplete();
  }

});

})(document.id,$$);

