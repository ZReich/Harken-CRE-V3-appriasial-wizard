import { useState, useEffect } from 'react';
import axios from 'axios';
import { usa_state } from '@/pages/comps/comp-form/fakeJson';

export const useWikipediaData = (city?: string, county?: string, state?: string) => {
  const [cityInfo, setCityInfo] = useState<string>('');
  const [countyInfo, setCountyInfo] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!city && !county) return;
      
      setIsLoading(true);
      
      try {
        const usaStateOptions = Object.entries(usa_state[0]).map(
          ([value, label]) => ({
            value,
            label,
          })
        );

        // Map state abbreviation to full name
        const fullState = usaStateOptions.find((option) => option.value === state)?.label || state;

        if (city && fullState) {
          const citySearchString = `${city}, ${fullState}`;
          const cityData = await fetchWikipediaInfo(citySearchString);
          setCityInfo(cityData);
        }

        if (county && fullState) {
          const countySearchString = `${county}, ${fullState}`;
          const countyData = await fetchWikipediaInfo(countySearchString);
          setCountyInfo(countyData);
        }
      } catch (error) {
        console.error('Error fetching location data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [city, county, state]);

  const fetchWikipediaInfo = async (searchString: string) => {
    try {
      const response = await axios.post('/get-wikipedia-info', {
        string: searchString,
      });
      return response.data.data.data;
    } catch (error) {
      console.error('Error fetching Wikipedia data:', error);
      return '';
    }
  };

  return { cityInfo, countyInfo, isLoading, setCityInfo, setCountyInfo };
};