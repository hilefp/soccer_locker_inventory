const SIZE_KEYS = ['size', 'all sizes', 'all size', "women's sizes", "Women's Size", 'Youth Sizes'];

/**
 * Extracts the size value from item/variant attributes and returns
 * the remaining non-size attributes.
 */
export function extractSize(
  attributes: Record<string, string> | null | undefined,
  variantAttributes?: Record<string, string> | null
) {
  const attrs = attributes || {};
  const varAttrs = variantAttributes || {};
  let sizeValue: string | null = null;
  const rest: [string, string][] = [];

  for (const [key, value] of Object.entries(attrs)) {
    if (SIZE_KEYS.includes(key.toLowerCase())) {
      sizeValue = value;
    } else {
      rest.push([key, value]);
    }
  }

  if (!sizeValue) {
    for (const [key, value] of Object.entries(varAttrs)) {
      if (SIZE_KEYS.includes(key.toLowerCase())) {
        sizeValue = value;
        break;
      }
    }
  }

  return { sizeValue, rest };
}
