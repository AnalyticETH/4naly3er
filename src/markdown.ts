import { InputType, Instance, Issue, IssueTypes, Analysis } from './types';
import { lineFromIndex } from './utils';
import * as fs from 'fs'; // Import the fs module

// Titles for different issue types
const issueTypesTitles = {
  GAS: 'Gas Optimizations',
  NC: 'Informational Issues',
  L: 'Low Issues',
  M: 'Medium Issues',
  H: 'High Issues',
};

const markdown = (analyze: Analysis[], githubLink?: string): string => {
  let result = ''; // Initialize the result string to store the final report

    /** Summary Section */
    let c = 0; // Counter for issue instances
    if (analyze.length > 0) {
      // Add the title for the first issue type
      result += `\n## ${issueTypesTitles[analyze[0].issue.type]}\n\n`;
      // Add table headers for the summary
      result += '\n| |Issue|Instances|\n|-|:-|:-:|\n';
      for (const { issue, instances } of analyze) {
        c++;
        // Add each issue to the summary table
        result += `| [${issue.type}-${c}](#${issue.type}-${c}) | ${issue.title} | ${instances.length} |\n`;
      }
    }
  
    /** Detailed Issue Breakdown Section */
    c = 0; // Reset counter for detailed breakdown
    for (const { issue, instances } of analyze) {
      c++;
      // Add a section for each issue
      result += `### <a name="${issue.type}-${c}"></a>[${issue.type}-${c}] ${issue.title}\n`;
      if (!!issue.description) {
        // Add issue description if available
        result += `${issue.description}\n`;
      }
      if (!!issue.impact) {
        // Add issue impact if available
        result += '\n#### Impact:\n';
        result += `${issue.impact}\n`;
      }
      // Add instances header
      result += `\n*Instances (${instances.length})*:\n`;
      let previousFileName = ''; // Track the previous file name to group instances by file
      for (const o of instances.sort((a, b) => {
        // Sort instances by file name and line number
        if (a.fileName < b.fileName) return -1;
        if (a.fileName > b.fileName) return 1;
        return !!a.line && !!b.line && a.line < b.line ? -1 : 1;
      })) {
        if (o.fileName !== previousFileName) {
          if (previousFileName !== '') {
            // Close the previous code block
            result += `\n${'```'}\n`;
            if (!!githubLink) {
              // Remove leading "." from previousFileName if it exists
              const sanitizedFileName = previousFileName.startsWith('.') ? previousFileName.slice(1) : previousFileName;
              const middleURL = "tree/main"
              // Add link to the code if githubLink is provided
              result += `[Link to code](${githubLink + middleURL + sanitizedFileName})\n`;
            }
            result += `\n`;
          }
          // Open a new code block for the current file
          result += `${'```'}solidity\nFile: ${o.fileName}\n`;
          previousFileName = o.fileName;
        }
  
        // Insert code snippet for the instance
        const lineSplit = o.fileContent?.split('\n'); // Split file content into lines
        const offset = o.line.toString().length; // Calculate the offset for line numbers
        result += `\n${o.line}: ${lineSplit[o.line - 1]}\n`; // Add the line with the issue
        if (!!o.endLine) {
          let currentLine = o.line + 1;
          while (currentLine <= o.endLine) {
            // Add lines within the range of the instance
            result += `${' '.repeat(offset)}  ${lineSplit[currentLine - 1]}\n`;
            currentLine++;
          }
        }
      }
      // Close the code block for the last file
      result += `\n${'```'}\n`;
      if (!!githubLink) {
        // Remove leading "." from previousFileName if it exists
        const sanitizedFileName = previousFileName.startsWith('.') ? previousFileName.slice(1) : previousFileName;      
        const middleURL = "tree/main"
        // Add link to the code if githubLink is provided
        result += `[Link to code](${githubLink + middleURL + sanitizedFileName})\n`;
      }
      result += `\n`;
    }
  
    return result; // Return the generated report
}

export default markdown;
