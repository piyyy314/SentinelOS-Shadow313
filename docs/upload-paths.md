# Upload Paths

Use these tracked placeholder directories when adding large sets of project files. Keeping a predictable upload map prevents broken references in the static HTML apps and makes future asset imports easier to review.

## SentinelOS dashboard

| Path | Use for |
| --- | --- |
| `sentinelos/assets/images/` | Dashboard imagery, screenshots, icons, and generated visual assets used by `sentinelos/index.html` or `sentinelos/styles.css`. |
| `sentinelos/assets/data/` | Static JSON, CSV, or text fixtures used by SentinelOS views and simulations. |
| `sentinelos/assets/models/` | Demo model metadata, classifier fixtures, and safe mock analysis artifacts. |
| `sentinelos/assets/payloads/` | Safe malware-sandbox sample descriptors and non-executable payload fixtures. Do not commit live malware. |
| `sentinelos/assets/samples/` | Media samples for deepfake, RF, or forensic demos. |

## SHADOW313 landing page

| Path | Use for |
| --- | --- |
| `shadow313/assets/images/` | Landing-page imagery, logos, screenshots, and marketing visuals. |
| `shadow313/assets/data/` | Static demo data consumed by the SHADOW313 page. |
| `shadow313/assets/circuits/` | Quantum-circuit examples, QASM snippets, and simulator fixtures. |
| `shadow313/assets/transcripts/` | Example QTE conversations, demo prompts, and generated output transcripts. |

## Reference rules

- Prefer relative paths from the file that uses the asset, for example `assets/images/example.png` inside `sentinelos/index.html`.
- Use root-relative paths only when the file must be shared across app folders.
- Keep secrets, private keys, tokens, and real exploit payloads out of these directories.
- Add a short note in the pull request when uploaded files are generated or externally sourced.
