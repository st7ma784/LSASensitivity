import { Sliders, Target, Info, CheckCircle, Loader2, Brain } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SENSITIVITY_METHODS, SensitivityMethod } from "@/lib/sensitivity-analysis";

interface ControlPanelProps {
  rows: number;
  cols: number;
  optimizationMode: 'min' | 'max';
  sensitivityMethod: SensitivityMethod;
  assignmentScore: number;
  isCalculating: boolean;
  onRowsChange: (value: number) => void;
  onColsChange: (value: number) => void;
  onOptimizationModeChange: (mode: 'min' | 'max') => void;
  onSensitivityMethodChange: (method: SensitivityMethod) => void;
}

export default function ControlPanel({
  rows,
  cols,
  optimizationMode,
  sensitivityMethod,
  assignmentScore,
  isCalculating,
  onRowsChange,
  onColsChange,
  onOptimizationModeChange,
  onSensitivityMethodChange,
}: ControlPanelProps) {
  const selectedMethodInfo = SENSITIVITY_METHODS[sensitivityMethod];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-matrix-border p-6 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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

        {/* Sensitivity Method */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Brain className="text-purple-600 mr-2" size={18} />
            Sensitivity Method
          </h3>
          <div className="space-y-3">
            <Select value={sensitivityMethod} onValueChange={onSensitivityMethodChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SENSITIVITY_METHODS).map(([key, method]) => (
                  <SelectItem key={key} value={key}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Method Info */}
            <div className="bg-gray-50 rounded-md p-3 text-xs">
              <p className="text-gray-700 mb-1">
                <strong>Description:</strong> {selectedMethodInfo.description}
              </p>
              <p className="text-green-700 mb-1">
                <strong>Strengths:</strong> {selectedMethodInfo.strengths}
              </p>
              <p className="text-amber-700">
                <strong>Limitations:</strong> {selectedMethodInfo.weaknesses}
              </p>
            </div>
          </div>
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
