export interface PhotoData {
  id: string;
  uri: string;
  timestamp: number;
  location: {
    latitude: number;
    longitude: number;
  };
  filename: string;
}