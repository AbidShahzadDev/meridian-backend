interface SlugifyOptions {
  lower?: boolean;
  strict?: boolean;
}

export function slugify(value: string, options: SlugifyOptions = {}) {
  let result = value.trim();

  if (options.lower !== false) {
    result = result.toLowerCase();
  }

  if (options.strict !== false) {
    result = result.replace(/[^a-z0-9]+/gi, "-");
  }

  return result.replace(/^-+|-+$/g, "");
}
