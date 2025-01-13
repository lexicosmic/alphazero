import generateGameDescription from "./generateGameDescription/action.js";
import predictProbabilities from "./predictProbabilities/action.js";
import sayHello from "./sayHello/action.js";
import startGameplay from "./startGameplay/action.js";

export type ProcessGraphvizDotString = (dotString: string) => void;

const actions = {
  generateGameDescription,
  predictProbabilities,
  sayHello,
  startGameplay,
};

export default actions;
