/* PUBG Name Lab — character library data (about 2,800 characters in 64 groups).
   Exposed as PNL.LIB = { groups, CATS }. Each group: id, title, desc, type (category), kw (search keywords), chars | items. */
window.PNL=window.PNL||{};
(function(P){
'use strict';
const R=P.R;
const mathAlpha=(U,L,ex={})=>{let o='';for(let i=0;i<26;i++)o+=ex[String.fromCharCode(65+i)]||String.fromCodePoint(U+i);for(let i=0;i<26;i++)o+=ex[String.fromCharCode(97+i)]||String.fromCodePoint(L+i);return o};
const mathDigits=s=>{let o='';for(let i=0;i<10;i++)o+=String.fromCodePoint(s+i);return o};
const MATH_NOTE='From Mathematical Alphanumeric Symbols. These use supplementary code points and count as two UTF-16 units each; NFKC folds them to plain letters.';
const groups=[
{id:'latin-upper',title:'Latin alphabet — uppercase',desc:'The 26 standard English capital letters.',type:'latin',kw:'letters alphabet english capital abc',chars:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'},
{id:'latin-lower',title:'Latin alphabet — lowercase',desc:'The 26 standard English lowercase letters.',type:'latin',kw:'letters alphabet english small abc',chars:'abcdefghijklmnopqrstuvwxyz'},
{id:'digits',title:'ASCII digits',desc:'Standard decimal digits. A developer talk says numeric-only nicknames should be prohibited.',type:'latin',kw:'numbers numeric figures',chars:'0123456789'},
{id:'greek',title:'Greek alphabet',desc:'Greek uppercase and lowercase letters; Unicode-valid, game acceptance unverified.',type:'scripts',lang:'el',kw:'greek alpha omega',chars:'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω'},
{id:'cyrillic',title:'Cyrillic alphabet',desc:'Common Cyrillic letters; visually similar letters may be different characters.',type:'scripts',lang:'ru',kw:'russian cyrillic lookalike',chars:'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя'},
{id:'arabic',title:'Arabic letters',desc:'A sample of Arabic letters. Text direction and font support may affect display.',type:'scripts',lang:'ar',kw:'arabic rtl',chars:'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'},
{id:'hebrew',title:'Hebrew letters',desc:'Hebrew alphabet sample; right-to-left rendering may affect previews.',type:'scripts',lang:'he',kw:'hebrew rtl',chars:'אבגדהוזחטיכלמנסעפצקרשת'},
{id:'hiragana',title:'Hiragana',desc:'Japanese syllabary characters.',type:'scripts',lang:'ja',kw:'japanese kana',chars:'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'},
{id:'katakana',title:'Katakana',desc:'Japanese syllabary characters.',type:'scripts',lang:'ja',kw:'japanese kana',chars:'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンツシッ'},
{id:'hangul',title:'Korean Hangul',desc:'Common precomposed Hangul syllables.',type:'scripts',lang:'ko',kw:'korean hangul',chars:'가나다라마바사아자차카타파하거너더러머버서어저처커터퍼허고노도로모보소오조초코토포호'},
{id:'cjk',title:'Chinese / CJK sample',desc:'A small sample of common CJK ideographs, not the full character set.',type:'scripts',lang:'zh',kw:'chinese han kanji hanzi ideograph',chars:'中文人大小天地王火水木金土山月日明力心龍愛風雲神王'},
{id:'thai',title:'Thai letters',desc:'Thai consonant sample.',type:'scripts',lang:'th',kw:'thai',chars:'กขคฆงจฉชซญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ'},
{id:'stars',title:'Stars & sparkle',desc:'Decorative star and sparkle symbols.',type:'decor',kw:'star sparkle shine',chars:'★☆✦✧✩✪✭✮✯✰⋆✵✶✷✸✹✺✴'},
{id:'hearts',title:'Hearts',desc:'Heart-shaped symbols and ornaments.',type:'decor',kw:'heart love',chars:'♡♥❤❥❣❦ღ'},
{id:'flowers',title:'Flowers & ornaments',desc:'Floral and ornamental marks.',type:'decor',kw:'flower floral ornament',chars:'❀✿❁✾❋⚜⍟⟡'},
{id:'tibetan',title:'Tibetan / Indic-style ornaments',desc:'Decorative Unicode marks; font and game acceptance vary.',type:'decor',kw:'tibetan ornament swirl',chars:'࿐༄༒࿇࿈'},
{id:'cjkmarks',title:'CJK and Japanese-style marks',desc:'Popular decorative characters often seen in stylized player names.',type:'decor',kw:'stylized cjk japanese marks',chars:'亗彡〆ツシッ乙卄メノ愛'},
{id:'brackets',title:'Brackets & frames',desc:'Decorative bracket pairs. Try both opening and closing characters.',type:'brackets',kw:'bracket frame corner wrap',chars:'『』「」【】〖〗꧁꧂༺༻〈〉《》〔〕〘〙❨❩❪❫❬❭❮❯❰❱❲❳❴❵⟦⟧⟨⟩⟪⟫⦅⦆⦃⦄⌈⌉⌊⌋｢｣‹›«»❝❞〚〛'},
{id:'arrows',title:'Arrows & pointers',desc:'Directional and decorative arrow symbols.',type:'arrows',kw:'arrow pointer direction',chars:'→←↑↓↔↕↗↘↙↖⇒⇐⇑⇓⇔⇄⇅↺↻➔➜➝➞➟➠➡➢➣➤➥➦➧➨➩➪➫➬➭➮➯➱➳➵➸➺➻⟵⟶⟷⇝⇜↝↜⇢⇠'},
{id:'m-bold',title:'Mathematical bold',desc:MATH_NOTE,type:'styled',kw:'bold styled fancy',chars:mathAlpha(0x1D400,0x1D41A)+mathDigits(0x1D7CE)},
{id:'m-fraktur',title:'Mathematical fraktur',desc:MATH_NOTE+' A few letters live in the Letterlike Symbols block instead.',type:'styled',kw:'fraktur gothic blackletter styled fancy',chars:mathAlpha(0x1D504,0x1D51E,{C:'\u212D',H:'\u210C',I:'\u2111',R:'\u211C',Z:'\u2128'})},
{id:'m-double',title:'Mathematical double-struck',desc:MATH_NOTE+' A few letters live in the Letterlike Symbols block instead.',type:'styled',kw:'double struck outline blackboard styled fancy',chars:mathAlpha(0x1D538,0x1D552,{C:'\u2102',H:'\u210D',N:'\u2115',P:'\u2119',Q:'\u211A',R:'\u211D',Z:'\u2124'})+mathDigits(0x1D7D8)},
{id:'m-script',title:'Mathematical script',desc:MATH_NOTE+' A few letters live in the Letterlike Symbols block instead.',type:'styled',kw:'script cursive calligraphy styled fancy',chars:mathAlpha(0x1D49C,0x1D4B6,{B:'\u212C',E:'\u2130',F:'\u2131',H:'\u210B',I:'\u2110',L:'\u2112',M:'\u2133',R:'\u211B',e:'\u212F',g:'\u210A',o:'\u2134'})},
{id:'m-mono',title:'Mathematical monospace',desc:MATH_NOTE,type:'styled',kw:'monospace typewriter styled fancy',chars:mathAlpha(0x1D670,0x1D68A)+mathDigits(0x1D7F6)}
];
const EXTRA=[
{id:'m-bolditalic',title:'Mathematical bold italic',desc:MATH_NOTE,type:'styled',kw:'bold italic slanted styled fancy',chars:mathAlpha(0x1D468,0x1D482)},
{id:'m-italic',title:'Mathematical italic',desc:MATH_NOTE+' Lowercase h lives in Letterlike Symbols.',type:'styled',kw:'italic slanted styled fancy',chars:mathAlpha(0x1D434,0x1D44E,{h:'ℎ'})},
{id:'m-boldscript',title:'Mathematical bold script',desc:MATH_NOTE,type:'styled',kw:'bold script cursive calligraphy styled fancy',chars:mathAlpha(0x1D4D0,0x1D4EA)},
{id:'m-boldfraktur',title:'Mathematical bold fraktur',desc:MATH_NOTE,type:'styled',kw:'bold fraktur gothic blackletter styled fancy',chars:mathAlpha(0x1D56C,0x1D586)},
{id:'m-sans',title:'Mathematical sans-serif',desc:MATH_NOTE,type:'styled',kw:'sans serif plain styled fancy',chars:mathAlpha(0x1D5A0,0x1D5BA)+mathDigits(0x1D7E2)},
{id:'m-sansbold',title:'Mathematical sans-serif bold',desc:MATH_NOTE,type:'styled',kw:'sans serif bold styled fancy',chars:mathAlpha(0x1D5D4,0x1D5EE)+mathDigits(0x1D7EC)},
{id:'m-sansitalic',title:'Mathematical sans-serif italic',desc:MATH_NOTE,type:'styled',kw:'sans serif italic slanted styled fancy',chars:mathAlpha(0x1D608,0x1D622)},
{id:'m-sansbolditalic',title:'Mathematical sans-serif bold italic',desc:MATH_NOTE,type:'styled',kw:'sans serif bold italic slanted styled fancy',chars:mathAlpha(0x1D63C,0x1D656)},
{id:'smallcaps',title:'Small capitals',desc:'Small capitals from IPA and Phonetic Extensions. There is no true small-capital q or x, so ǫ and x are the usual stand-ins.',type:'styled',kw:'small caps capitals phonetic ipa',chars:'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ'},
{id:'fullwidth',title:'Fullwidth letters & digits',desc:'Wide forms of Latin letters and digits from Halfwidth and Fullwidth Forms. NFKC folds them back to ordinary letters.',type:'styled',kw:'fullwidth wide vaporwave aesthetic',chars:R(0xFF21,0xFF3A)+R(0xFF41,0xFF5A)+R(0xFF10,0xFF19)},
{id:'circled',title:'Circled letters & numbers',desc:'Enclosed Alphanumerics: circled capitals, lowercase and numbers.',type:'styled',kw:'circled bubble enclosed',chars:R(0x24B6,0x24E9)+'⓪'+R(0x2460,0x2473)},
{id:'negcircled',title:'Negative circled',desc:'Filled circle capitals and digits. Some devices may draw these as colour emoji; emoji are not recommended.',type:'styled',kw:'negative circled filled black bubble',chars:R(0x1F150,0x1F169)+R(0x2776,0x277F)},
{id:'squared',title:'Squared letters',desc:'Squared and negative squared capitals. Some devices may draw these as colour emoji; emoji are not recommended.',type:'styled',kw:'squared boxed negative square',chars:R(0x1F130,0x1F149)+R(0x1F170,0x1F189)},
{id:'superscript',title:'Superscript',desc:'Raised letters and digits from Phonetic Extensions and Superscripts. There is no standard superscript q.',type:'styled',kw:'superscript raised tiny small',chars:'ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖʳˢᵗᵘᵛʷˣʸᶻ⁰¹²³⁴⁵⁶⁷⁸⁹ᴬᴮᴰᴱᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾᴿᵀᵁⱽᵂ'},
{id:'subscript',title:'Subscript',desc:'Lowered letters and digits. Only some letters have a subscript form.',type:'styled',kw:'subscript lowered tiny small',chars:'ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ₀₁₂₃₄₅₆₇₈₉'},
{id:'cjk-letters',title:'CJK lookalike letters (A–Z)',desc:'Han and kana characters that resemble Latin capitals, in alphabetical order. Popular in stylised names; they are not the letters they look like.',type:'styled',lang:'ja',kw:'cjk lookalike letters alphabet kanji stylized',chars:'卂乃匚刀乇下厶卄工丁长乚从ん口尸㔿尺丂丅凵リ山乂丫乙'},
{id:'canadian-letters',title:'Lookalike letters (Canadian syllabics & friends)',desc:'Syllabics, runic and Latin Extended characters that resemble capitals A–Z in order. Different characters from the letters they imitate.',type:'styled',kw:'lookalike canadian syllabics alphabet stylized aesthetic',chars:'ᗩᗷᑕᗪᗴᖴᘜᕼᓰᒍᛕᒪᗰᑎᗝᑭᑫᖇᔕ丅ᑌᐯᗯ᙭Ƴ乙'},
{id:'latin1',title:'Accented Latin (Latin-1)',desc:'Accented letters from Western European languages, plus × and ÷.',type:'latin',kw:'accent accented diacritic latin1 european umlaut',chars:R(0xC0,0xFF)},
{id:'latin-a',title:'Latin Extended-A',desc:'Letters used in Central and Eastern European languages, Turkish and more.',type:'latin',kw:'latin extended accent european polish czech turkish',chars:R(0x100,0x17F)},
{id:'latin-look',title:'Latin lookalikes',desc:'Hooked, barred and crossed capitals from Latin Extended-B and neighbours.',type:'latin',kw:'latin lookalike hook bar stroke extended',chars:'ƁƇƊƑƓƘƝƤƬƲƵǶɃȻɆɌɎĦŦ'},
{id:'armenian',title:'Armenian',desc:'Armenian capitals and lowercase letters.',type:'scripts',lang:'hy',kw:'armenian',chars:R(0x531,0x556)+R(0x561,0x586)},
{id:'georgian',title:'Georgian',desc:'Georgian Mkhedruli letters.',type:'scripts',lang:'ka',kw:'georgian mkhedruli',chars:R(0x10D0,0x10FA)},
{id:'devanagari',title:'Devanagari consonants & vowels',desc:'Hindi and Sanskrit letters. Complex shaping may render differently in other fonts.',type:'scripts',lang:'hi',kw:'devanagari hindi sanskrit indic',chars:R(0x905,0x939)},
{id:'cherokee',title:'Cherokee',desc:'Cherokee syllabary capitals. Several resemble Latin letters.',type:'scripts',lang:'chr',kw:'cherokee syllabary lookalike',chars:R(0x13A0,0x13F5)},
{id:'runic',title:'Runic',desc:'Runic letters from the Runic block.',type:'scripts',kw:'rune runic viking norse futhark',chars:R(0x16A0,0x16EA)},
{id:'braille',title:'Braille patterns',desc:'A selection of Braille pattern characters, including a few dense blocks.',type:'scripts',kw:'braille dots pattern',chars:R(0x2801,0x283F)+'⣿⡇⢸⣀'},
{id:'cjk-strokes',title:'CJK strokes & lookalikes',desc:'Simple CJK building blocks often used to stylise names.',type:'decor',lang:'ja',kw:'cjk strokes radical stylized lookalike kanji',chars:'丂乃乂乙工匚卂卜厶又口刀一丨丿丶尸山彡巳己ㄒㄩㄚ廾ㄥ'},
{id:'dark',title:'Blades, bolts & dark symbols',desc:'Skull, blade and crest symbols. Some devices may draw these as colour emoji; emoji are not recommended.',type:'symbols',kw:'skull blade sword bolt lightning dark battle cross crest',chars:'☠☢☣☯☮☪✞✟✠☬⚔⚡☄⚰⚱✡☥☦'},
{id:'cards-music',title:'Chess, cards & music',desc:'Chess pieces, card suits and musical notation.',type:'symbols',kw:'chess king queen card suit spade club diamond music note',chars:'♔♕♖♗♘♙♚♛♜♝♞♟♠♣♥♦♤♧♡♢♩♪♫♬♭♮♯'},
{id:'misc',title:'Weather, tools & marks',desc:'Sun, moon, travel, checks and other common symbols.',type:'symbols',kw:'sun moon weather cloud snow plane scissors phone check cross smile male female',chars:'☀☁☂☃☼☽☾❄✈✂✆✉☎✓✔✗✘✖⌛⌚☺☻☹♀♂'},
{id:'operators',title:'Math & operators',desc:'Operators and technical symbols, including the multiplication sign.',type:'symbols',kw:'math operator times multiply divide plus minus infinity sum root equals',chars:'×÷±∓∞≈≠≡≤≥≪≫√∑∏∆∇∂∫∈∉∩∪⊂⊃⊕⊗⊙⊘⊥∠∴∵∝⌘⌥✚✜✛✢✣✤✥'},
{id:'shapes',title:'Geometric shapes',desc:'Triangles, circles, squares and diamonds.',type:'symbols',kw:'shape triangle circle square diamond geometric',chars:'▲△▼▽◀▶◁▷◆◇◈◉◊○●◎◍◐◑◒◓◔◕◖◗■□▢▣▤▥▦▧▨▩▪▫▬▭▮▯◢◣◤◥'},
{id:'blocks',title:'Blocks & box drawing',desc:'Shading blocks and line-drawing characters.',type:'symbols',kw:'block shade box drawing line border frame',chars:'░▒▓█▀▄▌▐▁▂▃▅▆▇▏▎▍▋▊▉─│┌┐└┘├┤┬┴┼═║╔╗╚╝╠╣╦╩╬━┃┏┓┗┛'},
{id:'currency',title:'Currency',desc:'Currency signs.',type:'symbols',kw:'currency money dollar euro pound yen bitcoin',chars:'$¢£¤¥€₩₹₽₿฿₺₦₱₫₪'},
{id:'punct',title:'Punctuation & dividers',desc:'Bullets, dots, quotes, daggers and dividers.',type:'symbols',kw:'punctuation bullet dot dagger quote divider separator ellipsis',chars:'•·‣⁃‥…‹›«»¡¿‼⁇‡†§¶※‰′″‾⁂❝❞❛❜❮❯❰❱〃〝〞'},
{id:'letterlike',title:'Letterlike & signs',desc:'Trademark-style signs, units and letter-shaped symbols.',type:'symbols',kw:'letterlike trademark copyright number sign ohm kelvin angstrom unit',chars:'℘℮№™℠℗®©℃℉℧℅℆ℓ℔ℯℊΩKÅ'},
{id:'faceparts',title:'Face & eye parts',desc:'Characters often used to draw eyes, mouths and expressions.',type:'marks',kw:'face eye eyes mouth smile kaomoji emoticon',chars:'ʘಠ◕◔◉⊙⊗⊕◎Ꙩꙩωʖ‿︶°ᴗ‸'},
{id:'combos',title:'Ready-made combos',desc:'Characters joined with combining marks, such as ×͜×. Combos are several code points, so they count as more than one character. Paste a combo into the search to find its parts.',type:'marks',kw:'combo combined kaomoji face eyes swoosh double breve tie joined x times lenny',items:['×͜×','×͡×','×͢×','♡͜♡','★͜★','•͜•','ღ͜ღ','ʘ͜ʘ','ಠ͜ಠ','⊙͜⊙','✿͜✿','ツ͜ツ','(ʘ‿ʘ)','(ಠ_ಠ)','(◕‿◕)','ʕ•ᴥ•ʔ','( ͡° ͜ʖ ͡°)','(づ｡◕‿‿◕｡)づ']},
{id:'combining',title:'Combining marks',desc:'Combining Diacritical Marks, shown on a dotted circle. A mark attaches to the character before it, so add one after a letter. Heavy stacking may be stripped, rejected or render oddly.',type:'marks',marks:true,kw:'combining marks diacritics accent tie breve zalgo glitch overline strike underline',chars:R(0x300,0x36F)+'҉'}
];
groups.push(...EXTRA);
const ORDER=['latin','styled','scripts','decor','symbols','brackets','arrows','marks','blank'];
groups.sort((a,b)=>ORDER.indexOf(a.type)-ORDER.indexOf(b.type));
groups.forEach(g=>{g.list=g.items?g.items.slice():[...new Set([...g.chars])];g.text=(g.title+' '+g.desc+' '+(g.kw||'')).toLowerCase()});
const CATS=[['all','All'],['latin','Latin & numbers'],['styled','Fancy letters'],['scripts','Other writing systems'],['decor','Decorative'],['symbols','Symbols & shapes'],['brackets','Brackets & frames'],['arrows','Arrows'],['marks','Combining & combos']];

const BLANK=[
{id:'blank',title:'Blank & invisible characters',desc:'Characters that draw nothing or only a gap. Many name fields reject, trim or strip them, and a blank-looking name is hard for other players, moderators and support to identify. Nothing here is confirmed to work in PUBG MOBILE. Shown by code point because there is nothing to see.',type:'blank',kw:'invisible blank empty space hangul filler zero width braille nbsp joiner spacer hidden',items:['ㅤ','⠀','ᅟ','ᅠ','ﾠ',' ',' ',' ',' ',' ',' ','　','​','‌','‍','⁠','﻿','͏']}
,
{id:'spacelike',title:'Reported space-lookalikes',desc:'Ordinary Latin letters with a macron, ogonek or similar mark. One player test (Android, preview only) found the game draws ī ū ē ō į and Ī as a space-like gap, which would be a font effect, not a real space. One report, unverified. They are visible letters elsewhere, take 2 bytes each in UTF-8, and may count against a length limit.',type:'blank',kw:'space spacing gap blank lookalike macron ogonek name',chars:'īūēōįĪŪĒŌĮāĀ'}
];
groups.push(...BLANK);
groups.sort((a,b)=>ORDER.indexOf(a.type)-ORDER.indexOf(b.type));
groups.forEach(g=>{g.list=g.items?g.items.slice():[...new Set([...g.chars])];g.text=(g.title+' '+g.desc+' '+(g.kw||'')).toLowerCase()});
CATS.push(['blank','Blank & invisible']);

P.LIB={groups,CATS,MATH_NOTE};
})(window.PNL);
