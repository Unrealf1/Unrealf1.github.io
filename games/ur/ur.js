function main() {
    const canvas = document.querySelector("#glCanvas");
    var width = window.innerWidth * 0.5;
    var height = window.innerHeight - 20;
    var app = init(canvas, width, height)
    let gameContext = {
      app: app,
      width: width,
      height: height
    }
}
  
window.onload = main;