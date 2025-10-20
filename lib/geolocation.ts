// Geolocation utilities for location detection
export interface GeolocationPosition {
  latitude: number;
  longitude: number;
}

export interface CityMatch {
  city: string;
  distance: number;
}

// Approximate coordinates for major Indian cities
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Mumbai": { lat: 19.0760, lng: 72.8777 },
  "Delhi": { lat: 28.6139, lng: 77.2090 },
  "Bangalore": { lat: 12.9716, lng: 77.5946 },
  "Hyderabad": { lat: 17.3850, lng: 78.4867 },
  "Chennai": { lat: 13.0827, lng: 80.2707 },
  "Kolkata": { lat: 22.5726, lng: 88.3639 },
  "Pune": { lat: 18.5204, lng: 73.8567 },
  "Ahmedabad": { lat: 23.0225, lng: 72.5714 },
  "Goa": { lat: 15.2993, lng: 74.1240 },
  "Jaipur": { lat: 26.9124, lng: 75.7873 },
  "New York": { lat: 40.7128, lng: -74.0060 },
  "London": { lat: 51.5074, lng: -0.1278 },
  "Las Vegas": { lat: 36.1699, lng: -115.1398 },
  "Noida": { lat: 28.5355, lng: 77.3910 },
  "Gurugram": { lat: 28.4595, lng: 77.0266 },
};

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find the closest city to given coordinates
export function findClosestCity(
  position: GeolocationPosition,
  availableCities: string[]
): CityMatch | null {
  let closestCity: CityMatch | null = null;
  let minDistance = Infinity;

  availableCities.forEach(city => {
    const coords = CITY_COORDINATES[city];
    if (coords) {
      const distance = calculateDistance(
        position.latitude,
        position.longitude,
        coords.lat,
        coords.lng
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = { city, distance };
      }
    }
  });

  return closestCity;
}

// Get current location using browser geolocation API
export function getCurrentLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let message = "Unable to retrieve your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable";
            break;
          case error.TIMEOUT:
            message = "Location request timed out";
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

// Get city name from coordinates (simplified reverse geocoding)
export async function getCityFromCoordinates(
  position: GeolocationPosition,
  availableCities: string[]
): Promise<string | null> {
  try {
    const closestCity = findClosestCity(position, availableCities);
    return closestCity ? closestCity.city : null;
  } catch (error) {
    console.error("Error finding city from coordinates:", error);
    return null;
  }
}
