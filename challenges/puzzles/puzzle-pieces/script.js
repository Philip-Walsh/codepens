class PuzzleGame {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.directions = ['top', 'right', 'bottom', 'left'];
    }

    startGame() {
        this.drawPieces();
    }

    drawPieces() {
        const pieces = document.getElementById('pieces');
        pieces.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        pieces.innerHTML = '';

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let piece = this.createPiece(i, j);
                pieces.appendChild(piece);
            }
        }
    }

    createPiece(i, j) {
        let piece = document.createElement('div');
        piece.classList.add('piece');
        piece.classList.add(`piece-${i}-${j}`);

        let currentDirections = this.getCurrentDirections(i, j);
        this.assignDirections(piece, currentDirections, i, j);

        return piece;
    }

    getCurrentDirections(i, j) {
        if (i === 0 && j === 0) return ['right', 'bottom'];
        if (i === 0 && j === this.cols - 1) return ['left', 'bottom'];
        if (i === this.rows - 1 && j === 0) return ['top', 'right'];
        if (i === this.rows - 1 && j === this.cols - 1) return ['top', 'left'];
        if (i === 0) return ['right', 'bottom', 'left'];
        if (i === this.rows - 1) return ['top', 'right', 'left'];
        if (j === 0) return ['top', 'right', 'bottom'];
        if (j === this.cols - 1) return ['top', 'bottom', 'left'];
        return this.directions;
    }

    assignDirections(piece, currentDirections, i, j) {
        currentDirections.forEach(dir => {
            let innerDiv = document.createElement('div');
            innerDiv.classList.add('inner-piece');

            let isAdd = Math.random() > 0.5;
            if (dir === 'top' && i > 0) {
                let abovePiece = document.querySelector(`.piece-${i-1}-${j}`);
                let aboveInnerDiv = abovePiece.querySelector('.inner-piece.bottom-add, .inner-piece.bottom-remove');
                isAdd = aboveInnerDiv && aboveInnerDiv.classList.contains('bottom-remove');
            }
            if (dir === 'left' && j > 0) {
                let leftPiece = document.querySelector(`.piece-${i}-${j-1}`);
                let leftInnerDiv = leftPiece.querySelector('.inner-piece.right-add, .inner-piece.right-remove');
                isAdd = leftInnerDiv && leftInnerDiv.classList.contains('right-remove');
            }

            innerDiv.classList.add(isAdd ? `${dir}-add` : `${dir}-remove`);
            piece.appendChild(innerDiv);
        });
    }
}

window.onload = () => {
    let puzzleGame = new PuzzleGame(5, 5);
    puzzleGame.startGame();
};
