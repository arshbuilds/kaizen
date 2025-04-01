import { kebabCase } from "lodash";

export const turnIntoKebab = (text: string) => {
    return kebabCase(text)
}