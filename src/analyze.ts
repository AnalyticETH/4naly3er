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

/**
 * @notice Runs the given issues on files and generate the report markdown string
 * @param githubLink optional url to generate links
 * @param files Array of input files to be analyzed
 * @param issues Array of issues to be checked in the files
 * @returns A markdown string containing the analysis report
 */
const analyze = (files: InputType, issues: Issue[]): Analysis[] => {
  let analyses: Analysis[] = []; // Array to store issues and their instances

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
      analyses.push({ issue, instances });
      // preSARIF.push({ issue, instances });
    }
  } // Done pushing to analyze array

  return analyses;
//? return analyze - then call another function which does the markdown report
// then in main.ts where it calls analyze, it should take the returned data and pass it to md report function

};

export default analyze;
