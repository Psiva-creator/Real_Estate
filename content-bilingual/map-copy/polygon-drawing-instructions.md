# Plot Boundary Map Copy & Tooltips

> TICKET-CNT-102 — Polygon Drawing UI copy for both English and Telugu locales.

---

## English Copy

| Key | Value |
|-----|-------|
| **heading** | Mark Plot Boundary on Map |
| **instructions** | Click on map corners to outline the plot boundary. Drag points to adjust. Click the first point again to close the polygon. |
| **tooltipOnClick** | Click to place boundary point |
| **clearButton** | Clear & Redraw Boundary |
| **areaLabel** | Approximate Plot Area |

---

## Telugu Copy (తెలుగు కాపీ)

| కీ | విలువ |
|----|-------|
| **heading** | మ్యాప్లో ప్లాట్ సరిహద్దును గుర్తించండి |
| **instructions** | భూమి సరిహద్దులను గుర్తించడానికి మ్యాప్ మూలలపై క్లిక్ చేయండి. పాయింట్లను సర్దుబాటు చేయవచ్చు. పాలిగాన్ మూసివేయడానికి మొదటి పాయింట్పై మళ్లీ క్లిక్ చేయండి. |
| **tooltipOnClick** | సరిహద్దు పాయింట్ ఉంచడానికి క్లిక్ చేయండి |
| **clearButton** | సరిహద్దు తొలగించి మళ్లీ గీయండి |
| **areaLabel** | అంచనా ప్లాట్ విస్తీర్ణం |

---

## JSON Keys (added to locale files)

These keys live under the `mapCopy` namespace in both `en/common.json`, `te/common.json`,
`frontend/public/locales/en/common.json`, and `frontend/public/locales/te/common.json`.

```json
// English  (en)
"mapCopy": {
  "polygonHeading": "Mark Plot Boundary on Map",
  "polygonInstructions": "Click on map corners to outline the plot boundary. Drag points to adjust. Click the first point again to close the polygon.",
  "polygonTooltipClick": "Click to place boundary point",
  "polygonClearButton": "Clear & Redraw Boundary",
  "polygonAreaLabel": "Approximate Plot Area"
}

// Telugu (te)
"mapCopy": {
  "polygonHeading": "మ్యాప్లో ప్లాట్ సరిహద్దును గుర్తించండి",
  "polygonInstructions": "భూమి సరిహద్దులను గుర్తించడానికి మ్యాప్ మూలలపై క్లిక్ చేయండి. పాయింట్లను సర్దుబాటు చేయవచ్చు. పాలిగాన్ మూసివేయడానికి మొదటి పాయింట్పై మళ్లీ క్లిక్ చేయండి.",
  "polygonTooltipClick": "సరిహద్దు పాయింట్ ఉంచడానికి క్లిక్ చేయండి",
  "polygonClearButton": "సరిహద్దు తొలగించి మళ్లీ గీయండి",
  "polygonAreaLabel": "అంచనా ప్లాట్ విస్తీర్ణం"
}
```
