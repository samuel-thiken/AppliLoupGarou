export function unique<T>(...args: T[]): T[] {
    return args.filter((value, index, array) => array.indexOf(value) === index).filter((value) => value !== undefined);
}
