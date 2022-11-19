import preset from "./stages/hard.json" assert {type: 'json'} 

let board = document.querySelector('.board')
let start = document.getElementById('start')
let reset = document.getElementById('reset')
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

preset.forEach(n => {
    n.location.forEach(l => {
        let tile = document.getElementById(l)
        tile.innerText = n.value
        tile.classList.add('preset')
    })
})

let movesMade
let emptyTiles
start.addEventListener('click', startSolve)
reset.addEventListener('click', resetSolve)

function startSolve() {
    movesMade = 1
    let count = 0
    while (movesMade > 0) {
        movesMade = 0
        findNakedSingles()
        findHiddenSingles()
        findNakedPairs()
        count++
    }
    console.log(count);
}

function resetSolve() {
    let resetTiles = tiles.filter(t => {
        return !t.classList.contains('preset')
    })
    resetTiles.forEach(t => {
        t.innerText = ''
        t.dataset.possibleNum = []
    })
}

function updateEmptyTiles() {
    emptyTiles = tiles.filter(t => { //get all empty tiles
        return t.innerText == ''
    })
    checkForPossibleNumbers()
}

function checkForPossibleNumbers() {

    emptyTiles.forEach(et => { // repeat for every tile
        let adjacentTiles = tiles.filter(t => { //get all the tiles that are horizontal/vertical/same big square to the empty tile and not empty
            return ((t.id[1] == et.id[1]) || (t.id[0] == et.id[0]) || (t.parentElement.id == et.parentElement.id)) && (t.id !== et.id) && t.innerText !== ''
        })
        let numbers = [...new Set(adjacentTiles.map(t => {
            return t.innerText
        }))] // get their innertext 
        let original = [1, 2, 3, 4, 5, 6, 7, 8, 9]

        let possibleNum = original.filter(n => { // get all numbers that are not in numbers array
            return !numbers.includes(n.toString()) && ![...et.dataset.impossibleNum].includes(n.toString())
        })
        et.dataset.possibleNum = possibleNum // add to tile dataset
    })
}

function findNakedSingles() { //find tiles with only one possibility
    updateEmptyTiles()
    let singleTiles = emptyTiles.filter(t => {
        return t.dataset.possibleNum.length == 1
    })
    if (singleTiles.length > 0) {
        singleTiles.forEach(t => {
            t.innerText = t.dataset.possibleNum;
            movesMade++
        })
    }
}

function findHiddenSingles() { //find tiles where the unplaced number in the bigtile has only one possibility
    updateEmptyTiles()
    bigTiles.forEach(bt => {
        let allValues = []
        let empty = emptyTiles.filter(t => {
            return t.parentElement == bt
        })
        empty.forEach(t => {
            let num = [...t.dataset.possibleNum]
            num.forEach(n => {
                if (!isNaN(n)) {
                    allValues.push(n)
                }
            })
        })
        let count = {}
        allValues.forEach(n => {
            count[n] = (count[n] || 0) + 1 //if number doesn't exist in object, count = 1, else count +=1
        })
        for (const key in count) {
            if (count[key] == 1) {
                empty.forEach(t => {
                    if (t.dataset.possibleNum.includes(key)) {
                        t.innerText = key
                        movesMade++
                    }
                });
            }
        }
    })
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
        directions.forEach(d => {
            let possiblePairs = d.filter(t => {
                return t.dataset.possibleNum.length == 3
            })
            let possiblePairsNum = possiblePairs.map(t => {
                return t.dataset.possibleNum
            })
            let pairs = possiblePairsNum.filter((t, i) => {
                return possiblePairsNum.indexOf(t) !== i
            }) //find dupe pairs
            pairs.forEach(pair => {
                let notPair = d.filter(t => {
                    return t.dataset.possibleNum !== pair
                });
                
                [pair[0], pair[2]].forEach(p => {
                    for (const t of notPair) {
                        let possibleNum = []
                        let impossibleNum = []
                        let pNum = [...t.dataset.possibleNum]
                        pNum.forEach(n => {
                            if (!isNaN(n)) {
                                possibleNum.push(n)
                            }
                        })
                        let ipNum = [...t.dataset.impossibleNum]
                        ipNum.forEach(n => {
                            if (!isNaN(n)) {
                                impossibleNum.push(n)
                            }
                        })
                        if (possibleNum.includes(p)) {
                            possibleNum.pop(p)
                            movesMade++
                        }
                        if (!impossibleNum.includes(p)) {
                            impossibleNum.push(p)
                            movesMade++
                        }
                        t.dataset.possibleNum = possibleNum
                        t.dataset.impossibleNum = impossibleNum
                    }
                })
            })

        })
    }
    for (let i = 1; i <= 9; i++) {

    }
}
