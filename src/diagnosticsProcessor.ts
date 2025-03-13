import * as vscode from "vscode";
import * as fs from "fs";

/**
 * Label for the severity of the diagnostic information
 * @param severity The severity of the diagnostic information
 * @returns The corresponding text label
 */
export function getSeverityLabel(severity: vscode.DiagnosticSeverity): string {
  switch (severity) {
    case vscode.DiagnosticSeverity.Error:
      return "error";
    case vscode.DiagnosticSeverity.Warning:
      return "warning";
    case vscode.DiagnosticSeverity.Information:
      return "info";
    case vscode.DiagnosticSeverity.Hint:
      return "hint";
    default:
      return "unknown";
  }
}

/**
 * Extract the code value from the code object of the diagnostic information
 * @param code The code field of the diagnostic information
 * @returns The extracted code value string
 */
function extractCodeValue(code: any): string {
  if (!code) {
    return "N/A";
  }

  // If the code is an object and has a value property
  if (typeof code === "object" && code !== null && "value" in code) {
    return String(code.value);
  }

  // Otherwise, try to convert to a string
  const codeStr = String(code);
  return codeStr === "" ? "N/A" : codeStr;
}

/**
 * Interface for a single problem location
 */
interface LintLocation {
  lines: [number, number]; // The start and end line numbers [start, end]
  context: string; // The context code
}

/**
 * Interface for a single lint issue (merging same issues)
 */
interface LintIssue {
  code: string; // The code of the issue
  severity: string; // The severity of the issue
  message: string; // The message of the issue
  locations: LintLocation[]; // The list of locations of the issue
}

/**
 * Interface for all diagnostic information, organized by file path
 */
interface DiagnosticsData {
  [filePath: string]: LintIssue[];
}

/**
 * Read the content of a specified line range from a file
 * @param filePath The path of the file
 * @param startLine The start line (starting from 0)
 * @param endLine The end line (starting from 0)
 * @returns The content of the specified line range, or an empty string if it cannot be read
 */
function readFileContext(
  filePath: string,
  startLine: number,
  endLine: number
): string {
  try {
    if (!fs.existsSync(filePath)) {
      return "";
    }

    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");

    // Ensure the range is valid
    const effectiveStartLine = Math.max(0, startLine);
    const effectiveEndLine = Math.min(lines.length - 1, endLine);

    if (effectiveStartLine > effectiveEndLine) {
      return "";
    }

    return lines.slice(effectiveStartLine, effectiveEndLine + 1).join("\n");
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return "";
  }
}

/**
 * Generate a unique key for a problem, used to merge same issues
 * @param code The code of the issue
 * @param severity The severity of the issue
 * @param message The message of the issue
 * @returns The unique key
 */
function generateIssueKey(
  code: string,
  severity: string,
  message: string
): string {
  return `${code}|${severity}|${message}`;
}

/**
 * Format the diagnostic information as a JSON structure
 * @param allDiagnostics The array of all diagnostic information
 * @returns The formatted diagnostic information as JSON
 */
export function formatDiagnosticsToJSON(
  allDiagnostics: [vscode.Uri, vscode.Diagnostic[]][]
): DiagnosticsData {
  const result: DiagnosticsData = {};

  for (const [resource, diagnostics] of allDiagnostics) {
    if (diagnostics.length === 0) {
      continue;
    }

    const filePath = resource.fsPath;

    // Temporary storage for merged issues
    const issueMap: { [key: string]: LintIssue } = {};

    // Sort diagnostics by line number and column number
    const sortedDiagnostics = [...diagnostics].sort((a, b) => {
      if (a.range.start.line !== b.range.start.line) {
        return a.range.start.line - b.range.start.line;
      }
      return a.range.start.character - b.range.start.character;
    });

    // Process each diagnostic information
    for (const diagnostic of sortedDiagnostics) {
      const startLine = diagnostic.range.start.line;
      const endLine = diagnostic.range.end.line;

      // Convert to 1-based
      const startLine1Based = startLine + 1;
      const endLine1Based = endLine + 1;

      // Get the context code
      const context = readFileContext(filePath, startLine, endLine);

      // Extract the code value
      const codeValue = extractCodeValue(diagnostic.code);
      const severity = getSeverityLabel(diagnostic.severity);
      const message = diagnostic.message;

      // Generate the unique key for the issue
      const issueKey = generateIssueKey(codeValue, severity, message);

      // Get or create the issue
      if (!issueMap[issueKey]) {
        issueMap[issueKey] = {
          code: codeValue,
          severity: severity,
          message: message,
          locations: [],
        };
      }

      // Add location information
      issueMap[issueKey].locations.push({
        lines: [startLine1Based, endLine1Based],
        context: context,
      });
    }

    // Add the merged issues to the result
    result[filePath] = Object.values(issueMap);
  }

  return result;
}

/**
 * Format the diagnostic information as text
 * @param allDiagnostics The array of all diagnostic information
 * @returns The formatted text
 */
export function formatDiagnosticsToText(
  allDiagnostics: [vscode.Uri, vscode.Diagnostic[]][]
): string {
  if (allDiagnostics.length === 0) {
    return "";
  }

  let formattedText = "";

  for (const [resource, diagnostics] of allDiagnostics) {
    if (diagnostics.length === 0) {
      continue;
    }

    // Add the file path
    formattedText += `File: ${resource.fsPath}\n`;

    // Sort diagnostics by line number and column number
    const sortedDiagnostics = [...diagnostics].sort((a, b) => {
      if (a.range.start.line !== b.range.start.line) {
        return a.range.start.line - b.range.start.line;
      }
      return a.range.start.character - b.range.start.character;
    });

    // Add each diagnostic information
    for (const diagnostic of sortedDiagnostics) {
      const severity = getSeverityLabel(diagnostic.severity);
      const startLine = diagnostic.range.start.line + 1; // 1-based line number
      const endLine = diagnostic.range.end.line + 1; // 1-based line number
      const column = diagnostic.range.start.character + 1; // 1-based column number
      const message = diagnostic.message;
      const codeValue = extractCodeValue(diagnostic.code);
      const code = codeValue ? `[${codeValue}] ` : "";

      if (startLine === endLine) {
        formattedText += `Line ${startLine}, Column ${column} - ${severity}: ${code}${message}\n`;
      } else {
        formattedText += `Lines ${startLine}-${endLine}, Column ${column} - ${severity}: ${code}${message}\n`;
      }
    }

    formattedText += "\n";
  }

  return formattedText;
}

/**
 * Format the diagnostic information as a concise LLM-friendly text
 * @param allDiagnostics The array of all diagnostic information
 * @returns The formatted concise text
 */
export function formatDiagnosticsToCompactText(
  allDiagnostics: [vscode.Uri, vscode.Diagnostic[]][]
): string {
  if (allDiagnostics.length === 0) {
    return "No problems found.";
  }

  let result = "";

  for (const [resource, diagnostics] of allDiagnostics) {
    if (diagnostics.length === 0) {
      continue;
    }

    // Add the file path
    result += `${resource.fsPath}:\n`;

    // Get the JSON format of the diagnostic information (for merging same issues)
    const jsonData = formatDiagnosticsToJSON([[resource, diagnostics]]);
    const issuesByFile = jsonData[resource.fsPath] || [];

    // Add the content for each issue
    for (const issue of issuesByFile) {
      const { code, severity, message, locations } = issue;

      // Add the issue title (severity, code, message) and start a new code block
      const severityCapitalized =
        severity.charAt(0).toUpperCase() + severity.slice(1);
      result += `\`\`\`${severityCapitalized}: ${code}, ${message}\n`;

      // Add the information for each location
      for (let i = 0; i < locations.length; i++) {
        const location = locations[i];
        const [startLine, endLine] = location.lines;

        // Add blank line between different locations of the same issue
        if (i > 0) {
          result += "\n";
        }

        // Add the line number information - if it's a single line, just show the line number, no 'to'
        if (startLine === endLine) {
          result += `# Line ${startLine}\n`;
        } else {
          result += `# Line ${startLine} to ${endLine}\n`;
        }

        // Add the context code
        result += `${location.context}\n`;
      }

      // End the current code block
      result += `\`\`\`\n\n`;
    }
  }

  return result.trim();
}

/**
 * Get all diagnostic information and format it as a JSON string
 * @returns The JSON string of the diagnostic information
 */
export function getAllDiagnosticsAsJSON(): string {
  const allDiagnostics = vscode.languages.getDiagnostics();
  const diagnosticsData = formatDiagnosticsToJSON(allDiagnostics);
  return JSON.stringify(diagnosticsData, null, 2);
}

/**
 * Get all diagnostic information and format it as text
 * @returns The formatted diagnostic information text
 */
export function getAllDiagnosticsAsText(): string {
  const allDiagnostics = vscode.languages.getDiagnostics();
  return formatDiagnosticsToText(allDiagnostics);
}

/**
 * Get all diagnostic information and format it as a concise LLM-friendly text
 * @returns The formatted concise text
 */
export function getAllDiagnosticsAsCompactText(): string {
  const allDiagnostics = vscode.languages.getDiagnostics();
  return formatDiagnosticsToCompactText(allDiagnostics);
}

/**
 * Check if a diagnostic should be ignored based on the linter name
 * @param diagnostic The diagnostic to check
 * @returns Whether the diagnostic should be ignored
 */
function shouldIgnoreDiagnostic(diagnostic: vscode.Diagnostic): boolean {
  // Get the ignore list from settings
  const config = vscode.workspace.getConfiguration("lint2prompt");
  const ignoreList: string[] = config.get("linterIgnored") || [];

  if (ignoreList.length === 0) {
    return false;
  }

  // Get the linter name from the source property
  const linterName = diagnostic.source || "";

  if (!linterName) {
    return false;
  }

  // Check if the linter name is in the ignore list
  return ignoreList.some((ignorePattern) => {
    // Allow for simple wildcard pattern matching (e.g., "eslint*")
    const pattern = ignorePattern.replace(/\*/g, ".*");
    const regex = new RegExp(`^${pattern}$`, "i"); // case-insensitive matching
    return regex.test(linterName);
  });
}

/**
 * Filter diagnostics based on the ignore list
 * @param diagnostics The array of diagnostics to filter
 * @returns The filtered diagnostics
 */
function filterDiagnostics(
  diagnostics: vscode.Diagnostic[]
): vscode.Diagnostic[] {
  return diagnostics.filter(
    (diagnostic) => !shouldIgnoreDiagnostic(diagnostic)
  );
}

export async function copyDiagnosticsToClipboard(): Promise<boolean> {
  const allDiagnostics = vscode.languages.getDiagnostics();

  // Filter diagnostics for each file
  const filteredDiagnostics: [vscode.Uri, vscode.Diagnostic[]][] = [];
  for (const [uri, diagnostics] of allDiagnostics) {
    const filtered = filterDiagnostics(diagnostics);
    if (filtered.length > 0) {
      filteredDiagnostics.push([uri, filtered]);
    }
  }

  if (filteredDiagnostics.length === 0) {
    return false;
  }

  // Use the concise text format with filtered diagnostics
  const diagnosticText = formatDiagnosticsToCompactText(filteredDiagnostics);

  // Get custom prompt prefix and suffix from settings
  const config = vscode.workspace.getConfiguration("lint2prompt");
  const promptPrefix =
    config.get<string>("promptPrefix") ||
    "For the code present, we get these lints:";
  const promptSuffix =
    config.get<string>("promptSuffix") ||
    "How can I resolve this? If you propose a fix, please make it concise.";

  // Ensure the diagnostic text doesn't have trailing blank lines
  const trimmedDiagnosticText = diagnosticText.trim();

  const promptText = `${promptPrefix}\n\n"""\n${trimmedDiagnosticText}\n"""\n\n${promptSuffix}`;

  // Copy to the clipboard
  await vscode.env.clipboard.writeText(promptText);
  return true;
}
