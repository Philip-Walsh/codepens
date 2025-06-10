$(document).ready(function () {
    // Game state
    let gameState = {
        size: 4,
        board: [],
        emptyPos: { row: 3, col: 3 },
        moveCount: 0,
        startTime: null,
        timerInterval: null,
        isPlaying: false,
        isComplete: false,
        points: 100, // Starting points
        currentImage: null,
        debugMode: false,
        lightningMode: false,
        powerUps: {
            lightning: { owned: 0, price: 50, uses: 0 }
        }
    };

    // Expanded image sources for puzzle tiles
    const imageSources = [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', // Mountain landscape
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', // Forest path
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', // Lake reflection
        'https://images.unsplash.com/photo-1501436513145-30f24e19fcc4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', // Ocean waves
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', // Desert dunes
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', // Beach sunset
        'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', // Flower field
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', // Foggy forest
        'https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', // Autumn leaves
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', // Tropical paradise
        'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', // Wildflower meadow
        'https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', // Mountain lake
        'https://images.unsplash.com/photo-1464822759844-d150ad6cbe96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', // Rocky coastline
        'https://images.unsplash.com/photo-1418489098061-ce87b5dc3aee?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', // Sunset canyon
        'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'  // Misty mountains
    ];

    // Garden elements
    const shopItems = {
        lightning: {
            id: 'lightning',
            name: 'Lotus Flow',
            icon: '🪷',
            description: 'Gracefully guide any tile to its destined place',
            price: 50,
            owned: 0,
            maxUses: -1 // -1 = unlimited
        }
    };

    // Initialize the game
    function initGame() {
        loadGameData();
        setupEventListeners();
        renderShop();
        updatePointsDisplay();
        renderQuickPowerups();
        newGame();
        // Initial background update
        setTimeout(updateBackgroundImage, 100);
    }

    // Load game data from localStorage
    function loadGameData() {
        const saved = localStorage.getItem('squircle-slider-save');
        if (saved) {
            const data = JSON.parse(saved);
            gameState.points = data.points || 100;
            gameState.powerUps = data.powerUps || gameState.powerUps;
            Object.keys(shopItems).forEach(key => {
                if (data.powerUps && data.powerUps[key]) {
                    shopItems[key].owned = data.powerUps[key].owned || 0;
                }
            });
        }
    }

    // Save game data to localStorage
    function saveGameData() {
        const data = {
            points: gameState.points,
            powerUps: gameState.powerUps
        };
        localStorage.setItem('squircle-slider-save', JSON.stringify(data));
    }

    // Set up event listeners
    function setupEventListeners() {
        $('#new-game-btn').on('click', newGame);
        $('#shuffle-btn').on('click', shuffleBoard);
        $('#change-image-btn').on('click', changeImage);
        $('#hint-btn').on('click', showHint);
        $('#rules-btn').on('click', showRules);
        $('#play-again-btn').on('click', () => {
            $('#win-modal').removeClass('show');
            newGame();
        });

        // Debug toggle
        $('#debug-toggle').on('click', toggleDebugMode);

        // Rules modal
        $('#rules-close').on('click', hideRules);
        $(document).on('click', '.rules-modal', function (e) {
            if (e.target === this) {
                hideRules();
            }
        });

        // Rules navigation
        $('.rules-nav-btn').on('click', function () {
            const section = $(this).data('section');
            showRulesSection(section);
        });

        // Difficulty selector
        $('.difficulty-btn').on('click', function () {
            const newSize = parseInt($(this).data('size'));
            if (newSize !== gameState.size) {
                $('.difficulty-btn').removeClass('active');
                $(this).addClass('active');
                gameState.size = newSize;
                newGame();
            }
        });

        // Tile click handler
        $(document).on('click', '.puzzle-tile:not(.empty)', function () {
            if (gameState.lightningMode) {
                handleLightningClick($(this));
                return;
            }

            const index = $(this).data('index');
            const pos = indexToPosition(index);
            if (canMoveTile(pos)) {
                moveTile(pos);
            }
        });

        // Empty space click for lightning mode
        $(document).on('click', '.puzzle-tile.empty', function () {
            if (gameState.lightningMode) {
                handleLightningTarget($(this));
            }
        });
    }

    // Start a new game
    function newGame() {
        gameState.moveCount = 0;
        gameState.startTime = Date.now();
        gameState.isPlaying = true;
        gameState.isComplete = false;
        gameState.lightningMode = false;
        gameState.emptyPos = { row: gameState.size - 1, col: gameState.size - 1 };

        // Select random image
        gameState.currentImage = imageSources[Math.floor(Math.random() * imageSources.length)];

        // Update body background to match puzzle image
        updateBackgroundImage();

        // Clear timer
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
        }

        // Initialize solved board
        gameState.board = [];
        for (let i = 0; i < gameState.size * gameState.size - 1; i++) {
            gameState.board.push(i + 1);
        }
        gameState.board.push(0); // 0 represents empty space

        // Generate solvable puzzle
        generateSolvablePuzzle();

        // Update UI
        updateMoveCount();
        startTimer();
        renderBoard();
        updateDebugInfo();

        // Exit lightning mode
        $('body').removeClass('lightning-mode');
    }

    // Generate a solvable puzzle by making random valid moves
    function generateSolvablePuzzle() {
        const moves = 1000; // Number of random moves to make

        for (let i = 0; i < moves; i++) {
            const possibleMoves = getValidMoves();
            if (possibleMoves.length > 0) {
                const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                swapWithEmpty(randomMove, false); // Don't count these as player moves
            }
        }
    }

    // Get all valid moves (tiles adjacent to empty space)
    function getValidMoves() {
        const moves = [];
        const directions = [
            { row: -1, col: 0 }, // up
            { row: 1, col: 0 },  // down
            { row: 0, col: -1 }, // left
            { row: 0, col: 1 }   // right
        ];

        directions.forEach(dir => {
            const newRow = gameState.emptyPos.row + dir.row;
            const newCol = gameState.emptyPos.col + dir.col;

            if (newRow >= 0 && newRow < gameState.size &&
                newCol >= 0 && newCol < gameState.size) {
                moves.push({ row: newRow, col: newCol });
            }
        });

        return moves;
    }

    // Check if a tile can move (is adjacent to empty space)
    function canMoveTile(pos) {
        const rowDiff = Math.abs(pos.row - gameState.emptyPos.row);
        const colDiff = Math.abs(pos.col - gameState.emptyPos.col);

        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    // Move a tile to the empty space
    function moveTile(pos) {
        if (!gameState.isPlaying || gameState.isComplete) return;

        const $tile = $(`.puzzle-tile[data-index="${positionToIndex(pos)}"]`);

        // Add sliding animation
        $tile.addClass('sliding');

        setTimeout(() => {
            $tile.removeClass('sliding');
            swapWithEmpty(pos, true);
            renderBoard();
            updateDebugInfo();

            // Check for win condition
            if (checkWin()) {
                gameComplete();
            }
        }, 150);
    }

    // Lightning bolt power-up functionality
    let selectedTile = null;

    function handleLightningClick($tile) {
        if (selectedTile) {
            selectedTile.removeClass('lightning-target');
        }

        selectedTile = $tile;
        $tile.addClass('lightning-target');
        showNotification('Click on an empty space to move the tile!', 'success');
    }

    function handleLightningTarget($emptyTile) {
        if (!selectedTile) {
            showNotification('Select a tile first!', 'error');
            return;
        }

        const tileIndex = selectedTile.data('index');
        const emptyIndex = $emptyTile.index();

        // Swap the tiles
        const tilePos = indexToPosition(tileIndex);
        const emptyPos = indexToPosition(emptyIndex);

        // Update board state
        [gameState.board[tileIndex], gameState.board[emptyIndex]] =
            [gameState.board[emptyIndex], gameState.board[tileIndex]];

        // Update empty position
        gameState.emptyPos = tilePos;

        // Add move count
        gameState.moveCount += 3; // Lightning costs extra moves
        updateMoveCount();

        // Exit lightning mode
        gameState.lightningMode = false;
        $('body').removeClass('lightning-mode');
        selectedTile.removeClass('lightning-target');
        selectedTile = null;

        // Re-render board
        renderBoard();
        updateDebugInfo();

        // Award points for using power-up
        awardPoints(5);
        showNotification('Lightning bolt used! ⚡', 'success');

        // Check for win
        if (checkWin()) {
            gameComplete();
        }
    }

    // Swap tile with empty space
    function swapWithEmpty(pos, countMove = true) {
        const tileIndex = positionToIndex(pos);
        const emptyIndex = positionToIndex(gameState.emptyPos);

        // Swap values
        [gameState.board[tileIndex], gameState.board[emptyIndex]] =
            [gameState.board[emptyIndex], gameState.board[tileIndex]];

        // Update empty position
        gameState.emptyPos = { ...pos };

        // Count move if it's a player move
        if (countMove) {
            gameState.moveCount++;
            updateMoveCount();

            // Award points for regular moves
            awardPoints(1);
        }
    }

    // Convert position to array index
    function positionToIndex(pos) {
        return pos.row * gameState.size + pos.col;
    }

    // Convert array index to position
    function indexToPosition(index) {
        return {
            row: Math.floor(index / gameState.size),
            col: index % gameState.size
        };
    }

    // Render the puzzle board
    function renderBoard() {
        const $board = $('#puzzle-board');
        $board.empty();
        $board.css('grid-template-columns', `repeat(${gameState.size}, 1fr)`);

        gameState.board.forEach((value, index) => {
            const $tile = $('<div>').addClass('puzzle-tile');

            if (value === 0) {
                $tile.addClass('empty');
            } else {
                $tile.text(value);
                $tile.attr('data-index', index);

                // Add image background
                if (gameState.currentImage) {
                    // Calculate the correct position for this tile number in the solved state
                    const correctRow = Math.floor((value - 1) / gameState.size);
                    const correctCol = (value - 1) % gameState.size;

                    // Calculate background position for proper image slicing
                    // This positions the background so each tile shows its correct portion
                    const bgPosX = gameState.size === 1 ? 0 : (correctCol * 100) / (gameState.size - 1);
                    const bgPosY = gameState.size === 1 ? 0 : (correctRow * 100) / (gameState.size - 1);

                    $tile.css({
                        'background-image': `url(${gameState.currentImage})`,
                        'background-position': `${bgPosX}% ${bgPosY}%`,
                        'background-size': `${gameState.size * 100}% ${gameState.size * 100}%`,
                        'background-repeat': 'no-repeat'
                    });
                    $tile.addClass('has-image');
                }

                const pos = indexToPosition(index);
                if (canMoveTile(pos)) {
                    $tile.addClass('movable');
                }
            }

            $board.append($tile);
        });
    }

    // Check if puzzle is solved
    function checkWin() {
        for (let i = 0; i < gameState.board.length - 1; i++) {
            if (gameState.board[i] !== i + 1) {
                return false;
            }
        }
        return gameState.board[gameState.board.length - 1] === 0;
    }

    // Handle game completion
    function gameComplete() {
        gameState.isComplete = true;
        gameState.isPlaying = false;

        // Stop timer
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
        }

        // Calculate bonus points
        const finalTime = Math.floor((Date.now() - gameState.startTime) / 1000);
        const timeBonus = Math.max(0, 300 - finalTime); // Bonus for speed
        const moveBonus = Math.max(0, 50 - gameState.moveCount); // Bonus for efficiency
        const totalBonus = timeBonus + moveBonus;

        awardPoints(totalBonus);

        // Update final stats
        $('#final-moves').text(gameState.moveCount);
        $('#final-time').text(formatTime(finalTime));

        // Show win modal with delay for effect
        setTimeout(() => {
            $('#win-modal').addClass('show');
        }, 500);

        // Add celebration effect to tiles
        $('.puzzle-tile:not(.empty)').each(function (index) {
            setTimeout(() => {
                $(this).css('transform', 'scale(1.1)');
                setTimeout(() => {
                    $(this).css('transform', '');
                }, 400);
            }, index * 100);
        });

        showNotification(`Puzzle completed! +${totalBonus} bonus points! 🎉`, 'success');
    }

    // Points system
    function awardPoints(amount) {
        gameState.points += amount;
        updatePointsDisplay();
        saveGameData();
    }

    function spendPoints(amount) {
        if (gameState.points >= amount) {
            gameState.points -= amount;
            updatePointsDisplay();
            saveGameData();
            return true;
        }
        return false;
    }

    function updatePointsDisplay() {
        $('#points-value').text(gameState.points);
        renderShop(); // Update shop affordability
        renderQuickPowerups(); // Update quick power-ups panel
    }

    // Shop system
    function renderShop() {
        const $shopItems = $('#shop-items');
        $shopItems.empty();

        Object.values(shopItems).forEach(item => {
            const $item = $('<div>').addClass('shop-item');

            // Add affordability classes
            if (item.owned > 0) {
                $item.addClass('owned');
            } else if (gameState.points >= item.price) {
                $item.addClass('affordable');
            } else {
                $item.addClass('unaffordable');
            }

            $item.html(`
                <span class="shop-item-icon">${item.icon}</span>
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-description">${item.description}</div>
                <div class="shop-item-price">
                    <span>💎</span>
                    <span>${item.price}</span>
                </div>
                ${item.owned > 0 ? `<div class="shop-item-uses">Owned: ${item.owned}</div>` : ''}
                ${item.owned > 0 ?
                    `<button class="shop-use-btn" data-item="${item.id}">Use (3 moves)</button>` :
                    `<button class="shop-buy-btn" data-item="${item.id}" ${gameState.points < item.price ? 'disabled' : ''}>Buy</button>`
                }
            `);

            $shopItems.append($item);
        });
    }

    // Shop event handlers
    $(document).on('click', '.shop-buy-btn', function () {
        const itemId = $(this).data('item');
        const item = shopItems[itemId];

        if (spendPoints(item.price)) {
            item.owned++;
            gameState.powerUps[itemId].owned = item.owned;
            saveGameData();
            renderShop();
            renderQuickPowerups();
            showNotification(`${item.name} purchased! 🛒`, 'success');
        } else {
            showNotification('Not enough points! 💎', 'error');
        }
    });

    $(document).on('click', '.shop-use-btn', function () {
        const itemId = $(this).data('item');

        if (itemId === 'lightning') {
            if (!gameState.isPlaying) {
                showNotification('Start a game first!', 'error');
                return;
            }

            gameState.lightningMode = true;
            $('body').addClass('lightning-mode');
            showNotification('Lotus flow awakened! Guide a tile to its destined place 🪷', 'success');
        }
    });

    // Render quick power-ups panel
    function renderQuickPowerups() {
        const $quickPowerups = $('#quick-powerups');
        $quickPowerups.empty();

        // Get owned power-ups
        const ownedPowerups = Object.values(shopItems).filter(item => item.owned > 0);

        if (ownedPowerups.length === 0) {
            $quickPowerups.removeClass('show');
            return;
        }

        ownedPowerups.forEach(item => {
            const isActive = gameState.lightningMode && item.id === 'lightning';

            const $item = $(`
                <div class="quick-powerup-item ${isActive ? 'active' : ''}" data-powerup="${item.id}">
                    <span class="quick-powerup-icon">${item.icon}</span>
                    <span class="quick-powerup-name">${item.name}</span>
                </div>
            `);

            $item.on('click', function () {
                handleQuickPowerupClick(item.id);
            });

            $quickPowerups.append($item);
        });

        $quickPowerups.addClass('show');
    }

    // Handle quick power-up click
    function handleQuickPowerupClick(powerupId) {
        if (powerupId === 'lightning') {
            if (gameState.lightningMode) {
                // Exit lightning mode
                gameState.lightningMode = false;
                $('body').removeClass('lightning-mode');
                showNotification('Lightning mode deactivated', 'success');
            } else {
                // Enter lightning mode
                gameState.lightningMode = true;
                $('body').addClass('lightning-mode');
                showNotification('Lightning mode activated! Click a tile, then click where to move it.', 'success');
            }
            renderQuickPowerups(); // Update active state
        }
    }

    // Debug mode
    function toggleDebugMode() {
        gameState.debugMode = !gameState.debugMode;
        $('#debug-toggle').toggleClass('active');
        $('#debug-info').toggleClass('show');

        if (gameState.debugMode) {
            // Give debug points
            awardPoints(1000);
            showNotification('Garden wisdom awakened! +1000 energy 🌿', 'success');
        }

        updateDebugInfo();
    }

    function updateDebugInfo() {
        if (!gameState.debugMode) return;

        $('#debug-board').text(gameState.board.join(','));
        $('#debug-empty').text(`(${gameState.emptyPos.row}, ${gameState.emptyPos.col})`);
        $('#debug-solvable').text(checkWin() ? 'SOLVED' : 'UNSOLVED');
    }

    // Shuffle the board
    function shuffleBoard() {
        if (!gameState.isPlaying) return;

        // Add penalty moves for shuffling
        gameState.moveCount += 5;
        updateMoveCount();

        // Generate new puzzle
        generateSolvablePuzzle();
        renderBoard();
        updateDebugInfo();

        showNotification('Garden ripples spread... +5 flows', 'error');
    }

    // Show hint (highlight movable tiles)
    function showHint() {
        $('.puzzle-tile.movable').each(function (index) {
            setTimeout(() => {
                $(this).css('background', 'linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(228, 147, 179, 0.3))');

                setTimeout(() => {
                    $(this).css('background', '');
                }, 2000);
            }, index * 200);
        });

        showNotification('Gentle glow reveals the path 💫', 'success');
    }

    // Notification system
    function showNotification(message, type = 'success') {
        const $notification = $('#notification');
        $notification.removeClass('show success error').addClass(type);
        $notification.text(message);

        setTimeout(() => $notification.addClass('show'), 10);
        setTimeout(() => $notification.removeClass('show'), 3000);
    }

    // Timer functions
    function startTimer() {
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
        }

        gameState.timerInterval = setInterval(() => {
            if (gameState.isPlaying && !gameState.isComplete) {
                const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
                $('#timer').text(formatTime(elapsed));
            }
        }, 1000);
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Update move count display
    function updateMoveCount() {
        $('#move-count').text(gameState.moveCount);
    }

    // Add some visual flair with particle effects
    function createParticleEffect(x, y) {
        const colors = ['#3b82f6', '#22c55e', '#06b6d4', '#ef4444'];

        for (let i = 0; i < 8; i++) {
            const particle = $('<div>').css({
                position: 'fixed',
                left: x + 'px',
                top: y + 'px',
                width: '6px',
                height: '6px',
                background: colors[Math.floor(Math.random() * colors.length)],
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 9999
            });

            $('body').append(particle);

            // Animate particle
            particle.animate({
                left: x + (Math.random() - 0.5) * 150,
                top: y + (Math.random() - 0.5) * 150,
                opacity: 0
            }, 1500, function () {
                $(this).remove();
            });
        }
    }

    // Particle effects disabled for faster gameplay
    // $(document).on('click', '.puzzle-tile.movable', function (e) {
    //     const rect = this.getBoundingClientRect();
    //     const x = rect.left + rect.width / 2;
    //     const y = rect.top + rect.height / 2;
    //     createParticleEffect(x, y);
    // });

    // Initialize game when document is ready
    initGame();

    // Add keyboard support
    $(document).on('keydown', function (e) {
        if (!gameState.isPlaying || gameState.isComplete || gameState.lightningMode) return;

        let targetPos = { ...gameState.emptyPos };

        switch (e.which) {
            case 37: // left arrow - move tile from right
                targetPos.col++;
                break;
            case 38: // up arrow - move tile from below
                targetPos.row++;
                break;
            case 39: // right arrow - move tile from left
                targetPos.col--;
                break;
            case 40: // down arrow - move tile from above
                targetPos.row--;
                break;
            default:
                return;
        }

        // Check if target position is valid
        if (targetPos.row >= 0 && targetPos.row < gameState.size &&
            targetPos.col >= 0 && targetPos.col < gameState.size) {
            moveTile(targetPos);
        }

        e.preventDefault();
    });

    // Add touch/swipe support for mobile
    let touchStartX = 0;
    let touchStartY = 0;

    $(document).on('touchstart', '.puzzle-tile:not(.empty)', function (e) {
        const touch = e.originalEvent.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    });

    $(document).on('touchend', '.puzzle-tile:not(.empty)', function (e) {
        if (!touchStartX || !touchStartY) return;

        const touch = e.originalEvent.changedTouches[0];
        const touchEndX = touch.clientX;
        const touchEndY = touch.clientY;

        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;

        // Only trigger if swipe is significant
        if (Math.abs(diffX) > 30 || Math.abs(diffY) > 30) {
            const index = $(this).data('index');
            const pos = indexToPosition(index);
            if (canMoveTile(pos)) {
                moveTile(pos);
            }
        }

        touchStartX = 0;
        touchStartY = 0;
    });

    // Update body background to match puzzle image
    function updateBackgroundImage() {
        if (gameState.currentImage) {
            // Use the exact same image but higher resolution for background
            const bgImage = gameState.currentImage.replace('w=400&q=80', 'w=1920&q=80');
            document.documentElement.style.setProperty('--puzzle-background', `url('${bgImage}')`);
            console.log('Updated background image:', bgImage); // Debug log
        }
    }

    // Change to a random new image
    function changeImage() {
        // Filter out current image to ensure we get a different one
        const availableImages = imageSources.filter(img => img !== gameState.currentImage);
        gameState.currentImage = availableImages[Math.floor(Math.random() * availableImages.length)];

        // Re-render the board with new image
        renderBoard();
        updateBackgroundImage();
        showNotification('A new natural scene has bloomed 🦋');
    }

    // Show rules modal
    function showRules() {
        $('#rules-modal').addClass('show');
        showRulesSection('basics'); // Default to basics section
    }

    // Hide rules modal
    function hideRules() {
        $('#rules-modal').removeClass('show');
    }

    // Show specific rules section
    function showRulesSection(sectionName) {
        // Update navigation
        $('.rules-nav-btn').removeClass('active');
        $(`.rules-nav-btn[data-section="${sectionName}"]`).addClass('active');

        // Update content
        $('.rules-section').removeClass('active');
        $(`#section-${sectionName}`).addClass('active');
    }

    // Enhanced keyboard shortcuts including rules modal
    $(document).on('keydown', function (e) {
        // Rules modal shortcuts
        if ($('#rules-modal').hasClass('show')) {
            if (e.key === 'Escape') {
                hideRules();
                return;
            }
            // Number keys to switch sections
            const sectionKeys = {
                '1': 'basics',
                '2': 'controls',
                '3': 'powerups',
                '4': 'scoring',
                '5': 'tips'
            };
            if (sectionKeys[e.key]) {
                showRulesSection(sectionKeys[e.key]);
                return;
            }
        }

        // Open rules with F1 or ?
        if (e.key === 'F1' || e.key === '?') {
            showRules();
            e.preventDefault();
            return;
        }

        // Change image with 'I' key
        if (e.key.toLowerCase() === 'i' && !$('#rules-modal').hasClass('show')) {
            changeImage();
            return;
        }
    });
}); 