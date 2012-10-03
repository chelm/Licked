var app = {
    initialize: function() {
        this.bind();
    },
    bind: function() {
        document.addEventListener('deviceready', this.deviceready, false);
    },
    deviceready: function() {
        //window.onorientationchange = function() { app.doOnOrientationChange(); };
        // note that this is an event handler so the scope is that of the event
        // so we need to call app.report(), and not this.report()
        //app.report('deviceready');
        app.pictureSource = navigator.camera.PictureSourceType;
        app.destinationType = navigator.camera.DestinationType;

        app.canvas = new fabric.Canvas('photo');
        app.canvas.CANVAS_HEIGHT = 430;
        app.canvas.CANVAS_WIDTH = 340;
        app.bgImg = null;
        app.oImg = null;

        window.halo = fabric.Image.fromURL('img/halo.png', function(img) {
          app.oImg = img.set({ left: 165, top: 85, angle: 5, active:true })
          app.canvas.add(app.oImg);
        });

    },
    report: function(id) { 
      console.log("report:" + id );
    },
    touchMove: function(event) {
      // Prevent scrolling on this element
      event.preventDefault();
    },
    show: function(id){
      var showElem = document.querySelector('#' + id );
      showElem.className = showElem.className.split('hide').join('');
    },
    hide: function(id){
      document.querySelector('#' + id ).className += ' hide';
    },
    capturePhoto: function(){
      navigator.camera.getPicture( app.onSuccess, app.onFail, {
        quality: 50,
        allowEdit: true,
        destinationType: app.destinationType.FILE_URI
      });
    },
    getPhoto: function(){
      navigator.camera.getPicture( app.onSuccess, app.onFail, { 
        quality: 50, 
        destinationType: app.destinationType.FILE_URI,
        sourceType: app.pictureSource.PHOTOLIBRARY
      });
    },
    onSuccess: function( imageData ) {
      if (imageData){
        app.imageData = imageData;
        app.hide('landing');
        app.show('photo_page');
        app.canvas.clear();
        app.bg = fabric.Image.fromURL(imageData, function(img) {
          app.bgImg = img.set({ left: 160, top: 215, active:false, selectable:false});
          app.bgImg.scaleToWidth(330);
          app.canvas.insertAt(app.bgImg, 0);
        });
      } else {
        $('#trash').trigger('click');
      }
    },
    onFail: function(message) {
      app.show('landing');
      app.hide('photo_page');
      app.canvas.clear();
      setTimeout(function(){
        window.halo = fabric.Image.fromURL('images/halo.png', function(img) {
          app.oImg = img.set({ left: 165, top: 75, angle: 5, active:true })
          app.canvas.add(app.oImg);
        });
      }, 200);
      //$('#trash').trigger('click');
    },
    addHalo: function(){
      app.canvas.deactivateAll()
      fabric.Image.fromURL('img/halo.png', function(img) {
        app.oImg = img.set({ left: 160, top: 125, angle: 5, active:true })
        app.canvas.add(app.oImg);
      });
      $('#image_bar').show();
      return true;
    },
    removeHalo: function(){
      app.canvas.remove( app.canvas.getActiveObject() );
      if (!app.canvas.getActiveObject()) $('image_bar').hide();
      return true;
    },
    share: function(){
      var as = new ActionSheet();
      
      as.create(null, ['Send in message', 'Save as image', 'Cancel'], function(buttonValue, buttonIndex) {
        switch (arguments[1]) {
          case 0:
            app.sendMessage();
            break;
          case 1:
            app.savePhoto();
            break;
        }
          //console.warn('create(), arguments=' + Array.prototype.slice.call(arguments).join(', '));
      }, {cancelButtonIndex: 2});
    },
    savePhoto: function(){
      app.canvas.deactivateAll();
      cordova.exec("SaveImage.saveImage", app.canvas.toDataURL("image/png").replace('data:image/png;base64,', ''));
      return true;
    },
    sendMessage: function() {
      var args;
      var sms = new SMSComposer();
      cordova.exec(null,null, 'SMSComposer','showSMSComposer',[{ body: app.imageData }]);
    },
    wipe: function(){
      app.canvas.clear();
    },
    cancel: function(){
      //app.show('landing');
      //app.hide('photo_page');
      /*if (app.canvas && app.canvas.item){ 
        try {
          app.canvas.clear();
          setTimeout(function(){
            window.halo = fabric.Image.fromURL('images/halo.png', function(img) {
              app.oImg = img.set({ left: 165, top: 75, angle: 5, active:true })
              app.canvas.add(app.oImg);
            });
          }, 200);
        } catch(e){ }
      }*/
      var as = new ActionSheet();

      as.create(null, ['Delete Image', 'Cancel'], function(buttonValue, buttonIndex) {
        switch (arguments[1]) {
          case 0:
              app.show('landing');
              app.hide('photo_page');
              app.canvas.clear();
            break;
        }
          //console.warn('create(), arguments=' + Array.prototype.slice.call(arguments).join(', '));
      }, {destructiveButtonIndex:0, cancelButtonIndex: 1});
    }
};
