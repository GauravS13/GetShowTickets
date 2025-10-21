"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
// import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useState } from "react";

type Section = {
  id: string;
  name: string;
  rows: string[];
  seatLabels: string[];
  price: number;
  capacity: number;
};

export default function SeatingPlanEditor({ 
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

  const createPlan = useMutation(api.seating.createSeatingPlan);

  const addSection = () => {
    const newSection: Section = {
      id: `section_${Date.now()}`,
      name: `Section ${sections.length + 1}`,
      rows: ["A", "B", "C"],
      seatLabels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
      price: 1000,
      capacity: 30,
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
      }))
    });
    
    onSave?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Seating Plan Editor</h3>
        <div className="flex gap-2">
          <Button onClick={addSection} variant="outline">
            Add Section
          </Button>
          <Button onClick={savePlan} disabled={sections.length === 0}>
            Save Plan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <Card key={section.id} className="relative">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{section.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Input
                  placeholder="Section name"
                  value={section.name}
                  onChange={(e) => updateSection(section.id, { name: e.target.value })}
                  className="text-sm"
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={section.price}
                  onChange={(e) => updateSection(section.id, { price: Number(e.target.value) })}
                  className="text-sm"
                />
                <Input
                  placeholder="Seat labels (comma-separated)"
                  value={section.seatLabels.join(", ")}
                  onChange={(e) => updateSeatLabels(section.id, e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1">
                <div className="text-xs font-medium">Rows ({section.rows.length})</div>
                <div className="flex flex-wrap gap-1">
                  {section.rows.map((row, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {row}
                    </span>
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
