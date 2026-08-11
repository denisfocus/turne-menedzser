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

Az appazonosító mindkét boltban: **`com.denisfocus.tourempire`**
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
Az Apple Developer fiók után az **App Store Connect**-ben hozd létre az appot
(`com.denisfocus.tourempire`), majd:

| titok neve | honnan |
|---|---|
| `IOS_CERT_P12_BASE64` | Apple Distribution tanúsítvány `.p12`-ként, base64-ben |
| `IOS_CERT_PASSWORD` | a `.p12` jelszava |
| `IOS_PROVISIONING_PROFILE_BASE64` | App Store provisioning profil, base64-ben |
| `IOS_TEAM_ID` | 10 karakteres Team ID (Membership oldal) |
| `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8_BASE64` | App Store Connect API-kulcs (Users and Access → Integrations) |

Ezután Actions → iOS csomag → **upload_testflight: true** → a build felkerül a
TestFlightbe, ahonnan a telefonodra telepítheted, és onnan indítható a review.

---

## 3. Vásárlások (kötelező mindkét boltban)

A boltok szabályzata szerint digitális tartalmat **csak a saját fizetési rendszerükön**
lehet eladni. A kreditcsomagokat ezért ezekkel az azonosítókkal kell létrehozni
(App Store Connect → In-App Purchases, Play Console → Monetize → Products):

| termék | típus | ár |
|---|---|---|
| `tourempire.credits.100` | fogyasztható (consumable) | 1,99 € |
| `tourempire.credits.550` | fogyasztható | 7,99 € |
| `tourempire.credits.1200` | fogyasztható | 14,99 € |

A kódban a `Store.buy()` már natív-tudatos: ha a burokban van vásárlás-plugin, azon
keresztül fizet; addig a fejlesztői ág fut. A plugin bekötése az utolsó lépés, amikor
a termékek már léteznek a boltokban.

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
