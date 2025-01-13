import Move, { MovePair, MoveParams } from "@repo/engine/engine/Game/Move.js";
import { PlayerPair } from "@repo/engine/engine/Game/Player.js";
import { Score } from "@repo/engine/engine/Game/State.js";
import { Integer } from "@repo/engine/types";
import TicTacToeGame from "./Game.js";
import { TicTacToePlayer } from "./Player.js";
import { INITIAL_POINTS, TicTacToeState } from "./State.js";
import { PlayerKey, Slot } from "./types.js";

const INCREMENT_ONE_POINT = 1;

export interface Position {
  readonly rowIndex: Integer;
  readonly columnIndex: Integer;
}

export type TicTacToeMovePair = MovePair<
  TicTacToePlayer,
  TicTacToeMove,
  TicTacToeState,
  TicTacToeGame
>;

export interface TicTacToeMoveParams
  extends MoveParams<
    TicTacToePlayer,
    TicTacToeMove,
    TicTacToeState,
    TicTacToeGame
  > {
  readonly position: Position;
}

export class TicTacToeMove extends Move<
  TicTacToePlayer,
  TicTacToeMove,
  TicTacToeState,
  TicTacToeGame
> {
  readonly position: TicTacToeMoveParams["position"];

  constructor({ title, description, position }: TicTacToeMoveParams) {
    super({ description, title });
    this.position = position;
  }

  /* Getters */

  protected getPlayer(game: TicTacToeGame, playerKey: PlayerKey): PlayerPair {
    const nextPlayerKey = game.getNextPlayerKey(playerKey);
    const player = game.getPlayer(nextPlayerKey);
    return {
      key: nextPlayerKey,
      player,
    };
  }

  public getPosition(): Position {
    return this.position;
  }

  protected getScore(score: Score, winnerKey: PlayerKey | null): Score {
    if (winnerKey !== null) {
      const winnerCurrentPoints = score[winnerKey] ?? INITIAL_POINTS;
      score[winnerKey] = winnerCurrentPoints + INCREMENT_ONE_POINT;
    }
    return score;
  }

  protected getSlots(state: TicTacToeState): Slot[] {
    const slots = state.getSlots();
    const { rowIndex, columnIndex } = this.position;

    const game = state.getGame();
    const playerKey: PlayerKey = state.getPlayerKey();
    const slotFilledByPlayer = playerKey === PlayerKey.X ? Slot.X : Slot.O;

    const slotKey = rowIndex * game.getQuantityOfColumns() + columnIndex;
    const updatedSlots = [...slots];
    updatedSlots[slotKey] = slotFilledByPlayer;
    return updatedSlots;
  }

  protected getValidMoves(
    game: TicTacToeGame,
    slots: Slot[],
  ): TicTacToeMovePair[] {
    const quantityOfColumns = game.getQuantityOfColumns();
    const validMovesPairs: TicTacToeMovePair[] = [];

    slots.forEach((slot: Slot, index: Integer) => {
      if (slot === Slot.Empty) {
        const rowIndex = Math.floor(index / quantityOfColumns);
        const columnIndex = index % quantityOfColumns;
        const moveKey = rowIndex * quantityOfColumns + columnIndex;

        const move = game.getMove(moveKey);
        if (move !== this) {
          validMovesPairs.push({
            key: moveKey,
            move,
          });
        }
      }
    });
    return validMovesPairs;
  }

  protected isFinal(hasWinner: boolean, updatedSlots: Slot[]): boolean {
    return hasWinner || !this.areThereEmptySlots(updatedSlots);
  }

  protected areThereEmptySlots(slots: Slot[]): boolean {
    return slots.some(slot => slot === Slot.Empty);
  }

  /* Methods */

  public play(state: TicTacToeState): TicTacToeState {
    const lastAssertedPosition = this.position;
    const game = state.getGame();

    const updatedSlots = this.getSlots(state);
    const winner = game.getWinner(updatedSlots, lastAssertedPosition);

    const isFinal = this.isFinal(winner !== null, updatedSlots);
    const nextValidMovesKeys = isFinal
      ? []
      : this.getValidMoves(game, updatedSlots).map(({ key }) => key);

    const updatedScore = this.getScore(
      state.getScore(),
      winner ? winner.key : null,
    );

    return new TicTacToeState({
      game,
      lastAssertedPosition,
      playerKey: this.getPlayer(game, state.getPlayerKey()).key,
      score: updatedScore,
      slots: updatedSlots,
      validMovesKeys: nextValidMovesKeys,
    });
  }
}
