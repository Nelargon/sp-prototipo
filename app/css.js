/* Parse a CSS declaration string ("color:red;font-size:14px") into a React
   style object, so the exact style strings from the design export are preserved
   verbatim (values, units, custom properties) instead of being hand-camelCased. */
export function css(str) {
  const o = {};
  if (!str) return o;
  String(str)
    .split(';')
    .forEach((decl) => {
      const i = decl.indexOf(':');
      if (i < 0) return;
      let key = decl.slice(0, i).trim();
      const val = decl.slice(i + 1).trim();
      if (!key) return;
      if (key.startsWith('--')) {
        o[key] = val;
      } else {
        key = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        o[key] = val;
      }
    });
  return o;
}
