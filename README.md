# coypu

Coypu is an open source community-driven static analyzer that competes on Code4rena Bot Races. 

![DALL·E 2023-05-17 14 17 47 - A drawing of a coypu](https://github.com/aviggiano/coypu/assets/3029017/04206f5f-dcf3-4889-85ef-4053977f06fe|width=100px)

## Motivation

The Code4rena bot races were a fantastic and innovative idea, created with the goal of fostering the development of static analyzers and reducing the burden on judges in audit competitions.

However, an unintended consequence of this competition is that it discourages the development of open-source analyzers. Since only the results are made public, Wardens have no motivation to share their analyzers with others. This will arguably lead to LESS security in the industry over time, since projects not participating in a competition may not get their codebase analyzed.

Knowledge should be shared, not locked under closed source projects.

The objective of Coypu is to motivate the Warden community to collaborate in a manner that is not only financially beneficial but also helps the blockchain security industry.

## How it works

Every person that contributes to the bot will be awarded points for their detectors.

- High: 10 points
- Medium: 5 points
- QA/Gas: 1 point

Prizes will be held on a community multisig and will be split amongst all contributors according to their points.

## Added detectors

- @aviggiano M [msgValueWithoutPayable](https://github.com/aviggiano/coypu/blob/main/src/issues/M/msgValueWithoutPayable.ts)
- @aviggiano M [supportsInterface](https://github.com/aviggiano/coypu/blob/main/src/issues/M/supportsInterface.ts)

## Request for detectors

- [M] L2 Chainlink sequencer
- [M] Chainlink stale data

## Acknowledgements

This is a fork of https://github.com/Picodes/4naly3er

