class RCFSolver
{
  static moveLabels = [
                        "U", "U'", 
                        "L", "L'", 
                        "F", "F'", 
                        "R", "R'", 
                        "B", "B'", 
                        "D", "D'"
                      ];

  static moves = [
                  [0, true],
                  [0, false],

                  [1, true],
                  [1, false],

                  [2, true],
                  [2, false],

                  [3, true],
                  [3, false],

                  [4, true],
                  [4, false],

                  [5, true],
                  [5, false],
                ];

  static undoMoves =  [
                        [0, false],
                        [0, true],

                        [1, false],
                        [1, true],

                        [2, false],
                        [2, true],

                        [3, false],
                        [3, true],

                        [4, false],
                        [4, true],

                        [5, false],
                        [5, true],
                      ];

  constructor()
  {
    this.rubiksCube = null;
    this.rubiksCubeCopy = new RCF();
    this.rubiksCubeCopy.faceBorder = 1;
  }

  static getMoveIndex(faceIndex, clockwise)
  {
    return faceIndex * 2 + (clockwise ? 0 : 1);
  }

  static applyMoves(cube, moves)
  {
    for(let i = 0; moves && i < moves.length; i++)
    {
      RCFSolver.move(cube, moves[i]);
    }
  } 

  static applyUndoMoves(cube, moves)
  {
    for(let i = moves.length-1; i >= 0; i--)
    {
      RCFSolver.undoMove(cube, moves[i]);
    }
  }

  getMoveIndex(faceIndex, clockwise)
  {
    return RCFSolver.getMoveIndex(faceIndex, clockwise);
  }

  static move(cube, index)
  {
    cube.rotate(RCFSolver.moves[index][0], RCFSolver.moves[index][1]);
  }
  
  static undoMove(cube, index)
  {
    cube.rotate(RCFSolver.undoMoves[index][0], RCFSolver.undoMoves[index][1]);
  }

  solve(rubiksCube)
  {
    //alert("Work in progress");

    if(rubiksCube)
    {
      //Basically created and used a duplicate cube
      RCF.copyStickers(rubiksCube, this.rubiksCubeCopy);

      let goal = [];
      let resultStages = [];

      //solve top cross
      this.solveTopCross(goal, resultStages);

      //solve top corners
      this.solveTopCorners(goal, resultStages);

      //solve second layer
      this.solveMiddleEdges(goal, resultStages);

      //solve bottom cross
      //solve corner positions
      //solve corner orientations

      this.outputResultStages(resultStages);
    }
  }

  solveTopCross(goal, resultStages)
  {
    //white cross face
    let crossGoals = [
                        [0, 1, this.rubiksCubeCopy.stickers[1][1] ],
                        [1, 2, this.rubiksCubeCopy.stickers[1][1] ],
                        [2, 1, this.rubiksCubeCopy.stickers[1][1] ],
                        [1, 0, this.rubiksCubeCopy.stickers[1][1] ],
                    ];

    //cross' edge connected stickers
    let edgeGoals = [
                      [0, 13, this.rubiksCubeCopy.stickers[1][13] ],
                      [0, 10, this.rubiksCubeCopy.stickers[1][10] ],
                      [0, 7, this.rubiksCubeCopy.stickers[1][7] ],
                      [0, 4, this.rubiksCubeCopy.stickers[1][4] ],
                    ];
    let i = 0;
    for(let i = 0; i < 4; i++)
    {
      goal.push(crossGoals[i]);
      goal.push(edgeGoals[i]);

      let result;

      result = RCFSearch.bfs(this.rubiksCubeCopy, goal, 3);
      if(result.length == 0)
        result = RCFSearch.depthFirstSearch(this.rubiksCubeCopy, goal, 5);

      RCFSolver.applyMoves(this.rubiksCubeCopy, result);
      resultStages.push(result);
    }
  }

  solveTopCorners(goal, resultStages)
  {
    //For each face:
    let i = 1;
    for(let i = 1; i <= 4; i++)
    {
      this._solveTopCorner(goal, resultStages, i);
    }
  }

  _solveTopCorner(goal, resultStages, faceIndex)
  {
    //rubiksCube is original cube to solve that's got certain state

    let rubiksCube = this.rubiksCubeCopy;
    let goalFront = [0, faceIndex * rubiksCube.columns +2];
    let goalTop = rubiksCube.faceLinks[faceIndex][2];
    let goalRight = rubiksCube.faceLinks[faceIndex][3];

    let goalFrontFaceIndex = faceIndex;
    let goalTopFaceIndex = 0;
    let goalRightFaceIndex = (faceIndex + 1 > 4) ? 1 : faceIndex+1;
    
    let goalTopColour = rubiksCube.getFaceColour(goalTopFaceIndex);
    let goalFrontColour = rubiksCube.getFaceColour(goalFrontFaceIndex);
    let goalRightColour = rubiksCube.getFaceColour(goalRightFaceIndex);

    let primaryGoal = [
                        [goalFront[0], goalFront[1], goalFrontColour],
                        [goalTop[0], goalTop[1], goalTopColour],
                        [goalRight[0], goalRight[1], goalRightColour],
                      ];

    let result = [];
    //Check if primary goal ALREADY reached, if reached, we're done, EXIT
    let reachedGoal = RCFSearch.reachedGoal(this.rubiksCubeCopy, primaryGoal);
    if(!reachedGoal)
    {
      result = this._solveTopCornerSecondaryGoals(goal, primaryGoal, faceIndex);
    }

    if(reachedGoal || result.length > 0)
    {
      for(let i = 0; i < primaryGoal.length; i++)
        goal.push(primaryGoal[i]);
    }

    RCFSolver.applyMoves(this.rubiksCubeCopy, result);
    resultStages.push(result);
  }

  static getSideFaceMoves(faceIndex, moveLabels, faces=4)
  {
    let result = [];

    let topFaceIndex = 0;
    let LeftFaceIndex = (faceIndex - 1 < 0) ? faces : faceIndex-1;
    let rightFaceIndex = (faceIndex + 1 > faces) ? 1 : faceIndex+1;
    let bottomFaceIndex = 5;

    let moves = [
                  RCFSolver.getMoveIndex(topFaceIndex, true), 
                  RCFSolver.getMoveIndex(topFaceIndex, false), 

                  RCFSolver.getMoveIndex(LeftFaceIndex, true), 
                  RCFSolver.getMoveIndex(LeftFaceIndex, false), 

                  RCFSolver.getMoveIndex(faceIndex, true), 
                  RCFSolver.getMoveIndex(faceIndex, false), 

                  RCFSolver.getMoveIndex(rightFaceIndex, true), 
                  RCFSolver.getMoveIndex(rightFaceIndex, false), 

                  RCFSolver.getMoveIndex((faceIndex+2) % faces, true), 
                  RCFSolver.getMoveIndex((faceIndex+2) % faces, false), 

                  RCFSolver.getMoveIndex(bottomFaceIndex, true), 
                  RCFSolver.getMoveIndex(bottomFaceIndex, false), 
                ];

    for(let i = 0; i < moveLabels.length; i++)
    {
      let moveLableIndex = RCFSolver.moveLabels.indexOf(moveLabels[i].toUpperCase());
      result.push(moves[moveLableIndex]);
    }

    return result;
  }

  _solveTopCornerSecondaryGoals(goal, primaryGoal, faceIndex)
  {
    //construct 3 possible states of secondary goal located directly at bottom of primary goal
    //then search with secondary goal added to goal
    let result = [];
    let rubiksCube = this.rubiksCubeCopy;

    let goalFrontFaceIndex = faceIndex;
    let goalTopFaceIndex = 0;
    let goalRightFaceIndex = (faceIndex + 1 > 4) ? 1 : faceIndex+1;
    
    //relative white top
    let goalTopColour = rubiksCube.getFaceColour(goalTopFaceIndex);
    //relative green front
    let goalFrontColour = rubiksCube.getFaceColour(goalFrontFaceIndex);
    //relative red right
    let goalRightColour = rubiksCube.getFaceColour(goalRightFaceIndex);

    let secondaryGoalsColours = [
                                  [goalFrontColour, goalRightColour, goalTopColour],
                                  [goalTopColour, goalFrontColour, goalRightColour],
                                  [goalRightColour, goalTopColour, goalFrontColour],
                                ];
    let secondaryGoals = [];

    let secondaryGoalsMoves = [
                                RCFSolver.getSideFaceMoves(faceIndex, ["R'", "D'", "R"]),
                                RCFSolver.getSideFaceMoves(faceIndex, ["F", "D", "F'"]),
                                RCFSolver.getSideFaceMoves(faceIndex, ["R", "R", "D'", "R", "R", "D", "R", "R"]),
                              ];

    for(let i = 0; i < secondaryGoalsColours.length; i++)
    {
      secondaryGoals.push([]);
      secondaryGoals[i].push([2, faceIndex * rubiksCube.columns +2, secondaryGoalsColours[i][0]]);
      secondaryGoals[i].push([rubiksCube.faceLinks[faceIndex][6][0],rubiksCube.faceLinks[faceIndex][6][1], secondaryGoalsColours[i][1]]);
      secondaryGoals[i].push([rubiksCube.faceLinks[faceIndex][5][0], rubiksCube.faceLinks[faceIndex][5][1], secondaryGoalsColours[i][2]]);

      result = RCFSearch.bfs(this.rubiksCubeCopy, goal.concat(secondaryGoals[i]), 3);
      if(result.length == 0)
      {
        result = RCFSearch.depthFirstSearch(this.rubiksCubeCopy, goal.concat(secondaryGoals[i]), 5);
      }

      if(result.length > 0)
      {
        result = result.concat(secondaryGoalsMoves[i]);
        break;
      }
    }

    return result;
  }

  solveMiddleEdges(goal, resultStages)
  {
    //For each face:
    let i = 2;
    for(let i = 1; i <= 4; i++)
    {
      this._solveMiddleEdge(goal, resultStages, i);
    }
  }

  _solveMiddleEdge(goal, resultStages, faceIndex)
  {

    let rubiksCube = this.rubiksCubeCopy;

    let goalFront = [1, faceIndex * rubiksCube.columns +2];
    let goalRight = rubiksCube.faceLinks[faceIndex][4];

    let goalFrontFaceIndex = faceIndex;
    let goalRightFaceIndex = (faceIndex + 1 > 4) ? 1 : faceIndex+1;

    let goalFrontColour = rubiksCube.getFaceColour(goalFrontFaceIndex);
    let goalRightColour = rubiksCube.getFaceColour(goalRightFaceIndex);

    let primaryGoal = [
                        [goalFront[0], goalFront[1], goalFrontColour],
                        [goalRight[0], goalRight[1], goalRightColour],
                      ];

    let reachedGoal = RCFSearch.reachedGoal(this.rubiksCubeCopy, primaryGoal);

    let result = [];
    if(!reachedGoal)
    {
      result = this._moveEdgePieceToMiddle(faceIndex, goal, primaryGoal);
    }

    if(reachedGoal || result.length > 0)
    {
      for(let i = 0; i < primaryGoal.length; i++)
        goal.push(primaryGoal[i]);
    }

    RCFSolver.applyMoves(this.rubiksCubeCopy, result);
    resultStages.push(result);
  }

  _moveEdgePieceToMiddle(faceIndex, goal, primaryGoal)
  {
    let result = [];
    let rubiksCube = this.rubiksCubeCopy;

    let goalFrontColour = primaryGoal[0][2];
    let goalRightColour = primaryGoal[1][2];

    let relativeRightMoves = ["D'", "R'", "D", "R", "D", "F", "D'", "F'"];

    //detect if piece is in middle layer, if so, move piece to bottom
    let edgeCoord = rubiksCube.findEdge(goalFrontColour, goalRightColour, [false, true, true, true, true, false], [false, true, false, false]);
    if(edgeCoord)
    {
      let edgeFrontFaceIndex = Math.floor(edgeCoord[1]/rubiksCube.columns);

      let rightMoves =  RCFSolver.getSideFaceMoves(edgeFrontFaceIndex, relativeRightMoves);

      result = result.concat(rightMoves);
    }

    RCFSolver.applyMoves(this.rubiksCubeCopy, result);
    let requiredMoves = this._rotateEdgePieceForMiddle(faceIndex, goal, primaryGoal);
    RCFSolver.applyUndoMoves(this.rubiksCubeCopy, result);
    result = result.concat(requiredMoves);

    //now that the edge piece is on the bottom, move it to the right place in middle
    RCFSolver.applyMoves(rubiksCube, result);

    let rightMoves =  RCFSolver.getSideFaceMoves(faceIndex, relativeRightMoves);

    let edgeFront = [2, faceIndex * rubiksCube.columns + 1];
    let edgeFrontColour = rubiksCube.stickers[edgeFront[0]][edgeFront[1]];

    requiredMoves = [];
    if(edgeFrontColour === goalFrontColour)
    {
      requiredMoves = requiredMoves.concat(rightMoves);
    }
    else
    {
      requiredMoves = requiredMoves.concat(rightMoves);
      requiredMoves = requiredMoves.concat(rightMoves);

      RCFSolver.applyMoves(rubiksCube, requiredMoves);
      let foundMoves = this._rotateEdgePieceForMiddle(faceIndex, goal, primaryGoal);
      RCFSolver.applyUndoMoves(rubiksCube, requiredMoves);
      requiredMoves = requiredMoves.concat(foundMoves);

      requiredMoves = requiredMoves.concat(rightMoves);
    }
    RCFSolver.applyUndoMoves(rubiksCube, result);

    result = result.concat(requiredMoves);

    return result;
  }

  _rotateEdgePieceForMiddle(faceIndex, goal, primaryGoal)
  {
    let requiredMoves = [];
    let rubiksCube = this.rubiksCubeCopy;
    let goalFrontColour = primaryGoal[0][2];
    let goalRightColour = primaryGoal[1][2];

    let edgeCoord = rubiksCube.findEdge(goalFrontColour, goalRightColour);

    let edgeColour1 = rubiksCube.stickers[edgeCoord[0]][edgeCoord[1]];
    let edgeColour2 = edgeColour1 === goalFrontColour ? goalRightColour : goalFrontColour;

    let secondaryGoalLink = rubiksCube.faceLinks[faceIndex][7];


    let secondaryGoal = [
                          [2, faceIndex * rubiksCube.columns + 1, edgeColour1],
                          [secondaryGoalLink[0], secondaryGoalLink[1], edgeColour2]
                        ];

    //requiredMoves = RCFSearch.bfs(this.rubiksCubeCopy, secondaryGoal, 2);
    requiredMoves = RCFSearch.depthFirstSearch(this.rubiksCubeCopy, goal.concat(secondaryGoal), 2);

    return requiredMoves;
  }

  applyResultStages(cube, resultStages)
  {
    for(let i = 0; i < resultStages.length; i++)
    {
      this.applyResult(cube, resultStages[i]);
    }
  }

  outputResultStages(resultStages)
  {
    console.log(this.toStringResultStages(resultStages));
  }

  toStringResultStages(resultStages)
  {
    let result = "";
    for(let i = 0; i < resultStages.length; i++)
    {
      result += "Stage: " + (i+1) + "\n";
      result+= this.toStringMoveLabels(resultStages[i], true) + "\n";
    }

    if(resultStages.length > 0)
      result += " ";

    return result;
  }

  outputResultLabels(result, capitalised=false)
  {
    console.log(this.toStringMoveLabels(result, capitalised));
  }

  toStringMoveLabels(result, capitalised=false)
  {
    let labels = [];
    for(let i = 0; result && i < result.length; i++)
    {
      let label = RCFSolver.moveLabels[result[i]];
      labels.push(capitalised ? label : label.toLowerCase() );
    }

    return "Moves: " + labels;
  }

  arrayEquals(a, b)
  {
    let result = true;

    if(a.length == b.length)
    {
      for(let i = 0; i < a.length; i++)
      {
        if (a[i] != b[i])
        {
          result = false;
          break;
        }
      }
    }
    else
    {
      result = false;
    }
    return result;
  }

  findEdge(rubiksCube, stickerRow, stickerColumn)
  {
    let result = null;
    for(let row = 0; row < rubiksCube.stickers.length; row++)
    {
      for(let column = 0; column < rubiksCube.stickers[row].length; column++)
      {
        if(
          !(row == stickerRow && column == stickerColumn) &&
          rubiksCube.stickers[row][column] == rubiksCube.stickers[stickerRow][stickerColumn])
        {
          let faceRow = row;
          let faceColumn = column % rubiksCube.columns;
          if (
              !(
                (faceRow == 0 && faceColumn == 0) ||
                (faceRow == 0 && faceColumn == 2) ||
                (faceRow == 2 && faceColumn == 0) ||
                (faceRow == 2 && faceColumn == 2)
              )
            )
          {
            if(result == null)
              result = [];

            result.push([row, column]);
          }
        }
      }
    }
    return result;
  }

  draw()
  {
    this.rubiksCubeCopy.draw();
  }
}
