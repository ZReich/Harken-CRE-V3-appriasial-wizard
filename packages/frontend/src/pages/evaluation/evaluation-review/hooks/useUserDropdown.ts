import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export const useUserDropdown = () => {
  const [userOptions, setUserOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const [filteredUserOptions, setFilteredUserOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const [searchText, setSearchText] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [dropdown1Open, setDropdown1Open] = useState(false);
  const searchTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoadingUsers(true);
        const response = await axios.get('user/dropdown');
        if (response.data?.data?.data) {
          const formattedUsers = response.data.data.data.map((user: any) => ({
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
          }));
          setUserOptions(formattedUsers);
          setFilteredUserOptions(formattedUsers);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchText(value);

    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
    }

    setIsLoadingUsers(true);

    searchTimeoutRef.current = window.setTimeout(() => {
      const filtered = userOptions.filter((user) =>
        user.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredUserOptions(filtered);
      setIsLoadingUsers(false);
    }, 100);
  };

  return {
    userOptions,
    filteredUserOptions,
    searchText,
    isLoadingUsers,
    dropdown1Open,
    setDropdown1Open,
    setSearchText,
    handleSearchChange,
  };
};
