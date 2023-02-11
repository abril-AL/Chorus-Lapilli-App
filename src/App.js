import { useState } from 'react'
import './App.css';

//extra functions for board to check stuff
function needToMoveQ(xTurn, grid,mTaken) {
  //check if mid is taken by player
  if (mTaken) {
    if( grid[4] === 'X' && xTurn ){
      return true;
    }
    if (grid[4] === 'O' && !xTurn) {
      return true;
    }
    return false;//mid taken, but its not the current player's
  }else{
    return false;
  }
}
function oneAway(to,from) {
  const lines = [
    [1,3,4],
    [0,2,3,4,5],
    [1,4,5],
    [0,1,4,6,7],
    [0,1,2,3,5,6,7,8],
    [1,2,4,7,8],
    [3,4,7],
    [6,3,4,5,8],
    [4,5,7]
  ];
  // to is in from'th element
  const len = lines[from].length;
  for (let j = 0; j < len; j++) {
    if(lines[from][j] === to) return true;
  }
  return false;
}
function phaseTwo(grid,to,from) {
  //assumptions/known: this is second click, first is not null second selection is not null, 
  // player matches element selected
  grid[to] = grid[from];
  grid[from] = null;
  return grid;
}
function willWin(grid,to,from) {
  grid[to] = grid[from];
  grid[from] = null;
  if ( checkWin(grid) !== null){
    return true;
  }
  if( checkWin(grid) === 'X' || checkWin(grid) === 'O' ){
    return true;
  }
  return false;
}
function willGetRidOFMid(to,from) {
  if ( to !== 4 && from === 4) 
    return true;
  return false;
}
function checkWin(squares){
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function Block({value,blockClick}) {
  return ( <button className='block' onClick={blockClick}> {value} </button> );
}

function Board({p1,p2,setp1,setp2,turns,setTurns}) {
  //turn number
  const [squares, setSquares] = useState(Array(9).fill(null));
  //board squares
  const [xIsNext, setXIsNext] = useState(true);
  //turn phase variables

  const [chooseFirst,setCF] = useState(true);
  //bool to track whether first choice was made (
  const [firstIndex,setFI] = useState(0);
  //integer to track the index of the first choice
  
  const [md,setmd] = useState(false);
  //for middle rule

  const [currSel,setSel] = useState("");
  const [movebruh,setmv] = useState("");

  function blockClick (i) {
    if (checkWin(squares)) { return; }
    let copy = squares.slice();
    if (p1===true) {
      if (squares[i]){
        return;
      }
      if (xIsNext) {
        copy[i] = 'X';
      } else {
        copy[i] = 'O';
      }
      setTurns(turns+1);
      if (turns===6) { 
        setp1(false);
        setp2(true);
        if (copy[4])//if mid taken
          setmd(!md); 
      }
      setXIsNext(!xIsNext);
    } else if (p2===true) {
      if (chooseFirst) {
        if (copy[i]) {
          //check that they chose their own 
          if ( xIsNext && copy[i] !== 'X') return; // X cant choose O
          if (!xIsNext && copy[i] !== 'O') return; // O cant choose X
          //set the first choice tracking stuff
          setFI(i);
          setCF(!chooseFirst);
          setSel(i);
        } else { return } //first choice can't be null
      } else { //second choice
        if (copy[i]) {
          if (i===firstIndex){setCF(!chooseFirst);setSel("");}
          return;//second must be empty block
        } else {
          if (oneAway(i,firstIndex)){
            let c2 = copy.slice();
            if (needToMoveQ(xIsNext,c2,md)) {
              let win = willWin(c2,i,firstIndex);
              let free = willGetRidOFMid(i,firstIndex);
              let oneTrue = (win || free);
              if(!oneTrue) {setmv("You need to move out of the middle block !"); 
              return; }
              else { setmv("");}
            }
            if (i===4 || firstIndex===4) { setmd(true) };
            setSquares(phaseTwo(copy,i,firstIndex));
            setXIsNext(!xIsNext);
            setCF(!chooseFirst);
            setSel("");
          } else { return; }
        }
      }
    }
    if (p1) {setSquares(copy); };
  }
  const winner = checkWin(squares);
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else {
    status = "Next Player: " + (xIsNext ? "X" : "O" );
  }
  return (
  <>
    <div>
      {status}
    </div>
    <div className='row'>
      <Block value={squares[0]} blockClick={() => blockClick(0)}/>
      <Block value={squares[1]} blockClick={() => blockClick(1)}/>
      <Block value={squares[2]} blockClick={() => blockClick(2)}/>
    </div>
    <div className='row'>
      <Block value={squares[3]} blockClick={() => blockClick(3)}/>
      <Block value={squares[4]} blockClick={() => blockClick(4)}/>
      <Block value={squares[5]} blockClick={() => blockClick(5)}/>
    </div>
    <div className='row'>
      <Block value={squares[6]} blockClick={() => blockClick(6)}/>
      <Block value={squares[7]} blockClick={() => blockClick(7)}/>
      <Block value={squares[8]} blockClick={() => blockClick(8)}/>
    </div>
    <div>
      Position:
      {" " + currSel}
    </div>
    <div>
      {movebruh}
    </div>
  </>
  )
}
function App() {
  const [phase1,setPhase1] = useState(true);
  const [phase2,setPhase2] = useState(false);
  const [turns,setTurns] = useState(1); 
  return (
    <body>
      <div>
        <Board p1={phase1} setp1={setPhase1} p2={phase2} setp2={setPhase2} 
        turns={turns} setTurns={setTurns}/>
      </div>
    </body>
  )
}
export default App;
