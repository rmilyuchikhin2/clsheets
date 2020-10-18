import { drive, loadAPICredentials } from '../auth';
import { fetchProject, hasProject, writeProject } from '../files';
import { FileIdPrompt, fileIdPrompt } from '../inquirer';
import { extractFileId } from '../urls';
import { ERROR, LOG, checkIfOnline, logError, saveProject, spinner } from '../utils';

// noinspection JSCommentMatchesSignature
/**
 * Fetches a Google Sheets.
 * Prompts the user if no file ID is provided.
 * @param fileId {string} The Google Sheets file ID or file URL to fetch.
 * @param cmd.rootDir {string} Specifies the local directory in which clsheets will store your project files.
 *                    If not specified, clsheets will default to the current directory.
 */
export default async (fileId: string, cmd: { rootDir: string }) => {
    await checkIfOnline();
    if (hasProject()) logError(null, ERROR.FOLDER_EXISTS);
    fileId = fileId ? extractFileId(fileId) : await getScriptId();
    spinner.setSpinnerTitle(LOG.CLONING);
    const rootDir = cmd.rootDir;
    saveProject({ fileId, rootDir });
    const data = await fetchProject(fileId);
    await writeProject(data, rootDir);
};

/**
 * Lists a user's Google Sheets files and prompts them to choose one to clone.
 */
const getScriptId = async () => {
    await loadAPICredentials();
    const list = await drive.files.list({
      // pageSize: 10,
      // fields: 'files(id, name)',
      orderBy: 'modifiedByMeTime desc',
      q: 'mimeType="application/vnd.google-apps.spreadsheet"',
    });
    const data = list.data;
    if (!data) logError(list.statusText, 'Unable to use the Drive API.');
    const files = data.files;
    if (files && files.length) {
        const fileIds: FileIdPrompt[] = files.map(file => ({
            name: `${file.name!.padEnd(20)} – ${LOG.FILE_LINK(file.id || '')}`,
            value: file.id || '',
        }));
        const answers = await fileIdPrompt(fileIds);
        return answers.fileId;
    }
    return logError(null, LOG.FINDING_FILES_DNE);
};
