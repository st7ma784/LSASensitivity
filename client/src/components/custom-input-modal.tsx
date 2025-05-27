import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomInputModalProps {
  isOpen: boolean;
  selectedCell: { row: number; col: number; value: number } | null;
  onSave: (value: number) => void;
  onCancel: () => void;
}

export default function CustomInputModal({
  isOpen,
  selectedCell,
  onSave,
  onCancel,
}: CustomInputModalProps) {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (selectedCell) {
      setInputValue(selectedCell.value.toString());
    }
  }, [selectedCell]);

  const handleSave = () => {
    const value = parseInt(inputValue, 10);
    if (!isNaN(value) && value >= 0) {
      onSave(value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="w-80">
        <DialogHeader>
          <DialogTitle>Edit Cell Value</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              Position:{" "}
              <span className="font-mono">
                {selectedCell ? `Row ${selectedCell.row + 1}, Col ${selectedCell.col + 1}` : ""}
              </span>
            </Label>
            <Input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Enter value..."
              min="0"
              autoFocus
            />
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Save
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
