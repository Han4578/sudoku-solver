let board = document.querySelector('.board')
let start = document.getElementById('start')
let single = document.getElementById('single')
let reset = document.getElementById('reset')
let stageMenu = document.getElementById('stages')
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
            smallTile.addEventListener('input', e => {
                checkNum(e)
            })

            tiles.push(smallTile)
            bigTile.appendChild(smallTile)

        }
    }
    board.appendChild(bigTile)
    bigTiles.push(bigTile)
}

function checkNum(e) {
    let value = e.target.value
    if (value > 9) value = 9 
    if (value < 1) value = 1 
    
}