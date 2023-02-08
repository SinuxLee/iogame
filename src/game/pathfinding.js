const pf = require('pathfinding')
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve,ms))

const MATRIX_SIZE = 300
const matrix = []
for (let i = 0; i < MATRIX_SIZE; i++){
    const row = new Array(MATRIX_SIZE).fill(0)
    matrix.push(row)
}

const grid = new pf.Grid(matrix)
// grid.setWalkableAt()

const rand = () => Math.random()*MATRIX_SIZE*MATRIX_SIZE|0
const finder = new pf.AStarFinder();
for(let i = 0; i < 10000; i++){
    const bx = rand() % MATRIX_SIZE
    const by = rand() % MATRIX_SIZE
    const ex = rand() % MATRIX_SIZE
    const ey = rand() % MATRIX_SIZE

    console.time('finder')
    const path = finder.findPath(bx, by, ex, ey, grid.clone());
    console.timeEnd('finder')
    // console.log(bx, by, ex, ey)
}
