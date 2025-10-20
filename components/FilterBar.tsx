"use client";

import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, DollarSign, Filter, MapPin, Tag, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "./ui/badge";

interface FilterBarProps {
  onFiltersChange?: (filters: FilterState) => void;
  className?: string;
}

interface FilterState {
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  startDate?: number;
  endDate?: number;
}

const PRICE_RANGES = [
  { label: "Free", min: 0, max: 0 },
  { label: "Under £50", min: 0, max: 50 },
  { label: "£50 - £100", min: 50, max: 100 },
  { label: "£100 - £200", min: 100, max: 200 },
  { label: "£200+", min: 200, max: Infinity },
];

const DATE_RANGES = [
  { label: "Today", days: 0 },
  { label: "This Week", days: 7 },
  { label: "This Month", days: 30 },
  { label: "Next 3 Months", days: 90 },
];

export default function FilterBar({ onFiltersChange, className = "" }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({});
  const [isExpanded, setIsExpanded] = useState(false);
  
  const categories = useQuery(api.events.getCategoriesWithCount);
  const cities = useQuery(api.events.getAvailableCities);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  };

  const clearFilter = (filterKey: keyof FilterState) => {
    const updatedFilters = { ...filters };
    delete updatedFilters[filterKey];
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  };

  const clearAllFilters = () => {
    setFilters({});
    onFiltersChange?.({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== null && value !== ""
    ).length;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full glass-effect",
              "hover:bg-accent/10 hover:shadow-lg transition-all duration-300",
              "focus-visible-glow"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Filter className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Filters</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {getActiveFilterCount()}
              </Badge>
            )}
          </motion.button>

          {hasActiveFilters && (
            <motion.button
              onClick={clearAllFilters}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear all
            </motion.button>
          )}
        </div>

        {/* Active Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {filters.category && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Badge 
                variant="secondary" 
                className="gap-1 cursor-pointer hover:bg-destructive/10"
                onClick={() => clearFilter("category")}
              >
                <Tag className="w-3 h-3" />
                {filters.category}
                <X className="w-3 h-3" />
              </Badge>
            </motion.div>
          )}

          {filters.city && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Badge 
                variant="secondary" 
                className="gap-1 cursor-pointer hover:bg-destructive/10"
                onClick={() => clearFilter("city")}
              >
                <MapPin className="w-3 h-3" />
                {filters.city}
                <X className="w-3 h-3" />
              </Badge>
            </motion.div>
          )}

          {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Badge 
                variant="secondary" 
                className="gap-1 cursor-pointer hover:bg-destructive/10"
                onClick={() => {
                  clearFilter("minPrice");
                  clearFilter("maxPrice");
                }}
              >
                <DollarSign className="w-3 h-3" />
                Price
                <X className="w-3 h-3" />
              </Badge>
            </motion.div>
          )}

          {(filters.startDate !== undefined || filters.endDate !== undefined) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Badge 
                variant="secondary" 
                className="gap-1 cursor-pointer hover:bg-destructive/10"
                onClick={() => {
                  clearFilter("startDate");
                  clearFilter("endDate");
                }}
              >
                <Calendar className="w-3 h-3" />
                Date
                <X className="w-3 h-3" />
              </Badge>
            </motion.div>
          )}
        </div>
      </div>

      {/* Expanded Filter Options */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="glass-effect-strong rounded-2xl p-6 space-y-6 overflow-hidden"
          >
            {/* Category Filter */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Category
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories?.map((category) => (
                  <motion.button
                    key={category.category}
                    onClick={() => updateFilters({ 
                      category: filters.category === category.category ? undefined : category.category 
                    })}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm transition-all duration-200",
                      filters.category === category.category
                        ? "bg-primary text-primary-foreground"
                        : "glass-effect hover:bg-accent/10 text-foreground"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category.category} ({category.count})
                  </motion.button>
                ))}
              </div>
            </div>

            {/* City Filter */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                City
              </h3>
              <div className="flex flex-wrap gap-2">
                {cities?.slice(0, 10).map((city) => (
                  <motion.button
                    key={city.city}
                    onClick={() => updateFilters({ 
                      city: filters.city === city.city ? undefined : city.city 
                    })}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm transition-all duration-200",
                      filters.city === city.city
                        ? "bg-primary text-primary-foreground"
                        : "glass-effect hover:bg-accent/10 text-foreground"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {city.city} ({city.count})
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Price Range
              </h3>
              <div className="flex flex-wrap gap-2">
                {PRICE_RANGES.map((range) => (
                  <motion.button
                    key={range.label}
                    onClick={() => updateFilters({ 
                      minPrice: range.min === Infinity ? undefined : range.min,
                      maxPrice: range.max === Infinity ? undefined : range.max
                    })}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm transition-all duration-200",
                      filters.minPrice === range.min && filters.maxPrice === range.max
                        ? "bg-primary text-primary-foreground"
                        : "glass-effect hover:bg-accent/10 text-foreground"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {range.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Date Filter */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date Range
              </h3>
              <div className="flex flex-wrap gap-2">
                {DATE_RANGES.map((range) => {
                  const startDate = Date.now();
                  const endDate = startDate + (range.days * 24 * 60 * 60 * 1000);
                  
                  return (
                    <motion.button
                      key={range.label}
                      onClick={() => updateFilters({ 
                        startDate: range.days === 0 ? undefined : startDate,
                        endDate: range.days === 0 ? undefined : endDate
                      })}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm transition-all duration-200",
                        filters.startDate === startDate && filters.endDate === endDate
                          ? "bg-primary text-primary-foreground"
                          : "glass-effect hover:bg-accent/10 text-foreground"
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {range.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

