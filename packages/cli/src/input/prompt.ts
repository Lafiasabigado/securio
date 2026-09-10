import readline from "node:readline";
import { c } from "../ui/colors.js";

export async function promptForUrl(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log(` ${c.cyan("?")} ${c.bold("Quelle URL souhaitez-vous analyser :")}`);
    rl.question(` ${c.cyan("›")} `, (answer) => {
      rl.close();
      console.log();
      resolve(answer.trim());
    });
  });
}
