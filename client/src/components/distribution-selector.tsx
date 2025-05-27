import { useState } from "react";
import { BarChart3, Settings, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DistributionType, DistributionParams } from "@/lib/matrix-utils";

interface DistributionSelectorProps {
  distribution: DistributionType;
  onDistributionChange: (distribution: DistributionType) => void;
  onRegenerateMatrix: () => void;
  isGenerating: boolean;
}

const distributionInfo = {
  uniform: {
    name: "Uniform",
    description: "Equal probability for all values in range",
    formula: "U(min, max)",
    useCase: "Balanced scenarios, equal likelihood"
  },
  gaussian: {
    name: "Gaussian (Normal)",
    description: "Bell curve distribution around mean",
    formula: "N(μ, σ²)",
    useCase: "Natural variations, measurement errors"
  },
  normal: {
    name: "Normal",
    description: "Standard normal distribution",
    formula: "N(μ, σ²)",
    useCase: "Standard statistical modeling"
  },
  poisson: {
    name: "Poisson",
    description: "Discrete events in fixed intervals",
    formula: "Pois(λ)",
    useCase: "Count data, rare events"
  },
  bimodal: {
    name: "Bimodal Normal",
    description: "Sum of two normal distributions",
    formula: "w×N(μ₁,σ₁²) + (1-w)×N(μ₂,σ₂²)",
    useCase: "Mixed populations, dual scenarios"
  },
  exponential: {
    name: "Exponential",
    description: "High probability for small values",
    formula: "Exp(λ)",
    useCase: "Arrival times, failure rates"
  },
  halfNormal: {
    name: "Half-Normal",
    description: "Positive values from normal distribution",
    formula: "HN(σ)",
    useCase: "Absolute deviations, distances"
  },
  weibull: {
    name: "Weibull",
    description: "Flexible shape for reliability modeling",
    formula: "W(k, λ)",
    useCase: "Survival analysis, wind speeds"
  },
  gamma: {
    name: "Gamma",
    description: "Continuous positive values with shape control",
    formula: "Γ(α, β)",
    useCase: "Waiting times, income distributions"
  },
  discrete: {
    name: "Discrete",
    description: "Specific predefined values only",
    formula: "Custom set",
    useCase: "Rating scales, categorical costs"
  }
};

export default function DistributionSelector({
  distribution,
  onDistributionChange,
  onRegenerateMatrix,
  isGenerating
}: DistributionSelectorProps) {
  const [showParameters, setShowParameters] = useState(false);
  const currentInfo = distributionInfo[distribution];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="text-purple-600" size={18} />
          Statistical Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Distribution Selector */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Distribution Type</Label>
          <Select value={distribution} onValueChange={onDistributionChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select distribution" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(distributionInfo).map(([key, info]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center justify-between w-full">
                    <span>{info.name}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {info.formula}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Current Distribution Info */}
        <div className="bg-purple-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-purple-900">{currentInfo.name}</h4>
            <Badge variant="secondary" className="text-xs">
              {currentInfo.formula}
            </Badge>
          </div>
          <p className="text-sm text-purple-700">{currentInfo.description}</p>
          <p className="text-xs text-purple-600">
            <strong>Use case:</strong> {currentInfo.useCase}
          </p>
        </div>

        {/* Parameter Controls Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowParameters(!showParameters)}
            className="flex items-center gap-2"
          >
            <Settings size={14} />
            {showParameters ? "Hide" : "Show"} Parameters
          </Button>
          
          <Button
            onClick={onRegenerateMatrix}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? "Generating..." : "Regenerate"}
          </Button>
        </div>

        {/* Parameter Controls */}
        {showParameters && (
          <DistributionParameters distribution={distribution} />
        )}

        {/* Quick Presets */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Quick Presets</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDistributionChange('uniform')}
              className={distribution === 'uniform' ? 'bg-purple-100' : ''}
            >
              Balanced
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDistributionChange('normal')}
              className={distribution === 'normal' ? 'bg-purple-100' : ''}
            >
              Normal
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDistributionChange('poisson')}
              className={distribution === 'poisson' ? 'bg-purple-100' : ''}
            >
              Count Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDistributionChange('bimodal')}
              className={distribution === 'bimodal' ? 'bg-purple-100' : ''}
            >
              Dual Peaks
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDistributionChange('exponential')}
              className={distribution === 'exponential' ? 'bg-purple-100' : ''}
            >
              Skewed
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDistributionChange('discrete')}
              className={distribution === 'discrete' ? 'bg-purple-100' : ''}
            >
              Fixed Values
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Component for distribution-specific parameters
function DistributionParameters({ distribution }: { distribution: DistributionType }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-3">
      <h4 className="font-medium text-gray-900">Distribution Parameters</h4>
      
      {distribution === 'uniform' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-600">Minimum</Label>
            <Input type="number" defaultValue={1} className="h-8" />
          </div>
          <div>
            <Label className="text-xs text-gray-600">Maximum</Label>
            <Input type="number" defaultValue={100} className="h-8" />
          </div>
        </div>
      )}

      {distribution === 'gaussian' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-600">Mean (μ)</Label>
            <Input type="number" defaultValue={50} className="h-8" />
          </div>
          <div>
            <Label className="text-xs text-gray-600">Std Dev (σ)</Label>
            <Input type="number" defaultValue={20} className="h-8" />
          </div>
        </div>
      )}

      {distribution === 'normal' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-600">Mean (μ)</Label>
            <Input type="number" defaultValue={50} className="h-8" />
          </div>
          <div>
            <Label className="text-xs text-gray-600">Std Dev (σ)</Label>
            <Input type="number" defaultValue={20} className="h-8" />
          </div>
        </div>
      )}

      {distribution === 'poisson' && (
        <div>
          <Label className="text-xs text-gray-600">Rate (λ)</Label>
          <Input type="number" defaultValue={25} className="h-8" />
          <p className="text-xs text-gray-500 mt-1">Average number of events</p>
        </div>
      )}

      {distribution === 'bimodal' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-600">Mean 1 (μ₁)</Label>
              <Input type="number" defaultValue={30} className="h-8" />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Std Dev 1 (σ₁)</Label>
              <Input type="number" defaultValue={10} className="h-8" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-600">Mean 2 (μ₂)</Label>
              <Input type="number" defaultValue={70} className="h-8" />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Std Dev 2 (σ₂)</Label>
              <Input type="number" defaultValue={10} className="h-8" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-600">Weight (w)</Label>
            <Input type="number" defaultValue={0.5} step={0.1} min={0} max={1} className="h-8" />
            <p className="text-xs text-gray-500 mt-1">Probability of first distribution (0-1)</p>
          </div>
        </div>
      )}

      {distribution === 'exponential' && (
        <div>
          <Label className="text-xs text-gray-600">Rate (λ)</Label>
          <Input type="number" defaultValue={0.1} step={0.01} className="h-8" />
        </div>
      )}

      {distribution === 'halfNormal' && (
        <div>
          <Label className="text-xs text-gray-600">Scale (σ)</Label>
          <Input type="number" defaultValue={30} className="h-8" />
        </div>
      )}

      {distribution === 'weibull' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-600">Shape (k)</Label>
            <Input type="number" defaultValue={2} step={0.1} className="h-8" />
          </div>
          <div>
            <Label className="text-xs text-gray-600">Scale (λ)</Label>
            <Input type="number" defaultValue={50} className="h-8" />
          </div>
        </div>
      )}

      {distribution === 'gamma' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-600">Shape (α)</Label>
            <Input type="number" defaultValue={2} step={0.1} className="h-8" />
          </div>
          <div>
            <Label className="text-xs text-gray-600">Rate (β)</Label>
            <Input type="number" defaultValue={0.05} step={0.01} className="h-8" />
          </div>
        </div>
      )}

      {distribution === 'discrete' && (
        <div>
          <Label className="text-xs text-gray-600">Values (comma-separated)</Label>
          <Input 
            type="text" 
            defaultValue="10,20,30,40,50,60,70,80,90,100" 
            className="h-8" 
            placeholder="10,20,30,40,50"
          />
        </div>
      )}
    </div>
  );
}