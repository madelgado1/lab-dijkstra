import { assert } from '../../utils/assert.js';
import { Coordinate } from '../../models/Coordinate.js'
import { Color } from '../../models/Color.js'
import { Turn } from '../../models/Turn.js';
import { Board } from '../../models/Board.js';
export class BoardView {

  #board;
  #callback;
  #existEventClick;

  constructor(board, callback) {
    this.#board = board;
    this.#callback = function() { callback(parseInt(this.role)) };
  }

  reset(currentColor, existEventClick) {
    assert(Color.isColorValid(currentColor));
    assert(typeof existEventClick == "boolean");
    for (let row = 0; row < Coordinate.MAX_ROWS; row++) {
      for (let column = 0; column < Coordinate.MAX_COLUMNS; column++) {
        let className = 'board__cell';
        if (row === Coordinate.MAX_ROWS - 1) {
          className += ' board__header';
        }

        const color = this.#board.getColor(new Coordinate(row, column));
        className += color ? ` board__cell--has-${color}` : ``;

        document.querySelector(`#cell-${row}${column}`).className = className;
        document.querySelector(`#checker-${row}${column}`).checked = Boolean(color);
      }
    }
    this.#existEventClick = existEventClick;
    existEventClick && this.#changeTurn(currentColor);
    existEventClick ? this.#addEventClick() : this.removeEventClick();
  }

  #addEventClick() {
    document.querySelectorAll('.board__header').forEach((element) => {
      element.addEventListener('click', this.#callback)
    })
  }

  removeEventClick(header) {
    assert(typeof header === 'object' || header === undefined);
    if (header) {
      header.removeEventListener('click', this.#callback)
    } else {
      document.querySelectorAll('.board__header').forEach((header) => {
        header.removeEventListener('click', this.#callback)
      })
    }
  }

  writeToken(currentColor, currentTurn) {
    assert(Color.isColorValid(currentColor));
    const currentCoordinate = this.#board.getCurrentCoordinate();
    document.getElementById(`cell-${currentCoordinate.row}${currentCoordinate.column}`).classList.add(`board__cell--has-${currentColor}`);
    document.getElementById(`checker-${currentCoordinate.row}${currentCoordinate.column}`).checked = true;
    this.#board.isComplete(currentCoordinate.column) && this.#removeEventColumnCompleted(currentCoordinate, currentColor);
    const color = this.#getNextColor(currentTurn);
    this.#existEventClick && this.#changeTurn(color);
  }

  #changeTurn(color) {
    assert(Color.isColorValid(color));
    const headers = document.querySelectorAll(`.board__header`);
    headers.forEach((element) => {
      element.className = 'board__header board__cell';
      element.classList.add(`board__header--turn-${color}`)
    });
  }

  #removeEventColumnCompleted(currentCoordinate, currentColor) {
    const header = document.querySelector(`#cell-${currentCoordinate.row}${currentCoordinate.column}`);
    this.removeEventClick(header);
    this.removeTurnHeader(header, currentColor);
  }

  removeTurnHeader(header, currentColor) {
    assert(typeof header === 'object' || header === undefined);
    assert(currentColor === undefined || Color.isColorValid(currentColor));
    if (header) {
      header.classList.remove(`board__header`, `board__header--turn-${currentColor}`);
    } else {
      document.querySelectorAll(`.board__header`).forEach((header) => {
        for (let color of Color.values()) {
          this.removeTurnHeader(header, color);
        }
      })
    }
  }

  highlightLineWinner(line) {
    for (let i = 0; i < Board.LINE_LENGTH; i++) {
      const coordinate = line[i];
      document.querySelector(`#cell-${coordinate.row}${coordinate.column}`).classList.add('board__cell--highlight');
    }
  }

  #getNextColor(currentTurn) {
    const ordinal = (currentTurn + 1) % Turn.MAX_PLAYERS;
    return Color.get(ordinal);
  }
}