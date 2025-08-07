import {render, screen} from "@testing-library/react";
import {Analytics} from "./Analytics";

// Mock recharts to avoid canvas issues in tests
vi.mock("recharts", () => ({
  BarChart: () => <div data-testid="bar-chart">BarChart</div>,
  Bar: () => <div>Bar</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
  PieChart: () => <div data-testid="pie-chart">PieChart</div>,
  Pie: () => <div>Pie</div>,
  Cell: () => <div>Cell</div>,
  LineChart: () => <div data-testid="line-chart">LineChart</div>,
  Line: () => <div>Line</div>,
  AreaChart: () => <div data-testid="area-chart">AreaChart</div>,
  Area: () => <div>Area</div>,
  RadarChart: () => <div data-testid="radar-chart">RadarChart</div>,
  PolarGrid: () => <div>PolarGrid</div>,
  PolarAngleAxis: () => <div>PolarAngleAxis</div>,
  PolarRadiusAxis: () => <div>PolarRadiusAxis</div>,
  Radar: () => <div>Radar</div>,
  ResponsiveContainer: ({children}: {children: React.ReactNode}) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

import {vi} from "vitest";

// Mock useAnalyticsData hook
vi.mock("./useAnalyticsData", () => ({
  useAnalyticsData: () => ({
    abcLists: [
      {
        name: "Test Liste 1",
        words: {a: [{word: "Apfel"}], b: [{word: "Banane"}]},
        createdAt: 1704067200000, // January 1, 2024
      },
    ],
    kawas: [{key: "test1", text: "Test KaWa", createdAt: 1704067200000}],
    kagas: [],
    stadtLandFlussGames: [],
    totalWords: 2,
    totalLists: 2,
    averageWordsPerList: 1,
    mostActiveLetters: [
      {letter: "A", count: 1},
      {letter: "B", count: 1},
    ],
    learningStreak: 1,
    lastActivityDate: new Date(),
    knowledgeAreas: [
      {area: "Test Liste 1", count: 1, strength: 2},
      {area: "KaWa: Test KaWa", count: 1, strength: 0},
    ],
  }),
}));

describe("Analytics", () => {
  it("renders analytics dashboard title", () => {
    render(<Analytics />);
    expect(screen.getByText("Lernanalyse Dashboard")).toBeInTheDocument();
  });

  it("renders tab navigation", () => {
    render(<Analytics />);
    expect(screen.getByText("Übersicht")).toBeInTheDocument();
    expect(screen.getByText("Wissensbereiche")).toBeInTheDocument();
    expect(screen.getByText("Fortschritt")).toBeInTheDocument();
    expect(screen.getByText("Vergleiche")).toBeInTheDocument();
    expect(screen.getByText("Analyse")).toBeInTheDocument();
    expect(screen.getByText("Meilensteine")).toBeInTheDocument();
  });

  it("renders Ball-im-Tor-Effekt description", () => {
    render(<Analytics />);
    expect(
      screen.getByText(
        'Verfolgen Sie Ihren Lernfortschritt mit dem "Ball-im-Tor-Effekt"',
      ),
    ).toBeInTheDocument();
  });

  it("displays overview statistics by default", () => {
    render(<Analytics />);
    // The LearningStatistics component should be rendered by default
    expect(screen.getByText("Lernstatistiken Übersicht")).toBeInTheDocument();
  });

  it("has correct document title", () => {
    render(<Analytics />);
    expect(document.title).toBe("Lernanalyse - ABC-Listen App");
  });
});
