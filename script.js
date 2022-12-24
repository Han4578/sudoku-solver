import {stages} from "./stages/index.js"
import {Sudoku} from "./methods.js"

let board = document.querySelector('.board')
let start = document.getElementById('start')
let single = document.getElementById('single')
let reset = document.getElementById('reset')
let randomize = document.querySelector('.swap')
let current = document.getElementById('current')
let difficultyButtons = document.querySelectorAll('.difficulty')
let difficulty = 'Evil'
let currentMap = []
let tiles = []
let bigTiles = []
let maps = []

for (const difficulty of stages) {
    maps = maps.concat(difficulty)
}
for (let a = 1; a <= 9; a++) {
    let bigTile = document.createElement('div')
    bigTile.classList.add('tile')
    bigTile.classList.add('big')
    bigTile.id = String.fromCharCode(a + 64)

    let d = a
    let e = 0
    while (d > 3) {
        d -= 3
        e += 3
    }
    let letter = 3 * (d - 1)

    for (let b = 1; b <= 3; b++) {
        for (let c = 1; c <= 3; c++) {
            let smallTile = document.createElement('div')
            smallTile.id = String.fromCharCode(96 + c + letter) + (b + e)
            smallTile.classList.add('tile')
            smallTile.classList.add('small')
            smallTile.dataset.impossibleNum = []


            tiles.push(smallTile)
            bigTile.appendChild(smallTile)

        }
    }
    board.appendChild(bigTile)
    bigTiles.push(bigTile)
}

const sudoku = new Sudoku(tiles, maps, bigTiles, difficulty, currentMap, 'innerText', '')

for (const d of difficultyButtons) {
    d.addEventListener('click', e => {
        let newMap = sudoku.changeDifficulty(e.target)
        current.innerText = "Current difficulty: " + newMap[0]
    })
}

sudoku.randomizeMap(maps)

//-----------------------------------------------------------------------------------------------------------

start.addEventListener('click', () => {sudoku.startSolve()})
single.addEventListener('click', () => {sudoku.singleSolve()})
reset.addEventListener('click', () => {sudoku.resetSolve()})
randomize.addEventListener('click', () => {sudoku.randomizeMap()})
