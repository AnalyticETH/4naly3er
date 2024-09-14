import { findAll } from 'solidity-ast/utils';
import { ASTIssue, InputType, Instance, IssueTypes, RegexIssue } from '../../types';
import { instanceFromSRC } from '../../utils';
import util from 'util';

const issue: ASTIssue = {
  regexOrAST: 'AST',
  type: IssueTypes.M,
  title: 'Library function isn\'t `internal` or `private`',
  description:
    'In a library, using an external or public visibility means that we won\'t be going through the library with a DELEGATECALL but with a CALL. This changes the context and should be done carefully.',
  detector: (files: InputType): Instance[] => {
    let instances: Instance[] = [];
    for (const file of files) {
      if (!!file.ast) {
        for (const cd of findAll('ContractDefinition', file.ast)) {
          if (cd.contractKind != 'library') {
            continue;
          }
          for (const a of findAll('FunctionDefinition', file.ast)) {
            if (a.kind == 'constructor' || a.virtual) {
              continue;
            }
            if (
              a.visibility == "external" || a.visibility == "public") {
                instances.push(instanceFromSRC(file, a.src));
            }
          }
        }
      }
    }
    return instances;
  },
};

export default issue;
//TODO: Review comment
// 0xEVom commented on Aug 9
// Here's what the detector currently says:

// In a library, using an external or public visibility means that we won't be going through the library with a DELEGATECALL but with a CALL. This changes the context and should be done carefully.

// But, from the Solidity docs:

// ... the code of internal library functions that are called from a contract and all functions called from therein will at compile time be included in the calling contract, and a regular JUMP call will be used instead of a DELEGATECALL.

// Calling a public library function with L.f() results in an external call (DELEGATECALL to be precise).

// Hence the external or public visibility means the function will be executed using a DELEGATECALL instead of a JUMP, not a CALL instead of a DELEGATECALL.

// I'm also not sure what exactly this detector is trying to flag - I don't see how having an external/public library function is immediately a security concern, or at least not worth a Medium severity finding. There may be other implications I'm not aware of but I can only see this being a potential footgun if the function takes storage pointers as parameters, which seems unlikely to happen inadvertently.