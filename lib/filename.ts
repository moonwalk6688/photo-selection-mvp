export type ParsedFilename = {
  display_filename: string;
  original_basename: string;
  camera_sequence: string | null;
};

export function parsePhotoFilename(filename: string): ParsedFilename {
  const display_filename = filename.trim();
  const lastDotIndex = display_filename.lastIndexOf(".");
  const original_basename =
    lastDotIndex > 0 ? display_filename.slice(0, lastDotIndex) : display_filename;
  const numberMatches = original_basename.match(/\d+/g);
  const camera_sequence = numberMatches?.length
    ? numberMatches[numberMatches.length - 1]
    : null;

  return {
    display_filename,
    original_basename,
    camera_sequence
  };
}

export function isSupportedJpeg(filename: string, type?: string) {
  const lower = filename.toLowerCase();
  return (
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    type === "image/jpeg" ||
    type === "image/jpg"
  );
}
