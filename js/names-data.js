/* PUBG Name Lab — hand-curated name collection.
   Each entry is [base, style, frame]. A base starting with "=" is used literally (no style or frame applied).
   Styles and frames are ids from styles.js, so "Open in Studio" keeps the recipe editable.
   These are ideas, not reserved names: availability and in-game acceptance are not guaranteed. */
window.PNL = window.PNL || {};
PNL.NAME_CATS = [
  { id: 'pro', label: 'Pro gamer', blurb: 'Clean, confident handles that read well on a kill feed.' },
  { id: 'esports', label: 'Esports & team', blurb: 'Team-tag and role styles used in organised play.' },
  { id: 'dark', label: 'Dark', blurb: 'Shadow, void and ember. Heavier on gothic letters and symbols.' },
  { id: 'minimal', label: 'Minimalist', blurb: 'One short, plain word. Easy to read and easy to type.' },
  { id: 'funny', label: 'Funny', blurb: 'Zone anxiety, pan worship and loot goblins.' },
  { id: 'aesthetic', label: 'Aesthetic', blurb: 'Soft, lunar and small-caps. Pairs well with sparkle frames.' },
  { id: 'anime', label: 'Anime-inspired', blurb: 'Japanese words and kana-style frames. No character names.' },
  { id: 'clan', label: 'Clan & squad', blurb: 'Names a whole team can wear.' },
  { id: 'symbol', label: 'Symbol-based', blurb: 'Built around a symbol, a frame or a combining-mark face.' },
  { id: 'unique', label: 'Unique-looking', blurb: 'Lookalike letters, runes and unusual alphabets that stand out.' }
];
PNL.NAMES = {
  pro: [['Kestrel'], ['Sightline'], ['ZeroHour'], ['Deadeye', '', 'tsu'], ['Cipher', 'bold'], ['IronSight'], ['LastCircle'], ['Marksman'], ['ColdFront'], ['Longshot'], ['Crosshair'], ['Vantage', 'smallcaps'], ['FirstBlood'], ['Clutch', '', 'classic'], ['Overtime'], ['SteadyHand']],
  esports: [['=【NX】Vanta'], ['=〖VX〗Kestrel'], ['=『RZ』Cipher'], ['=NX·Rook'], ['=VX_Anchor'], ['=ꜱǫᴅ·Entry'], ['=IGL·Sage'], ['=Fragger47'], ['EntryZero'], ['Playmaker', 'bold'], ['Lurker', 'smallcaps'], ['Rotation'], ['Closer', '', 'gamer']],
  dark: [['NightWraith'], ['Umbra'], ['Hollow'], ['Grimveil'], ['Nocturne'], ['Voidwalker'], ['DeadSilence'], ['Blackout'], ['Eclipse'], ['Revenant'], ['Ashen'], ['Specter', '', 'wings'], ['Reaper', '', 'skull'], ['Phantom', '', 'ornate'], ['Darkcore', 'fraktur'], ['Shadow', 'boldfraktur']],
  minimal: [['Ash'], ['Fern'], ['Ivo'], ['Kite'], ['Nox'], ['Onyx'], ['Sable'], ['Vale'], ['Wren'], ['Zen'], ['Ember'], ['Lumen'], ['Mono'], ['Quill'], ['Rift'], ['Slate'], ['Ash', 'smallcaps'], ['Zen', 'fullwidth']],
  funny: [['WinnerWinner'], ['PanLover'], ['TheLastPan'], ['ZoneAnxiety'], ['LootGoblin'], ['404AimNotFound'], ['LagIsMyCopilot'], ['ThirdPartyPete'], ['AFKDinner'], ['OopsAllMisses'], ['EndlessReload'], ['BushDweller'], ['NoScopeNana'], ['WhoNeedsAim'], ['BandageEnjoyer'], ['RoadkillRick']],
  aesthetic: [['Willow', 'smallcaps'], ['Lunar', '', 'stars'], ['Stardust', '', 'sparkle'], ['Honey', '', 'hearts'], ['Luna', 'smallcaps'], ['Selene', 'script'], ['Moonlit', '', 'moon'], ['Petal', '', 'flowers'], ['Sunset', 'fullwidth'], ['Cloud', 'circled'], ['Aurora', '', 'sparkle'], ['Azure', 'smallcaps'], ['Velvet', 'script'], ['Daydream', 'italic'], ['Opal', 'boldscript'], ['Serene', '', 'ornate']],
  anime: [['Kage', '', 'kanji'], ['Ronin', '', 'swoosh'], ['Sakura', '', 'flowers'], ['Kitsune', '', 'otsu'], ['Hoshi', '', 'stars'], ['Kuroneko'], ['NekoNinja'], ['Oni', '', 'corner'], ['Ryujin'], ['Kaze', '', 'swoosh'], ['Okami'], ['Yurei'], ['Shinobi', '', 'classic'], ['Senpai', '', 'tsu'], ['Samurai'], ['Tsukiyo']],
  clan: [['NightOwls'], ['IronWolves'], ['RedLine'], ['Outliers'], ['Vanguard'], ['Phalanx'], ['Redwing'], ['Highlanders'], ['Ironclad'], ['LastLight'], ['TeamVanta'], ['Longbow'], ['Vanguard', 'bold'], ['Phalanx', 'smallcaps']],
  symbol: [['Ace', '', 'spades'], ['Duelist', '', 'blades'], ['Nova', '', 'stars'], ['Sora', '', 'hearts'], ['Echo', '', 'arrows'], ['Queen', '', 'crown'], ['=Ghost×͜×'], ['=★_★Vanta'], ['=•͜•Rook'], ['=ღKiraღ'], ['=⚡Volt⚡'], ['=▲Delta▲'], ['=◈Prism◈'], ['=✞Saint✞'], ['=☯Zen☯']],
  unique: [['Magic', 'canadian'], ['Dark', 'cjk'], ['Viper', 'canadian'], ['Ghost', 'superscript'], ['Nebula', 'boldscript'], ['Vortex', 'double'], ['Cipher', 'fraktur'], ['=ᚱᚢᚾᛖ'], ['=ᛋᚺᚨᛞᛟᚹ'], ['Pixel', 'mono'], ['Static', 'strike'], ['Glitch', 'overline'], ['Ghost', 'flip'], ['Orbit', 'circled'], ['Neon', 'fullwidth'], ['Wolf', 'cjk']]
};
/* flat list with resolved text and recipe */
PNL.nameList = function () {
  if (PNL._nameList) return PNL._nameList;
  var out = [], i = 0;
  PNL.NAME_CATS.forEach(function (c) {
    (PNL.NAMES[c.id] || []).forEach(function (e) {
      var st = PNL.recipe(e[0], e[1], e[2]);
      out.push({ id: c.id + '-' + (i++), cat: c.id, text: PNL.compose(st), state: st, order: i });
    });
  });
  return (PNL._nameList = out);
};
