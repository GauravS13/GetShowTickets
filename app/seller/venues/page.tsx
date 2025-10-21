"use client";

import AdvancedSeatingPlanEditor from "@/components/AdvancedSeatingPlanEditor";
import SeatingPlanEditor from "@/components/SeatingPlanEditor";
import VisualSeatMapDesigner from "@/components/VisualSeatMapDesigner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

export default function VenuesAndSeatingPage() {
  const { user } = useUser();
  const [venueName, setVenueName] = useState("");
  const [venueCity, setVenueCity] = useState("");
  const [planName, setPlanName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("theater");
  // const [showEditor, setShowEditor] = useState(false);
  const [activeTab, setActiveTab] = useState("templates");

  const venues = useQuery(api.seating.listVenues, { userId: user?.id ?? "" });
  const plans = useQuery(api.seating.listSeatingPlans, { userId: user?.id ?? "" });
  const createVenue = useMutation(api.seating.createVenue);
  // const createPlan = useMutation(api.seating.createSeatingPlan);
  const createPlanFromTemplate = useMutation(api.seating.createSeatingPlanFromTemplate);

  const templates = [
    { id: "theater", name: "Theater", description: "Orchestra, Mezzanine, Balcony", capacity: 260 },
    { id: "arena", name: "Arena", description: "VIP Floor, Standing, Tiers", capacity: 420 },
    { id: "conference", name: "Conference", description: "Front, Middle, Back sections", capacity: 440 },
    { id: "stadium", name: "Stadium", description: "Premium Box, VIP, General stands", capacity: 430 },
    { id: "cabaret", name: "Cabaret", description: "Stage tables, Front/Back tables", capacity: 76 },
  ];

  const onCreateVenue = async () => {
    if (!user?.id || !venueName) return;
    await createVenue({ userId: user.id, name: venueName, city: venueCity || undefined });
    setVenueName("");
    setVenueCity("");
  };

  const onCreatePlan = async () => {
    if (!user?.id || !planName) return;
    await createPlanFromTemplate({ 
      userId: user.id, 
      name: planName, 
      template: selectedTemplate as "theater" | "arena" | "conference" | "stadium" | "cabaret" 
    });
    setPlanName("");
  };

  const createSampleData = async () => {
    if (!user?.id) return;
    
    // Create sample venues
    await createVenue({ userId: user.id, name: "Royal Opera House", city: "Mumbai" });
    await createVenue({ userId: user.id, name: "Jawaharlal Nehru Stadium", city: "Delhi" });
    await createVenue({ userId: user.id, name: "Bangalore Palace", city: "Bangalore" });
    
    // Create sample seating plans
    await createPlanFromTemplate({ userId: user.id, name: "Classic Theater Layout", template: "theater" });
    await createPlanFromTemplate({ userId: user.id, name: "Concert Arena Setup", template: "arena" });
    await createPlanFromTemplate({ userId: user.id, name: "Conference Hall", template: "conference" });
    await createPlanFromTemplate({ userId: user.id, name: "Sports Stadium", template: "stadium" });
    await createPlanFromTemplate({ userId: user.id, name: "Intimate Cabaret", template: "cabaret" });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Sample Data Button */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Quick Start</h3>
              <p className="text-sm text-blue-700">Create sample venues and seating plans to test immediately</p>
            </div>
            <Button onClick={createSampleData} className="bg-blue-600 hover:bg-blue-700">
              Create Sample Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Venues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <input className="border px-2 py-1 rounded w-1/3" placeholder="Venue name" value={venueName} onChange={(e) => setVenueName(e.target.value)} />
              <input className="border px-2 py-1 rounded w-1/3" placeholder="City" value={venueCity} onChange={(e) => setVenueCity(e.target.value)} />
              <Button onClick={onCreateVenue} className="cursor-pointer">Add Venue</Button>
            </div>
            <div className="space-y-1">
              {(venues || []).map((v: { _id: string; name: string; city?: string }) => (
                <div key={v._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>{v.name}{v.city ? `, ${v.city}` : ""}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seating Plans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <input className="border px-2 py-1 rounded w-full" placeholder="Plan name" value={planName} onChange={(e) => setPlanName(e.target.value)} />
              <select 
                className="border px-2 py-1 rounded w-full" 
                value={selectedTemplate} 
                onChange={(e) => setSelectedTemplate(e.target.value)}
              >
                {templates.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} - {t.description} ({t.capacity} seats)
                  </option>
                ))}
              </select>
              <Button onClick={onCreatePlan} className="cursor-pointer w-full">Create from Template</Button>
            </div>
            <div className="space-y-1">
              {(plans || []).map((p: { _id: string; name: string; sections: { id: string; name: string; rows: string[]; seatLabels: string[]; price: number; capacity: number }[] }) => (
                <div key={p._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>{p.name} ({p.sections.length} sections)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Seating Plan Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Seating Plan Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="basic">Basic Editor</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Editor</TabsTrigger>
              <TabsTrigger value="visual">Visual Designer</TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates" className="mt-4">
              <div className="text-center py-8 text-gray-500">
                <p>Use the template dropdown above to create professional seating plans quickly.</p>
                <p className="text-sm mt-2">Choose from Theater, Arena, Conference, Stadium, or Cabaret layouts.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="basic" className="mt-4">
              <SeatingPlanEditor onSave={() => setActiveTab("templates")} />
            </TabsContent>
            
            <TabsContent value="advanced" className="mt-4">
              <AdvancedSeatingPlanEditor onSave={() => setActiveTab("templates")} />
            </TabsContent>
            
            <TabsContent value="visual" className="mt-4">
              <VisualSeatMapDesigner onSave={() => setActiveTab("templates")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}


