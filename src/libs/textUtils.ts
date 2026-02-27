import GraphemeSplitter from 'grapheme-splitter';

export const splitGraphemes = (message: string): string[] => {
  const splitter = new GraphemeSplitter();
  return splitter.splitGraphemes(message).reduce((accumulator: string[], grapheme: string) => {
    const result = grapheme === '\r\n' ? grapheme.split('') : [grapheme];
    return accumulator.concat(result);
  }, []);
};

const utf8ByteLength = (codePoint: number): number => {
  if (codePoint <= 0x7f) return 1;
  if (codePoint <= 0x7ff) return 2;
  if (codePoint <= 0xffff) return 3;
  return 4;
};

export const countUtf8Bytes = (message: string): number => {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(message).length;
  }
  // Fallback for environments without TextEncoder (Node < 11, older browsers)
  return Array.from(message).reduce((bytes, char) => {
    const code = char.codePointAt(0);
    return bytes + (code === undefined ? 0 : utf8ByteLength(code));
  }, 0);
};
