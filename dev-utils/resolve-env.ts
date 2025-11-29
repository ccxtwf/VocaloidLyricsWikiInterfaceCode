import { ViteCustomCliArguments } from './types.js';

const argumentKeys = ['cmd'];
const rxCliArg = new RegExp(`^--(${argumentKeys.join('|')})=(.+)$`);

export function resolveCommandLineArgumentsPassedToVite(): ViteCustomCliArguments {
  const customArgs = process.argv.slice(4);
  let args: ViteCustomCliArguments = {};
  for (const arg of customArgs) {
    const m = arg.match(rxCliArg);
    if (m === null) continue;
    //@ts-ignore
    args[m[1]] = m[2];
  }

  return args;
}