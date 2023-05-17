import fs from 'fs';
import analyze from './analyze';
import compileAndBuildAST from './compile';
import issues from './issues';
import { InputType, IssueTypes } from './types';
import { recursiveExploration } from './utils';

interface Params {
  path: string;
  scope: string;
  output?: string;
  verbose?: boolean;
}
const main = async ({ path, scope, output = 'report.md', verbose }: Params) => {
  let result = '# Report\n\n';
  let fileNames: string[] = [];

  if (scope) {
    // Scope is specified in a .txt file or is passed in a string
    const content = scope ?? fs.readFileSync(scope as string, { encoding: 'utf8', flag: 'r' });
    for (const word of [...content.matchAll(/[a-zA-Z\/\.\-\_0-9]+/g)].map(r => r[0])) {
      console.log(path, word);
      if (word.endsWith('.sol') && fs.existsSync(`${path}${word}`)) {
        fileNames.push(word);
      }
    }
    if (fileNames.length === 0) throw Error('Scope is empty');
  } else {
    // Scope is not specified: exploration of the folder
    fileNames = recursiveExploration(path);
  }

  console.log('Scope: ', fileNames);

  if (verbose) {
    result += '## Files analyzed\n\n';
    fileNames.forEach(fileName => {
      result += ` - ${fileName}\n`;
    });
  }

  // Read file contents and build AST
  const files: InputType = [];
  const asts = await compileAndBuildAST(path, fileNames);
  fileNames.forEach((fileName, index) => {
    files.push({
      content: fs.readFileSync(`${path}${fileName}`, { encoding: 'utf8', flag: 'r' }),
      name: fileName,
      ast: asts[index],
    });
  });

  for (const t of Object.values(IssueTypes)) {
    result += analyze(
      files,
      issues.filter(i => i.type === t),
    );
  }

  fs.writeFileSync(output, result);
};

export default main;
