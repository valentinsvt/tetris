import './style.css'
import { Tetromino } from './tetromino'
import { copyToBoard, nextPiece, updateTetrominoQueue, TetrominoCommands, addLeftCommand, addRightCommand, addRotateCommand, executeTetrominoCommands, shouldSpawnANewPiece, resetCommandQueue, BoardCommands, addAccelerateCommand, executeBoardCommands, addSlowDownCommand, addTogglePauseCommand, checkForLosingCondition } from './gameHandler'
import { initBoard } from './gameBoard'
import { configureGameCanvas, configureNextTetrominoCanvas, drawGameGrid, drawNextTetrominoGrid, drawTetromino, drawTetrominoLocally, showGameOver } from './canvasHandler'

let gameBoard = initBoard()
const context = configureGameCanvas(gameBoard)
const nextTetrominoContext = configureNextTetrominoCanvas(gameBoard)
let pieceQueue: Tetromino[] = []
let currentPiece: Tetromino | null = null
const clockDelta = 50
let lastRender = 0
pieceQueue = updateTetrominoQueue(pieceQueue)
currentPiece = nextPiece(pieceQueue)
let tetrominoCommands: TetrominoCommands[] = []
let boardCommands: BoardCommands[] = []
let gameOver = false

function update() {
  gameOver = checkForLosingCondition(gameBoard)
  gameBoard = executeBoardCommands(gameBoard, boardCommands)
  boardCommands = []
  const now = Date.now()
  if (now - lastRender < clockDelta || gameBoard.paused) return window.requestAnimationFrame(update)
  if (gameOver) {
    showGameOver()
    return window.requestAnimationFrame(update)
  }
  draw()
  if (shouldSpawnANewPiece(gameBoard, currentPiece)) {
    gameBoard = copyToBoard(gameBoard, currentPiece)
    currentPiece = nextPiece(pieceQueue)
    pieceQueue = updateTetrominoQueue(pieceQueue)
  } else {
    currentPiece = executeTetrominoCommands(gameBoard, tetrominoCommands, currentPiece)
  }
  tetrominoCommands = resetCommandQueue()
  lastRender = now
  window.requestAnimationFrame(update)
}

function draw() {
  drawGameGrid(context, gameBoard)
  drawNextTetrominoGrid(nextTetrominoContext, gameBoard)
  drawTetromino(context, currentPiece)
  drawTetrominoLocally(nextTetrominoContext, pieceQueue[0])
}

update()

document.addEventListener('keydown', (e) => {
  if (e.code === "ArrowDown") {
    boardCommands = addAccelerateCommand(boardCommands)
  }
  if (e.code === "ArrowLeft") {
    tetrominoCommands = addLeftCommand(tetrominoCommands)
  }
  if (e.code === "ArrowRight") {
    tetrominoCommands = addRightCommand(tetrominoCommands)
  }
  if (e.code === "KeyA" || e.code === "ArrowUp") {
    tetrominoCommands = addRotateCommand(tetrominoCommands)
  }
  if (e.code === "KeyP") {
    boardCommands = addTogglePauseCommand(boardCommands)
  }
})

document.addEventListener('keyup', (e) => {
  if (e.code === "ArrowDown") {
    boardCommands = addSlowDownCommand(boardCommands)
  }
})