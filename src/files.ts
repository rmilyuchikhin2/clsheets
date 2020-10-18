import { sheets_v4 } from 'googleapis';
import path from 'path';
// TODO: Cleanup
// import findUp from 'find-up';
import fs from 'fs-extra';
import mkdirp from 'mkdirp';
// TODO: Cleanup
// import multimatch from 'multimatch';
// import recursive from 'recursive-readdir';
// import ts2gas from 'ts2gas';
// import ts from 'typescript';
import { loadAPICredentials, sheets } from './auth';
import { DOT/*, DOTFILE TODO: Cleanup*/ } from './dotfile';
import {
    ERROR,
    LOG,
    // TODO: Cleanup
    // PROJECT_MANIFEST_FILENAME,
    checkIfOnline,
    // TODO: Cleanup
    // getAPIFileType,
    // getProjectSettings,
    logError,
    spinner,
} from './utils';
import Schema$Spreadsheet = sheets_v4.Schema$Spreadsheet;

// @see https://nodejs.org/api/fs.html#fs_fs_readfilesync_path_options
export const FS_OPTIONS = { encoding: 'utf8' };

// A Spreadsheet API File
interface SpreadsheetFile {
    // TODO: Cleanup
    // name: string;
    // type: string;
    // source: string;
}

// TODO: Cleanup
// // Used to receive files tracked by current project
// type FilesCallback =
// (error: Error | boolean, result: string[][] | null, files: Array<AppsScriptFile | undefined> | null) => void;
//
// /**
//  * Gets the local file type from the API FileType.
//  * @param  {string} type The file type returned by Apps Script
//  * @return {string}      The file type
//  * @see https://developers.google.com/apps-script/api/reference/rest/v1/File#FileType
//  */
// export function getFileType(type: string, fileExtension?: string): string {
//   return type === 'SERVER_JS' ? fileExtension || 'js' : type.toLowerCase();
// }

/**
 * Returns true if the user has a clsheets project.
 * @returns {boolean} If .clsheets.json exists.
 */
export function hasProject(): boolean {
    return fs.existsSync(DOT.PROJECT.PATH);
}

// /**
//  * Returns in tsconfig.json.
//  * @returns {ts.TranspileOptions} if tsconfig.json not exists, return undefined.
//  */
// function getTranspileOptions(): ts.TranspileOptions {
//   const projectPath = findUp.sync(DOT.PROJECT.PATH);
//   const tsconfigPath = path.join(projectPath ? path.dirname(projectPath) : DOT.PROJECT.DIR, 'tsconfig.json');
//   if(fs.existsSync(tsconfigPath)) {
//     const tsconfigContent = fs.readFileSync(tsconfigPath, FS_OPTIONS);
//     const parsedConfigResult = ts.parseConfigFileTextToJson(tsconfigPath, tsconfigContent);
//     return {
//       compilerOptions: parsedConfigResult.config.compilerOptions,
//     };
//   }
//   return {};
// }
//
// /**
//  * Recursively finds all files that are part of the current project, and those that are ignored
//  * by .clsheetsignore and calls the passed callback function with the file lists.
//  * @param {string} rootDir The project's root directory
//  * @param {FilesCallBack} callback The callback will be called with the following paramters
//  *   error: Error if there's an error, otherwise null
//  *   result: string[][], List of two lists of strings, ie. [nonIgnoredFilePaths,ignoredFilePaths]
//  *   files?: Array<AppsScriptFile|undefined> Array of AppsScriptFile objects used by clsheets push
//  * @todo Make this function actually return a Promise that can be awaited.
//  */
// export async function getProjectFiles(rootDir: string = path.join('.', '/'), callback: FilesCallback) {
//   const { filePushOrder } = await getProjectSettings();
//
//   // Load tsconfig
//   const userConf = getTranspileOptions();
//
//   // Read all filenames as a flattened tree
//   // Note: filePaths contain relative paths such as "test/bar.ts", "../../src/foo.js"
//   recursive(rootDir, async (err, filePaths) => {
//     if (err) return callback(err, null, null);
//
//     // Filter files that aren't allowed.
//     const ignorePatterns = await DOTFILE.IGNORE();
//
//     // Replace OS specific path separator to common '/' char for console output
//     filePaths = filePaths.map((name) => name.replace(/\\/g, '/'));
//     filePaths.sort(); // Sort files alphanumerically
//
//     // dispatch with patterns from .clsheetsignore
//     const filesToPush: string[] = [];
//     const filesToIgnore: string[] = [];
//     filePaths.forEach(file => {
//       if (multimatch(path.relative(rootDir, file), ignorePatterns, { dot: true }).length === 0) {
//         filesToPush.push(file);
//       } else {
//         filesToIgnore.push(file);
//       }
//     });
//
//     // Check if there are files that will conflict if renamed .gs to .js.
//     // When pushing to Apps Script, these files will overwrite each other.
//     let abortPush = false;
//     filesToPush.forEach((name: string) => {
//       const fileNameWithoutExt = name.slice(0, -path.extname(name).length);
//       if (
//         filesToPush.indexOf(fileNameWithoutExt + '.js') !== -1 &&
//         filesToPush.indexOf(fileNameWithoutExt + '.gs') !== -1
//       ) {
//         // Can't rename, conflicting files
//         abortPush = true;
//         // only print error once (for .gs)
//         if (path.extname(name) === '.gs') {
//           logError(null, ERROR.CONFLICTING_FILE_EXTENSION(fileNameWithoutExt));
//         }
//       }
//     });
//     if (abortPush) return callback(new Error(), null, null);
//
//     const nonIgnoredFilePaths: string[] = [];
//     const ignoredFilePaths = [...filesToIgnore];
//
//     const file2path: Array<{ path: string; file: AppsScriptFile }> = []; // used by `filePushOrder`
//     // Loop through files that are not ignored
//     let files = filesToPush
//       .map((name, i) => {
//         const normalizedName = path.normalize(name);
//
//         let type = getAPIFileType(name);
//
//         // File source
//         let source = fs.readFileSync(name).toString();
//         if (type === 'TS') {
//           // Transpile TypeScript to Google Apps Script
//           // @see github.com/grant/ts2gas
//           source = ts2gas(source, userConf);
//           type = 'SERVER_JS';
//         }
//
//         // Formats rootDir/spreadsheet.json to spreadsheet.json.
//         // Preserves subdirectory names in rootDir
//         // (rootDir/foo/Code.js becomes foo/Code.js)
//         const formattedName = getAppsScriptFileName(rootDir, name);
//
//         // If the file is valid, return the file in a format suited for the Apps Script API.
//         if (isValidFileName(name, type, rootDir, normalizedName, filesToIgnore)) {
//           nonIgnoredFilePaths.push(name);
//           const file: AppsScriptFile = {
//             name: formattedName, // the file base name
//             type, // the file extension
//             source, // the file contents
//           };
//           file2path.push({ file, path: name });  // allow matching of nonIgnoredFilePaths and files arrays
//           return file;
//         } else {
//           ignoredFilePaths.push(name);
//           return; // Skip ignored files
//         }
//       })
//       .filter(Boolean); // remove null values
//
//     // This statement customizes the order in which the files are pushed.
//     // It puts the files in the setting's filePushOrder first.
//     // This is needed because Apps Script blindly executes files in order of creation time.
//     // The Apps Script API updates the creation time of files.
//     if (filePushOrder && filePushOrder.length > 0) { // skip "filePushOrder": []
//       spinner.stop(true);
//       console.log('Detected filePushOrder setting. Pushing these files first:');
//       logFileList(filePushOrder);
//       console.log('');
//       nonIgnoredFilePaths.sort((path1, path2) => {
//         // Get the file order index
//         let path1Index = filePushOrder.indexOf(path1);
//         let path2Index = filePushOrder.indexOf(path2);
//         // If a file path isn't in the filePushOrder array, set the order to +∞.
//         path1Index = path1Index === -1 ? Number.POSITIVE_INFINITY : path1Index;
//         path2Index = path2Index === -1 ? Number.POSITIVE_INFINITY : path2Index;
//         return path1Index - path2Index;
//       });
//       // apply nonIgnoredFilePaths sort order to files
//       files = (files as AppsScriptFile[]).sort((file1, file2) => {
//         // Get the file path from file2path
//         const path1 = file2path.find(e => e.file === file1);
//         const path2 = file2path.find(e => e.file === file2);
//         // If a file path isn't in the nonIgnoredFilePaths array, set the order to +∞.
//         const path1Index = path1 ? nonIgnoredFilePaths.indexOf(path1.path) : Number.POSITIVE_INFINITY;
//         const path2Index = path2 ? nonIgnoredFilePaths.indexOf(path2.path) : Number.POSITIVE_INFINITY;
//         return path1Index - path2Index;
//       });
//     }
//
//     callback(false, [nonIgnoredFilePaths, ignoredFilePaths], files);
//   });
// }
//
// /**
//  * If the file is valid, add it to our file list.
//  * We generally want to allow for all file types, including files in node_modules/.
//  * However, node_modules/@types/ files should be ignored.
//  */
// export function isValidFileName(name: string,
//                                 type: string,
//                                 rootDir: string,
//                                 normalizedName: string,
//                                 ignoreMatches: string[]): boolean {
//   let valid = true; // Valid by default, until proven otherwise.
//   // Has a type or is spreadsheet.json
//   let isValidJSONIfJSON = true;
//   if (type === 'JSON') {
//     isValidJSONIfJSON = rootDir
//       ? normalizedName === path.join(rootDir, PROJECT_MANIFEST_FILENAME)
//       : name === PROJECT_MANIFEST_FILENAME;
//   } else {
//     // Must be SERVER_JS or HTML.
//     // https://developers.google.com/apps-script/api/reference/rest/v1/File
//     valid = type === 'SERVER_JS' || type === 'HTML';
//   }
//   // Prevent node_modules/@types/
//   if (name.includes('node_modules/@types')) {
//     return false;
//   }
//   const validType = type && isValidJSONIfJSON;
//   const notIgnored = !ignoreMatches.includes(name);
//   valid = !!(valid && validType && notIgnored);
//   return valid;
// }
//
// /**
//  * Gets the name of the file for Apps Script.
//  * Formats rootDir/spreadsheet.json to spreadsheet.json.
//  * Preserves subdirectory names in rootDir
//  * (rootDir/foo/Code.js becomes foo/Code.js)
//  * @param {string} rootDir The directory to save the project files to.
//  * @param {string} filePath Path of file that is part of the current project
//  */
// export function getAppsScriptFileName(rootDir: string, filePath: string) {
//   const nameWithoutExt = filePath.slice(0, -path.extname(filePath).length);
//   let fullFilePathNoExt = rootDir ? path.relative(rootDir, nameWithoutExt) : nameWithoutExt;
//   // Replace OS specific path separator to common '/' char
//   fullFilePathNoExt = fullFilePathNoExt.replace(/\\/g, '/');
//   return fullFilePathNoExt;
// }

// noinspection JSCommentMatchesSignature
/**
 * Fetches the spreadsheet from the server
 * @param {string} fileId The spreadsheet file id
 * @returns {SpreadsheetFile} Fetched file
 */
export async function fetchProject(
  fileId: string,
  silent = false,
): Promise<SpreadsheetFile> {
    await checkIfOnline();
    await loadAPICredentials();
    spinner.start();
    let res;
    try {
        res = await sheets.spreadsheets.get({
            spreadsheetId: fileId,
            includeGridData: true
        })
    } catch (error) {
      if (error.code === 404) {
        throw Error(ERROR.FILE_ID_INCORRECT(fileId));
      }
      throw Error(ERROR.FILE_ID);
    }
    spinner.stop(true);
    const data = removeCalculatedData(res.data);
    if (!data.sheets) throw Error(ERROR.FILE_ID_INCORRECT(fileId));
    if (!silent) console.log(LOG.CLONE_SUCCESS(data.sheets.length));
    return data as SpreadsheetFile;
}

function removeCalculatedData(data: Schema$Spreadsheet): Schema$Spreadsheet {
    return {
        dataSources: data.dataSources,
        dataSourceSchedules: data.dataSourceSchedules,
        developerMetadata: data.developerMetadata,
        namedRanges: data.namedRanges,
        properties: data.properties,
        sheets: data.sheets?.map(s => ({
            bandedRanges: s.bandedRanges,
            basicFilter: s.basicFilter,
            charts: s.charts,
            columnGroups: s.columnGroups,
            conditionalFormats: s.conditionalFormats,
            data: s.data?.map(d => ({
                columnMetadata: d.columnMetadata,
                rowData: d.rowData?.map(r => ({
                    values: r.values?.map(v => ({
                        dataSourceFormula: v.dataSourceFormula,
                        dataSourceTable: v.dataSourceTable,
                        dataValidation: v.dataValidation,
                        hyperLink: v.hyperlink,
                        note: v.note,
                        pivotTable: v.pivotTable,
                        textFormatRuns: v.textFormatRuns,
                        userEnteredFormat: v.userEnteredFormat,
                        userEnteredValue: v.userEnteredValue
                    }))
                })),
                rowMetadata: d.rowMetadata,
                startColumn: d.startColumn,
                startRow: d.startRow
            })),
            developerMetadata: s.developerMetadata,
            filterViews: s.filterViews,
            merges: s.merges,
            properties: s.properties,
            protectedRanges: s.protectedRanges,
            rowGroups: s.rowGroups,
            slicers: s.slicers
        })),
        spreadsheetId: data.spreadsheetId,
        spreadsheetUrl: data.spreadsheetUrl
    }
}

/**
 * Writes project locally to `pwd` with dots converted to subdirectories.
 * @param {SpreadsheetFile} data Data to write
 * @param {string?} rootDir The directory to save the project files to. Defaults to `pwd`
 */
export async function writeProject(data: SpreadsheetFile, rootDir = '') {
    const filePath = 'spreadsheet.json';
    const truePath = `${rootDir || '.'}/${filePath}`;
    mkdirp(path.dirname(truePath), err => {
        if (err) logError(err, ERROR.FS_DIR_WRITE);
        fs.writeJSONSync(truePath, data, {spaces: '  '});
    });
}

// /**
//  * Pushes project files to script.google.com.
//  * @param {boolean} silent If true, doesn't console.log any success message.
//  */
// export async function pushFiles(silent = false) {
//   const { scriptId, rootDir } = await getProjectSettings();
//   if (!scriptId) return;
//   // TODO Make getProjectFiles async
//   getProjectFiles(rootDir, async (err, projectFiles, files = []) => {
//     // Check for edge cases.
//     if (err) {
//       spinner.stop(true);
//       logError(err, LOG.PUSH_FAILURE);
//     }
//     if (!projectFiles) {
//       console.log(LOG.PUSH_NO_FILES);
//       return spinner.stop(true);
//     }
//
//     // Start pushing.
//     const [nonIgnoredFilePaths] = projectFiles;
//     const filesForAPI = files as AppsScriptFile[];
//     try {
//       await script.projects.updateContent({
//         scriptId,
//         requestBody: {
//           scriptId,
//           files: filesForAPI,
//         },
//       });
//     } catch (e) {
//       console.error(LOG.PUSH_FAILURE);
//       console.error(e);
//     } finally {
//       if (!silent) spinner.stop(true);
//       // no error
//       if (!silent) {
//         logFileList(nonIgnoredFilePaths);
//         console.log(LOG.PUSH_SUCCESS(nonIgnoredFilePaths.length));
//       }
//     }
//   });
// }
//
// export const logFileList = (files: string[]) => console.log(files.map(file => `└─ ${file}`).join(`\n`));
