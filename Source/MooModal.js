/*
---
description: MooModal is a useful modal script for MooTools.

license: MIT License http://www.opensource.org/licenses/mit-license.php

authors:
- Matias Niemelä (matias [at] yearofmoo [dot] com)

home:
- http://www.yearofmoo.com/MooModal

requires:
- core
- more (Class.Binds, Fx.Scroll, Fx.Reveal)
- MooModal.css

provides: 
- MooModal
- MooModal.Image
- MooModal.Request
- MooModal.IFrame

*/
/**
 * Copyright (C) 2012 by Matias Niemela
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var MooModal = new Class;

MooModal.extend({

  instances : {},

  getInstance : function(id) {
    return this.instances[id];
  },

  getInstances : function() {
    return this.instances;
  },

  instance : function(instance) {
    return instanceOf(instance,MooModal) ? instance : this.getInstance(instance);
  },

  registerInstance : function(instance) {
    this.instances[instance.getID()]=instance;
  },

  destroyInstance : function(instance) {
    instance = this.instance(instance);
    var id = instance.getID();
    delete this.instances[id];
    instance.destroy();
  },

  onBeforeShow : function(instance,fn) {
    instance.isShowing() ? fn() : this.hideAll(fn);
  },

  hideAll : function(fn) {
    var visible = this.getVisibleInstance();
    if(visible) {
      visible.addEvent('afterHide:once',fn);
      visible.dissolve();
    }
    else {
      fn();
    }
  },

  getVisibleInstance : function() {
    var instances = this.getInstances();
    for(var i in instances) {
      var instance = instances[i];
      if(instance.isShowing()) {
        return instance;
      }
    }
  },

  onResize : function() {

  },

  onScroll : function() {
  }

});

MooModal.Overlay = new new Class({

  Binds : ['onClick','onHide','onShow','show','hide','onAnimationComplete'],

  Implements : [Options, Events],

  options : {
    elementOptions : {
      'class' : 'MooModal-overlay',
      'styles' : {
        'position':'fixed',
        'z-index' : 1000,
        'background-color':'#000000'
      }
    },
    animationOptions : {
      link : 'cancel',
      dissolve : {
        opacity : 0
      },
      reveal : {
        opacity : [0,0.5]
      }
    },
    fxOptions : {

    }
  },

  init : function(options) {
    this.defaultOptions = Object.clone(this.options);
    this.events = {};
    this.setOptions(options);
    this.build();
    this.setupEvents();
    this.setOpacity(0);
    this.hide();
    this.init = function() {};
  },

  getDefaultOptions : function() {
    return this.defaultOptions;
  },

  setup : function(options) {
    this.setOptions(options);
    this.getElement().set(this.options.elementOptions);
  },

  focusOn : function(instance) {
    this.activeInstance = instance;
    this.setup(instance.overlayOptions);
  },

  getActiveInstance : function() {
    return this.activeInstance;
  },

  build : function() {
    this.element = new Element('div').set(this.options.elementOptions).inject(document.body);
  },

  setupEvents : function() {
    this.getElement().addEvents({
      'click':this.onClick
    });
  },

  onClick : function(event) {
    event.stop();
    this.dissolve();
  },

  getElement : function() {
    return this.element;
  },

  getAnimator : function() {
    if(!this.animator) {
      this.animator = new Fx.Morph(this.getElement(),this.options.fxOptions);
      this.animator.addEvents({
        'complete':this.onAnimationComplete
      });
    }
    return this.animator;
  },

  toElement : function() {
    return this.getElement();
  },

  show : function() {
    this.onBeforeShow();
    var styles = Object.clone(this.options.animationOptions.reveal);
    styles.opacity = this.parseEndOpacity(styles.opacity);
    styles.display = 'block';
    this.getElement().setStyles(styles);
    this.onShow();
    this.onAfterShow();
  },

  hide : function() {
    this.onBeforeHide();
    var styles = Object.clone(this.options.animationOptions.dissolve);
    styles.opacity = this.parseEndOpacity(styles.opacity);
    this.getElement().setStyles(styles);
    this._hide();
    this.onHide();
    this.onAfterHide();
  },

  _hide : function() {
    this.getElement().setStyle('display','none');
  },

  _show : function() {
    this.getElement().setStyle('display','block');
  },

  dissolve : function(options) {
    this.onBeforeHide();
    this.transform('dissolve',options || this.options.animationOptions.dissolve);
  },

  onDissolveComplete : function() {
    this.onHide();
    this._hide();
    this.onAfterHide();
  },

  reveal : function(options) {
    this.onBeforeShow();
    options = options || this.options.animationOptions.reveal;
    if(this.isVisible()) {
      options.opacity = this.parseEndOpacity(options.opacity);
    }
    else {
      this._show();
    }
    this.transform('reveal',options).chain(function() {
    }.bind(this));
  },

  onRevealComplete : function() {
    this.onShow();
    this._show();
    this.onAfterShow();
  },

  transform : function(direction,options) {
    this.setAnimationDirection(direction);
    return this.getAnimator().start(options);
  },

  getAnimationDirection : function() {
    return this.animationDirection;
  },

  setAnimationDirection : function(dir) {
    this.animationDirection = dir;
  },

  getOpacity : function() {
    return this.getElement().getStyle('opacity');
  },

  setOpacity : function(o) {
    this.getElement().setStyle('opacity',0);
  },

  parseEndOpacity : function(opacity) {
    return typeOf(opacity) == 'array' ? opacity.getLast() : opacity;
  },

  isVisible : function() {
    return this.getElement().getStyle('display') == 'block';
  },

  isHidden : function() {
    return ! this.isVisible();
  },

  position : function() {
    this.getElement().setStyles({
      'top':0,
      'left':0,
      'right':0,
      'bottom':0
    });
  },

  onAnimationComplete : function() {
    switch(this.getAnimationDirection()) {
      case 'reveal':
        this.onRevealComplete();
      break;
      case 'dissolve':
        this.onDissolveComplete();
      break;
    }
  },

  onHide : function() {
    this.fireEvent('hide');
    this.fireInstanceEvent('hide');
  },

  onAfterHide : function() {
    this.fireEvent('afterHide');
    this.fireInstanceEvent('afterHide');
  },

  onBeforeHide : function() {
    this.fireEvent('beforeHide');
    this.fireInstanceEvent('beforeHide');
  },

  onShow : function() {
    this.fireEvent('show');
    this.fireInstanceEvent('show');
  },

  onAfterShow : function() {
    this.fireEvent('afterShow');
    this.fireInstanceEvent('afterShow');
  },

  onBeforeShow : function() {
    this.fireEvent('beforeShow');
    this.fireInstanceEvent('beforeShow');
  },

  fireInstanceEvent : function(event,id) {
    try {
      this.getInstanceEvents(id)[event].call();
    }
    catch(e){};
  },

  getInstanceEvents : function(id) {
    try {
      id = id || this.getActiveInstance().id;
      return this.events[id] || {};
    }
    catch(e) {};
  },

  registerEvents : function(instance,events) {
    this.events[instance.getID()] = events;
  }

});

MooModal.implement({

  Binds : ['onContentReady','show','hide','reveal','dissolve'],

  Implements : [Options, Events],

  options : {
    className : 'modal',
    width : 700,
    height : 500,
    zIndex : 2000,
    closeMooModalGraphic : true,
    overlay : true,
    escapeKeyActsAsHide : true,
    hidePositions : {
      x : -9999,
      y : -9999
    },
    overlayOptions : {

    },
    fxOptions : {
      transition: 'circ:in',
      link:'cancel'
    },
    loadingOptions : {

    }
  },

  initialize : function(options) {
    this.setOptions(options);

    MooModal.registerInstance(this);
    MooModal.Overlay.init();

    this.build();
    this.getContainer().store('MooModal',this);
    this.setupEvents();
    this.resize();
    this.hide();
  },

  build : function() {
    this.buildElement();
    this.buildOverlay();
    this.buildStage();
  },

  buildOverlay : function() {
    if(!this.options.overlayOptions) {
      this.options.overlayOptions = MooModal.Overlay.getDefaultOptions();
    }
    else {
      MooModal.Overlay.setup(this.options.overlayOptions);
    }
  },

  buildElement : function() {
    var klass = this.options.className;
    this.container = new Element('div',{
      'class' : klass + ' ' + klass + '-container',
      'styles':{
        'position':'absolute',
        'z-index' : this.options.zIndex
      }
    }).inject(document.body);
  },

  buildStage : function() {
    var klass = this.options.className;
    this.stage = new Element('div',{
      'class': klass + '-stage',
      'styles':{
        'left':0,
        'right':0,
        'top':0,
        'bottom':0
      }
    }).inject(this.container);

    this.closeMooModal = new Element('div',{
      'class': klass + '-close',
      'styles':{
        'position':'absolute'
      },
      'events':{
        'click':this.hideEverything.bind(this)
      }
    }).inject(this.container,'inside');
  },

  setupEvents : function() {
    window.addEvent('keydown',function(event) {
      if(this.options.escapeKeyActsAsHide) {
        var key = event.key;
        if(key == 'esc') {
          event.stop();
          this.hideEverything();
        }
      }
    }.bind(this));

    this.getOverlay().registerEvents(this,{
      beforeHide : this.dissolve
    });
  },

  getID : function() {
    if(!this.id) {
      var rand = Number.random(0,1000);
      this.id = 'MooModal-' + (new Date().getTime()) + '-' + rand;
    }
    return this.id;
  },

  position : function(x,y) {
    this.getContainer().setStyles({
      'left' : x,
      'top' : y
    });
  },

  positionAtTop : function(y) {
    y = y || 100;
    var w = this.getWidth();
    var sc = window.getScrollSize();
    var wc = window.getSize();
    var x = Math.floor((sc.x - w)/2);
    this.position(x,y);
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

  disableOverlay : function() {
    this.options.overlay = false;
  },

  enableOverlay : function() {
    this.options.overlay = true;
  },

  getOverlay : function() {
    return MooModal.Overlay;
  },

  showOverlay : function(fast) {
    MooModal.Overlay.focusOn(this);
    var overlay = this.getOverlay();
    overlay.position();
    overlay[fast ? 'show' : 'reveal'](this.options.overlayOptions.reveal);
  },

  hideOverlay : function(fast) {
    this.getOverlay()[fast ? 'hide' : 'dissolve'](this.options.overlayOptions.dissolve);
  },

  setHeight : function(height) {
    this.resize(this.getWidth(),height);
  },

  setWidth : function(width) {
    this.resize(width,this.getHeight());
  },

  resize : function(width,height) {
    width = width || this.options.width;
    height = height || this.options.height;
    this.getContainer().setStyles({
      width : width
      //height : height
    });
    this.positionInCenter();
  },

  getDimensions : function() {
    return this.toElement().getDimensions();
  },

  getAnimator : function() {
    if(!this.animator) {
      this.animator = new Fx.Morph(this.container,this.options.fxOptions);
    }
    return this.animator;
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
    var stage = this.getStage();
    var className = 'modal-loading';
    if(bool) {
      stage.addClass(className);
    }
    else {
      stage.removeClass(className);
    }
  },


  hideEverything : function(fast) {
    fast ? this.hide : this.dissolve();
    fast = !fast && !this.options.overlay;
    this.hideOverlay(fast);
  },

  hide : function() {
    this.onBeforeHide();
    this.getContainer().setStyle('display','none');
    this.position(this.options.hidePositions.x,this.options.hidePositions.y);
    this.onAfterHide();
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
    this.onBeforeShow();
    this.getContainer().setStyles({
      'opacity':1,
      'display':'block'
    });
    this.onAfterShow();
  },

  prepareAndShow : function(fn) {
    MooModal.onBeforeShow(this,fn);
  },

  reveal : function() {
    this.prepareAndShow(function() {
      this.getAnimator().set({
        'opacity' : 0,
        'display' : 'block'
      }).start({
        'opacity' : 1
      }).chain(this.show);
    }.bind(this));
  },

  dissolve : function() {
    this.getAnimator().start({
      'opacity' : 0
    }).chain(this.hide);
  },

  showEverything : function() {
    if(this.options.overlay) {
      this.showOverlay();
    }
    else {
      this.hideOverlay(true);
    }
    this.reveal();
  },

  showAndPosition : function() {
    this.positionInCenter();
    this.showEverything();
  },

  onBeforeShow : function() {
    this.fireEvent('beforeShow',[this]);
  },

  onBeforeHide : function() {
    this.fireEvent('beforeHide',[this]);
  },

  onAfterShow : function() {
    this.fireEvent('afterShow',[this]);
  },

  onAfterHide : function() {
    this.fireEvent('afterHide',[this]);
  },

  destroy : function() {
    this.destroy = function() { };
    this.getStage().destroy();
    this.getContainer().destroy();
    this.getOverlay().destroy();
    MooModal.destroyInstance(this);
  }

}); 
MooModal.Image = new Class({

  Extends : MooModal,

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
      this.resize(this.getImageWidth(),this.getImageHeight());
      this.showEverything();
      return;
    }
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
MooModal.Request = new Class({

  Extends : MooModal,

  options : {
    showMooModalWhenOnRequest : true,
    requestLoadingMessage : 'Loading Please Wait...',
    requestLoadingClassName : 'modal-loading'
  },

  initialize : function(options) {
    this.parent(options);
  },

  onBeforeHide : function() {
    var req = this.getRequest();
    if(req) {
      req.cancel();
    }
    this.parent();
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
    var xview = new XView(html);
    return {
      content : xview.getContent(),
      assets : xview.getAssets()
    }
  },

  onSuccess : function(html) {

    if(this.isShowing()) {
      this.getStage().tween('background-color',['#eeeeee','#ffffff']);
    }

    var response = this.filterContent(html);

    var content = response.content;
    var stage = this.getStage();
    stage.empty();
    if(typeOf(content) == 'string') {
      stage.set('html',content);
    }
    else {
      stage.adopt(content);
    }

    var assets = response.assets;
    if(assets.length > 0) {
      Asset.load(assets,{
        onReady : this.onContentReady
      });
    }
    else {
      this.onContentReady();
    }
  },

  onContentReady : function() {
    var stage = this.getStage();
    if(this.options.showMooModalWhenOnRequest) {
      var className = this.options.requestLoadingClassName;
      if(className) {
        stage.removeClass(className);
      }
    }

    stage.addClass('stage-ready');
    this.showAndPosition();
    this.fireEvent('requestSuccess',[stage]);
    this.onComplete();
  },

  onRequest : function() {
    var stage = this.getStage();
    if(this.options.showMooModalWhenOnRequest) {
      var message = this.options.requestLoadingMessage;
      if(this.options.requestLoadingMessage) {
        stage.set('html',message);
      }

      var className = this.options.requestLoadingClassName;
      if(className) {
        stage.addClass(className);
      }

      this.showAndPosition();
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
    this.showAndPosition();
    this.fireEvent('requestFailure');
    this.onComplete();
  },

  onComplete : function() {
    delete this.request;
    this.fireEvent('requestComplete');
  }

});

MooModal.IFrame = new Class({

  Extends : MooModal,

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
