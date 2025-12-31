import React, { useContext } from 'react';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { MyContext } from '@/App';

const containerStyle = {
  width: '100%',
  height: '250px',
  aspectRatio: '25/9',
};

const zoom = 4;

function FakeGoogleMapLocation() {
  const { isLoaded } = useContext(MyContext);
  const defaultCenter = {
    lat: 40.7128,
    lng: -74.006,
  };

  const center = defaultCenter;

  return isLoaded ? (
    <>
      <div className="flex ">
        <div className="w-full">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={zoom}
            onLoad={(map) => {
              map.setOptions({
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                zoomControl: false,
                gestureHandling: 'none',
                scrollwheel: false,
              });
            }}
          >
            <MarkerF
              position={{ lat: 40.7128, lng: -74.006 }}
              draggable={true}
            />
          </GoogleMap>
        </div>
      </div>
    </>
  ) : (
    <></>
  );
}

export default React.memo(FakeGoogleMapLocation);
