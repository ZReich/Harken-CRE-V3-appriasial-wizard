import React from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';

interface SendTypeItem {
  GoogleData: any;
}

const containerStyle = {
  aspectRatio: '16/9',
  height: '425px',
  width: '100%',
};

const zoom = 4;

const CompViewGoogleMapLocation: React.FC<SendTypeItem> = ({ GoogleData }) => {
  const lat = Number(
    GoogleData && (GoogleData.latitude || GoogleData.map_pin_lat)
  );
  const long = Number(
    GoogleData && (GoogleData.longitude || GoogleData.map_pin_lng)
  );

  const center = {
    lat: lat ? lat : 34.0479,
    lng: long ? long : 100.6197,
  };

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={zoom}>
      <Marker position={center} />
    </GoogleMap>
  );
};

export default React.memo(CompViewGoogleMapLocation);
