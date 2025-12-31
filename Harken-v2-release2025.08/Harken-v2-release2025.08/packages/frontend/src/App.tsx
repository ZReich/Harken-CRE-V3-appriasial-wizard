import { createContext, useEffect } from 'react';
import RoutesApp from './routing/Routes';
import { useJsApiLoader } from '@react-google-maps/api';
import { MyContextValue } from './components/interface/context-type';

export const MyContext = createContext<MyContextValue>({ isLoaded: false });

const key = import.meta.env.VITE_GOOGLE_MAPS_KEY;

export function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: key,
    id: 'google-map-script',
    libraries: ['drawing', 'geometry', 'places'],
  });

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node: any) => {
          if (
            node.nodeType === 1 &&
            node.style.position === 'absolute' &&
            node.style.overflow === 'hidden' &&
            node.style.visibility === 'hidden'
          ) {
            node.parentNode.removeChild(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {isLoaded ? (
        <MyContext.Provider value={{ isLoaded }}>
          <RoutesApp />
        </MyContext.Provider>
      ) : (
        <div className="w-100 h-100 flex flex justify-items-center items-center">
          <h5>Loading please wait...</h5>
        </div>
      )}
    </>
  );
}
