```
     .---. ,--.  ,--   ,----.   ,--.  ,--.   ,-. .----. ,------.,------,
    / .  | |   \ |  | |  ._. \  |  |  `\ . '.' /\_.-,  ||  .---'|   /`. '
   / /|  | |  . '|  | |  |_|  | |  |    \     /   |_  <(|  '--. |  |_.' |
  / '-'  |||  |\    | |  .-.  |(|  '_    /   /) .-. \  ||  .--' |  .   .'
  `---|  |'|  | \   | |  | |  | |     | /   /`  \ `-'  /|  `---.|  |\  \
      `--' `--'  `--' `--' `--' `-----' `--'     `---'' `------'`--' '--'
```

# Table of Contents

- [Table of Contents](#table-of-contents)
  - [Usage](#usage)
    - [Parameters](#parameters)
    - [Example](#example)
    - [Print title and impact/ description of supported issues into a markdown file](#print-title-and-impact-description-of-supported-issues-into-a-markdown-file)
  - [Example Reports](#example-reports)
  - [Installation](#installation)
  - [Contributing](#contributing)

## Usage

```bash
yarn analyze <BASE_PATH> <SCOPE_FILE> <GITHUB_URL>
```

### Parameters

- `BASE_PATH` is a relative path to the folder containing the smart contracts.
- `SCOPE_FILE` is an optional file containing a specific smart contracts scope (see [scope.example.txt](./scope.example.txt))
- `GITHUB_URL` is an optional url to generate links to github in the report. Include the trailing `/`
- For remappings, add `remappings.txt` to `BASE_PATH`.
- The output will be saved in a `report.md` file and a `report.sarif.json` file.
- Ensure the smart contracts' dependencies are available.

### Example

```bash
yarn analyze contracts scope.example.txt
```

### Print title and impact/ description of supported issues into a markdown file

```bash
yarn print [outputFile]
```

- `outputFile` is an optional file path to store title and title & description of all supported detectors.

## Example Reports

| Repository                                                                        | Report                                                                     |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
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
