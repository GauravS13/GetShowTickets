"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Download,
    Eye,
    EyeOff,
    Plus,
    Save,
    Trash2
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

type Seat = {
  id: string;
  x: number;
  y: number;
  sectionId: string;
  row: string;
  seatNumber: string;
  category: string;
  price: number;
  selected: boolean;
};

type Section = {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  seats: Seat[];
};

type SeatingPlanSection = {
  id: string;
  name: string;
  rows: string[];
  seatLabels: string[];
  price: number;
  capacity: number;
  category: string;
  rowPricing: { row: string; price: number; category: string; }[];
};

const CATEGORIES = [
  { id: "vip", name: "VIP", color: "#FFD700", price: 5000 },
  { id: "premium", name: "Premium", color: "#FF6B6B", price: 3000 },
  { id: "standard", name: "Standard", color: "#4ECDC4", price: 2000 },
  { id: "economy", name: "Economy", color: "#95A5A6", price: 1000 },
];

export default function VisualSeatMapDesigner({ onSave }: { onSave?: (sections: SeatingPlanSection[]) => void }) {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("standard");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);

  const addSection = () => {
    const newSection: Section = {
      id: `section_${Date.now()}`,
      name: `Section ${sections.length + 1}`,
      x: 100 + (sections.length * 200),
      y: 100,
      width: 200,
      height: 150,
      color: "#E5E7EB",
      seats: [],
    };
    setSections([...sections, newSection]);
    setSelectedSection(newSection.id);
  };

  const updateSection = useCallback((sectionId: string, updates: Partial<Section>) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, ...updates } : s));
  }, [sections]);

  const removeSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
    if (selectedSection === sectionId) {
      setSelectedSection(null);
    }
  };

  const addSeatsToSection = (sectionId: string, rows: number, seatsPerRow: number) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const newSeats: Seat[] = [];
    const seatWidth = 20;
    const seatHeight = 20;
    const spacing = 5;
    const startX = section.x + 10;
    const startY = section.y + 30;

    for (let row = 0; row < rows; row++) {
      for (let seat = 0; seat < seatsPerRow; seat++) {
        const seatId = `${sectionId}_${String.fromCharCode(65 + row)}_${seat + 1}`;
        newSeats.push({
          id: seatId,
          x: startX + (seat * (seatWidth + spacing)),
          y: startY + (row * (seatHeight + spacing)),
          sectionId,
          row: String.fromCharCode(65 + row),
          seatNumber: (seat + 1).toString(),
          category: selectedCategory,
          price: CATEGORIES.find(c => c.id === selectedCategory)?.price || 2000,
          selected: false,
        });
      }
    }

    updateSection(sectionId, { seats: [...section.seats, ...newSeats] });
  };

  const handleMouseDown = (e: React.MouseEvent, sectionId: string) => {
    if (e.target !== e.currentTarget) return; // Don't drag if clicking on seats
    
    setIsDragging(true);
    setSelectedSection(sectionId);
    setDragStart({
      x: e.clientX - sections.find(s => s.id === sectionId)!.x,
      y: e.clientY - sections.find(s => s.id === sectionId)!.y,
    });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedSection) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    updateSection(selectedSection, { x: newX, y: newY });
  }, [isDragging, selectedSection, dragStart, updateSection]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSeatClick = (seatId: string) => {
    setSections(sections.map(section => ({
      ...section,
      seats: section.seats.map(seat => 
        seat.id === seatId 
          ? { ...seat, selected: !seat.selected }
          : seat
      )
    })));
  };

  const updateSeatCategory = (seatId: string, category: string) => {
    const categoryData = CATEGORIES.find(c => c.id === category);
    setSections(sections.map(section => ({
      ...section,
      seats: section.seats.map(seat => 
        seat.id === seatId 
          ? { ...seat, category, price: categoryData?.price || 2000 }
          : seat
      )
    })));
  };

  const exportDesign = () => {
    const design = {
      sections: sections.map(section => ({
        id: section.id,
        name: section.name,
        x: section.x,
        y: section.y,
        width: section.width,
        height: section.height,
        color: section.color,
        seats: section.seats.map(seat => ({
          id: seat.id,
          row: seat.row,
          seatNumber: seat.seatNumber,
          category: seat.category,
          price: seat.price,
        }))
      })),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(design, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seat-map-design-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const convertToSeatingPlan = () => {
    const seatingPlanSections = sections.map(section => {
      const rows = [...new Set(section.seats.map(seat => seat.row))].sort();
      const seatLabels = [...new Set(section.seats.map(seat => seat.seatNumber))].sort();
      const avgPrice = section.seats.length > 0 
        ? section.seats.reduce((sum, seat) => sum + seat.price, 0) / section.seats.length 
        : 2000;

      return {
        id: section.id,
        name: section.name,
        rows,
        seatLabels,
        price: Math.round(avgPrice),
        capacity: section.seats.length,
        category: section.seats[0]?.category || "standard",
        rowPricing: rows.map(row => {
          const rowSeats = section.seats.filter(seat => seat.row === row);
          const rowPrice = rowSeats.length > 0 
            ? rowSeats.reduce((sum, seat) => sum + seat.price, 0) / rowSeats.length 
            : avgPrice;
          return {
            row,
            price: Math.round(rowPrice),
            category: rowSeats[0]?.category || "standard",
          };
        }),
      };
    });

    onSave?.(seatingPlanSections);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <Button onClick={addSection} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Section
          </Button>
          <Button onClick={exportDesign} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Export Design
          </Button>
          <Button onClick={convertToSeatingPlan} size="sm" disabled={sections.length === 0}>
            <Save className="w-4 h-4 mr-1" />
            Convert to Seating Plan
          </Button>
        </div>
        
        <div className="flex gap-2 items-center">
          <Button
            onClick={() => setShowGrid(!showGrid)}
            variant="outline"
            size="sm"
          >
            {showGrid ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showGrid ? "Hide" : "Show"} Grid
          </Button>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Canvas */}
      <Card>
        <CardContent className="p-4">
          <div
            ref={canvasRef}
            className="relative w-full h-96 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Grid */}
            {showGrid && (
              <div className="absolute inset-0 opacity-20">
                {Array.from({ length: 20 }, (_, i) => (
                  <div key={i} className="absolute w-full h-px bg-gray-400" style={{ top: `${i * 20}px` }} />
                ))}
                {Array.from({ length: 30 }, (_, i) => (
                  <div key={i} className="absolute h-full w-px bg-gray-400" style={{ left: `${i * 20}px` }} />
                ))}
              </div>
            )}

            {/* Sections */}
            {sections.map((section) => (
              <div
                key={section.id}
                className={`absolute border-2 rounded cursor-move ${
                  selectedSection === section.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-400 bg-white'
                }`}
                style={{
                  left: section.x,
                  top: section.y,
                  width: section.width,
                  height: section.height,
                }}
                onMouseDown={(e) => handleMouseDown(e, section.id)}
              >
                {/* Section Header */}
                <div className="flex items-center justify-between p-2 bg-gray-100 border-b">
                  <span className="text-sm font-medium">{section.name}</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        const rows = prompt("Number of rows:");
                        const seatsPerRow = prompt("Seats per row:");
                        if (rows && seatsPerRow) {
                          addSeatsToSection(section.id, parseInt(rows), parseInt(seatsPerRow));
                        }
                      }}
                      className="text-xs px-2 py-1"
                    >
                      Add Seats
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSection(section.id);
                      }}
                      className="text-xs px-2 py-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Seats */}
                <div className="relative w-full h-full">
                  {section.seats.map((seat) => {
                    const categoryData = CATEGORIES.find(c => c.id === seat.category);
                    return (
                      <div
                        key={seat.id}
                        className={`absolute w-4 h-4 rounded cursor-pointer border ${
                          seat.selected ? 'ring-2 ring-blue-500' : ''
                        }`}
                        style={{
                          left: seat.x - section.x,
                          top: seat.y - section.y,
                          backgroundColor: categoryData?.color || '#95A5A6',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSeatClick(seat.id);
                        }}
                        title={`${seat.row}${seat.seatNumber} - ${categoryData?.name} - ₹${seat.price}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}

            {sections.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p>No sections added yet</p>
                  <p className="text-sm">Click &quot;Add Section&quot; to start designing</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Seats Info */}
      {sections.some(s => s.seats.some(seat => seat.selected)) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Selected Seats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sections.map(section => 
                section.seats
                  .filter(seat => seat.selected)
                  .map(seat => {
                    // const categoryData = CATEGORIES.find(c => c.id === seat.category);
                    return (
                      <div key={seat.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{section.name} - {seat.row}{seat.seatNumber}</span>
                        <div className="flex items-center gap-2">
                          <select
                            value={seat.category}
                            onChange={(e) => updateSeatCategory(seat.id, e.target.value)}
                            className="text-xs border rounded px-1 py-1"
                          >
                            {CATEGORIES.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                          <Input
                            type="number"
                            value={seat.price}
                            onChange={(e) => {
                              const newPrice = Number(e.target.value);
                              setSections(sections.map(s => ({
                                ...s,
                                seats: s.seats.map(seat => 
                                  seat.id === seat.id 
                                    ? { ...seat, price: newPrice }
                                    : seat
                                )
                              })));
                            }}
                            className="w-20 h-6 text-xs"
                          />
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Seat Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CATEGORIES.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm">{category.name}</span>
                <span className="text-xs text-gray-500">₹{category.price}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
