// Color types for color and backgroundColor properties
type RGB = `rgb(${number}, ${number}, ${number})`;

type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;

type HSL = `hsl(${number}, ${number}%, ${number}%)`;

type HSLA = `hsla(${number}, ${number}%, ${number}%, ${number})`;

type HEX = `#${string}`;

type COLOR = 'red' | 'green' | 'blue' | 'yellow';

export type Color = RGB | RGBA | HSL | HSLA | HEX | COLOR;
