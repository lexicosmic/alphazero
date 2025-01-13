import { PathLike, promises as promisesFromFs } from "fs";
import { toFile } from "ts-graphviz/adapter";

export const generateGraphvizImage = async ({
  directoryPath,
  graphvizDotString,
}: {
  graphvizDotString: string;
  directoryPath: PathLike;
}): Promise<void> => {
  const now = new Date().toISOString();
  const fileName = `mcts-tree-${now}`;
  const fullPath = `${directoryPath.toString()}/${fileName}.svg`;

  try {
    await promisesFromFs.mkdir(directoryPath, { recursive: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to create directory: ${error.message}`);
    }
    throw new Error("An unknown error occurred while creating directory.");
  }

  try {
    await toFile(graphvizDotString, fullPath, { format: "svg" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate Graphviz image: ${error.message}`);
    }
    throw new Error(
      "An unknown error occurred while generating Graphviz image.",
    );
  }
};
