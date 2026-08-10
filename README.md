# Turné Menedzser

Magyar nyelvű turné-menedzser szimulátor mobiljáték. Előadókat igazolsz le, világkörüli
turnékat tervezel (setlist, útvonal, helyszín, jegyár, promóció), a turné pedig valós
időben zajlik le — váratlan eseményekkel, amelyeknél döntened kell.

**Játék:** https://denisfocus.github.io/turne-menedzser/

Egyetlen önálló `index.html` (vanilla JS, keretrendszer nélkül). A mentés a böngésző
`localStorage`-ában van, tehát a telefonodon folytatódik ott, ahol abbahagytad.

## Telepítés a telefonra

A játék PWA, tehát appként a kezdőképernyőre tehető — saját ikonnal, böngésző-sáv nélkül.

- **iPhone / iPad (Safari):** nyisd meg a linket → **Megosztás** → **Kezdőképernyőhöz adás**.
- **Android (Chrome):** nyisd meg a linket → a felugró **Telepítés** sávra koppints,
  vagy a ⋮ menüből **Alkalmazás telepítése**.

Telepítés után offline is elindul (az app-héj gyorsítótárazott); a térkép és a fotók
továbbra is netkapcsolatot igényelnek.

Külső források: Leaflet + CARTO (térkép), LoremFlickr (fotók), Fontshare (betűk),
game-icons.net (ikonok, `icons.js`).
