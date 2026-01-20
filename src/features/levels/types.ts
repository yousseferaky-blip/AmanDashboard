export interface Level {
  id: number;
  level: number;
  requiredTrips: number;
  commissionPercentage: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}
