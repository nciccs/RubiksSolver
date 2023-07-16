class RCF
{
  constructor(solver = null)
  {
    this.rows = 3;
    this.columns = 3;
    this.faces = 6;
    this.stickers = [];

    this.faceColours = [
                        "white", 
                        "orange",
                        "green", 
                        "red", 
                        "blue", 
                        "yellow"
                      ];

    this.resetStickers();

    this.isHidden = false;
    this.topLeftX = 0;
    this.topLeftY = 0;
    this.stickerSize = 30;
    this.showCoord = false;

    this.showLabel = false;
    this.faceLabels = [
                        "U",
                        "L",
                        "F",
                        "R",
                        "B",
                        "D"
                      ];

    //each face is linked to edge, going clockwise
    this.faceLinks =
                    [
                      //white
                      [
                        [0,14], [0,13], [0,12],
                        [0,11], [0,10], [0,9],
                        [0,8], [0,7], [0,6],
                        [0,5], [0,4], [0,3]
                      ],
                      //orange
                      [
                        [0,0], [1,0], [2,0],
                        [0,6], [1,6], [2,6],
                        [0,15], [1,15], [2,15],
                        [2,14], [1,14], [0,14]
                      ],
                      //green
                      [
                        [2,0], [2,1], [2,2],
                        [0,9], [1,9], [2,9],
                        [0,17], [0,16], [0,15],
                        [2,5], [1,5], [0,5]
                      ],
                      //red
                      [
                        [2,2], [1,2], [0,2],
                        [0,12], [1,12], [2,12],
                        [2,17], [1,17], [0,17],
                        [2,8], [1,8], [0,8],
                      ],
                      //blue
                      [
                        [0,2], [0,1], [0,0],
                        [0,3], [1,3], [2,3],
                        [2,15], [2,16], [2,17],
                        [2,11], [1,11], [0,11]
                      ],
                      //yellow
                      [
                        [2,6], [2,7], [2,8],
                        [2,9], [2,10], [2,11],
                        [2,12], [2,13], [2,14],
                        [2,3], [2,4], [2,5]
                      ]
                    ];

    this.solver = solver;

    //previously this code was too complex, stored data as: function(){cube.rotate(0, true)}
    this.moves = [
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

    this.undoMoves =[
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

    this.moveLabels = ["U", "U'", 
                       "L", "L'", 
                       "F", "F'", 
                       "R", "R'", 
                       "B", "B'", 
                       "D", "D'"];

    this.oppositeFaces = [5, 3, 4, 1, 2, 0];
  }

  static getMoveIndex(faceIndex, clockwise)
  {
    return faceIndex * 2 + (clockwise ? 0 : 1);
  }

  getMoveIndex(faceIndex, clockwise)
  {
    return RCF.getMoveIndex(faceIndex, clockwise);
  }

  getFaceColour(faceIndex)
  {
    return this.faceColours[faceIndex];
  }

  getOppositeFace(faceIndex)
  {
    return this.oppositeFaces[faceIndex];
  }

  isSameMove(move1, move2)
  {
    let isSame = false;
    if(move1[0] == move2[0] && move1[1] == move2[1])
    {
      isSame = true;
    }
    return isSame;
  }

  superflip()
  {
    this.resetStickers();

    let faceIndex = 0;
    this._superflipSwitchStickers([0, faceIndex * this.columns + 1], this.faceLinks[faceIndex][1]);
    this._superflipSwitchStickers([1, faceIndex * this.columns + 2], this.faceLinks[faceIndex][4]);
    this._superflipSwitchStickers([2, faceIndex * this.columns + 1], this.faceLinks[faceIndex][7]);
    this._superflipSwitchStickers([1, faceIndex * this.columns], this.faceLinks[faceIndex][10]);

    for(let i = 1; i <= 4; i++)
    {
      faceIndex = i;
      this._superflipSwitchStickers([1, faceIndex * this.columns], this.faceLinks[faceIndex][10]);
    }
    
    faceIndex = 5;
    this._superflipSwitchStickers([0, faceIndex * this.columns + 1], this.faceLinks[faceIndex][1]);
    this._superflipSwitchStickers([1, faceIndex * this.columns + 2], this.faceLinks[faceIndex][4]);
    this._superflipSwitchStickers([2, faceIndex * this.columns + 1], this.faceLinks[faceIndex][7]);
    this._superflipSwitchStickers([1, faceIndex * this.columns], this.faceLinks[faceIndex][10]);
  }

  _superflipSwitchStickers(coord1, coord2)
  {
    let tempColour = this.stickers[coord1[0]][coord1[1]];
    this.stickers[coord1[0]][coord1[1]] = this.stickers[coord2[0]][coord2[1]];
    this.stickers[coord2[0]][coord2[1]] = tempColour;
  }

  resetStickers()
  {
    for(let i = 0; i < this.rows; i++)
    {
      this.stickers[i] = [];
      let faceIndex = -1;
      for(let j = 0; j < this.columns * this.faces; j++)
      {
        if(j % this.columns == 0)
        {
          faceIndex++;
        }

        this.stickers[i].push(this.faceColours[faceIndex]);
      }
    }
  }

  showFaceLinkEdge(faceIndex)
  {
    for(let i = 0; i < this.faceLinks[faceIndex].length;i++)
    {
      let row = this.faceLinks[faceIndex][i][0];
      let column = this.faceLinks[faceIndex][i][1];

      if(this.stickers[row] && 0 <= row && row < this.rows && 
         0 <= column && column < this.columns * this.faces)
      {
        this.stickers[row][column] = i * 20 + 15;
      }
    }
  }

  addFaceLinkEdge(faceIndex, startRow, startColumn, isHorizontal=true, isAscending = true)
  {
    if(Number.isInteger(faceIndex) && 0 <= faceIndex && faceIndex < this.faces)
    {
      if(isHorizontal == true)
      {
        //startRow
        //i
        if(isAscending)
        {
          for(let i = startColumn; i < startColumn + this.columns; i++)
          {
            this.faceLinks[faceIndex].push([startRow, i]);
          }
        }
        else
        {
          for(let i = startColumn; i > startColumn - this.columns; i--)
          {
            this.faceLinks[faceIndex].push([startRow, i]);
          }
        }
      }
      else
      {
        //i
        //startColumn
        if(isAscending)
        {
          for(let i = startRow; i < startRow + this.rows; i++)
          {
            this.faceLinks[faceIndex].push([i, startColumn]);
          }
        }
        else
        {
          for(let i = startRow; i > startRow - this.rows; i--)
          {
            this.faceLinks[faceIndex].push([i, startColumn]);
          }
        }
      }
    }
  }
  
  show()
  {
    this.isHidden = false;
  }
  
  hide()
  {
    this.isHidden = true;
  }

  draw()
  {
    if(!this.isHidden)
    {
      let faceX = this.topLeftX + this.columns * this.stickerSize;
      let faceY = this.topLeftY;

      this.drawFace(faceX, faceY, 0);

      faceX = this.topLeftX;
      faceY += this.stickerSize * this.rows;

      for(let i = 1; i <= 4; i++)
      {
        this.drawFace(faceX, faceY, i);
        faceX += this.stickerSize * this.columns;
      }

      faceX = this.topLeftX + this.columns * this.stickerSize;
      faceY += this.stickerSize * this.rows;

      this.drawFace(faceX, faceY, 5);
    }
  }

  drawFace(startX, startY, faceIndex)
  {
    //Not very generous here, won't work if faceIndex is 0.5.
    //Maybe should convert faceIndex to int, that would need Math.floor().
    //But too much effort...zzz
    if(Number.isInteger(faceIndex) && 0 <= faceIndex && faceIndex < this.faces)
    {
      let x = startX;
      let y = startY;

      let startColumn = this.columns * faceIndex;
      
      for(let row = 0; row < this.rows; row++)
      {
        for(let column = startColumn; column < startColumn+this.columns; column++)
        {
          push();
          fill(this.stickers[row][column]);
          square(x, y, this.stickerSize);
          pop();

          if(this.showLabel)
          {
            push();
            textAlign(CENTER, CENTER);
            text(faceIndex + ": " +this.faceLabels[faceIndex], x+this.stickerSize/2, y+this.stickerSize/5*4);
            pop();
          }

          if(this.showCoord)
          {
            push();
            textAlign(CENTER, CENTER);
            text(row + ", " + column, x+this.stickerSize/2, y+this.stickerSize/5*2);
            pop();
          }

          x+= this.stickerSize;
        }
        x = startX;
        y += this.stickerSize;
      }
    }
  }

  //outputs content of rubiks cube stickers array
  output()
  {
    this.print();
  }

  print()
  {
    console.table(this.stickers);
  }

  move(index)
  {
    this.rotate(this.moves[index][0], this.moves[index][1]);
  }
  
  undoMove(index)
  {
    //console.log(index);
    this.rotate(this.undoMoves[index][0], this.undoMoves[index][1]);
  }

  rotate(faceIndex, clockwise = true)
  {
    if(0 <= faceIndex && faceIndex < this.faces)
    {
      this._rotateFaceOnly(faceIndex, clockwise);
      this._rotateEdgeStickers(faceIndex, clockwise);
    }
  }

  _rotateFaceOnly(faceIndex, clockwise = true)
  {
    let result;
    if(clockwise)
    {
      result = this._rotateFaceClockwise(faceIndex);
    }
    else
    {
      result = this._rotateFaceAnticlockwise(faceIndex);
    }

    //if result exists, copy all the rotated colours to face
    if(result)
    {
      for(let row = 0; row < result.length; row++)
      {
        for(let column = 0; column < result[row].length; column++)
        {
          this.stickers[row][this.columns*faceIndex+column] = result[row][column];
        }
      }
    }
  }

  _rotateFaceClockwise(faceIndex)
  {
    let result = [];
    let numRows = this.columns;
    let numColumns = this.rows;

    let stickersRow = this.rows-1;
    let stickersColumn = faceIndex * this.columns;

    for(let row = 0; row < numRows; row++)
    {
        result.push([]);
        for(let column = 0; column < numColumns; column++)
        {
          result[row].push(this.stickers[stickersRow][stickersColumn]);
          stickersRow--;
        }
        stickersRow = this.rows-1;
        stickersColumn++;
    }
    return result;
  }

  _rotateFaceAnticlockwise(faceIndex)
  {
    let result = [];
    let numRows = this.columns;
    let numColumns = this.rows;
    
    let stickersRow = 0;
    let stickersColumn = faceIndex * this.columns + this.columns-1;

    for(let row = 0; row < numRows; row++)
    {
        result.push([]);
        for(let column = 0; column < numColumns; column++)
        {
          result[row].push(this.stickers[stickersRow][stickersColumn]);
          stickersRow++;
        }
        stickersRow = 0;
        stickersColumn--;
    }

    return result;
  }
  //simulators to check with
  //https://ruwix.com/online-puzzle-simulators/3x3x3-rubiks-cube-simulator.php
  
  //https://ruwix.com/the-rubiks-cube/notation/
  //mmm, confusing...
  //let's just do rotation
  _rotateEdgeStickers(faceIndex, clockwise = true)
  {
    let faceLinkCoords = this.faceLinks[faceIndex];
    let colours = [];

    for(let i = 0; i < faceLinkCoords.length; i++)
    {
      let coord = faceLinkCoords[i];
      colours.push(this.stickers[coord[0]][coord[1]]);
    }

    let tempColours;
    if(clockwise)
    {
      tempColours = colours.splice(faceLinkCoords.length-this.columns, this.columns);
      colours = tempColours.concat(colours);
    }
    else
    {
      tempColours = colours.splice(0, this.columns);
      colours = colours.concat(tempColours);
    }

    for(let i = 0; i < faceLinkCoords.length; i++)
    {
      let coord = faceLinkCoords[i];
      this.stickers[coord[0]][coord[1]] = colours[i];
    }
  }

  solve()
  {
    if(this.solver)
      this.solver.solve(this);
  }

  applyMoves(moves)
  {
    for(let i = 0; moves && i < moves.length; i++)
    {
      this.move(moves[i]);
    }
  } 

  applyUndoMoves(moves)
  {
    for(let i = moves.length-1; i >= 0; i--)
    {
      this.undoMove(moves[i]);
    }
  }

  static copyStickers(cube1, cube2)
  {
    cube2.stickers = this.copy2DArray(cube1.stickers);
  }

  static copy2DArray(arr)
  {
    let arr2 = [];
    for(let i = 0; i < arr.length; i++)
    {
      arr2.push([]);
      for(let j = 0; j < arr[i].length; j++)
      {
        arr2[i].push(arr[i][j]);
      }
    }
    return arr2;
  }

  //A generic algorithm to find edge piece given 2 colours
  findEdge(colour1, colour2, searchFaces= [true, true, true, true, true, true], searchStickers = [true, true, true, true])
  {
    let result;
    for(let i = 0; i < this.faces; i++)
    {
      if(searchFaces[i])
      {
        let column0 = i * this.columns;

        let topEdgeLink = this.faceLinks[i][1];
        let rightEdgeLink = this.faceLinks[i][4];
        let bottomEdgeLink = this.faceLinks[i][7];
        let leftEdgeLink = this.faceLinks[i][10];

        let topEdgeColour = this.stickers[topEdgeLink[0]][topEdgeLink[1]];
        let rightEdgeColour = this.stickers[rightEdgeLink[0]][rightEdgeLink[1]];
        let bottomEdgeColour = this.stickers[bottomEdgeLink[0]][bottomEdgeLink[1]];
        let leftEdgeColour = this.stickers[leftEdgeLink[0]][leftEdgeLink[1]];

        let edgeColours = [topEdgeColour, rightEdgeColour, bottomEdgeColour, leftEdgeColour];

        let topColour = this.stickers[0][column0 + 1];
        let rightColour = this.stickers[1][column0 + 2];
        let bottomColour = this.stickers[2][column0 + 1];
        let leftColour = this.stickers[1][column0];

        let faceColours = [topColour, rightColour, bottomColour, leftColour];
        let faceCoords =  [
                            [0, column0 + 1],
                            [1, column0 + 2],
                            [2, column0 + 1],
                            [1, column0],
                          ];

        for(let e = 0; e < edgeColours.length; e++)
        {
          if(searchStickers[e])
          {
            if((faceColours[e] === colour1 && edgeColours[e] === colour2) ||
              (faceColours[e] === colour2 && edgeColours[e] === colour1))
            {
              result = faceCoords[e];
              break;
            }
          }
        }

        if(result)
          break;
      }
    }
    return result;
  }
}