
window.onload = () => {
    startGame();
}

function startGame() {
    drawPieces(5,5);
}

function drawPieces(rows, cols) {
    let pieces = document.getElementById('pieces');
    pieces.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    pieces.innerHTML = ''; // Clear any existing pieces

    let directions = ['top', 'right', 'bottom', 'left'];

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let piece = document.createElement('div');
            piece.classList.add('piece');
            piece.classList.add(`piece-${i}-${j}`);

            let currentDirections = [];

            // Determine the type of piece and assign directions
            if (i === 0 && j === 0) {
                // Top-left corner piece
                currentDirections = ['right', 'bottom'];
            } else if (i === 0 && j === cols - 1) {
                // Top-right corner piece
                currentDirections = ['left', 'bottom'];
            } else if (i === rows - 1 && j === 0) {
                // Bottom-left corner piece
                currentDirections = ['top', 'right'];
            } else if (i === rows - 1 && j === cols - 1) {
                // Bottom-right corner piece
                currentDirections = ['top', 'left'];
            } else if (i === 0) {
                // Top edge piece
                currentDirections = ['right', 'bottom', 'left'];
            } else if (i === rows - 1) {
                // Bottom edge piece
                currentDirections = ['top', 'right', 'left'];
            } else if (j === 0) {
                // Left edge piece
                currentDirections = ['top', 'right', 'bottom'];
            } else if (j === cols - 1) {
                // Right edge piece
                currentDirections = ['top', 'bottom', 'left'];
            } else {
                // Inner piece
                currentDirections = directions;
            }

            // Create and assign add/remove to each direction
            currentDirections.forEach(dir => {
                let innerDiv = document.createElement('div');
                innerDiv.classList.add('inner-piece');
                if (Math.random() > 0.5) {
                    innerDiv.classList.add(`${dir}-add`);
                } else {
                    innerDiv.classList.add(`${dir}-remove`);
                }
                piece.appendChild(innerDiv);
            });

            pieces.appendChild(piece);
        }
    }

    // Adjust classes to ensure puzzle pieces fit together
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let piece = pieces.children[i * cols + j];
            let innerDivs = piece.querySelectorAll('.inner-piece');

            innerDivs.forEach(innerDiv => {
                if (innerDiv.classList.contains('top-add') && i > 0) {
                    let abovePiece = pieces.children[(i - 1) * cols + j];
                    let aboveInnerDiv = abovePiece.querySelector('.inner-piece.bottom-remove');
                    if (aboveInnerDiv) {
                        innerDiv.classList.remove('top-add');
                        innerDiv.classList.add('top-remove');
                    }
                } else if (innerDiv.classList.contains('top-remove') && i > 0) {
                    let abovePiece = pieces.children[(i - 1) * cols + j];
                    let aboveInnerDiv = abovePiece.querySelector('.inner-piece.bottom-add');
                    if (aboveInnerDiv) {
                        innerDiv.classList.remove('top-remove');
                        innerDiv.classList.add('top-add');
                    }
                }

                if (innerDiv.classList.contains('left-add') && j > 0) {
                    let leftPiece = pieces.children[i * cols + (j - 1)];
                    let leftInnerDiv = leftPiece.querySelector('.inner-piece.right-remove');
                    if (leftInnerDiv) {
                        innerDiv.classList.remove('left-add');
                        innerDiv.classList.add('left-remove');
                    }
                } else if (innerDiv.classList.contains('left-remove') && j > 0) {
                    let leftPiece = pieces.children[i * cols + (j - 1)];
                    let leftInnerDiv = leftPiece.querySelector('.inner-piece.right-add');
                    if (leftInnerDiv) {
                        innerDiv.classList.remove('left-remove');
                        innerDiv.classList.add('left-add');
                    }
                }
            });
        }
    }
}

