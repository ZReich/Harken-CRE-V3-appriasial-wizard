import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  ListSubheader,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface UserDropdownProps {
  dropdown1Value: string;
  onChange: (value: string) => void;
  filteredUserOptions: { id: number; name: string }[];
  searchText: string;
  isLoadingUsers: boolean;
  dropdown1Open: boolean;
  setDropdown1Open: (open: boolean) => void;
  setSearchText: (text: string) => void;
  handleSearchChange: (value: string) => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({
  dropdown1Value,
  onChange,
  filteredUserOptions,
  searchText,
  isLoadingUsers,
  dropdown1Open,
  setDropdown1Open,
  setSearchText,
  handleSearchChange,
}) => {
  return (
    <FormControl size="small" sx={{ minWidth: 150 }}>
      <InputLabel
        id="dropdown1-label"
        sx={{
          ...(dropdown1Value === '' && {
            transform: 'translate(14px, 9px) scale(1)',
            '&.MuiInputLabel-shrink': {
              transform: 'translate(14px, -6px) scale(0.75)',
            },
          }),
        }}
      >
        Reviewed By
      </InputLabel>
      <Select
        labelId="dropdown1-label"
        value={dropdown1Value}
        onChange={(e) => {
          const value = e.target.value;
          onChange(value);
          setDropdown1Open(false);
          console.log('Selected value:', value);
        }}
        label="Reviewed By"
        open={dropdown1Open}
        onOpen={() => {
          setDropdown1Open(true);
        }}
        onClose={() => {
          setDropdown1Open(false);
          setSearchText('');
        }}
        MenuProps={{
          disableScrollLock: true,
          PaperProps: {
            style: {
              maxHeight: 250,
            },
          },
          autoFocus: false,
          TransitionProps: { timeout: 0 },
          disableAutoFocusItem: true,
        }}
      >
        <ListSubheader
          sx={{
            p: 0,
            backgroundColor: 'white',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <TextField
            size="small"
            autoFocus
            placeholder="Search names..."
            fullWidth
            value={searchText}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {isLoadingUsers ? '...' : <SearchIcon />}
                </InputAdornment>
              ),
              disableUnderline: true,
            }}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Escape') {
                e.stopPropagation();
              }
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </ListSubheader>
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {filteredUserOptions.map((user) => (
          <MenuItem key={user.id} value={user.id}>
            {user.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default UserDropdown;
