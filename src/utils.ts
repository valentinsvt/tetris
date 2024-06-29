import { Coordinate, Tetromino } from './tetromino'

export const pipe = (...fns: any) => (x: any = null) => fns.reduce((v: any, f: any) => f(v), x);


export const times = (number: number, fn: (index: number) => void, index: number = 0) => {
    fn(index)
    if (number > 1) times(number - 1, fn, index + 1)
}

export const get = (key: string) => (object: any) => object[key]

const transformCoordinate = (transformFunction: (param: number) => number) => (coordinate: Coordinate): Coordinate => {
    return { x: transformFunction(coordinate.x), y: transformFunction(coordinate.y) }
}
export const getDrawableCoordinate = (tetromino: Tetromino): Coordinate => {
    return pipe(
        get('coordinate'),
        transformCoordinate((param) => Math.floor(param))
    )(tetromino)
};

export const indexToCoordinates = (indexInArray: number, boardWidth: number = 4): Coordinate => {
    const x = Math.ceil(indexInArray % boardWidth)
    const y = Math.floor(indexInArray / boardWidth)
    return { x, y }
}

export const coordinateToIndex = (coordinate: Coordinate, rows: number = 4, cols: number = 4): number => {
    const maxIndex = rows * cols
    const index = coordinate.y * rows + coordinate.x
    return index < maxIndex ? index : -1
}

