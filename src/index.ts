import main from './main';

/*   .---. ,--.  ,--  / ,---.   ,--.   ,--.'  ,-. .----. ,------.,------,
    / .  | |   \ |  | | \ /`.\  |  |   `\ . '.' /\_.-,  ||  .---'|   /`. '
   / /|  | |  . '|  |)'-'|_.' | |  |     \     /   |_  <(|  '--. |  |_.' |
  / '-'  |||  |\    |(|  .-.  |(|  '_     /   /) .-. \  ||  .--' |  .   .'
  `---|  |'|  | \   | |  | |  | |     |`-/   /`  \ `-'  /|  `---.|  |\  \
    `--' `--'  `--' `--' `--' `-----'  `--'     `---'' `------'`--' '--' */

// ================================= PARAMETERS ================================

const basePath =
  process.argv.length > 2 ? (process.argv[2].endsWith('/') ? process.argv[2] : process.argv[2] + '/') : 'contracts/';
const out = process.argv.length > 3 && process.argv[3].includes('/sarif|file|-/g') ? process.argv[3] : '-';
const scopeFile = process.argv.length > 4 && process.argv[4].endsWith('txt') ? process.argv[3] : null;
const githubLink = process.argv.length > 5 && process.argv[5] ? process.argv[4] : null;

// ============================== GENERATE REPORT ==============================

// yarn analyze dir [sarif|file|-] [scope.txt] [github-link]
main(basePath, scopeFile, githubLink, out);
