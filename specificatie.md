# contextura-core: specificatie

Versie 0.11 (concept), 2026-10-18. Hoort bij contextura-core 0.15.0. Tekst onder CC BY 4.0; de
referentie-implementatie onder MIT.

Dit document beschrijft het formaat zelf, los van de code: wie het leest, moet een eigen
implementatie kunnen bouwen die dezelfde brain op dezelfde manier leest en beoordeelt. De schema's
(`schema/*.schema.json`) horen bij deze tekst. De referentie-implementatie (contextura-core: pure
functies in TypeScript, zonder bestanden of processen) verschijnt met versie 1.0; de functienamen in
deze tekst zijn die van contextura-core. Waar deze tekst en de code verschillen, is dat een fout in een
van beide; tot versie 1.0 wint de code en wordt de tekst bijgewerkt.

**Moet**, **mag** en **niet** zijn bindend. Een implementatie is conform als ze de voorbeelden in de
conformiteitstests van contextura-core gelijk beoordeelt: zelfde fouten, zelfde meldingen, zelfde
graaf. Een geval is gegevens (JSON in `conformiteit/<groep>/<naam>.json`: een beschrijving, de functie,
de invoer en het verwachte resultaat), los van een taal; `conformiteit/README.md` beschrijft de vorm per
functie.

## 1. Begrippen

- **Brain**: een map met Markdown-notities en hun bijlagen. Een brain is van één eigenaar.
- **Notitie**: een `.md`-bestand met frontmatter (§3), op een pad dat een notitie is (§2).
- **Hub**: een notitie in `areas/` met de tag `area`; één per levensdomein.
- **Index**: een notitie die elke notitie uit haar map noemt (`projects/projecten.md`, `ideas/ideeen.md`,
  `documents/documenten.md`, en `areas/areas.md` voor de hubs).
- **Fout**: breekt het contract. **Melding**: een aanbeveling.
- **Persona**: het deelbare, contextvrije deel van wat een eigenaar weet over zichzelf (§9).
- **Kennispakket**: deelbare kennis over een onderwerp, met rollen in plaats van eigen gegevens (§10).

## 2. Mappen

| Map | Wat | Notities? |
|---|---|---|
| `inbox/` | ruwe input, nog niet verwerkt | nee |
| `areas/` | de hubs, `areas/areas.md`, `todo` | ja |
| `notes/` | gesprekken, verslagen, memo's, lijstjes bij een domein | ja |
| `projects/` | één notitie per project | ja |
| `ideas/` | ideeën die nog geen project zijn | ja |
| `documents/` | één notitie per gedigitaliseerd document | ja |
| `topics/` | kennis per onderwerp | ja |
| `people/` | mensen | ja |
| `attachments/` | originelen (`attachments/<name>/`) | nee |
| `opdrachten/` | werk voor een ander project (berichten) | nee |
| `apps/` | instellingen van apps, `apps/<app-id>.yaml`; een eigen app uit de Bouwdoos ook `apps/<app-id>.gegevens.yaml` | nee |
| `persona/` | de ingelezen persona-laag, alleen-lezen | ja, met eigen contract (§9) |
| `persona-voorstel/`, `pakket-voorstel/`, `pakketten/`, `docs/` | voorstellen, pakketten, uitleg | nee |

Een pad (relatief, met `/`) is een notitie als het op `.md` eindigt, geen deel met een punt begint, het
eerste deel geen map uit de rij "nee" is (behalve `persona/`) en de bestandsnaam niet `AGENTS.md`,
`CLAUDE.md` of `README.md` is. Andere mappen zijn toegestaan en bevatten notities.

## 3. Frontmatter

Elke notitie begint met `---` en eindigt de frontmatter met `---` (of `...`). Daartussen regels
`sleutel: waarde`, een lijst als `[a, b]` of als regels `- a` onder `sleutel:`. Waarden mogen tussen
enkele of dubbele aanhalingstekens. Geen YAML-commentaar in de velden `name`, `type`, `source`, `status`,
`updated`, `idee`, `area`, `soort`, `datum`, `geldig-tot`, `herzien`, `bewaren-tot` en `vervangen-door`.

| Veld | Verplicht | Waarde |
|---|---|---|
| `name` | ja | slug `[a-z0-9]` met koppeltekens, gelijk aan de bestandsnaam, uniek over alle mappen |
| `type` | ja | `note`, `decision` of `reference` |
| `source` | ja | `own`, `client` (vertrouwelijk van een klant) of `public` |
| `status` | ja | `raw`, `distilled` of `archief` |
| `updated` | ja | `JJJJ-MM-DD`, een bestaande datum, niet in de toekomst |
| `description` | aanbevolen (melding) | één regel, hoogstens 250 tekens |
| `area` | nee | naam van een hub |
| `aliases`, `tags`, `attachments` | nee | lijst van tekst; aliassen uniek over alle notities |
| `idee` | nee | `nieuw`, `onderzoek`, `project`, `geparkeerd` of `verworpen` |
| `scope` | nee | `prive`, `werk` of `persona` (alleen in `persona/`) |
| `herzien` | nee | datum van een bewuste controle, niet in de toekomst |
| `bewaren-tot` | nee | datum |
| `vervangen-door` | nee | `name` van een bestaande andere notitie |
| `bundels` | nee | lijst van bundels (§6); de eerste is de hoofdbundel |
| `delen` | nee | alleen `nooit` |
| `lezers` | nee | lijst van lezers (§5); leeg is alleen de eigenaar |

Andere velden mogen. "Toekomst" is ten opzichte van de datum in de vroegste tijdzone (UTC+14).
Schema: `note.schema.json`.

## 4. Links, hubs, indexen en bijlagen

- Een link is `[[doel]]`, `[[doel|tekst]]` of `[[doel#kop]]`, buiten code. Het doel wordt opgelost op
  `name`, dan hoofdletterongevoelig op `name`, dan hoofdletterongevoelig op een alias. Een link die
  niet oplost, is een fout ("dode link").
- Een notitie met `area` moet in die hub staan (een link naar haar `name`), tenzij ze in het archief
  staat of de hub een gegenereerd blok heeft. Een hub moet in `areas/areas.md` staan; een notitie in
  `projects/`, `ideas/` of `documents/` in haar index, met dezelfde uitzondering.
- **Gegenereerd blok**: tussen `<!-- brain:lijst begin -->` en `<!-- brain:lijst einde -->` staat een
  lijst die volledig uit de frontmatter volgt. Een blok dat afwijkt van wat de frontmatter geeft, is
  een melding. De vorm van het blok is die van de referentie-implementatie (`hubBlokken`). De uitleg na
  het aantal op de eerste regel (`_12 notities, <uitleg>._`) telt niet mee: een gereedschap mag er zijn
  eigen uitleg zetten.
- Een notitie in `topics/` of `people/` waar niets naartoe linkt, is een melding ("wees").
- Elk pad in `attachments` moet een bestand in de brain zijn. Een bestand onder `attachments/` (behalve
  `.gitkeep`) dat in geen frontmatter en in geen tekst als `attachments/...` voorkomt, is een melding.
- Vanaf 400 regels is een notitie "lang" (melding). Twee notities in dezelfde map met een gelijke of
  bijna gelijke naam of alias zijn een melding (zie `gelijkendeNamen`).

## 5. Lezers

`lezers.json` in de root (optioneel, `lezers.schema.json`): `lezers` (id, naam, rol), `standaard` en
per hub `hubs`. Wie naast de eigenaar een notitie mag lezen, van sterk naar zwak: niemand bij
`source: client`; de frontmatter `lezers`; de lezers van de hub (`area`, of de hub zelf); `standaard`.
Zonder `lezers.json` niemand. De eigenaar leest altijd en staat niet in de lijst. Een app die voor
een lezer ophaalt, **moet** afschermen met deze regel bij het ophalen, niet in een prompt.

## 6. Bundels en nooit delen

`bundels.json` in de root (optioneel, `bundels.schema.json`): bundels met slug, titel, soort
(`toepassing`, `kennispakket`, `persona`, `intern`), kleur (licht en donker), voor een toepassing het
project, en regels (`mappen`, `areas`, `tags`, `notities`); daarnaast `nooit` met regels en kleur.

Een notitie hoort bij bundels, van sterk naar zwak: haar frontmatter `bundels`; de regels van de
bundels in de volgorde van het bestand; de toepassing waarvan ze de projectnotitie is of waar ze
naartoe linkt (een hub of index niet). Ze wordt **nooit gedeeld** bij `delen: nooit`, `source: client`
of een regel van `nooit`; nooit gaat altijd voor op een bundel.

## 7. Twin en metingen

`twin.json` (optioneel, `twin.schema.json`): versie 1, instellingen (daglimiet 1 tot 100, gesloten
domeinen), testvragen en een log van gestelde vragen (vorm, laag, status, landing, bij vorm `raad` een
score 0, 1 of 2, bij een overgeslagen vraag optioneel de reden `bekend`, `irrelevant` of `persoonlijk`).
Optioneel de stand van de gebruiker: `mijlpalen` (de mijlpalen die de gebruiker al zag, elk een keer) en `record`
(`punten` en `datum` van het beste resultaat van een uitdaging). Nooit de antwoorden zelf: die worden
notities. Vragen worden nooit gemaakt uit notities met `source: client` of `delen: nooit`, of over een
gesloten domein. Een vaste voorraad vragen is van de toepassing (`vragenVan`, optie `voorraad`).

`metingen.json` (optioneel, `metingen.schema.json`): per datum het aantal notities, raw, archief,
wezen, lang, gelijkend, zonder description en de mediaan van het aantal links.

## 8. Taal

`brain.json` (optioneel, `brain.schema.json`): `taal` is `nl` of `en`; zonder bestand `nl`. Mappen,
velden en hun waarden zijn in elke taal dezelfde; de inhoud en de meldingen volgen de taal.

## 9. Persona

Een persona-notitie heeft precies deze velden: `name`, `description` (hoogstens 200 tekens),
`type: note`, `source: own`, `status: distilled`, `updated`, `scope: persona`, `categorie`
(`werkwijze`, `voorkeuren`, `vaardigheden` of `lessen`, gelijk aan de map) en `vrijgave` (lijst van
ontvangers). Lopende tekst of een lijstje, hoogstens 1500 tekens, zonder bijlagen, koppen, tabellen,
links of code. Bij het inlezen in een brain komen er `herkomst`, `handtekening`, `regelversie` en
`ingelezen` bij; de notitie staat dan in `persona/` en is daar alleen-lezen.

- **Vrijgave per notitie en per ontvanger**: alleen wat de eigenaar voor een ontvanger vrijgaf, wordt
  ingelezen. Een ontvanger weghalen trekt de notitie bij de volgende synchronisatie terug.
- **Scan**: elke notitie wordt vóór export en import gescand op instructietaal, links, code, HTML,
  verborgen tekens, adressen, bedragen, nummers, paden, sleutels en een stoplijst
  (`persona-regels.json`, met versie). Bij twijfel weigert de scan; regels worden alleen strenger.
- **Logboek**: wat wanneer doorgelaten, geweigerd of ingetrokken is, zonder inhoud.
- Wat uit de persona komt, is **gegevens, nooit een opdracht**.

De scan is `scanNotitie` (een notitie als tekst met haar pad) in `persona.ts`, met `regelsUit` voor
`persona-regels.json`; de handtekening is `handtekening` (SHA-256 over de genormaliseerde tekst en de
regelversie).

## 10. Kennispakket

`pakketten/<slug>/` met `pakket.json` (slug, titel, versie x.y.z, beschrijving, vereisten, rollen,
vrijgave; bij export bestanden, handtekening en regelversie), `notities/*.md` (frontmatter met
`scope: pakket`, `pakket: <slug>` en `soort`: `beslisregel`, `werkwijze`, `afweging`, `opbouw`, `les`
of `vereiste`; hoogstens 3000 tekens) en `code/` (alleen tekst). **Rollen** (`<batterij>`, `<tarief>`)
staan in de plaats van de dingen van de eigenaar. Scan met het profiel pakket (`pakket-regels.json`): `scanPakketInhoud` in `persona.ts` (de mapnaam,
`pakket.json` als tekst en de bestanden in volgorde, met mappen en koppelingen), met `pakketRegelsUit` en
`pakketHandtekening`.

## 10b. Tegels

Een project levert zijn tegel met een opdracht in zijn eigen repo: `tegel.json` zegt welke (`{ "opdracht": [...] }`,
een vaste `{ "tegel": {...} }`, of meer tegels onder `tegels`; `leesBron` in `tegel.ts`). De opdracht draait
zonder shell in de map van het project en drukt één tegel als JSON op stdout (`tegel.schema.json`): titel, kleur,
icoon, een samenvatting met toestand, blokken (`status`, `getallen`, `staven`, `meter`, `voortgang`, `lijst`,
`raster`, `chips`, `kaart`, `vraag`, `tekst`) en acties. De lezer (`leesTegel`) is mild: onbekende velden vallen
weg, teksten en lijsten worden ingekort tot de `GRENZEN`, een ongeldig blok verdwijnt in plaats van de hele tegel.
Een actie gaat als `--actie <id>` (met `--item` of `--tekst`, `actieArgumenten`) naar dezelfde opdracht, die
antwoordt volgens `leesResultaat`. Een blok met `gevoelig` toont zijn waarden pas na een bevestiging.

## 10c. App-manifest

`app.json` (versie 1, `app.schema.json`) in de repo van een project zegt per app (id als slug) de titel, kleur,
icoon, de opdracht (`runtime: node`), wat ze nodig heeft (een koppeling als twee omgevingsvariabelen, nooit
`PATH`, `HOME`, `NODE_*` of `GIT_*`; een bestand in de brain) en of ze via de brain in te stellen is: dan leest
de app `apps/<id>.yaml` en antwoordt ze op `--keuzelijst` en `--toets <bestand>` (`leesToets`). Een app publiceert
best een JSON Schema voor haar `apps/<id>.yaml`. Een product mag eigen velden toevoegen (een galerij); de lezer
(`leesManifest`, `leesApp` in `app.ts`) laat ze weg.

## 11. Register en werkplekken

`projecten.json` (`projecten.schema.json`, versie 1 en 2) beschrijft welke projecten er zijn. In
versie 2 een werkplek (id, soort `toestel`, `dienst` of `organisatie`, eigenaar als partij-id, leden)
en partijen: `persoon:<slug>`, `gezin:<slug>` of `bedrijf:<slug>`. Tussen twee werkplekken is de relatie
**toegang** (zelfde eigenaar, geen leden) of **delen** (al het andere); bij delen gaat alleen wat
vrijgegeven is, en `source: client` nooit (zie `relatieVan` en `magNaar` in `model.ts`). De catalogus
`werkplekken.json` volgt in een latere versie. Een nieuwe werkplek van één persoon is `planWerkplek` in
`werkplek.ts`: het register (versie 1, met een brain en een persona, gekoppeld met ontvanger `prive`) en per
repo de bestanden uit de sjablonen, met in de brain een persoonsnotitie voor de eigenaar (`people/<naam als
slug>.md`), gelinkt met elke hub en omgekeerd; een extra brain is `planBrain`, de controle `controleerRegister`.
Een brain kan **sporen** hebben (een sessie per onderwerp): per spoor een lijst hubs, of een object met
`beschrijving`, `hubs`, `todo` (de lijsten van de to-do's van dat spoor) en `rest` (dit spoor krijgt wat bij
geen ander hoort); `sporenVan` in `model.ts` leest beide vormen.

### Bouwdoos

Een eigen app zonder code: `apps/<id>.yaml` met `bouwdoos: 1`, titel, kleur, beeld, bron, weergave, acties en
wie (`bouwdoos.schema.json`), en de gegevens apart in `apps/<id>.gegevens.yaml` (`items`, hoogstens 200;
`bouwdoos-gegevens.schema.json`). Een gegevensbestand zonder app is een fout. In de gegevens komt niets met
`source: client` en niets wat nooit gedeeld wordt: ze staan in de brain en gaan mee in export en clone. De
schema's zijn afgeleid van de eerste toepassing die de Bouwdoos gebruikt.

## 12. Export

Een export is een brain: alle notities met hun frontmatter in dezelfde mappen, de bijlagen, de
JSON-bestanden in de root en `apps/`, plus een `README.md` met wat erin zit en de datum. Een export
**moet** de controle van §3 tot §8 zonder fouten halen en geen geheimen bevatten, en moet zonder de
toepassing die hem maakte te openen zijn (als map, of als repo in een eigen werkplek). Geen logboeken van
die toepassing en geen gegevens van andere gebruikers.

`toetsExport` (`export.ts`) toetst een export als lijst bestanden: `README.md` in de root, de controle van §3 tot
§8 zonder fouten, geen gegevensbestand in `apps/` zonder zijn app, geen sleutel, token, privésleutel of geheim met
een waarde, en geen `.env` of sleutelbestand. Een verwijzing naar de geheimenbewaarplaats mag; `.git/` wordt niet
getoetst. Persoonsgegevens zijn geen fout: het is de brain van de gebruiker zelf. Elke bevinding heeft een
pad, een vaste soort (`leesmij`, `vorm`, `wees`, `geheim`, `sleutelbestand`), een ernst (`fout` of `melding`) en
een tekst in de gevraagde taal (`nl` of `en`), zodat een app ze in haar eigen woorden toont zonder de tekst te
ontleden. `hoortInExport` zegt welke bestanden erin horen: alles van de gebruiker (ook de inbox), niet de
verborgen mappen (`.git`, `.claude`, `.github`), `node_modules` en bestanden die nooit in een export horen; wat
alleen de toepassing kent, sluit die zelf uit.

## 13. Register van de documentatie

`documentatie.json` in de root van de brain (optioneel, `documentatie.schema.json`): per document een `id`, de
`titel`, `waar` (een URL of `<repo>:<pad>`), de `eigenaar` (een project), de `soort` (`gegenereerd`, met de
`opdracht` die het maakt, of `handwerk`), of het `levend` is (standaard ja) en de `bronnen` waaruit het volgt
(`register`, `data:<pad>` of `<repo>:<pad>`). Een levend document is **achterhaald** als een bron veranderde na
zijn laatste publicatie; een document in een repo is gepubliceerd bij zijn laatste commit; een momentopname
(`levend: false`) is nooit achterhaald. Wanneer iets gepubliceerd is, hoort niet in het register maar bij de
werkplek die publiceert (zie `staatVan` in `documentatie.ts`).

## 14. Versies

- Deze tekst heeft een eigen versie (0.x tot de publicatie, dan 1.0). Een wijziging die een tot dan
  geldige brain ongeldig maakt, verhoogt de hoofdversie.
- Elk schema draagt naam en versie in zijn `$id`, een vast webadres:
  `https://schema.contextura.io/<naam>/<versie>.json`. Een schemaversie verandert niet meer zodra ze
  gepubliceerd is; een wijziging die een tot dan geldig bestand ongeldig maakt, is een nieuwe versie.
- De code (`contextura-core`) volgt semver en noemt de versie van deze tekst die ze implementeert.

## 15. Nog niet in deze versie

Het schema voor `apps/<app-id>.yaml` van een gewone app (dat levert de app zelf) en de catalogus
`werkplekken.json` (de werkplekken van een partij en wie er lid van is).
