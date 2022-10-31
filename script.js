import preset from "./medium.json" assert {type: 'json'} 

let board = document.querySelector('.board')
let tiles = []

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


            tiles.push(smallTile)
            bigTile.appendChild(smallTile)

        }
    }
    board.appendChild(bigTile)
}

preset.forEach(n => {
    n.location.forEach(l => {
        let tile = document.getElementById(l)
        tile.innerText = n.value
    })
})

let movesMade = true
let emptyTiles
while(movesMade){
    movesMade = false
    checkForPossibleNumbers()
    // singleFill()
}

function checkForPossibleNumbers() {
    emptyTiles = tiles.filter(t => { //get all empty tiles
        return t.innerText == ''
    })

    emptyTiles.forEach(et => { // repeat for every tile
        let adjacentTiles = tiles.filter(t => { //get all the tiles that are horizontal/vertical/same big square to the empty tile and not empty
            return ((t.id[1] == et.id[1]) || (t.id[0] == et.id[0]) || (t.parentElement.id == et.parentElement.id)) && (t.id !== et.id) && t.innerText !== ''
        })
        let numbers = [...new Set(adjacentTiles.map(t => {return t.innerText}))] // get their innertext 
        let original = [1,2,3,4,5,6,7,8,9]

        let possibleNum = original.filter(n => { // get all numbers that are not in numbers array
            return !numbers.includes(n.toString())
        })
        et.dataset.possibleNum = possibleNum // add to tile dataset
    })
}