import { c } from "./colors.js";
import { CLI_VERSION } from "../utils/version.js";

const BANNER_LINES = [
  " ███████╗███████╗ ██████╗██╗   ██╗██████╗ ██╗ ██████╗ ",
  " ██╔════╝██╔════╝██╔════╝██║   ██║██╔══██╗██║██╔═══██╗",
  " ███████╗█████╗  ██║     ██║   ██║██████╔╝██║██║   ██║",
  " ╚════██║██╔══╝  ██║     ██║   ██║██╔══██╗██║██║   ██║",
  " ███████║███████╗╚██████╗╚██████╔╝██║  ██║██║╚██████╔╝",
  " ╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝ ╚═════╝ ",
];

export async function displayBanner(animated = false): Promise<void> {
  const isInteractive = Boolean(process.stdout.isTTY) && animated;

  if (!isInteractive) {
    console.log();
    for (const line of BANNER_LINES) {
      console.log(c.cyan(line));
    }
    console.log(`\n ${c.bold("Securio CLI")} ${c.muted(`v${CLI_VERSION}`)}`);
    console.log(` ${c.muted("Security made visible.")}\n`);
    return;
  }

  // Quick professional reveal animation (total ~120ms)
  console.log();
  for (const line of BANNER_LINES) {
    console.log(c.cyan(line));
    await new Promise((r) => setTimeout(r, 20));
  }
  await new Promise((r) => setTimeout(r, 40));
  console.log(`\n ${c.bold("Securio CLI")} ${c.muted(`v${CLI_VERSION}`)}`);
  console.log(` ${c.muted("Security made visible.")}\n`);
}
