import { kebabCase } from "lodash";

export const turnIntoKebab = (text: string) => {
  return kebabCase(text);
};

export const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
