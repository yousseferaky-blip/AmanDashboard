export interface CarType {
  id: number;
  name: string;
  imageUrl: string;
  pricePerKm: number;
  minPricePerKm: number;
  maxPricePerKm: number;
  minimumFare?: number;
  pricePerKmYemen?: number;
  minimumFareYemen?: number;
  surgePriceMultiplierYemen?: number;
  surgePriceMultiplier?: number; 
  isActive: boolean;
  description?: string | null;
  carDrivers?: unknown | null;
}
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
} 