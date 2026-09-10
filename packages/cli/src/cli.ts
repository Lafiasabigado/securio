import { runScanCommand } from "./commands/scan.js";
import { promptForUrl } from "./input/prompt.js";
import { displayBanner } from "./ui/banner.js";
import { c } from "./ui/colors.js";
import { EXIT_ERROR, EXIT_SUCCESS } from "./utils/exit-codes.js";
import { CLI_VERSION } from "./utils/version.js";

function printHelp(): void {
  console.log(`
${c.bold("Securio CLI")} ${c.muted(`v${CLI_VERSION}`)}
${c.muted("Analyseur de sécurité web passive pour développeurs")}

${c.bold("UTILISATION")}
  ${c.cyan("$")} npx securio [options] [url]
  ${c.cyan("$")} securio [options] [url]

${c.bold("ARGUMENTS")}
  ${c.highlight("url")}                 L'adresse du site web à analyser (ex: https://example.com)
                      Si omise, le mode interactif démarre automatiquement.

${c.bold("OPTIONS")}
  ${c.highlight("--json")}              Sortie au format JSON pour l'intégration CI/CD
  ${c.highlight("--no-banner")}         Masquer la bannière d'en-tête
  ${c.highlight("-h, --help")}          Afficher ce message d'aide
  ${c.highlight("-v, --version")}       Afficher le numéro de version

${c.bold("CODES DE SORTIE (CI/CD)")}
  ${c.green("0")}   Analyse réussie, aucun problème de sécurité critique
  ${c.yellow("1")}   Problème de sécurité majeur détecté (au moins un test 'fail')
  ${c.red("2")}   Erreur d'exécution, cible inaccessible ou argument invalide

${c.bold("EXEMPLES")}
  ${c.cyan("$")} securio https://example.com
  ${c.cyan("$")} securio --json https://example.com > audit.json
  ${c.cyan("$")} npx securio-cli
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  let targetUrl: string | null = null;
  let isJson = false;
  let showBanner = true;

  for (const arg of args) {
    if (arg === "-h" || arg === "--help") {
      printHelp();
      process.exit(EXIT_SUCCESS);
    }
    if (arg === "-v" || arg === "--version") {
      console.log(`securio-cli v${CLI_VERSION}`);
      process.exit(EXIT_SUCCESS);
    }
    if (arg === "--json") {
      isJson = true;
      showBanner = false;
      continue;
    }
    if (arg === "--no-banner") {
      showBanner = false;
      continue;
    }
    if (!arg.startsWith("-") && !targetUrl) {
      targetUrl = arg;
    }
  }

  // Interactive mode if no target URL is provided
  if (!targetUrl) {
    if (isJson) {
      console.error(JSON.stringify({ error: "Une URL cible est obligatoire lorsque l'option --json est utilisée." }));
      process.exit(EXIT_ERROR);
    }

    if (showBanner) {
      await displayBanner(true);
    }

    const input = await promptForUrl();
    if (!input) {
      console.error(` ${c.red("✗")} Aucune URL spécifiée. Abandon.`);
      process.exit(EXIT_ERROR);
    }
    targetUrl = input;
  } else if (showBanner) {
    await displayBanner(false);
  }

  const exitCode = await runScanCommand(targetUrl, { json: isJson });
  process.exit(exitCode);
}

main().catch((err) => {
  console.error(err);
  process.exit(EXIT_ERROR);
});
