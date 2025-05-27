import { Sliders, Target, Info, CheckCircle, Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ControlPanelProps {
  rows: number;
  cols: number;
  optimizationMode: 'min' | 'max';
  assignmentScore: number;
  isCalculating: boolean;
  onRowsChange: (value: number) => void;
  onColsChange: (value: number) => void;
  onOptimizationModeChange: (mode: 'min' | 'max') => void;
}

export default function ControlPanel({
  rows,
  cols,
  optimizationMode,
  assignmentScore,
  isCalculating,
  onRowsChange,
  onColsChange,
  onOptimizationModeChange,
}: ControlPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-matrix-border p-6 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Matrix Size Controls */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Sliders className="text-blue-600 mr-2" size={18} />
            Matrix Dimensions
          </h3>
          <div className="space-y-3">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Rows: <span className="font-mono text-blue-600">{rows}</span>
              </Label>
              <Slider
                value={[rows]}
                onValueChange={(value) => onRowsChange(value[0])}
                min={2}
                max={8}
                step={1}
                className="w-full"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Columns: <span className="font-mono text-blue-600">{cols}</span>
              </Label>
              <Slider
                value={[cols]}
                onValueChange={(value) => onColsChange(value[0])}
                min={2}
                max={8}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Optimization Mode */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Target className="text-emerald-600 mr-2" size={18} />
            Optimization Mode
          </h3>
          <RadioGroup
            value={optimizationMode}
            onValueChange={(value) => onOptimizationModeChange(value as 'min' | 'max')}
            className="flex items-center space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="min" id="min" />
              <Label htmlFor="min" className="text-sm font-medium text-gray-700 cursor-pointer">
                Minimize
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="max" id="max" />
              <Label htmlFor="max" className="text-sm font-medium text-gray-700 cursor-pointer">
                Maximize
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Status Panel */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Info className="text-indigo-600 mr-2" size={18} />
            Status
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Assignment Score:</span>
              <span className="font-mono text-lg font-semibold text-gray-900">
                {assignmentScore}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Calculation:</span>
              <span className={`text-sm flex items-center ${isCalculating ? 'text-blue-600' : 'text-emerald-600'}`}>
                {isCalculating ? (
                  <>
                    <Loader2 className="mr-1 animate-spin" size={14} />
                    Computing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-1" size={14} />
                    Complete
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
