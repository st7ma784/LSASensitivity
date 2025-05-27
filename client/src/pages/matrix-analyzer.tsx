import { useState, useCallback, useEffect } from "react";
import { Calculator } from "lucide-react";
import ControlPanel from "@/components/control-panel";
import MatrixGrid from "@/components/matrix-grid";
import SensitivityGrid from "@/components/sensitivity-grid";
import CustomInputModal from "@/components/custom-input-modal";
import DistributionSelector from "@/components/distribution-selector";
import { initializeMatrix, getCostMatrixColor, getSensitivityColor, DistributionType } from "@/lib/matrix-utils";
import { hungarianAlgorithm } from "@/lib/hungarian-algorithm";
import { calculateSensitivity } from "@/lib/sensitivity-analysis";

export default function MatrixAnalyzer() {
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(4);
  const [optimizationMode, setOptimizationMode] = useState<'min' | 'max'>('min');
  const [distribution, setDistribution] = useState<DistributionType>('uniform');
  const [costMatrix, setCostMatrix] = useState<number[][]>([]);
  const [sensitivityMatrix, setSensitivityMatrix] = useState<(number | null)[][]>([]);
  const [assignmentScore, setAssignmentScore] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number; value: number } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Initialize matrix when dimensions change
  useEffect(() => {
    const newMatrix = initializeMatrix(rows, cols, distribution);
    setCostMatrix(newMatrix);
  }, [rows, cols, distribution]);

  // Function to regenerate matrix with current distribution
  const handleRegenerateMatrix = useCallback(() => {
    setIsGenerating(true);
    
    // Small delay to show generation indicator
    setTimeout(() => {
      const newMatrix = initializeMatrix(rows, cols, distribution);
      setCostMatrix(newMatrix);
      setIsGenerating(false);
    }, 300);
  }, [rows, cols, distribution]);

  // Calculate assignment and sensitivity when matrix or mode changes
  useEffect(() => {
    if (costMatrix.length === 0) return;
    
    setIsCalculating(true);
    
    // Small delay to show calculation indicator
    setTimeout(() => {
      try {
        const { cost, assignment } = hungarianAlgorithm(costMatrix, optimizationMode);
        setAssignmentScore(cost);
        
        const sensitivity = calculateSensitivity(costMatrix, assignment, optimizationMode);
        setSensitivityMatrix(sensitivity);
      } catch (error) {
        console.error('Calculation error:', error);
        setSensitivityMatrix(costMatrix.map(row => row.map(() => null)));
      }
      
      setIsCalculating(false);
    }, 100);
  }, [costMatrix, optimizationMode]);

  const handleCellValueChange = useCallback((row: number, col: number, newValue: number) => {
    setCostMatrix(prev => {
      const newMatrix = prev.map((r, i) => 
        i === row 
          ? r.map((c, j) => j === col ? Math.max(0, newValue) : c)
          : [...r]
      );
      return newMatrix;
    });
  }, []);

  const handleCellClick = useCallback((row: number, col: number) => {
    handleCellValueChange(row, col, costMatrix[row][col] + 1);
  }, [costMatrix, handleCellValueChange]);

  const handleCellRightClick = useCallback((row: number, col: number) => {
    handleCellValueChange(row, col, costMatrix[row][col] - 1);
  }, [costMatrix, handleCellValueChange]);

  const handleCellDoubleClick = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col, value: costMatrix[row][col] });
    setModalOpen(true);
  }, [costMatrix]);

  const handleCustomValueSave = useCallback((value: number) => {
    if (selectedCell) {
      handleCellValueChange(selectedCell.row, selectedCell.col, value);
    }
    setModalOpen(false);
    setSelectedCell(null);
  }, [selectedCell, handleCellValueChange]);

  return (
    <div className="min-h-screen bg-matrix-bg">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-matrix-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Calculator className="text-2xl text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Matrix Assignment Sensitivity Analyzer
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Real-time sensitivity analysis for linear assignment problems
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <ControlPanel
              rows={rows}
              cols={cols}
              optimizationMode={optimizationMode}
              assignmentScore={assignmentScore}
              isCalculating={isCalculating}
              onRowsChange={setRows}
              onColsChange={setCols}
              onOptimizationModeChange={setOptimizationMode}
            />
          </div>
          <div>
            <DistributionSelector
              distribution={distribution}
              onDistributionChange={setDistribution}
              onRegenerateMatrix={handleRegenerateMatrix}
              isGenerating={isGenerating}
            />
          </div>
        </div>

        {/* Matrix Container */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Original Matrix Panel */}
          <div className="bg-white rounded-lg shadow-sm border border-matrix-border">
            <div className="px-6 py-4 border-b border-matrix-border">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <i className="fas fa-edit text-blue-600 mr-2"></i>
                Cost Matrix
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (Click to edit values)
                </span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Left click: +1 | Right click: -1 | Double click: custom input
              </p>
            </div>
            <div className="p-6">
              <MatrixGrid
                matrix={costMatrix}
                onCellClick={handleCellClick}
                onCellRightClick={handleCellRightClick}
                onCellDoubleClick={handleCellDoubleClick}
                getCellColor={getCostMatrixColor}
                showTooltips={true}
              />
            </div>
          </div>

          {/* Sensitivity Matrix Panel */}
          <div className="bg-white rounded-lg shadow-sm border border-matrix-border">
            <div className="px-6 py-4 border-b border-matrix-border">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <i className="fas fa-chart-line text-emerald-600 mr-2"></i>
                Sensitivity Analysis
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (Maximum change before assignment affects)
                </span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Green: low sensitivity | Red: high sensitivity
              </p>
            </div>
            <div className="p-6">
              <SensitivityGrid
                matrix={sensitivityMatrix}
                getCellColor={getSensitivityColor}
                isCalculating={isCalculating}
              />
            </div>
          </div>
        </div>

        {/* Legend Panel */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-matrix-border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i className="fas fa-palette text-purple-600 mr-2"></i>
            Color Legend & Instructions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Cost Matrix Colors</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
                  <span className="text-sm text-gray-600">Low values (0-25)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                  <span className="text-sm text-gray-600">Medium-low values (26-50)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded"></div>
                  <span className="text-sm text-gray-600">Medium-high values (51-75)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-300 border border-blue-500 rounded"></div>
                  <span className="text-sm text-gray-600">High values (76+)</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Sensitivity Colors</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-emerald-100 border border-emerald-300 rounded"></div>
                  <span className="text-sm text-gray-600">Low sensitivity (∞ or &gt;10)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                  <span className="text-sm text-gray-600">Medium sensitivity (6-10)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
                  <span className="text-sm text-gray-600">High sensitivity (4-5)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                  <span className="text-sm text-gray-600">Very high sensitivity (1-3)</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Distribution Types</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></div>
                  <span className="text-sm text-gray-600">Current: {distribution.charAt(0).toUpperCase() + distribution.slice(1)}</span>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• <strong>Uniform</strong>: Equal probability</p>
                  <p>• <strong>Normal</strong>: Standard bell curve</p>
                  <p>• <strong>Poisson</strong>: Count data, rare events</p>
                  <p>• <strong>Bimodal</strong>: Two peaks (dual scenarios)</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <i className="fas fa-mouse-pointer mr-2"></i>
                Matrix Interaction
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Left-click: Increase value (+1)</li>
                <li>• Right-click: Decrease value (-1)</li>
                <li>• Double-click: Custom input</li>
                <li>• Hover: View cell position</li>
              </ul>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2 flex items-center">
                <i className="fas fa-chart-bar mr-2"></i>
                Distribution Controls
              </h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Select distribution type</li>
                <li>• Use quick presets</li>
                <li>• Regenerate with same distribution</li>
                <li>• Adjust distribution parameters</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Input Modal */}
      <CustomInputModal
        isOpen={modalOpen}
        selectedCell={selectedCell}
        onSave={handleCustomValueSave}
        onCancel={() => {
          setModalOpen(false);
          setSelectedCell(null);
        }}
      />
    </div>
  );
}
