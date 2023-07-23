var rubiksCube;
var rubiksCubeSolver; 

var buttons = [];
var buttonLabels;

function setup()
{
  //clears previous console log
  clear();

  createCanvas(400, 400);

  rubiksCube = new RCF();
  rubiksCubeSolver = new RCFSolver();

  rubiksCube.solver = rubiksCubeSolver;

  rubiksCubeSolver.rubiksCubeCopy.stickerSize = 9;
  rubiksCubeSolver.rubiksCubeCopy.topLeftX = 205;
  rubiksCubeSolver.rubiksCubeCopy.topLeftY = 205;

  rubiksCube.topLeftX = 5;
  rubiksCube.topLeftY = 5;

  buttonLabels = [
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

  buttons[buttonLabels.indexOf("Scramble")].mouseClicked(
    function()
    {
      loop();
      rubiksCube.scramble();
      noLoop();
    });

  buttons[buttonLabels.indexOf("Solve")].mouseClicked(solve);

  buttons[buttonLabels.indexOf("F")].mouseClicked(function(){rubiksCube.previousStickers = RCF.copy2DArray(rubiksCube.stickers);rubiksCube.rotate(2);rubiksCube.animateRotation(2);});
  buttons[buttonLabels.indexOf("R")].mouseClicked(function(){rubiksCube.previousStickers = RCF.copy2DArray(rubiksCube.stickers);rubiksCube.rotate(3);rubiksCube.animateRotation(3);});
  buttons[buttonLabels.indexOf("U")].mouseClicked(function(){rubiksCube.previousStickers = RCF.copy2DArray(rubiksCube.stickers);rubiksCube.rotate(0);rubiksCube.animateRotation(0);});
  buttons[buttonLabels.indexOf("B")].mouseClicked(function(){rubiksCube.previousStickers = RCF.copy2DArray(rubiksCube.stickers);rubiksCube.rotate(4);rubiksCube.animateRotation(4);});
  buttons[buttonLabels.indexOf("L")].mouseClicked(function(){rubiksCube.previousStickers = RCF.copy2DArray(rubiksCube.stickers);rubiksCube.rotate(1);rubiksCube.animateRotation(1);});
  buttons[buttonLabels.indexOf("D")].mouseClicked(function(){rubiksCube.previousStickers = RCF.copy2DArray(rubiksCube.stickers);rubiksCube.rotate(5);rubiksCube.animateRotation(5);});

  buttons[buttonLabels.indexOf("F'")].mouseClicked(function(){rubiksCube.previousStickers = RCF.copy2DArray(rubiksCube.stickers);rubiksCube.rotate(2, false);rubiksCube.animateRotation(2, false);});
  buttons[buttonLabels.indexOf("R'")].mouseClicked(function(){rubiksCube.previousStickers = RCF.copy2DArray(rubiksCube.stickers);rubiksCube.rotate(3, false);rubiksCube.animateRotation(3, false);});
  buttons[buttonLabels.indexOf("U'")].mouseClicked(function(){rubiksCube.previousStickers = RCF.copy2DArray(rubiksCube.stickers);rubiksCube.rotate(0, false);rubiksCube.animateRotation(0, false);});
  buttons[buttonLabels.indexOf("B'")].mouseClicked(function(){rubiksCube.previousStickers = RCF.copy2DArray(rubiksCube.stickers);rubiksCube.rotate(4, false);rubiksCube.animateRotation(4, false);});
  buttons[buttonLabels.indexOf("L'")].mouseClicked(function(){rubiksCube.previousStickers = RCF.copy2DArray(rubiksCube.stickers);rubiksCube.rotate(1, false);rubiksCube.animateRotation(1, false);});
  buttons[buttonLabels.indexOf("D'")].mouseClicked(function(){rubiksCube.previousStickers = RCF.copy2DArray(rubiksCube.stickers);rubiksCube.rotate(5, false);rubiksCube.animateRotation(5, false);});

  let coordCheckBox = createCheckbox('Index', false);
  coordCheckBox.position(10, buttons[buttonLabels.indexOf("F")].y);
  coordCheckBox.changed(
                          function()
                          {
                            if(!rubiksCube.animating)
                              loop();
                            rubiksCube.showCoord = rubiksCube.showCoord ? false : true;
                            if(!rubiksCube.animating)
                              noLoop();
                          });

  let labelCheckBox = createCheckbox('Label', false);
  labelCheckBox.position(10, buttons[buttonLabels.indexOf("F'")].y);
  labelCheckBox.changed(
                          function()
                          {
                            if(!rubiksCube.animating)
                              loop();
                            rubiksCube.showLabel = rubiksCube.showLabel ? false : true;
                            if(!rubiksCube.animating)
                              noLoop();
                          });

  noLoop();
}

function getRandomInt(max)
{
  return Math.floor(Math.random() * max);
}

/*
function scramble()
{
  loop();
  for(let i = 0; i < 100; i++)
    rubiksCube.rotate(getRandomInt(6));
  noLoop();
}*/

function solve()
{
  loop();
  buttons[2].hide();
  rubiksCube.solve();
  buttons[2].show();
  rubiksCubeSolver.rubiksCubeCopy.show();
  noLoop();
}

function draw()
{
  background(220);
  noSmooth();

  rubiksCube.draw();
  
  rubiksCubeSolver.draw();
}


