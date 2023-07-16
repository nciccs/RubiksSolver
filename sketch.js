
var rubiksCube = new RCF();
var rubiksCubeSolver = new RCFSolver();

var buttons = [];
var buttonLabels;

function setup()
{
  clear();
  //clears previous console log
  createCanvas(400, 400);

  rubiksCube.solver = rubiksCubeSolver;

  rubiksCubeSolver.rubiksCubeCopy.stickerSize = 9;
  rubiksCubeSolver.rubiksCubeCopy.topLeftX = 210;
  rubiksCubeSolver.rubiksCubeCopy.topLeftY = 210;
  //rubiksCubeSolver.rubiksCubeCopy.hide();

  rubiksCube.topLeftX = 20;
  rubiksCube.topLeftY = 20;
  //rubiksCube.rotate(0);
  //rubiksCube.print();

  //Need these 14 buttons:
  //scramble reset
  //F  R  U  B  L  D
  //F' R' U' B' L' D'

  buttonLabels = [//"Scramble", "Reset", "Solve",
                  "Superflip",
                  "Reset", "Scramble", "Solve",
                     //button arrangement from online simulator is not very good!
                     //"F", "R", "U", "B", "L", "D",
                     //"F'", "R'", "U'", "B'", "L'", "D'"
                      "F", "B", "L", "R", "U", "D",
                      "F'", "B'", "L'", "R'", "U'", "D'"
                    ];

  for(let i = 0; i < buttonLabels.length; i++)
    buttons.push(createButton(buttonLabels[i]));

  buttons[buttonLabels.indexOf("Superflip")].position(width*0.05, height - buttons[buttonLabels.indexOf("Superflip")].height * 4.5);
  buttons[buttonLabels.indexOf("Reset")].position(width*0.25, height - buttons[buttonLabels.indexOf("Reset")].height * 4.5);
  buttons[buttonLabels.indexOf("Scramble")].position(width*0.4, height - buttons[buttonLabels.indexOf("Scramble")].height * 4.5);
  buttons[buttonLabels.indexOf("Solve")].position(width*0.6, height - buttons[buttonLabels.indexOf("Solve")].height * 4.5);

  //buttons[buttonLabels.indexOf("Superflip")].hide();
  
  let buttonStartX = width * 0.2;
  let buttonStartY = height - buttons[3].height * 3;
  let buttonSpaceX = width * 0.1;

  let buttonStartIndex = buttonLabels.indexOf("F");
  let numRotationButtons = 6;
  for(let i = buttonStartIndex; i < buttonStartIndex+numRotationButtons; i++)
     buttons[i].position(buttonStartX + buttonSpaceX * (i-buttonStartIndex), buttonStartY);

  buttonStartIndex += 6;
  buttonStartY = height - buttons[buttonStartIndex].height * 1.5;
  for(let i = buttonStartIndex; i < buttonStartIndex+numRotationButtons; i++)
     buttons[i].position(buttonStartX + buttonSpaceX * (i-buttonStartIndex), buttonStartY);

  buttons[buttonLabels.indexOf("Superflip")].mouseClicked(
    function()
    {
      loop();
      rubiksCube.superflip();
      noLoop();
    });

  buttons[buttonLabels.indexOf("Reset")].mouseClicked(
    function()
    {
      loop();
      rubiksCube.resetStickers();
      noLoop();
    });

  buttons[buttonLabels.indexOf("Scramble")].mouseClicked(scramble);

  buttons[buttonLabels.indexOf("Solve")].mouseClicked(solve);

  
  buttons[buttonLabels.indexOf("F")].mouseClicked(function(){loop();rubiksCube.rotate(2);noLoop();});
  buttons[buttonLabels.indexOf("R")].mouseClicked(function(){loop();rubiksCube.rotate(3);noLoop();});
  buttons[buttonLabels.indexOf("U")].mouseClicked(function(){loop();rubiksCube.rotate(0);noLoop();});
  buttons[buttonLabels.indexOf("B")].mouseClicked(function(){loop();rubiksCube.rotate(4);noLoop();});
  buttons[buttonLabels.indexOf("L")].mouseClicked(function(){loop();rubiksCube.rotate(1);noLoop();});
  buttons[buttonLabels.indexOf("D")].mouseClicked(function(){loop();rubiksCube.rotate(5);noLoop();});

  buttons[buttonLabels.indexOf("F'")].mouseClicked(function(){loop();rubiksCube.rotate(2, false);noLoop();});
  buttons[buttonLabels.indexOf("R'")].mouseClicked(function(){loop();rubiksCube.rotate(3, false);noLoop();});
  buttons[buttonLabels.indexOf("U'")].mouseClicked(function(){loop();rubiksCube.rotate(0, false);noLoop();});
  buttons[buttonLabels.indexOf("B'")].mouseClicked(function(){loop();rubiksCube.rotate(4, false);noLoop();});
  buttons[buttonLabels.indexOf("L'")].mouseClicked(function(){loop();rubiksCube.rotate(1, false);noLoop();});
  buttons[buttonLabels.indexOf("D'")].mouseClicked(function(){loop();rubiksCube.rotate(5, false);noLoop();});
  
  let coordCheckBox = createCheckbox('Index', false);
  coordCheckBox.position(10, buttons[buttonLabels.indexOf("F")].y);
  coordCheckBox.changed(function(){loop();rubiksCube.showCoord = rubiksCube.showCoord ? false : true;noLoop();});

  let labelCheckBox = createCheckbox('Label', false);
  labelCheckBox.position(10, buttons[buttonLabels.indexOf("F'")].y);
  labelCheckBox.changed(function(){loop();rubiksCube.showLabel = rubiksCube.showLabel ? false : true;noLoop();});

  noLoop();
}

function getRandomInt(max)
{
  return Math.floor(Math.random() * max);
}

function scramble()
{
  loop();
  //rubiksCubeSolver.rubiksCubeCopy.hide();
  for(let i = 0; i < 100; i++)
    rubiksCube.rotate(getRandomInt(6));
  noLoop();
}


function solve()
{
  loop();
  buttons[2].hide();
  //console.clear();
  rubiksCube.solve();
  buttons[2].show();
  rubiksCubeSolver.rubiksCubeCopy.show();
  noLoop();
}

function draw()
{
  background(220);

  rubiksCube.draw();
  
  rubiksCubeSolver.draw();
}


