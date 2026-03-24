
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const schedule = [
  { 
    round: 1, gp: "Australian Grand Prix", circuit: "Albert Park Circuit", date: "Mar 14 - 16", time: "05:00",
    sessions: { fp1: "01:30", fp2: "05:00", fp3: "01:30", qualifying: "05:00", race: "05:00" }
  },
  { 
    round: 2, gp: "Chinese Grand Prix", circuit: "Shanghai International Circuit", date: "Mar 21 - 23", time: "07:00",
    sessions: { fp1: "03:30", sprintQualifying: "07:30", sprint: "03:00", qualifying: "07:00", race: "07:00" }
  },
  { 
    round: 3, gp: "Japanese Grand Prix", circuit: "Suzuka International Racing Course", date: "Apr 4 - 6", time: "06:00",
    sessions: { fp1: "02:30", fp2: "06:00", fp3: "02:30", qualifying: "06:00", race: "05:00" }
  },
  { 
    round: 4, gp: "Bahrain Grand Prix", circuit: "Bahrain International Circuit", date: "Apr 11 - 13", time: "15:00",
    sessions: { fp1: "11:30", fp2: "15:00", fp3: "12:30", qualifying: "16:00", race: "15:00" }
  },
  { 
    round: 5, gp: "Saudi Arabian Grand Prix", circuit: "Jeddah Corniche Circuit", date: "Apr 18 - 20", time: "17:00",
    sessions: { fp1: "13:30", fp2: "17:00", fp3: "13:30", qualifying: "17:00", race: "17:00" }
  },
  { 
    round: 6, gp: "Miami Grand Prix", circuit: "Miami International Autodrome", date: "May 2 - 4", time: "20:00",
    sessions: { fp1: "16:30", sprintQualifying: "20:30", sprint: "16:00", qualifying: "20:00", race: "20:00" }
  },
  { 
    round: 7, gp: "Emilia Romagna Grand Prix", circuit: "Autodromo Enzo e Dino Ferrari", date: "May 16 - 18", time: "13:00",
    sessions: { fp1: "11:30", fp2: "15:00", fp3: "10:30", qualifying: "14:00", race: "13:00" }
  },
  { 
    round: 8, gp: "Monaco Grand Prix", circuit: "Circuit de Monaco", date: "May 23 - 25", time: "13:00",
    sessions: { fp1: "11:30", fp2: "15:00", fp3: "10:30", qualifying: "14:00", race: "13:00" }
  },
  { 
    round: 9, gp: "Spanish Grand Prix", circuit: "Circuit de Barcelona-Catalunya", date: "May 30 - Jun 1", time: "13:00",
    sessions: { fp1: "11:30", fp2: "15:00", fp3: "10:30", qualifying: "14:00", race: "13:00" }
  },
  { 
    round: 10, gp: "Canadian Grand Prix", circuit: "Circuit Gilles-Villeneuve", date: "Jun 13 - 15", time: "18:00",
    sessions: { fp1: "17:30", fp2: "21:00", fp3: "16:30", qualifying: "20:00", race: "18:00" }
  },
  { 
    round: 11, gp: "Austrian Grand Prix", circuit: "Red Bull Ring", date: "Jun 27 - 29", time: "13:00",
    sessions: { fp1: "10:30", sprintQualifying: "14:30", sprint: "10:00", qualifying: "14:00", race: "13:00" }
  },
  { 
    round: 12, gp: "British Grand Prix", circuit: "Silverstone Circuit", date: "Jul 4 - 6", time: "14:00",
    sessions: { fp1: "11:30", fp2: "15:00", fp3: "10:30", qualifying: "14:00", race: "14:00" }
  },
  { 
    round: 13, gp: "Belgian Grand Prix", circuit: "Circuit de Spa-Francorchamps", date: "Jul 25 - 27", time: "13:00",
    sessions: { fp1: "11:30", fp2: "15:00", fp3: "10:30", qualifying: "14:00", race: "13:00" }
  },
  { 
    round: 14, gp: "Hungarian Grand Prix", circuit: "Hungaroring", date: "Aug 1 - 3", time: "13:00",
    sessions: { fp1: "11:30", fp2: "15:00", fp3: "10:30", qualifying: "14:00", race: "13:00" }
  },
  { 
    round: 15, gp: "Dutch Grand Prix", circuit: "Circuit Zandvoort", date: "Aug 29 - 31", time: "13:00",
    sessions: { fp1: "10:30", fp2: "14:00", fp3: "09:30", qualifying: "13:00", race: "13:00" }
  },
  { 
    round: 16, gp: "Italian Grand Prix", circuit: "Autodromo Nazionale Monza", date: "Sep 5 - 7", time: "13:00",
    sessions: { fp1: "11:30", fp2: "15:00", fp3: "10:30", qualifying: "14:00", race: "13:00" }
  },
  { 
    round: 17, gp: "Azerbaijan Grand Prix", circuit: "Baku City Circuit", date: "Sep 19 - 21", time: "11:00",
    sessions: { fp1: "09:30", fp2: "13:00", fp3: "08:30", qualifying: "12:00", race: "11:00" }
  },
  { 
    round: 18, gp: "Singapore Grand Prix", circuit: "Marina Bay Street Circuit", date: "Oct 3 - 5", time: "12:00",
    sessions: { fp1: "09:30", fp2: "13:00", fp3: "09:30", qualifying: "13:00", race: "12:00" }
  },
  { 
    round: 19, gp: "United States Grand Prix", circuit: "Circuit of The Americas", date: "Oct 17 - 19", time: "19:00",
    sessions: { fp1: "17:30", sprintQualifying: "21:30", sprint: "18:00", qualifying: "22:00", race: "19:00" }
  },
  { 
    round: 20, gp: "Mexico City Grand Prix", circuit: "Autódromo Hermanos Rodríguez", date: "Oct 24 - 26", time: "19:00",
    sessions: { fp1: "18:30", fp2: "22:00", fp3: "17:30", qualifying: "21:00", race: "19:00" }
  },
  { 
    round: 21, gp: "São Paulo Grand Prix", circuit: "Autódromo José Carlos Pace", date: "Nov 7 - 9", time: "16:00",
    sessions: { fp1: "14:30", sprintQualifying: "18:30", sprint: "14:00", qualifying: "18:00", race: "16:00" }
  },
  { 
    round: 22, gp: "Las Vegas Grand Prix", circuit: "Las Vegas Strip Circuit", date: "Nov 20 - 22", time: "06:00",
    sessions: { fp1: "02:30", fp2: "06:00", fp3: "02:30", qualifying: "06:00", race: "06:00" }
  },
  { 
    round: 23, gp: "Qatar Grand Prix", circuit: "Lusail International Circuit", date: "Nov 28 - 30", time: "17:00",
    sessions: { fp1: "13:30", sprintQualifying: "17:30", sprint: "13:00", qualifying: "17:00", race: "17:00" }
  },
  { 
    round: 24, gp: "Abu Dhabi Grand Prix", circuit: "Yas Marina Circuit", date: "Dec 5 - 7", time: "13:00",
    sessions: { fp1: "09:30", fp2: "13:00", fp3: "10:30", qualifying: "14:00", race: "13:00" }
  },
];

export default function Schedule() {
  const [expandedRound, setExpandedRound] = useState<number | null>(null);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col gap-2 mb-8 text-center md:text-left">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent italic">
          2026 RACE SCHEDULE
        </h1>
        <p className="text-muted-foreground">The full Formula 1 calendar for the 2026 season. Click a card for session details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedule.map((race) => (
          <Card 
            key={race.round} 
            className={`bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all cursor-pointer hover-elevate ${expandedRound === race.round ? 'ring-1 ring-primary border-primary/50' : ''}`}
            onClick={() => setExpandedRound(expandedRound === race.round ? null : race.round)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Round {race.round}
                </span>
                {expandedRound === race.round ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
              <CardTitle className="text-xl italic font-black">{race.gp}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                {race.circuit}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                {race.date}
              </div>
              
              {expandedRound === race.round && (
                <div className="pt-4 border-t border-border/50 mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-3">Weekend Schedule (GMT)</p>
                  {'fp1' in race.sessions && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Practice 1</span>
                      <span className="font-mono text-foreground">{(race.sessions as any).fp1}</span>
                    </div>
                  )}
                  {'fp2' in race.sessions && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Practice 2</span>
                      <span className="font-mono text-foreground">{(race.sessions as any).fp2}</span>
                    </div>
                  )}
                  {'sprintQualifying' in race.sessions && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Sprint Qualy</span>
                      <span className="font-mono text-foreground font-bold text-primary">{(race.sessions as any).sprintQualifying}</span>
                    </div>
                  )}
                  {'sprint' in race.sessions && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Sprint Race</span>
                      <span className="font-mono text-foreground font-bold text-primary">{(race.sessions as any).sprint}</span>
                    </div>
                  )}
                  {'fp3' in race.sessions && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Practice 3</span>
                      <span className="font-mono text-foreground">{(race.sessions as any).fp3}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-bold uppercase tracking-tighter">Qualifying</span>
                    <span className="font-mono text-secondary font-bold">{race.sessions.qualifying}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-primary font-bold uppercase tracking-tighter">Main Race</span>
                    <span className="font-mono text-primary font-black">{race.sessions.race}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
