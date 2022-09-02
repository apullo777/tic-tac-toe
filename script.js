function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const Player = (sign) => {
  let _sign = sign;
  const getSign = () => _sign;
  const setSign = (sign, active) => {
    _sign = sign;
    const playerBtn = document.querySelector(
      `.player-btn.${sign.toLowerCase()}`
    );
    if (active) {
      playerBtn.classList.add("chosen");
      playerBtn.classList.remove("unchosen");
    } else {
      playerBtn.classList.remove("chosen");
      playerBtn.classList.add("unchosen");
    }
  };
  return {
    getSign,
    setSign,
  };
};

const gameBoard = (() => {
  let _board = new Array(9);
  const getField = (num) => _board[num];
  const setField = (num, player) => {
    const field = document.querySelector(`.field:nth-child(${num + 1}) p`);
    field.classList.add("appear");
    field.textContent = player.getSign();
    _board[num] = player.getSign();
  };

  const getAvailableFields = () => {
    fields = [];
    for (let i = 0; i < _board.length; i++) {
      const field = _board[i];
      if (field == undefined) {
        fields.push(i);
      }
    }
    return fields;
  };

  const setFieldForMiniMax = (num, player) => {
    if (player == undefined) {
      _board[num] = undefined;
      return;
    }
    _board[num] = player.getSign();
  };

  const reset = () => {
    for (let i = 0; i < _board.length; i++) {
      _board[i] = undefined;
    }
  };
  return {
    getField,
    setField,
    getAvailableFields,
    setFieldForMiniMax,
    reset,
  };
})();

const minimaxAi = ((percentage) => {
  let threshold = percentage;

  const setAiPrecision = (percentage) => {
    threshold = percentage;
  };
  const getAiPrecision = () => {
    return threshold;
  };

  const chooseField = () => {
    const value = Math.floor(Math.random() * (100 + 1));

    // if the random number is smaller then the threshold, it finds the best move
    let choice = null;
    if (value <= threshold) {
      console.log("bestChoice");
      choice = minimax(gameBoard, gameController.getAiPlayer()).index;
      const field = gameBoard.getField(choice);
      if (field != undefined) {
        return "error";
      }
    } else {
      console.log("randomChoice");
      const availableFields = gameBoard.getAvailableFields();
      let randomMove = Math.floor(Math.random() * availableFields.length);
      choice = availableFields[randomMove];
    }
    return choice;
  };

  const findBestMove = (moves, player) => {
    let bestMove;
    if (player === gameController.getAiPlayer()) {
      let bestScore = -10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      let bestScore = 10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }
    return moves[bestMove];
  };

  const minimax = (newBoard, player) => {
    let availableFields = newBoard.getAvailableFields();

    if (gameController.checkDraw(newBoard)) {
      return {
        score: 0,
      };
    } else if (gameController.checkWinner(newBoard)) {
      if (player.getSign() == gameController.getHumanPlayer().getSign()) {
        return {
          score: 10,
        };
      } else if (player.getSign() == gameController.getAiPlayer().getSign()) {
        return {
          score: -10,
        };
      }
    }

    let availableMoves = [];

    for (let i = 0; i < availableFields.length; i++) {
      let move = {};
      move.index = availableFields[i];

      newBoard.setFieldForMiniMax(availableFields[i], player);

      //Call the minimax with the opposite player
      if (player.getSign() == gameController.getAiPlayer().getSign()) {
        let result = minimax(newBoard, gameController.getHumanPlayer());
        move.score = result.score;
      } else {
        let result = minimax(newBoard, gameController.getAiPlayer());
        move.score = result.score;
      }

      //Reset the fieled values
      newBoard.setFieldForMiniMax(availableFields[i], undefined);

      availableMoves.push(move);
    }

    //find the best move
    return findBestMove(availableMoves, player);
  };
  return {
    minimax,
    chooseField,
    setAiPrecision,
    getAiPrecision,
  };
})(0);

const gameController = (() => {
  const _humanPlayer = Player("X");
  const _aiPlayer = Player("O");
  const _aiLogic = minimaxAi;

  const getHumanPlayer = () => _humanPlayer;
  const getAiPlayer = () => _aiPlayer;

  const _sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const _checkForRows = (board) => {
    for (let i = 0; i < 3; i++) {
      let row = [];
      for (let j = i * 3; j < i * 3 + 3; j++) {
        row.push(board.getField(j));
      }

      if (
        row.every((field) => field == "X") ||
        row.every((field) => field == "O")
      ) {
        return true;
      }
    }
    return false;
  };

  const _checkForDiagonals = (board) => {
    diagonal1 = [board.getField(0), board.getField(4), board.getField(8)];
    diagonal2 = [board.getField(6), board.getField(4), board.getField(2)];
    if (
      diagonal1.every((field) => field == "X") ||
      diagonal1.every((field) => field == "O")
    ) {
      return true;
    } else if (
      diagonal2.every((field) => field == "X") ||
      diagonal2.every((field) => field == "O")
    ) {
      return true;
    }
  };

  const _checkForColumns = (board) => {
    for (let i = 0; i < 3; i++) {
      let column = [];
      for (let j = 0; j < 3; j++) {
        column.push(board.getField(i + 3 * j));
      }

      if (
        column.every((field) => field == "X") ||
        column.every((field) => field == "O")
      ) {
        return true;
      }
    }
    return false;
  };

  const checkWinner = (board) => {
    if (
      _checkForRows(board) ||
      _checkForColumns(board) ||
      _checkForDiagonals(board)
    ) {
      return true;
    }
    return false;
  };

  const checkDraw = (board) => {
    if (checkWinner(board)) {
      return false;
    }
    for (let i = 0; i < 9; i++) {
      const field = board.getField(i);
      if (field == undefined) {
        return false;
      }
    }
    return true;
  };

  const switchSign = (sign) => {
    if (sign == "X") {
      _humanPlayer.setSign("X", true);
      _aiPlayer.setSign("O");
    } else if (sign == "O") {
      _humanPlayer.setSign("O", true);
      _aiPlayer.setSign("X");
    } else throw "Incorrect sign";
  };

  const playerStep = (num) => {
    const field = gameBoard.getField(num);
    if (field == undefined) {
      gameBoard.setField(num, _humanPlayer);
      if (checkWinner(gameBoard)) {
        (async () => {
          await _sleep(500 + Math.random() * 500);
          endGame(_humanPlayer.getSign());
        })();
      } else if (checkDraw(gameBoard)) {
        (async () => {
          await _sleep(500 + Math.random() * 500);
          endGame("Draw");
        })();
      } else {
        displayController.closeGame();
        (async () => {
          await _sleep(250 + Math.random() * 300);
          aiStep();
          if (!checkWinner(gameBoard)) {
            displayController.openGame();
          }
        })();
      }
    } else {
      console.log("Already Filled");
    }
  };

  const aiStep = () => {
    const num = _aiLogic.chooseField();
    gameBoard.setField(num, _aiPlayer);
    if (checkWinner(gameBoard)) {
      (async () => {
        await _sleep(500 + Math.random() * 500);
        endGame(_aiPlayer.getSign());
      })();
    } else if (checkDraw(gameBoard)) {
      (async () => {
        await _sleep(500 + Math.random() * 500);
        endGame("Draw");
      })();
    }
  };

  const endGame = function (sign) {
    const container = document.querySelector(".container");
    container.classList.remove("unblur");
    container.classList.add("blur");

    const winElements = document.querySelectorAll(".win p");

    if (sign == "Draw") {
      winElements[3].classList.remove("hide");
      console.log("Its a draw");
    } else {
      console.log(`The winner is player ${sign}`);
      winElements[0].classList.remove("hide");
      if (sign.toLowerCase() == "x") {
        winElements[1].classList.remove("hide");
      } else {
        winElements[2].classList.remove("hide");
      }
    }
    console.log("close game");
    displayController.closeGame();
    displayController.handleRestart();
  };

  const restart = async function () {
    const container = document.querySelector(".container");
    const winElements = document.querySelectorAll(".win p");

    container.classList.add("unblur");

    gameBoard.reset();
    displayController.reset();
    if (_humanPlayer.getSign() == "O") {
      aiStep();
    }
    console.log("restart");
    console.log(minimaxAi.getAiPrecision());
    displayController.openGame();

    container.classList.remove("blur");

    winElements.forEach((element) => {
      element.classList.add("hide");
    });
    document.body.removeEventListener("click", gameController.restart);
  };

  return {
    getHumanPlayer,
    getAiPlayer,
    checkWinner,
    checkDraw,
    switchSign,
    playerStep,
    endGame,
    restart,
  };
})();

const displayController = (() => {
  const board = Array.from(document.querySelectorAll(".field"));
  const form = document.querySelector(".form");
  const restart = document.querySelector(".restart");
  const x = document.querySelector(".x");
  const o = document.querySelector(".o");

  const _switchAI = () => {
    const value = document.querySelector("#levels").value;
    if (value == "easy") {
      minimaxAi.setAiPrecision(0);
    } else if (value == "medium") {
      minimaxAi.setAiPrecision(65);
    } else if (value == "hard") {
      minimaxAi.setAiPrecision(85);
    } else if (value == "unbeatable") {
      minimaxAi.setAiPrecision(100);
    }
    gameController.restart();
  };

  const _switchPlayerSign = (sign) => {
    gameController.switchSign(sign);
    gameController.restart();
  };

  const reset = () => {
    board.forEach((field) => {
      const p = field.childNodes[0];
      p.classList = [];
      p.textContent = "";
    });
  };

  const closeGame = () => {
    board.forEach((field) => {
      field.setAttribute("disabled", "");
    });
  };

  const openGame = () => {
    board.forEach((field) => {
      field.removeAttribute("disabled");
    });
  };

  const handleRestart = () => {
    const body = document.querySelector("body");
    body.addEventListener("click", gameController.restart);
  };

  const _init = (() => {
    for (let i = 0; i < board.length; i++) {
      field = board[i];
      field.addEventListener("click", gameController.playerStep.bind(field, i));
    }

    form.addEventListener("change", _switchAI);

    restart.addEventListener("click", gameController.restart);

    x.addEventListener("click", _switchPlayerSign.bind(this, "X"));

    o.addEventListener("click", _switchPlayerSign.bind(this, "O"));
  })();

  return {
    closeGame,
    openGame,
    reset,
    handleRestart,
  };
})();

gameController.switchSign("X");
