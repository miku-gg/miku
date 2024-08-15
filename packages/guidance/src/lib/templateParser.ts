export default function templateParser(template: string): {
  type: string;
  name: string;
  params: Record<string, number | string | string[]>;
} {
  const patternRegex = /{{(GEN|SEL)\s+(\w+)\s+([^}]+)}}/;
  const match = template.match(patternRegex);

  if (!match) {
    return { type: '', name: '', params: {} };
  }

  const type = match[1];
  const name = match[2];
  const paramsString = match[3];
  // Updated regex to handle complex array values
  const paramsRegex = /(\w+)=((?:"(?:\\"|[^"])*"|\[(?:\\.|[^\]])*\]|\w+)(?:,\s*)?)/g;
  let paramMatch;
  const params: Record<string, number | string | string[]> = {};

  while ((paramMatch = paramsRegex.exec(paramsString)) !== null) {
    const key = paramMatch[1];
    const value = paramMatch[2].trim();

    if (type === 'SEL' && key === 'options') {
      params[key] = value;
    } else if (!isNaN(Number(value))) {
      params[key] = Number(value);
    } else if (value.startsWith('["')) {
      try {
        params[key] = JSON.parse(value);
      } catch (e) {
        console.error('Error parsing JSON:', e);
        console.error(value);
      }
    } else {
      params[key] = value.replace(/^"|"$/g, '');
    }
  }

  return {
    type,
    name,
    params,
  };
}
