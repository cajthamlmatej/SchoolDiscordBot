const Command = require("./Command");
const Discord = require("discord.js");

class ChladkovaCommand extends Command {

    getName() {
        return "chladkova";
    }

    getGroup() {
        return "fun";
    }

    getRoles() {
        return ["member"];
    }

    init(bot) {
        this.client = bot.client;
        this.proverbs = proverbs.split("\n");
    }

    call(args, message) {
        const channel = message.channel;
        const embed = new Discord.RichEmbed()
            .setTitle("👩‍🏫 | Paní Ing. Elena Chládková říká:")
            .setDescription(this.proverbs[Math.floor(Math.random() * this.proverbs.length)])
            .setColor(0xfd79a8);

        channel.send(embed);
        return false;
    }

}

const proverbs = `Letíš jako pšíkanec z nosu.
Bezdomovec je doma všude.
Bez práce nejsou koláče.
Bez peněz do hospody nelez.
Bližší košile nežli kabát.
Boží mlýny melou pomalu, ale jistě.
Co je dovoleno pánovi, není dovoleno kmánovi.
Co je šeptem, to je s čertem.
Co je v domě, není pro mě.
Co je v domě, to se počítá.
Co jsi z úst vypustil, ani párem koní nedostaneš zpět.
Co můžeš udělat dnes, neodkládej na zítřek.
Co nejde po dobrým, to půjde po zlým.
Co oči nevidí, to srdce nebolí (a ruce neukradnou).
Co se škádlívá, to se rádo mívá.
Co se v mládí naučíš, ke stáru jako když najdeš.
Co sis uvařil, to si sněz.
Co tě nezabije, to tě posílí.
Cvik dělá mistra.
Co tě nepálí, nehas.
Co na srdci, to na jazyku.
Co nejde silou, jde rozumem.
Čas všechny rány zahojí.
Častá krůpěj kámen proráží.
Čím výše vystoupíš, tím hlouběji padáš.
Čím výše vystoupíš, tím větší rozhled.
Čiň čertu dobře, peklem se ti odmění.
Čistota - půl zdraví.
Dal ses na vojnu, tak bojuj.
Darovanému koni na zuby nehleď.
Devatero řemesel – desátá bída.
Dějiny píší vítězové.
Dobré slovo i železná vrata otvírá.
Dočkej času jako husa klasu.
Drzé čelo lepší než poplužní dvůr.
Dvakrát měř, jednou řež.
Důvěřuj, ale prověřuj
Hlad je nejlepší kuchař.
Hlad má velké oči.
Hloupý, kdo dává, hloupější, kdo nebere.
Hněv je špatný rádce.
Host do domu, pan do domu.
Chceš-li vědět, jaká bude tvá budoucí žena, podívej se na její maminku.
Chodí štěstí dokola, sem-tam sedne na vola.
Chybami se člověk učí.
Chytil se toho jak hovno košile.
Chytrému napověz, hloupého trkni.
Chytrost nejsou žádné čáry.
I mistr tesař se někdy utne.
I kdybys osla vedl do Paříže, komoň z něho nebude.
Jablko nepadá daleko od stromu.
Jak bys nosil dříví do lesa.
Jak se do lesa volá, tak se z lesa ozývá.
Jak si kdo ustele, tak si lehne.
Jaká matka, taká Katka.
Jaká paní, takový zažívání.
Jak zaseješ, tak sklidíš.
Jaký otec, takový syn.
Jaký pán, taký krám.
Jaký pán, takový pes.
Jaký šel, takového potkal.
Jeden za osmnáct, druhý bez dvou za dvacet.
Jedna chyba sto jiných za sebou táhne.
Jedna vlaštovka jaro nedělá.
Jen blbec se spálí dvakrát o stejná kamna.
Jen ten, kdo se odváží jít dál než ostatní, se dozví, jak daleko může doopravdy jít.
Jez do polosyta, pij do polopita, vyjdou ti na plno léta.
Ježek sám sobě kadeřav.
Kam čert nemůže, tam nastrčí ženskou.
Kam nechodí slunce, tam chodí lékař.
Kam oči, tam hlava, kam hlava, tam tělo.
Každá liška svůj ocas chválí.
Každá slepice hrabe pod sebe, nikdy od sebe.
Každý ať zamete nejprv před svým prahem.
Každý chvilku tahá pilku.
Kde je kozel zahradníkem, stará baba poručníkem, aby čert byl služebníkem.
Kde nic není, ani smrt nebere.
Kde rodina v rozbroji, tam je zlato na hnoji.
Kdo čerstvý sýr jí, pes ho nekousne, zloděj ho neokrade, aniž zestárne.
Kdo čočku vaří, najde si brzo holku.
Kdo dřív přijde, ten dřív mele.
Kdo hodně chce, tomu hodně schází.
Kdo chce kam, pomozme mu tam.
Kdo chce, hledá způsoby, kdo nechce, hledá důvody.
Kdo chce psa bít, hůl si vždy najde.
Kdo chce s vlky žíti, musí s nimi výti.
Kdo je zvědavý, bude brzo starý.
Kdo jinému jámu kopá, sám do ní padá.
Srovnej v Bibli: Kdo jámu kopá, do ní upadá, a kdo valí kámen, na něj se obrací.
Kdo lže, ten i krade.
Kdo má viset se neutopí, i kdyby šla voda přes šibenici
Kdo míří vysoko, padá nízko.
Kdo nemá, s kým by se vadil, pojmi sobě ženu.
Kdo nemá svý muzikanty, na hubu si píská.
Kdo neseje, ten nesklízí.
Kdo nic nedělá, nic nezkazí.
Kdo nic nemá, nic neztratí.
Kdo plevy seje, málo nažne.
Kdo po tobě kamenem, ty po do něho chlebem.
Kdo pozdě chodí, sám sobě škodí.
Kdo se bojí, nesmí do lesa.
Kdo se do ničeho nežene, nic nezkazí.
Kdo se moc ptá, moc se dozví.
Kdo se směje naposled, ten se směje nejlíp.
Kdo seje vítr, sklízí bouři.
Kdo si krká, kdo si prdí, ten si jenom zdraví tvrdí.
Kdo si svého mistra váží, na toho hlad nedoráží.
Kdo spí, jako by jedl.
Kdo šetří, má za tři.
Kdybys desetkrát chtěl, bejka nepodojíš.
Když dub padne, kdekdo třísky sbírá.
Když dva dělají totéž, není to totéž.
Když hra nejlepší, přestaň![3]
Když ne po dobru, tak po zlu.
Když pánbůh dopustí, i motyka spustí.
Když ptáčka lapají, pěkně mu zpívají.
Když se dva perou, třetí se směje.
Když se kácí les, tak lítají třísky.
Když se zapne první knoflík špatně, tak je celé zapínání špatné.
Koho Bůh miluje, toho také křížem navštěvuje.
Koho chleba jíš, toho píseň zpívej.
Koho jednou had uštknul, i stočeného provazu se bojí.
Koho včera oběsili, k tomu se dnes modlí.
Kolik řečí umíš, tolikrát jsi člověkem.
Komu není rady, tomu není pomoci.
Komu není shůry dáno, v apatyce nekoupí.
Komu se nelení, tomu se zelení.
Koně můžeš přivést k vodě, ale napít se musí sám.
Koně za ovsem běží, osli ho dostávají.
Kovářovic kobyla chodí bosa.
Kozel dlouhou bradu má, a přece není mudrc.
Kráva zajíce nedohoní.
Kuj železo, dokud je žhavé.
Láska hory přenáší.
Lenoch se nejvíc sedře.
Lehce nabyl, lehce pozbyl.
Lepší dobře se oběsit, než zle oženit.
Lepší vrabec v hrsti, nežli holub na střeše.
Levné maso psi žerou.
Lež má krátké nohy, daleko nedojde.
Líná huba – holé neštěstí.
Malé ryby – taky ryby.
Mezi slepými jednooký králem.
Mladí ležáci – staří žebráci.
Mluviti stříbro, mlčeti zlato.
Mnoho psů – zajícova smrt.
Mokro hřeje.
Mráz kopřivu nespálí.
Mrtvý prd ví.
Můj dům – můj hrad.
My o vlku a vlk za dveřmi.
Má oko jak z kašparovy krávy.
Na svatého Václava, pěkný čas nastává.
Na hrubý pytel, hrubá záplata.
Na každém šprochu pravdy trochu.
Na každou svini se vaří voda.
Na každou svini se najde řezník.
Náš zákazník, náš pán.
Naděje umírá poslední.
Nahoře huj a vespod fuj.
Nakřápnutý hrnec nejdéle vydrží.
Nebuď zvědavej, budeš brzo starej.
Nekupuj zajíce v pytli.
Nehas, co tě nepálí.
Neházej flintu do žita.
Neházej perly sviním.
Nehodí se to do řepy ani do zelí.
Nechval dne před večerem.
Někdo rád holky, jinej zas vdolky.
Někomu husu, někomu prase.
Nemluv o provaze v oběšencově domě.
Nemoc na koni přijíždí a pěšky odchází.
Nemusí pršet, stačí, když kape.
Nemůžeš kázat vodu a pít víno.
Není každý den posvícení.
Není růže bez trní.
Není všechno zlato, co se třpytí.
Neotvírej, dokud jsi neodemkl.
Nesklízej, cos nezasel.
Nesuď knihu podle obalu.
Neštěstí nechodí po horách, ale po lidech.
Nevadí, nevadí, znova se nasadí.
Nevstoupíš dvakrát do téže řeky.
Nezasel, prý aby mu kroupy nepobily.
Nové koště dobře mete.
Na jazyku med, na srdci jed.
Nikdy není tak špatně, aby nebylo ještě hůř.
Od svatého Martina, zahřeje jen peřina.
Odříkaného chleba největší krajíc.
Odvážnému štěstí přeje.
Oheň je dobrý sluha, ale zlý pán.
Oko – do duše okno.
Oko za oko, zub za zub.
Otevírej oči, nikoli ústa.
Pečení holubi nelítají do huby.
Peníze dělaj peníze.
Pes, který štěká, nekouše.
Pilná včela jaro dělá.
Plný břich, rozum tich.
Po bitvě je každý generál.
Pod svícnem bývá největší tma.
Pokroucené dřevo se těžko napřímí.
Pomocnou ruku najdeš nejspíše na konci svého ramene.
Pomoz si sám a Bůh ti pomůže.
Potmě každá kočka černá.
Potrefená husa nejvíc kejhá.
Pozdě bycha honit.
Pozdní hosti jedí kosti.
Práce kvapná málo platná.
Práce šlechtí člověka.
Prázdný sud nejvíce duní.
Pro jedno kvítí slunce nesvítí.
Prodávám jak jsem koupil.
Proti gustu žádný dišputát.
Protiklady (protivy) se přitahují.
Přátelské služby se neúčtují.
Přijít s křížkem po funuse.
Příliš mnoho psů – zajícova smrt.
Přítel k pomoci třeba o půlnoci.
Psu ocas nenarovnáš.
Ptáka poznáš po peří, vlka po srsti, člověka po řeči.
Pýcha peklem dýchá.
Pýcha předchází pád.
Ranní ptáče dál doskáče.
Ráno moudřejší večera.
Ruka ruku myje.
Ryba i host třetí den smrdí.
Ryba smrdí od hlavy.
Ryba hledá kde je hloub, člověk kde líp.
Řekni, jakého máš kamaráda, a já ti řeknu, co jsi zač.
Řemeslo má zlaté dno.
S poctivostí nejdál dojdeš.
S čím kdo zachází, tím také schází.
S chutí do toho, půl je hotovo.
S jídlem roste chuť.
S úsměvem jde všechno líp.
Sedávej panenko v koutě, budeš-li hodná, najdou tě.
Sejde z očí, sejde z mysli.
Sklenka vína ti neuškodí, a plnou bečku nevypiješ.
Slíbíš-li za druhého, dej půl svého.
Smaž hada, jak chceš, nebude z něho úhoř.
Smůla ve hře, štěstí v lásce.
Snídani sněz sám, o oběd se poděl s přítelem a večeři dej nepříteli.
Starého psa novým kouskům nenaučíš.
Stokrát nic umořilo osla.
Stokrát opakovaná lež se stává pravdou.
Strach má velké oči.
Svůj k svému.
Sytý hladovému nevěří.
Šaty dělaj člověka.
Ševcova žena a kovářova kobyla chodí bosy.
Ševče, drž se svého kopyta.
Špatný vozka, který neumí obrátit!
Škoda rány, která padne vedle.
Tak dlouho se chodí se džbánem pro vodu, až se ucho utrhne.
Těžko na cvičišti, lehko na bojišti.
Tichá voda břehy mele.
To nejlepší na konec.
Tonoucí se stébla chytá.
Trpělivost růže přináší.
Tudy cesta nevede, přes tohle vlak nejede.
Účel světí prostředky.
V hněvu vyvře, co na srdci vře.
V nouzi poznáš přítele.
Veselá mysl - půl zdraví.
Vlk se nažral a koza zůstala celá.
Vlky žene z lesů hlad.
Vojna není kojná.
Volům kroky a jelenům skoky.
Vrána k vráně sedá, rovný rovného si hledá.
Všeho nechám, už tam spěchám.
Všechna sláva, polní tráva.
Všeho s mírou.
Všechno zlé je pro něco dobré.
Všude dobře, doma nejlépe.
Vrána vráně oči nevyklove.
Výjimka potvrzuje pravidlo.
Vzduch – boží duch.
Za dobrotu na žebrotu.
Zadarmo ani kuře nehrabe.
Zahálky jsa služebníkem, neběduj, žes hadrníkem.
Z cizího krev neteče.
Zítra je taky den.
Zakázané ovoce chutná nejlépe.
Zlaté slovo, které zůstane v ústech.
Zvyk je železná košile.
Žába močál vždy najde.
Žádná píseň není tak dlouhá, aby jí nebyl konec.
Žádný strom neroste do nebe.
Žádný učený z nebe nespadl.
Žízeň je věčná.`;

module.exports = ChladkovaCommand;
