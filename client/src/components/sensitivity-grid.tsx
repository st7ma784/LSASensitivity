import { useState } from "react";

interface SensitivityGridProps {
  matrix: (number | null)[][];
  getCellColor: (value: number | null) => string;
  isCalculating: boolean;
}

export default function SensitivityGrid({
  matrix,
  getCellColor,
  isCalculating,
}: SensitivityGridProps) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  if (matrix.length === 0) {
    return (
      <div className="matrix-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="h-12 bg-gray-100 rounded-md flex items-center justify-center">
          <span className="text-gray-500 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  const cols = matrix[0]?.length || 0;

  const formatSensitivityValue = (value: number | null): string => {
    if (value === null) return "—";
    if (value === Infinity) return "∞";
    return value.toString();
  };

  const getSensitivityTooltip = (value: number | null): string => {
    if (value === null) return "Calculation error";
    if (value === Infinity) return "Can change infinitely without affecting assignment";
    return `Can change by ${value} before affecting assignment`;
  };

  return (
    <div className="matrix-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {matrix.map((row, i) =>
        row.map((cell, j) => (
          <div
            key={`${i}-${j}`}
            className={`matrix-cell ${getCellColor(cell)} rounded-md p-3 text-center relative group ${
              isCalculating ? 'animate-pulse' : ''
            }`}
            onMouseEnter={() => setHoveredCell({ row: i, col: j })}
            onMouseLeave={() => setHoveredCell(null)}
          >
            <span className="font-mono text-sm font-medium text-gray-900">
              {isCalculating ? "..." : formatSensitivityValue(cell)}
            </span>
            {hoveredCell?.row === i && hoveredCell?.col === j && !isCalculating && (
              <div className="tooltip show absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20">
                {getSensitivityTooltip(cell)}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
