import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Box, Typography, CircularProgress } from '@mui/material';

interface ClusterData {
  lat: number;
  lng: number;
  count: number;
  avgPrice?: number;
  minPrice?: number;
  maxPrice?: number;
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface ClusteredMapProps {
  onPropertiesChange?: (properties: any[]) => void;
  filters?: any;
}

const ClusteredCompsMap: React.FC<ClusteredMapProps> = ({
  onPropertiesChange,
  filters = {},
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [clusters, setClusters] = useState<ClusterData[]>([]);
  const [zoom, setZoom] = useState(4);
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [loading, setLoading] = useState(false);
  const [center] = useState({ lat: 39.8283, lng: -98.5795 });

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);

    // Add event listeners
    map.addListener('bounds_changed', () => {
      const bounds = map.getBounds();
      if (bounds) {
        setBounds({
          north: bounds.getNorthEast().lat(),
          south: bounds.getSouthWest().lat(),
          east: bounds.getNorthEast().lng(),
          west: bounds.getSouthWest().lng(),
        });
      }
    });

    map.addListener('zoom_changed', () => {
      setZoom(map.getZoom() || 4);
    });
  }, []);

  const fetchClusters = useCallback(async () => {
    if (!bounds) return;

    setLoading(true);
    try {
      const response = await fetch('/api/comps/geo-clustered', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          bounds,
          zoom,
          filters: {
            type:
              localStorage.getItem('checkType') === 'leasesCheckbox'
                ? 'lease'
                : 'sale',
            ...filters,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch clusters');
      }

      const data = await response.json();
      setClusters(data.data?.clusters || []);

      // Also fetch top properties for sidebar if zoom level is high enough
      if (zoom >= 14 && onPropertiesChange) {
        const topResponse = await fetch('/api/comps/top-properties', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            bounds,
            limit: 60,
            filters: {
              type:
                localStorage.getItem('checkType') === 'leasesCheckbox'
                  ? 'lease'
                  : 'sale',
              ...filters,
            },
          }),
        });

        if (topResponse.ok) {
          const topData = await topResponse.json();
          onPropertiesChange(topData.data?.properties || []);
        }
      }
    } catch (error) {
      console.error('Error fetching clusters:', error);
    } finally {
      setLoading(false);
    }
  }, [bounds, zoom, filters, onPropertiesChange]);

  useEffect(() => {
    if (bounds) {
      fetchClusters();
    }
  }, [fetchClusters]);

  const createClusterIcon = (count: number): string => {
    const size = Math.min(Math.max(30, Math.log10(count) * 20), 60);
    const color =
      count > 1000
        ? '#d73027'
        : count > 100
          ? '#fc8d59'
          : count > 10
            ? '#fee08b'
            : '#4575b4';

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="${size / 2}" y="${size / 2 + 5}" text-anchor="middle" fill="white" font-family="Arial" font-size="${Math.max(10, size / 4)}" font-weight="bold">
          ${count > 1000 ? `${Math.round(count / 1000)}k` : count}
        </text>
      </svg>
    `)}`;
  };

  const renderClusterMarker = (cluster: ClusterData, index: number) => {
    if (zoom >= 14) {
      // Individual property marker
      return (
        <Marker
          key={index}
          position={{ lat: cluster.lat, lng: cluster.lng }}
          icon={{
            url: '/property-marker.png', // You'll need to add this icon
            scaledSize: new google.maps.Size(30, 30),
          }}
          title={`Property - $${cluster.avgPrice}/SF`}
        />
      );
    } else {
      // Cluster marker
      return (
        <Marker
          key={index}
          position={{ lat: cluster.lat, lng: cluster.lng }}
          icon={{
            url: createClusterIcon(cluster.count),
            scaledSize: new google.maps.Size(50, 50),
          }}
          title={`${cluster.count} properties - Avg: $${cluster.avgPrice?.toFixed(2)}/SF`}
          onClick={() => {
            // Zoom in on cluster
            if (map) {
              map.setZoom(zoom + 3);
              map.setCenter({ lat: cluster.lat, lng: cluster.lng });
            }
          }}
        />
      );
    }
  };

  if (loadError) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="400px"
      >
        <Typography color="error">Error loading Google Maps</Typography>
      </Box>
    );
  }

  if (!isLoaded) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box position="relative" width="100%" height="100%">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={zoom}
        onLoad={handleMapLoad}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {clusters.map(renderClusterMarker)}
      </GoogleMap>

      {loading && (
        <Box
          position="absolute"
          top={16}
          left={16}
          display="flex"
          alignItems="center"
          bgcolor="rgba(255, 255, 255, 0.9)"
          p={1}
          borderRadius={1}
        >
          <CircularProgress size={20} />
          <Typography variant="body2" ml={1}>
            Loading properties...
          </Typography>
        </Box>
      )}

      {!loading && clusters.length > 0 && (
        <Box
          position="absolute"
          bottom={16}
          left={16}
          bgcolor="rgba(255, 255, 255, 0.9)"
          p={1}
          borderRadius={1}
        >
          <Typography variant="body2">
            {clusters.reduce((sum, cluster) => sum + cluster.count, 0)}{' '}
            properties found
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ClusteredCompsMap;
