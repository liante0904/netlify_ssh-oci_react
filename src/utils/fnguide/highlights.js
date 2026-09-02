import { FNGUIDE_KEYWORD_GROUPS } from '../../constants/fnguideKeywords.js';

const FINANCIAL_METRIC_PATTERN = new RegExp(['(?:(?:Target|목표|타겟|적정)\\s*)?(?:PER|PBR|ROE)(?:은|는|이|가)?\\s*[:：]?\\s*[\\d,.]+\\s*(?:x|배|%|%p)?', '(?:YoY|QoQ|성장률|증가율|감소율|전년비|전년(?:\\s*동기)?\\s*대비)\\s*[:：]?\\s*[+-]?\\d+(?:\\.\\d+)?%p?', '[+-]?\\d+(?:\\.\\d+)?%p?', '(?:매출(?:액)?|영업이익|(?:지배|당기)?순이익)(?:률|\\s*추정(?:치)?)?\\s*[:：]?\\s*(?:[\\d,.]+\\s*조(?:\\s*[\\d,.]+\\s*억)?|[\\d,.]+\\s*억|[\\d,.]+\\s*만|[\\d,.]+)\\s*원', '목표(?:주가|가)?\\s*[\\d,.]+\\s*(?:조|억|만)?\\s*원'].join('|'), 'gi');
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const INVESTMENT_KEYWORD_GROUPS = FNGUIDE_KEYWORD_GROUPS.map((group) => ({ ...group, pattern: new RegExp([...group.keywords].sort((a, b) => b.length - a.length).map((keyword) => keyword.trim().split(/\s+/).map(escapeRegex).join('\\s*')).join('|'), 'gi') }));

export function tokenizeFinancialHighlights(text) {
  if (!text) return [];
  const source = String(text);
  const matches = [...Array.from(source.matchAll(FINANCIAL_METRIC_PATTERN), (match) => ({ index: match.index ?? 0, text: match[0], kind: 'financial' })), ...INVESTMENT_KEYWORD_GROUPS.flatMap(({ kind, pattern }) => Array.from(source.matchAll(pattern), (match) => ({ index: match.index ?? 0, text: match[0], kind })))]
    .sort((a, b) => a.index - b.index || Number(a.kind === 'financial') - Number(b.kind === 'financial') || b.text.length - a.text.length);
  const tokens = [];
  let cursor = 0;
  for (const match of matches) {
    const index = match.index;
    const end = index + match.text.length;
    if (index < cursor) { if (match.kind === 'financial' && end > cursor) { tokens.push({ text: match.text.slice(cursor - index), highlighted: true, kind: 'financial' }); cursor = end; } continue; }
    if (index > cursor) tokens.push({ text: source.slice(cursor, index), highlighted: false, kind: 'text' });
    tokens.push({ text: match.text, highlighted: true, kind: match.kind });
    cursor = end;
  }
  if (cursor < source.length) tokens.push({ text: source.slice(cursor), highlighted: false, kind: 'text' });
  return tokens;
}
