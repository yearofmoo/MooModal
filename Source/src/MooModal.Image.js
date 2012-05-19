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
