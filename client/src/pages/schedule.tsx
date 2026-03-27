
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Clock, ChevronDown, ChevronUp, Ruler, RotateCcw, Zap, Flag } from "lucide-react";
import { useState } from "react";

const schedule = [
  {
    round: 1, gp: "Australian Grand Prix", circuit: "Albert Park Circuit", date: "Mar 14 - 16", time: "05:00", country: "Australia", city: "Melbourne",
    circuit_details: { length: 5.278, laps: 58, drs_zones: 4, first_gp: 1996, lap_record: "1:20.235", lap_record_holder: "Charles Leclerc (2022)", type: "Street/Permanent" },
    sessions: { fp1: "01:30", fp2: "05:00", fp3: "01:30", qualifying: "05:00", race: "05:00" }
  },
  {
    round: 2, gp: "Chinese Grand Prix", circuit: "Shanghai International Circuit", date: "Mar 21 - 23", time: "07:00", country: "China", city: "Shanghai",
    circuit_details: { length: 5.451, laps: 56, drs_zones: 2, first_gp: 2004, lap_record: "1:32.238", lap_record_holder: "Michael Schumacher (2004)", type: "Permanent" },
    sessions: { fp1: "03:30", sprintQualifying: "07:30", sprint: "03:00", qualifying: "07:00", race: "07:00" }
  },
  {
    round: 3, gp: "Japanese Grand Prix", circuit: "Suzuka International Racing Course", date: "Apr 4 - 6", time: "06:00", country: "Japan", city: "Suzuka",
    circuit_details: { length: 5.807, laps: 53, drs_zones: 2, first_gp: 1987, lap_record: "1:30.983", lap_record_holder: "Lewis Hamilton (2019)", type: "Permanent" },
    sessions: { fp1: "02:30", fp2: "06:00", fp3: "02:30", qualifying: "06:00", race: "05:00" }
  },
  {
    round: 4, gp: "Bahrain Grand Prix", circuit: "Bahrain International Circuit", date: "Apr 11 - 13", time: "15:00", country: "Bahrain", city: "Sakhir",
    circuit_details: { length: 5.412, laps: 57, drs_zones: 3, first_gp: 2004, lap_record: "1:31.447", lap_record_holder: "Pedro de la Rosa (2005)", type: "Permanent" },
    sessions: { fp1: "11:30", fp2: "15:00", fp3: "12:30", qualifying: "16:00", race: "15:00" }
  },
  {
    round: 5, gp: "Saudi Arabian Grand Prix", circuit: "Jeddah Corniche Circuit", date: "Apr 18 - 20", time: "17:00", country: "Saudi Arabia", city: "Jeddah",
    circuit_details: { length: 6.174, laps: 50, drs_zones: 3, first_gp: 2021, lap_record: "1:30.734", lap_record_holder: "Lewis Hamilton (2021)", type: "Street" },
    sessions: { fp1: "13:30", fp2: "17:00", fp3: "13:30", qualifying: "17:00", race: "17:00" }
  },
  {
    round: 6, gp: "Miami Grand Prix", circuit: "Miami International Autodrome", date: "May 2 - 4", time: "20:00", country: "USA", city: "Miami",
    circuit_details: { length: 5.412, laps: 57, drs_zones: 3, first_gp: 2022, lap_record: "1:29.708", lap_record_holder: "Max Verstappen (2023)", type: "Street/Permanent" },
    sessions: { fp1: "16:30", sprintQualifying: "20:30", sprint: "16:00", qualifying: "20:00", race: "20:00" }
  },
  {
    round: 7, gp: "Emilia Romagna Grand Prix", circuit: "Autodromo Enzo e Dino Ferrari", date: "May 16 - 18", time: "13:00", country: "Italy", city: "Imola",
    circuit_details: { length: 4.909, laps: 63, drs_zones: 2, first_gp: 1980, lap_record: "1:15.484", lap_record_holder: "Valtteri Bottas (2020)", type: "Permanent" },
    sessions: { fp1: "11:30", fp2: "15:00", fp3: "10:30", qualifying: "14:00", race: "13:00" }
  },
  {
    round: 8, gp: "Monaco Grand Prix", circuit: "Circuit de Monaco", date: "May 23 - 25", time: "13:00", country: "Monaco", city: "Monte Carlo",
    circuit_details: { length: 3.337, laps: 78, drs_zones: 1, first_gp: 1950, lap_record: "1:12.909", lap_record_holder: "Lewis Hamilton (2021)", type: "Street" },
    sessions: { fp1: "11:30", fp2: "15:00", fp3: "10:30", qualifying: "14:00", race: "13:00" }
  },
  {
    round: 9, gp: "Spanish Grand Prix", circuit: "Circuit de Barcelona-Catalunya", date: "May 30 - Jun 1", time: "13:00", country: "Spain", city: "Barcelona",
    circuit_details: { length: 4.657, laps: 66, drs_zones: 2, first_gp: 1991, lap_record: "1:16.330", lap_record_holder: "Max Verstappen (2023)", type: "Permanent" },
    sessions: { fp1: "11:30", fp2: "15:00", fp3: "10:30", qualifying: "14:00", race: "13:00" }
  },
  {
    round: 10, gp: "Canadian Grand Prix", circuit: "Circuit Gilles-Villeneuve", date: "Jun 13 - 15", time: "18:00", country: "Canada", city: "Montréal",
    circuit_details: { length: 4.361, laps: 70, drs_zones: 2, first_gp: 1978, lap_record: "1:13.078", lap_record_holder: "Valtteri Bottas (2019)", type: "Street/Permanent" },
    sessions: { fp1: "17:30", fp2: "21:00", fp3: "16:30", qualifying: "20:00", race: "18:00" }
  },
  {
    round: 11, gp: "Austrian Grand Prix", circuit: "Red Bull Ring", date: "Jun 27 - 29", time: "13:00", country: "Austria", city: "Spielberg",
    circuit_details: { length: 4.318, laps: 71, drs_zones: 3, first_gp: 1970, lap_record: "1:05.619", lap_record_holder: "Carlos Sainz (2020)", type: "Permanent" },
    sessions: { fp1: "10:30", sprintQualifying: "14:30", sprint: "10:00", qualifying: "14:00", race: "13:00" }
  },
  {
    round: 12, gp: "British Grand Prix", circuit: "Silverstone Circuit", date: "Jul 4 - 6", time: "14:00", country: "UK", city: "Silverstone",
    circuit_details: { length: 5.891, laps: 52, drs_zones: 2, first_gp: 1950, lap_record: "1:27.097", lap_record_holder: "Max Verstappen (2020)", type: "Permanent" },
    sessions: { fp1: "11:30", fp2: "15:00", fp3: "10:30", qualifying: "14:00", race: "14:00" }
  },
  {
    round: 13, gp: "Belgian Grand Prix", circuit: "Circuit de Spa-Francorchamps", date: "Jul 25 - 27", time: "13:00", country: "Belgium", city: "Spa",
    circuit_details: { length: 7.004, laps: 44, drs_zones: 2, first_gp: 1950, lap_record: "1:41.252", lap_record_holder: "Valtteri Bottas (2018)", type: "Permanent" },
    sessions: { fp1: "11:30", fp2: "15:00", fp3: "10:30", qualifying: "14:00", race: "13:00" }
  },
  {
    round: 14, gp: "Hungarian Grand Prix", circuit: "Hungaroring", date: "Aug 1 - 3", time: "13:00", country: "Hungary", city: "Budapest",
    circuit_details: { length: 4.381, laps: 70, drs_zones: 2, first_gp: 1986, lap_record: "1:16.627", lap_record_holder: "Lewis Hamilton (2020)", type: "Permanent" },
    sessions: { fp1: "11:30", fp2: "15:00", fp3: "10:30", qualifying: "14:00", race: "13:00" }
  },
  {
    round: 15, gp: "Dutch Grand Prix", circuit: "Circuit Zandvoort", date: "Aug 29 - 31", time: "13:00", country: "Netherlands", city: "Zandvoort",
    circuit_details: { length: 4.259, laps: 72, drs_zones: 2, first_gp: 1952, lap_record: "1:11.097", lap_record_holder: "Lewis Hamilton (2021)", type: "Permanent" },
    sessions: { fp1: "10:30", fp2: "14:00", fp3: "09:30", qualifying: "13:00", race: "13:00" }
  },
  {
    round: 16, gp: "Italian Grand Prix", circuit: "Autodromo Nazionale Monza", date: "Sep 5 - 7", time: "13:00", country: "Italy", city: "Monza",
    circuit_details: { length: 5.793, laps: 53, drs_zones: 2, first_gp: 1950, lap_record: "1:21.046", lap_record_holder: "Rubens Barrichello (2004)", type: "Permanent" },
    sessions: { fp1: "11:30", fp2: "15:00", fp3: "10:30", qualifying: "14:00", race: "13:00" }
  },
  {
    round: 17, gp: "Azerbaijan Grand Prix", circuit: "Baku City Circuit", date: "Sep 19 - 21", time: "11:00", country: "Azerbaijan", city: "Baku",
    circuit_details: { length: 6.003, laps: 51, drs_zones: 2, first_gp: 2017, lap_record: "1:43.009", lap_record_holder: "Charles Leclerc (2019)", type: "Street" },
    sessions: { fp1: "09:30", fp2: "13:00", fp3: "08:30", qualifying: "12:00", race: "11:00" }
  },
  {
    round: 18, gp: "Singapore Grand Prix", circuit: "Marina Bay Street Circuit", date: "Oct 3 - 5", time: "12:00", country: "Singapore", city: "Singapore",
    circuit_details: { length: 4.940, laps: 62, drs_zones: 3, first_gp: 2008, lap_record: "1:35.867", lap_record_holder: "Lewis Hamilton (2023)", type: "Street" },
    sessions: { fp1: "09:30", fp2: "13:00", fp3: "09:30", qualifying: "13:00", race: "12:00" }
  },
  {
    round: 19, gp: "United States Grand Prix", circuit: "Circuit of The Americas", date: "Oct 17 - 19", time: "19:00", country: "USA", city: "Austin",
    circuit_details: { length: 5.513, laps: 56, drs_zones: 2, first_gp: 2012, lap_record: "1:36.169", lap_record_holder: "Charles Leclerc (2019)", type: "Permanent" },
    sessions: { fp1: "17:30", sprintQualifying: "21:30", sprint: "18:00", qualifying: "22:00", race: "19:00" }
  },
  {
    round: 20, gp: "Mexico City Grand Prix", circuit: "Autódromo Hermanos Rodríguez", date: "Oct 24 - 26", time: "19:00", country: "Mexico", city: "Mexico City",
    circuit_details: { length: 4.304, laps: 71, drs_zones: 3, first_gp: 1963, lap_record: "1:17.774", lap_record_holder: "Valtteri Bottas (2021)", type: "Permanent" },
    sessions: { fp1: "18:30", fp2: "22:00", fp3: "17:30", qualifying: "21:00", race: "19:00" }
  },
  {
    round: 21, gp: "São Paulo Grand Prix", circuit: "Autódromo José Carlos Pace", date: "Nov 7 - 9", time: "16:00", country: "Brazil", city: "São Paulo",
    circuit_details: { length: 4.309, laps: 71, drs_zones: 2, first_gp: 1973, lap_record: "1:10.540", lap_record_holder: "Valtteri Bottas (2018)", type: "Permanent" },
    sessions: { fp1: "14:30", sprintQualifying: "18:30", sprint: "14:00", qualifying: "18:00", race: "16:00" }
  },
  {
    round: 22, gp: "Las Vegas Grand Prix", circuit: "Las Vegas Strip Circuit", date: "Nov 20 - 22", time: "06:00", country: "USA", city: "Las Vegas",
    circuit_details: { length: 6.201, laps: 50, drs_zones: 2, first_gp: 2023, lap_record: "1:35.490", lap_record_holder: "Oscar Piastri (2024)", type: "Street" },
    sessions: { fp1: "02:30", fp2: "06:00", fp3: "02:30", qualifying: "06:00", race: "06:00" }
  },
  {
    round: 23, gp: "Qatar Grand Prix", circuit: "Lusail International Circuit", date: "Nov 28 - 30", time: "17:00", country: "Qatar", city: "Lusail",
    circuit_details: { length: 5.380, laps: 57, drs_zones: 2, first_gp: 2021, lap_record: "1:24.319", lap_record_holder: "Max Verstappen (2023)", type: "Permanent" },
    sessions: { fp1: "13:30", sprintQualifying: "17:30", sprint: "13:00", qualifying: "17:00", race: "17:00" }
  },
  {
    round: 24, gp: "Abu Dhabi Grand Prix", circuit: "Yas Marina Circuit", date: "Dec 5 - 7", time: "13:00", country: "UAE", city: "Abu Dhabi",
    circuit_details: { length: 5.281, laps: 58, drs_zones: 2, first_gp: 2009, lap_record: "1:26.103", lap_record_holder: "Max Verstappen (2021)", type: "Permanent" },
    sessions: { fp1: "09:30", fp2: "13:00", fp3: "10:30", qualifying: "14:00", race: "13:00" }
  },
];

const isSprint = (race: typeof schedule[0]) => 'sprintQualifying' in race.sessions;

export default function Schedule() {
  const [expandedRound, setExpandedRound] = useState<number | null>(null);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col gap-2 mb-10 text-center md:text-left">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent italic">
          2026 RACE SCHEDULE
        </h1>
        <p className="text-muted-foreground">The full Formula 1 calendar for the 2026 season. Click any card to reveal circuit details and session times.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedule.map((race) => {
          const isExpanded = expandedRound === race.round;
          const sprint = isSprint(race);
          return (
            <Card
              key={race.round}
              data-testid={`card-race-${race.round}`}
              className={`bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all cursor-pointer hover-elevate ${isExpanded ? 'ring-1 ring-primary border-primary/50' : ''}`}
              onClick={() => setExpandedRound(isExpanded ? null : race.round)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      Round {race.round}
                    </span>
                    {sprint && (
                      <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                        Sprint
                      </span>
                    )}
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-primary shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                </div>
                <CardTitle className="text-xl italic font-black leading-tight">{race.gp}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span>{race.circuit}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Flag className="w-4 h-4 text-primary shrink-0" />
                  <span>{race.city}, {race.country}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span>{race.date}</span>
                </div>

                {isExpanded && (
                  <div className="pt-4 mt-2 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Circuit Stats */}
                    <div className="rounded-xl bg-muted/40 border border-border/50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-3">Circuit Details</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                        <div className="flex items-center gap-2">
                          <Ruler className="w-3.5 h-3.5 text-secondary shrink-0" />
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Length</p>
                            <p className="text-xs font-bold">{race.circuit_details.length} km</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <RotateCcw className="w-3.5 h-3.5 text-secondary shrink-0" />
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Laps</p>
                            <p className="text-xs font-bold">{race.circuit_details.laps}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 text-secondary shrink-0" />
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">DRS Zones</p>
                            <p className="text-xs font-bold">{race.circuit_details.drs_zones}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Flag className="w-3.5 h-3.5 text-secondary shrink-0" />
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">First GP</p>
                            <p className="text-xs font-bold">{race.circuit_details.first_gp}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border/40">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Lap Record</p>
                        <p className="text-xs font-black text-primary font-mono">{race.circuit_details.lap_record}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{race.circuit_details.lap_record_holder}</p>
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                        <span className="text-[10px] font-bold text-primary">{race.circuit_details.type}</span>
                      </div>
                    </div>

                    {/* Session Times */}
                    <div className="border-t border-border/50 pt-3 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2">Weekend Schedule (GMT)</p>
                      {'fp1' in race.sessions && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Practice 1</span>
                          <span className="font-mono">{(race.sessions as any).fp1}</span>
                        </div>
                      )}
                      {'fp2' in race.sessions && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Practice 2</span>
                          <span className="font-mono">{(race.sessions as any).fp2}</span>
                        </div>
                      )}
                      {'sprintQualifying' in race.sessions && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Sprint Quali</span>
                          <span className="font-mono font-bold text-secondary">{(race.sessions as any).sprintQualifying}</span>
                        </div>
                      )}
                      {'sprint' in race.sessions && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Sprint Race</span>
                          <span className="font-mono font-bold text-secondary">{(race.sessions as any).sprint}</span>
                        </div>
                      )}
                      {'fp3' in race.sessions && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Practice 3</span>
                          <span className="font-mono">{(race.sessions as any).fp3}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-bold uppercase tracking-tighter">Qualifying</span>
                        <span className="font-mono text-secondary font-bold">{race.sessions.qualifying}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-1 border-t border-border/40">
                        <span className="text-primary font-bold uppercase tracking-tighter">Main Race</span>
                        <span className="font-mono text-primary font-black">{race.sessions.race}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
