# contextura-core

Een open formaat voor een persoonlijke kennisbank die een AI-assistent kan lezen en aanvullen: een
**brain** (notities in Markdown met frontmatter, hubs, links en bijlagen), een **persona** (het deelbare,
contextvrije deel ervan), **kennispakketten**, de **twin**, **lezers** en **bundels** (wat gedeeld mag
worden en wat nooit), **tegels** en **apps**, het **register** van een werkplek en het **exportformaat**.

Een brain is een gewone map met tekstbestanden: leesbaar zonder speciale software, te beheren met git,
te openen in elke editor. Deze standaard legt vast wat een geldige brain is, zodat verschillende
programma's dezelfde brain op dezelfde manier lezen, controleren en delen.

## Inhoud

| Pad | Wat |
|---|---|
| [`specificatie.md`](specificatie.md) | De specificatie (versie 0.14, concept) |
| [`schema/`](schema/) | JSON Schema's voor de bestanden die de specificatie beschrijft |
| [`conformiteit/`](conformiteit/) | De conformiteitstests: gevallen als gegevens (invoer en verwacht resultaat), los van een taal |
| [`docs/`](docs/) | De site op https://schema.contextura.io: elk schema op zijn `$id` (`<naam>/<versie>.json`), gemaakt uit `schema/` |

## Status

Concept. Tot versie 1.0 kan het formaat nog veranderen; elke versie staat bovenaan de specificatie. Een
implementatie is conform als ze voor elk geval in `conformiteit/` hetzelfde resultaat geeft. De
referentie-implementatie (pure functies in TypeScript, zonder bestanden of processen, met de uitvoerder van de
gevallen) verschijnt in deze repo met versie 1.0.

De specificatie is in het Nederlands.

## Licentie

- De tekst van de specificatie: [CC BY 4.0](LICENSE) (vrij te gebruiken, te implementeren en te citeren,
  met naamsvermelding).
- De schema's in `schema/` en de gevallen in `conformiteit/`: MIT ([schema/LICENSE](schema/LICENSE),
  [conformiteit/LICENSE](conformiteit/LICENSE)), zodat een implementatie ze zonder voorwaarden kan inbouwen.

© 2026 BIJDT
