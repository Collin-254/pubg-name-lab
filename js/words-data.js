/* PUBG Name Lab — word banks for the Discover generator.
   a = modifiers (adjectives), n = nouns, t = tags / suffixes, frames = preferred decorations, patterns = recipes by weight.
   Every bank is hand-written and kept clean on purpose: no slurs, no real clans, streamers or trademarked characters. */
window.PNL = window.PNL || {};
(function (P) {
  var W = function (s) { return s.split(' '); };
  var STD = [['a', 'n'], ['a', 'n'], ['n', 't'], ['n', 'n'], ['n'], ['a', 'n', 't']];
  P.THEMES = [
    { id: 'tactical', label: 'Tactical', blurb: 'Operators, call signs and recon.', frames: W('arrows corner lenticular angle bolt'), patterns: STD,
      a: W('Silent Cold Rogue Steel Lone Swift Grey Iron Static Quiet Hard Sharp Night Long Black Rapid Stealth'),
      n: W('Viper Falcon Ranger Recon Sentry Warden Marksman Operator Nomad Raven Cobra Hawk Ghost Wolf Fox Anvil Bastion Vector Striker Outrider Scout Lancer Hunter Raptor'),
      t: W('Actual Six One Zero Prime Delta Echo Alpha Tango 07 11 21 47 99') },
    { id: 'dark', label: 'Dark', blurb: 'Shadows, voids and ash.', frames: W('skull wings ornate blades moon fade'), patterns: STD,
      a: W('Night Dead Grim Void Ashen Hollow Pale Cursed Black Crimson Silent Sunken Wicked Obsidian Bleak Dusk Ruin'),
      n: W('Wraith Reaper Raven Specter Phantom Shade Warlock Hex Crypt Vessel Omen Banshee Gloom Eclipse Revenant Fang Thorn Widow Lich Gargoyle Nightmare Abyss Cinder'),
      t: W('XIII 13 99 Zero Null X Noir Prime') },
    { id: 'royal', label: 'Royal', blurb: 'Crowns, thrones and titles.', frames: W('crown ornate wings stars corner'), patterns: STD,
      a: W('Royal Golden Regal Noble Sovereign Imperial Crowned Gilded Ivory Velvet Grand Supreme Eternal'),
      n: W('King Queen Knight Crown Duke Baron Monarch Regent Emperor Tsar Paladin Lion Throne Herald Lord Empress Prince Dynasty Scepter'),
      t: W('I II III VII Prime Rex Regis Elite XV') },
    { id: 'minimal', label: 'Minimalist', blurb: 'One short word, nothing extra.', frames: W('none dots'), patterns: [['n'], ['n'], ['n'], ['n', 't']],
      a: [],
      n: W('Ash Fern Ivo Kite Nox Onyx Sable Vale Wren Zen Ember Lumen Mono Quill Rift Slate Pine Dune Ion Arc Orb Rue Sol Tarn Aero Nim Oak Flint Moss Reed Pike Vex Zed'),
      t: W('1 7 9 11 22') },
    { id: 'funny', label: 'Funny', blurb: 'Pans, noodles and questionable decisions.', frames: W('stars dots arrows'), patterns: [['a', 'n'], ['a', 'n'], ['a', 'n'], ['n', 't'], ['n', 't'], ['a', 'n', 't']],
      a: W('Sleepy Angry Lazy Crispy Soggy Panicked Suspicious Caffeinated Dramatic Wobbly Humble Unlucky Hungry Confused Sweaty'),
      n: W('Pan Noodle Goblin Potato Penguin Banana Sniper Camper Bandage Chicken Raccoon Waffle Toaster Llama Bush Pigeon Pickle Muffin Walrus'),
      t: W('Enjoyer Main Wizard Lord Dealer Fan Simulator Gang') },
    { id: 'anime', label: 'Anime-inspired', blurb: 'Japanese words and honorifics.', frames: W('kanji swoosh otsu tsu flowers corner classic'), patterns: STD,
      a: W('Shadow Crimson Silent Moon Star Blue Red Black White Thunder Midnight Silver Golden Storm'),
      n: W('Kage Ronin Kitsune Oni Hoshi Sakura Kaze Tsuki Neko Ryu Okami Yurei Ninja Samurai Shinobi Senpai Katana Kami Akuma Kuroneko Hayate Yami'),
      t: W('Sama San Kun Zero X 07') },
    { id: 'esports', label: 'Esports', blurb: 'Team tags, roles and clutch plays.', frames: W('lenticular corner wide none'), patterns: [['team', 'n'], ['team', 'n'], ['team', 'a', 'n'], ['a', 'n'], ['n', 't'], ['n']],
      a: W('Elite Prime Clutch Savage Instant Rapid Ruthless Lethal Prodigy Relentless Calm Cold Ice'),
      n: W('Fragger Entry Anchor Lurker Sniper Carry Closer Playmaker Captain Striker Scout Vanguard Support Warden Slayer Breacher'),
      t: W('IGL Pro GG Actual Main 47 10 99'),
      team: W('NX VX RZ IW OWL WLF KRN ASH ZNX DRK') },
    { id: 'aesthetic', label: 'Aesthetic', blurb: 'Soft, lunar and dreamy.', frames: W('stars sparkle moon hearts flowers ornate'), patterns: STD,
      a: W('Soft Velvet Honey Lunar Solar Pastel Golden Dreamy Hazy Faded Misty Lilac Opal Amber Rosy Gentle'),
      n: W('Moon Willow Petal Cloud Aurora Stardust Daydream Sunset Dawn Ocean Bloom Nectar Mirage Serenity Whisper Halo Ivy Echo Luna Selene Coral Dew'),
      t: W('07 11 22 03') },
    { id: 'wild', label: 'Wild', blurb: 'Predators and storms.', frames: W('swoosh arrows angle wings bolt'), patterns: STD,
      a: W('Wild Feral Silent Lone Hungry Savage Iron Frost Storm Ember Alpha'),
      n: W('Wolf Bear Panther Hawk Viper Tiger Lynx Stag Jackal Falcon Orca Raptor Lion Cobra Mantis Rhino Badger Eagle Fox Shark'),
      t: W('Pack Prime X Hunter Claw Fang 7') }
  ];
  P.TEAM_BRACKETS = [['【', '】'], ['〖', '〗'], ['『', '』'], ['', '·']];
})(window.PNL);
