import { useEffect, useState } from "react";
import { GameMode, GameName, ModelInfo, WorkName } from "../types";
import { formatGameName } from "../util";
import { loadGame } from "./util";
import Game from "../engine/Game";
import PickOption from "./PickOption";
import Training from "./Training";
import Playing from "./Playing";
import Anchor from "./Anchor";
import ManageModels from "./ManageModels";
import Disclaimer from "./Disclaimer";

export default function App() {
	const [gameName, setGameName] = useState<GameName | null>(null);
	const [action, setAction] = useState<ActionOnGame | null>(null);
	const [gameMode, setGameMode] = useState<GameMode | null>(null);
	const [test, setTest] = useState<Test | null>(null);
	const [train, setTrain] = useState<Train | null>(null);
	const [selectedModelInfo, setSelectedModelInfo] = useState<ModelInfo | null>(
		null
	);

	let game: Game | null;
	if (gameName !== null) game = loadGame(gameName);
	else game = null;

	const [showManageModelsScreen, setShowManageModelsScreen] =
		useState<boolean>(false);
	let showHeader =
		gameMode === null && test === null && !showManageModelsScreen;
	let showFooter =
		game !== null && !showManageModelsScreen && gameMode !== GameMode.PvP;
	let isManageModelsButtonDisabled =
		(action === ActionOnGame.Play &&
			gameMode !== null &&
			selectedModelInfo !== null) ||
		(action === ActionOnGame.Train && train !== null) ||
		(action === ActionOnGame.Test && test !== null);

	useEffect(() => {
		if (game === null) setSelectedModelInfo(null);
	}, [game]);

	function getMainContent() {
		if (gameName === null)
			return (
				<PickOption
					title={`Select a game`}
					actions={[
						{
							name: formatGameName(GameName.TicTacToe),
							handleClick: () => setGameName(GameName.TicTacToe),
						},
						{
							name: formatGameName(GameName.ConnectFour),
							handleClick: () => setGameName(GameName.ConnectFour),
						},
					]}
				/>
			);
		if (game === null) return <p>Loading game</p>;
		if (showManageModelsScreen)
			return (
				<ManageModels
					game={game}
					selectedModel={selectedModelInfo}
					setSelectedModel={setSelectedModelInfo}
					handleReturn={() => {
						setShowManageModelsScreen(false);
					}}
				/>
			);
		if (action === null)
			return (
				<PickOption
					title={`Select an action`}
					subtitle={formatGameName(gameName)}
					actions={[
						{
							name: ActionOnGame.Play,
							handleClick: () => setAction(ActionOnGame.Play),
						},
						{
							name: ActionOnGame.Train,
							handleClick: () => setAction(ActionOnGame.Train),
						},
						{
							name: ActionOnGame.Test,
							handleClick: () => setAction(ActionOnGame.Test),
						},
					]}
					handleReturn={() => setGameName(null)}
					key={`select-action`}
				/>
			);
		switch (action) {
			case ActionOnGame.Play:
				if (gameMode === null)
					return (
						<PickOption
							title={`Playing`}
							subtitle={formatGameName(gameName)}
							actions={[
								{
									name: GameMode.PvP,
									handleClick: () => setGameMode(GameMode.PvP),
								},
								{
									name: GameMode.PvC,
									handleClick: () => setGameMode(GameMode.PvC),
								},
								{
									name: GameMode.CvC,
									handleClick: () => setGameMode(GameMode.CvC),
								},
							]}
							handleReturn={() => setAction(null)}
						/>
					);
				if (gameMode !== GameMode.PvP && selectedModelInfo === null)
					return (
						<Disclaimer
							title={`Playing`}
							subtitle={formatGameName(gameName)}
							text={`You must load a model before playing this game!`}
							handleReturn={() => setGameMode(null)}
						/>
					);
				return (
					<Playing
						game={game}
						modelInfo={selectedModelInfo}
						gameMode={gameMode}
						handleReturn={() => {
							setGameMode(null);
						}}
					/>
				);
			case ActionOnGame.Train:
				if (train === null)
					if (selectedModelInfo === null)
						return (
							<Disclaimer
								title={`Training`}
								subtitle={formatGameName(gameName)}
								text={`You must load a model before training!`}
								handleReturn={() => setAction(null)}
							/>
						);
					else
						return (
							<PickOption
								title={`Training`}
								subtitle={formatGameName(gameName)}
								actions={[
									{
										name: `Build Training Memory`,
										handleClick: () => {
											setTrain({
												name: `Build Training Memory`,
												workName: WorkName.BuildMemory,
												params: {
													numSearches: 60,
													explorationConstant: 2,
													numSelfPlayIterations: 10,
												},
											});
										},
									},
									{
										name: `Create Model`,
										handleClick: () => {
											setTrain({
												name: `Create Model`,
												workName: WorkName.CreateModel,
												params: {
													numSearches: 60,
													explorationConstant: 2,
													numSelfPlayIterations: 10,
												},
											});
										},
									},
								]}
								handleReturn={() => setAction(null)}
							/>
						);
				else
					return (
						<Training
							gameName={gameName}
							modelInfo={selectedModelInfo}
							workName={train.workName}
							otherParams={train.params}
							handleReturn={() => setTrain(null)}
						/>
					);
			case ActionOnGame.Test:
				if (test === null)
					return (
						<PickOption
							title={`Testing`}
							subtitle={formatGameName(gameName)}
							actions={[
								{
									name: `Monte-Carlo Search Test`,
									handleClick: () => {
										setTest({
											name: `Monte-Carlo Search Test`,
											workName: WorkName.MCTSCommon,
										});
									},
								},
								{
									name: `ResNet Structure Test`,
									handleClick: () => {
										setTest({
											name: `ResNet Structure Test`,
											workName: WorkName.Structure,
										});
									},
								},
								{
									name: `Blind Testing Test`,
									handleClick: () => {
										setTest({
											name: `Blind Testing Test`,
											workName: WorkName.Blind,
										});
									},
								},
							]}
							handleReturn={() => setAction(null)}
						/>
					);
				return (
					<Training
						gameName={gameName}
						modelInfo={null}
						workName={test.workName}
						otherParams={{}}
						handleReturn={() => setTest(null)}
					/>
				);
			default:
				return (
					<section>
						<p>Something went wrong</p>
					</section>
				);
		}
	}

	return (
		<>
			<article className={`h-full text-white bg-neutral-900 flex flex-col`}>
				{showHeader && (
					<header className={`mt-1 flex justify-center`}>
						<h1 className={`text-4xl`}>
							<span className={`hidden sm:block `}>Auto Playtest System</span>
							<span className={`sm:hidden`}>APTS</span>
						</h1>
					</header>
				)}
				<main className={`flex-grow flex flex-col justify-center items-center`}>
					{getMainContent()}
				</main>
				{showFooter && (
					<footer className={`flex justify-center`}>
						<Anchor
							onClick={() => {
								setShowManageModelsScreen(true);
							}}
							disabled={isManageModelsButtonDisabled}
							color={`light`}
						>
							<p className={`text-lg text-center font-mono`}>
								{selectedModelInfo ? selectedModelInfo.name : `No loaded model`}
							</p>
						</Anchor>
					</footer>
				)}
			</article>
		</>
	);
}

enum ActionOnGame {
	Play = "Play",
	Train = "Train",
	Test = "Test",
}

interface Test {
	name: string;
	workName: WorkName;
}

interface Train extends Test {
	params?: any;
}
