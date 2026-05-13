export function encodeMessageSettings(name: string, isEnabled: boolean): string {
  if (!isEnabled) {
    if (!name.startsWith('__DISABLED__')) {
      return `__DISABLED__${name}`;
    }
    return name;
  } else {
    return name.replace(/^__DISABLED__/, '');
  }
}

export function decodeMessageSettings(name: string | null | undefined): { isEnabled: boolean, cleanName: string } {
  if (!name) return { isEnabled: true, cleanName: '' };
  
  const isEnabled = !name.startsWith('__DISABLED__');
  const cleanName = name.replace(/^__DISABLED__/, '');
  return { isEnabled, cleanName };
}
