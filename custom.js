import {Sudoku} from "./methods.js";

let board = document.querySelector('.board')
let start = document.getElementById('start')
let reset = document.getElementById('reset')
let printer = document.getElementById('print')
let tiles = []
let bigTiles = []

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
            let smallTile = document.createElement('input')
            smallTile.type = 'number'
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

const sudoku = new Sudoku(tiles, undefined, bigTiles, undefined, undefined, 'value', '')

for (const t of tiles) {
    t.addEventListener('input', e => {
    sudoku.checkNum(e.target)
    sudoku.findSameValue(e.target.value);
    })
    t.addEventListener('click', e => {
    sudoku.findSameValue(e.target.value);
    })
}

sudoku.resetSolve()

start.addEventListener('click', () => {sudoku.startSolve()})
printer.addEventListener('click', printMap)
reset.addEventListener('click', () => {sudoku.resetSolve()})

function printMap() {
    let numTiles = tiles.filter(t => {return t.value !== ''})
    let result = []
    for (let i = 1; i <= 9; i++) {
        let correspondingTiles = numTiles.filter(t => {
            return t.value == i
        })
        let ids = correspondingTiles.map(t => {
            return t.id
        })
        let object = {
            "location": ids,
            "value": i
        }
        result.push(object)
    }
    console.log(JSON.stringify(result));
}
