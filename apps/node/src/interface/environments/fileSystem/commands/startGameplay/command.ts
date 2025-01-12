import { Argument, Command } from "commander";
import actions from "../../../../actions/actions";
import { parseGameMode } from "../../../../parsing";
import { GameMode, GameName } from "../../../../types";

const action = async ({
  game,
  gameMode,
}: {
  game: string;
  gameMode: GameMode;
}): Promise<void> => {
  await actions.startGameplay({ game, gameMode });
};

const commandToStartGameplay = {
  arguments: [
    new Argument("<game>", "The game to be played.")
      .choices([GameName.Connect4, GameName.TicTacToe])
      .argRequired(),
    new Argument("[mode]", "The game mode.")
      .choices([GameMode.PvP, GameMode.PvC, GameMode.CvC])
      .argParser(parseGameMode)
      .argRequired(),
  ],
  command: new Command("play").description("Play a game.").action(action),
};

export default commandToStartGameplay;
