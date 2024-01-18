import { useState } from "react";
import { GameMode, ModelInfo } from "../types";
import { formatGameName } from "../util";
import { loadResNetModel, useOnMountUnsafe } from "./util";
import Game, { Action, Player, State } from "../engine/Game";
import ResNet from "../engine/ResNet";
import TerminalPage from "./TerminalPage";
import Button from "./Button";
import { getActionFromState } from "../modelHandling/util";

interface PlayingProps {
	game: Game;
	modelInfo: ModelInfo | null;
	gameMode: GameMode;
	handleReturn: () => void;
}

export default function Playing({
	game,
	modelInfo,
	gameMode,
	handleReturn,
}: PlayingProps) {
	const [terminalText, setTerminalText] = useState<string>(``);
	const [actions, setActions] = useState<Action[]>([]);
	const [state, setState] = useState<State>(game.getInitialState());
	const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.X);
	const [resNet, setResNet] = useState<ResNet | null>(null);

	useOnMountUnsafe(() => {
		if (modelInfo !== null)
			loadResNetModel(game, modelInfo.path, (loadedModel) => {
				setResNet(loadedModel);
			});
		startGame();
	});

	function startGame() {
		writeToTerminal(`Game mode: ${gameMode}\n`);
		setActions(getValidActions(state));
	}

	function playTurnPvP(action: Action) {
		const nextState = performAction(
			state,
			currentPlayer,
			action,
			writeToTerminal
		);
		const { nextPlayer, nextTurnActions } = getNextTurnData(
			game,
			nextState,
			currentPlayer,
			action,
			writeToTerminal
		);
		setState(nextState);
		setCurrentPlayer(nextPlayer);
		setActions(nextTurnActions);
	}

	function playTurnPvC(action: Action) {
		if (!resNet) return;
		let nextPlayer = currentPlayer;
		let nextState = performAction(
			state,
			currentPlayer,
			action,
			writeToTerminal
		);
		const nextTurnData = getNextTurnData(
			game,
			nextState,
			currentPlayer,
			action,
			writeToTerminal
		);
		nextPlayer = nextTurnData.nextPlayer;
		let nextTurnActions = nextTurnData.nextTurnActions;
		if (nextTurnActions.length > 0) {
			const computerAction = getActionFromState(nextState, resNet);
			nextState = performAction(
				nextState,
				nextPlayer,
				computerAction,
				writeToTerminal
			);
			const postComputerTurnData = getNextTurnData(
				game,
				nextState,
				nextPlayer,
				computerAction,
				writeToTerminal
			);
			nextPlayer = postComputerTurnData.nextPlayer;
			nextTurnActions = postComputerTurnData.nextTurnActions;
		}
		setState(nextState);
		setCurrentPlayer(nextPlayer);
		setActions(nextTurnActions);
	}

	function writeToTerminal(text: string) {
		setTerminalText((prevText) => prevText + text + "\n");
	}

	function handleActionSelected(action: Action) {
		console.log(resNet);
		if (resNet && gameMode === GameMode.PvC) playTurnPvC(action);
		else playTurnPvP(action);
	}

	function quitPlaying() {
		setTerminalText("");
		handleReturn();
	}

	const actionButtons = actions.map((action, index) => (
		<ActionButton
			action={action}
			handleActionSelected={handleActionSelected}
			key={`action-${index}`}
		/>
	));

	return (
		<TerminalPage
			title={`Playing`}
			subtitle={formatGameName(game.getName())}
			terminalText={terminalText}
			handleReturn={quitPlaying}
		>
			{gameMode !== GameMode.CvC && (
				<section className={`mt-2 sm:mt-0 sm:ml-2 flex sm:flex-col gap-1`}>
					{actionButtons}
				</section>
			)}
		</TerminalPage>
	);
}

interface ActionButtonProps {
	action: Action;
	handleActionSelected: (action: Action) => void;
}
function ActionButton({ action, handleActionSelected }: ActionButtonProps) {
	return (
		<Button
			color={`light`}
			onClick={() => handleActionSelected(action)}
			className={`flex-grow px-2`}
		>
			{action}
		</Button>
	);
}

function getValidActions(state: State): Action[] {
	const validActionsEncoded = state.getValidActions();
	const validActions = [];
	for (let i = 0; i < validActionsEncoded.length; i++) {
		if (validActionsEncoded[i]) validActions.push(i);
	}
	return validActions;
}

function performAction(
	state: State,
	player: Player,
	action: Action,
	writeToTerminal: (text: string) => void
): State {
	const nextState = State.clone(state);
	writeToTerminal(`Player ${player}: ${action}`);
	nextState.performAction(action, player);
	writeToTerminal(nextState.toString());
	return nextState;
}

function getNextTurnData(
	game: Game,
	state: State,
	player: Player,
	action: Action,
	writeToTerminal: (text: string) => void
): {
	nextPlayer: Player;
	nextTurnActions: Action[];
} {
	const { isTerminal } = Game.getActionOutcome(state, action);
	let nextTurnActions = getValidActions(state);
	let nextPlayer = game.getOpponent(player);
	if (isTerminal) {
		const hasWon = state.checkWin(action);
		if (hasWon) {
			nextPlayer = player;
			writeToTerminal(`Player ${player} has won!`);
		} else {
			if (nextTurnActions.length === 0) writeToTerminal(`Draw!`);
			else writeToTerminal(`Player ${nextPlayer} has won!`);
		}
		nextTurnActions = [];
	}
	return {
		nextPlayer,
		nextTurnActions,
	};
}
