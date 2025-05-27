import { useState, useCallback, useEffect } from "react";
import { Calculator } from "lucide-react";
import ControlPanel from "@/components/control-panel";
import MatrixGrid from "@/components/matrix-grid";
import SensitivityGrid from "@/components/sensitivity-grid";
import CustomInputModal from "@/components/custom-input-modal";
import DistributionSelector from "@/components/distribution-selector";
import { initializeMatrix, getCostMatrixColor, getSensitivityColor, DistributionType } from "@/lib/matrix-utils";
import { hungarianAlgorithm } from "@/lib/hungarian-algorithm";
import { calculateSensitivity, SensitivityMethod } from "@/lib/sensitivity-analysis";

export default function MatrixAnalyzer() {
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(4);
  const [optimizationMode, setOptimizationMode] = useState<'min' | 'max'>('min');
  const [sensitivityMethod, setSensitivityMethod] = useState<SensitivityMethod>('basic');
  const [distribution, setDistribution] = useState<DistributionType>('uniform');
  const [costMatrix, setCostMatrix] = useState<number[][]>([]);
  const [sensitivityMatrix, setSensitivityMatrix] = useState<(number | null)[][]>([]);
  const [assignmentScore, setAssignmentScore] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number; value: number } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [needsRecalculation, setNeedsRecalculation] = useState(false);

  // Initialize matrix when dimensions change
  useEffect(() => {
    const newMatrix = initializeMatrix(rows, cols, distribution);
    setCostMatrix(newMatrix);
    setNeedsRecalculation(true);
  }, [rows, cols, distribution]);

  // Function to regenerate matrix with current distribution
  const handleRegenerateMatrix = useCallback(() => {
    setIsGenerating(true);
    
    // Small delay to show generation indicator
    setTimeout(() => {
      const newMatrix = initializeMatrix(rows, cols, distribution);
      setCostMatrix(newMatrix);
      setNeedsRecalculation(true);
      setIsGenerating(false);
    }, 300);
  }, [rows, cols, distribution]);

  // Separate effect for calculating sensitivity when needed
  useEffect(() => {
    if (costMatrix.length === 0 || !needsRecalculation) return;
    
    setIsCalculating(true);
    
    // Check matrix size - disable real-time calculations for large matrices
    const matrixSize = rows * cols;
    const isLargeMatrix = matrixSize > 64; // 8x8 or larger
    
    // Use longer debounce for large matrices or complex methods
    const debounceTime = isLargeMatrix || sensitivityMethod !== 'basic' ? 500 : 200;
    
    // Debounce calculation to prevent excessive recalculations
    const timeoutId = setTimeout(() => {
      try {
        const startTime = performance.now();
        
        const { cost, assignment } = hungarianAlgorithm(costMatrix, optimizationMode);
        setAssignmentScore(cost);
        
        // For very large matrices, skip sensitivity calculation or use basic method only
        if (matrixSize > 100) {
          console.log('Matrix too large for sensitivity analysis');
          setSensitivityMatrix(costMatrix.map(row => row.map(() => null)));
        } else {
          const sensitivity = calculateSensitivity(costMatrix, assignment, optimizationMode, sensitivityMethod);
          setSensitivityMatrix(sensitivity);
        }
        
        const endTime = performance.now();
        console.log(`Calculation took ${endTime - startTime} milliseconds for ${matrixSize} cells`);
        
      } catch (error) {
        console.error('Calculation error:', error);
        setSensitivityMatrix(costMatrix.map(row => row.map(() => null)));
      }
      
      setIsCalculating(false);
      setNeedsRecalculation(false);
    }, debounceTime);

    // Cleanup timeout on component unmount or dependency change
    return () => clearTimeout(timeoutId);
  }, [needsRecalculation, optimizationMode, sensitivityMethod, costMatrix, rows, cols]);

  // Optimized cell update function with debounced recalculation
  const updateMatrixCell = useCallback((row: number, col: number, newValue: number) => {
    setCostMatrix(prev => {
      const newMatrix = [...prev];
      newMatrix[row] = [...newMatrix[row]];
      newMatrix[row][col] = Math.max(0, newValue);
      return newMatrix;
    });
    
    // Trigger recalculation after matrix update
    setNeedsRecalculation(true);
  }, []);

  const handleCellValueChange = useCallback((row: number, col: number, newValue: number) => {
    updateMatrixCell(row, col, newValue);
  }, [updateMatrixCell]);

  const handleCellClick = useCallback((row: number, col: number) => {
    setCostMatrix(prev => {
      const currentValue = prev[row][col];
      const newValue = currentValue + 1;
      const newMatrix = [...prev];
      newMatrix[row] = [...newMatrix[row]];
      newMatrix[row][col] = newValue;
      return newMatrix;
    });
    setNeedsRecalculation(true);
  }, []);

  const handleCellRightClick = useCallback((row: number, col: number) => {
    setCostMatrix(prev => {
      const currentValue = prev[row][col];
      const newValue = Math.max(0, currentValue - 1);
      const newMatrix = [...prev];
      newMatrix[row] = [...newMatrix[row]];
      newMatrix[row][col] = newValue;
      return newMatrix;
    });
    setNeedsRecalculation(true);
  }, []);

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
              sensitivityMethod={sensitivityMethod}
              assignmentScore={assignmentScore}
              isCalculating={isCalculating}
              onRowsChange={setRows}
              onColsChange={setCols}
              onOptimizationModeChange={setOptimizationMode}
              onSensitivityMethodChange={setSensitivityMethod}
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

        {/* Performance Warning for Large Matrices */}
        {rows * cols > 64 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fas fa-exclamation-triangle text-yellow-400 text-lg"></i>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Large Matrix Performance Notice
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    You're working with a {rows}×{cols} matrix ({rows * cols} cells). 
                    {rows * cols > 100 ? ' Sensitivity analysis is disabled for matrices this large to prevent performance issues.' : ' Real-time calculations may be slower.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

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
