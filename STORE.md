# Tour Empire — kiadás az App Store-ba és a Google Playbe

A játék kódja nem változik: a natív burok (Capacitor) ugyanezt az `index.html`-t
tölti be. A **buildeket a GitHub Actions végzi**, tehát a te Windows gépedre nem kell
sem Node, sem Xcode, sem Android Studio.

---

## 0. Amit meg kell venni / létre kell hozni

| | mennyi | hol |
|---|---|---|
| Apple Developer Program | **99 USD / év** | developer.apple.com/programs |
| Google Play Developer | **25 USD egyszer** | play.google.com/console |

Az appazonosító mindkét boltban: **`io.github.tourempire.tourempire`**
(ha mást szeretnél, írd át a `capacitor.config.json`-ban, mielőtt először feltöltesz —
utólag már nem cserélhető).

---

## 1. Android — a gyorsabb út

### 1.1 Teszt-APK azonnal, fiók nélkül
1. GitHub → **Actions** fül → **Android csomag** → **Run workflow**.
2. Amikor lefutott, alul a **tour-empire-android** artifactot töltsd le.
3. A benne lévő `app-debug.apk`-t másold a telefonra és telepítsd
   (Androidon engedélyezni kell az „ismeretlen forrás" telepítést).

Ezzel máris van egy igazi, telepíthető appod — boltok nélkül.

### 1.2 Play Console-ra való csomag (AAB)
Ehhez egy **aláíró kulcstár** kell. Egyszer kell létrehozni, és utána örökre ugyanaz:

- A legegyszerűbb, ha a Play Console-ban bekapcsolod a **Play App Signing**-ot, és
  feltöltő-kulcsot generáltatsz. Ha magad csinálod, bármelyik gépen:
  `keytool -genkey -v -keystore release.keystore -alias tourempire -keyalg RSA -keysize 2048 -validity 10000`

Ezután GitHub → **Settings → Secrets and variables → Actions → New repository secret**:

| titok neve | tartalom |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | a `release.keystore` base64-ben |
| `ANDROID_KEYSTORE_PASSWORD` | a kulcstár jelszava |
| `ANDROID_KEY_ALIAS` | pl. `tourempire` |
| `ANDROID_KEY_PASSWORD` | a kulcs jelszava |

> base64 Windowson: `certutil -encode release.keystore ks.txt`, majd a fájlból a
> `-----BEGIN...` és `-----END...` sorok közti részt másold be.

Ha ezek megvannak, a workflow **AAB-t** is készít — azt kell feltölteni a Play Console
**Production → Create new release** felületén.

---

## 2. iOS — Apple Developer fiókkal

### 2.1 Fordítási próba (fiók nélkül is)
Actions → **iOS csomag** → Run workflow. Titkok nélkül csak azt ellenőrzi, hogy a projekt
lefordul. Ez jelzi, ha valami elromlott a kódban.

### 2.2 Aláírt build + TestFlight

Csak **egy dolgot** kell létrehoznod: egy App Store Connect API-kulcsot. A tanúsítványt
és a provisioning profilt az Xcode a felhőben magától elintézi.

**a) App létrehozása** — App Store Connect → My Apps → **+** → New App
- Platform: iOS · Név: **Tour Empire** · Nyelv: magyar
- Bundle ID: **io.github.tourempire.tourempire**
  (ha nincs a listában: developer.apple.com → Certificates, Identifiers & Profiles →
  Identifiers → **+** → App IDs → App → explicit bundle ID ugyanezzel a névvel)
- SKU: bármi, pl. `tourempire-1`

**b) API-kulcs** — App Store Connect → **Users and Access** → **Integrations** fül →
App Store Connect API → **+**
- Név: `GitHub CI` · Access: **App Manager**
- Létrehozás után **töltsd le a `.p8` fájlt** (CSAK EGYSZER tölthető le!),
  és jegyezd fel a **Key ID**-t és az **Issuer ID**-t.

**c) Titkok a GitHubon** — a repó → **Settings** → **Secrets and variables** →
**Actions** → **New repository secret**. Négy darab:

| titok neve | értéke |
|---|---|
| `IOS_TEAM_ID` | a 10 karakteres Team ID (developer.apple.com → Membership) |
| `ASC_KEY_ID` | a kulcs azonosítója (pl. `2X9ABC3DEF`) |
| `ASC_ISSUER_ID` | az Issuer ID (hosszú, kötőjeles azonosító) |
| `ASC_KEY_P8` | a letöltött `.p8` fájl **teljes tartalma**, a `-----BEGIN PRIVATE KEY-----` sorral együtt (nyisd meg Jegyzettömbbel, jelöld ki mindet, másold be) |

> A titkokat a GitHub felületén add meg — soha ne küldd el őket üzenetben.

**d) Build** — Actions → **iOS csomag** → Run workflow (a *Feltöltés TestFlightbe*
maradjon bekapcsolva). Sikeres futás után az App Store Connect → TestFlight fülön
megjelenik a build; a telefonodra a TestFlight appal telepítheted.

---

## 3. Vásárlások (kötelező mindkét boltban)

A boltok szabályzata szerint digitális tartalmat **csak a saját fizetési rendszerükön**
lehet eladni. A kódban ez már be van kötve (`cordova-plugin-purchase`): a natív appban a
bolt fizet, és a kredit **csak a nyugta ellenőrzése után** íródik jóvá.

Neked ennyi a dolgod: hozd létre a termékeket **pontosan ezekkel az azonosítókkal**.

| termék | típus | ár |
|---|---|---|
| `tourempire.credits.100` | fogyasztható (consumable) | 1,99 € |
| `tourempire.credits.550` | fogyasztható | 7,99 € |
| `tourempire.credits.1200` | fogyasztható | 14,99 € |

- **App Store Connect** → az app → **In-App Purchases** → **+** → Consumable
- **Play Console** → az app → **Monetize** → **Products** → **In-app products**

> Az iOS-nél az első IAP-hoz ki kell tölteni a banki és adóadatokat (Agreements, Tax,
> and Banking), különben a termékek nem lesznek elérhetők a tesztben sem.

---

## 3b. Reklám (AdMob)

**Kész van.** Az AdMob-fiókban létrejött a két app és mindkettőhöz a jutalmazott
hirdetéshely, és az azonosítók már a kódban vannak (`index.html` → `STORE_CFG`):

| | app-azonosító | jutalmazott hirdetéshely |
|---|---|---|
| Android | `ca-app-pub-3564456843298058~4921967806` | `…/7137067609` |
| iOS | `ca-app-pub-3564456843298058~2076312612` | `…/5823985931` |

**A `test: true` szándékosan maradt bekapcsolva.** Fejlesztés közben a saját ÉLES
hirdetésed megnyitása szabálysértés, és a fiók letiltását vonhatja maga után — ezért a
teszt-mód marad, amíg az app ki nem kerül a boltokba. A kiadás **utolsó lépése**:
`test: false`, push, új build.

Két dolog, amit az AdMob még kér, és csak a bolti megjelenés után tudsz megtenni:
- **„Véleményezést igényel"** — az AdMob átnézi az appot, miután összekötötted a bolti
  megjelenéssel. Néhány nap.
- **„Korlátozott hirdetésmegjelenítés — adjon hozzá üzletet"** — amint az app fent van a
  Playen / App Store-ban, az AdMobban az appnál kösd hozzá az üzleti megjelenést
  (Alkalmazás → Üzlet hozzáadása). Ezután indul a teljes hirdetés-kiszolgálás.

Kifizetéshez majd az AdMob → **Kifizetések** alatt kell megadni a banki és adóadatokat
(ezt neked kell, személyes adat).

---

## 4. Amire az Apple review figyelni fog

- **4.2 „minimum functionality"**: a puszta weboldal-burkot elutasítják. A miénk valódi
  játék, offline is elindul, natív ikonnal és indítóképpel — ez a szokásos elvárás.
- **Adatvédelem**: a játék nem gyűjt személyes adatot; az App Privacy kérdőívnél
  „Data Not Collected" a helyes válasz (a névtelen játékstatisztika kikapcsolható).
- **Gyerekek / korhatár**: zenei téma, nincs erőszak — 4+ / PEGI 3 a reális besorolás.
- **Reklám**: jelenleg nincs élő hirdetéshálózat bekötve. Ha bekerül (AdMob), azt a
  kérdőívben jelölni kell.

---

## 5. Mi mit csinál a repóban

| fájl | mi ez |
|---|---|
| `capacitor.config.json` | appazonosító, név, háttérszín, natív beállítások |
| `scripts/build-www.mjs` | a natív csomagba kerülő webes fájlok összeállítása |
| `store-assets/icon.png` | 1024×1024 app-ikon (ebből generálódik minden méret) |
| `store-assets/splash.png` | 2732×2732 indítókép |
| `.github/workflows/android.yml` | Android build |
| `.github/workflows/ios.yml` | iOS build + TestFlight |

A `www/`, `android/`, `ios/` mappákat a CI hozza létre, ezért nincsenek a repóban.
