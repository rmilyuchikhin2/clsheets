import { FILE_ID_LENGTH } from './apis';

/**
 * Extracts fileId from URL if given in URL form.
 * @param fileId {string} either a scriptId or URL containing the fileId
 * @example
 * extractFileId(
 * 'https://docs.google.com/spreadsheets/d/1Ng7bNZ1K95wNi2H7IUwZzM68FL6ffxQhyc_ByV42zpS6qAFX8pFsWu2I/edit#gid=0'
 * )
 * returns '1Ng7bNZ1K95wNi2H7IUwZzM68FL6ffxQhyc_ByV42zpS6qAFX8pFsWu2I'
 * @example
 * extractScriptId('1Ng7bNZ1K95wNi2H7IUwZzM68FL6ffxQhyc_ByV42zpS6qAFX8pFsWu2I')
 * returns '1Ng7bNZ1K95wNi2H7IUwZzM68FL6ffxQhyc_ByV42zpS6qAFX8pFsWu2I'
 */
export const extractFileId = (fileId: string) => {
    if (fileId.length !== FILE_ID_LENGTH) {
        const ids = fileId.split('/').filter(s => {
          return s.length === FILE_ID_LENGTH;
        });
        if (ids.length) {
            fileId = ids[0];
        }
    }
    return fileId;
};

// Helpers to get Apps Script project URLs
export const URL = {
    // TODO: Cleanup
    // APIS: (projectId: string) => `https://console.developers.google.com/apis/dashboard?project=${projectId}`,
    CREDS: (projectId: string) => `https://console.developers.google.com/apis/credentials?project=${projectId}`,
    // TODO: Cleanup
    // LOGS: (projectId: string) =>
    //   `https://console.cloud.google.com/logs/viewer?project=${projectId}&resource=app_script_function`,
    // SCRIPT_API_USER: 'https://script.google.com/home/usersettings',
    // // It is too expensive to get the script URL from the Drive API. (Async/not offline)
    // SCRIPT: (scriptId: string) => `https://script.google.com/d/${scriptId}/edit`,
    DRIVE: (driveId: string) => `https://drive.google.com/open?id=${driveId}`,
};
