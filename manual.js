import { Sudoku, Timer } from "./methods.js";
import {stages} from "./stages/index.js"


let board = document.querySelector('.board')
let randomize = document.querySelector('.swap')
let timer = document.getElementById('timer')
let stageNumber = document.getElementById('number')
let current = document.getElementById('current')
let reset = document.getElementById('reset')
let start = document.getElementById('start')
let error = document.getElementById('error')
let win = document.getElementById('win')
let timerCheckbox = document.getElementById('timerCheckbox')
let difficultyButtons = document.querySelectorAll('.difficulty')
let difficulty = 'Evil'
let allowCheckErrors = true
let allowStartTimer = true
let isShownAns = false
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
            let smallTile = document.createElement('input')
            smallTile.type = 'number'
            smallTile.id = String.fromCharCode(96 + c + letter) + (b + e)
            smallTile.classList.add('tile')
            smallTile.classList.add('small')
            tiles.push(smallTile)
            bigTile.appendChild(smallTile)

        }
    }
    board.appendChild(bigTile)
    bigTiles.push(bigTile)
}

let sudoku = new Sudoku(tiles, maps, bigTiles, difficulty, currentMap, 'dataset', timer)

for (const t of tiles) {
    t.addEventListener('input', e => {
    sudoku.checkNum(e.target, allowCheckErrors)
    Timer.start(timer)
    checkforWin()
    })
}

for (const d of difficultyButtons) {
    d.addEventListener('click', e => {
        isShownAns = false
        sudoku.changeDifficulty(e.target, current, stageNumber)
    })
}

document.addEventListener('click', e => {
sudoku.changeFocus(e.target);
})
reset.addEventListener('click', () => {
    isShownAns = false
    sudoku.resetSolve()
})
randomize.addEventListener('click', () => {
    isShownAns = false
    sudoku.randomizeMap(stageNumber, current)
})
start.addEventListener('click', () => {
    sudoku.startSolve();
    Timer.stop();
    (isShownAns)? hideAns() : revealAns();
})

error.addEventListener('click', () => {
        allowCheckErrors = !allowCheckErrors
        for (let t of tiles) {
            sudoku.checkNum(t, allowCheckErrors)
        }
})
timerCheckbox.addEventListener('click', () => {
        allowStartTimer = !allowStartTimer
        Timer.display(timer, allowStartTimer)
})

sudoku.randomizeMap(stageNumber, current)

function revealAns() {
    isShownAns = true
    for (const t of tiles) {
        t.dataset.userAns = t.value
        t.value = t.dataset.ans
        t.style.color = 'blue'
    }
}

function hideAns() {
    isShownAns = false
    for (const t of tiles) {
        t.value = t.dataset.userAns
        sudoku.checkNum(t, allowCheckErrors)
    }
}

function checkforWin() {
    if (isShownAns) return

    let isWin = true
    for (const t of tiles) {
        if (t.value == '' || t.dataset.error == 'true') isWin = false
    }
    
    if (!isWin) return
    
    Timer.stop()
    win.innerText = "You Win!"
    
    for (const t of tiles) {
        t.readOnly = true
    }
    
}