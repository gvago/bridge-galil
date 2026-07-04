# ברידג' גליל — פלטפורמת לימוד ברידג' בעברית

אתר סטטי מלא (ללא build, ללא backend) עבור נפתלי קריספיס.

## הרצה מקומית
```bash
cd site && python3 -m http.server 8080
# http://localhost:8080
```

## פריסה
כל static host: Netlify / GitHub Pages / Cloudflare Pages. מעלים את תיקיית `site/` כפי שהיא.
לפני עלייה לאוויר, חפשו `TODO` בקוד:
- טלפון אמיתי (כרגע 050-000-0000) בכל המקומות + קישור וואטסאפ
- מייל אמיתי (כרגע naftali@example.com)
- מחירי קורסים סופיים
- המלצות תלמידים אמיתיות
- דומיין אמיתי ב-sitemap.xml + robots.txt (כרגע bridgegalil.example)

## מבנה
```
site/
  index.html            דף בית
  about.html            אודות נפתלי
  courses.html          קורסים ומחירים
  contact.html          יצירת קשר (טלפון/וואטסאפ/מייל)
  learn/                מרכז ידע: 4 שיעורי יסוד + 3 מאמרי העמקה
  practice/             תרגול: חידון הכרזות + ספירת נקודות
  css/main.css          מערכת עיצוב (RTL, קהל 55+)
  js/bridge.js          מודל קלפים: חלוקה, HCP, צורה
  js/quiz.js            מנוע חידונים + מחולל שאלות
  js/include.js         header/footer משותפים
docs/
  PRD.md                אסטרטגיה, ארכיטקטורה, sitemap, הנחות
  research-competitors.md  audit מתחרים
  research-engines.md      audit מנועי קוד פתוח + roadmap שילוב
```

## הרחבות מתוכננות (Phase 2+)
ראו docs/research-engines.md: double-dummy solver בדפדפן, שרת ניתוח, AI הכרזות.
