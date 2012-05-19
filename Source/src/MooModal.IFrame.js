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
