# Conformiteitstests

Een implementatie van contextura-core is conform als ze voor elk geval in deze map hetzelfde resultaat geeft:
zelfde fouten, zelfde meldingen, zelfde graaf. De gevallen zijn gegevens (JSON), los van een taal of implementatie.

Elk geval is een bestand `<groep>/<naam>.json`:

```json
{
  "beschrijving": "Wat het geval vastlegt.",
  "functie": "brain.controleer",
  "invoer": { "bestanden": { "notes/dak.md": "---\nname: dak\n..." } },
  "verwacht": { "notes/dak.md": { "fouten": ["..."], "meldingen": [] } }
}
```

| Functie | Invoer | Verwacht |
|---|---|---|
| `brain.controleer` | `bestanden`: pad naar tekst (`null` voor een bestand zonder tekst, zoals een bijlage) | per pad met iets: `fouten` en `meldingen` |
| `brain.graaf` | `bestanden` | de graaf: `knopen`, `verbindingen`, `doodLinks`, `bundels`, `kleuren` |
| `twin.controleer` | `twin`: de inhoud van `twin.json` | `fouten` |
| `export.toets` | `bestanden`, optioneel `taal` (`nl` of `en`) | `geldig`, `bevindingen` (pad, soort, ernst, tekst), `aantallen` |
| `register.sporen` | `register` (de inhoud van `projecten.json`) en `brain` | de sporen |

JSON-bestanden in de root (`bundels.json`, `lezers.json`, `twin.json`, `brain.json`, `metingen.json`) staan als tekst
in `bestanden`; bijlagen zijn de paden onder `attachments/`. De controle van een brain hangt af van de dag (geen datum
in de toekomst): de gevallen gebruiken alleen datums in het verleden, of een datum ver in de toekomst.

Geen geval met een echte sleutel of token: zo'n bestand zou zelf een geheim bevatten. De herkenning van geheimen staat
in de specificatie (§12) en in de eenheidstests van de referentie-implementatie.

`conformiteit.ts` is de uitvoerder van de referentie-implementatie: hij koppelt een geval aan haar functies. Een andere
implementatie schrijft haar eigen uitvoerder en vergelijkt haar resultaat met `verwacht`.
