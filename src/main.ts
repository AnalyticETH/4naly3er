import fs from 'fs';
import analyze from './analyze';
import compileAndBuildAST from './compile';
import issues from './issues';
import { Analysis, InputType, IssueTypes } from './types';
import { recursiveExploration } from './utils';
import { reportAsMarkdown, reportAsSarif, reportAsStdOut, reportType } from './report';

/*   .---. ,--.  ,--  / ,---.   ,--.   ,--.'  ,-. .----. ,------.,------,
    / .  | |   \ |  | | \ /`.\  |  |   `\ . '.' /\_.-,  ||  .---'|   /`. '
   / /|  | |  . '|  |)'-'|_.' | |  |     \     /   |_  <(|  '--. |  |_.' |
  / '-'  |||  |\    |(|  .-.  |(|  '_     /   /) .-. \  ||  .--' |  .   .'
  `---|  |'|  | \   | |  | |  | |     |`-/   /`  \ `-'  /|  `---.|  |\  \
    `--' `--'  `--' `--' `--' `-----'  `--'     `---'' `------'`--' '--' */

// ============================== GENERATE REPORT ==============================

function exploreTargets(scopeTxt?: string, targetFile?: string, basePath?: string): string[] {
  // Scope is specified in a .txt file
  if (!!scopeTxt) {
    let fileNames: string[] = [];
    const content = scopeTxt ?? fs.readFileSync(scopeTxt as string, { encoding: 'utf8', flag: 'r' });
    for (const word of [...content.matchAll(/[a-zA-Z\/\.\-\_0-9]+/g)].map(r => r[0])) {
      if (word.endsWith('.sol') && fs.existsSync(`${basePath}${word}`)) {
        fileNames.push(word);
      }
    }
    return fileNames
  }

  // Scope is specified in a string
  if (!!targetFile && fs.existsSync(targetFile)) {
    return [targetFile];
  }

  // Scope is not specified: exploration of the folder
  if (!!basePath) {
    return recursiveExploration(basePath);
  }

  return [];
}

async function buildAst(basePath: string, fileNames: string[]): Promise<InputType> {
  const files: InputType = [];
  const asts = await compileAndBuildAST(basePath, fileNames);
  fileNames.forEach((fileName, index) => {
    files.push({
      content: fs.readFileSync(`${basePath}${fileName}`, { encoding: 'utf8', flag: 'r' }),
      name: fileName,
      ast: asts[index],
    });
  });
  return files
}

/**
 * @param basePath Path were the contracts lies
 * @param scopeTxt .txt file containing the contest scope
 * @param targetFile optional text containing the .sol files in scope. Replaces `scopeTxt`
 * @param githubLink github url to generate links to code
 * @param outputFormat where to save the report
 * @param specialRule optional rule to apply
 */
const main = async (
  basePath: string,
  scopeTxt?: string,
  targetFile?: string,
  githubLink?: string,
  outputFormat?: string,
  specialRule?: string,
) => {
  let fileNames: string[] = exploreTargets(scopeTxt, targetFile, basePath);
  if (fileNames.length === 0) throw Error('Scope is empty');
  console.log('Scope: ', fileNames);

  // Uncomment next lines to have the list of analyzed files in the report

  // result += '## Files analyzed\n\n';
  // fileNames.forEach(fileName => {
  //   result += ` - ${fileName}\n`;
  // });

  // Read file contents and build AST
  const files: InputType = await buildAst(basePath, fileNames);


  let analysis: Analysis[] = [];
  for (const t of Object.values(IssueTypes)) {
    analysis = analysis.concat(
      analyze(
        files,
        issues.
          filter(i => i.type === t).
          filter(i => {
            const rg = new RegExp(specialRule ?? '.*');
            return rg.test(i.title);
        }),
      )
    );
  }

  // output
  switch (outputFormat) {
    case reportType.STDOUT:
      console.log(
        reportAsStdOut(
          analysis,
          !!githubLink ? githubLink : undefined,
        )
      );
      break;

    case reportType.MARKDOWN:
      const filename = `${basePath}_4naly3er_report.md`;
      fs.writeFileSync(filename,
        reportAsMarkdown(
          analysis,
          !!githubLink ? githubLink : undefined,
        )
      );
     break;

    case reportType.SARIF:
      reportAsSarif(
        analysis,
        !!githubLink ? githubLink : undefined,
      );
      break;
  }

};

export default main;
