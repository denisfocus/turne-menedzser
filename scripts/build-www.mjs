/* Tour Empire — a natív csomagba kerülő webes fájlok összeállítása.
   A repó gyökere egyben a GitHub Pages oldal is, ezért a Capacitor NEM
   közvetlenül a gyökeret használja (az önmagát másolná a natív projektekbe),
   hanem ez a szkript másolja a szükséges fájlokat a www/ mappába.

   Ami NEM kerül bele: sw.js és manifest (natív appban felesleges és zavaró),
   valamint minden fejlesztői/jegyzet fájl. */
import { mkdir, rm, cp, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const OUT = join(ROOT, 'www');

const FILES = ['index.html', 'icons.js'];
const DIRS = ['assets', 'icons'];

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

for (const f of FILES) {
  if (!existsSync(join(ROOT, f))) throw new Error('Hiányzó fájl: ' + f);
  await cp(join(ROOT, f), join(OUT, f));
}
for (const d of DIRS) {
  if (existsSync(join(ROOT, d))) await cp(join(ROOT, d), join(OUT, d), { recursive: true });
}

/* A natív buroknál nincs service worker és nincs webmanifest: a hivatkozásokat
   kivesszük, hogy a WebView ne próbálja betölteni őket. A játék kódja `NATIVE`
   alapján egyébként is kihagyja a regisztrációt. */
let html = await readFile(join(OUT, 'index.html'), 'utf8');
html = html.replace('<link rel="manifest" href="manifest.webmanifest">', '<!-- natív buroknál nincs manifest -->');
await writeFile(join(OUT, 'index.html'), html);

console.log('www/ kész — ' + [...FILES, ...DIRS].join(', '));
