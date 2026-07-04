# Engine Audit — סיווג סופי (מקורות: GitHub API, יולי 2026. אפס ניחושים)

## 4 קטגוריות

### 1. שילוב מיידי
| Repo | License | למה |
|---|---|---|
| bookchris/bridge-dds-js (npm `bridge-dds` 1.4.0) | Apache-2.0 | DD solver אמיתי בדפדפן (dds מקומפל ל-WASM). API מאומת מה-README: `SolveBoardPBN`, `CalcDDTablePBN`, `AnalysePlayPBN`, `DealerPar` + דוגמת Web Worker. סיכון יחיד: מתחזק בודד → מגודר ע"י vendoring של ה-.wasm |
| dominicprice/endplay | MIT | חילול ידיים עם אילוצים + PBN + ניתוח DD. שימוש offline לייצור תוכן סטטי (חבילות ידיים לתרגילים). לא נדרש בדפדפן |

### 2. מתאים ל-PoC
| Repo | License | למה |
|---|---|---|
| dds-bridge/dds | Apache-2.0 | ה-upstream. שימוש ישיר צד-שרת (דרך endplay) כשנפח הניתוח יעלה על הדפדפן. פעיל (push 07/2026) |
| lorserker/ben | GPL-3.0 | ה-AI היחיד הרציני בקוד פתוח להכרזות+משחק. דורש Python+TensorFlow server. PoC כשירות HTTP מבודד (GPL לא מזהם את הקוד שלנו מאחורי network boundary) |

### 3. מחקר/השראה בלבד
| Repo | סיבה |
|---|---|
| macroxue/bridge-solver | GPL-2.0, אין WASM build מפורסם. השראה לאלגוריתמיקה בלבד |
| mikea/bridgitte | GPL-3.0, hobby, לא מוכח. השראה ל-Rust→WASM אם אי פעם נרצה solver עצמאי |
| holgus103/DDBP | ללא רישיון, מת מ-2018. הרעיון (רשת שמעריכה DD tricks) רלוונטי ל-V3 |
| oriyanh/Bridge-AI | ללא רישיון (פרויקט סטודנטים). Minimax/MCTS כרפרנס רעיוני בלבד |

### 4. לא מתאים
| Repo | סיבה |
|---|---|
| wpeisert/python-bridge-game-library | מת, רישוי לא ברור, 0 כוכבים |
| jyang001/Bridge-Card-Game | מת, ללא רישיון |
| jfklorenz/Bridge-Package | MIT אבל נטוש ולא גמור; פרימיטיבים של קלפים = פחות עבודה לכתוב לבד (וכבר כתבנו: bridge.js) |
| Ark223/BGA | 404, לא קיים |

## טבלת החלטה: מנוע ↔ use case

| Use case | מנוע | איפה רץ | שלב |
|---|---|---|---|
| טבלת "חוזים ניתנים לביצוע" לכל חלוקה | bridge-dds-js `CalcDDTablePBN` | דפדפן (Worker) | V2 |
| משוב "הקלף הטוב ביותר" בתרגול משחק יד | bridge-dds-js `SolveBoardPBN` | דפדפן (Worker) | V2 |
| Par contract viewer | bridge-dds-js `DealerPar` | דפדפן | V2 |
| חילול ידיים עם אילוצים (למשל "15-17 מאוזנת") | endplay | offline → JSON סטטי | V1.5 |
| ניתוח סשן מלא / batch גדול | dds via endplay + FastAPI | שרת | V2.5 |
| "מה הרובוט היה מכריז?" | ben | שרת GPL מבודד | V3 |
| פרשנות post-mortem למשחק | ben + dds | שרת | V3 |
| חידוני הכרזה/HCP/אתגר יומי | bridge.js שלנו | דפדפן | V1 ✅ קיים |

כלל רישוי: לדפדפן נשלח רק Apache-2.0/MIT. GPL חי מאחורי HTTP בלבד.
