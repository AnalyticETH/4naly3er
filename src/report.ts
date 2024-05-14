import { Analysis } from "./types";
import fs from 'fs';

export const reportType = {
    MARKDOWN: 'markdown',
    SARIF: 'sarif',
    STDOUT: '-',
};

const issueTypesTitles = {
    GAS: 'Gas Optimizations',
    NC: 'Non Critical Issues',
    L: 'Low Issues',
    M: 'Medium Issues',
    H: 'High Issues',
};

const color = {
    RED: '\x1b[31m',
    BRED: '\x1b[41m',
    GREEN: '\x1b[32m',
    BGREEN: '\x1b[42m',
    YELLOW: '\x1b[33m',
    BYELLOW: '\x1b[43m',
    BLUE: '\x1b[34m',
    GRAY: '\x1b[90m',
    BGRAY: '\x1b[100m',
    END: '\x1b[0m',
    BOLD: '\x1b[1m',
    ITALIC: '\x1b[3m',
    UNDERLINE: '\x1b[4m',
    NEWLINE: '\n',
    DUP_NEWLINE: '\n\n',
}

export const reportAsMarkdown = (analyze: Analysis[], githubLink?: string) => {
    let result = '# Report\n\n';

    /** Summary */
    let c = 0;
    if (analyze.length > 0) {
        result += `\n## ${issueTypesTitles[analyze[0].issue.type]}\n\n`;
        result += '\n| |Issue|Instances|\n|-|:-|:-:|\n';
        for (const { issue, instances } of analyze) {
            c++;
            result += `| [${issue.type}-${c}](#${issue.type}-${c}) | ${issue.title} | ${instances.length} |\n`;
        }
    }

    /** Issue breakdown */
    c = 0;
    for (const { issue, instances } of analyze) {
        c++;
        result += `### <a name="${issue.type}-${c}"></a>[${issue.type}-${c}] ${issue.title}\n`;
        if (!!issue.description) {
            result += `${issue.description}\n`;
        }
        if (!!issue.impact) {
            result += '\n#### Impact:\n';
            result += `${issue.impact}\n`;
        }
        result += `\n*Instances (${instances.length})*:\n`;
        let previousFileName = '';
        for (const o of instances.sort((a, b) => {
            if (a.fileName < b.fileName) return -1;
            if (a.fileName > b.fileName) return 1;
            return !!a.line && !!b.line && a.line < b.line ? -1 : 1;
        })) {
            if (o.fileName !== previousFileName) {
            if (previousFileName !== '') {
                result += `\n${'```'}\n`;
                if (!!githubLink) {
                result += `[Link to code](${githubLink + previousFileName})\n`;
                }
                result += `\n`;
            }
            result += `${'```'}solidity\nFile: ${o.fileName}\n`;
            previousFileName = o.fileName;
            }

            // Insert code snippet
            const lineSplit = o.fileContent?.split('\n');
            const offset = o.line.toString().length;
            result += `\n${o.line}: ${lineSplit[o.line - 1]}\n`;
            if (!!o.endLine) {
            let currentLine = o.line + 1;
            while (currentLine <= o.endLine) {
                result += `${' '.repeat(offset)}  ${lineSplit[currentLine - 1]}\n`;
                currentLine++;
            }
            }
        }
        result += `\n${'```'}\n`;
        if (!!githubLink) {
            result += `[Link to code](${githubLink + previousFileName})\n`;
        }
        result += `\n`;
    }

    return result;
}

export const reportAsSarif = (analyze: Analysis[], githubLink?: string) => {
    throw Error('SARIF not implemented yet');
}

export const reportAsStdOut = (analyze: Analysis[], githubLink?: string) => {

    const h1 = (text: string): string => (color.BOLD + color.BGREEN + text + color.END + color.DUP_NEWLINE);
    const title = (text: string): string => (color.BOLD + color.RED + text + color.END + color.DUP_NEWLINE);
    const text = (text: string): string => (color.GRAY + text + color.END + color.DUP_NEWLINE);
    const i = (text: string): string => (color.ITALIC + text + color.END + color.NEWLINE);
    const b = (text: string): string => (color.BOLD + color.GREEN + text + color.END + color.NEWLINE);

    let result = h1('4naly3er Report');

    /** Issue breakdown */
    let c = 0;
    for (const { issue, instances } of analyze) {
        c++;
        result += title(`[${issue.type}-${c}] ${issue.title}`);

        if (!!issue.description) {
            result += text(issue.description);
        }
        
        if (!!issue.impact) {
            result += b('Impact:');
            result += issue.impact + color.DUP_NEWLINE;
        }

        result += b(`Instances (${instances.length}):`);

        let codeSnippet = '';
        let previousFileName = '';

        for (const o of instances.sort((a, b) => {
            if (a.fileName < b.fileName) return -1;
            if (a.fileName > b.fileName) return 1;
            return !!a.line && !!b.line && a.line < b.line ? -1 : 1;
        })) {
            if (o.fileName !== previousFileName) {
                if (previousFileName !== '') {
                    if (!!githubLink) {
                        codeSnippet += `[Link to code](${githubLink + previousFileName})\n`;
                    }
                    codeSnippet += `\n`;
                }
                codeSnippet += `${''}\n// ${o.fileName}:${o.line}\n`;
                previousFileName = o.fileName;
            }

            // Insert code snippet
            const lineSplit = o.fileContent?.split('\n');
            const offset = o.line.toString().length;
            codeSnippet += `${o.line}: ${lineSplit[o.line - 1]}\n`;
            if (!!o.endLine) {
                let currentLine = o.line + 1;
                while (currentLine <= o.endLine) {
                    codeSnippet += `${' '.repeat(offset)}  ${lineSplit[currentLine - 1]}\n`;
                    currentLine++;
                }
            }
        }

        result += i(codeSnippet)

        if (!!githubLink) {
            result += `[Link to code](${githubLink + previousFileName})\n`;
        }
        result += `\n`;
    }

    /** Summary */
    c = 0;
    let summary = h1('SUMMARY')
    if (analyze.length > 0) {
        summary += title(`${issueTypesTitles[analyze[0].issue.type]}`);
        summary += b('Count \t Type \t Issue');
        for (const { issue, instances } of analyze) {
            c++;
            summary += `${instances.length} \t ${issue.type}-${c} \t ${issue.title} \n`;
        }
    }
    result += summary;

    return result;
}