const gameboard = document.getElementById('gameboard');
const rows = 16;
const cols = 9;

const statusTop = document.getElementById('status-top');
const statusBottom = document.getElementById('status-bottom');
let manaRed = 500;
let manaBlue = 500;
let incomeRed = 10;
let incomeBlue = 10;

let gameOver = false;

const redDeployBanner = document.getElementById('red-deploy-banner');
const blueDeployBanner = document.getElementById('blue-deploy-banner');

const deployableClasses = {
  Skeleton: 100,
  Orc: 150,
  Djendri: 150,
  Kobold: 200,
  Human: 200,
  Naga: 200,
  Gnoll: 200,
  Furbolg: 300,
  Cavalry: 300,
  Wyvern: 400,
  Griffon: 400,
  Pegasus: 450,
  Dragon: 800,
  Mona: 900,
  Lang: 1000,
  Kathryn: 1500
};

const deployableImages = {
  Skeleton: 'https://your-image-url/skeleton.png',
  Kobold: 'https://uploads.onecompiler.io/44fwt7xkt/44jve29d5/Arcane_card.png',
  Orc: 'https://your-image-url/orc.png',
  Human: 'https://your-image-url/human.png',
  Naga: 'https://your-image-url/naga.png',
  Gnoll: 'https://your-image-url/gnoll.png',
  Djendri: 'https://your-image-url/djendri.png',
  Furbolg: 'https://your-image-url/furbolg.png',
  Cavalry: 'https://your-image-url/cavalry.png',
  Wyvern: 'https://your-image-url/wyvern.png',
  Griffon: 'https://your-image-url/griffon.png',
  Pegasus: 'https://your-image-url/pegasus.png',
  Dragon: 'https://your-image-url/dragon.png',
  Mona: 'https://your-image-url/dragon.png',
  Lang: 'https://your-image-url/dragon.png',
  Kathryn: 'https://your-image-url/kathryn.png'
};

let tokenSelected = false;
let tokenPos1 = { r: rows - 2, c: Math.floor(cols / 2) };   // red token position
let tokenPos2 = { r: 1, c: Math.floor(cols / 2) };           // blue token position

const buttons = []; // store buttons for quick access

const roundCounter = document.getElementById('round-counter');
let moveCount = 0;

const turnSummary = document.getElementById('turn-summary');
let summaryTimeout = null;

let phase = 'move'; // 'move' or 'deploy'

const skipDeployBtn = document.getElementById('skipDeploy');
const deployImagePopup = document.getElementById('deploy-image-popup');
const deployImagePopupImg = document.getElementById('deploy-image-popup-img');

// --- Row & Column labels code unchanged ---
const rowLabelsContainer = document.getElementById('row-labels');
for (let r = 1; r <= rows; r++) {
  const label = document.createElement('div');
  label.textContent = r;
  label.style.height = '40px';         // match grid row height
  label.style.lineHeight = '40px';     // vertical center text in div
  label.style.fontWeight = 'bold';
  label.style.fontSize = '1.0rem';
  label.style.color = '#333';
  label.style.userSelect = 'none';
  label.style.textAlign = 'center';    // horizontally center number
  rowLabelsContainer.appendChild(label);
}

const colLabelsTop = document.getElementById('col-labels-top');
const colLabelsBottom = document.getElementById('col-labels-bottom');
const letters = 'ABCDEFGHI';

for (let i = 0; i < cols; i++) {
  const labelTop = document.createElement('div');
  labelTop.textContent = letters[i];
  labelTop.style.fontWeight = 'bold';
  labelTop.style.fontSize = '1.0rem';
  labelTop.style.color = '#333';
  labelTop.style.userSelect = 'none';
  labelTop.style.textAlign = 'center';
  colLabelsTop.appendChild(labelTop);

  const labelBottom = document.createElement('div');
  labelBottom.textContent = letters[i];
  labelBottom.style.fontWeight = 'bold';
  labelBottom.style.fontSize = '1.0rem';
  labelBottom.style.color = '#333';
  labelBottom.style.userSelect = 'none';
  labelBottom.style.textAlign = 'center';
  colLabelsBottom.appendChild(labelBottom);
}

// ----------------- TOKEN CLASSES & MOVEMENTS -----------------
// Movement vectors from Red's perspective; blue rows reversed
const tokenClasses = {
  Arcanist: {
    label: 'A',
    moves: [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ]
  },
  Kobold: {
    label: 'K',
    moves: [
      [-1, -1], [-1, 1]
    ]
  },
  Skeleton: {
    label: 'S',
    moves: [
      [-1, 0]
    ]
  },
  Orc: {
    label: 'O',
    moves: [
      [-1, 0],
      [1, 0]
    ]
  },
  Human: {
    label: 'H',
    moves: [
      [-1, 0]
    ],
    captures: [  
      [-1, 1], [-1, -1]
    ]
  },
  Gnoll: {
    label: 'G',
    moves: [
      [-2, 2], [-2, -2]
    ],
    captures: [ 
      [0, 1], [0, -1]
    ]
  },
  Naga: {
    label: 'N',
    moves: [
      [-1, 1], [-1, -1]
    ],
    captures: [  
      [-1, 0]
    ]
  },
  Djendri: {
    label: 'C',
    moves: [
      [-1, 0], [0, -1], [0, 1],
    ],
    captures: [  
      [-1, 0]
    ]
  },
  Furbolg: {
    label: 'F',
    moves: [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ]
  },
  Cavalry: {
    label: 'C',
    moves: [
      [-2, 0], [-1, 0], [1, 0], [2, 0]
    ]
  },
  Wyvern: {
    label: 'W',
    moves: [
      [-2, -1], [-2, 1],
      [-1, -2], [-1, 2],
      [1, -2],  [1, 2],
      [2, -1],  [2, 1]
    ],
    flying: true
  },
  Griffon: {
    label: 'R',
    moves: [
      [-2, -2], [-2, 2],
      [2, -2], [2, 2]
    ],
    flying: true
  },
  Pegasus: {
    label: 'P',
    moves: [
      [-1, -1], [-1, 1],
      [1, -1],  [1, 1],
      [-2, -2], [-2, 2],
      [2, -2],  [2, 2]
    ],
    flying: true
  },
  Dragon: {
    label: 'D',
    moves: [
      [-2, -2], [-2, -1], [-2, 0], [-2, 1], [-2, 2],
      [-1, -2], [-1, -1], [-1, 0], [-1, 1], [-1, 2],
      [0, -2],  [0, -1],           [0, 1],  [0, 2],
      [1, -2],  [1, -1],  [1, 0],  [1, 1],  [1, 2],
      [2, -2],  [2, -1],  [2, 0],  [2, 1],  [2, 2]
    ],
    flying: true
  },
  Lang: {
    label: 'L',
    moves: [
      [-1, 0], [1, 0], [0, -1], [0, 1]
    ],
    unlimited: true
  },
  Mona: {
    label: 'M',
    moves: [
      [-1, -1], [-1, 1], [1, -1], [1, 1]
    ],
    unlimited: true
  },
  Kathryn: {
    label: 'Q',
    moves: [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ],
    unlimited: true
  }
};

// ----------------- UTILITIES -----------------

function currentPlayer() {
  return moveCount % 2 === 0 ? 'red' : 'blue';
}

function currentColor() {
  return currentPlayer() === 'red' ? 'crimson' : 'blue';
}

function sanctumPosition(player) {
  const middleCol = Math.floor(cols / 2);
  if (player === 'red') {
    return { r: rows - 2, c: middleCol };
  } else {
    return { r: 1, c: middleCol };
  }
}

function createDeployButton(playerColor) {
  const container = document.createDocumentFragment();

  const deployPreview = document.getElementById('deploy-preview');
  const deployPreviewImg = document.getElementById('deploy-preview-img');

  Object.entries(deployableClasses).forEach(([cls, cost]) => {
    const btn = document.createElement('button');
    btn.innerHTML = `${cls} (${cost}&nbsp;M)`;
    btn.title = `Deploy ${cls} (Cost: ${cost} mana)`;

    // Disable button if not enough mana
    const mana = playerColor === 'red' ? manaRed : manaBlue;
    btn.disabled = mana < cost;

    btn.addEventListener('click', () => {
      if (gameOver) return;
      deployToken(playerColor, cls, cost);
    });

    // Show image on hover
    btn.addEventListener('mouseover', () => {
      const imgUrl = deployableImages[cls];
      if (imgUrl) {
        deployImagePopupImg.src = imgUrl;
        deployImagePopup.style.display = 'block';
      }
    });
    
    btn.addEventListener('mouseout', () => {
      deployImagePopup.style.display = 'none';
      deployImagePopupImg.src = '';
    });
    
    container.appendChild(btn);
  });

  return container;
}

function renderDeployBanners() {
  // Clear previous buttons
  redDeployBanner.innerHTML = '';
  blueDeployBanner.innerHTML = '';

  // Show banners only in deploy phase
  if (phase !== 'deploy') {
    redDeployBanner.style.display = 'none';
    blueDeployBanner.style.display = 'none';
    return;
  }

  const player = currentPlayer();

  if (player === 'red') {
    redDeployBanner.style.display = 'grid';  // grid to match CSS display
    blueDeployBanner.style.display = 'none';
    redDeployBanner.appendChild(createDeployButton('red'));
  } else {
    blueDeployBanner.style.display = 'grid';
    redDeployBanner.style.display = 'none';
    blueDeployBanner.appendChild(createDeployButton('blue'));
  }
}

function updateStatusBars() {
  statusTop.innerHTML = `<div class="player-blue">Mana: ${manaBlue} | Mana Regeneration: ${incomeBlue}</div>`;
  statusBottom.innerHTML = `<div class="player-red">Mana: ${manaRed} | Mana Regeneration: ${incomeRed}</div>`;
}

function calculateIncome() {
  incomeRed = 0;
  incomeBlue = 0;
  buttons.forEach((btn) => {
    if (btn.capturedBy === 'red') {
      incomeRed += btn.income;
    } else if (btn.capturedBy === 'blue') {
      incomeBlue += btn.income;
    }
  });
}

function clearHighlights() {
  buttons.forEach((btn) => {
    btn.classList.remove('highlight');
    btn.classList.remove('highlight-occupied');
    btn.classList.remove('highlight-hover');
    btn.classList.remove('highlight-hover-occupied');
    btn.classList.remove('highlight-hover-capture-empty');
  });
}

function clearHoverHighlights() {
  buttons.forEach(btn => {
    btn.classList.remove('highlight-hover');
    btn.classList.remove('highlight-hover-occupied');
    btn.classList.remove('highlight-hover-capture-empty');
  });
}

function highlightValidMovesByClass(pos, playerClass, tokenColor) {
  clearHighlights();
  if (!selectedToken) return;

  const tokenClassData = tokenClasses[playerClass];
  const moves = tokenClassData.moves || [];
  const captures = tokenClassData.captures || moves; // fallback if no separate captures
  const unlimited = tokenClassData.unlimited === true;
  const isFlying = tokenClassData.flying === true;

  function occupantColor(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return null;
    const btn = buttons[r * cols + c];
    const tokenEl = btn.querySelector('.token');
    if (!tokenEl) return null;
    return tokenEl.style.backgroundColor;
  }

  // Highlight normal moves (empty squares only)
  moves.forEach(([dr, dc]) => {
    const actualDr = (tokenColor === 'crimson') ? dr : -dr;

    if (unlimited) {
      const stepR = actualDr === 0 ? 0 : actualDr / Math.abs(actualDr);
      const stepC = dc === 0 ? 0 : dc / Math.abs(dc);

      for (let dist = 1;; dist++) {
        const nr = pos.r + dist * stepR;
        const nc = pos.c + dist * stepC;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) break;

        const occColor = occupantColor(nr, nc);
        const b = buttons[nr * cols + nc];

        if (!occColor) {
          b.classList.add('highlight');
        } else {
          break;
        }
      }
      return;
    }

    if (isFlying) {
      const nr = pos.r + actualDr;
      const nc = pos.c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return;

      const btn = buttons[nr * cols + nc];
      if (!btn.querySelector('.token')) {
        btn.classList.add('highlight');
      }
      return;
    }

    const nr = pos.r + actualDr;
    const nc = pos.c + dc;
    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return;

    // New: Check intermediate squares for multi-step moves
    const stepCount = Math.max(Math.abs(actualDr), Math.abs(dc));
    let pathBlocked = false;
    if (stepCount > 1) {
      const stepR = actualDr / stepCount;
      const stepC = dc / stepCount;
      for (let step = 1; step < stepCount; step++) {
        const interR = pos.r + step * stepR;
        const interC = pos.c + step * stepC;
        const intermediateBtn = buttons[interR * cols + interC];
        if (intermediateBtn.querySelector('.token')) {
          pathBlocked = true;
          break;
        }
      }
    }
    if (pathBlocked) return;

    const btn = buttons[nr * cols + nc];
    if (!btn.querySelector('.token')) {
      btn.classList.add('highlight');
    }
  });

  // Highlight capture moves (enemy-occupied squares only)
  captures.forEach(([dr, dc]) => {
    const actualDr = (tokenColor === 'crimson') ? dr : -dr;

    if (unlimited) {
      const stepR = actualDr === 0 ? 0 : actualDr / Math.abs(actualDr);
      const stepC = dc === 0 ? 0 : dc / Math.abs(dc);

      for (let dist = 1;; dist++) {
        const nr = pos.r + dist * stepR;
        const nc = pos.c + dist * stepC;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) break;

        const occColor = occupantColor(nr, nc);
        const b = buttons[nr * cols + nc];

        if (!occColor) {
          continue;
        } else if (occColor !== tokenColor) {
          b.classList.add('highlight-occupied');
          break;
        } else {
          break;
        }
      }
      return;
    }

    if (isFlying) {
      const nr = pos.r + actualDr;
      const nc = pos.c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return;
      const btn = buttons[nr * cols + nc];
      const occupant = btn.querySelector('.token');
      if (occupant && occupant.style.backgroundColor !== tokenColor) {
        btn.classList.add('highlight-occupied');
      }
      return;
    }

    const nr = pos.r + actualDr;
    const nc = pos.c + dc;
    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return;

    const btn = buttons[nr * cols + nc];
    const occupant = btn.querySelector('.token');
    if (occupant && occupant.style.backgroundColor !== tokenColor) {
      btn.classList.add('highlight-occupied');
    }
  });
}

function checkArcanistStatus() {
  const arcanists = { red: false, blue: false };
  buttons.forEach(btn => {
    const token = btn.querySelector('.token');
    if (token && token.dataset.playerClass === 'Arcanist') {
      if (token.style.backgroundColor === 'crimson') arcanists.red = true;
      else if (token.style.backgroundColor === 'blue') arcanists.blue = true;
    }
  });

  if (!arcanists.red) {
    gameOver = true;
    showGameOverNotification("You have Lost!");
  }
  if (!arcanists.blue) {
    gameOver = true;
    showGameOverNotification("You Have Won!");
  }
}

function resetGame() {
  // Clear flags
  gameOver = false;
  tokenSelected = false;
  selectedToken = null;
  moveCount = 0;
  manaRed = 1000;
  manaBlue = 1000;
  incomeRed = 10;
  incomeBlue = 10;
  phase = 'move';

  roundCounter.textContent = `Round 0`;
  turnSummary.style.opacity = '0';
  turnSummary.innerHTML = '';

  // Clear all tokens from board
  buttons.forEach(btn => {
    while (btn.firstChild) {
      btn.removeChild(btn.firstChild);
    }
    btn.classList.remove('captured-red', 'captured-blue', 'highlight', 'highlight-occupied', 'highlight-hover', 'highlight-hover-occupied');
    btn.capturedBy = null;
    btn.incomeLabel = null;
  });

  // Reset income, sanctums and base tokens
  const bottomRef = { r: rows - 2, c: Math.floor(cols / 2) };
  const topRef = { r: 1, c: Math.floor(cols / 2) };

  const bottomBtn = buttons[bottomRef.r * cols + bottomRef.c];
  bottomBtn.capturedBy = 'red';
  bottomBtn.classList.add('captured-red');

  const topBtn = buttons[topRef.r * cols + topRef.c];
  topBtn.capturedBy = 'blue';
  topBtn.classList.add('captured-blue');

  // Add starting Arcanist tokens
  tokenPos1 = { r: bottomRef.r, c: bottomRef.c };
  tokenPos2 = { r: topRef.r, c: topRef.c };

  bottomBtn.appendChild(createToken('crimson', 'Arcanist', 'Red Arcanist Token'));
  topBtn.appendChild(createToken('blue', 'Arcanist', 'Blue Arcanist Token'));

  calculateIncome();
  updateStatusBars();
  updateSkipButton();
  renderDeployBanners();
}

function showGameOverNotification(message) {
  turnSummary.style.opacity = '1';
  turnSummary.style.color = 'black';
  turnSummary.style.textAlign = 'center';
  turnSummary.innerHTML = `<div>${message}</div><button id="restartBtn" style="
    margin-top:12px;
    padding: 8px 16px;
    font-weight: bold;
    font-size: 1rem;
    border-radius: 6px;
    cursor: pointer;
    background-color: #3399ff;
    color: white;
    border: none;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  ">Restart?</button>`;
  
  clearTimeout(summaryTimeout);

  const restartBtn = document.getElementById('restartBtn');
  restartBtn.addEventListener('click', () => {
    resetGame();
  });
}

function updateSkipButton() {
  skipDeployBtn.disabled = (phase === 'move');
  skipDeployBtn.style.opacity = skipDeployBtn.disabled ? 0.5 : 1;
}

function showTurnSummary(roundNum, playerColor, deployed, incomeGained, tokenClass = '') {
  clearTimeout(summaryTimeout);
  if (gameOver) return;
  const color = playerColor === 'crimson' ? 'crimson' : 'dodgerblue';
  const deployText = deployed ? `Deployed: ${tokenClass}` : 'Deployment Skipped';
  turnSummary.style.color = color;
  turnSummary.textContent = `Round ${roundNum}\n${deployText}\n${incomeGained} Mana Gained`;
  turnSummary.style.opacity = '1';

  summaryTimeout = setTimeout(() => {
    turnSummary.style.opacity = '0';
  }, 3000);
}

// ----------------- TOKEN CREATION -----------------

function createToken(color, playerClass, title) {
  const token = document.createElement('div');
  token.className = 'token';
  token.style.backgroundColor = color;
  token.title = title;

  token.textContent = tokenClasses[playerClass].label;

  token.style.color = 'white';
  token.style.fontWeight = 'bold';
  token.style.fontSize = '1.0rem';
  token.style.textAlign = 'center';
  token.style.lineHeight = '19px';
  token.style.userSelect = 'none';

  token.dataset.playerClass = playerClass;
  token.dataset.color = color;
  
  token.addEventListener('mouseover', () => {
    if (phase !== 'move') return;
    const parentBtn = token.parentElement;
    if (!parentBtn) return;
    const index = buttons.indexOf(parentBtn);
    if (index < 0) return;
    const pos = { r: Math.floor(index / cols), c: index % cols };
    const tokenColor = token.style.backgroundColor;
    const playerClass = token.dataset.playerClass;
  
    clearHoverHighlights();
  
    const tokenClassData = tokenClasses[playerClass];
    const moves = tokenClassData.moves || [];
    const captures = tokenClassData.captures || moves;
    const unlimited = tokenClassData.unlimited === true;
  
    // Helper function to highlight all squares for given vectors and class
    function addHighlightSquares(vectors, highlightClass) {
      vectors.forEach(([dr, dc]) => {
        const actualDr = (tokenColor === 'crimson') ? dr : -dr;
  
        if (unlimited) {
          const stepR = actualDr === 0 ? 0 : actualDr / Math.abs(actualDr);
          const stepC = dc === 0 ? 0 : dc / Math.abs(dc);
  
          for (let dist = 1;; dist++) {
            const nr = pos.r + dist * stepR;
            const nc = pos.c + dist * stepC;
  
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) break;
  
            const b = buttons[nr * cols + nc];
            b.classList.add(highlightClass);
          }
        } else {
          const nr = pos.r + actualDr;
          const nc = pos.c + dc;
  
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return;
  
          const b = buttons[nr * cols + nc];
          b.classList.add(highlightClass);
        }
      });
    }
  
    addHighlightSquares(moves, 'highlight-hover');           // pink for moves
    addHighlightSquares(captures, 'highlight-hover-occupied');  // dark orange for captures
  });

  token.addEventListener('mouseout', () => {
    clearHoverHighlights();
  });

  token.addEventListener('click', (e) => {
    if (gameOver) return;
    e.stopPropagation();

    if (phase !== 'move') return;

    const tokenColor = token.style.backgroundColor;
    if (!tokenSelected) {
      if (tokenColor !== currentColor()) return;

      let currentPos = null;
      for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].contains(token)) {
          currentPos = { r: Math.floor(i / cols), c: i % cols };
          break;
        }
      }
      if (!currentPos) return;

      tokenSelected = true;
      token.classList.add('selected');
      selectedToken = { elem: token, position: currentPos };

      highlightValidMovesByClass(currentPos, token.dataset.playerClass, tokenColor);

    } else if (selectedToken && selectedToken.elem === token) {
      tokenSelected = false;
      token.classList.remove('selected');
      clearHighlights();
      selectedToken = null;
    }
  });

  return token;
}

let selectedToken = null;

function deployToken(playerColor, tokenClass, cost) {
  const sanctum = sanctumPosition(playerColor);
  const sanctumBtn = buttons[sanctum.r * cols + sanctum.c];

  // Check if sanctum is occupied or controlled by enemy
  if (sanctumBtn.querySelector('.token')) {
    alert('Sanctum already occupied. Cannot deploy token.');
    return;
  }
  if (sanctumBtn.capturedBy && sanctumBtn.capturedBy !== playerColor) {
    alert('Sanctum is controlled by the enemy. Cannot deploy token.');
    return;
  }

  const mana = playerColor === 'red' ? manaRed : manaBlue;
  if (mana < cost) {
    alert('Not enough mana to deploy token.');
    return;
  }

  if (playerColor === 'red') {
    manaRed -= cost;
  } else {
    manaBlue -= cost;
  }

  const newToken = createToken(playerColor === 'red' ? 'crimson' : 'blue', tokenClass, `${playerColor.charAt(0).toUpperCase() + playerColor.slice(1)} ${tokenClass} Token`);
  sanctumBtn.appendChild(newToken);

  sanctumBtn.classList.remove('captured-red', 'captured-blue');
  sanctumBtn.capturedBy = playerColor;
  sanctumBtn.classList.add(playerColor === 'red' ? 'captured-red' : 'captured-blue');

  calculateIncome();

  if (playerColor === 'red') {
    manaRed += incomeRed;
  } else {
    manaBlue += incomeBlue;
  }

  updateStatusBars();

  moveCount++;
  roundCounter.textContent = `Round ${moveCount}`;

  const income = playerColor === 'red' ? incomeRed : incomeBlue;
  showTurnSummary(moveCount, playerColor === 'red' ? 'crimson' : 'blue', true, income, tokenClass);

  phase = 'move';
  updateSkipButton();
  renderDeployBanners();
  
  deployImagePopup.style.display = 'none';
  deployImagePopupImg.src = '';

}

// BOARD SETUP

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const btn = document.createElement('button');
    btn.textContent = '';
    btn.title = `Row ${r + 1}, Col ${c + 1}`;

    const middleCol = Math.floor(cols / 2);
    const bottomRef = { r: rows - 2, c: middleCol };
    const topRef = { r: 1, c: middleCol };

    const isSanctum = (r === bottomRef.r && c === bottomRef.c) || (r === topRef.r && c === topRef.c);

    if (isSanctum) {
      btn.income = 10;
      btn.classList.add('sanctum');
      btn.title += ' | Sanctum';
    } else {
      const distToBottom = Math.max(Math.abs(r - bottomRef.r), Math.abs(c - bottomRef.c));
      const distToTop = Math.max(Math.abs(r - topRef.r), Math.abs(c - topRef.c));
      const dist = Math.min(distToBottom, distToTop);
      btn.income = Math.min(Math.floor(dist / 2), 5) + 1;
      btn.title += ` | Income: ${btn.income}`;
    }

    const incomeLabel = document.createElement('div');
    incomeLabel.className = 'income-label';
    incomeLabel.textContent = btn.income;
    btn.appendChild(incomeLabel);

  btn.addEventListener('click', () => {
    if (gameOver) return;
    if (phase === 'move') {
      if (tokenSelected && selectedToken) {
        if (selectedToken.elem.style.backgroundColor !== currentColor()) {
          return;
        }
  
        if (btn.contains(selectedToken.elem)) {
          // Deselect on clicking selected token square
          tokenSelected = false;
          selectedToken.elem.classList.remove('selected');
          clearHighlights();
          selectedToken = null;
          return;
        }
  
        const canMoveHere = btn.classList.contains('highlight');
        const canCaptureHere = btn.classList.contains('highlight-occupied');
  
        if (!canMoveHere && !canCaptureHere) {
          // Invalid move/capture square; ignore click
          return;
        }
  
        // For moves: target square must be empty
        if (canMoveHere) {
          if (btn.querySelector('.token')) return; // blocked square, no move allowed
        }
        // For captures: target square must have enemy token
        if (canCaptureHere) {
          const occupant = btn.querySelector('.token');
          if (!occupant || occupant.style.backgroundColor === selectedToken.elem.style.backgroundColor) {
            // No enemy token to capture
            return;
          }
        }
  
        // Now perform move or capture
        const existingToken = btn.querySelector('.token');
        if (existingToken && existingToken !== selectedToken.elem) {
          existingToken.remove();
          checkArcanistStatus();
        }
  
        if (selectedToken.elem.parentElement) {
          selectedToken.elem.parentElement.removeChild(selectedToken.elem);
        }
  
        btn.appendChild(selectedToken.elem);
  
        const index = buttons.indexOf(btn);
        const rNew = Math.floor(index / cols);
        const cNew = index % cols;
  
        if (selectedToken.elem.style.backgroundColor === 'crimson') {
          tokenPos1 = { r: rNew, c: cNew };
        } else {
          tokenPos2 = { r: rNew, c: cNew };
        }
  
        btn.classList.remove('captured-red', 'captured-blue');
        if (selectedToken.elem.style.backgroundColor === 'crimson') {
          btn.capturedBy = 'red';
          btn.classList.add('captured-red');
        } else if (selectedToken.elem.style.backgroundColor === 'blue') {
          btn.capturedBy = 'blue';
          btn.classList.add('captured-blue');
        } else {
          btn.capturedBy = null;
        }
  
        calculateIncome();
  
        updateStatusBars();
  
        tokenSelected = false;
        selectedToken.elem.classList.remove('selected');
        clearHighlights();
        selectedToken = null;
  
        phase = 'deploy';
        updateSkipButton();
        renderDeployBanners();
      }
    } else if (phase === 'deploy') {
      const player = currentPlayer();
      const sanctum = sanctumPosition(player);
      const sanctumIndex = sanctum.r * cols + sanctum.c;
      const sanctumBtn = buttons[sanctumIndex];
  
      if (btn === sanctumBtn) {
        if (btn.querySelector('.token')) {
          alert('Sanctum already occupied. Cannot deploy token.');
          return;
        }
        if ((player === 'red' && manaRed < 200) || (player === 'blue' && manaBlue < 200)) {
          alert('Not enough mana to deploy token (cost: 200).');
          return;
        }
  
        if (player === 'red') {
          manaRed -= 200;
        } else {
          manaBlue -= 200;
        }
      }
    }
  });
    buttons.push(btn);
    gameboard.appendChild(btn);
  }
}

const startRedButton = buttons[(rows - 2) * cols + Math.floor(cols / 2)];
startRedButton.capturedBy = 'red';
startRedButton.classList.add('captured-red');

const startBlueButton = buttons[1 * cols + Math.floor(cols / 2)];
startBlueButton.capturedBy = 'blue';
startBlueButton.classList.add('captured-blue');

buttons[tokenPos1.r * cols + tokenPos1.c].appendChild(createToken('crimson', 'Arcanist', 'Red Arcanist Token'));
buttons[tokenPos2.r * cols + tokenPos2.c].appendChild(createToken('blue', 'Arcanist', 'Blue Arcanist Token'));

updateStatusBars();
updateSkipButton();

skipDeployBtn.addEventListener('click', () => {
  if (gameOver) return;
  if (phase === 'deploy') {
    const player = currentPlayer();

    phase = 'move';
    moveCount++;
    roundCounter.textContent = `Round ${moveCount}`;
    updateSkipButton();

    if (player === 'red') {
      manaRed += incomeRed;
    } else {
      manaBlue += incomeBlue;
    }
    updateStatusBars();

    showTurnSummary(moveCount, player === 'red' ? 'crimson' : 'blue', false, player === 'red' ? incomeRed : incomeBlue, '');

    renderDeployBanners();
  }
});
