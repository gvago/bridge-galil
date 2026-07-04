# Engine Audit — OSS Bridge Engines (verified via GitHub API, July 2026)

## Matrix

| Repo | What | Lang | License | Activity | Browser? |
|---|---|---|---|---|---|
| dds-bridge/dds | Canonical double-dummy solver | C++ | Apache-2.0 | Active (pushed 07/2026) | Via WASM wrapper |
| bookchris/bridge-dds-js | WASM+TS wrapper of dds, npm `bridge-dds` 1.4.0 | TS | Apache-2.0 | Low but functional | YES, native WASM |
| lorserker/ben | ML bidding+play engine | Python | GPL-3.0 | Active | No (TF server) |
| dominicprice/endplay | Deal gen + analysis toolkit (wraps DDS) | Python | MIT | Maintained | No |
| macroxue/bridge-solver | Alt DD solver | C++ | GPL-2.0 | Low | No WASM |
| mikea/bridgitte | DD solver | Rust | GPL-3.0 | Hobby, dead | Unproven |
| oriyanh/Bridge-AI | Student project | Python | NONE | Dead 2020 | No |
| wpeisert/python-bridge-game-library | Game lib | Python | Unclear | Dead | No |
| jyang001/Bridge-Card-Game | Sim game | Python | NONE | Dead | No |
| jfklorenz/Bridge-Package | JS primitives | JS | MIT | Dead, incomplete | Trivial |
| holgus103/DDBP | DD autoencoder research | Python | NONE | Dead 2018 | No |
| Ark223/BGA | 404, repo gone | — | — | — | — |

## Tier list
- **Integrate now:** bridge-dds-js (Apache-2.0 WASM DDS in browser; vendor the .wasm to hedge single-maintainer risk).
- **Later:** dds (server-side), endplay (MIT, deal generation + PBN), ben (GPL, isolate as HTTP service).
- **Skip:** all the rest (dead / unlicensed / redundant / gone).

## Phased plan
1. **Phase 1 (client-only, fits current static site):** vendor `bridge-dds` WASM + glue, run in Web Worker. `CalcDDTablePBN` for "makeable contracts" per deal, `SolveBoardPBN` for "best card?" feedback. Pre-generate constrained deals offline with endplay, ship as static JSON/PBN.
2. **Phase 2 (server API):** FastAPI + endplay over libdds: batch DD tables, par scores, session analysis. Same PBN contract, frontend swaps worker call for fetch. Cache by deal hash.
3. **Phase 3 (AI):** ben as isolated GPL Docker service over HTTP: robot bidding feedback, robot table, post-mortem commentary. Hebrew explanation layer on top.

License posture: browser ships only Apache-2.0/MIT. GPL stays behind network boundary.
