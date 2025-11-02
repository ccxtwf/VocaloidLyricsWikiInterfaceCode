export function determineFileType(id: string): "script" | "style" | "other" {
  let extension: RegExpMatchArray | null | string = id.match(/\.[a-zA-Z0-9]+$/);
  if (extension !== null) {
    extension = extension[0].toLowerCase();
    switch (extension) {
      case '.js':
      case '.ts':
        return "script";
      case '.css':
      case '.less':
        return "style";
    }
  }
  return "other";
}

export function getGadgetKeysFromChunkName(id: string): [string, string] | null {
  const m = id.match(/^gadgets\/([^\/]+)\/([^\/]+).*$/);
  if (m === null) { 
    return null;
  }
  const [_, gadgetSectionName, gadgetName] = m;
  return [gadgetSectionName, gadgetName];
}