import fs from 'fs';

import { getCurrentTime } from './date';

/**
 * Appends a log entry to a specified file
 *
 * This function takes a file path and content as arguments and appends
 * the content to the file, along with a timestamp. The file is located
 * in the 'log/api/' directory.
 *
 * Note: Security enhancements are needed. (See TODO)
 */
export const write = (filePath: string, content: string) => {
  // TODO enhance security
  const path = `log/api/${filePath}`;
  const newContent = `${getCurrentTime()}: ${content}\n`;

  fs.appendFile(path, newContent, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to file:', err);
    }
  });
};

/**
 * Writes error logs to 'error.txt'
 *
 * This function takes content as an argument and writes it to 'log/api/error.txt'
 */
export const writeError = (content: string) => {
  write('error.txt', content);
};
