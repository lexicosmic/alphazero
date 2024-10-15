import State, { EncodedState, ValidAction } from "../../engine/Game/State";
import TicTacToeGame, { Player } from "./Game";

const ADJUST_INDEX = 1;

export class TicTacToeState extends State<TicTacToeGame> {
  private readonly rowCount: number;
  private readonly columnCount: number;
  private table: Player[][];

  constructor(game: TicTacToeGame, rowCount: number, columnCount: number) {
    super(game);
    this.rowCount = rowCount;
    this.columnCount = columnCount;
    this.table = Array.from(Array(rowCount), () =>
      Array.from(Array(columnCount), () => Player.None),
    );
  }

  /* Getters */

  public getValidActions(): ValidAction[] {
    const validActions: ValidAction[] = [];
    for (
      let currentRowIndex = 0;
      currentRowIndex < this.rowCount;
      currentRowIndex++
    ) {
      for (
        let currentColumnIndex = 0;
        currentColumnIndex < this.columnCount;
        currentColumnIndex++
      ) {
        const row = this.table[currentRowIndex];
        if (!row) continue;
        const cell = row[currentColumnIndex];
        validActions.push(cell === Player.None);
      }
    }
    return validActions;
  }

  public getPlayerAt(position: number): Player | null {
    const rowIndex = Math.floor(position / this.columnCount);
    const columnIndex = position % this.columnCount;
    const row = this.table[rowIndex];
    if (!row) return null;
    return row[columnIndex] ?? null;
  }

  public getEncodedState(): number[][][] {
    const encodedState: EncodedState = Array.from(Array(this.rowCount), () =>
      Array.from(Array(this.columnCount), () => [
        Player.None,
        Player.None,
        Player.None,
      ]),
    );
    for (
      let currentRowIndex = 0;
      currentRowIndex < this.rowCount;
      currentRowIndex++
    ) {
      for (
        let currentColumnIndex = 0;
        currentColumnIndex < this.columnCount;
        currentColumnIndex++
      ) {
        const row = this.table[currentRowIndex];
        if (!row) continue;
        const player = row[currentColumnIndex];
        if (!player) continue;
        this.setPositionInEncodedState({
          columnIndex: currentColumnIndex,
          encodedState,
          player,
          rowIndex: currentRowIndex,
        });
      }
    }
    return encodedState;
  }

  /* Setters */

  public setPlayerAt(player: Player, position: number): void {
    const rowIndex = Math.floor(position / this.columnCount);
    const columnIndex = position % this.columnCount;
    const row = this.table[rowIndex];
    if (!row) return;
    row[columnIndex] = player;
  }

  public setPositionInEncodedState({
    rowIndex,
    columnIndex,
    player,
    encodedState,
  }: {
    rowIndex: number;
    columnIndex: number;
    player: Player;
    encodedState: EncodedState;
  }) {
    const PLAYER_X_INDEX = 2;
    const PLAYER_O_INDEX = 0;
    const PLAYER_NONE_INDEX = 1;

    if (encodedState[rowIndex]?.[columnIndex]) {
      if (player === Player.X)
        encodedState[rowIndex][columnIndex][PLAYER_X_INDEX] = 1;
      else if (player === Player.O)
        encodedState[rowIndex][columnIndex][PLAYER_O_INDEX] = 1;
      else encodedState[rowIndex][columnIndex][PLAYER_NONE_INDEX] = 1;
    }
  }

  /* Methods */

  public toString(): string {
    let boardString = "";
    for (const row of this.table) {
      boardString += "|";
      for (const cell of row) {
        boardString += " ";
        if (cell === Player.X) boardString += "X";
        else if (cell === Player.O) boardString += "O";
        else boardString += "-";
        boardString += " |";
      }
      boardString += "\n";
    }
    return boardString;
  }

  public clone(): TicTacToeState {
    const clonedState = new TicTacToeState(
      this.game,
      this.rowCount,
      this.columnCount,
    );
    clonedState.table = this.table.map(row => row.slice());
    return clonedState;
  }

  public checkWin(action: number): boolean {
    const rowIndex = Math.floor(action / this.columnCount);
    const columnIndex = action % this.columnCount;

    const row = this.table[rowIndex];
    if (!row) return false;
    const player = row[columnIndex];
    if (!player) return false;

    // Won on the row
    if (row.every(cell => cell === player)) return true;
    // Won on the column
    if (this.table.every(currentRow => currentRow[columnIndex] === player))
      return true;
    // Won on the primary diagonal
    if (
      this.table.every(
        (currentRow, currentRowIndex) => currentRow[currentRowIndex] === player,
      )
    )
      return true;
    // Won on the secondary diagonal
    if (
      this.table.every(
        (currentRow, currentRowIndex) =>
          currentRow[this.columnCount - ADJUST_INDEX - currentRowIndex] ===
          player,
      )
    )
      return true;
    // No win
    return false;
  }

  public performAction(action: number, player: Player): void {
    const rowIndex = Math.floor(action / this.columnCount);
    const columnIndex = action % this.columnCount;
    // Play the action on the given state
    const row = this.table[rowIndex];
    if (!row) return;
    row[columnIndex] = player;
  }

  /* Static methods */

  public changePerspective(
    currentPlayer: Player,
    opponentPlayer: Player,
  ): void {
    for (
      let currentRowIndex = 0;
      currentRowIndex < this.rowCount;
      currentRowIndex++
    ) {
      for (
        let currentColumnIndex = 0;
        currentColumnIndex < this.columnCount;
        currentColumnIndex++
      ) {
        const row = this.table[currentRowIndex];
        if (!row) continue;
        const player = row[currentColumnIndex];
        if (!player) continue;

        if (player === currentPlayer) row[currentColumnIndex] = opponentPlayer;
        else if (player === opponentPlayer)
          row[currentColumnIndex] = currentPlayer;
      }
    }
  }
}
