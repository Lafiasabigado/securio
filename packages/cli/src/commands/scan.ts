import {
  runSecurityScan,
  validateAndResolveTarget,
  type ScanResult,
} from "@securio/scanner";
import { formatJsonReport } from "../ui/json-report.js";
import { printScanReport } from "../ui/report.js";
import { Spinner } from "../ui/spinner.js";
import { c } from "../ui/colors.js";
import {
  EXIT_ERROR,
  EXIT_SECURITY_ISSUE,
  EXIT_SUCCESS,
} from "../utils/exit-codes.js";

export interface ScanCommandOptions {
  json?: boolean;
}

export async function runScanCommand(
  rawTarget: string,
  options: ScanCommandOptions = {}
): Promise<number> {
  const isJson = Boolean(options.json);
  const spinner = new Spinner();

  if (!isJson) {
    spinner.start("Validation de l'URL et contrôle de sécurité SSRF...");
  }

  // 1. Validation & SSRF safety checks
  const targetResult = await validateAndResolveTarget(rawTarget);
  if (!targetResult.success) {
    if (isJson) {
      console.error(JSON.stringify({ error: targetResult.error }));
    } else {
      spinner.fail(`Cible invalide : ${targetResult.error}`);
    }
    return EXIT_ERROR;
  }

  const { target } = targetResult;

  // 2. Perform security scan
  if (!isJson) {
    spinner.update(`Analyse des en-têtes, certificats et cookies de ${c.bold(target.hostname)}...`);
  }

  let scanResult: ScanResult;
  try {
    scanResult = await runSecurityScan(target);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Erreur inattendue durant l'audit.";
    if (isJson) {
      console.error(JSON.stringify({ error: errorMsg }));
    } else {
      spinner.fail(`Échec de l'analyse : ${errorMsg}`);
    }
    return EXIT_ERROR;
  }

  // 3. Render Output
  if (isJson) {
    console.log(formatJsonReport(scanResult));
  } else {
    spinner.succeed(`Analyse passive terminée avec succès pour ${c.bold(target.hostname)}`);
    printScanReport(scanResult);
  }

  // 4. Return exit code based on findings
  // Exit code 1 if at least one critical / fail finding exists
  if (scanResult.stats.critical > 0) {
    return EXIT_SECURITY_ISSUE;
  }

  return EXIT_SUCCESS;
}
