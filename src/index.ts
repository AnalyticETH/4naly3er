#!/usr/bin/env node
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import main from './main';
const argv = yargs(hideBin(process.argv)).argv;

console.log(argv);
main(argv as any);
