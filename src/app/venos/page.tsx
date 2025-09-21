"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

const southAmericanCountries = [
  "CO", "EC", "PE", "BO", "CL", "AR", "UY", "PY", "BR", "SR", "GY", "VE", "GF", "FK"
];

const countryNames: { [key: string]: string[] } = {
  CO: ["Colombia", "Columbia"],
  EC: ["Ecuador"],
  PE: ["Peru"],
  BO: ["Bolivia"],
  CL: ["Chile"],
  AR: ["Argentina"],
  UY: ["Uruguay"],
  PY: ["Paraguay"],
  BR: ["Brazil"],
  SR: ["Suriname"],
  GY: ["Guyana"],
  VE: ["Venezuela"],
  GF: ["French Guiana", "French Guyana"],
  FK: ["Falkland Islands", "Falklands"]
};

function normalizeString(str: string): string {
  return str.toLowerCase().replace(/[^a-z]/g, '');
}

function isCloseMatch(input: string, target: string): boolean {
  const normInput = normalizeString(input);
  const normTarget = normalizeString(target);
  if (normInput === normTarget) return true;
  // Allow one character difference for minor typos
  if (Math.abs(normInput.length - normTarget.length) <= 1) {
    let diffCount = 0;
    for (let i = 0; i < Math.max(normInput.length, normTarget.length); i++) {
      if (normInput[i] !== normTarget[i]) diffCount++;
      if (diffCount > 1) return false;
    }
    return true;
  }
  return false;
}

export default function VenosPage() {
  const chartRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [currentCountry, setCurrentCountry] = useState<string | null>(null);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [inputValue, setInputValue] = useState("");
  const [completedCountries, setCompletedCountries] = useState<Set<string>>(new Set());
  const { theme } = useTheme();

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    const loadChart = async () => {
      const am5 = await import("@amcharts/amcharts5");
      const am5map = await import("@amcharts/amcharts5/map");
      const am5geodata = await import("@amcharts/amcharts5-geodata/worldHigh");

      // Dispose of any existing root before creating a new one
      if (rootRef.current) {
        rootRef.current.dispose();
        rootRef.current = null;
      }

      const root = am5.Root.new(chartRef.current!);
      rootRef.current = root;

      const chart = root.container.children.push(
        am5map.MapChart.new(root, {
          projection: am5map.geoMercator(),
          panX: "rotateX",
          rotationX: -60,
          zoomStep: 1.02
        })
      );

      // Set background color based on theme
      const backgroundColor = theme === 'dark' ? 0x1a1a1a : 0xf5f5f5;
      chart.set("background", am5.Rectangle.new(root, {
        fill: am5.color(backgroundColor)
      }));

      const polygonSeries = chart.series.push(
        am5map.MapPolygonSeries.new(root, {
          geoJSON: am5geodata.default,
          include: southAmericanCountries
        })
      );

      // Set map colors based on theme
      const defaultFill = theme === 'dark' ? 0x8B4513 : 0xD2691E; // Saddle brown for dark, chocolate for light
      const strokeColor = theme === 'dark' ? 0x333333 : 0x666666;
      const hoverColor = theme === 'dark' ? 0x4682B4 : 0x1E90FF; // Steel blue for dark, dodger blue for light

      polygonSeries.mapPolygons.template.setAll({
        fill: am5.color(defaultFill),
        stroke: am5.color(strokeColor),
        strokeWidth: 1
      });

      polygonSeries.mapPolygons.template.states.create("hover", {
        fill: am5.color(hoverColor)
      });

      polygonSeries.mapPolygons.template.events.on("click", (ev: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const dataItem = ev.target.dataItem;
        if (dataItem) {
          const id = (dataItem.dataContext as { id: string }).id;
          if (completedCountries.has(id)) return;
          setCurrentCountry(id);
          setRevealedIndices(new Set());
          setInputValue("");
        }
      });

      // Update colors based on completion
      polygonSeries.mapPolygons.template.adapters.add("fill", (fill: any, target: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const dataItem = target.dataItem;
        if (dataItem) {
          const id = (dataItem.dataContext as { id: string }).id;
          if (completedCountries.has(id)) {
            return am5.color(0x006400); // Dark green
          }
        }
        return fill;
      });

      // Create point series for labels on completed countries
      const pointSeries = chart.series.push(
        am5map.MapPointSeries.new(root, {})
      );

      // Set up label bullets
      const labelFill = theme === 'dark' ? 0xffffff : 0x000000;
      pointSeries.bullets.push(function(root, series, dataItem) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const name = (dataItem as any).get("name") || "";
        return am5.Bullet.new(root, {
          sprite: am5.Label.new(root, {
            text: name,
            centerX: am5.p50,
            centerY: am5.p50,
            fontSize: 12,
            fill: am5.color(labelFill),
            fontWeight: "bold"
          })
        });
      });

      // Add labels for completed countries
      polygonSeries.events.on("datavalidated", function(ev) {
        const series = ev.target;
        // Clear existing data
        pointSeries.data.clear();

        series.mapPolygons.each(function(polygon) {
          const dataItem = polygon.dataItem;
          if (dataItem) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const id = (dataItem as any).get("id");
            if (completedCountries.has(id)) {
              pointSeries.pushDataItem({
                polygonId: id,
                name: countryNames[id]?.[0] || id
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any);
            }
          }
        });
      });
    };

    loadChart();

    // Cleanup function
    return () => {
      if (rootRef.current) {
        rootRef.current.dispose();
        rootRef.current = null;
      }
    };
  }, [completedCountries, theme]); // Add completedCountries and theme dependencies

  const handleSubmit = () => {
    if (!currentCountry) return;

    const acceptedNames = countryNames[currentCountry] || [];
    const isCorrect = acceptedNames.some(name => isCloseMatch(inputValue, name));

    if (isCorrect) {
      setCompletedCountries(prev => new Set([...prev, currentCountry]));
      setCurrentCountry(null);
      setRevealedIndices(new Set());
      setInputValue("");
    } else {
      const correctName = acceptedNames[0] || "";
      const letterIndices = [];
      for (let i = 0; i < correctName.length; i++) {
        if (correctName[i] !== " ") letterIndices.push(i);
      }
      const unrevealed = letterIndices.filter(i => !revealedIndices.has(i));
      if (unrevealed.length > 0) {
        const randomIndex = unrevealed[Math.floor(Math.random() * unrevealed.length)];
        setRevealedIndices(prev => new Set([...prev, randomIndex]));
      } else {
        // Fully revealed, mark as completed
        setCompletedCountries(prev => new Set([...prev, currentCountry]));
        setCurrentCountry(null);
        setRevealedIndices(new Set());
        setInputValue("");
      }
    }
  };

  const getDisplayText = () => {
    if (!currentCountry) return "";
    const correctName = countryNames[currentCountry]?.[0] || "";
    let display = "";
    for (let i = 0; i < correctName.length; i++) {
      if (revealedIndices.has(i)) {
        display += correctName[i];
      } else {
        display += " ";
      }
    }
    return display;
  };

  return (
    <div className="relative w-full h-screen">
      <div id="chartdiv" ref={chartRef} style={{ width: "100%", height: "100%" }}></div>
      {currentCountry && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`p-6 rounded-lg shadow-lg max-w-md w-full mx-4 ${
            theme === 'dark'
              ? 'bg-gray-800 text-white border border-gray-700'
              : 'bg-white text-gray-900'
          }`}>
            <p className="mb-4 text-lg">What is the name of this country?</p>
            <p className="mb-4 font-mono text-xl">{getDisplayText()}</p>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className={`border p-2 w-full mb-4 rounded ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
              placeholder="Type the country name"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex-1 transition-colors">
                Submit
              </button>
              <button
                onClick={() => {
                  setCurrentCountry(null);
                  setRevealedIndices(new Set());
                  setInputValue("");
                }}
                className={`px-4 py-2 rounded flex-1 transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-600 hover:bg-gray-500 text-white'
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
