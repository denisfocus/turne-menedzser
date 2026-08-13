/* Natív projektek kiegészítése a `cap add` után.
   Az AdMob megköveteli, hogy az alkalmazás-azonosító a natív manifestben legyen —
   ezt a Capacitor nem tudja a JS-ből, ezért itt írjuk bele. Az azonosítók az
   index.html STORE_CFG blokkjából jönnek, hogy egy helyen legyenek. */
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const html = await readFile('index.html', 'utf8');
const pick = (key) => {
  const m = html.match(new RegExp(key + "\\s*:\\s*'([^']+)'"));
  return m ? m[1] : null;
};
const ANDROID_APP_ID = pick('appIdAndroid');
const IOS_APP_ID = pick('appIdIos');
if (!ANDROID_APP_ID || !IOS_APP_ID) throw new Error('Nem találom az AdMob azonosítókat az index.html-ben');

/* ---------- Android ---------- */
const MANIFEST = 'android/app/src/main/AndroidManifest.xml';
if (existsSync(MANIFEST)) {
  let m = await readFile(MANIFEST, 'utf8');
  if (!m.includes('com.google.android.gms.ads.APPLICATION_ID')) {
    m = m.replace('</application>',
      `    <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="${ANDROID_APP_ID}"/>\n    </application>`);
    await writeFile(MANIFEST, m);
    console.log('Android: AdMob azonosító beírva');
  }
}

/* Az AdMob (Google Play Services) compileSdk 35-öt követel, a Capacitor 34-et
   generál — ezért itt emeljük. A Play amúgy is targetSdk 35-öt vár az új appoktól. */
const VARS = 'android/variables.gradle';
if (existsSync(VARS)) {
  let v = await readFile(VARS, 'utf8');
  const before = v;
  v = v.replace(/compileSdkVersion\s*=\s*\d+/, 'compileSdkVersion = 35')
       .replace(/targetSdkVersion\s*=\s*\d+/, 'targetSdkVersion = 35');
  if (v !== before) {
    await writeFile(VARS, v);
    console.log('Android: compileSdk/targetSdk 35');
  }
}

/* ---------- iOS ---------- */
const PLIST = 'ios/App/App/Info.plist';
if (existsSync(PLIST)) {
  let p = await readFile(PLIST, 'utf8');
  if (!p.includes('GADApplicationIdentifier')) {
    p = p.replace('</dict>\n</plist>',
      `\t<key>GADApplicationIdentifier</key>\n\t<string>${IOS_APP_ID}</string>\n</dict>\n</plist>`);
    await writeFile(PLIST, p);
    console.log('iOS: AdMob azonosító beírva');
  }
}
