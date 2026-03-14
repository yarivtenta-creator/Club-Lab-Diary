# The Club Lab — מערכת ניהול ו-Landing Page

## קבצים
- `server.js` — שרת Node.js ראשי
- `api/` — נתיבי API (תורים, לקוחות, לו"ז)
- `public/index.html` — Landing page ללקוחות
- `public/admin/index.html` — אפליקציית ניהול לבן

## הוספת תמונות
העתק את הקבצים האלה לתיקיית `public/images/`:
- `logo.jpg` — לוגו The Club Lab (עיגול)
- `bg_main.png` — תמונת האוזניות

## התקנה מקומית
```bash
npm install
npm start
```
האתר יעלה על http://localhost:3000
ניהול על http://localhost:3000/admin

## Deploy ל-Vercel
1. Push לגיטהאב
2. חבר את הריפו ב-vercel.com
3. הוסף Environment Variable:
   - Key: `MONGODB_URI`
   - Value: `mongodb+srv://clublab-admin:ClubLab2026@cluster0.w3g7fyq.mongodb.net/clublab?retryWrites=true&w=majority&appName=Cluster0`
4. Deploy!

## כתובות
- Landing page: `https://club-lab-diary.vercel.app`
- Admin: `https://club-lab-diary.vercel.app/admin`
