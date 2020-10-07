function main() {
    const canvas = document.querySelector("#glCanvas");
    const [engine, scene, screen] = init2d(canvas, 900, 700)

    var rect1 = new BABYLON.GUI.Ellipse();
    rect1.width = "100px";
    rect1.height = "100px";
    rect1.color = "Orange";
    rect1.thickness = 4;
    rect1.background = "green";
    screen.addControl(rect1);    
    console.log(Object.keys(rect1))
    engine.runRenderLoop(function () {
        scene.render();
        rect1.left += 1
    });
    window.addEventListener("resize", function () {
            engine.resize();
    });
  }
  
  window.onload = main;