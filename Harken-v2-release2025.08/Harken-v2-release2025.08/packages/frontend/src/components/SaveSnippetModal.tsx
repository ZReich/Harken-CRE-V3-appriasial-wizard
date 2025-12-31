import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';

interface SnippetCategory {
  id: any;
  category_name: any;
}

interface SaveSnippetModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  categories: SnippetCategory[];
  selectedCategory: any;
  setSelectedCategory: (id: any) => void;
  hasCategoryChanged: boolean;
  selectedAddCategory: any;
  setSelectedAddCategory: (id: any) => void;
  setHasCategoryChanged: (val: boolean) => void;
  isCategoryModalVisible: boolean;
  setIsCategoryModalVisible: (val: boolean) => void;
  newCategory: string;
  setNewCategory: (val: string) => void;
  handleAddCategory: () => void;
  closeAddNewCategory: () => void;
  name: string;
  setName: (val: string) => void;
  snippet: string;
  setSnippet: (val: string) => void;
  errors: {
    category: string;
    name: string;
    snippet: string;
    newCategory: string;
  };
}

const SaveSnippetModal: React.FC<SaveSnippetModalProps> = ({
  open,
  onClose,
  onSave,
  categories,
  selectedCategory,
  hasCategoryChanged,
  selectedAddCategory,
  setSelectedAddCategory,
  setHasCategoryChanged,
  isCategoryModalVisible,
  setIsCategoryModalVisible,
  newCategory,
  setNewCategory,
  handleAddCategory,
  closeAddNewCategory,
  name,
  setName,
  snippet,
  setSnippet,
  errors,
}) => {
  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth>
        <DialogTitle>Add New Snippet</DialogTitle>
        <DialogContent>
          {/* Category Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TextField
              select
              margin="dense"
              label={
                <span>
                  Snippet Category <span style={{ color: '#d32f2f' }}>*</span>
                </span>
              }
              value={
                hasCategoryChanged
                  ? selectedAddCategory
                  : selectedCategory || ''
              }
              onChange={(e) => {
                setSelectedAddCategory(e.target.value);
                setHasCategoryChanged(true);
                // Clear category error when user selects
                if (errors.category) {
                  // setErrors(prev => ({ ...prev, category: '' }));
                }
              }}
              fullWidth
              error={!!errors.category}
              helperText={errors.category}
              sx={{
                '& .MuiFormHelperText-root': {
                  color: '#d32f2f !important',
                },
              }}
            >
              {categories.map((cat: any) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.category_name}
                </MenuItem>
              ))}
            </TextField>
            <PlusOutlined
              style={{ fontSize: 20, cursor: 'pointer', marginTop: 6 }}
              onClick={() => setIsCategoryModalVisible(true)}
            />
          </div>

          {/* Category Modal (MUI Dialog) */}
          <Dialog
            open={isCategoryModalVisible}
            onClose={closeAddNewCategory}
            fullWidth
            maxWidth="xs"
          >
            <DialogTitle>Add Category</DialogTitle>
            <DialogContent>
              <TextField
                label={
                  <span>
                    Save snippet category <span style={{ color: '#d32f2f' }}>*</span>
                  </span>
                }
                value={newCategory}
                onChange={(e) => {
                  setNewCategory(e.target.value);
                  // Clear error when user types
                  // if (errors.newCategory) setErrors(prev => ({ ...prev, newCategory: '' }));
                }}
                fullWidth
                margin="dense"
                error={!!errors.newCategory}
                helperText={errors.newCategory}
                sx={{
                  '& .MuiFormHelperText-root': {
                    color: '#d32f2f !important',
                  },
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button
                style={{
                  backgroundColor: 'rgb(169, 167, 167)',
                  borderColor: 'rgb(169, 167, 167)',
                  color: '#fff',
                }}
                onClick={closeAddNewCategory}
              >
                Close
              </Button>
              <Button
                style={{
                  backgroundColor: 'rgb(13, 161, 199)',
                  borderColor: 'rgb(13, 161, 199)',
                  color: '#fff',
                }}
                onClick={handleAddCategory}
                color="primary"
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>

          {/* Name Input */}
          <TextField
            autoFocus
            margin="dense"
            label={
              <span>
                Save snippet as <span style={{ color: '#d32f2f' }}>*</span>
              </span>
            }
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              // Clear error when user types
              // if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
            }}
            fullWidth
            error={!!errors.name}
            helperText={errors.name}
            sx={{
              '& .MuiFormHelperText-root': {
                color: '#d32f2f !important',
              },
            }}
          />

          {/* Snippet Input */}
          <TextField
            margin="dense"
            label={
              <span>
                Snippet <span style={{ color: '#d32f2f' }}>*</span>
              </span>
            }
            value={snippet}
            onChange={(e) => {
              setSnippet(e.target.value);
              // Clear error when user types
              // if (errors.snippet) setErrors(prev => ({ ...prev, snippet: '' }));
            }}
            fullWidth
            error={!!errors.snippet}
            helperText={errors.snippet}
            sx={{
              '& .MuiFormHelperText-root': {
                color: '#d32f2f !important',
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            style={{
              backgroundColor: 'rgb(169, 167, 167)',
              borderColor: 'rgb(169, 167, 167)',
              color: '#fff',
            }}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            style={{ backgroundColor: 'rgb(13 161 199)' }}
            onClick={onSave}
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SaveSnippetModal; 