import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Tooltip,
  MenuItem,
  Box,
} from '@mui/material';
import 'react-quill/dist/quill.snow.css';
import { Grid } from '@mui/material';
import { useGet } from '@/hook/useGet';
import axios from 'axios';
import { toast } from 'react-toastify';
import saveSnippets from '../../images/Group 1669.svg';
import { Icons } from '@/components/icons';
import DeleteConfirmationSnippet from '../comps/Listing/delete-confirmation-snippet';
import { RequestType } from '@/hook';
import { useMutate } from '@/hook/useMutate';
// import { PlusOutlined } from '@ant-design/icons';
import SaveSnippetModal from '@/components/SaveSnippetModal';
interface SnippetCategory {
  id: any;
  category_name: any;
}
const SnippetList: React.FC = () => {
  const [snippetOptions, setSnippetOptions] = useState<Snippet[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(undefined);
  const [isSNippetModalOpen, setIsSnippetModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [snippet, setSnippet] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [selectedAddCategory, setSelectedAddCategory] = useState<any | null>(
    null
  );
  const [hasCategoryChanged, setHasCategoryChanged] = useState(false);

  const [selectedUpdateCategory, setSelectedUpdateCategory] = useState<
    any | null
  >(null);

  const [newCategory, setNewCategory] = useState('');

  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  const [snippetCategories, setSnippetCategories] = useState<SnippetCategory[]>(
    []
  );

  // Add error states
  const [errors, setErrors] = useState({
    category: '',
    name: '',
    snippet: '',
    newCategory: '',
  });

  const handleOpenDialog = () => {
    // setSelectedAddCategory(''),
    setName('');
    setSnippet('');
    // Clear errors when opening dialog
    setErrors({
      category: '',
      name: '',
      snippet: '',
      newCategory: '',
    });

    setIsSnippetModalOpen(true);
  };

  const handleCloseDialog = () => {
    setIsSnippetModalOpen(false);
    setSelectedAddCategory('');
    setHasCategoryChanged(false);
    setName('');
    setSnippet('');
    // Clear errors when closing dialog
    setErrors({
      category: '',
      name: '',
      snippet: '',
      newCategory: '',
    });
  };

  const mutation = useMutate<any, any>({
    queryKey: 'template/save-snippet',
    endPoint: 'template/save-snippet',
    requestType: RequestType.POST,
  });

  const fetchSnippetsCategory = async (highlightedCategoryName?: string) => {
    try {
      const response = await axios.get('template/snippet-category-list');
      const categories = response.data.data.data;

      setSnippetCategories(categories);

      // Select newly added category if name is provided
      if (highlightedCategoryName) {
        const newCategory = categories.find(
          (cat: any) => cat.category_name === highlightedCategoryName
        );
        if (newCategory) {
          setSelectedCategory(newCategory.id);
          setSelectedUpdateCategory(newCategory.id);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchSnippetsCategory();
  }, []);

  const handleAddCategory = async () => {
    // Clear previous errors
    setErrors((prev) => ({ ...prev, newCategory: '' }));

    if (newCategory === '') {
      setErrors((prev) => ({
        ...prev,
        newCategory: 'Please fill the snippet category',
      }));
      return;
    } else {
      try {
        const response = await axios.post('template/save-snippet-category', {
          category_name: newCategory,
        });

        const newlyAddedCategory = response?.data?.data?.data;

        setSnippetCategories((prev: any) => [...prev, newlyAddedCategory]);
        setSelectedAddCategory(newlyAddedCategory.id);
        setHasCategoryChanged(true); // 👈 ensure this triggers the correct value selection
        setNewCategory('');
        setIsCategoryModalVisible(false);
        toast.success('Snippet Category saved successfully');
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.data?.message ||
          'Something went wrong while saving the category';
        setErrors((prev) => ({ ...prev, newCategory: errorMessage }));
        console.error('Error saving category:', error);
      }
    }
  };

  const handleOpenDeleteModal = (id: React.SetStateAction<undefined>) => {
    setDeleteId(id);
    setIsModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsModalOpen(false);
    setDeleteId(undefined);
  };

  const handleDeleteSuccess = () => {
    const filteredSnippets = snippetOptions.filter(
      (snippet) => snippet.id !== deleteId
    );
    fetchSnippetsByCategory(selectedCategory);
    fetchSnippetsCategory();
    setSnippetOptions(filteredSnippets);
  };
  const handleAddMore = () => {
    // Clear previous errors
    setErrors({
      category: '',
      name: '',
      snippet: '',
      newCategory: '',
    });

    let hasErrors = false;

    if (!selectedCategory && !selectedAddCategory && !newCategory) {
      setErrors((prev) => ({
        ...prev,
        category: 'Snippet Category is required',
      }));
      hasErrors = true;
    }

    if (name.trim() === '') {
      setErrors((prev) => ({ ...prev, name: 'Snippet name is required' }));
      hasErrors = true;
    }

    if (snippet.trim() === '') {
      setErrors((prev) => ({ ...prev, snippet: 'Snippet is required' }));
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    mutation.mutate(
      (() => {
        return {
          name,
          snippet,
          snippets_category_id: hasCategoryChanged
            ? selectedAddCategory
            : selectedCategory,
        };
      })(),
      {
        onSuccess: (response) => {
          if (response.data?.statusCode === 200) {
            toast.success(
              response.data.message || 'Snippet saved successfully'
            );
            fetchSnippetsByCategory(selectedCategory);
            fetchSnippetsCategory();
          } else {
            toast.error(response.data.message || 'Failed to save snippet');
          }
          refetch1();
          handleCloseDialog();
        },
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.data?.message ||
            'Something went wrong while saving the snippet';
          toast.error(errorMessage);
          console.error('Failed to save snippet:', error);
        },
      }
    );
  };
  interface Snippet {
    id: undefined;
    name: string;
    snippet: any;
  }

  const handleModalClose = () => {
    setIsEditModalVisible(false);
  };
  type SnippetArray = {
    data: {
      data: Snippet[];
    };
  };
  const { data: snippetArray, refetch: refetch1 } = useGet<SnippetArray>({
    queryKey: 'snippet-list',
    endPoint: 'template/snippet-list',
    config: { enabled: true, refetchOnWindowFocus: false },
  });

  const [open1, setOpen1] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [filteredSnippetData, setFilteredSnippetData] = useState<Snippet[]>([]);

  const [selectedSnippet, setSelectedSnippet] = useState({
    id: '',
    name: '',
    snippet: '',
  });
  interface Snippet {
    id: undefined;
    name: string;
    snippet: any;
  }

  useEffect(() => {
    if (snippetArray?.data?.data) {
      const dynamicOptions = snippetArray.data.data.map(
        (item: { snippet: any; name: any; id: any }) => ({
          snippet: item.snippet,
          name: item.name,
          id: item?.id,
        })
      );
      setSnippetOptions(dynamicOptions);
    }
  }, [snippetArray]);

  const handleOpen1 = () => {
    setOpen1(true);
  };

  const handleClose1 = () => {
    setSelectedCategory('');
    setOpen1(false);
  };
  const handleEditClick = (snippet: {
    id?: string;
    name: string;
    snippet: string;
  }) => {
    setSelectedSnippet({
      id: snippet.id ?? 'default-id',
      name: snippet.name,
      snippet: snippet.snippet,
    });
    setIsEditModalVisible(true);
  };

  const handleModalClose1 = () => {
    setIsEditModalVisible(false);
  };
  const fetchSnippetsByCategory = async (categoryId: any) => {
    try {
      const response = await axios.get(
        `template/snippet-category/${categoryId}`
      );

      const snippets = response?.data?.data?.data?.snippets || [];

      setFilteredSnippetData(snippets);
    } catch (error) {
      console.error('Error fetching snippets by category:', error);
    }
  };

  const handleSave = async () => {
    const { id, name, snippet } = selectedSnippet;

    try {
      const response = await axios.post(`template/update-snippet/${id}`, {
        name,
        snippet,
        snippets_category_id: selectedUpdateCategory,
      });

      if (response.status === 200) {
        toast.success(response.data.message || 'Snippet updated successfully');
        setIsEditModalVisible(false);
        fetchSnippetsCategory(); // Refresh categories list
        await fetchSnippetsByCategory(selectedCategory); // ⬅️ Refresh snippet list by category
      } else {
        toast.error(response.data.message || 'Failed to update snippet');
      }
    } catch (error) {
      toast.error('Failed to update snippet');
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setSelectedSnippet((prev) => ({ ...prev, [name]: value }));
  };
  useEffect(() => {
    if (snippetCategories.length && selectedCategory) {
      const matched = snippetCategories.find(
        (cat) => cat.id === selectedCategory
      );
      if (matched) {
        setSelectedUpdateCategory(matched.id);
      }
    }
  }, [snippetCategories, selectedCategory]);
  const closeAddNewCategory = () => {
    setNewCategory('');
    setIsCategoryModalVisible(false);
    // Clear new category error
    setErrors((prev) => ({ ...prev, newCategory: '' }));
  };
  return (
    <>
      <div className="flex-coloumn w-full">
        <Grid container spacing={2}>
          <Grid item xs={12} className="p-5">
            <img
              style={{ cursor: 'pointer' }}
              src={saveSnippets}
              alt="Save Snippets"
              onClick={handleOpen1}
            />

            {/* Main Snippet List Dialog */}
            <Dialog
              open={open1}
              onClose={handleClose1}
              fullWidth
              maxWidth={false}
              PaperProps={{ style: { maxWidth: '2000px' } }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                {/* Left Section: Title + Dropdown */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
                >
                  <DialogTitle style={{ margin: 0, padding: 0 }}>
                    Snippet List
                  </DialogTitle>

                  <TextField
                    select
                    margin="dense"
                    label="Select Category"
                    value={selectedCategory || ''}
                    onChange={async (e) => {
                      const categoryId = e.target.value;
                      setSelectedCategory(categoryId);
                      await fetchSnippetsByCategory(categoryId); // ⬅️ Use the reusable function

                      try {
                        const response = await axios.get(
                          `template/snippet-category/${categoryId}` // call the API with selected ID
                        );

                        const snippets =
                          response?.data?.data?.data?.snippets || [];

                        setFilteredSnippetData(snippets); // update state with filtered data
                      } catch (error) {
                        console.error(
                          'Error fetching snippets by category:',
                          error
                        );
                      }
                    }}
                    fullWidth={false}
                    sx={{ width: 250 }}
                    size="small"
                  >
                    {snippetCategories.map((cat: any) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.category_name}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>

                {/* Right Section: Add Button + Close Icon */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    style={{
                      marginRight: '16px',
                      backgroundColor: 'rgb(13 161 199)',
                    }}
                    variant="contained"
                    onClick={handleOpenDialog}
                  >
                    Add New Snippet
                  </Button>

                  <Icons.CutICon
                    onClick={handleClose1}
                    style={{
                      color: 'inherit',
                      marginRight: '16px',
                      cursor: 'pointer',
                    }}
                    aria-label="close"
                  />
                </div>
              </div>

              {/* Add New Snippet Dialog */}

              <SaveSnippetModal
                open={isSNippetModalOpen}
                onClose={handleCloseDialog}
                onSave={handleAddMore}
                categories={snippetCategories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                hasCategoryChanged={hasCategoryChanged}
                selectedAddCategory={selectedAddCategory}
                setSelectedAddCategory={setSelectedAddCategory}
                setHasCategoryChanged={setHasCategoryChanged}
                isCategoryModalVisible={isCategoryModalVisible}
                setIsCategoryModalVisible={setIsCategoryModalVisible}
                newCategory={newCategory}
                setNewCategory={setNewCategory}
                handleAddCategory={handleAddCategory}
                closeAddNewCategory={closeAddNewCategory}
                name={name}
                setName={setName}
                snippet={snippet}
                setSnippet={setSnippet}
                errors={errors}
              />

              {/* Snippet Table */}
              <DialogContent>
                <TableContainer
                  component={Paper}
                  sx={{ width: '100%', height: '500px' }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Snippet</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredSnippetData && filteredSnippetData.length > 0 ? (
                        filteredSnippetData.map((snippet, index) => (
                          <TableRow key={index}>
                            <TableCell>{snippet.name}</TableCell>
                            <TableCell>
                              <Tooltip
                                title={snippet.snippet}
                                arrow
                                placement="right"
                              >
                                <span
                                  style={{
                                    display: 'inline-block',
                                    maxWidth: '150px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    cursor: 'pointer',
                                  }}
                                >
                                  {snippet.snippet}
                                </span>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Icons.DeleteIcon
                                style={{
                                  color: 'rgb(255 0 0)',
                                  fontSize: '24px',
                                  marginLeft: '10px',
                                  cursor: 'pointer',
                                }}
                                onClick={() =>
                                  handleOpenDeleteModal(snippet.id)
                                }
                              />
                              <Icons.EditIcon
                                style={{
                                  color: 'rgb(13 161 199)',
                                  fontSize: '24px',
                                  marginLeft: '10px', // Added for spacing between icons
                                  cursor: 'pointer',
                                }}
                                onClick={() => handleEditClick(snippet)}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} align="center">
                            No data available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                      <DeleteConfirmationSnippet
                        close={handleCloseDeleteModal}
                        deleteId={deleteId}
                        setArrayAfterDelete={handleDeleteSuccess}
                      />
                    </div>
                  )}
                </TableContainer>

                {/* Edit Snippet Dialog */}
                <Dialog
                  open={isEditModalVisible}
                  onClose={handleModalClose1}
                  fullWidth
                  maxWidth="sm"
                >
                  <Box sx={{ mt: 2, px: 3 }}>
                    {' '}
                    {/* Add margin top and padding horizontally */}
                    <TextField
                      select
                      margin="dense"
                      label="Select Category"
                      value={selectedUpdateCategory || ''}
                      onChange={(e) => {
                        const categoryId = e.target.value;
                        setSelectedUpdateCategory(categoryId);
                      }}
                      fullWidth // Make it stretch the full dialog width
                      size="small"
                    >
                      {snippetCategories.map((cat: any) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.category_name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  <DialogTitle>Edit Snippet</DialogTitle>

                  <DialogContent>
                    <TextField
                      margin="dense"
                      label="Name"
                      name="name"
                      value={selectedSnippet.name}
                      onChange={handleInputChange}
                      fullWidth
                    />
                    <TextField
                      margin="dense"
                      label="Snippet"
                      name="snippet"
                      value={selectedSnippet.snippet}
                      onChange={handleInputChange}
                      fullWidth
                      multiline
                      rows={4}
                    />
                  </DialogContent>

                  <DialogActions>
                    <Button
                      style={{
                        backgroundColor: 'rgb(169, 167, 167)',
                        borderColor: 'rgb(169, 167, 167)',
                        color: '#fff',
                      }}
                      onClick={handleModalClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      style={{
                        backgroundColor: 'rgb(13, 161, 199)',
                        borderColor: 'rgb(13, 161, 199)',
                        color: '#fff',
                      }}
                      onClick={handleSave}
                    >
                      Save
                    </Button>
                  </DialogActions>
                </Dialog>
              </DialogContent>
            </Dialog>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default SnippetList;
