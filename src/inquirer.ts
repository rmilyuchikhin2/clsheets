// TODO: Cleanup
// import { script_v1 } from 'googleapis';
import { prompt/*, registerPrompt TODO: Cleanup*/ } from 'inquirer';
// TODO: Cleanup
// import { SCRIPT_TYPES } from './apis';
import { LOG } from './utils';

// TODO: Cleanup
// registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
//
// export type functionNameSource =
//   (answers: { functionName: string }, input?: string | undefined) => Promise<string[]>;
//
// /**
//  * Inquirer prompt for a functionName.
//  * @returns {Promise<{ functionName: string }>} A promise for an object with the `functionName` property.
//  */
// export const functionNamePrompt = (source: functionNameSource) => {
//   const question = {
//     name: 'functionName',
//     message: 'Select a functionName',
//     type: 'autocomplete',
//     source,
//   };
//   return prompt<{ functionName: string }>([question]);
// };
//
// interface DeploymentIdPrompt {
//   name: string;
//   value: script_v1.Schema$Deployment;
// }
//
// /**
//  * Inquirer prompt for a deployment Id.
//  * @param {DeploymentIdPrompt[]} choices An array of `DeploymentIdPrompt` objects.
//  * @returns {Promise<{ deploymentId: string }>} A promise for an object with the `deploymentId` property.
//  */
// export const deploymentIdPrompt = (choices: DeploymentIdPrompt[]) =>
//   prompt<{ deployment: script_v1.Schema$Deployment }>([{
//     choices,
//     message: 'Open which deployment?',
//     name: 'deployment',
//     type: 'list',
//   }]);
//
// /**
//  * Inquirer prompt for a project description.
//  * @returns {Promise<{ description: string }>} A promise for an object with the `description` property.
//  */
// export const descriptionPrompt = () => prompt<{ description: string }>([{
//   default: '',
//   message: LOG.GIVE_DESCRIPTION,
//   name: 'description',
//   type: 'input',
// }]);
//
// export interface PromptAnswers {
//   doAuth: boolean; // in sync with prompt
//   localhost: boolean; // in sync with prompt
// }
//
// /**
//  * Inquirer prompt for oauth scopes.
//  * @returns {Promise<PromptAnswers>} A promise for an object with the `PromptAnswers` interface.
//  */
// export const oauthScopesPrompt = () => prompt<PromptAnswers>([{
//   message: 'Authorize new scopes?',
//   name: 'doAuth',
//   type: 'confirm',
// }, {
//   message: 'Use localhost?',
//   name: 'localhost',
//   type: 'confirm',
//   when: (answers: PromptAnswers) => {
//     return answers.doAuth;
//   },
// }]);
//
// /**
//  * Inquirer prompt for overwriting a manifest.
//  * @returns {Promise<{ overwrite: boolean }>} A promise for an object with the `overwrite` property.
//  */
// export const overwritePrompt = () => prompt<{ overwrite: boolean }>([{
//   default: false,
//   message: 'Manifest file has been updated. Do you want to push and overwrite?',
//   name: 'overwrite',
//   type: 'confirm',
// }]);
//
// /**
//  * Inquirer prompt for project Id.
//  * @returns {Promise<{ projectId: string }>} A promise for an object with the `projectId` property.
//  */
// export const projectIdPrompt = () => prompt<{ projectId: string }>([{
//   message: `${LOG.ASK_PROJECT_ID}`,
//   name: 'projectId',
//   type: 'input',
// }]);

export interface FileIdPrompt {
    // TODO: Cleanup
    // name: string;
    // value: string;
}

// noinspection JSValidateJSDoc
/**
 * Inquirer prompt for file Id.
 * @param {FileIdPrompt[]} fileIds An array of `FileIdPrompt` objects.
 * @returns {Promise<{fileId: string;}>} A promise for an object with the `fileId` property.
 */
export const fileIdPrompt = (fileIds: FileIdPrompt[]) => prompt<{ fileId: string }>([
  {
    choices: fileIds,
    message: LOG.CLONE_FILE_QUESTION,
    name: 'fileId',
    pageSize: 30,
    type: 'list',
  },
]);

// TODO: Cleanup
// /**
//  * Inquirer prompt for script type.
//  * @returns {Promise<{ type: string }>} A promise for an object with the `type` property.
//  */
// export const scriptTypePrompt = () => prompt<{ type: string }>([{
//   choices: Object.keys(SCRIPT_TYPES).map((key) => SCRIPT_TYPES[key as keyof typeof SCRIPT_TYPES]),
//   message: LOG.CREATE_SCRIPT_QUESTION,
//   name: 'type',
//   type: 'list',
// }]);
