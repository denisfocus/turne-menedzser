/* Aláírás bekötése az Android release buildbe.
   Csak akkor fut, ha a workflow megkapta a kulcstár-titkokat. */
import { readFile, writeFile, appendFile } from 'node:fs/promises';

const GRADLE = 'android/app/build.gradle';
let s = await readFile(GRADLE, 'utf8');

if (!s.includes('signingConfigs')) {
  s = s.replace('android {', `android {
    signingConfigs {
        release {
            if (project.hasProperty('RELEASE_STORE_FILE')) {
                storeFile file(RELEASE_STORE_FILE)
                storePassword RELEASE_STORE_PASSWORD
                keyAlias RELEASE_KEY_ALIAS
                keyPassword RELEASE_KEY_PASSWORD
            }
        }
    }`);
  s = s.replace('buildTypes {', `buildTypes {
        release {
            signingConfig signingConfigs.release
        }`);
  await writeFile(GRADLE, s);
}

await appendFile('android/gradle.properties', `
RELEASE_STORE_FILE=release.keystore
RELEASE_STORE_PASSWORD=${process.env.KS_PASSWORD || ''}
RELEASE_KEY_ALIAS=${process.env.KEY_ALIAS || ''}
RELEASE_KEY_PASSWORD=${process.env.KEY_PASSWORD || ''}
`);

console.log('Android aláírás bekötve.');
