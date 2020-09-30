//check if script is loaded.
console.log("initialized");

window.addEventListener("resize", function () {
  var canvas = document.getElementById("mainstage");
  canvas.width = document.getElementById("mainstage").clientWidth;
  canvas.height = document.getElementById("mainstage").clientHeight;
});

//create the starfield when the whole DOM is loaded and we are sure the elements are in place.
document.addEventListener("DOMContentLoaded", function () {
  createStarField();
});

function createStarField() {
  //set watcher on the title and check if mouse is moveing on the header title (which is on the canvas and needs to have its own watcher)
  //set watcher on the mainstage canvas and check if mouse is moving. Also check when the mouse moves off the canvas to stop the sequence.
  document.getElementById("mainstage").onmouseover = function (e) {
    mouseEngaged = true;
    document.getElementById("mainstage").onmousedown = function () {
      mousePressed = true;
    };
    document.getElementById("mainstage").onmouseup = function () {
      mousePressed = false;
    };
    document.getElementById("mainstage").onmousemove = function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY - document.body.scrollTop; //to account for the offset in height.
    };
  };
  //set watcher for mainstage canvas for when the mouse laves the area.
  document.getElementById("mainstage").onmouseout = function () {
    mouseEngaged = false;
  };
  //create variables and set the canvas stage.
  var starArray = [];
  var mouseEngaged = false;
  var mousePressed = false;
  var speedAmplifier = 5;
  var mouseX;
  var mouseY;
  var canvas = document.getElementById("mainstage");
  var context = canvas.getContext("2d");
  //calculate the distances of the canvas and the width we use to determine number of stars.
  calcWidth = document.getElementById("mainstage").clientWidth / 10;
  canvas.width = document.getElementById("mainstage").clientWidth;
  canvas.height = document.getElementById("mainstage").clientHeight;
  //create the stars
  initiateStars(canvas, starArray, calcWidth);
  //start the main loop to keep the canvas updates.
  main();
  var then = Date.now();

  //main look to update positions and render again.
  function main() {
    var now = Date.now();
    var delta = now - then;
    update();
    render();
    then = now;
    requestAnimationFrame(main);
  }

  //update function to keep track of all the stars.
  function update() {
    if (mousePressed === true) {
      if (speedAmplifier < 50) {
        speedAmplifier = speedAmplifier + 0.1;
      }
    } else {
      if (speedAmplifier > 1.1) {
        speedAmplifier = speedAmplifier - 0.1;
      }
    }
    for (k = 0; k < starArray.length; k++) {
      if (mousePressed === true) {
        if (
          //check the distance between the mouse and the star
          mouseX >= starArray[k].x - 500 &&
          mouseX <= starArray[k].x + 500 &&
          mouseY >= starArray[k].y - 500 &&
          mouseY <= starArray[k].y + 500
        ) {
          starArray[k].angle =
            (Math.atan2(mouseY - starArray[k].y, mouseX - starArray[k].x) *
              180) /
              Math.PI -
            90;
        }
      } else {
        if (
          //if the stars are close to the edge, change their direction.
          starArray[k].y < -1 ||
          starArray[k].y > canvas.height + 1 ||
          starArray[k].x < -1 ||
          starArray[k].x > canvas.width + 1
        ) {
          var remainder = starArray[k].angle % 90;
          starArray[k].angle = starArray[k].angle + 90 + remainder;
          starArray[k].startAngle = starArray[k].angle;
        } else {
          starArray[k].angle = starArray[k].startAngle;
        }
        //else, calculate their forwards trajectory with the current angle.
      }
      calculateStarMovement(starArray[k]);
    }
  }

  //render function to draw the canvas when frame is updated.
  function render() {
    var distance = 150;
    //clear the canvas.
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (mouseEngaged === true) {
      drawMousePosition(mouseX, mouseY, context);
      for (n = 0; n < starArray.length; n++) {
        if (
          //check the distance between the mouse and the star
          mouseX >= starArray[n].x - distance &&
          mouseX <= starArray[n].x + distance &&
          mouseY >= starArray[n].y - distance &&
          mouseY <= starArray[n].y + distance
        ) {
          //if they are within the range set, calculate their distance and draw line with color and opacity matching distance and color difference between them.
          var a = mouseX - starArray[n].x;
          var b = mouseY - starArray[n].y;
          //calculate the opacity based on distance.
          var opacity = 1 - (1 / distance) * Math.sqrt(a * a + b * b);
          var red = Math.round((255 + starArray[n].color.red) / 2);
          var green = Math.round((255 + starArray[n].color.green) / 2);
          var blue = Math.round((255 + starArray[n].color.blue) / 2);
          // set color of the line based on the middle value of red, green and blue from the two points.
          context.strokeStyle =
            "rgba(" + red + "," + green + "," + blue + "," + opacity + ")";
          context.beginPath();
          context.moveTo(mouseX, mouseY);
          context.lineTo(starArray[n].x, starArray[n].y);
          context.stroke();
          context.rect(20, 20, 50, 50);
        }
      }
    }
    //Run through the stars
    for (i = 0; i < starArray.length; i++) {
      //draw the stars individual points
      drawSingleStar(starArray[i], context);
    }
    //double for loop to check each star against all the others.
    for (k = 0; k < starArray.length; k++) {
      for (u = 0; u < starArray.length; u++) {
        if (
          //check the distance between the two points
          starArray[k].x >= starArray[u].x - distance &&
          starArray[k].x <= starArray[u].x + distance &&
          starArray[k].y >= starArray[u].y - distance &&
          starArray[k].y <= starArray[u].y + distance &&
          // and make sure it's not the same star
          u != k
        ) {
          //if they are within the range set, calculate their distance and draw line with color and opacity matching distance and color difference between them.
          var a = starArray[k].x - starArray[u].x;
          var b = starArray[k].y - starArray[u].y;
          //calculate the opacity based on distance.
          var opacity = 1 - (1 / distance) * Math.sqrt(a * a + b * b);
          var red = Math.round(
            (starArray[k].color.red + starArray[u].color.red) / 2
          );
          var green = Math.round(
            (starArray[k].color.green + starArray[u].color.green) / 2
          );
          var blue = Math.round(
            (starArray[k].color.blue + starArray[u].color.blue) / 2
          );
          // set color of the line based on the middle value of red, green and blue from the two points.
          context.strokeStyle =
            "rgba(" + red + "," + green + "," + blue + "," + opacity + ")";
          context.beginPath();
          context.lineWidth = 3;
          context.moveTo(starArray[k].x, starArray[k].y);
          context.lineTo(starArray[u].x, starArray[u].y);
          context.stroke();
        }
      }
    }
  }

  //calculate the movement forward based on angle and speed.
  function calculateStarMovement(target) {
    //if mouse is pressed.
    if (mousePressed === true) {
      if (
        mouseX >= target.x - 500 &&
        mouseX <= target.x + 500 &&
        mouseY >= target.y - 500 &&
        mouseY <= target.y + 500
      ) {
        target.x -=
          target.speed *
          speedAmplifier *
          Math.sin(target.angle * (Math.PI / 180));
        target.y +=
          target.speed *
          speedAmplifier *
          Math.cos(target.angle * (Math.PI / 180));
      } else {
        target.x -= target.speed * Math.sin(target.angle * (Math.PI / 180));
        target.y += target.speed * Math.cos(target.angle * (Math.PI / 180));
      }
      //if the mouse is not pressed
    } else {
      if (
        mouseX >= target.x - 500 &&
        mouseX <= target.x + 500 &&
        mouseY >= target.y - 500 &&
        mouseY <= target.y + 500
      ) {
        target.x -=
          target.speed *
          speedAmplifier *
          Math.sin(target.angle * (Math.PI / 180));
        target.y +=
          target.speed *
          speedAmplifier *
          Math.cos(target.angle * (Math.PI / 180));
      } else {
        target.x -= target.speed * Math.sin(target.angle * (Math.PI / 180));
        target.y += target.speed * Math.cos(target.angle * (Math.PI / 180));
      }
    }
  }

  //draw the mouse position as a star on the canvas.
  function drawMousePosition(mouseX, mouseY, context) {
    context.fillStyle = "rgba(" + 255 + "," + 255 + "," + 255 + "," + 0.2 + ")";
    context.beginPath();
    context.arc(mouseX, mouseY, 5, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
  }

  //draw a single star.
  function drawSingleStar(star, context) {
    context.fillStyle =
      "rgba(" +
      star.color.red +
      "," +
      star.color.green +
      "," +
      star.color.blue +
      "," +
      0.2 +
      ")";
    context.beginPath();
    context.arc(star.x, star.y, 5, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
  }

  function initiateStars(canvas, starArray, calcWidth) {
    //set color profiles for the stars.
    //var starColors = [{ red: 255, green: 255, blue: 255 }];
    var starColors = [];
    //try to get color from the css stylesheet and set the color profile for stars after it.
    try {
      var style = getComputedStyle(document.body).getPropertyValue(
        "--primaryHeaderColor"
      );
      style = style.replace("rgb(", "");
      style = style.replace(")", "");
      style = style.split(" ").join("");
      var colors = style.split(",");
      var starColor = {
        red: parseInt(colors[0]),
        green: parseInt(colors[1]),
        blue: parseInt(colors[2])
      };
      starColors.push(starColor);
      var secondColor = {
        red: 0,
        green: 0,
        blue: 255
      };
      starColors.push(secondColor);
    } catch (err) {
      //if that cant be found, fallback to cyan (as is done in the stylesheet)
      var starColor = {
        red: 128,
        green: 0,
        blue: 255
      };
      starColors.push(starColor);
    }
    //generate number of star objects with variables based on the calcWidth variable.
    for (y = 0; y < calcWidth; y++) {
      var starAngle = Math.floor(Math.random() * 360) + 0;
      var star = {
        x: Math.floor(Math.random() * canvas.width) + 0,
        y: Math.floor(Math.random() * canvas.height) + 0,
        color: starColors[Math.floor(Math.random() * starColors.length) + 0],
        angle: starAngle,
        startAngle: starAngle,
        speed: (Math.floor(Math.random() * 12) + 6) / 15
      };
      starArray.push(star);
    }
  }
}
