import GraphemeSplitter from 'grapheme-splitter';

export const splitGraphemes = (message: string): string[] => {
  const splitter = new GraphemeSplitter();
  return splitter.splitGraphemes(message).reduce((accumulator: string[], grapheme: string) => {
    const result = grapheme === '\r\n' ? grapheme.split('') : [grapheme];
    return accumulator.concat(result);
  }, []);
};

export const countUtf8Bytes = (message: string): number => new TextEncoder().encode(message).length;
