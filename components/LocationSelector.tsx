"use client";

import { api } from "@/convex/_generated/api";
import { groupCitiesAlphabetically, isPopularCity } from "@/convex/constants";
import { getCityFromCoordinates, getCurrentLocation } from "@/lib/geolocation";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { ChevronDown, Loader2, MapPin, Navigation, X } from "lucide-react";
import { useState } from "react";
import { cityIcons, type CityName } from "./ui/city-icons";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface LocationSelectorProps {
  selectedCity?: string;
  onCityChange?: (city: string) => void;
  className?: string;
}

export default function LocationSelector({ 
  selectedCity = "All Cities", 
  onCityChange,
  className = ""
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  
  const cities = useQuery(api.events.getAvailableCities);
  const allCities = cities || [];

  // Filter cities based on search term
  const filteredCities = allCities.filter(city =>
    city.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group cities alphabetically
  const groupedCities = groupCitiesAlphabetically(filteredCities);

  // Filter popular cities
  const popularCities = allCities.filter(city => isPopularCity(city.city));

  const handleCitySelect = (city: string) => {
    onCityChange?.(city);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleCurrentLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const position = await getCurrentLocation();
      const availableCityNames = allCities.map(c => c.city);
      const detectedCity = await getCityFromCoordinates(position, availableCityNames);
      
      if (detectedCity) {
        handleCitySelect(detectedCity);
      } else {
        alert("Could not detect your location. Please select a city manually.");
      }
    } catch (error) {
      console.error("Location detection failed:", error);
      alert("Location detection failed. Please select a city manually.");
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const selectedCityInfo = allCities.find(c => c.city === selectedCity);


  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-full border border-border/50",
          "hover:bg-muted/50 transition-colors duration-200 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
        )}
      >
        <MapPin className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">
          {selectedCity}
        </span>
        {selectedCityInfo && (
          <span className="text-xs text-muted-foreground">
            ({selectedCityInfo.count})
          </span>
        )}
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[80vh] w-full max-w-2xl overflow-hidden flex flex-col">
          <DialogHeader className="relative pb-3">
            <DialogTitle className="text-xl font-semibold text-foreground">Select Location</DialogTitle>
            <DialogClose onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </DialogClose>
          </DialogHeader>

          <div className="space-y-4 pb-2 flex-1 overflow-y-auto">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search city, area or locality"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-muted/20 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                autoFocus
              />
            </div>

            {/* Use Current Location */}
            <button
              onClick={handleCurrentLocation}
              disabled={isDetectingLocation}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Navigation className="w-4 h-4 text-primary" />
              <span className="font-medium text-primary text-sm">
                {isDetectingLocation ? "Detecting your location..." : "Use Current Location"}
              </span>
              {isDetectingLocation && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            </button>

            {/* Popular Cities */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">Popular Cities</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {popularCities.map((city) => {
                  const IconComponent = cityIcons[city.city as CityName];
                  return (
                    <button
                      key={city.city}
                      onClick={() => handleCitySelect(city.city)}
                      className={cn(
                        "flex flex-col items-center p-3 rounded-lg border transition-all duration-200 cursor-pointer",
                        selectedCity === city.city
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border/30 bg-muted/10 hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm"
                      )}
                    >
                      <div className="mb-1.5 flex items-center justify-center">
                        {IconComponent ? (
                          <IconComponent className="w-10 h-10 text-primary" size={40} />
                        ) : (
                          <MapPin className="w-10 h-10 text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-xs font-semibold text-center text-foreground leading-tight">
                        {city.city}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* All Cities */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">Other Cities</h3>
              
              <div className="relative">
                {/* Cities List */}
                <div 
                  className="max-h-64 overflow-y-auto"
                >
                  {!cities ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* All Cities option */}
                      <button
                        onClick={() => handleCitySelect("All Cities")}
                        className={cn(
                          "w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all duration-200",
                          selectedCity === "All Cities"
                            ? "bg-primary/10 text-primary font-semibold border border-primary/30"
                            : "hover:bg-muted/50 text-foreground border border-border/30"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span className="font-medium text-sm">All Cities</span>
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                          ({allCities.reduce((sum, city) => sum + city.count, 0)})
                        </span>
                      </button>

                      {/* Alphabetical Cities */}
                      {Object.entries(groupedCities)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([letter, cities]) => (
                          <div key={letter} className="space-y-2">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide sticky top-0 bg-background py-1">
                              {letter}
                            </h4>
                            <div className="grid grid-cols-1 gap-1">
                              {cities.map((city) => (
                                <button
                                  key={city.city}
                                  onClick={() => handleCitySelect(city.city)}
                                  className={cn(
                                    "flex items-center justify-between p-2 rounded text-left transition-colors duration-200",
                                    selectedCity === city.city
                                      ? "bg-primary/10 text-primary font-medium"
                                      : "hover:bg-muted/50 text-foreground"
                                  )}
                                >
                                  <span className="text-sm">{city.city}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({city.count})
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}

                      {filteredCities.length === 0 && searchTerm && (
                        <div className="text-center py-8 text-muted-foreground">
                          No cities found matching &quot;{searchTerm}&quot;
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
