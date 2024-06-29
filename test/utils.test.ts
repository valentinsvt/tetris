import { expect, test, describe } from 'vitest'
import { Chance } from 'chance'
import { coordinateToIndex, indexToCoordinates } from '../src/utils'

describe('coordinates <=> indexes conversion', () => {
    const chance = Chance()
    const rows = 4
    const cols = 4
    describe('coordinates to array index', () => {
        test('returns 0 for the 0,0 coordinate', () => {
            expect(coordinateToIndex({ x: 0, y: 0 }, rows, cols)).toBe(0)
        })

        test('returns X value is coordinate is on the first row', () => {
            const x = chance.integer({ min: 0, max: 3 })
            expect(coordinateToIndex({ x, y: 0 }, rows, cols)).toBe(x)
        })

        test('returns 4 for the first element of the second row', () => {
            expect(coordinateToIndex({ x: 0, y: 1 }, rows, cols)).toBe(4)
        })

        test('returns 13 for the first element of the second row', () => {
            expect(coordinateToIndex({ x: 1, y: 3 }, rows, cols)).toBe(13)
        })

        test('works for asymmetrical shapes', () => {
            expect(coordinateToIndex({ x: 2, y: 4 }, 3, 5)).toBe(14)
            expect(coordinateToIndex({ x: 4, y: 1 }, 6, 2)).toBe(10)
            expect(coordinateToIndex({ x: 1, y: 3 }, 5, 6)).toBe(16)
        })

        test('returns -1 when out of bounds', () => {
            expect(coordinateToIndex({ x: 5, y: 1 }, 2, 2)).toBe(-1)
            expect(coordinateToIndex({ x: 0, y: 3 }, 2, 2)).toBe(-1)
        })
    })

    describe('array index to coordinates', () => {
        const boardWidth = 4
        test('returns 0,0 for position 0', () => {
            expect(indexToCoordinates(0, boardWidth)).toEqual({ x: 0, y: 0 })
        })

        test('returns 0,1 for the first element after the boardWidth', () => {
            expect(indexToCoordinates(4, boardWidth)).toEqual({ x: 0, y: 1 })
        })

        test('returns 3,1 for the 7th element', () => {
            expect(indexToCoordinates(7, boardWidth)).toEqual({ x: 3, y: 1 })
        })
    })

    test('works both ways', () => {
        const x = chance.integer({ min: 0, max: 3 })
        const y = chance.integer({ min: 0, max: 3 })
        expect(indexToCoordinates(coordinateToIndex({ x, y }, rows, cols), cols)).toEqual({ x, y })
    })
})
