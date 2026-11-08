/** Only a PR title or explicit Task: declaration claims work; prose cross-references do not. */
export function declaredTasks(title, body = '') {
  const declarations = [...body.matchAll(/^\s*(?:#{1,6}\s*)?tasks?\s*:\s*([^\n]+)/gim)].map((m) => m[1]);
  return [...new Set([title, ...declarations].flatMap((text) => text.match(/\b[A-Z]+-\d{3}\b/g) ?? []))];
}
