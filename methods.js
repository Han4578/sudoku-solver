export class Sudoku {

    constructor(tiles, maps, bigTiles, difficulty, currentMap, type, timer) {
        this.tiles = tiles
        this.maps = maps
        this.bigTiles = bigTiles
        this.difficulty = difficulty
        this.currentMap = currentMap
        this.type = type
        this.timer = timer
    }

    startSolve() {
        if (this.type == "value") {
            let presetTiles = this.tiles.filter(t => {
                return t.value !== ''
            })
            for (const tile of presetTiles) {
                tile.classList.add('preset')
            }
        }
        do {
            this.movesMade = 0;
            this.findNakedSingles()
            this.findHiddenSingles()
            this.findNakedPairs()
            this.findPointingPairs()
            if (this.movesMade > 0) this.count++
        } while (this.movesMade > 0 && this.count < 30)

        if(this.type !== 'dataset') console.log(this.count + ((this.count == 1) ? ' move' : ' moves'));
    }


    singleSolve() {
        this.movesMade = 0
        this.findNakedSingles()
        this.findHiddenSingles()
        this.findNakedPairs()
        this.findPointingPairs()

        if (this.movesMade > 0) console.log('move ' + ++this.count);
        else console.log('finished solve at move ' + this.count);
    }

    resetSolve() {
        this.count = 0
        let resetTiles = (this.type == 'value') ? this.tiles : (this.tiles.filter(t => {
            return !t.classList.contains('preset')
        }));
        for (const t of resetTiles) {
            switch (this.type) {
                case 'innerText':
                    t.innerText = ''
                    break;
                case 'value':
                    t.value = ''
                    break;
                case 'dataset':
                    t.dataset.ans = ''
                    t.value = ''
                    break;
                default:
                    break;
            }
            t.readOnly = false
            t.dataset.possibleNum = []
            t.dataset.impossibleNum = []
        }
    }

    changeDifficulty(d, current, stageNumber) {
        this.difficulty = d.innerText
        this.randomizeMap(stageNumber, current)
    }

    randomizeMap(stageNumber, current) {
        let newMap = []
        let mapList = this.maps.filter(m => {
            return m[0] == this.difficulty && m !== this.currentMap
        })
        let index = Math.floor(Math.random() * mapList.length)
        newMap = mapList[index]
        this.currentMap = newMap
        this.resetSolve()
        Timer.reset(this.timer)
        for (const t of this.tiles) {
            switch (this.type) {
                case 'innerText':
                    t.innerText = ''
                    break;
                case 'value':
                    t.value = ''
                    break;
                case 'dataset':
                    t.innerText = ''
                    t.dataset.ans = ''
                    break;
                default:
                    break;
            }
            t.classList.remove('preset')
        }
        for (let i = 2; i < newMap.length; i++) {
            const n = newMap[i]
            for (const l of n.location) {
                let tile = document.getElementById(l)
                switch (this.type) {
                    case 'innerText':
                        tile.innerText = n.value
                        break;
                    case 'value':
                        tile.value = n.value
                        break;
                    case 'dataset':
                        tile.innerText = tile.value = tile.dataset.ans = n.value
                        break;
                    default:
                        break;
                }
                tile.classList.add('preset')
            }
        }
        current.innerText = "Current difficulty: " + newMap[0]
        stageNumber.innerText = newMap[1]
    }

    updateEmptyTiles() {
        this.emptyTiles = this.tiles.filter(t => { //get all empty this.tiles
            return this.getCondition(t) == '';
        })
        this.checkForPossibleNumbers()
    }

    countNumbers(arr) {
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

    groupRemove(group, exceptions, num) {
        let a = exceptions[0]
        let b = exceptions[1]
        let emptyTiles = this.tiles.filter(t => {
            return (this.getCondition(t) == '') && t !== a && t !== b && t.id.includes(group)
        })
        for (const t of emptyTiles) {
            let possibleNum = [...t.dataset.possibleNum]
            let impossibleNum = [...t.dataset.impossibleNum]
            if (possibleNum.includes(num)) {
                possibleNum.pop(num)
                this.movesMade++
            }
            if (!impossibleNum.includes(num)) {
                impossibleNum.push(num)
                this.movesMade++
            }

            t.dataset.possibleNum = possibleNum.join('')
            t.dataset.impossibleNum = impossibleNum.join('')
        }

    }

    checkForPossibleNumbers() {
        for (const et of this.emptyTiles) { // repeat for every tile
            let adjacentTiles = this.tiles.filter(
                t => { //get all the this.tiles that are horizontal/vertical/same big square to the empty tile and not empty
                    return ((t.id[1] == et.id[1]) || (t.id[0] == et.id[0]) || (t.parentElement.id == et
                        .parentElement.id)) && (t.id !== et.id) && (this.getCondition(t) !== '')
                })
            let numbers = [...new Set(adjacentTiles.map(t => {
                return this.getCondition(t)
            }))] // get their innertext/value
            let original = [1, 2, 3, 4, 5, 6, 7, 8, 9]

            let possibleNum = original.filter(n => { // get all numbers that are not in numbers array
                return !numbers.includes(n.toString()) && ![...et.dataset.impossibleNum].includes(n.toString())
            })
            et.dataset.possibleNum = possibleNum.join('') // add to tile dataset
        }
    }

    findNakedSingles() { //find tiles with only one possibility
        this.updateEmptyTiles()
        let singleTiles = this.emptyTiles.filter(t => {
            return t.dataset.possibleNum.length == 1
        })
        if (singleTiles.length > 0) {
            for (const t of singleTiles) {
                switch (this.type) {
                    case 'innerText':
                        t.innerText = t.dataset.possibleNum
                        break;
                    case 'value':
                        t.value = t.dataset.possibleNum
                        break;
                    case 'dataset':
                        t.dataset.ans = t.dataset.possibleNum
                        break;
                    default:
                        break;
                }
                this.movesMade++
            }
        }
    }

    findHiddenSingles() { //find tiles where the unplaced number in the bigtile has only one possibility
        this.updateEmptyTiles()
        for (const bt of this.bigTiles) {
            let empty = this.emptyTiles.filter(t => {
                return t.parentElement == bt
            })
            let count = this.countNumbers(empty)
            for (const key in count) {
                if (count[key] == 1) {
                    for (const t of empty) {
                        if (t.dataset.possibleNum.includes(key)) {
                            switch (this.type) {
                                case 'innerText':
                                    t.innerText = key
                                    break;
                                case 'value':
                                    t.value = key
                                    break;
                                case 'dataset':
                                    t.dataset.ans = key
                                    break;
                                default:
                                    break;
                            }
                            this.movesMade++
                        }
                    }
                }
            }
        }
    }

    findNakedPairs() {
        this.updateEmptyTiles()
        for (let i = 1; i <= 9; i++) {
            let column = this.emptyTiles.filter(t => {
                return t.id[0] == String.fromCharCode(i + 96)
            })
            let row = this.emptyTiles.filter(t => {
                return t.id[1] == i
            })
            let bigTile = this.emptyTiles.filter(t => {
                return t.parentElement == this.bigTiles[i]
            })
            const directions = [row, column, bigTile]
            for (const d of directions) {
                let possiblePairs = d.filter(t => { // find all this.tiles with 2 possible num
                    return t.dataset.possibleNum.length == 2
                })
                let possiblePairsNum = possiblePairs.map(t => { // get their num
                    return t.dataset.possibleNum
                })
                let pairs = possiblePairsNum.filter((t, i) => { // find pairs among this.tiles
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
                                this.movesMade++
                            }
                            if (!impossibleNum.includes(p)) {
                                impossibleNum.push(p)
                                this.movesMade++
                            }

                            t.dataset.possibleNum = possibleNum.join('')
                            t.dataset.impossibleNum = impossibleNum.join('')
                        }
                    }
                    this.updateEmptyTiles()
                }

            }
        }

    }

    findPointingPairs() {
        this.updateEmptyTiles()
        for (const bt of this.bigTiles) {
            let emptyTiles = this.tiles.filter(t => {
                return (this.getCondition(t) == '') && t.parentElement == bt
            })
            let count = this.countNumbers(emptyTiles)
            if (count.length == 0) return
            for (const key in count) {
                if (count[key] == 2) {
                    let pairs = emptyTiles.filter(t => {
                        return t.dataset.possibleNum.includes(key)
                    })
                    let a = pairs[0]
                    let b = pairs[1]
                    if (a.id[0] == b.id[0]) {
                        this.groupRemove(a.id[0], [a, b], key)
                        this.movesMade++
                    }
                    if (a.id[1] == b.id[1]) {
                        this.groupRemove(a.id[1], [a, b], key)
                        this.movesMade++
                    }
                }
                this.updateEmptyTiles()
            }

        }
    }

    getCondition(t) {
        let condition
        switch (this.type) {
            case 'innerText':
                condition = t.innerText
                break;
            case 'value':
                condition = t.value
                break;
            case 'dataset':
                condition = t.dataset.ans
                break;
            default:
                break;
        }
        return condition
    }
}

export let Timer = {
    isRunning: false,
    ID: '',
    start(timer) {
        if(!this.isRunning) {
            this.isRunning = true
            let time = timer.innerText.split(':')
            let minutes = parseInt(time[0])
            let seconds = parseInt(time[1])
            this.ID = setInterval(() => {
                seconds++
                if (seconds == 60) {
                    seconds = 0
                    minutes++
                }
                let displayedSeconds = seconds
                if (seconds < 10) displayedSeconds = '0' + displayedSeconds.toString()
                timer.innerText = minutes + ':' + displayedSeconds
            }, 1000)
        }
    },
    stop() {
        clearInterval(this.ID)
        this.isRunning = false
    },
    reset(timer) {
        if(timer == '') return
        timer.innerText = '0:00'
        this.isRunning = false
        clearInterval(this.ID)
    },
    display(timer, display) {
        timer.style.display = (display)? 'inline' : 'none'
    }

}    

