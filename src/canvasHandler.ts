import { GameBoard } from './gameBoard'
import { Coordinate, Tetromino } from './tetromino'
import { getDrawableCoordinate, indexToCoordinates } from './utils'

const TETROMINO_SIZE = 4

export const configureGameCanvas = (board: GameBoard): CanvasRenderingContext2D => {
    const canvas = document.querySelector('canvas#game-board') as HTMLCanvasElement
    const context = canvas.getContext('2d')!
    canvas.width = board.blockSize * board.width
    canvas.height = board.blockSize * board.height
    context.scale(board.blockSize, board.blockSize)
    context.fillStyle = '#333'
    context.fillRect(0, 0, board.width * board.blockSize, board.height * board.blockSize)
    return context
}

export const configureNextTetrominoCanvas = (board: GameBoard): CanvasRenderingContext2D => {
    const canvas = document.querySelector('canvas#next-tetromino') as HTMLCanvasElement
    const context = canvas.getContext('2d')!
    const canvasSize = TETROMINO_SIZE * board.blockSize
    canvas.width = canvasSize
    canvas.height = canvasSize
    context.scale(board.blockSize, board.blockSize)
    context.fillStyle = '#333'
    context.fillRect(0, 0, canvasSize, canvasSize)
    return context
}

export const drawGameGrid = (context: CanvasRenderingContext2D, board: GameBoard, debug: boolean = false): void => {
    board.tiles.forEach((value, index) => {
        const { x, y } = indexToCoordinates(index, board.width)
        if (value === 0) {
            context.fillStyle = 'black'
        } else {
            context.fillStyle = 'white'
        }
        context.strokeStyle = '#333'
        context.fillRect(x, y, 1, 1)
        context.strokeRect(x, y, 1, 1)
    })
}

export const drawNextTetrominoGrid = (context: CanvasRenderingContext2D, board: GameBoard): void => {
    board.tiles.forEach((value, index) => {
        const { x, y } = indexToCoordinates(index, board.width)
        if (value === 1) {
            context.fillStyle = 'white'
        } else {
            context.fillStyle = 'black'
        }
        context.strokeStyle = '#555'
        context.lineWidth = 0.1
        context.fillRect(x, y, 1, 1)
        context.strokeRect(x, y, 1, 1)
    })
}

const drawTile = (context: CanvasRenderingContext2D, localCoordinate: Coordinate, globalCoordinate: Coordinate | null, color: string): void => {
    const globalX = globalCoordinate?.x || 0
    const globalY = globalCoordinate?.y || 0
    context.lineWidth = 0.1
    context.fillStyle = color;
    context.strokeStyle = '#555';
    context.fillRect(globalX + localCoordinate.x, globalY + localCoordinate.y, 1, 1)
    context.strokeRect(globalX + localCoordinate.x, globalY + localCoordinate.y, 1, 1)
}

export const drawTetromino = (context: CanvasRenderingContext2D, currentPiece: Tetromino | null): void => {
    if (!currentPiece) return
    currentPiece.getDrawableShape().forEach((value, index) => {
        if (value === 0) return
        const globalCoordinate = getDrawableCoordinate(currentPiece)
        drawTile(context, indexToCoordinates(index), globalCoordinate, currentPiece!.color)
    })
}

export const drawTetrominoLocally = (context: CanvasRenderingContext2D, tetromino: Tetromino | null): void => {
    if (!tetromino) return
    tetromino.getDrawableShape().forEach((value, index) => {
        if (value === 0) return
        drawTile(context, indexToCoordinates(index), null, tetromino!.color)
    })
}

export const showGameOver = (): void => {
    const gameOver = document.querySelector('.game-over') as HTMLDivElement
    gameOver.style.visibility = 'visible'
}