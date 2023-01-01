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
let allowShowTimer = true
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
            if (smallTile.id == 'a1') smallTile.classList.add('focus')
            smallTile.classList.add('tile')
            smallTile.classList.add('small')
            smallTile.dataset.userAns = ''
            smallTile.dataset.note = ''
            tiles.push(smallTile)
            bigTile.appendChild(smallTile)

        }
    }
    board.appendChild(bigTile)
    bigTiles.push(bigTile)
}

let sudoku = new Sudoku(tiles, maps, bigTiles, difficulty, currentMap, 'dataset', timer)

for (const t of tiles) {
    t.addEventListener('click', e => {
        changeFocus(e.target)
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
    if (!e.target.classList.contains('note'))sudoku.findSameValue(e.target.value);
})

reset.addEventListener('click', resetEventListener)

randomize.addEventListener('click', randomizeEventListener)

start.addEventListener('click', startEventListener)

error.addEventListener('click', errorEventListener)

timerCheckbox.addEventListener('click', timerEventListener)

notes.addEventListener('click', notesEventListener)

document.addEventListener("selectstart", e => e.preventDefault());

document.onkeydown = e => inputValue(e.key)

function revealAns() {
    isShownAns = true
    for (const t of tiles) {
        t.dataset.userAns = t.innerText
        if (t.classList.contains('note')) {
            t.classList.remove('note')
            t.dataset.userAns = ''
        }
        
        t.innerText = t.dataset.ans
        t.style.color = 'blue'
    }
    start.innerText = 'Hide Answers (a)'
}

function hideAns() {
    isShownAns = false
    let filledTiles = tiles.filter(t => {
        return !t.classList.contains('preset')
    })
    for (const t of filledTiles) {
        t.innerText = t.dataset.userAns
        checkforErrors(t, allowCheckErrors)
        if (t.dataset.note !== '') {  
            for (const n of Array.from(t.dataset.note)) {
                takeNote(t, n)
            }
        }
    }
    start.innerText = 'Show Answers (a)'
}

function checkforWin() {
    if (isShownAns) return

    let isWin = true
    for (const t of tiles)
        if (t.innerText == '' || t.dataset.error == 'true') isWin = false

    if (!isWin) return

    Timer.stop()
    win.innerText = "You Win!"


}

function changeFocus(tile) {
    for (const t of tiles) {
        t.classList.remove('focus')
    }
    if (tile.classList.contains('preset')) return
    tile.classList.add('focus')

}

function checkforErrors(tile) {
    let value = parseFloat(tile.innerText)
    let adjacentTiles = tiles.filter(t => {
        return t.innerText !== '' && (tile.id[0] == t.id[0] || tile.id[1] == t.id[1] || tile.parentElement == t.parentElement) && tile !== t
    })
    let impossibleNum = [...new Set(adjacentTiles.map(t => {
        return t.value
    }))]
    tile.style.color = (impossibleNum.includes(value) && allowCheckErrors) ? 'red' : 'blue';
    tile.dataset.error = (impossibleNum.includes(value)) ? true : false;
}

function inputValue(value) {
    if (!['Backspace', 'p', 'P', 'm', 'M', 't', 'T', 'r', 'R', 'a', 'A', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(value) && isNaN(value) || value == ' ' || value == 0) return
    if (isNaN(value) && value !== 'Backspace') {
        switch (value) {
            case 'p':
            case 'P':
                notesEventListener()
                notes.checked = !notes.checked
                break;
            case 'm': 
            case 'M':
                errorEventListener()
                error.checked = !error.checked
                break;
            case 't':
            case 'T':
                timerEventListener()
                timerCheckbox.checked = !timerCheckbox.checked
                break;
            case 'r':
            case 'R':
                resetEventListener()
                reset.checked = !reset.checked
                break;
            case 'a':
            case 'A':
                startEventListener()
                start.checked = !start.checked
                break;
            case 'ArrowLeft':
                move('left')
                break;
            case 'ArrowRight':
                move('right')
                break;
            case 'ArrowUp':
                move('up')
                break;
            case 'ArrowDown':
                move('down')
                break;
            default:
                break;
        }
        return
    }

    let focusedTile = tiles.filter(t => {
        return t.classList.contains('focus')
    })

    if (focusedTile == '' || isShownAns) return
    focusedTile = focusedTile[0]

    if (focusedTile.classList.contains('preset')) return

    if ((!isTakingNotes && focusedTile.value == value) || value == 'Backspace') {
        focusedTile.innerText = ''
        focusedTile.value = ''
        focusedTile.dataset.note = ''
        sudoku.findSameValue(focusedTile.value)
        return
    }

    Timer.start(timer)

    if (isTakingNotes) {
        takeNote(focusedTile, value)
        return
    }
    if (focusedTile.children !== '') {
        focusedTile.textContent = ''
        focusedTile.classList.remove('note')
        focusedTile.dataset.note = ''
    }
    focusedTile.innerText = value
    focusedTile.value = value
    checkforErrors(focusedTile)
    if (focusedTile.style.color == 'blue') {
        removeNotes(focusedTile)
    }
    sudoku.findSameValue(focusedTile.value)
    checkforWin()
}

function takeNote(tile, value) {
    if (tile.value !== '') return
    tile.classList.add('note')
    tile.style.color = 'blue'
    let noteValues = Array.from(tile.dataset.note);

    if (tile.innerHTML == '') {
        for (let i = 1; i <= 9; i++) {
            const element = document.createElement('div')
            element.value = i
            element.style.pointerEvents = 'none'
            if (value == i) element.innerText = i
            tile.appendChild(element)
        }
        noteValues = [value]
    } else {
        for (const t of tile.children) {
            if (t.value == value && t.innerText == '') {
                t.innerText = value
                noteValues.push(value)
            } else if (t.innerText == value) {
                t.innerText = ''
                let index = noteValues.indexOf(value)
                noteValues.splice(index, 1)
            }

        }
    }

    tile.dataset.note = [...new Set(noteValues)].join('')
}

function removeNotes(tile) {
    let value = tile.value
    let adjacentTiles = tiles.filter(t => {
        return t.dataset.note.includes(value) && (t.id[0] == tile.id[0] || t.id[1] == tile.id[1])
    })
    for (const t of adjacentTiles) {
        takeNote(t, value)
    }
}

function move(direction) {
    let focusedTile = tiles.filter(t => {
        return t.classList.contains('focus')
    })[0]
    if (focusedTile == '') return
    let x = focusedTile.id.charCodeAt(0)
    let y = parseFloat(focusedTile.id[1])

    let nextTile = focusedTile

    switch (direction) {
        case 'left':
            if (x > 97) nextTile = document.getElementById(String.fromCharCode(x - 1) + y)
            break;
        case 'right':
            if (x < 105) nextTile = document.getElementById(String.fromCharCode(x + 1) + y)
            break;
        case 'up':
            if (y > 1) nextTile = document.getElementById(String.fromCharCode(x) + (y - 1))
            break;
        case 'down':
            if (y < 9) nextTile = document.getElementById(String.fromCharCode(x) + (y + 1))
            break;
        default:
            break;
    }
    for (const t of tiles) {
        t.classList.remove('focus')
    }
    nextTile.classList.add('focus')
}

//-------------------------------------------------------------------------------------------------------------------------------------------------

function resetEventListener() {
    hideAns()
    sudoku.resetSolve()
    win.innerText = ''
}

function randomizeEventListener() {
    hideAns()
    win.innerText = ''
    sudoku.randomizeMap(stageNumber, current)
}

function startEventListener() {
    sudoku.startSolve();
    Timer.stop();
    (isShownAns) ? hideAns(): revealAns();
}

function errorEventListener() {
    allowCheckErrors = !allowCheckErrors
    for (let t of tiles) {
        checkforErrors(t)
    }
}

function timerEventListener() {
    allowShowTimer = !allowShowTimer
    Timer.display(timer, allowShowTimer)
}

function notesEventListener() {
    isTakingNotes = !isTakingNotes
    let filledTiles = tiles.filter(t => {
        return t.value !== '' && !t.classList.contains('preset')
    })
    for (const t of filledTiles) {
        t.readOnly = (isTakingNotes) ? true : false;
    }
}

sudoku.randomizeMap(stageNumber, current)