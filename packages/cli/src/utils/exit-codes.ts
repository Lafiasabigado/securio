/**
 * Standardized exit codes for Securio CLI (CI/CD friendly)
 * 0: Success, no critical / fail security issues found
 * 1: Security failure, one or more fail findings detected
 * 2: Execution error or invalid argument / target unreachable
 */
export const EXIT_SUCCESS = 0;
export const EXIT_SECURITY_ISSUE = 1;
export const EXIT_ERROR = 2;
