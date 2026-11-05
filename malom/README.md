# Malom Aréna

Online multiplayer malom (Nine Men's Morris) saját tervezésű figurákkal.

- **Online két játékos**: szoba 6 karakteres kóddal vagy linkkel, valós idejű lépések, újracsatlakozás, emoji-reakciók, visszavágó
- **Gép ellen, 0–3000 Élő**: csúszkával állítható erősség (kezdőtől nagymesterig), a gép külön szálon gondolkodik; a legerősebb legyőzött gépet megjegyzi
- **Két játékos egy gépen**, visszavonással
- **66 illusztrált figura, 4 kategóriában**: Fantázia (8), Állatok (13), Országok (26 zászló), Foci (18 mez + labda)
- **Állítható figurakeret**: szín (8 alapszín, a játékos színe vagy bármilyen saját szín), vastagság (0–12, 0 = keret nélkül) és fényesség, élő előnézettel a figuráknál és a beállításokban. Ha a két játékos ugyanazt a figurát választja, a táblán a keretük piros és kék lesz
- **Magyar és angol nyelv**: HU/EN váltó a fejlécben és játék közben is; első indításkor a böngésző nyelvét követi
- **11 tábla-design**: Diófa, Márvány, Neon, Kaszinó filc, Kincses térkép, Jégmező, Vulkán, Királyi bársony, Zen kert, Retro pixel, Galaxis
- **Hangok**: 12 hangstílus (Alap, Fa és marimba, Retro 8-bit, Sci-fi, Varázslat, Rajzfilm, Minimál, Zongora, Ütős dobok, Üveg és kristály, Elektro, Természet), eseményenként külön hangerő és stílus, fő hangerő, némítás
- **Háttérzene**: Nyugodt zongora, Arcade, Űrbeli ambient, Középkori kocsma, külön hangerővel
- Kidolgozott nyitóoldal: lebegő figurák (rájuk kattintva választasz), figura-szalag, játékmódok, táblaválasztó, animált szabály-ábrák
- Mobilbarát, billentyűzettel is irányítható (nyilak, Enter); a szerver ellenőrzi minden lépés szabályosságát

## Indítás a gépeden (Windows)

Kell hozzá: [Node.js](https://nodejs.org) (LTS). Telepítés PowerShellben: `winget install OpenJS.NodeJS.LTS`

```powershell
cd C:\jatek\malom
npm.cmd install
npm.cmd start
```

Ezután nyisd meg a böngészőben: **http://localhost:3000**

### Automatikus frissítés a GitHubról

```powershell
npm.cmd run live
```

Ugyanúgy elindítja a játékot, de 10 másodpercenként lefuttatja a `git pull`-t is. Ha új változás érkezik a GitHubra, magától letölti (és ha kell, újraindítja a szervert). Neked csak a böngészőt kell frissítened (Ctrl+F5). Leállítás: Ctrl+C.

A multiplayert úgy tudod kipróbálni, hogy két böngészőablakot nyitsz. Az egyikben az „Új online játék”, a másikban a kapott link.
Ha ugyanazon a wifin lévő telefonról akarsz csatlakozni, használd a PC helyi IP-címét (pl. `http://192.168.1.23:3000`). Ehhez lehet, hogy a Windows tűzfalon engedélyezni kell a Node.js-t.

## Feltöltés privát GitHub repóba

```powershell
cd C:\jatek\malom
git init
git add .
git commit -m "Malom Aréna első verzió"
gh repo create malom --private --source . --push
```

## Online elérhetővé tétel (Render, ingyenes csomag)

A beállítás a repó gyökerében lévő `render.yaml` fájlban van (frankfurti szerver, a `malom` mappából indul).

1. Regisztrálj a [render.com](https://render.com) oldalon a GitHub-fiókoddal.
2. **New → Blueprint**, válaszd ki a `malomjatek` repót (ha nem látod: *Configure GitHub* → adj hozzáférést a repóhoz), majd **Deploy Blueprint**.
3. Pár perc múlva a **malom-arena** szolgáltatás oldalán, fent megjelenik a cím (`https://malom-arena….onrender.com`). Ezt küldheted a barátaidnak.

Minden új feltöltés (push a `main` ágra) után a Render magától frissíti az oldalt.

Az ingyenes csomagon a szerver 15 perc tétlenség után elalszik, és az első betöltés kb. egy percig tart. A szobák a memóriában vannak, ezért szerver-újraindításkor (és frissítéskor) elvesznek.

## Focimezek és jogok

A valódi klubnevek és címerek a klubok bejegyzett védjegyei, licenc nélkül nem használhatók (pl. a Manchester United 2020-ban perelte a Football Manager készítőit a klubnév miatt). Ezért a mezek, a licenc nélküli csapatokat szerepeltető focis játékokhoz hasonlóan, csak a várost és a színeket írják le (pl. „Katalán Kék-gránátok”), címert nem használnak. Ha a játékot pénzért terjesztenéd, kérj előtte jogi tanácsot.

## Betűtípusok

A Bricolage Grotesque betűtípus a `public/fonts` mappából, helyben töltődik be (SIL Open Font License 1.1).

## Fájlok

| Fájl | Mit csinál |
|---|---|
| `server.js` | Express + Socket.IO szerver, szobák kezelése |
| `auto-pull.js` | Fejlesztői indító (`npm.cmd run live`): futtatja a szervert, és magától lehúzza a GitHubról a változásokat |
| `shared/engine.js` | A malom teljes szabályrendszere (szerver és böngésző is ezt használja) |
| `shared/ai.js` | Gépi ellenfél (Élő 0–3000) |
| `public/ai-worker.js` | A gép külön szálon számol, hogy a felület ne akadjon |
| `public/index.html`, `style.css`, `app.js` | A weboldal és a játék felülete |
| `public/skins.js` | A 66 figura SVG-rajza (magyar és angol névvel) |
| `public/i18n.js` | Magyar és angol fordítások |
| `public/sound.js` | 12 hangstílus × 10 esemény + háttérzene (WebAudio, nincs hangfájl) |
| `test/` | Szabály-, multiplayer- és böngészőtesztek |

Szabályteszt futtatása: `npm.cmd test`
