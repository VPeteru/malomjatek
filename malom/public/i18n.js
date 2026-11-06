/* Magyar / angol fordítások. A HTML-ben data-i18n (szöveg), data-i18n-ph (placeholder),
   data-i18n-aria (aria-label) és data-i18n-title (title) attribútumok jelölik a lefordítandó részeket. */
(function () {
  'use strict';

  const D = {
    hu: {
      'doc.title': 'Malom Aréna',
      'nav.modes': 'Játékmódok', 'nav.figures': 'Figurák', 'nav.boards': 'Táblák', 'nav.rules': 'Szabályok',
      'nav.parts': 'Oldal részei', 'nav.top': 'Malom Aréna, az oldal teteje', 'lang.group': 'Nyelv',
      'settings.open': 'Tábla és hang beállításai', 'settings.title': 'Beállítások',
      'hero.lede': 'A kétezer éves táblajáték új köntösben. Hívd meg a barátodat egy kóddal, mérd össze magad egy 0 és 3000 Élő közötti géppel, és zárj malmot a kedvenc figuráiddal.',
      'hero.friends': 'Játék barátokkal', 'hero.quick': 'Gyors játék',
      'field.name': 'A neved', 'field.namePh': 'pl. Péter',
      'my.figure': 'A figurád', 'my.change': 'Csere',
      'btn.create': 'Új online játék', 'btn.join': 'Csatlakozás kóddal', 'btn.ai': 'Gép ellen', 'btn.local': 'Két játékos egy gépen',
      'hero.aiNote': 'Állítsd be a gép erejét 0 és 3000 Élő között.', 'hero.localNote': 'Egy képernyőn, felváltva.',
      'modes.title': 'Három út a malomhoz',
      'modes.online.h': 'Online, a barátod ellen',
      'modes.online.p': 'Nem kell regisztráció. Nyiss egy szobát, és a kódot vagy a linket küldd el annak, akit kihívsz.',
      'modes.step1': 'Nyiss egy szobát', 'modes.step2': 'Küldd el a linket', 'modes.step3': 'A lépések élőben mennek át',
      'modes.online.mini': 'Ha megszakad a net, ugyanabba a székbe ülsz vissza. Van emoji-reakció és visszavágó.',
      'modes.online.btn': 'Szoba nyitása',
      'modes.ai.h': 'Gép ellen, 0 és 3000 Élő között',
      'modes.ai.p': 'A kezdő gép még elnézi a malmokat, a nagymester kilenc lépés mélyen számol. Te döntöd el, mekkora a kihívás.',
      'modes.ai.btn': 'Kihívom a gépet',
      'modes.local.h': 'Két játékos, egy képernyő',
      'modes.local.p': 'Egy tablet a kanapén vagy egy laptop a konyhaasztalon. Felváltva léptek, és visszavonni is lehet.',
      'modes.local.btn': 'Indítás egy gépen',
      'elo.t0': 'Kezdő', 'elo.t1': 'Haladó', 'elo.t2': 'Mester', 'elo.t3': 'Nagymester',
      'figures.title': '{n} figura, négy világból',
      'figures.sub': 'Fantázialények, állatok, országzászlók és focimezek. A keret színét, vastagságát és fényességét te állítod be. Ha a két játékos ugyanazt a figurát választja, a táblán a keretük piros és kék lesz.',
      'frames.title': 'Figurakeret', 'boards.heading': 'Tábla',
      'frame.color': 'Szín', 'frame.width': 'Vastagság', 'frame.sheen': 'Fényesség', 'frame.player': 'A játékos színe (piros / kék)', 'frame.custom': 'Saját szín', 'frame.reset': 'Alaphelyzet', 'frame.none': 'nincs',
      'boards.title': '11 tábla, egy kattintás',
      'boards.sub': 'A választott tábla azonnal megjelenik fent és a játékban is. A hangokat és a háttérzenét a beállításokban hangolhatod.',
      'rules.title': 'Így megy a malom',
      'rules.place.h': 'Lerakás', 'rules.place.p': 'Felváltva leraktok 9-9 bábut a tábla üres pontjaira.',
      'rules.move.h': 'Mozgatás', 'rules.move.p': 'Ha elfogyott a kezedből, a vonal mentén a szomszédos üres pontra tolod a bábut.',
      'rules.fly.h': 'Ugrás', 'rules.fly.p': 'Ha már csak 3 bábud maradt, bármelyik üres pontra ugorhatsz.',
      'rules.mill.h': 'Malom', 'rules.mill.p1': 'Három saját bábu egy vonalban. Ilyenkor levehetsz egy ellenfél-bábut, de malomban állót csak akkor, ha nincs más.',
      'rules.mill.p2': 'Az veszít, akinek 2 bábuja marad, vagy nem tud lépni.',
      'foot.p': 'Egy kétezer éves játék, újragondolva. Böngészőben fut, telepíteni nem kell.', 'foot.nav': 'Lábléc',
      'lobby.title': 'Várunk az ellenfeledre', 'lobby.p': 'Küldd el neki a kódot vagy a linket.',
      'lobby.copyLink': 'Link másolása', 'lobby.copyCode': 'Kód másolása',
      'lobby.hint': 'Tesztelni is tudod: nyisd meg a linket egy másik böngészőablakban.', 'lobby.back': 'Vissza a főmenübe',
      'game.menu': 'Vissza a főmenübe', 'game.menuTitle': 'Főmenü', 'game.board': 'Malom tábla',
      'game.undo': 'Visszavonás', 'btn.resign': 'Feladom', 'sound.mute': 'Hang némítása', 'sound.toggle': 'Hang ki/be',
      'join.title': 'Csatlakozás szobához', 'join.code': 'Szobakód', 'join.codePh': 'pl. K7P2QX',
      'btn.cancel': 'Mégse', 'btn.join2': 'Csatlakozom', 'btn.start': 'Kezdjük', 'btn.launch': 'Indítás', 'btn.close': 'Bezárás',
      'p2.title': 'Második játékos', 'p2.name': 'Neve', 'p2.namePh': 'pl. Anna', 'p2.figs': 'Második játékos figurái',
      'ai.title': 'Milyen erős legyen a gép?', 'ai.range': 'A gép Élő-pontszáma', 'ai.first': 'A gép kezdjen',
      'tab.board': 'Tábla', 'tab.sound': 'Hang', 'boards.aria': 'Tábla designja',
      'snd.master': 'Fő hangerő', 'snd.muteAll': 'Némítás', 'snd.music': 'Háttérzene', 'snd.musicVol': 'Zene hangereje',
      'snd.style': 'Hangstílus', 'snd.styleSub': 'Ez minden eseményre érvényes, kivéve azokat, amelyeknek lent saját stílust adsz.',
      'snd.events': 'Események egyenként', 'snd.reset': 'Hangbeállítások visszaállítása',
      'snd.shared': 'Közös: {name}', 'snd.play': '{ev} meghallgatása', 'snd.preview': 'Meghallgatás', 'snd.evStyle': '{ev} hangja', 'snd.evVol': '{ev} hangereje',
      'btn.menu': 'Főmenü', 'btn.rematch': 'Visszavágó', 'btn.waitingOpp': 'Várunk az ellenfélre…', 'btn.acceptRematch': 'Elfogadom a visszavágót',
      'mode.online': 'Online szoba · {code}', 'mode.ai': 'Gép ellen · {elo} Élő ({label})', 'mode.local': 'Két játékos egy gépen',
      'pl.waiting': 'Várakozás…', 'pl.notJoined': 'Még nem csatlakozott',
      'tag.you': 'Te', 'tag.opp': 'Ellenfél', 'tag.dc': 'Kapcsolat megszakadt', 'tag.cpu': 'Gép',
      'pl.wins': 'Győzelmek', 'pl.onBoard': 'Táblán', 'pl.lost': 'Levett tőle', 'pl.inHand': 'Kézben {n} bábu', 'pl.allPlaced': 'Minden bábu a táblán',
      'st.waitOpp': 'Várakozás az ellenfélre…', 'st.draw': 'Döntetlen', 'st.won': '{name} nyert!',
      'st.cpuThinking': 'A gép gondolkodik…', 'st.oppMoves': '{name} lép…',
      'st.mill': 'Malom! Vegyél le egy ellenfél-bábut.', 'st.place': 'rakj le egy bábut (még {n} van a kezedben).',
      'st.fly': 'már csak 3 bábud van, bármelyik üres pontra ugorhatsz.', 'st.select': 'válassz ki egy bábut, amit mozgatsz.',
      'st.target': 'hová lépjen? Kattints egy kiemelt pontra.', 'st.yourTurn': 'Te jössz: ',
      'toast.cantRemove': 'Ezt a bábut most nem veheted le.', 'toast.noMoves': 'Ennek a bábunak nincs szabad szomszédja.',
      'toast.moveFailed': 'A lépés nem sikerült.', 'resign.confirm': 'Biztos? Kattints újra',
      'end.pieces': '{l} bábuinak száma 3 alá csökkent.', 'end.blocked': '{l} nem tud szabályosan lépni.', 'end.resign': '{l} feladta a játszmát.',
      'end.repetition': 'Ugyanaz az állás háromszor ismétlődött.', 'end.nocapture': '50 lépés telt el ütés nélkül.',
      'end.youWon': 'Nyertél!', 'end.cpuWon': 'A gép nyert', 'end.xWon': '{name} nyert', 'end.record': 'Nyertél! Új csúcs!',
      'toast.noOnline': 'Az online mód ehhez a szerverhez nem érhető el.', 'toast.roomGone': 'A szoba megszűnt.',
      'toast.reconnecting': 'Megszakadt a kapcsolat, újracsatlakozás…', 'toast.createFailed': 'Nem sikerült szobát nyitni.',
      'player': 'Játékos', 'player2': 'Játékos 2', 'copy.prompt': 'Másold ki:',
      'toast.linkCopied': 'Link a vágólapon. Küldd el az ellenfelednek!', 'toast.codeCopied': 'Kód a vágólapon.',
      'join.codeLen': 'A kód 6 karakterből áll.', 'react.aria': 'Reakció: {e}',
      'elo.d0': 'Gyakran véletlenszerűen lép, a malmokat is elnézi. Ideális az első játszmákhoz.',
      'elo.d1': 'Észreveszi a kézenfekvő malmokat, de még sokat hibázik.',
      'elo.d2': 'Kb. {d} lépésig előre gondolkodik, néha rosszul mérlegel.',
      'elo.d3': '{d} lépés mélyen számol, ritkán téved.',
      'elo.d4': '{d} lépés mélyen számol, és nem hibázik. Komoly kihívás.',
      'elo.best': 'Eddig a legerősebb legyőzött gép: {n} Élő', 'cpu.name': 'Gép ({n})',
      'elo.l0': 'Kezdő', 'elo.l1': 'Hobbijátékos', 'elo.l2': 'Haladó', 'elo.l3': 'Klubjátékos', 'elo.l4': 'Mester', 'elo.l5': 'Nemzetközi mester', 'elo.l6': 'Nagymester',
      'elo.unit': 'Élő',
      'toast.picked': 'Mostantól ezzel játszol: {name}',
      'home.best': 'A te csúcsod eddig: {n} Élős gépet győztél le.', 'home.aiCurrent': 'Legutóbb: {n} Élő · {label}',
      'toast.invited': 'Meghívtak egy játékra! Válassz figurát, aztán csatlakozz.',
      'err.no_room': 'Nincs ilyen szoba. Ellenőrizd a kódot!', 'err.room_full': 'A szoba már tele van.',
      'err.not_in_room': 'Nem vagy szobában.', 'err.room_gone': 'A szoba megszűnt.', 'err.wait_opp': 'Várj, amíg az ellenfeled csatlakozik.',
      'err.not_turn': 'Nem te következel.', 'err.illegal': 'Szabálytalan lépés.',
      'toast.joined': '{name} csatlakozott! Indulhat a játék.', 'toast.rematch': 'Visszavágó! Most a másik játékos kezd.',
      'pick.aria': 'Figura választása',
      'theme.fa': 'Diófa', 'theme.marvany': 'Márvány', 'theme.neon': 'Neon', 'theme.filc': 'Kaszinó filc', 'theme.pergamen': 'Kincses térkép',
      'theme.jeg': 'Jégmező', 'theme.lava': 'Vulkán', 'theme.kiralyi': 'Királyi bársony', 'theme.homok': 'Zen kert', 'theme.pixel': 'Retro pixel', 'theme.ur': 'Galaxis'
    },
    en: {
      'doc.title': 'Malom Arena — Nine Men’s Morris',
      'nav.modes': 'Game modes', 'nav.figures': 'Figures', 'nav.boards': 'Boards', 'nav.rules': 'Rules',
      'nav.parts': 'Page sections', 'nav.top': 'Malom Arena, back to top', 'lang.group': 'Language',
      'settings.open': 'Board and sound settings', 'settings.title': 'Settings',
      'hero.lede': 'The two-thousand-year-old board game, reimagined. Invite a friend with a code, take on a computer rated from 0 to 3000 Elo, and form mills with your favourite figures.',
      'hero.friends': 'Play with friends', 'hero.quick': 'Quick game',
      'field.name': 'Your name', 'field.namePh': 'e.g. Peter',
      'my.figure': 'Your figure', 'my.change': 'Change',
      'btn.create': 'New online game', 'btn.join': 'Join with a code', 'btn.ai': 'Play the computer', 'btn.local': 'Two players, one device',
      'hero.aiNote': 'Set the computer anywhere from 0 to 3000 Elo.', 'hero.localNote': 'One screen, taking turns.',
      'modes.title': 'Three ways to play',
      'modes.online.h': 'Online, against a friend',
      'modes.online.p': 'No sign-up needed. Open a room and send the code or link to whoever you want to challenge.',
      'modes.step1': 'Open a room', 'modes.step2': 'Send the link', 'modes.step3': 'Moves arrive live',
      'modes.online.mini': 'If your connection drops, you rejoin in the same seat. Emoji reactions and rematches included.',
      'modes.online.btn': 'Open a room',
      'modes.ai.h': 'Computer, from 0 to 3000 Elo',
      'modes.ai.p': 'The beginner still misses mills; the grandmaster calculates nine moves deep. You choose the challenge.',
      'modes.ai.btn': 'Challenge the computer',
      'modes.local.h': 'Two players, one screen',
      'modes.local.p': 'A tablet on the sofa or a laptop on the kitchen table. Take turns, and undo when you need to.',
      'modes.local.btn': 'Start on this device',
      'elo.t0': 'Beginner', 'elo.t1': 'Intermediate', 'elo.t2': 'Master', 'elo.t3': 'Grandmaster',
      'figures.title': '{n} figures from four worlds',
      'figures.sub': 'Fantasy creatures, animals, national flags and football shirts. You set the frame colour, thickness and shine. If both players pick the same figure, their frames turn red and blue on the board.',
      'frames.title': 'Figure frame', 'boards.heading': 'Board',
      'frame.color': 'Colour', 'frame.width': 'Thickness', 'frame.sheen': 'Shine', 'frame.player': 'Player colour (red / blue)', 'frame.custom': 'Custom colour', 'frame.reset': 'Reset', 'frame.none': 'none',
      'boards.title': '11 boards, one click',
      'boards.sub': 'Your chosen board shows up above and in the game straight away. Fine-tune sounds and music in the settings.',
      'rules.title': 'How Nine Men’s Morris works',
      'rules.place.h': 'Placing', 'rules.place.p': 'Take turns placing your 9 pieces on empty points.',
      'rules.move.h': 'Moving', 'rules.move.p': 'Once your hand is empty, slide a piece along a line to a neighbouring empty point.',
      'rules.fly.h': 'Flying', 'rules.fly.p': 'When you are down to 3 pieces, you can jump to any empty point.',
      'rules.mill.h': 'Mill', 'rules.mill.p1': 'Three of your pieces in a line. Then you remove one opposing piece, but only from a mill if there is no other choice.',
      'rules.mill.p2': 'You lose when you have 2 pieces left or cannot move.',
      'foot.p': 'A two-thousand-year-old game, reimagined. Runs in your browser, nothing to install.', 'foot.nav': 'Footer',
      'lobby.title': 'Waiting for your opponent', 'lobby.p': 'Send them the code or the link.',
      'lobby.copyLink': 'Copy link', 'lobby.copyCode': 'Copy code',
      'lobby.hint': 'Want to test it? Open the link in another browser window.', 'lobby.back': 'Back to the main menu',
      'game.menu': 'Back to the main menu', 'game.menuTitle': 'Main menu', 'game.board': 'Morris board',
      'game.undo': 'Undo', 'btn.resign': 'Resign', 'sound.mute': 'Mute sound', 'sound.toggle': 'Sound on/off',
      'join.title': 'Join a room', 'join.code': 'Room code', 'join.codePh': 'e.g. K7P2QX',
      'btn.cancel': 'Cancel', 'btn.join2': 'Join', 'btn.start': 'Let’s play', 'btn.launch': 'Start', 'btn.close': 'Close',
      'p2.title': 'Second player', 'p2.name': 'Name', 'p2.namePh': 'e.g. Anna', 'p2.figs': 'Second player’s figures',
      'ai.title': 'How strong should the computer be?', 'ai.range': 'Computer Elo rating', 'ai.first': 'Computer moves first',
      'tab.board': 'Board', 'tab.sound': 'Sound', 'boards.aria': 'Board design',
      'snd.master': 'Master volume', 'snd.muteAll': 'Mute', 'snd.music': 'Background music', 'snd.musicVol': 'Music volume',
      'snd.style': 'Sound style', 'snd.styleSub': 'Applies to every event, except the ones you give their own style below.',
      'snd.events': 'Events one by one', 'snd.reset': 'Reset sound settings',
      'snd.shared': 'Shared: {name}', 'snd.play': 'Play {ev}', 'snd.preview': 'Preview', 'snd.evStyle': '{ev} sound', 'snd.evVol': '{ev} volume',
      'btn.menu': 'Main menu', 'btn.rematch': 'Rematch', 'btn.waitingOpp': 'Waiting for opponent…', 'btn.acceptRematch': 'Accept rematch',
      'mode.online': 'Online room · {code}', 'mode.ai': 'Vs computer · {elo} Elo ({label})', 'mode.local': 'Two players, one device',
      'pl.waiting': 'Waiting…', 'pl.notJoined': 'Not joined yet',
      'tag.you': 'You', 'tag.opp': 'Opponent', 'tag.dc': 'Disconnected', 'tag.cpu': 'Computer',
      'pl.wins': 'Wins', 'pl.onBoard': 'On board', 'pl.lost': 'Captured', 'pl.inHand': '{n} pieces in hand', 'pl.allPlaced': 'All pieces placed',
      'st.waitOpp': 'Waiting for your opponent…', 'st.draw': 'Draw', 'st.won': '{name} wins!',
      'st.cpuThinking': 'The computer is thinking…', 'st.oppMoves': '{name} is moving…',
      'st.mill': 'Mill! Remove one of your opponent’s pieces.', 'st.place': 'place a piece ({n} left in hand).',
      'st.fly': 'only 3 pieces left, so you can fly to any empty point.', 'st.select': 'pick a piece to move.',
      'st.target': 'where to? Click a highlighted point.', 'st.yourTurn': 'Your turn: ',
      'toast.cantRemove': 'You can’t remove this piece right now.', 'toast.noMoves': 'This piece has no free neighbour.',
      'toast.moveFailed': 'That move didn’t go through.', 'resign.confirm': 'Sure? Click again',
      'end.pieces': '{l} dropped below 3 pieces.', 'end.blocked': '{l} has no legal move.', 'end.resign': '{l} resigned.',
      'end.repetition': 'The same position came up three times.', 'end.nocapture': '50 moves without a capture.',
      'end.youWon': 'You won!', 'end.cpuWon': 'The computer won', 'end.xWon': '{name} wins', 'end.record': 'You won! New record!',
      'toast.noOnline': 'Online play isn’t available on this server.', 'toast.roomGone': 'This room no longer exists.',
      'toast.reconnecting': 'Connection lost, reconnecting…', 'toast.createFailed': 'Couldn’t open a room.',
      'player': 'Player', 'player2': 'Player 2', 'copy.prompt': 'Copy this:',
      'toast.linkCopied': 'Link copied. Send it to your opponent!', 'toast.codeCopied': 'Code copied.',
      'join.codeLen': 'The code is 6 characters long.', 'react.aria': 'Reaction: {e}',
      'elo.d0': 'Often moves at random and misses mills. Perfect for your first games.',
      'elo.d1': 'Spots the obvious mills, but still makes plenty of mistakes.',
      'elo.d2': 'Thinks about {d} moves ahead, sometimes misjudges.',
      'elo.d3': 'Calculates {d} moves deep and rarely makes mistakes.',
      'elo.d4': 'Calculates {d} moves deep and doesn’t make mistakes. A serious challenge.',
      'elo.best': 'Strongest computer you have beaten: {n} Elo', 'cpu.name': 'Computer ({n})',
      'elo.l0': 'Beginner', 'elo.l1': 'Casual', 'elo.l2': 'Intermediate', 'elo.l3': 'Club player', 'elo.l4': 'Master', 'elo.l5': 'International Master', 'elo.l6': 'Grandmaster',
      'elo.unit': 'Elo',
      'toast.picked': 'You now play with: {name}',
      'home.best': 'Your record so far: you beat a {n} Elo computer.', 'home.aiCurrent': 'Last time: {n} Elo · {label}',
      'toast.invited': 'You’ve been invited to a game! Pick a figure, then join.',
      'err.no_room': 'No room with this code. Check it and try again.', 'err.room_full': 'This room is already full.',
      'err.not_in_room': 'You are not in a room.', 'err.room_gone': 'This room no longer exists.', 'err.wait_opp': 'Wait for your opponent to join.',
      'err.not_turn': 'It’s not your turn.', 'err.illegal': 'Illegal move.',
      'toast.joined': '{name} joined! Let the game begin.', 'toast.rematch': 'Rematch! The other player starts this time.',
      'pick.aria': 'Choose a figure',
      'theme.fa': 'Walnut', 'theme.marvany': 'Marble', 'theme.neon': 'Neon', 'theme.filc': 'Casino felt', 'theme.pergamen': 'Treasure map',
      'theme.jeg': 'Ice field', 'theme.lava': 'Volcano', 'theme.kiralyi': 'Royal velvet', 'theme.homok': 'Zen garden', 'theme.pixel': 'Retro pixel', 'theme.ur': 'Galaxy'
    }
  };

  let lang = 'hu';
  try {
    const saved = localStorage.getItem('malom-lang');
    if (saved === 'hu' || saved === 'en') lang = saved;
    else lang = /^hu/i.test(navigator.language || '') ? 'hu' : 'en';
  } catch (e) { lang = /^hu/i.test(navigator.language || '') ? 'hu' : 'en'; }

  function t(key, params) {
    let s = (D[lang] && D[lang][key]) || D.hu[key] || key;
    if (params) s = s.replace(/\{(\w+)\}/g, (_, k) => (params[k] !== undefined ? params[k] : ''));
    return s;
  }

  function apply(root) {
    root = root || document;
    for (const el of root.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n, el.dataset.i18nN ? { n: el.dataset.i18nN } : null);
    for (const el of root.querySelectorAll('[data-i18n-ph]')) el.setAttribute('placeholder', t(el.dataset.i18nPh));
    for (const el of root.querySelectorAll('[data-i18n-aria]')) el.setAttribute('aria-label', t(el.dataset.i18nAria));
    for (const el of root.querySelectorAll('[data-i18n-title]')) el.setAttribute('title', t(el.dataset.i18nTitle));
    document.documentElement.lang = lang;
    document.title = t('doc.title');
    for (const b of document.querySelectorAll('[data-lang]')) b.setAttribute('aria-pressed', b.dataset.lang === lang ? 'true' : 'false');
  }

  const listeners = [];
  window.I18N = {
    t,
    apply,
    get lang() { return lang; },
    set(l) {
      if (l !== 'hu' && l !== 'en') return;
      lang = l;
      try { localStorage.setItem('malom-lang', l); } catch (e) { /* nincs tárhely */ }
      apply();
      listeners.forEach((fn) => fn(l));
    },
    onChange(fn) { listeners.push(fn); }
  };
})();
