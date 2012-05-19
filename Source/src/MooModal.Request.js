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

