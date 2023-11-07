import {
	gameParams,
	resNetBuildModelParams,
	monteCarloTreeSearchParams,
	selfPlayMemoryParams,
	trainModelParams,
	trainingDataIds,
} from './parameters.ts';
import {loadTrainingData, writeModelParameters} from './util.ts';
import ResNet from '../engine/ResNet.ts';
import AlphaZero from '../engine/AlphaZero.ts';

const game = gameParams.game;
const resNet = new ResNet(game, resNetBuildModelParams);
const alphaZero = new AlphaZero(resNet, game, monteCarloTreeSearchParams);
const trainingMemoryBatch = loadTrainingData(trainingDataIds);

const currentTime = new Date().valueOf();
const modelDirectory = `${gameParams.directoryName}/model_${currentTime}`;

writeModelParameters(
	modelDirectory,
	trainingDataIds,
	resNetBuildModelParams,
	trainModelParams,
);
await alphaZero.learn(
	modelDirectory,
	selfPlayMemoryParams.numSelfPlayIterations,
	trainModelParams,
	trainingMemoryBatch,
);
