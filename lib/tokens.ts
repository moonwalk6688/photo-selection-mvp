const TOKEN_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

export function createShareToken(length = 10) {
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values)
    .map((value) => TOKEN_ALPHABET[value % TOKEN_ALPHABET.length])
    .join("");
}
