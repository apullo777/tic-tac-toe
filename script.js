
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

const gameBoard = (() => {
    let _board = new Array(9);
    const getField = (num) => _board[num];
    const setField = (num, player) => {
        const field = document.querySelector(`.field:nth-child(${num + 1})`);
        field.classList.add('puff-in-center');
        field.textContent = player.getSign();
        _board[num] = player.getSign();
    }

    const setFieldForAiLogic = (num, player) => {
        if (player == undefined) {
            _board[num] = undefined;
            return;
        }
        _board[num] = player.getSign();
    }

    const getEmptyFieldsIdx = () => {
        fields = [];
        for (let i = 0; i < _board.length; i++) {
            const field = _board[i];
            if (field == undefined) {
                fields.push(i);
            }
        }
        return fields;
    }

    const clear = () => {
        for (let i = 0; i < _board.length; i++) {
            _board[i] = undefined;
        }
    }
    return {
        getField,
        getEmptyFieldsIdx,
        setField,
        setFieldForAiLogic,
        clear
    };
})();


const Player = (sign) => {
    let _sign = sign;
    const getSign = () => _sign;
    const setSign = (sign, active) => {
        _sign = sign;
        const p = document.querySelector(`.player-btn.${sign.toLowerCase()}`);
        if(active){
            p.classList.add('chosen');
            p.classList.remove('unchosen');
        }
        else{
            p.classList.remove('chosen');
            p.classList.add('unchosen');
        }
    }
    return {
        getSign,
        setSign
    }
}

const gameController = (() => {
    const _humanPlayer = Player('X');
    const _aiPlayer = Player('O')

    const getHumanPlayer = () => _humanPlayer;
    const getAiPlayer = () => _aiPlayer;


    const _sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const _checkForRows = (board) => {
        for (let i = 0; i < 3; i++) {
            let row = []
            for (let j = i * 3; j < i * 3 + 3; j++) {
                row.push(board.getField(j));
            }

            if (row.every(field => field == 'X') || row.every(field => field == 'O')) {
                return true;
            }
        }
        return false;
    }

    const _checkForDiagonals = (board) => {
        diagonal1 = [board.getField(0), board.getField(4), board.getField(8)];
        diagonal2 = [board.getField(6), board.getField(4), board.getField(2)];
        if (diagonal1.every(field => field == 'X') || diagonal1.every(field => field == 'O')) {
            return true;
        }
        else if (diagonal2.every(field => field == 'X') || diagonal2.every(field => field == 'O')) {
            return true;
        }
    }

    const _checkForColumns = (board) => {
        for (let i = 0; i < 3; i++) {
            let column = []
            for (let j = 0; j < 3; j++) {
                column.push(board.getField(i + 3 * j));
            }

            if (column.every(field => field == 'X') || column.every(field => field == 'O')) {
                return true;
            }
        }
        return false;
    }

    const checkForWin = (board) => {
        if (_checkForRows(board) || _checkForColumns(board) || _checkForDiagonals(board)) {
            return true;
        }
        return false;
    }

    const checkForDraw = (board) => {
        if (checkForWin(board)) {
            return false;
        }
        for (let i = 0; i < 9; i++) {
            const field = board.getField(i);
            if (field == undefined) {
                return false;
            }
        }
        return true;
    }


    const changeSign = (sign) => {
        if (sign == 'X') {
            _humanPlayer.setSign('X', true);
            _aiPlayer.setSign('O');
        }
        else if (sign == 'O') {
            _humanPlayer.setSign('O', true);
            _aiPlayer.setSign('X');
        }
        else throw 'Incorrect sign';
    }

    const playerStep = (num) => {
        const field = gameBoard.getField(num);
        if (field == undefined) {
            gameBoard.setField(num, _humanPlayer);
            if (checkForWin(gameBoard)) {
                (async () => {
                    await _sleep(500 + (Math.random() * 500));
                    endGame(_humanPlayer.getSign());
                })();  
            }
            else if (checkForDraw(gameBoard)) {
                (async () => {
                    await _sleep(500 + (Math.random() * 500));
                    endGame("Draw");
                })();  
            }
            else {
                displayController.deactivate();
                (async () => {
                    await _sleep(250 + (Math.random() * 300));
                    aiStep();
                    if (!checkForWin(gameBoard)) {
                        displayController.activate();
                    }
                })();
            }
        }
        else {
            console.log('Already Filled')
        }
    }

    const endGame = function(sign){

        const container = document.querySelector('.container');
        container.classList.remove('unblur');
        container.classList.add('blur');

        const winElements = document.querySelectorAll('.win p')

        if (sign == "Draw") {
            winElements[3].classList.remove('hide');
            console.log("Its a draw");
        }
        else {
            console.log(`The winner is player ${sign}`);
            winElements[0].classList.remove('hide');
            if(sign.toLowerCase() == 'x'){
                winElements[1].classList.remove('hide');
            }
            else{
                winElements[2].classList.remove('hide');
            }
        }
        console.log('deactivate');
        displayController.deactivate();
        displayController.makeBodyRestart();
    }


    const restart = async function () {

        const container = document.querySelector('.container');
        const winElements = document.querySelectorAll('.win p');

        container.classList.add('unblur');

        gameBoard.clear();
        displayController.clear();
        if (_humanPlayer.getSign() == 'O') {
            aiStep();
        }
        console.log('restart');
        console.log(minimaxAiLogic.getAiPercentage());
        displayController.activate();

   
        card.classList.remove('blur');
      
        winElements.forEach(element => {
            element.classList.add('hide');
        });
        document.body.removeEventListener('click', gameController.restart);

    }

    return {
        getHumanPlayer,
        getAiPlayer,
        checkForWin,
        checkForDraw,
        changeSign,
        playerStep,
        endGame,
        restart
    }
})();

const displayController = (() => {
    const htmlBoard = Array.from(document.querySelectorAll('button.field'));
    const form = document.querySelector('.form');
    const restart = document.querySelector('.restart');
    const x = document.querySelector('.x');
    const o = document.querySelector('.o');

    const _changeAI = () => {
        const value = document.querySelector('#levels').value;
        if (value == 'easy') {
            minimaxAiLogic.setAiPercentage(0);
        }
        else if (value == 'medium') {
            minimaxAiLogic.setAiPercentage(75);
        }
        else if (value == 'hard') {
            minimaxAiLogic.setAiPercentage(90);
        }
        else if (value == 'unbeatable') {
            minimaxAiLogic.setAiPercentage(100);
        }
        gameController.restart();
    }

    const _changePlayerSign = (sign) => {
        gameController.changeSign(sign);
        gameController.restart();
    }

    const clear = () => {
        htmlBoard.forEach(field => {
            const p = field.childNodes[0];
            p.classList = [];
            p.textContent = '';
        });
    }

    const deactivate = () => {
        htmlBoard.forEach(field => {
            field.setAttribute('disabled', '');
        });
    }

    const activate = () => {
        htmlBoard.forEach(field => {

            field.removeAttribute('disabled');
        });
    }

    const makeBodyRestart = () =>{
        const body = document.querySelector('body');
        body.addEventListener('click', gameController.restart);
        
    }

    const _init = (() => {
        for (let i = 0; i < htmlBoard.length; i++) {
            field = htmlBoard[i];
            field.addEventListener('click', gameController.playerStep.bind(field, i));
        }

        form.addEventListener('change', _changeAI);

        restart.addEventListener('click', gameController.restart);

        x.addEventListener('click', _changePlayerSign.bind(this, 'X'));

        o.addEventListener('click', _changePlayerSign.bind(this, 'O'));
    })();

    return {
        deactivate,
        activate,
        clear,
        makeBodyRestart
    }
})();