```
     .---. ,--.  ,--   ,----.   ,--.  ,--.   ,-. .----. ,------.,------,
    / .  | |   \ |  | |  ._. \  |  |  `\ . '.' /\_.-,  ||  .---'|   /`. '
   / /|  | |  . '|  | |  |_|  | |  |    \     /   |_  <(|  '--. |  |_.' |
  / '-'  |||  |\    | |  .-.  |(|  '_    /   /) .-. \  ||  .--' |  .   .'
  `---|  |'|  | \   | |  | |  | |     | /   /`  \ `-'  /|  `---.|  |\  \
      `--' `--'  `--' `--' `--' `-----' `--'     `---'' `------'`--' '--'
      -- Upgraded by @LowK3v
```

# Table of Contents

- [Table of Contents](#table-of-contents)
  - [Usage](#usage)
  - [Example Reports](#example-reports)
  - [Installation](#installation)
  - [Contributing](#contributing)

## Upgraded Version Usage

```bash
yarn analyze BASE_PATH -t <TARGET_FILE> -r <TARGET_RULE> -o <OUTPUT:[sarif|file|-]> -s <SCOPE_FILE> -l <GITHUB_URL>

# Example
yarn analyze contracts 
yarn analyze -t example.sol
yarn analyze -t example.sol -r "zero.*transfer"
yarn analyze contracts -o sarif
yarn analyze contracts -l github.com/xyz/contracts

```

- `BASE_PATH` is a relative path to the folder containing the smart contracts.
- `TARGET_FILE` is a relative path to the file of the smart contracts.
- `TARGET_RULE` is a specific rule to analyze. It can be a regular expression. Default is `.*`.
- `OUTPUT` is a format of the output. It can be `sarif`, `file` or `-` for stdout. Default is `-`.
- `SCOPE_FILE` is an optional file containing a specific smart contracts scope (see [scope.example.txt](./scope.example.txt))
- `GITHUB_URL` is an optional url to generate links to the GitHub in the report
- For remappings, add `remappings.txt` to `BASE_PATH`.
- The output will be saved in a `report.md` file.

## Example Reports

| Repository                                                                        | Report                                                                     |
|-----------------------------------------------------------------------------------|----------------------------------------------------------------------------|
| [Holograph](https://code4rena.com/contests/2022-10-holograph-contest)             | [Report](https://gist.github.com/Picodes/e9f1bb87ae832695694175abd8f9797f) |
| [3xcalibur](https://code4rena.com/contests/2022-10-3xcalibur-contest)             | [Report](https://gist.github.com/Picodes/51789d48e3a3c9246a48bb490d688343) |
| [Inverse Finance](https://code4rena.com/contests/2022-10-inverse-finance-contest) | [Report](https://gist.github.com/Picodes/8d3a45d6d1362fb9953d631d8c84a29f) |
| [Paladin](https://code4rena.com/contests/2022-10-paladin-warden-pledges-contest)  | [Report](https://gist.github.com/Picodes/2d23ed5128036f1b475654d5bcca9eed) |
| [zkSync](https://code4rena.com/contests/2022-10-inverse-finance-contest)          | [Report](https://gist.github.com/Picodes/1f87a82e954cc749dea9d9961d5f4dff) |

## Installation

You'll need [Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/). Then clone the repo and run:

```bash
yarn
```

You're all set!

## Contributing

You're more than welcome to contribute! For help you can check [CONTRIBUTING.md](CONTRIBUTING.md)
