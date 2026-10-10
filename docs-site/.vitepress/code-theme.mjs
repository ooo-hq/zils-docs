// Use the same semantic colors for Bash, JSON, and application code.
function theme(name, type, palette) {
  return {
    name,
    type,
    colors: { 'editor.background': palette.background, 'editor.foreground': palette.text },
    tokenColors: [
      { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: palette.muted } },
      { scope: ['string', 'string.unquoted.argument.shell'], settings: { foreground: palette.string } },
      { scope: ['keyword', 'storage', 'support.function', 'entity.name.function'], settings: { foreground: palette.keyword } },
      { scope: ['variable', 'constant', 'entity.name.tag', 'support.type'], settings: { foreground: palette.value } },
      { scope: ['punctuation', 'keyword.operator'], settings: { foreground: palette.muted } },
    ],
  };
}

export const codeThemes = {
  light: theme('zils-light', 'light', {
    background: '#ffffff', text: '#242428', muted: '#62626b',
    keyword: '#6f42c1', string: '#216e4e', value: '#0550ae',
  }),
  dark: theme('zils-dark', 'dark', {
    background: '#1b1b20', text: '#ededef', muted: '#a3a3ae',
    keyword: '#c4a7ff', string: '#9ed5ad', value: '#91caff',
  }),
};

export function codeLabels(md) {
  const labels = { bash: 'Bash', sh: 'Shell', shell: 'Shell', shellscript: 'Shell',
    json: 'JSON', jsonl: 'JSONL', python: 'Python', javascript: 'JavaScript',
    typescript: 'TypeScript', sql: 'SQL', dotenv: 'Environment', text: 'Text', '': 'Code' };
  const fence = md.renderer.rules.fence;
  // Keep VitePress's button → language → pre order for its native copy handler.
  md.renderer.rules.fence = (...args) => fence(...args).replace(
    /(<span class="lang">)([^<]*)(<\/span>)/,
    (_, before, language, after) => before + (labels[language] ?? language) + after,
  );
}
