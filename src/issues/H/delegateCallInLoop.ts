import { IssueTypes, RegexIssue } from '../../types';

const issue: RegexIssue = {
  regexOrAST: 'Regex',
  type: IssueTypes.H,
  title: 'Using `delegatecall` inside a loop',
  impact: 'When calling `delegatecall` the same `msg.value` amount will be accredited multiple times.',
  regex: /(for|while|do)[^\(]?(\([^\)]*\))?.?\{(([^\}]*\n)*(([^\}]*\{)([^\{\}]*\n)*([^\{\}]*\}[^\}]*)\n))*[^\}]*delegatecall/g,
         // (for|while|do)            : detects the loop keyword.             "for"
         // [^\(]?(\([^\)]*\))?.?\{   : detects loop conditions.              "(....) {"
         // ([^\}]*\n)*               : detects the line without }.           "......\n"
         // ([^\}]*\{)                : detects start of the line untile {.   ".......{"
         // ([^\{\}]*\n)*             : detects the lines without { and }.    "......\n"
         // ([^\{\}]*\}[^\}]*)\n      : detect the line with }.               "...}..\n"
         // [^\}]*delegatecall        : detect the lien with delegatecall.    "....call"
};

export default issue;

// TLDR: If this detector ends up in an infinite loop, delete it.

// Note: delegateCallInLoop.ts often ends up in an infinite loop #44:
// JustDravee commented on Feb 15
// So, this rule sometimes (always for me 😅) ends in an infinite loop. I usually delete it to run the tool.
// I'm pretty sure AST would be much better.
// Or, even a simple regex on delegatecall (yes, giga high chance of false positive, but may hit) would be better.
// Wdyt?
// https://github.com/Picodes/4naly3er/blob/main/src/issues/H/delegateCallInLoop.ts

// @IllIllI000
// IllIllI000 commented on Feb 15
// Yes, it hits catastrophic backtracking very frequently