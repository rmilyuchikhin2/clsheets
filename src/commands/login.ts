/**
 * Clsheets command method bodies.
 */
import { readJsonSync } from 'fs-extra';
import { authorize, getLoggedInEmail } from '../auth';
import { FS_OPTIONS } from '../files';
import { ERROR, LOG, checkIfOnline, hasOauthClientSettings, safeIsOnline } from '../utils';

/**
 * Logs the user in. Saves the client credentials to an either local or global rc file.
 * @param {object} options The login options.
 * @param {boolean?} options.localhost If true, authorizes without a HTTP server.
 * @param {string?} options.creds The location of credentials file.
 * @param {boolean?} options.status If true, prints who is logged in instead of doing login.
 */
export default async (options: { localhost?: boolean; creds?: string; status?: boolean }) => {
    if (options.status) {
        if (hasOauthClientSettings()) {
            const email = (await safeIsOnline()) ? await getLoggedInEmail() : undefined;

            if (!!email) {
              console.log(LOG.LOGGED_IN_AS(email));
            } else {
              throw new Error('Not implemented: e9431a40-6e0a-4f96-bbe4-1c28fe23a573'); // TODO: Cleanup
              // console.log(LOG.LOGGED_IN_UNKNOWN);
            }
        } else {
            console.log(LOG.NOT_LOGGED_IN);
        }

        process.exit(0);
    } else {
        // Local vs global checks
        const isLocalLogin = !!options.creds;
        const loggedInLocal = hasOauthClientSettings(true);
        const loggedInGlobal = hasOauthClientSettings(false);
        if (isLocalLogin && loggedInLocal) console.error(ERROR.LOGGED_IN_LOCAL);
        if (!isLocalLogin && loggedInGlobal) console.error(ERROR.LOGGED_IN_GLOBAL);
        console.log(LOG.LOGIN(isLocalLogin));
        await checkIfOnline();

        // Localhost check
        const useLocalhost = !!options.localhost;

        // Using own credentials.
        if (options.creds) {
            const oauthScopes = [
                // Use the default scopes needed for clsheets.
                'https://www.googleapis.com/auth/userinfo.email', // User email address
                // TODO: Cleanup
                // 'https://www.googleapis.com/auth/userinfo.profile',
            ];
            console.log('');
            console.log(`Authorizing with the following scopes:`);
            oauthScopes.forEach(scope => {
                console.log(scope);
            });

            // Read credentials file.
            const credentials = readJsonSync(options.creds, FS_OPTIONS);
            await authorize({
                useLocalhost,
                creds: credentials,
                scopes: oauthScopes,
            });
        } else {
            // Not using own credentials
            await authorize({
                useLocalhost,
                scopes: [
                    // Use the default scopes needed for clsheets.
                    'https://www.googleapis.com/auth/userinfo.email', // User email address
                    // TODO: Cleanup
                    // 'https://www.googleapis.com/auth/userinfo.profile',
                ],
            });
        }
        process.exit(0); // gracefully exit after successful login
    }
};
