import React, { useContext } from 'react';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { MyContext } from '@/App';

const containerStyle = {
  width: '100%',
  height: '250px',
  aspectRatio: '16/9',
};

const zoom = 4;

// interface MarkerPosition {
//   lat: number;
//   lng: number;
// }

// interface Props {
//   passData: MarkerPosition;
// }

function GoogleMapLocationEditor() {
  const { isLoaded } = useContext(MyContext);
  const defaultCenter = {
    lat: 40.7128,
    lng: -74.0060,
  };

//   const center = passData && passData.lat && passData.lng ? passData : defaultCenter;
const center = defaultCenter;
  
  const handleMarkerDrag = (e: google.maps.MapMouseEvent) => {
    const newPosition = {
      lat: e.latLng!.lat(),
      lng: e.latLng!.lng(),
    };

    console.log('New Marker Position:', newPosition);
  };

  return isLoaded ? (
    <>
      <div className="flex ">
        <div className="w-full">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={zoom}
          >
            <MarkerF
              position={{ lat: 40.7128, lng: -74.0060 }}
              draggable={true}
              onDragEnd={handleMarkerDrag}
            />
          </GoogleMap>
        </div>
      </div>
    </>
  ) : (
    <></>
  );
}

export default React.memo(GoogleMapLocationEditor);
