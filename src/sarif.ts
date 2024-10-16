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

// Function to map issue types to SARIF severity levels
const mapSeverity = (type: string) => {
  switch (type) {
    case 'NC':
      return 'note';
    case 'G':
      return 'note';
    case 'GAS':
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
    case 'NC':
      return '0.0'; // No Severity
    case 'G':
      return '2.5'; // Low
    case 'GAS':
      return '2.5'; // Low
    case 'L':
      return '5.0'; // Medium
    case 'M':
      return '7.5'; // High
    case 'H':
      return '10.0'; // Critical
    default:
      return '10.0'; // Everything should be define
  }
};

// Function to map issue types to descriptive tags
const mapTag = (type: string) => {
  switch (type) {
    case 'NC':
      return 'Informational';
    case 'G':
      return 'Gas Optimization';
    case 'GAS':
      return 'Gas Optimization';
    case 'L':
      return 'Low';
    case 'M':
      return 'Medium';
    case 'H':
      return 'High';
    default:
      return 'Informational';
  }
};

const sarif = (analyses: Analysis[]): Object => {
  // Convert the JSON data to SARIF format
  const sarifDetails = {
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
            rules: analyses.map((item, index) => ({
              id: `rule${index + 1}`,
              name: item.issue.title,
              shortDescription: {
                text: item.issue.title
              },
              fullDescription: {
                text: item.issue.description || item.issue.title
              },              
              helpUri: "https://github.com/AnalyticETH/4naly3er/blob/analytic/detectors.md",
              help: {
                text: item.issue.description || item.issue.title
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
        results: analyses.flatMap((item, index) =>
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

  return sarifDetails;


  // we should return this instead of writing to fs here
  // // Write the SARIF data to a file called report.sarif.json
  // fs.writeFileSync('report.sarif.json', JSON.stringify(sarif, null, 2), 'utf-8');
}

export default sarif;
