import { times } from "./utils";

export interface GameBoard {
    blockSize: number;
    width: number;
    height: number;
    tiles: number[];
    fallingSpeed: number;
    paused: boolean;
}

export const initBoard = (): GameBoard => {
    const gameBoard: GameBoard = {
        blockSize: 22,
        width: 14,
        height: 30,
        fallingSpeed: 0.08,
        tiles: [] as number[],
        paused: false
    }
    times(gameBoard.width * gameBoard.height, () => gameBoard.tiles.push(0))
    return gameBoard
}