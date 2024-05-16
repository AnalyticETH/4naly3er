import main from './main';
import minimist from 'minimist';
/*   .---. ,--.  ,--  / ,---.   ,--.   ,--.'  ,-. .----. ,------.,------,
    / .  | |   \ |  | | \ /`.\  |  |   `\ . '.' /\_.-,  ||  .---'|   /`. '
   / /|  | |  . '|  |)'-'|_.' | |  |     \     /   |_  <(|  '--. |  |_.' |
  / '-'  |||  |\    |(|  .-.  |(|  '_     /   /) .-. \  ||  .--' |  .   .'
  `---|  |'|  | \   | |  | |  | |     |`-/   /`  \ `-'  /|  `---.|  |\  \
    `--' `--'  `--' `--' `--' `-----'  `--'     `---'' `------'`--' '--' */

// ================================= PARAMETERS ================================

function parseArgs() {
  const args = minimist(process.argv.slice(2));
  if (
    !args['t'] && (
      args['h'] ||
      args._.length == 0 ||
      args._[0] === 'help'
    )
  ) {
    console.log('Usage: ')
    console.log('\tnpx ts-node src/index.ts -h')
    console.log('\tnpx ts-node src/index.ts targetDir -o [sarif|file|-] -s [scope.txt] -l [github-link] -r [rule.ts] -t [target.sol]')
    process.exit(0)
  }

  const dir = args._[0] || './'
  const outputFormat = args['o'] || '-'
  const scopeFile = args['s'] || ''
  const githubLink = args['l'] || ''
  const specialRuleFile = args['r'] || ''
  const specialTarget = args['t'] || ''

  console.log(`yarn analyze ${dir} -o ${outputFormat} -s ${scopeFile} -l ${githubLink} -r ${specialRuleFile} -t ${specialTarget}`)

  return {
    dir,
    outputFormat,
    scopeFile,
    githubLink,
    specialRuleFile,
    specialTarget
  }
}

const { dir, outputFormat, scopeFile, githubLink, specialRuleFile, specialTarget } = parseArgs()

main(
  dir,
  scopeFile,
  specialTarget,
  githubLink,
  outputFormat,
  specialRuleFile,
);