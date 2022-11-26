import {stages} from "./stages/index.js"

let board = document.querySelector('.board')
let start = document.getElementById('start')
let single = document.getElementById('single')
let reset = document.getElementById('reset')
let randomize = document.querySelector('.swap')
let current = document.getElementById('current')
let stageMenu = document.getElementById('stages')
let tiles = []
let bigTiles = []
let preset = stages[2]

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

for (const s of stages) {
    let button = document.createElement('button')
    button.classList.add('difficulty')
    button.innerText = s[0]
    button.addEventListener("click", () => {
        changeDifficulty(s)
    })
    stageMenu.appendChild(button)
}

changeDifficulty(preset)
//-----------------------------------------------------------------------------------------------------------

let movesMade
let emptyTiles
start.addEventListener('click', startSolve)
single.addEventListener('click', singleSolve)
reset.addEventListener('click', resetSolve)
randomize.addEventListener('click', randomizeMap)

function startSolve() {
    movesMade = 1
    let count = 0
    while (movesMade > 0 && count < 30) {
        movesMade = 0
        findNakedSingles()
        findHiddenSingles()
        findNakedPairs()
        findPointingPairs()
        if (movesMade > 0) count++
    }
    console.log(count + ' moves');
}
function singleSolve() {
    let count = 0
    findNakedSingles()
    findHiddenSingles()
    findNakedPairs()
    findPointingPairs()
    count++
    console.log(count + ' moves');
}

function resetSolve() {
    let resetTiles = tiles.filter(t => {
        return !t.classList.contains('preset')
    })
    for (const t of resetTiles) {
        t.innerText = ''
        t.dataset.possibleNum = []
        t.dataset.impossibleNum = []
    }
}

function changeDifficulty(difficulty) {
    resetSolve()
    for (const t of tiles) {
        t.innerText = ''
        t.classList.remove('preset')
    }
    current.innerText = "Current difficulty: " + difficulty[0]
    for (let i = 1; i < difficulty.length; i++) {
        const n = difficulty[i];
        for (const l of n.location) {
            let tile = document.getElementById(l)
            tile.innerText = n.value
            tile.classList.add('preset')
        }
    }
}

function randomizeMap() {
    let index = Math.floor(Math.random() * stages.length)
    changeDifficulty(stages[index])
}

function updateEmptyTiles() {
    emptyTiles = tiles.filter(t => { //get all empty tiles
        return t.innerText == ''
    })
    checkForPossibleNumbers()
}

function countNumbers(arr) {
    let pNum = arr.map(t => {
        return t.dataset.possibleNum
    })
    let count = {}
    for (const n of pNum) {
        let array = [...n]
        for (const num of array) {
            count[num] = (count[num] || 0) + 1 //if number doesn't exist in object, count = 1, else count +=1
        }
    }
    return count
}

function groupRemove(group, exceptions, num) {
    let a = exceptions[0]
    let b = exceptions[1]
    let emptyTiles = tiles.filter(t => {
        return t.innerText == '' && t !== a && t !== b && t.id.includes(group)
    })
    for (const t of emptyTiles) {
        let possibleNum = [...t.dataset.possibleNum]
        let impossibleNum = [...t.dataset.impossibleNum]
        if (possibleNum.includes(num)) {
            possibleNum.pop(num)
            movesMade++
        }
        if (!impossibleNum.includes(num)) {
            impossibleNum.push(num)
            movesMade++
        }

        t.dataset.possibleNum = possibleNum.join('')
        t.dataset.impossibleNum = impossibleNum.join('')
    }

}

function checkForPossibleNumbers() {
    for (const et of emptyTiles) { // repeat for every tile
        let adjacentTiles = tiles.filter(
            t => { //get all the tiles that are horizontal/vertical/same big square to the empty tile and not empty
                return ((t.id[1] == et.id[1]) || (t.id[0] == et.id[0]) || (t.parentElement.id == et
                    .parentElement.id)) && (t.id !== et.id) && t.innerText !== ''
            })
        let numbers = [...new Set(adjacentTiles.map(t => {
            return t.innerText
        }))] // get their innertext 
        let original = [1, 2, 3, 4, 5, 6, 7, 8, 9]

        let possibleNum = original.filter(n => { // get all numbers that are not in numbers array
            return !numbers.includes(n.toString()) && ![...et.dataset.impossibleNum].includes(n.toString())
        })
        et.dataset.possibleNum = possibleNum.join('') // add to tile dataset
    }
}

function findNakedSingles() { //find tiles with only one possibility
    updateEmptyTiles()
    let singleTiles = emptyTiles.filter(t => {
        return t.dataset.possibleNum.length == 1
    })
    if (singleTiles.length > 0) {
        for (const t of singleTiles) {
            t.innerText = t.dataset.possibleNum;
            movesMade++
        }
    }
}

function findHiddenSingles() { //find tiles where the unplaced number in the bigtile has only one possibility
    updateEmptyTiles()
    for (const bt of bigTiles) {
        let empty = emptyTiles.filter(t => {
            return t.parentElement == bt
        })
        let count = countNumbers(empty)
        for (const key in count) {
            if (count[key] == 1) {
                for (const t of empty) {
                    if (t.dataset.possibleNum.includes(key)) {
                        t.innerText = key
                        movesMade++
                    }
                }
            }
        }
    }
}

function findNakedPairs() {
    updateEmptyTiles()
    for (let i = 1; i <= 9; i++) {
        let column = emptyTiles.filter(t => {
            return t.id[0] == String.fromCharCode(i + 96)
        })
        let row = emptyTiles.filter(t => {
            return t.id[1] == i
        })
        let bigTile = emptyTiles.filter(t => {
            return t.parentElement == bigTiles[i]
        })
        const directions = [row, column, bigTile]
        for (const d of directions) {
            let possiblePairs = d.filter(t => { // find all tiles with 2 possible num
                return t.dataset.possibleNum.length == 2 
            })
            let possiblePairsNum = possiblePairs.map(t => { // get their num
                return t.dataset.possibleNum
            })
            let pairs = possiblePairsNum.filter((t, i) => { // find pairs among tiles
                return possiblePairsNum.indexOf(t) !== i
            })
            for (const pair of pairs) {
                let notPair = d.filter(t => {
                    return t.dataset.possibleNum !== pair
                });

                for (const p of [pair[0], pair[1]]) {
                    for (const t of notPair) {
                        let possibleNum = [...t.dataset.possibleNum]
                        let impossibleNum = [...t.dataset.impossibleNum]
                        if (possibleNum.includes(p)) {
                            possibleNum.pop(p)
                            movesMade++
                        }
                        if (!impossibleNum.includes(p)) {
                            impossibleNum.push(p)
                            movesMade++
                        }

                        t.dataset.possibleNum = possibleNum.join('')
                        t.dataset.impossibleNum = impossibleNum.join('')
                    }
                }
                updateEmptyTiles()
            }

        }
    }

}

function findPointingPairs() {
    updateEmptyTiles()
    for (const bt of bigTiles) {
        let emptyTiles = tiles.filter(t => {
            return t.innerText == '' && t.parentElement == bt
        })
        let count = countNumbers(emptyTiles)
        if (count.length == 0) return
        for (const key in count) {
            if (count[key] == 2) {
                let pairs = emptyTiles.filter(t => {
                    return t.dataset.possibleNum.includes(key)
                })
                let a = pairs[0]
                let b = pairs[1]
                if (a.id[0] == b.id[0]) {
                    groupRemove(a.id[0], [a, b], key)
                    movesMade++
                }
                if (a.id[1] == b.id[1]) {
                    groupRemove(a.id[1], [a, b], key)
                    movesMade++
                }
            }
            updateEmptyTiles()
        }

    }
}