export function analyzeForms(htmlBody, currentUrl) {
    const findings = [];
    if (!htmlBody)
        return findings;
    const isCurrentHttps = currentUrl.protocol === "https:";
    // Extract <form ...> ... </form>
    const formRegex = /<form\b([^>]*)>([\s\S]*?)<\/form>/gi;
    const forms = [];
    let match;
    while ((match = formRegex.exec(htmlBody)) !== null) {
        const formAttrs = match[1] || "";
        const formContent = match[2] || "";
        const actionMatch = formAttrs.match(/action=["']([^"']*)["']/i);
        const action = actionMatch ? actionMatch[1].trim() : "";
        const methodMatch = formAttrs.match(/method=["']([^"']*)["']/i);
        const method = (methodMatch ? methodMatch[1].trim() : "GET").toUpperCase();
        const hasPasswordInput = /<input[^>]+type=["']password["']/i.test(formContent);
        // Determine target URL
        let targetIsHttp = false;
        if (action.startsWith("http://")) {
            targetIsHttp = true;
        }
        else if (action.startsWith("//")) {
            // Protocol-relative
            targetIsHttp = !isCurrentHttps;
        }
        forms.push({
            action,
            method,
            hasPasswordInput,
            isInsecureTarget: targetIsHttp,
        });
    }
    if (forms.length === 0) {
        findings.push({
            id: "forms-none",
            category: "forms",
            categoryTitle: "Formulaires",
            title: "Aucun formulaire interactif détecté sur la page analysée",
            severity: "info",
            status: "pass",
            description: "La page d'accueil ne comporte pas de balise <form> publique.",
            importance: "Aucune surface de soumission de données observée sur cette page.",
            recommendation: "Si vous ajoutez des formulaires futurs, veillez à soumettre exclusivement vers des points de terminaison HTTPS protégés par des jetons CSRF.",
            detectedValue: "0 formulaire",
        });
        return findings;
    }
    // Check insecure form actions
    const insecureForms = forms.filter((f) => f.isInsecureTarget);
    if (insecureForms.length > 0) {
        const samples = insecureForms.map((f) => `<form action="${f.action}" method="${f.method}">`).join("\n");
        findings.push({
            id: "forms-insecure-action",
            category: "forms",
            categoryTitle: "Formulaires",
            title: `${insecureForms.length} formulaire(s) transmettant vers une destination HTTP non chiffrée`,
            severity: "critical",
            status: "fail",
            description: `Un ou plusieurs formulaires transmettent des données saisies vers une URL HTTP en clair : ${samples}`,
            importance: "Les identifiants, coordonnées ou données personnelles envoyées par les internautes transitent sans chiffrement et peuvent être interceptés.",
            recommendation: "Modifiez l'attribut 'action' du formulaire pour cibler une URL HTTPS absolue ou un chemin relatif.",
            remediationSnippet: "<form action=\"/api/submit\" method=\"POST\">",
            detectedValue: samples,
            cwe: "CWE-319",
        });
    }
    else {
        findings.push({
            id: "forms-secure-action",
            category: "forms",
            categoryTitle: "Formulaires",
            title: "Actions de formulaires correctement sécurisées",
            severity: "low",
            status: "pass",
            description: `Les ${forms.length} formulaire(s) détecté(s) transmettent leurs données via des URL relatives sécurisées ou HTTPS.`,
            importance: "Garantit la confidentialité des données saisies par les utilisateurs lors de leur envoi au serveur.",
            recommendation: "Assurez-vous que tous les points de terminaison POST appliquent également une protection contre les attaques CSRF.",
            detectedValue: `${forms.length} formulaire(s) conforme(s)`,
        });
    }
    // Check password inputs over plain HTTP
    const hasPasswordOverHttp = forms.some((f) => f.hasPasswordInput) && !isCurrentHttps;
    if (hasPasswordOverHttp) {
        findings.push({
            id: "forms-password-http",
            category: "forms",
            categoryTitle: "Formulaires",
            title: "Champ de mot de passe hébergé sur une page HTTP en clair",
            severity: "critical",
            status: "fail",
            description: "Un champ de mot de passe est présent sur une page servie en HTTP sans chiffrement.",
            importance: "Risque maximal d'interception d'identifiants de connexion en clair sur le réseau.",
            recommendation: "Migrez immédiatement la page d'authentification vers HTTPS.",
            cwe: "CWE-523",
        });
    }
    return findings;
}
//# sourceMappingURL=forms.js.map