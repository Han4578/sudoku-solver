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
let notes = document.getElementById('notes')
let timerCheckbox = document.getElementById('timerCheckbox')
let difficultyButtons = document.querySelectorAll('.difficulty')
let difficulty = 'Evil'
let allowCheckErrors = true
let allowStartTimer = true
let isShownAns = false
let isTakingNotes = false
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
            // smallTile.type = 'text'
            smallTile.id = String.fromCharCode(96 + c + letter) + (b + e)
            smallTile.classList.add('tile')
            smallTile.classList.add('small')
            smallTile.dataset.userAns = ''
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
        Timer.start(timer)
        if (isNaN(e.target.value)) {
            e.target.value = e.target.value.slice(0, - 1); 
            return
        }
        if (isTakingNotes) {
            takeNote(e.target)
            return
        }
        sudoku.checkNum(e.target, allowCheckErrors)
        checkforWin()
    })
}

for (const d of difficultyButtons) {
    d.addEventListener('click', e => {
        hideAns()
        win.innerText = ''
        sudoku.changeDifficulty(e.target, current, stageNumber)
    })
}

document.addEventListener('click', e => {
    sudoku.changeFocus(e.target);
})
reset.addEventListener('click', () => {
    hideAns()
    sudoku.resetSolve()
    win.innerText = ''
})
randomize.addEventListener('click', () => {
    hideAns()
    win.innerText = ''
    sudoku.randomizeMap(stageNumber, current)
})
start.addEventListener('click', () => {
    sudoku.startSolve();
    Timer.stop();
    (isShownAns) ? hideAns(): revealAns();
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

notes.addEventListener('click', () => {
    isTakingNotes = !isTakingNotes
    let filledTiles = tiles.filter(t => {return t.value !== '' && !t.classList.contains('preset')})
    for (const t of filledTiles) {
        t.readOnly = (isTakingNotes)? true : false;
    }
})

sudoku.randomizeMap(stageNumber, current)

function revealAns() {
    isShownAns = true
    for (const t of tiles) {
        t.dataset.userAns = t.value
        t.value = t.dataset.ans
        t.style.color = 'blue'
    }
    start.innerText = 'Hide Answers'
}

function hideAns() {
    isShownAns = false
    let filledTiles = tiles.filter(t => {return t.value !== '' && !t.classList.contains('preset')})
    for (const t of filledTiles) {
        t.value = t.dataset.userAns
        sudoku.checkNum(t, allowCheckErrors)
    }
    start.innerText = 'Show Answers'
}

function checkforWin() {
    if (isShownAns) return

    let isWin = true
    for (const t of tiles) if (t.value == '' || t.dataset.error == 'true') isWin = false
    
    if (!isWin) return

    Timer.stop()
    win.innerText = "You Win!"

    for (const t of tiles) {
        t.readOnly = true
    }
}

function takeNote(t) {
    t.value = [...new Set(Array.from(t.value))].join('')
    t.classList.add('note')


}