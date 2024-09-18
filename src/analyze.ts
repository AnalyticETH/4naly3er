import { InputType, Instance, Issue, IssueTypes } from './types';
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

/**
 * @notice Runs the given issues on files and generate the report markdown string
 * @param githubLink optional url to generate links
 * @param files Array of input files to be analyzed
 * @param issues Array of issues to be checked in the files
 * @returns A markdown string containing the analysis report
 */
const analyze = (files: InputType, issues: Issue[], githubLink?: string): string => {
  let result = ''; // Initialize the result string to store the final report
  let analyze: { issue: Issue; instances: Instance[] }[] = []; // Array to store issues and their instances

  // Iterate over each issue to analyze it in the provided files
  for (const issue of issues) {
    let instances: Instance[] = []; // Array to store instances of the current issue

    // Check if the issue is detected using regex
    if (issue.regexOrAST === 'Regex') {
      // Iterate over each file to find matches for the issue's regex
      for (const file of files) {
        // Find all matches of the issue's regex in the file content
        const matches: any = [...file.content.matchAll(issue.regex)];
        
        // Check for pre-condition regex if specified
        if(!!issue.regexPreCondition) {
          const preConditionMatches: any = [...file.content.matchAll(issue.regexPreCondition)];
          if (preConditionMatches.length == 0) continue; // Skip if pre-condition is not met
        }

        // Process each match found in the file
        for (const res of matches) {
          // Determine the line number of the match
          const line = [...res.input?.slice(0, res.index).matchAll(/\n/g)!].length;
          // Check if the line is a comment
          const comments = [...res.input?.split('\n')[line].matchAll(/([ \t]*\/\/|[ \t]*\/\*|[ \t]*\*)/g)];
          if (comments.length === 0 || comments?.[0]?.index !== 0) {
            let line = lineFromIndex(res.input, res.index); // Get the line number from the index
            let endLine: any;

            // Adjust line numbers if startLineModifier is specified
            if (!!issue.startLineModifier) line += issue.startLineModifier;
            // Adjust end line number if endLineModifier is specified
            if (!!issue.endLineModifier) endLine = line + issue.endLineModifier;

            // Add the instance to the instances array
            instances.push({ fileName: file.name, line, endLine, fileContent: res.input! });
          }
        }
      }
    } else {
      // If the issue is detected using a custom detector function
      instances = issue.detector(files);
    }

    // If instances are found, process them
    if (instances.length > 0) {
      // Remove duplicate instances
      let indexAdjusted = 0;
      for (let i = 1; i < instances.length;) {
        if (
          instances[i - 1].fileName == instances[i].fileName &&
          instances[i - 1].line == instances[i].line &&
          (!instances[i - 1].endLine || !instances[i].endLine || instances[i - 1].endLine == instances[i].endLine)
        ) {
          instances.splice(i - 1, 1); // Remove duplicate instance
        } else {
          i++;
        }
      }
      // Add the issue and its instances to the analyze array
      analyze.push({ issue, instances });
    }
  }

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

  /** SARIF Generation Section */

//// Support functions

// Function to convert a string to Pascal-case
const toPascalCase = (str: string) => {
  return str
    .replace(/[^a-zA-Z0-9 ]/g, '') // Remove non-alphanumeric characters
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) // Capitalize each word
    .replace(/\s+/g, ''); // Remove spaces
};

  const sanitizeFileName = (fileName: string) => {
    return fileName.replace(/^\.?\//, '');
  };

  // Function to sanitize file names by removing leading "." and "/"
  const sanitizeFileNames = (fileName: string) => {
    return fileName.replace(/^\.?\//, '');
  };

  // Remove the "fileContent" property from each instance in the analyze array
  const analyzeWithoutFileContent = analyze.map(({ issue, instances }) => ({
    issue,
    instances: instances.map(({ fileName, line, endLine }) => ({ fileName, line, endLine }))
  }));


  // Function to map issue types to SARIF severity levels
  const mapSeverity = (type: string) => {
    switch (type) {
      case 'NC':
        return 'note';
      case 'G':
        return 'note';
      case 'L':
        return 'warning';
      case 'M':
        return 'warning';
      case 'H':
        return 'error';
      default:
        return 'note';
    }
  };

  const mapSecuritySeverity = (type: string) => {
    switch (type) {
      case 'G':
        return '0.0';
      case 'NC':
        return '2.5';
      case 'L':
        return '5.0';
      case 'M':
        return '7.5';
      case 'H':
        return '10.0';
      default:
        return '10.0';
    }
  };

  // Function to map issue types to descriptive tags
  const mapTag = (type: string) => {
    switch (type) {
      case 'NC':
        return 'Informational';
      case 'G':
        return 'Gas Optimization';
      case 'L':
        return 'Low';
      case 'M':
        return 'Medium';
      case 'H':
        return 'High';
      default:
        return 'Unknown';
    }
  };
  
  // Convert the JSON data to SARIF format
  const sarif = {
    version: "2.1.0",
    $schema: "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
    runs: [
      {
        tool: {
          driver: {
            name: "4naly3er",
            fullName: "4naly3er Static Smart Contract Code Analyzer",
            informationUri: "https://github.com/AnalyticETH/4naly3er",
            version: "0.2", // Update the version number        
            rules: analyze.map((item, index) => ({
              id: `rule${index + 1}`,
              name: item.issue.title,
              shortDescription: {
                text: item.issue.title
              },
              fullDescription: {
                text: item.issue.description || "No description provided."
              },              
              helpUri: "https://github.com/AnalyticETH/4naly3er/blob/analytic/detectors.md",
              help: {
                text: item.issue.description || "No description provided."
              },
              properties: {
                tags: [mapTag(item.issue.type)], // Map issue type to descriptive tag
                "security-severity": mapSecuritySeverity(item.issue.type), // Map issue type to SARIF severity level
                "problem.severity": mapSecuritySeverity(item.issue.type) // Map issue type to SARIF severity level
              }
            }))
          }
        },
        automationDetails: {
          id: "4naly3er"
        },
        results: analyze.flatMap((item, index) =>
          item.instances.map(instance => ({
            ruleId: `rule${index + 1}`,
            message: {
              text: item.issue.title
            },
            locations: [
              {
                physicalLocation: {
                  artifactLocation: {
                    uri: sanitizeFileNames(instance.fileName), // Sanitize the file name to remove leading "."
                  },
                  region: {
                    startLine: instance.line,
                    startColumn: 1
                  }
                }
              }
            ],
            partialFingerprints: {
              primaryLocationLineHash: `${sanitizeFileNames(instance.fileName)}:${instance.line}` // Sanitize file name to remove leading "."
            },
            level: mapSeverity(item.issue.type), // Map issue type to SARIF severity level
          }))
        )
      }
    ]
  };

  // Write the SARIF data to a file called report.sarif.json
  fs.writeFileSync('report.sarif.json', JSON.stringify(sarif, null, 2), 'utf-8');

  return result; // Return the generated report
};

export default analyze;