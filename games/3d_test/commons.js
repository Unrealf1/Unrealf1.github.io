const createBasicScene = function (engine, canvas) {
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new BABYLON.Vector3(0,0,5), scene);
    //camera.attachControl(canvas, true);
    var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 0, 0), scene);
    var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1, -1), scene);
    //var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter:2}, scene);
    return scene;
};

function init(canvas, width, height) {
    canvas.width = width;
    canvas.height = height; 
    var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
    var scene = createBasicScene(engine, canvas);
    return [engine, scene]
}

const createBasic2dScene = function (engine, canvas) {
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new BABYLON.Vector3(0,0,5), scene);
    return scene;
};

function init2d(canvas, width, height) {
    canvas.width = width;
    canvas.height = height; 
    var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
    var scene = createBasic2dScene(engine, canvas);
    var screen = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("myScreen");
    screen.isForeground = true;
    return [engine, scene, screen]
}