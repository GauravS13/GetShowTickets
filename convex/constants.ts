// Popular cities for the location selector
export const POPULAR_CITIES = [
  "Mumbai",
  "Delhi", 
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Goa",
  "Jaipur"
] as const;

// Helper function to group cities alphabetically
export function groupCitiesAlphabetically(cities: Array<{ city: string; count: number }>) {
  const grouped: Record<string, Array<{ city: string; count: number }>> = {};
  
  cities.forEach(city => {
    const firstLetter = city.city.charAt(0).toUpperCase();
    if (!grouped[firstLetter]) {
      grouped[firstLetter] = [];
    }
    grouped[firstLetter].push(city);
  });
  
  // Sort each group by city name
  Object.keys(grouped).forEach(letter => {
    grouped[letter].sort((a, b) => a.city.localeCompare(b.city));
  });
  
  return grouped;
}

// Helper function to get alphabet letters for navigation
export function getAlphabetLetters() {
  return Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
}

// Helper function to check if a city is popular
export function isPopularCity(cityName: string): boolean {
  return POPULAR_CITIES.includes(cityName as any);
}

// Ticket status constants
export const TICKET_STATUS = {
  VALID: "valid",
  USED: "used",
  REFUNDED: "refunded",
  CANCELLED: "cancelled",
} as const;

// Waiting list status constants
export const WAITING_LIST_STATUS = {
  WAITING: "waiting",
  OFFERED: "offered",
  PURCHASED: "purchased",
  EXPIRED: "expired",
} as const;

// Duration constants (in milliseconds)
export const DURATIONS = {
  TICKET_OFFER: 15 * 60 * 1000, // 15 minutes
  QUEUE_PROCESSING: 5 * 60 * 1000, // 5 minutes
  EVENT_CANCELLATION_WINDOW: 24 * 60 * 60 * 1000, // 24 hours
  SEAT_HOLD: 10 * 60 * 1000, // 10 minutes seat hold
} as const;

// Language options for event form
export const LANGUAGES = [
  "English",
  "Hindi", 
  "Tamil",
  "Telugu",
  "Kannada",
  "Marathi",
  "Bengali",
  "Gujarati",
  "Punjabi",
  "Malayalam",
  "Assamese",
  "Odia",
  "Urdu",
  "Sanskrit",
  "Other"
] as const;

// Age restriction options for event form
export const AGE_RESTRICTIONS = [
  "All Ages",
  "13+ (Teen)",
  "16+ (Young Adult)",
  "18+ (Adult)",
  "21+ (Mature)"
] as const;

// Event categories
export const CATEGORIES = [
  "comedy",
  "music", 
  "sports",
  "theater",
  "activities"
] as const;

// Popular event tags for multi-select
export const POPULAR_TAGS = [
  "live",
  "weekend",
  "family",
  "outdoor",
  "indoor",
  "festival",
  "concert",
  "comedy",
  "theater",
  "sports",
  "music",
  "dance",
  "food",
  "drinks",
  "networking",
  "educational",
  "charity",
  "cultural",
  "traditional",
  "modern",
  "vip",
  "premium",
  "free",
  "paid",
  "all-ages",
  "adult-only",
  "beginner-friendly",
  "advanced",
  "interactive",
  "workshop"
] as const;