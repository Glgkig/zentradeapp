import { useState } from "react";
import { Calendar, Loader2 } from "lucide-react";

const CalendarPage = () => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="flex flex-col h-full -m-2 md:-m-4 -mb-16 md:-mb-4">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/10 bg-card/30 backdrop-blur-sm">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Calendar className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-sm font-bold text-foreground">לוח שוק כלכלי</h1>
          <p className="text-2xs text-muted-foreground/50">Forex Factory · אירועים בזמן אמת</p>
        </div>
      </div>

      {/* Iframe Container */}
      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground/50 font-medium">טוען לוח כלכלי...</p>
          </div>
        )}
        <iframe
          src="https://www.forexfactory.com/"
          title="Forex Factory Calendar"
          className="w-full h-full border-0"
          onLoad={() => setLoading(false)}
          style={{ minHeight: "100%" }}
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
    </div>
  );
};

export default CalendarPage;
