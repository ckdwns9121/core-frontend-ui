export const deepCompare = <T extends Record<string, unknown>>(
  a: T,
  b: T,
): boolean =>
  Object.entries(a).every(([key, val]) =>
    val !== null && typeof val === 'object'
      ? deepCompare(val as T, b[key] as T)
      : val === b[key],
  );

export const stringToDOM = (text: string) =>
  new DOMParser().parseFromString(text, 'text/html').body.children[0];

export const generateDOM = (
  tag: keyof HTMLElementTagNameMap,
  className?: string,
  text?: string,
) => {
  const elem = document.createElement(tag);
  if (className) elem.classList.add(...className.split(' '));
  if (text) elem.textContent = text;
  return elem;
};

export const generateRandomNumber = (min = 0, max = 0, step = 1) => {
  if (max < min || max - min < step) throw Error('wrong arguments');
  const num = Math.random() * (max - min);
  return Math.round(num / step) * step + min;
};
export const waitFor = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

export const shiftData = <T>(list: T[], shift = 0, size = list.length) => {
  const shifted = list.slice(shift + 1).concat(list.slice(0, shift));
  return shifted.slice(0, size);
};
