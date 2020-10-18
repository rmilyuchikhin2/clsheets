import { drive, loadAPICredentials/*, script TODO: Cleanup*/ } from '../auth';
import { fetchProject,  hasProject, writeProject } from '../files';
import { manifestExists } from '../manifest';
import {
    ERROR,
    LOG,
    checkIfOnline,
    getDefaultProjectName,
    logError,
    saveProject,
    spinner,
} from '../utils';

/**
 * Creates a new Google Sheets file.
 * @param cmd.title {string} The title of the spreadsheet file
 * @param cmd.folderId {string} The Drive ID of the G Suite folder where the file is created.
 * @param cmd.rootDir {string} Specifies the local directory in which clsheets will store your project files.
 *                    If not specified, clsheets will default to the current directory.
 */
export default async (cmd: { title: string; folderId: string; rootDir: string }) => {
    // Handle common errors.
    await checkIfOnline();
    if (hasProject()) logError(null, ERROR.FOLDER_EXISTS);
    await loadAPICredentials();

    // Create defaults.
    const title = cmd.title || getDefaultProjectName();
    let { folderId } = cmd;

    // Create files with MIME type.
    // https://developers.google.com/drive/api/v3/mime-types
    const driveFileType = 'application/vnd.google-apps.spreadsheet';
    spinner.setSpinnerTitle(LOG.CREATE_DRIVE_FILE_START).start();
    const driveFile = await drive.files.create({
        requestBody: {
            mimeType: driveFileType,
            name: title,
            parents: [folderId]
        },
    });
    const fileId = driveFile.data.id || '';
    spinner.stop(true);
    console.log(LOG.CREATE_DRIVE_FILE_FINISH(fileId));

    const rootDir = cmd.rootDir;
    saveProject(
      {
        fileId: fileId,
        rootDir,
      }
    );
  if (!manifestExists(rootDir)) {
      const data = await fetchProject(fileId); // fetches spreadsheet.json, o.w. `push` breaks
      writeProject(data, rootDir); // fetches spreadsheet.json, o.w. `push` breaks
  }
};
