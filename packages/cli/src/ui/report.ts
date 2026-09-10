import type { Finding, ScanResult } from "@securio/scanner";
import { c } from "./colors.js";

const HR = c.gray("─".repeat(50));

export function printScanReport(result: ScanResult): void {
  console.log();
  console.log(` ${c.bold("Analyse de")} ${c.highlight(result.url)}`);
  if (result.telemetry.ip) {
    console.log(` ${c.muted(`IP : ${result.telemetry.ip} • Latence : ${result.telemetry.latencyMs}ms • Serveur : ${result.telemetry.serverHeader || "Inconnu"}`)}`);
  }
  console.log();

  // 1. Group findings by category for structured display
  const categoryOrder = [
    { key: "https", title: "HTTPS & Transport" },
    { key: "headers", title: "En-têtes de sécurité" },
    { key: "cookies", title: "Cookies" },
    { key: "mixed_content", title: "Contenu mixte" },
    { key: "forms", title: "Formulaires" },
    { key: "technology", title: "Technologies exposées" },
  ];

  for (const { key, title } of categoryOrder) {
    const categoryFindings = result.findings.filter((f) => f.category === key);
    if (categoryFindings.length === 0) continue;

    console.log(` ${c.dim("●")} ${c.bold(title)}`);
    for (const f of categoryFindings) {
      printFindingLine(f);
    }
    console.log();
  }

  // 2. Score Summary
  console.log(` ${HR}`);
  
  const scoreColor =
    result.score >= 80 ? c.green : result.score >= 60 ? c.yellow : c.red;
  
  const statusLabel =
    result.status === "excellent"
      ? "Excellent"
      : result.status === "good"
      ? "Bon"
      : result.status === "warning"
      ? "Attention requise"
      : "Critique";

  console.log();
  console.log(` ${c.bold("Score de sécurité :")} ${scoreColor(c.bold(`${result.score}/100`))} ${c.muted(`(Note : ${result.grade})`)}`);
  console.log(` ${c.bold("Statut :")} ${scoreColor(statusLabel)}`);
  
  const issueCount = result.stats.warning + result.stats.critical;
  if (issueCount === 0) {
    console.log(`\n ${c.green("✓")} ${c.bold("Félicitations ! Aucun problème de sécurité passif détecté.")}`);
  } else {
    const issueText = issueCount === 1 ? "1 problème nécessite" : `${issueCount} problèmes nécessitent`;
    console.log(`\n ${c.yellow("⚠")} ${c.bold(`${issueText} votre attention.`)}`);
  }

  console.log();
  console.log(` ${HR}`);

  // 3. Detailed actionable recommendations for issues (fails then warnings)
  const issues = result.findings.filter((f) => f.status === "fail" || f.status === "warning");
  if (issues.length > 0) {
    console.log();
    console.log(` ${c.bold("Détails et recommandations d'optimisation :")}`);
    console.log();

    for (const issue of issues) {
      const icon = issue.status === "fail" ? c.red("✗") : c.yellow("⚠");
      const badge = issue.status === "fail" ? c.red("[CRITIQUE]") : c.yellow("[AVERTISSEMENT]");

      console.log(` ${icon} ${c.bold(issue.title)} ${c.muted(badge)}`);
      console.log(`   ${issue.description}`);

      if (issue.detectedValue) {
        console.log(`   ${c.muted("Valeur détectée :")} ${c.cyan(issue.detectedValue)}`);
      }

      if (issue.importance) {
        console.log(`\n   ${c.bold("Pourquoi ?")}`);
        console.log(`   ${c.dim(issue.importance)}`);
      }

      if (issue.recommendation) {
        console.log(`\n   ${c.bold("Comment corriger ?")}`);
        console.log(`   ${issue.recommendation}`);
      }

      if (issue.remediationSnippet) {
        console.log(`\n   ${c.muted("Exemple de configuration :")}`);
        for (const line of issue.remediationSnippet.split("\n")) {
          console.log(`     ${c.cyan(line)}`);
        }
      }

      if (issue.cwe) {
        console.log(`\n   ${c.muted(`Référence : ${issue.cwe}`)}`);
      }

      console.log();
    }

    console.log(` ${HR}`);
  }

  console.log(`\n ${c.muted("Analyse passive Securio • Aucun test intrusif effectué.")}\n`);
}

function printFindingLine(finding: Finding): void {
  let icon: string;
  let text = finding.title;

  switch (finding.status) {
    case "pass":
      icon = c.green("✓");
      break;
    case "warning":
      icon = c.yellow("⚠");
      break;
    case "fail":
      icon = c.red("✗");
      break;
    default:
      icon = c.cyan("ℹ");
  }

  if (finding.status === "pass") {
    console.log(`   ${icon} ${text}`);
  } else {
    console.log(`   ${icon} ${c.bold(text)}`);
  }
}
