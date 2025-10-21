"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
// import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { Download, Plus, Save, Trash2, Upload } from "lucide-react";
import { useState } from "react";

type SeatCategory = {
  id: string;
  name: string;
  color: string;
  priceMultiplier: number;
};

type RowPricing = {
  row: string;
  price: number;
  category?: string;
};

type Section = {
  id: string;
  name: string;
  rows: string[];
  seatLabels: string[];
  price: number;
  capacity: number;
  category?: string;
  rowPricing?: RowPricing[];
};

const DEFAULT_CATEGORIES: SeatCategory[] = [
  { id: "vip", name: "VIP", color: "#FFD700", priceMultiplier: 2.0 },
  { id: "premium", name: "Premium", color: "#FF6B6B", priceMultiplier: 1.5 },
  { id: "standard", name: "Standard", color: "#4ECDC4", priceMultiplier: 1.0 },
  { id: "economy", name: "Economy", color: "#95A5A6", priceMultiplier: 0.7 },
];

export default function AdvancedSeatingPlanEditor({ 
  // planId, 
  initialSections = [], 
  onSave 
}: { 
  // planId?: Id<"seatingPlans">; 
  initialSections?: Section[];
  onSave?: () => void;
}) {
  const { user } = useUser();
  const [sections, setSections] = useState<Section[]>(initialSections);
  // const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [categories, setCategories] = useState<SeatCategory[]>(DEFAULT_CATEGORIES);
  const [dynamicPricing, setDynamicPricing] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importData, setImportData] = useState("");

  const createPlan = useMutation(api.seating.createSeatingPlan);

  const addSection = () => {
    const newSection: Section = {
      id: `section_${Date.now()}`,
      name: `Section ${sections.length + 1}`,
      rows: ["A", "B", "C"],
      seatLabels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
      price: 1000,
      capacity: 30,
      category: "standard",
      rowPricing: [],
    };
    setSections([...sections, newSection]);
    // setEditingSection(newSection);
  };

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, ...updates } : s));
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const addRow = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const lastRow = section.rows[section.rows.length - 1];
    const nextRow = String.fromCharCode(lastRow.charCodeAt(0) + 1);
    
    updateSection(sectionId, {
      rows: [...section.rows, nextRow],
      capacity: section.capacity + section.seatLabels.length
    });
  };

  const removeRow = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section || section.rows.length <= 1) return;
    
    updateSection(sectionId, {
      rows: section.rows.slice(0, -1),
      capacity: section.capacity - section.seatLabels.length
    });
  };

  const updateSeatLabels = (sectionId: string, labels: string) => {
    const seatLabels = labels.split(",").map(s => s.trim()).filter(s => s);
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    updateSection(sectionId, {
      seatLabels,
      capacity: section.rows.length * seatLabels.length
    });
  };

  const addRowPricing = (sectionId: string, row: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const newRowPricing = {
      row,
      price: section.price,
      category: section.category,
    };
    
    updateSection(sectionId, {
      rowPricing: [...(section.rowPricing || []), newRowPricing]
    });
  };

  const updateRowPricing = (sectionId: string, row: string, updates: Partial<RowPricing>) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const updatedRowPricing = (section.rowPricing || []).map(rp => 
      rp.row === row ? { ...rp, ...updates } : rp
    );
    
    updateSection(sectionId, { rowPricing: updatedRowPricing });
  };

  // const removeRowPricing = (sectionId: string, row: string) => {
  //   const section = sections.find(s => s.id === sectionId);
  //   if (!section) return;
  //   
  //   updateSection(sectionId, {
  //     rowPricing: (section.rowPricing || []).filter(rp => rp.row !== row)
  //   });
  // };

  const exportConfig = () => {
    const config = {
      sections,
      categories,
      dynamicPricing,
      version: "1.0",
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seating-plan-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = () => {
    try {
      const config = JSON.parse(importData);
      if (config.sections) setSections(config.sections);
      if (config.categories) setCategories(config.categories);
      if (config.dynamicPricing !== undefined) setDynamicPricing(config.dynamicPricing);
      setShowImport(false);
      setImportData("");
    } catch {
      alert("Invalid JSON format");
    }
  };

  const savePlan = async () => {
    if (!user?.id || sections.length === 0) return;
    
    const planName = prompt("Enter plan name:");
    if (!planName) return;
    
    await createPlan({
      userId: user.id,
      name: planName,
      sections: sections.map(s => ({
        id: s.id,
        name: s.name,
        rows: s.rows,
        seatLabels: s.seatLabels,
        price: s.price,
        capacity: s.capacity,
        category: s.category,
        rowPricing: s.rowPricing,
      }))
    });
    
    onSave?.();
  };

  const getCategoryColor = (categoryId?: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || "#95A5A6";
  };

  const getCategoryName = (categoryId?: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "Standard";
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Advanced Seating Plan Editor</h3>
        <div className="flex gap-2">
          <Button onClick={exportConfig} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button onClick={() => setShowImport(!showImport)} variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-1" />
            Import
          </Button>
          <Button onClick={addSection} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Section
          </Button>
          <Button onClick={savePlan} disabled={sections.length === 0} size="sm">
            <Save className="w-4 h-4 mr-1" />
            Save Plan
          </Button>
        </div>
      </div>

      {/* Import/Export Panel */}
      {showImport && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-sm">Import Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea
              className="w-full h-32 p-2 border rounded text-sm"
              placeholder="Paste exported JSON configuration here..."
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={importConfig} size="sm">Import</Button>
              <Button onClick={() => setShowImport(false)} variant="outline" size="sm">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dynamic Pricing Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Dynamic Pricing</h4>
              <p className="text-sm text-gray-600">Enable row-specific pricing and categories</p>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={dynamicPricing}
                onChange={(e) => setDynamicPricing(e.target.checked)}
                className="mr-2"
              />
              Enable
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Seat Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm">{category.name}</span>
                <span className="text-xs text-gray-500">×{category.priceMultiplier}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <Card key={section.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{section.name}</CardTitle>
                <Badge 
                  style={{ backgroundColor: getCategoryColor(section.category) }}
                  className="text-white"
                >
                  {getCategoryName(section.category)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Input
                  placeholder="Section name"
                  value={section.name}
                  onChange={(e) => updateSection(section.id, { name: e.target.value })}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Base price"
                    value={section.price}
                    onChange={(e) => updateSection(section.id, { price: Number(e.target.value) })}
                    className="text-sm flex-1"
                  />
                  <select
                    value={section.category || "standard"}
                    onChange={(e) => updateSection(section.id, { category: e.target.value })}
                    className="text-sm border rounded px-2 py-1"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <Input
                  placeholder="Seat labels (comma-separated)"
                  value={section.seatLabels.join(", ")}
                  onChange={(e) => updateSeatLabels(section.id, e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Rows */}
              <div className="space-y-2">
                <div className="text-xs font-medium">Rows ({section.rows.length})</div>
                <div className="space-y-1">
                  {section.rows.map((row, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-xs font-medium">{row}</span>
                      {dynamicPricing && (
                        <div className="flex items-center space-x-1">
                          <Input
                            type="number"
                            placeholder="Price"
                            value={section.rowPricing?.find(rp => rp.row === row)?.price || section.price}
                            onChange={(e) => {
                              const price = Number(e.target.value);
                              if (section.rowPricing?.find(rp => rp.row === row)) {
                                updateRowPricing(section.id, row, { price });
                              } else {
                                addRowPricing(section.id, row);
                                updateRowPricing(section.id, row, { price });
                              }
                            }}
                            className="w-16 h-6 text-xs"
                          />
                          <select
                            value={section.rowPricing?.find(rp => rp.row === row)?.category || section.category || "standard"}
                            onChange={(e) => {
                              if (section.rowPricing?.find(rp => rp.row === row)) {
                                updateRowPricing(section.id, row, { category: e.target.value });
                              } else {
                                addRowPricing(section.id, row);
                                updateRowPricing(section.id, row, { category: e.target.value });
                              }
                            }}
                            className="w-16 h-6 text-xs"
                          >
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name[0]}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addRow(section.id)}
                    className="text-xs px-2 py-1"
                  >
                    + Row
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeRow(section.id)}
                    disabled={section.rows.length <= 1}
                    className="text-xs px-2 py-1"
                  >
                    - Row
                  </Button>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Capacity: {section.capacity} seats
              </div>

              <Button
                size="sm"
                variant="destructive"
                onClick={() => removeSection(section.id)}
                className="w-full text-xs"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Remove Section
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {sections.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No sections added yet. Click &quot;Add Section&quot; to start building your seating plan.</p>
        </div>
      )}
    </div>
  );
}
