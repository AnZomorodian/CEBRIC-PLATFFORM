import { useState } from "react";
import FilterPanel from "@/components/filter-panel";
import LapChart from "@/components/lap-chart";
import TelemetrySection from "@/components/telemetry-section";
import StatisticsCards from "@/components/statistics-cards";
import AdditionalAnalysis from "@/components/additional-analysis";
import DriverComparison from "@/components/driver-comparison";
import AdvancedAnalysis from "@/components/advanced-analysis";
import FormulaAnalysis from "@/components/formula-analysis"; // Assuming this component replaces RaceStartAnalysis
import RaceInsights from "@/components/race-insights";
import { F1SessionResponse, F1TelemetryResponse } from "@shared/schema";

export default function Dashboard() {
  const [sessionData, setSessionData] = useState<F1SessionResponse | null>(null);
  const [telemetryData, setTelemetryData] = useState<F1TelemetryResponse | null>(null);
  const [selectedFilters, setSelectedFilters] = useState({
    year: "",
    gp: "",
    session: "",
    drivers: [] as string[]
  });
  const timeFormat = 'seconds';

  // Ordered years: 2026 down to 2018
  const availableYears = ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018"];

  return (
    <div className="min-h-screen bg-background" data-testid="dashboard-main">
      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent italic">
            CEBRIC TELEMETRY
          </h1>
          <p className="text-muted-foreground">
            Explore and analyze Formula 1 session telemetry and data.
          </p>
        </div>

        {/* Filter Section */}
        <FilterPanel
          onDataLoaded={setSessionData}
          onFiltersChange={setSelectedFilters}
          filters={selectedFilters}
          years={availableYears} // Pass updated years
        />

        {/* Lap Chart Section */}
        <LapChart
          sessionData={sessionData}
          timeFormat={timeFormat} // Pass time format
          onLapSelect={(driver, lap) => {
            // Handle lap selection for telemetry
            console.log("Lap selected:", driver, lap);
          }}
        />

        {/* Statistics Cards */}
        <StatisticsCards sessionData={sessionData} timeFormat={timeFormat} />

        {/* Telemetry Section */}
        <TelemetrySection
          telemetryData={telemetryData}
          sessionData={sessionData}
          filters={selectedFilters}
          onTelemetryDataLoaded={setTelemetryData}
          timeFormat={timeFormat} // Pass time format
        />

        <div className="h-8"></div>

        {/* Driver Comparison Section */}
        <DriverComparison 
          sessionData={sessionData} 
          telemetryDrivers={telemetryData ? {
            driver1: telemetryData.driver1.driver,
            driver2: telemetryData.driver2?.driver
          } : null}
        />

        {/* Additional Analysis Section */}
        <AdditionalAnalysis sessionData={sessionData} timeFormat={timeFormat} />

        {/* Advanced Analysis Section */}
        <AdvancedAnalysis sessionData={sessionData} filters={selectedFilters} excludeMetrics={["weather_impact", "pit_stop"]} />

        {/* Formula Analysis - Replaces Race Start Analysis */}
        <FormulaAnalysis sessionData={sessionData} filters={selectedFilters} />

        {/* Race Insights Section */}
        <RaceInsights sessionData={sessionData} filters={selectedFilters} />
      </main>
    </div>
  );
}