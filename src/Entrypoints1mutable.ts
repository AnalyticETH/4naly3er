import { findAll } from 'solidity-ast/utils';
import { ASTIssue, InputType, Instance, IssueTypes, RegexIssue } from '../../types';
import { instanceFromSRC } from '../../utils';
import util from 'util';

const issue: ASTIssue = {
  regexOrAST: 'AST',
  type: IssueTypes.HELPER,
  title: "[Entrypoints-1] Shows the Contracts' Mutable Entrypoints",
  detector: (files: InputType): Instance[] => {
    let instances: Instance[] = [];
    for (const file of files) {
      if (!!file.ast) {
        for (const cd of findAll('ContractDefinition', file.ast)) {
          if (cd.contractKind == 'interface') {
            continue;
          }
          for (const fd of findAll('FunctionDefinition', cd)) {
            if (fd.kind == 'constructor' || fd.kind == 'receive') {
              continue;
            }
            if (fd.visibility == 'external' || fd.visibility == 'public') {
              if (fd.stateMutability != "pure" && fd.stateMutability != "view") {
                  instances.push(instanceFromSRC(file, fd.src));
              }
            }
          }
        }
      }
    }
    return instances;
  },
};
export default issue;

