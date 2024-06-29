import { GameBoard } from './gameBoard'
import { Coordinate, Tetromino, buildTetromino } from './tetromino'
import { coordinateToIndex, indexToCoordinates, times, pipe, getDrawableCoordinate } from './utils'
import { Chance } from 'chance'

export enum TetrominoCommands {
    Rotate,
    Left,
    Right,
    Fall
}

export enum BoardCommands {
    Accelerate,
    SlowDown,
    TogglePause
}

const addCommand = <Type>(command: Type, commands: Type[]): Type[] => {
    if (commands.indexOf(command) !== -1) return commands
    return [...commands, command]
}

export const addAccelerateCommand = (commands: BoardCommands[]): BoardCommands[] => {
    return addCommand(BoardCommands.Accelerate, commands)
}

export const addSlowDownCommand = (commands: BoardCommands[]): BoardCommands[] => {
    return addCommand(BoardCommands.SlowDown, commands)
}

export const addTogglePauseCommand = (commands: BoardCommands[]): BoardCommands[] => {
    return addCommand(BoardCommands.TogglePause, commands)
}

export const addLeftCommand = (commands: TetrominoCommands[]): TetrominoCommands[] => {
    return addCommand(TetrominoCommands.Left, commands)
}

export const addRightCommand = (commands: TetrominoCommands[]): TetrominoCommands[] => {
    return addCommand(TetrominoCommands.Right, commands)
}

export const addRotateCommand = (commands: TetrominoCommands[]): TetrominoCommands[] => {
    return addCommand(TetrominoCommands.Rotate, commands)
}


const addFallCommand = (commands: TetrominoCommands[]): TetrominoCommands[] => {
    return addCommand(TetrominoCommands.Fall, commands)
}

export const resetCommandQueue = (): TetrominoCommands[] => addFallCommand([])

export const executeTetrominoCommands = (gameBoard: GameBoard, commands: TetrominoCommands[], currentPiece: Tetromino | null): Tetromino | null => {
    if (!currentPiece) return null
    const collisions = checkAllCollisions(gameBoard, currentPiece)
    return pipe(
        fall(commands)(gameBoard),
        rotate(commands),
        left(commands)(collisions),
        right(commands)(collisions)
    )(currentPiece) as Tetromino
}

const rotate = (commands: TetrominoCommands[]) => (tetromino: Tetromino): Tetromino => {
    if (commands.indexOf(TetrominoCommands.Rotate) === -1) return tetromino
    const newShapeIndex = tetromino.currentShapeIndex + 1 === tetromino.shapes.length ? 0 : tetromino.currentShapeIndex + 1
    return { ...tetromino, currentShapeIndex: newShapeIndex }
}

const left = (commands: TetrominoCommands[]) => (collisions: Collisions) => (tetromino: Tetromino): Tetromino => {
    if (commands.indexOf(TetrominoCommands.Left) === -1) return tetromino
    if (collisions.left) return tetromino
    return { ...tetromino, coordinate: { ...tetromino.coordinate, x: tetromino.coordinate.x - 1 } }
}

const right = (commands: TetrominoCommands[]) => (collisions: Collisions) => (tetromino: Tetromino): Tetromino => {
    if (commands.indexOf(TetrominoCommands.Right) === -1) return tetromino
    if (collisions.right) return tetromino
    return { ...tetromino, coordinate: { ...tetromino.coordinate, x: tetromino.coordinate.x + 1 } }
}

const fall = (commands: TetrominoCommands[]) => (gameBoard: GameBoard) => (tetromino: Tetromino): Tetromino | null => {
    if (commands.indexOf(TetrominoCommands.Fall) === -1) return tetromino
    const a = { ...tetromino, coordinate: { ...tetromino.coordinate, y: tetromino.coordinate.y + gameBoard.fallingSpeed } }
    return a
}

export const executeBoardCommands = (gameBoard: GameBoard, commands: BoardCommands[]): GameBoard => {
    return pipe(
        togglePause(commands),
        accelerate(commands),
        slowDown(commands),
    )(gameBoard) as GameBoard
}

const togglePause = (commands: BoardCommands[]) => (gameBoard: GameBoard): GameBoard | null => {
    if (commands.indexOf(BoardCommands.TogglePause) === -1) return gameBoard
    return { ...gameBoard, paused: !gameBoard.paused }
}

const accelerate = (commands: BoardCommands[]) => (gameBoard: GameBoard): GameBoard | null => {
    if (commands.indexOf(BoardCommands.Accelerate) === -1) return gameBoard
    return { ...gameBoard, fallingSpeed: 1 }
}

const slowDown = (commands: BoardCommands[]) => (gameBoard: GameBoard): GameBoard | null => {
    if (commands.indexOf(BoardCommands.SlowDown) === -1) return gameBoard
    return { ...gameBoard, fallingSpeed: 0.08 }
}

interface Collisions {
    left: boolean;
    right: boolean;
    bottom: boolean;
}

const checkTileBottomCollision = (globalCoordinate: Coordinate, localCoordinate: Coordinate, gameBoard: GameBoard): boolean => {
    const nextGlobalCoordinate = { x: globalCoordinate.x + localCoordinate.x, y: globalCoordinate.y + localCoordinate.y + 1 }
    const nextGlobalIndex = coordinateToIndex(nextGlobalCoordinate, gameBoard.width, gameBoard.height)
    if (gameBoard.tiles[nextGlobalIndex] != 0) return true
    return false
}

const checkTileLeftCollision = (globalCoordinate: Coordinate, localCoordinate: Coordinate, gameBoard: GameBoard): boolean => {
    if (globalCoordinate.x === 0) return true
    const nextGlobalCoordinate = { x: globalCoordinate.x + localCoordinate.x - 1, y: globalCoordinate.y + localCoordinate.y }
    const nextGlobalIndex = coordinateToIndex(nextGlobalCoordinate, gameBoard.width, gameBoard.height)
    if (gameBoard.tiles[nextGlobalIndex] != 0) return true
    return false
}

const checkTileRightCollision = (globalCoordinate: Coordinate, localCoordinate: Coordinate, gameBoard: GameBoard): boolean => {
    if (globalCoordinate.x === gameBoard.width - 1) return true
    const nextX = globalCoordinate.x + localCoordinate.x + 1
    const nextGlobalCoordinate = { x: nextX, y: globalCoordinate.y + localCoordinate.y }
    const nextGlobalIndex = coordinateToIndex(nextGlobalCoordinate, gameBoard.width, gameBoard.height)
    if (gameBoard.tiles[nextGlobalIndex] === 1 || nextX >= gameBoard.width) return true
    return false
}

export const checkAllCollisions = (gameBoard: GameBoard, tetromino: Tetromino | null): Collisions => {
    const noCollisions = { left: false, right: false, bottom: false }
    if (!tetromino) return noCollisions
    const globalCoordinate = getDrawableCoordinate(tetromino)
    return tetromino.getDrawableShape().reduce((acc: Collisions, tile: number, localIndex: number) => {
        if (tile === 0) return acc
        const localCoordinate = indexToCoordinates(localIndex)
        acc.bottom = acc.bottom || checkTileBottomCollision(globalCoordinate, localCoordinate, gameBoard)
        acc.left = acc.left || checkTileLeftCollision(globalCoordinate, localCoordinate, gameBoard)
        acc.right = acc.right || checkTileRightCollision(globalCoordinate, localCoordinate, gameBoard)
        return acc
    }, noCollisions)
}

const checkTetrominoBottomCollision = (gameBoard: GameBoard, tetromino: Tetromino | null): boolean => {
    if (!tetromino) return false
    const globalCoordinate = getDrawableCoordinate(tetromino)
    return tetromino.getDrawableShape().reduce((acc: boolean, tile: number, index: number) => {
        if (tile === 0 || acc) return acc
        const localCoordinate = indexToCoordinates(index)
        acc = checkTileBottomCollision(globalCoordinate, localCoordinate, gameBoard)
        return acc
    }, false)
}

export const copyToBoard = (gameBoard: GameBoard, tetromino: Tetromino | null): GameBoard => {
    if (!tetromino) return gameBoard
    const { x: globalX, y: globalY } = getDrawableCoordinate(tetromino)
    const shape = tetromino.getDrawableShape()
    shape.forEach((tile, index) => {
        if (tile === 0) return
        const { x: localX, y: localY } = indexToCoordinates(index)
        const globalIndex = (globalY + localY) * gameBoard.width + (globalX + localX)
        gameBoard.tiles[globalIndex] = 1
    })
    return gameBoard
}

export const nextPiece = (pieceQueue: Tetromino[]): Tetromino | null => {
    if (!pieceQueue) return null
    if (pieceQueue.length === 0) return null
    return pieceQueue.shift()!
}

export const updateTetrominoQueue = (queue: Tetromino[]): Tetromino[] => {
    if (queue.length > 1) return queue
    const updatedQueue = [...queue]
    times(2, () => {
        updatedQueue.push(buildTetromino(randomPieceType()))
    })
    return updatedQueue
}

const randomPieceType = (): String => {
    const chance = new Chance()
    return chance.pickone(['O', 'I', 'J', 'L', 'S', 'T', 'Z'])
}

export const shouldSpawnANewPiece = (gameBoard: GameBoard, tetromino: Tetromino | null): boolean => {
    return checkTetrominoBottomCollision(gameBoard, tetromino)
}

export const checkForLosingCondition = (gameBoard: GameBoard): boolean => {
    return gameBoard.tiles.slice(0, gameBoard.width).reduce((acc, tile) => {
        return acc || tile === 1
    }, false)
}


// export const updateEdges = (gameTile: Tetromino | null): Tetromino | null => {
//     if (!gameTile) return null
//     const shape = gameTile.getDrawableShape()
//     const edges = shape.reduce((acc, block, index) => {
//         if (block === 0) return acc
//         const currentCoordinate = indexToCoordinates(index)
//         if (currentCoordinate.x > acc.rightEdge) acc.rightEdge = currentCoordinate.x
//         if (currentCoordinate.y > acc.bottomEdge) acc.bottomEdge = currentCoordinate.y
//         return acc
//     }, { rightEdge: -1, bottomEdge: -1 })
//     return { ...gameTile, rightEdge: edges.rightEdge + 1, bottomEdge: edges.bottomEdge + 1 }
// }