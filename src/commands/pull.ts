import { fetchProject, writeProject } from '../files';
import { LOG, checkIfOnline, getProjectSettings, spinner } from '../utils';

/**
 * Force downloads Google Sheets project into the local filesystem.
 */
export default async () => {
  await checkIfOnline();
  const { fileId, rootDir } = await getProjectSettings();
  if (fileId) {
    spinner.setSpinnerTitle(LOG.PULLING);
    const data = await fetchProject(fileId);
    await writeProject(data, rootDir);
  }
};
