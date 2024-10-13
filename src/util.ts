import * as tf from "@tensorflow/tfjs";
import State, { Action } from "./Game/State";
import ResNet from "./ResNet";
import { GameName } from "./types";

const LIMIT_FOR_SEED = 1000000;
const SEED = Math.floor(Math.random() * LIMIT_FOR_SEED);

const firstPosition = 0,
  secondPosition = 1;
export const capitalizedFirstLetter = (str: string) =>
  str.charAt(firstPosition).toUpperCase() + str.slice(secondPosition);

const indexAfterTwoDigits = 2;
const paddedWithTwoDigits = (num: number) =>
  num.toString().padStart(indexAfterTwoDigits, "0");

const monthsAreIndexedFromOne = 1;
export const formattedDate = (date: Date) => {
  const year = paddedWithTwoDigits(date.getFullYear());
  const month = paddedWithTwoDigits(date.getMonth() + monthsAreIndexedFromOne);
  const day = paddedWithTwoDigits(date.getDate());
  const hour = paddedWithTwoDigits(date.getHours());
  const minutes = paddedWithTwoDigits(date.getMinutes());
  const seconds = paddedWithTwoDigits(date.getSeconds());
  return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;
};

export const fullModelPath = (gameName: GameName, innerPath: string) =>
  `/${gameName}/${innerPath}`;

export const getRandomValidAction = (state: State): Action | null => {
  const encodedValidActions = state.getValidActions();
  const validActions = [];
  const incrementOne = 1;
  for (
    let index = 0;
    index < encodedValidActions.length;
    index += incrementOne
  ) {
    if (encodedValidActions[index]) validActions.push(index);
  }
  const randomIndex = Math.floor(Math.random() * validActions.length);
  return validActions[randomIndex] ?? null;
};

// Returns the masked policy and value as Tensors
const maskedPrediction = (
  state: State,
  resNet: ResNet,
): {
  policy: tf.Tensor1D;
  value: tf.Scalar;
} =>
  tf.tidy(() => {
    // Calculate the policy and value from the neural network
    const encodedState = state.getEncodedState();
    const tensorState: tf.Tensor4D = tf.tensor(encodedState).expandDims();
    const [policy, value] = resNet.predict(tensorState);
    const squeezedValue: tf.Scalar = value.squeeze().squeeze();
    const squeezedSoftMaxPolicy = tf.softmax(policy).squeeze();
    // Mask the policy to only allow valid actions
    const validActions = state.getValidActions();
    const maskedPolicy: tf.Tensor1D = squeezedSoftMaxPolicy.mul(
      tf.tensor(validActions),
    );
    return {
      policy: maskedPolicy,
      value: squeezedValue,
    };
  });

// Returns the action probabilities from a policy Tensor as another Tensor
const probabilitiesFromPolicy = (policy: tf.Tensor1D): tf.Tensor1D =>
  tf.tidy(() => {
    const sum = policy.sum();
    return policy.div(sum);
  });

// Returns the action as a common integer. Probabilities must be normalized
export const actionFromProbabilities = (probabilities: tf.Tensor1D): Action => {
  const SAMPLES = 1;
  return tf.tidy(
    () =>
      tf
        .multinomial(probabilities, SAMPLES, SEED, true)
        .squeeze()
        .arraySync() as Action,
  );
};

type DesiredData =
  | {
      policy: true;
      value?: boolean;
      probabilities?: boolean;
      action?: boolean;
    }
  | {
      policy?: boolean;
      value: true;
      probabilities?: boolean;
      action?: boolean;
    }
  | {
      policy?: boolean;
      value?: boolean;
      probabilities: true;
      action?: boolean;
    }
  | {
      policy?: boolean;
      value?: boolean;
      probabilities?: boolean;
      action: true;
    };

interface ReturnedData {
  policy?: tf.Tensor1D;
  value?: tf.Scalar;
  probabilities?: tf.Tensor1D;
  action?: Action;
}

const predictDataFromState = (
  state: State,
  resNet: ResNet,
  desiredData: DesiredData,
) => {
  const data: ReturnedData = {};
  tf.tidy(() => {
    const { policy, value } = maskedPrediction(state, resNet);
    if (desiredData.policy) data.policy = policy;
    if (desiredData.value) data.value = value;
    if (desiredData.probabilities || desiredData.action) {
      const probabilities = probabilitiesFromPolicy(policy);
      if (desiredData.probabilities) data.probabilities = probabilities;
      if (desiredData.action)
        data.action = actionFromProbabilities(probabilities);
    }
  });
  return data;
};

export const predictActionFromState = (
  state: State,
  resNet: ResNet,
): { action: Action } => {
  const data = predictDataFromState(state, resNet, {
    action: true,
    policy: false,
    probabilities: false,
    value: false,
  });
  if (!data.action) throw new Error("No action was predicted");
  return { action: data.action };
};

export const predictValueAndProbabilitiesFromState = (
  state: State,
  resNet: ResNet,
): { value: tf.Scalar; probabilities: tf.Tensor1D } => {
  const data = predictDataFromState(state, resNet, {
    action: false,
    policy: false,
    probabilities: true,
    value: true,
  });
  if (!data.value) throw new Error("No value was predicted");
  if (!data.probabilities) throw new Error("No probabilities were predicted");
  return { probabilities: data.probabilities, value: data.value };
};

export const predictPolicyAndValueAndProbabilitiesAndActionFromState = (
  state: State,
  resNet: ResNet,
): {
  policy: tf.Tensor1D;
  value: tf.Scalar;
  probabilities: tf.Tensor1D;
  action: Action;
} => {
  const data = predictDataFromState(state, resNet, {
    action: true,
    policy: true,
    probabilities: true,
    value: true,
  });
  if (!data.value) throw new Error("No value was predicted");
  if (!data.probabilities) throw new Error("No probabilities were predicted");
  if (!data.action) throw new Error("No action was predicted");
  if (!data.policy) throw new Error("No policy was predicted");
  return {
    action: data.action,
    policy: data.policy,
    probabilities: data.probabilities,
    value: data.value,
  };
};
