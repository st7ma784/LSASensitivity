import { useState } from "react";

interface MatrixGridProps {
  matrix: number[][];
  onCellClick: (row: number, col: number) => void;
  onCellRightClick: (row: number, col: number) => void;
  onCellDoubleClick: (row: number, col: number) => void;
  getCellColor: (value: number) => string;
  showTooltips?: boolean;
}

export default function MatrixGrid({
  matrix,
  onCellClick,
  onCellRightClick,
  onCellDoubleClick,
  getCellColor,
  showTooltips = false,
}: MatrixGridProps) {
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

  return (
    <div className="matrix-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {matrix.map((row, i) =>
        row.map((cell, j) => (
          <div
            key={`${i}-${j}`}
            className={`matrix-cell ${getCellColor(cell)} rounded-md p-3 text-center cursor-pointer relative group`}
            onClick={() => onCellClick(i, j)}
            onContextMenu={(e) => {
              e.preventDefault();
              onCellRightClick(i, j);
            }}
            onDoubleClick={() => onCellDoubleClick(i, j)}
            onMouseEnter={() => setHoveredCell({ row: i, col: j })}
            onMouseLeave={() => setHoveredCell(null)}
          >
            <span className="font-mono text-sm font-medium text-gray-900">
              {cell}
            </span>
            {showTooltips && hoveredCell?.row === i && hoveredCell?.col === j && (
              <div className="tooltip show absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20">
                Row {i + 1}, Col {j + 1}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
