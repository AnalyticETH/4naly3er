import { IssueTypes, RegexIssue } from '../../types';

const issue: RegexIssue = {
  regexOrAST: 'Regex',
  type: IssueTypes.L,
  title:
    'Upgradeable contract is missing a `__gap[50]` storage variable to allow for new storage variables in later versions',
  description:
    'See [this](https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps) link for a description of this storage variable. While some contracts may not currently be sub-classed, adding the variable now protects against forgetting to add it in the future.',
    regex: /Upgradeable/gi,
};

export default issue;
//TODO: Review comment
// jes16jupyter commented on Jun 8
// Hi, thanks for great work.

// I noticed that the current Implementation of upgradeableMissingGap just uses /Upgradeable/gi to match.

// This could produce a lot of False catches.

// _gap may already in the contract
// OZ 5.0 uses storage layout.
// Recommendation:

// change regex to exclude _gap.