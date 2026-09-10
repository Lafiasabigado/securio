import { c } from "./colors.js";

export class Spinner {
  private frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  private currentFrame = 0;
  private timer: NodeJS.Timeout | null = null;
  private text = "";
  private isTTY = Boolean(process.stdout.isTTY);

  constructor(initialText = "") {
    this.text = initialText;
  }

  start(message?: string): this {
    if (message) this.text = message;
    if (!this.isTTY) {
      if (this.text) console.log(` ${c.cyan("•")} ${this.text}`);
      return this;
    }

    process.stdout.write("\x1b[?25l"); // Hide cursor
    this.render();

    this.timer = setInterval(() => {
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
      this.render();
    }, 80);

    return this;
  }

  update(message: string): this {
    this.text = message;
    if (this.isTTY) {
      this.render();
    }
    return this;
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.isTTY) {
      process.stdout.write("\r\x1b[2K"); // Clear line
      process.stdout.write("\x1b[?25h"); // Show cursor
    }
  }

  succeed(message: string): void {
    this.stop();
    console.log(` ${c.green("✓")} ${message}`);
  }

  warn(message: string): void {
    this.stop();
    console.log(` ${c.yellow("⚠")} ${message}`);
  }

  fail(message: string): void {
    this.stop();
    console.log(` ${c.red("✗")} ${message}`);
  }

  private render(): void {
    const frame = c.cyan(this.frames[this.currentFrame]);
    process.stdout.write(`\r ${frame} ${this.text}`);
  }
}
