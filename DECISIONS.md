
## 2026-08-16 — צינור קול לנפתלי: NotebookLM → Seed-VC
**החלטה:** קריינות שיעורים = NotebookLM (עברית טבעית, Output language=עברית) → Seed-VC zero-shot conversion על ה-Mac mini עם רפרנס של נפתלי (n1.wav, 35s) → אודיו בקולו. אושר ע"י גיא ("yes") על קטע 65s.
**פרמטרים:** diffusion-steps 50, length-adjust 1.0, cfg-rate 0.7, target=/tmp/naftali_train/n1.wav.
**נדחו:**
- MiniMax 2.6/2.8 voice-clone (fal) — נקי אבל "לא לגמרי הוא"; גם דורש קרדיט (חשבון נעול).
- RVC/Replay v1+v2 (גם עם synthetic bootstrap מ-7B) — הגייה עוברת אבל זהות גנרית; conditioning דק מדי.
- VibeVoice 1.5B/7B ישירות בעברית — 7B הוא "בדיוק הוא" בקול אבל עברית לא קריאה; ניקוד מלא רק הרע.
- שכפול/הדבקה של סמפלים לאימון — אפס אינפורמציה חדשה, נדחה עקרונית.
**הערות:** מונחי ברידג' בתסריט נשארים באנגלית (2 Clubs, Hearts). תיקון ב-inference.py: soundfile במקום torchaudio.save (torchcodec dylib שבור מול torch 2.13).
