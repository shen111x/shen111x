function main(){
  let CVD = null; // return of Canvas2DDisplay

  JEELIZFACEFILTER.init({
    canvasId: 'jeeFaceFilterCanvas',
    NNCPath: '../../../neuralNets/', // root of NN_DEFAULT.json file
    callbackReady: function(errCode, spec){
      if (errCode){
        console.log('AN ERROR HAPPENS. SORRY BRO :( . ERR =', errCode);
        return;
      }

      console.log('INFO: JEELIZFACEFILTER IS READY');
      CVD = JeelizCanvas2DHelper(spec);
      CVD.ctx.lineWidth = 50;
      CVD.ctx.strokeStyle = "#000000";
      CVD.ctx.fillStyle = "#000000";
      
      
    },

    // called at each render iteration (drawing loop):
    callbackTrack: function(detectState){ 
        if (detectState.detected > 0.8){
          const faceCoo = CVD.getCoordinates(detectState);
          CVD.ctx.clearRect(0, 0, CVD.canvas.width, CVD.canvas.height);

          const trailElement = document.createElement("div");
          trailElement.className = "trail";
          trailElement.style.left = faceCoo.x + "px";
          trailElement.style.top = faceCoo.y + "px";
          document.body.appendChild(trailElement);

           // 移除多余的轨迹元素
          const trailElements = document.querySelectorAll(".trail");
          if (trailElements.length > 100) {
          document.body.removeChild(trailElements[0]);
          }

        // draw a border around the face:
        //
        //CVD.ctx.clearRect(0, 0, CVD.canvas.width, CVD.canvas.height);
        //CVD.ctx.strokeRect(faceCoo.x, faceCoo.y, faceCoo.w, faceCoo.h);
        //CVD.ctx.fillRect(faceCoo.x, faceCoo.y, faceCoo.w, faceCoo.h);
        CVD.update_canvasTexture();
      }
      CVD.draw();
    }
  }); //end JEELIZFACEFILTER.init call
} //end main()


window.addEventListener('load', main);
