class RCFSearch
{
    static bfs(cube, goal, depthLimit, finalLayer=[])
    {
      let path=[];
  
      let queue = [];
  
      let reachedGoal;
      
      let rootStickers = RCF.copy2DArray(cube.stickers);
  
      reachedGoal = this.reachedGoal(cube, goal);
  
      if(!reachedGoal)
        queue = queue.concat(this._bfsQueueChildren(cube, goal, depthLimit, path));
  
      while(queue.length > 0)
      {
        let nodePath = queue.shift();
        
        if(finalLayer && nodePath.length >= depthLimit)
        {
          finalLayer.push(nodePath);
        }
  
        cube.stickers = RCF.copy2DArray(rootStickers);
        for(let i = 0; i < nodePath.length; i++)
        {
          cube.move(nodePath[i]);
          path = nodePath;
        }
  
        reachedGoal = this.reachedGoal(cube, goal);
        if(reachedGoal)
          break;
        
        queue = queue.concat(this._bfsQueueChildren(cube, goal, depthLimit, nodePath));
      }
  
      cube.stickers = rootStickers;
  
      if(!reachedGoal)
        path = [];
  
      return path;
    }
  
    static _bfsQueueChildren(cube, goal, depthLimit, path)
    {
      let queue = [];
      
      if(path.length < depthLimit)
      {  
        for(let i = 0; i < cube.moves.length; i++)
        {
          if(!this._pruneMove(cube, i, path))
          {
            let copiedPath = [].concat(path);
            copiedPath.push(i);
           
            queue.push(copiedPath);
          }
        }
      }
      return queue;
    }

  //BRUTE FORCE SOLVER! ᕦ(ò_óˇ)ᕤ
  //will try every possible moves first to see if reached goal
  //then will make a move and call itself again, until depth limit reached
  static depthFirstSearch(cube, goal, depthLimit, path=[], currentDepth=0)
  {
    let result = [];
    let reachedGoal;
    
    if(currentDepth == 0)
      reachedGoal = this.reachedGoal(cube, goal);

    if(currentDepth < depthLimit && !reachedGoal)
    {
      //all moves are tried and haven't reached goal
      if(!reachedGoal)
      {
        for(let i = 0; i < cube.moves.length; i++)
        {
          if(!this._pruneMove(cube, i, path))
          {
            cube.move(i);
            result.push(i);
            path.push(i);

            reachedGoal = this.reachedGoal(cube, goal);
            if(reachedGoal)
            {
              cube.undoMove(i);
              break;
            }
            else
            {           
              let nextResults = this.depthFirstSearch(cube, goal, depthLimit, path, currentDepth+1);
              if(nextResults.length > 0)
              {
                result = result.concat(nextResults);
                cube.undoMove(i);
                break;
              }
              else
              {
                result.pop();
                path.pop();
              }
            }
            cube.undoMove(i);
          }
        }
      }
    }
    return result;
  }

  //wth problem
  //original U,D,U',B',L',R' 
  //path.length as currentDept U,D,U',B',L',R'
  //no prune U,U,U,U,L',R' 
  //label was wrong

  //currentDept index 0 is first, 1 is second
  static _pruneMove(cube, moveIndex, path)
  {
    let prune = false;

    let currentDepth = path.length;

    //there's at least 1 previous move to check
    if(currentDepth >= 1)
    {
      //there is another prune problem:
      //U, D, U'
      //need to check in between, if all moves in between are from opposite face

      let currentMove = cube.moves[moveIndex];
      let previousUndoMove = cube.undoMoves[path[currentDepth-1]];

      //if current move (cube.moves) is previous move's opposite (cube.undoMoves)
      if(cube.isSameMove(currentMove, previousUndoMove))
      {
        prune = true;
      }
    }

    //example UUU is same as U', that's a waste of 3 moves instead of using 1
    if(path.length >= 2)
    {
      let currentMove = moveIndex;
      let parentMove = path[path.length-1];
      let grandParentMove = path[path.length-2];

      if(currentMove === parentMove &&
        parentMove === grandParentMove &&
        currentMove === grandParentMove)
      {
        prune = true;
      }
    }

    return prune;
  }

  static reachedGoal(cube, goal)
  {
    let result = true;
    for(let i = 0; i < goal.length; i++)
    {
      let row = goal[i][0];
      let col = goal[i][1];
      let sticker = goal[i][2];
      if(cube && cube.stickers && cube.stickers[row][col] != sticker)
      {
        result = false;
        break;
      }
    }
    return result;
  }


}