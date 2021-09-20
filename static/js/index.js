'use strict'

let body = document.querySelector('.main')

let picked = [] //picked squares and compare them
let s = [] // variable to hold picked squares not to clear them immediately
let matched = [] //hold the matched variables
let first_click = false //first time player clicks to start the timer
let game_state_won = false // check if the game is won or not
let time = 0    // time spent

//get stored record time for each level 
let recordTime = { 
    baby: localStorage.getItem('baby'),
    easy : localStorage.getItem('easy'),
    medium: localStorage.getItem('medium'),
    hard: localStorage.getItem('hard'),
    god: localStorage.getItem('god'),
}

//DOM
let newGameBtn = document.querySelector('#new_game')
let levelBtn = document.querySelector('#level_select')
let timeBtn = document.querySelector('#time')
let recordTimeBtn = document.querySelector('#recordTime')
let level = "easy"

//convert to time format
const stringedTime = (t) => {
    let min = Math.floor(t / 60) || 0
    let sec = Math.floor(t - (min * 60) || 0)

    if(sec < 10){
        sec = "0" + sec
    }
    return `${min}:${sec}`
}

//set up the record time on the web page
if(recordTime[level] != undefined){
    recordTimeBtn.innerHTML = stringedTime(recordTime[level])
}

//simple class for board creation. could've been an object
class Board{
    constructor(id='board', size='20rem', gap='.5rem', pad='.5rem', color="#aaaaaa"){
        this.board = document.createElement('div')
        this.board.id = id

        body.appendChild(this.board)
        this.board.style.backgroundColor = color
        this.board.style.height = size
        this.board.style.width = size
        this.board.style.margin = "auto"
        this.board.style.display = "grid"
        this.board.style.gap = gap
        this.board.style.padding = pad
    }
}

//square creation class
class Square{
    constructor(board){
        this.board = board.board
        this.generate(4)
        this.set()
    }  

    generate(grid){
        //clear the board before adding elements
        this.board.innerHTML = ''

        this.grid = grid //dimensions of grid
        let order = 1 //order of appearance on the board
        this.squares = [] //holds created squares

        this.board.style.gridTemplate = `repeat(${this.grid}, 1fr) / repeat(${this.grid}, 1fr)`
        for(let i = 0; i < this.grid; i++){
            for(let j = 0; j < this.grid; j++){
                
                /* create a div with two elements, one holding the cover and another holding the picture and place them on top each other*/
                let el = document.createElement('div')
                el.style.display = "grid"

                let cover = document.createElement('div')
                // cover.className = "cover" //shows the images before start
                cover.style.gridRow = "1"
                cover.style.gridColumn = "1"
                cover.style.height = "100%"
                cover.style.width = "100%"
                cover.style.background = "rgb(180,180, 140)"
                cover.style.transition = ".1s ease"

                let img = document.createElement('img')
                img.style.gridRow = "1"
                img.style.gridColumn = "1"
                img.style.height = "100%"
                img.style.width = "100%"
                img.style.objectFit = "cover"
                
                el.id = `s${i}${j}`
                el.className = "square"
                el.style.order = order
                el.appendChild(img)
                el.appendChild(cover)

                this.board.appendChild(el)
                
                el.addEventListener('click', () => {
                    //check if the game is won each time we click on a square
                    if(!game_state_won){

                        //check whether its the players first click to start the timer
                        if(!first_click){
                            first_click = true
                        }

                        //close cover of squares of picked elements that didnt match
                        s.forEach((i) => {
                            i.lastChild.style.width = "100%"
                        })

                        //clear the array
                        s = [ ]

                        //check whether the clicked square is covered, not the same element or whether its already been matched 
                        if(el.dataset.covered && picked[0] != el && !matched.includes(el)){

                            //reveals the square
                            el.lastChild.style.width = "0%"
                            el.dataset.covered = false

                            //add the square to the picked squares for comparison
                            picked.push(el)

                            if(picked.length == 2){

                                if(picked[0].dataset.img != picked[1].dataset.img){
                                    picked.forEach((i) => {
                                        i.dataset.covered = true
                                        //add squares that didnt match to s array this leaves them open till next click
                                        s.push(i)
                                    })
                                    
                                }
                                else{
                                    picked.forEach((i) => {
                                        //add matched squares
                                        i.dataset.covered = true
                                        matched.push(i)
                                    })

                                    //when player matches all squares win is called
                                    if(matched.length == Math.pow(this.grid, 2)){
                                        this.win()
                                    }
                                }
                                //empty picked to allow new elements to be filled
                                picked = []
                            }
                        }  
                    }                 
                })

                //add squares to array
                this.squares.push(el)
                
                order++
            }
        }
        this.set()
    }

    //this function starts a new game 
    set(){

        //reset the variables
        time = 0
        matched = []
        picked = []
        s = []
        first_click = false
        timeBtn.innerHTML = "--:--"
        game_state_won = false

        //slice the image array to the number of images required for each level
        let n = Math.pow(this.grid, 2) / 2
        let img = images.slice(0, n)

        //duplicate the images so that there is two of every picture
        img = img.concat(img).slice()

        this.squares.forEach((i) => {
            //
            let r = Math.floor(Math.random() * img.length)

            //this data set is what we will use to compare if images are the same 
            i.dataset.img = img[r]
            
            //stop spin animation
            i.classList.remove('spin')

            //add random image to square
            let m = i.querySelector('img')
            m.src = img[r]

            //delete and reduce the img array
            delete img[r] 
            img = img.filter( (j) => {
                return j !== undefined
            })
            
            i.lastChild.style.width = "100%"
            i.dataset.covered = true
        })
    }

    //called when all squares are chosen
    win(){
        first_click = false
        game_state_won = true

        //spin animation
        this.squares.forEach((i) => {
            i.className = "spin"
        })

        //store new record time
        if(recordTime[level] == undefined || recordTime[level] > time){
            recordTime[level] = time

            localStorage.setItem(level, recordTime[level])
            recordTimeBtn.innerHTML = stringedTime(recordTime[level])
        }

    }
}

//the image assets
const path = "./static/assets/png/"
let images = [
    path + "001-farmer.png", path + "002-farmer.png", path + "003-potato.png", path + "004-apple.png",
    path + "005-onion.png", path + "006-broccoli.png", path + "007-fence.png", path + "008-water well.png",
    path + "009-watering can.png", path + "010-milk.png", path + "011-crate.png", path + "012-shovel.png",
    path + "013-rake.png", path + "014-barn.png", path + "015-notes.png", path + "016-hay.png",
    path + "017-windmill.png", path + "018-farm.png", path + "019-diary product.png", path + "020-mushroom.png",
    path + "021-rice.png", path + "022-truck.png", path + "023-tractor.png", path + "024-meat.png",
    path + "025-honey.png", path + "026-scarecrow.png", path + "027-wood.png", path + "028-sweet potato.png", 
    path + "029-apple tree.png", path + "030-sheep.png", path + "031-cow.png", path + "032-eggs.png",
    path + "033-wheat.png", path + "034-horse.png", path + "035-chicken.png", path + "036-pig.png",
    path + "037-corn.png", path + "038-cart.png", path + "039-bee.png", path + "040-sun.png",
    path + "041-barrel.png", path + "042-water tower.png", path + "043-tomato.png", path + "044-carrot.png",
    path + "045-seeds.png", path + "046-market.png", path + "047-scythe.png", path + "048-birdhouse.png",
    path + "049-rabbit.png", path + "050-pumpkin.png", 
]

let board = new Board('board', '30rem', '.4rem', '.4rem', "#cccaa0")
let square = new Square(board)

newGameBtn.addEventListener('click', () => {
    square.set()
})

levelBtn.addEventListener('change', () => {
    let p = levelBtn.options.selectedIndex
    switch(p){
        case 0:
            square.generate(2)
            level = "baby"
            console.log(recordTime)
            if(recordTime[level] != undefined){
                recordTimeBtn.innerHTML = stringedTime(recordTime[level])
            }
            else{
                recordTimeBtn.innerHTML = "--:--"
            }

            break
        case 1:
            square.generate(4)
            level = "easy"
            if(recordTime[level] != undefined){
                recordTimeBtn.innerHTML = stringedTime(recordTime[level])
            }
            else{
                recordTimeBtn.innerHTML = "--:--"
            }

            break
        case 2:
            square.generate(6)
            level = "medium"
            if(recordTime[level] != undefined){
                recordTimeBtn.innerHTML = stringedTime(recordTime[level])
            }
            else{
                recordTimeBtn.innerHTML = "--:--"
            }

            break
        case 3:
            square.generate(8)
            level = "hard"
            if(recordTime[level] != undefined){
                recordTimeBtn.innerHTML = stringedTime(recordTime[level])
            }
            else{
                recordTimeBtn.innerHTML = "--:--"
            }

            break

        case 4:
            square.generate(10)
            level = "god"
            if(recordTime[level] != undefined){
                recordTimeBtn.innerHTML = stringedTime(recordTime[level])
            }
            else{
                recordTimeBtn.innerHTML = "--:--"
            }    
            break
    }
})

//timer
setInterval(() => {
    if(!game_state_won && first_click){
        time++
        timeBtn.innerHTML = stringedTime(time)
    }
}, 1000)

//reset record button
recordTimeBtn.addEventListener('click', () => {
        recordTime[level] = null
        localStorage.setItem(level, recordTime[level])
        recordTimeBtn.innerHTML = "--:--"
    }
)