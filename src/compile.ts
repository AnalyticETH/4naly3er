import fs from 'fs';
import path from 'path';
import semver from 'semver';
import type { SourceUnit } from 'solidity-ast';

import solc000817 from 'solc-0.8.17';
import solc000813 from 'solc-0.8.13';
import solc000809 from 'solc-0.8.9';

const solc: Record<string, any> = {
  '0.8.17': solc000817,
  '0.8.13': solc000813,
  '0.8.9': solc000809,
};

const versions = Object.keys(require('../package.json').dependencies)
  .filter(s => s.startsWith('solc-'))
  .map(s => s.replace('solc-', ''))
  .sort(semver.compare)
  .reverse();

type ToCompile = { [file: string]: { content: string } };
type Sources = { file: string; index: number; content: string; version: string; compiled: boolean; ast?: SourceUnit }[];

/***
 * @notice Compiles `toCompile` with solc
 * @param toCompile source files with content already loaded
 */
const compile = async (version: string, toCompile: ToCompile, basePath: string) => {
  // version() returns something like '0.8.13+commit.abaa5c0e.Emscripten.clang'
  const solidity = solc[version];
  if (!solidity) {
    throw new Error(`solc version ${version} not supported`);
  }
  const [trueVersion] = solidity.version().split('+');

  let output;
  if (trueVersion !== version) {
    output = {
      errors: [{ formattedMessage: `Package solc-${version} is actually solc@${trueVersion}` }],
    };
  } else {
    output = JSON.parse(
      solidity.compile(
        JSON.stringify({
          sources: toCompile,
          language: 'Solidity',
          settings: {
            outputSelection: { '*': { '': ['ast'] } },
          },
        }),
        { import: findImports(basePath) },
      ),
    );
  }

  return output;
};

/***
 * @notice Reads and load an import file
 */
const findImports = (basePath: string) => {
  const res = (relativePath: string) => {
    const depth = 5;
    let prefix = '';
    for (let i = 0; i < depth; i++) {
      /** 1 - import are stored in `node_modules` */
      try {
        const absolutePath = path.resolve(basePath, prefix, 'node_modules/', relativePath);
        const source = fs.readFileSync(absolutePath, 'utf8');
        return { contents: source };
      } catch {}

      /** 2 - import are stored in `lib`
       * In this case you need to check eventual remappings
       */
      try {
        const remappings = fs.readFileSync(path.resolve(basePath, prefix, 'remappings.txt'), 'utf8');
        for (const line of remappings.split('\n')) {
          if (!!line.split('=')[0] && !!line.split('=')[1]) {
            relativePath = relativePath.replace(line.split('=')[0], line.split('=')[1]);
          }
        }

        const absolutePath = path.resolve(basePath, relativePath);
        const source = fs.readFileSync(absolutePath, 'utf8');
        return { contents: source };
      } catch {}

      /** 3 - import are stored relatively */
      try {
        const absolutePath = path.resolve(basePath, prefix, relativePath);
        const source = fs.readFileSync(absolutePath, 'utf8');
        return { contents: source };
      } catch {}

      prefix += '../';
    }

    console.error(
      `\n\n'${relativePath}' import not found\n\nMake sure you can compile the contracts in the original repository.\n`,
    );
  };
  return res;
};

const compileAndBuildAST = async (basePath: string, fileNames: string[]): Promise<SourceUnit[]> => {
  let sources: Sources = [];

  /** Read scope and fill file list */
  let i = 0;
  for (const file of fileNames) {
    const content = fs.readFileSync(path.join(basePath, file), { encoding: 'utf8', flag: 'r' });
    if (!!content) {
      if (!content.match(/pragma solidity (.*);/)) {
        console.log(`Cannot find pragma in ${path.join(basePath, file)}`);
      } else {
        sources.push({
          file: path.join(basePath, file),
          index: i++, // Used to know when a file is compiled
          content,
          version: content.match(/pragma solidity (.*);/)![1],
          compiled: false,
        });
      }
    }
  }

  const promises: Promise<void>[] = [];
  for (const version of versions) {
    const filteredSources = sources.filter(f => semver.satisfies(version, f.version) && !f.compiled);
    // Mark the filteredSources as being sent to compilation
    for (const f of filteredSources) {
      sources[f.index].compiled = true;
    }

    if (filteredSources.length > 0) {
      promises.push(
        compile(
          version,
          filteredSources.reduce((res: ToCompile, curr) => {
            res[curr.file] = { content: curr.content };
            return res;
          }, {}),
          basePath,
        ).then(output => {
          for (const f of filteredSources) {
            if (!output.sources[f.file]?.ast) {
              console.log(`Cannot compile AST for ${f.file}`);
            }
            sources[f.index].ast = output.sources[f.file]?.ast;
          }
        }),
      );
    }
  }
  await Promise.all(promises);
  return sources.map(f => f.ast!);
};

export default compileAndBuildAST;
