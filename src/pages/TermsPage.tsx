import { Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Navbar */}
      <nav className="fixed top-0 right-0 left-0 z-40 border-b border-border/30 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <span className="font-heading text-lg font-bold text-foreground">ZenTrade</span>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight className="h-3.5 w-3.5" />
            חזרה לעמוד הראשי
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-20 md:px-8">
        <div className="mb-10 md:mb-14">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Legal</p>
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            הסכם תנאי שימוש ותקנון
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">עדכון אחרון: אפריל 2026</p>
        </div>

        <div className="space-y-10 md:space-y-12">
          {/* Intro */}
          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5 md:p-7">
            <p className="text-xs md:text-sm leading-[2] text-foreground/85">
              ברוכים הבאים לאפליקציית ZenTrade (להלן: "האפליקציה", "המערכת" או "החברה"). השימוש באפליקציה, במידע, בכלים המבוססים על בינה מלאכותית (AI) ובכל שירות אחר המוצע בה, כפוף לתנאי השימוש המפורטים להלן.
            </p>
            <p className="mt-3 text-xs md:text-sm leading-[2] text-foreground/85">
              עצם ההרשמה, הכניסה או השימוש באפליקציה מהווים הסכמה מוחלטת ובלתי חוזרת מצד המשתמש (להלן: "המשתמש" או "הסוחר") לכל האמור בתקנון זה. אם אינך מסכים לתנאי כלשהו מתנאים אלו, הנך מתבקש לחדול מיד מכל שימוש באפליקציה.
            </p>
          </section>

          {/* Section 1 */}
          <TermsSection number="1" title="היעדר ייעוץ פיננסי או ייעוץ השקעות (Disclaimers)">
            <TermsItem num="1.1">
              <strong>המערכת אינה יועץ השקעות:</strong> האפליקציה, לרבות כלי הבינה המלאכותית (AI), הניתוחים, הסטטיסטיקות, היומן הכלכלי וכל מידע אחר המוצג בה, נועדו למטרות לימודיות, חינוכיות וסטטיסטיות בלבד.
            </TermsItem>
            <TermsItem num="1.2">
              המערכת אינה מספקת, בשום צורה ואופן, ייעוץ השקעות, המלצות קנייה/מכירה של ניירות ערך, מט"ח, קריפטו, מדדים או כל נכס פיננסי אחר.
            </TermsItem>
            <TermsItem num="1.3">
              <strong>אחריות בלעדית על הפסדים:</strong> מסחר בשוק ההון כרוך בסיכון גבוה מאוד ועלול להוביל להפסד כל ההון המושקע. המשתמש מצהיר כי הוא מקבל החלטות מסחר על דעתו ובאחריותו הבלעדית. החברה, מנהליה, עובדיה ושותפיה לא יישאו בשום אחריות, ישירה או עקיפה, לכל נזק, הפסד כספי, או אובדן רווחים שייגרמו למשתמש כתוצאה משימוש באפליקציה או בהסתמך על נתונים שהוצגו בה.
            </TermsItem>
          </TermsSection>

          {/* Section 2 */}
          <TermsSection number="2" title="כללי התנהגות ואיסורים מוחלטים">
            <p className="text-xs md:text-sm text-muted-foreground mb-4 leading-relaxed">
              המשתמש מתחייב להשתמש באפליקציה בתום לב ובכפוף לחוק. חל איסור מוחלט לבצע את הפעולות הבאות:
            </p>
            <TermsItem num="2.1">
              <strong>הנדסה לאחור (Reverse Engineering):</strong> אסור לפרק, לפצח, להעתיק, לתרגם או לנסות להפיק את קוד המקור של האפליקציה או של האלגוריתמים (AI) הפועלים בה.
            </TermsItem>
            <TermsItem num="2.2">
              <strong>קצירת נתונים (Data Scraping & Bots):</strong> חל איסור מוחלט להפעיל רובוטים, עכבישים (Spiders), סורקים או כל תוכנה אוטומטית אחרת במטרה לשאוב, להעתיק או לאסוף נתונים מהאפליקציה.
            </TermsItem>
            <TermsItem num="2.3">
              <strong>פגיעה במערכות:</strong> אסור לנסות לחדור למערכות החברה, לשבש את פעילות השרתים, להחדיר וירוסים, סוסים טרויאניים, תוכנות זדוניות (Malware) או לבצע מתקפות מניעת שירות (DDoS).
            </TermsItem>
            <TermsItem num="2.4">
              <strong>שימוש מסחרי ללא הרשאה:</strong> אסור למכור, להשכיר, להפיץ או להציג בפומבי את שירותי האפליקציה או הנתונים שבה (לרבות היומן הכלכלי וניתוחי ה-AI) לצד שלישי ללא אישור מראש ובכתב מהחברה.
            </TermsItem>
            <TermsItem num="2.5">
              <strong>התחזות והונאה:</strong> אסור לפתוח חשבונות פיקטיביים, להתחזות לאדם אחר, או לספק פרטי תשלום או זיהוי כוזבים.
            </TermsItem>
          </TermsSection>

          {/* Section 3 */}
          <TermsSection number="3" title="קניין רוחני וזכויות יוצרים (Intellectual Property)">
            <TermsItem num="3.1">
              כל זכויות הקניין הרוחני באפליקציה, לרבות אך לא רק: קוד המקור, העיצוב (UI/UX), הלוגו, שם המותג (ZenTrade), הפטנטים, האלגוריתמים, מודלי הבינה המלאכותית (AI Models), בסיסי הנתונים והתוכן הטקסטואלי – הנם רכושה הבלעדי של החברה.
            </TermsItem>
            <TermsItem num="3.2">
              למשתמש מוענק רישיון שימוש אישי, מוגבל, לא-בלעדי ובלתי ניתן להעברה, לעשות שימוש באפליקציה למטרותיו האישיות בלבד. רישיון זה אינו מקנה למשתמש שום בעלות על האפליקציה או על חלק כלשהו ממנה.
            </TermsItem>
            <TermsItem num="3.3">
              כל העתקה, שעתוק, הפצה או יצירת יצירות נגזרות מהאפליקציה, מהווה הפרה חמורה של זכויות היוצרים ותגרור תביעה משפטית ולדרישת פיצויים ללא הוכחת נזק, בהתאם לחוק.
            </TermsItem>
          </TermsSection>

          {/* Section 4 */}
          <TermsSection number="4" title="נתוני משתמש ופרטיות">
            <TermsItem num="4.1">
              המשתמש מסכים כי בעת הזנת נתוני מסחר, תיעוד עסקאות (Journaling) ומתן תשובות לשאלון ההיכרות, האפליקציה תאסוף, תשמור ותעבד נתונים אלו.
            </TermsItem>
            <TermsItem num="4.2">
              <strong>הרשאה לניתוח בינה מלאכותית:</strong> המשתמש נותן בזאת את הסכמתו המלאה לכך שהמערכת ומנועי ה-AI של החברה ינתחו את נתוני המסחר שלו במטרה לספק לו משוב, סטטיסטיקות ותובנות אישיות.
            </TermsItem>
            <TermsItem num="4.3">
              החברה מתחייבת לעשות מאמצים סבירים ומקובלים בתעשייה כדי לאבטח את נתוני המשתמשים, אך אינה יכולה להבטיח חסינות מוחלטת מפני פריצות סייבר. המשתמש מוותר על כל תביעה כנגד החברה במקרה של דלף מידע שנגרם כתוצאה מפריצה זדונית לשרתים.
            </TermsItem>
          </TermsSection>

          {/* Section 5 */}
          <TermsSection number="5" title="שירותי צד שלישי (Third-Party Services & APIs)">
            <TermsItem num="5.1">
              האפליקציה עשויה להציג נתונים המגיעים מספקי צד שלישי (כגון שערי מטבעות, יומן כלכלי דרך APIs חיצוניים, נתוני מאקרו וכדומה).
            </TermsItem>
            <TermsItem num="5.2">
              החברה אינה אחראית לדיוק, לשלמות, לאמינות או לזמינות של נתונים אלו. כל החלטה המבוססת על נתונים מצד שלישי נעשית על אחריות המשתמש בלבד.
            </TermsItem>
            <TermsItem num="5.3">
              החברה שומרת לעצמה את הזכות להחליף, להסיר או לשנות ספקי נתונים בכל עת וללא הודעה מוקדמת.
            </TermsItem>
          </TermsSection>

          {/* Section 6 */}
          <TermsSection number="6" title="השעיה, חסימה וסיום התקשרות">
            <TermsItem num="6.1">
              החברה שומרת לעצמה את הזכות המלאה והבלעדית לחסום את גישתו של כל משתמש לאפליקציה, להשעות את חשבונו או למחוק אותו לחלוטין, באופן מיידי וללא הודעה מוקדמת, בכל מקרה של הפרת אחד מסעיפי תקנון זה, חשד לתרמית, או מכל סיבה סבירה אחרת שתיקבע על ידי הנהלת החברה.
            </TermsItem>
            <TermsItem num="6.2">
              במקרה של חסימה בגין הפרת תקנון, לא יינתן החזר כספי על מינויים ששולמו.
            </TermsItem>
          </TermsSection>

          {/* Section 7 */}
          <TermsSection number="7" title="שיפוי (Indemnification)">
            <p className="text-xs md:text-sm leading-[2] text-foreground/80">
              המשתמש מתחייב לשפות ולפצות את החברה, מנהליה, עובדיה ושותפיה, מיד עם דרישתם הראשונה, בגין כל נזק, הפסד, אובדן רווח, תשלום או הוצאה (לרבות שכר טרחת עורכי דין והוצאות משפט) שייגרמו להם עקב הפרת תנאי מתנאי תקנון זה על ידי המשתמש, או עקב תביעה של צד שלישי הקשורה לשימוש של המשתמש באפליקציה בניגוד לחוק.
            </p>
          </TermsSection>

          {/* Section 8 */}
          <TermsSection number="8" title="שינויים בתקנון">
            <p className="text-xs md:text-sm leading-[2] text-foreground/80">
              החברה רשאית לשנות, לעדכן, להוסיף או לגרוע מסעיפי תקנון זה בכל עת ולפי שיקול דעתה הבלעדי. באחריות המשתמש להתעדכן בתנאי התקנון מעת לעת. המשך השימוש באפליקציה לאחר ביצוע שינויים מעיד על הסכמת המשתמש לתנאים המעודכנים.
            </p>
          </TermsSection>

          {/* Section 9 */}
          <TermsSection number="9" title="סמכות שיפוט ובתי משפט (Jurisdiction)">
            <TermsItem num="9.1">
              על הסכם זה, על פרשנותו ועל כל הנובע ממנו יחולו אך ורק דיני מדינת ישראל.
            </TermsItem>
            <TermsItem num="9.2">
              סמכות השיפוט הבלעדית והייחודית לדון בכל סכסוך, תביעה או מחלוקת הנובעים מהשימוש באפליקציה או הקשורים לתקנון זה, תהא נתונה אך ורק לבתי המשפט המוסמכים בעיר תל-אביב-יפו, ישראל.
            </TermsItem>
          </TermsSection>
        </div>

        {/* Disclaimer box */}
        <div className="mt-12 md:mt-16 rounded-2xl border border-destructive/20 bg-destructive/5 p-5 md:p-7">
          <p className="text-xs md:text-sm leading-[2] text-foreground/80">
            <strong className="text-destructive">הערה חשובה:</strong> מסמך זה מהווה בסיס מקיף לתנאי השימוש של ZenTrade. לפני השקה רשמית של האפליקציה, מומלץ בחום להעביר מסמך זה לבדיקת עורך דין מסחרי המתמחה בתחום ההייטק/פינטק, על מנת להבטיח תוקף משפטי מלא ומחייב.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 px-4 py-8 md:px-8 md:py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-heading text-sm font-bold text-foreground">ZenTrade</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link to="/terms" className="text-primary font-medium">תנאי שימוש</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">מדיניות פרטיות</Link>
            <span className="cursor-pointer hover:text-foreground transition-colors">יצירת קשר</span>
          </div>
          <span className="text-[10px] text-muted-foreground/60">© 2026 ZenTrade. כל הזכויות שמורות.</span>
        </div>
      </footer>
    </div>
  );
};

/* ===== Sub-Components ===== */

const TermsSection = ({ number, title, children }: { number: string; title: string; children: React.ReactNode }) => (
  <section>
    <div className="flex items-center gap-3 mb-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 font-heading text-sm font-bold text-primary">
        {number}
      </span>
      <h2 className="font-heading text-lg md:text-xl font-bold text-foreground">{title}</h2>
    </div>
    <div className="pr-11 space-y-3">{children}</div>
  </section>
);

const TermsItem = ({ num, children }: { num: string; children: React.ReactNode }) => (
  <div className="flex gap-3">
    <span className="shrink-0 text-xs font-mono font-medium text-primary mt-0.5">{num}</span>
    <p className="text-xs md:text-sm leading-[2] text-foreground/80">{children}</p>
  </div>
);

export default TermsPage;
