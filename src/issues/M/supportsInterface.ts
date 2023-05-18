import { IssueTypes, RegexIssue } from '../../types';

const issue: RegexIssue = {
  regexOrAST: 'Regex',
  type: IssueTypes.M,
  title: 'Contract is not compliant with ERC-165',
  impact:
    'In order to properly implement `supportsInterface` in accordance with the ERC-165, the function MUST return true for the interface ID parameter `0x01ffc9a7` (calculated from `bytes4(keccak256("supportsInterface(bytes4)"))`), or simply `type(ERC165).interfaceId`.',
  // thanks ChatGPT
  regex:
    /function\s+supportsInterface\((bytes4\s+)?.*\)\s+(external\s+)?(public\s+)?(pure\s+|view\s+)?override\s+returns\s*\(bool\)\s*\{(?![^}]*(.*\s*==\s*0x01ffc9a7|.*\s*==\s*type\(ERC165\)\.interfaceId))[^}]*\}/g,
};

export default issue;
