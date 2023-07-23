class RCF
{
  constructor(solver = null)
  {
    this.rows = 3;
    this.columns = 3;
    this.faces = 6;
    this.stickers = [];
    this.faceBorder = 4;

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

    this.oppositeFaces = [5, 3, 4, 1, 2, 0];

    this.rotateFaceIndex = 0;
    this.rotationSpeed = 3;
    this.currentRotation = 0;
    this.targetRotation = 0;
    this.animating = false;
    this.previousStickers;

    this.edgeGraphics = [];
    for(let i = 0; i < this.faceLinks[0].length/this.rows; i++)
    {
      //let edgeGraphicsW = this.stickerSize * this.rows * 3 + this.faceBorder * 4;
      //this.edgeGraphics.push(createGraphics(width, height));
      this.edgeGraphics.push(createGraphics(this.stickerSize * this.rows * 3, this.stickerSize));
    }
    this.fillEdgeGraphicsBackground('rgba(0, 0 ,0, 0.25)');
    //this.fillEdgeGraphicsBackground("Purple");
  }

  fillEdgeGraphicsBackground(colour)
  {
    for(let i = 0; i < this.edgeGraphics.length; i++)
    {
      this.edgeGraphics[i].background(colour);
    }
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

    this.previousStickers = RCF.copy2DArray(this.stickers);
  }

  _superflipSwitchStickers(coord1, coord2)
  {
    let tempColour = this.stickers[coord1[0]][coord1[1]];
    this.stickers[coord1[0]][coord1[1]] = this.stickers[coord2[0]][coord2[1]];
    this.stickers[coord2[0]][coord2[1]] = tempColour;
  }

  resetStickers()
  {
    this.animating = false;
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

    this.previousStickers = RCF.copy2DArray(this.stickers);
  }

  scramble()
  {
    this.animating = false;
    for(let i = 0; i < 100; i++)
      rubiksCube.rotate(getRandomInt(6));
    this.previousStickers = RCF.copy2DArray(this.stickers);
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

  animateRotation(faceIndex, clockwise=true)
  {
    this.rotateFaceIndex = faceIndex;
    this.currentRotation = 0;
    this.targetRotation = clockwise ? 90 : -90;
    this.animating = true;
    loop();
  }

  getFaceCoords()
  {
    let faceCoords = [];

    let faceBorder = this.faceBorder;

    let faceX = this.topLeftX + faceBorder +this.columns * this.stickerSize;
    let faceY = this.topLeftY;

    for(let i = 0; i < this.faces; i++)
    {
      if(i == 1)
      {
        faceX = this.topLeftX;
        faceY += faceBorder + this.stickerSize * this.rows;
      }
      else if(i == 5)
      {
        faceX = this.topLeftX + this.columns * this.stickerSize + faceBorder;
        faceY += this.stickerSize * this.rows + faceBorder;
      }

      faceCoords.push([faceX, faceY]);
      faceX += this.stickerSize * this.columns + faceBorder;
    }

    return faceCoords;
  }

  indexToCoord(row, col)
  {
    let coord = [];
    //let faceBorder = this.faceBorder;

    let faceCoords = this.getFaceCoords();
    let faceIndex = Math.floor(col / this.columns);
    let faceCoord = faceCoords[faceIndex];

    coord.push(faceCoord[0] + col % this.columns * this.stickerSize );
    coord.push(faceCoord[1] + row % this.columns * this.stickerSize );

    return coord;
  }

  getFaceLinkColours(faceIndex, stickers)
  {
    let colours = [];
    let faceLink = this.faceLinks[faceIndex];
    for(let i = 0; i < faceLink.length; i++)
    {
      colours.push(stickers[faceLink[i][0]][faceLink[i][1]]);
    }
    return colours;
  }

  draw()
  {
    if(!this.isHidden)
    {
      angleMode(DEGREES);

      let faceBorder = this.faceBorder;

      let centreX = faceBorder + this.stickerSize*3/2;
      let centreY = faceBorder + this.stickerSize*3/2;

      let faceCoords = this.getFaceCoords();

      //for(let i = 0; i < this.faces; i++)
        //this.drawFace(faceCoords[i][0], faceCoords[i][1], i, faceBorder, this.stickers, this.showCoord, this.showLabel);

      if(this.animating)
      {
        for(let i = 0; i < this.faces; i++)
        {
          if(i != this.rotateFaceIndex)
          {
            this.drawFace(faceCoords[i][0], faceCoords[i][1], i, faceBorder, this.stickers, false, false);
          }
        }
        this.animateEdgeRotation(this.rotateFaceIndex, faceCoords);

        this.animateFaceRotation(this.rotateFaceIndex, faceCoords);

        for(let i = 0; i < this.faces; i++)
        {
          if(i != this.rotateFaceIndex)
          {
            this.drawFace(faceCoords[i][0], faceCoords[i][1], i, faceBorder, null, this.showCoord, this.showLabel);
          }
        }

        //draw a static cube on top again to cover up graphics glitch caused by animateEdgeRotation
        //also border is bit glitchy too...
        if(!this.animating)
        {
          for(let i = 0; i < this.faces; i++)
            this.drawFace(faceCoords[i][0], faceCoords[i][1], i, faceBorder, this.stickers, this.showCoord, this.showLabel);
          noLoop();
        }
      }
      else
      {
        for(let i = 0; i < this.faces; i++)
          this.drawFace(faceCoords[i][0], faceCoords[i][1], i, faceBorder, this.stickers, this.showCoord, this.showLabel);
      }
    }
  }

  animateFaceRotation(faceIndex, faceCoords)
  {
    let faceBorder = this.faceBorder;

    let faceX = faceCoords[faceIndex][0];
    let faceY = faceCoords[faceIndex][1];

    let centreX = faceBorder + this.stickerSize*3/2;
    let centreY = faceBorder + this.stickerSize*3/2;

    push();
    translate(faceX+centreX, faceY+centreY);

    if(Math.abs(this.currentRotation) < Math.abs(this.targetRotation))
    {
      rotate(this.currentRotation);
      let rotationDirection = this.targetRotation >= 0 ? 1 : -1;
      this.currentRotation += this.rotationSpeed * rotationDirection;
    }
    else
    {
      this.animating = false;
      this.previousStickers = RCF.copy2DArray(this.stickers);
    }

    this.drawFace(-centreX, -centreY, faceIndex, faceBorder, this.previousStickers, this.showCoord, this.showLabel);
    pop();
  }

  animateEdgeRotation(faceIndex, faceCoords)
  {
    let faceLink = this.faceLinks[faceIndex];

    let faceLinkColours = this.getFaceLinkColours(faceIndex, this.previousStickers);

    //draw graphics with long edge strips
    let edgeGraphicsIndex = 0;
    let t = 0;
    for(let t = 0; t < faceLink.length; t+=this.columns)
    {
      let edgeGraphic = this.edgeGraphics[edgeGraphicsIndex];

      let s = t - 3;
      let drawX = 0;

      //draw that strip starting from 0, should be easier to transform instead of working out where to start drawing
      for(let i = 0; i < this.columns * 3; i++)
      {
        edgeGraphic.strokeWeight(1);
        edgeGraphic.fill(faceLinkColours[RCF.mod(s, faceLinkColours.length)]);
        edgeGraphic.alpha
        edgeGraphic.square(drawX, 0, this.stickerSize);

        drawX += this.stickerSize;
        s++;
      }

      let tPlus0Coord = this.indexToCoord(faceLink[t][0], faceLink[t][1]);

      let drawChangeX = faceLink[t+1][1] - faceLink[t][1];
      let drawChangeY = faceLink[t+1][0] - faceLink[t][0];

      let imageW = this.stickerSize * this.columns;
      let imageH = this.stickerSize;

      let imageStartX = this.stickerSize * this.columns;
      let imageStartY = 0;

      let moveDirection = this.targetRotation > 0 ? -1 : 1;
      let moveRatio = this.currentRotation/this.targetRotation;
      let moveBy = Math.round(imageW * moveDirection * moveRatio);

      let moveToX = tPlus0Coord[0]+this.faceBorder;
      let moveToY = tPlus0Coord[1]+this.faceBorder;

      let rotateImageBy = 0;
      if(drawChangeX != 0)
        rotateImageBy = drawChangeX > 0 ? 0 : 180;

      if(drawChangeY != 0)
        rotateImageBy = drawChangeY > 0 ? 90 : -90;

      push();
      translate(moveToX, moveToY);
      translate(imageH/2, imageH/2);
      rotate(rotateImageBy);
      translate(-imageH/2, -imageH/2);
      image(edgeGraphic, 0, 0, imageW, imageH, imageStartX + moveBy, imageStartY, imageW, imageH);

      pop();

      edgeGraphicsIndex++;
    }
  }

  static mod(n, m)
  {
    return ((n % m) + m) % m;
  }

  drawFace(startX, startY, faceIndex, faceBorder, stickers, showCoord = false, showLabel = false)
  {
    if(Number.isInteger(faceIndex) && 0 <= faceIndex && faceIndex < this.faces)
    {
      let x = startX;
      let y = startY;

      if(stickers)
      {
        push();
        fill(0);
        square(x, y, this.stickerSize*3+faceBorder*2);
        pop();
      }

      x += faceBorder;
      startX = x;
      y += faceBorder;

      let startColumn = this.columns * faceIndex;

      for(let row = 0; row < this.rows; row++)
      {
        for(let column = startColumn; column < startColumn+this.columns; column++)
        {
          if(stickers)
          {
            push();
            fill(stickers[row][column]);
            square(x, y, this.stickerSize);
            pop();
          }

          if(showLabel)
          {
            push();
            textAlign(CENTER, CENTER);
            text(faceIndex + ": " +this.faceLabels[faceIndex], x+this.stickerSize/2, y+this.stickerSize/5*4);
            pop();
          }

          if(showCoord)
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
    this.animating = false;
    if(this.solver)
      this.solver.solve(this);
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