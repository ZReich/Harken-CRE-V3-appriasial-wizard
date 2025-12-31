import { MapConstants } from '../constants';

interface Point {
  lat: number;
  lng: number;
}

export const calculateCentroid = (points: Point[]): Point => {
  if (!points.length) return { lat: 40.9403762, lng:-74.1318096 };
  
  const centroid = { lat: 0, lng: 0 };
  points.forEach(point => {
    centroid.lat += point.lat;
    centroid.lng += point.lng;
  });
  
  centroid.lat /= points.length;
  centroid.lng /= points.length;
  
  return centroid;
};

export const formatMapSelectedArea = (points: Point[]) => {
  return points.map(point => ({
    lat: point.lat.toString(),
    long: point.lng.toString(),
  }));
};

export const getStaticMapUrl = (lat: number, lng: number, zoom: number, encodedPath: string, mapType: string) => {
  const size = `${MapConstants.DEFAULT_IMAGE_WIDTH}x${MapConstants.DEFAULT_IMAGE_HEIGHT}`;
  const center = `${lat},${lng}`;
  const key = import.meta.env.VITE_GOOGLE_MAPS_KEY;
  
  return `https://maps.googleapis.com/maps/api/staticmap?size=${size}&zoom=${zoom}&center=${center}&scale=2&maptype=${mapType}&path=${MapConstants.PATH_COLOR}enc:${encodedPath}&key=${key}`;
};

export const getStaticMapWithPinUrl = (lat: number, lng: number, mapType: string, iconUrl: string) => {
  const center = `${lat},${lng}`;
  const size = `${MapConstants.PIN_IMAGE_WIDTH}x${MapConstants.PIN_IMAGE_HEIGHT}`;
  const key = import.meta.env.VITE_GOOGLE_MAPS_KEY;
  
  return `https://maps.googleapis.com/maps/api/staticmap?size=${size}&zoom=${MapConstants.PIN_ZOOM}&center=${center}&scale=2&maptype=${mapType}&markers=icon:${iconUrl}|${center}&key=${key}`;
};