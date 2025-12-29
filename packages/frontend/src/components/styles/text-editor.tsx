// @ts-nocheck - Legacy file, react-quill not actively used
import React, { useEffect, useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Modal, Input, List, Form, Button } from 'antd';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';
import type { InputRef } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

interface Option {
  tag: string;
  field: string;
}

interface Snippet {
  name: string;
  snippet: string;
}
interface SnippetCategory {
  id: any;
  category_name: any;
}
interface ReactQuillEditorProps {
  editorData?: (content: string) => void;
  editorContent: any;
  value?: any; // optional and possibly redundant here
  name?: string;
  style?: React.CSSProperties;
}

const TextEditor: React.FC<ReactQuillEditorProps> = ({
  editorData,
  editorContent,
  style,
}) => {
  const [editorValue, setEditorValue] = useState(editorContent || '');
  const [isOptionModalVisible, setIsOptionModalVisible] = useState(false);
  const [isSnippetModalVisible, setIsSnippetModalVisible] = useState(false);
  const [isSnippetDataModalVisible, setIsSnippetDataModalVisible] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);
  const [filteredSnippetData, setFilteredSnippetData] = useState<Snippet[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [snippetName, setSnippetName] = useState('');
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [snippetData, setSnippetData] = useState<Snippet[]>([]);
  const [options, setMergeFieldData] = useState<Option[]>([]);
  const [searchParams] = useSearchParams();
  const approachId = searchParams.get('id');
  const [snippetCheck, setSnippetCheck] = useState('');

  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [snippetCategories, setSnippetCategories] = useState<SnippetCategory[]>(
    []
  );
  const [selectedAddCategory, setSelectedAddCategory] = useState<any | null>(
    null
  );
  const [hasCategoryChanged, setHasCategoryChanged] = useState(false);

  const [selectNewCategory, setSelectedNewCategory] = useState<any | null>(
    null
  );
  const searchInputRef = useRef<InputRef>(null);
  const snippetSearchRef = useRef<InputRef>(null);

  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  // Add error states
  const [errors, setErrors] = useState({
    category: '',
    snippetName: '',
    snippet: '',
    newCategory: ''
  });

  const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, '');

  const handleEditorChange = (content: string) => {
    setEditorValue(content);
    setSelectedText(stripHtml(content));
    if (typeof editorData === 'function') {
      editorData(content);
    }
  };

  const handleAddCategory = async () => {
    // Clear previous errors
    setErrors(prev => ({ ...prev, newCategory: '' }));
    
    if (newCategory === '') {
      setErrors(prev => ({ ...prev, newCategory: 'Please fill the snippet category' }));
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
        setErrors(prev => ({ ...prev, newCategory: errorMessage }));
        console.error('Error saving category:', error);
      }
    }
  };

  const fetchSnippets = async () => {
    try {
      const response = await axios.get('template/snippet-list');
      if (response.data?.data?.data) {
        setSnippetData(response.data.data.data);
      }
    } catch (error) {
      console.error('Error fetching snippet data:', error);
    }
  };

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
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchSnippetsCategory();
  }, []);

  useEffect(() => {
    const fetchMergeFields = async () => {
      try {
        const response = await axios.get(
          'template/merge-fields-list?appraisal_id'
        );
        if (response.data?.data?.data) {
          setMergeFieldData(response.data.data.data);
        }
      } catch (error) {
        console.error('Error fetching merge fields:', error);
      }
    };
    fetchMergeFields();
  }, []);

  const showOptionModal = () => {
    setSearchTerm('');
    setFilteredOptions(options);
    setFilteredSnippetData(filteredSnippetData);
    setFocusedIndex(-1);
    setIsOptionModalVisible(true);

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100); // slight delay ensures modal is rendered
  };
  const handleCombinedKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    let activeList: any[] = [];
    let closeModal: () => void = () => { };
    let onSelect: (item: any) => void = () => { };

    if (isOptionModalVisible) {
      activeList = filteredOptions;
      closeModal = () => setIsOptionModalVisible(false);
      onSelect = handleOptionClick;
    } else if (isSnippetDataModalVisible) {
      activeList = filteredSnippetData;
      closeModal = () => setIsSnippetDataModalVisible(false);
      onSelect = handleSnippetDataClick;
    }

    if (!activeList.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < activeList.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : activeList.length - 1));
    } else if (e.key === 'Enter' && focusedIndex !== -1) {
      e.preventDefault();
      const selectedItem = activeList[focusedIndex];
      onSelect(selectedItem);
      closeModal();
    }
  };

  useEffect(() => {
    if (!isOptionModalVisible && !isSnippetDataModalVisible) {
      setFocusedIndex(-1);
    }
  }, [isOptionModalVisible, isSnippetDataModalVisible]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setFilteredOptions(
      options.filter((option) => option.field.toLowerCase().includes(value))
    );
    setFilteredSnippetData(
      snippetData.filter((s) => s.name.toLowerCase().includes(value))
    );
    setFocusedIndex(-1);
  };

  const handleOptionClick = async (option: Option) => {
    const quill = quillRef.current?.getEditor();
    const range = quill?.getSelection(true);
    const placeholder = `{{${option.tag}}}`;
    const currentPath = window.location.pathname;
    // const isOverview = currentPath.includes('/overview') && !currentPath.includes('/evaluation-overview');
    const isEvaluationOverview = currentPath.includes('/evaluation-overview');
    const isResidentialOverview = currentPath.includes('/residential-overview');

    const endpoint = isEvaluationOverview ?
      'evaluations/merge-field-data' : isResidentialOverview ? 'res-evaluations/merge-field-data'
        : 'template/merge-field-data';

    const payload = isEvaluationOverview || isResidentialOverview
      ? { evaluation_id: approachId, merge_fields: option.tag }
      : { appraisal_id: approachId, merge_fields: option.tag };


    try {
      const response = await axios.post(endpoint, payload);

      const fetchedValue = response.data?.data?.data;
      const valueToInsert = fetchedValue
        ? fetchedValue
          .replace(/<p>|<\/p>/g, '')
          .replace(/\n/g, '')
          .trim()
        : placeholder;

      if (range && quill) {
        quill.insertText(range.index, valueToInsert);
      }

      if (typeof editorData === 'function') {
        const currentText = quill?.getText() ?? '';
        editorData(currentText);
      }
    } catch (error) {
      console.error('Error fetching appraisal data:', error);

      // fallback insert if request fails
      if (range && quill) {
        quill.insertText(range.index, placeholder);
      }
    } finally {
      setIsOptionModalVisible(false);
    }
  };

  // const cleanSnippet = snippet.snippet.replace(/[\r\n]+/g, '');

  const handleSnippetDataClick = (snippet: Snippet, closeModal = true) => {
    setSelectedCategory('');
    const quill = quillRef.current?.getEditor();
    const cleanSnippet = snippet.snippet
      .replace(/<p>|<\/p>/g, '')
      .replace(/\n/g, '')
      .trim();

    const range = quill?.getSelection(true);
    if (range) {
      quill.insertText(range.index, cleanSnippet); // true inline insert
    }

    if (closeModal) setIsSnippetDataModalVisible(false);
  };

  const showSnippetDataModal = () => {
    setSnippetCheck('');
    setSearchTerm('');
    // setFilteredSnippetData(snippetData);
    setFocusedIndex(-1);
    // setSelectedCategory(''); // 🔥 This clears the dropdown
    setIsSnippetDataModalVisible(true);

    setTimeout(() => {
      snippetSearchRef.current?.focus();
    }, 100);
  };
  const closeSaveSnippetModal = () => {
    setIsSnippetModalVisible(false);
    setSnippetName('');
    // Clear errors when closing modal
    setErrors({
      category: '',
      snippetName: '',
      snippet: '',
      newCategory: ''
    });
  };
  const showSnippetModal = () => {
    setSelectedNewCategory('');
    setSelectedAddCategory('');

    const selection = window.getSelection()?.toString().trim();

    if (selection) {
      setSelectedText(selection);
      setSelectedCategory('');
      setIsSnippetModalVisible(true);
      // Clear errors when opening modal
      setErrors({
        category: '',
        snippetName: '',
        snippet: '',
        newCategory: ''
      });
    } else {
      toast.warning('Please select some text to create a snippet.');
    }
  };

  const handleSnippetModalSave = async () => {
    // Clear previous errors
    setErrors({
      category: '',
      snippetName: '',
      snippet: '',
      newCategory: ''
    });

    let hasErrors = false;

    if (!selectedCategory && !selectedAddCategory && !newCategory) {
      setErrors(prev => ({ ...prev, category: 'Snippet Category is required' }));
      hasErrors = true;
    }
    
    if (snippetName.trim() === '') {
      setErrors(prev => ({ ...prev, snippetName: 'Snippet name is required' }));
      hasErrors = true;
    }

    if (selectedText.trim() === '') {
      setErrors(prev => ({ ...prev, snippet: 'Snippet is required' }));
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    const newSnippet = {
      name: snippetName,
      snippet: selectedText,
      snippets_category_id: hasCategoryChanged
        ? selectedAddCategory
        : selectedCategory,
    };
    try {
      await axios.post('template/save-snippet', newSnippet);
      toast.success('Snippet saved successfully');
      fetchSnippets();
      setSnippets([...snippets, newSnippet]);
      fetchSnippetsCategory();
      setSnippetName('');
      setSelectedText('');
      setIsSnippetModalVisible(false);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.data?.message ||
        'Something went wrong while saving the category';
      toast.error(errorMessage);
      console.error('Error saving category:', error);
    }
  };
  // const closeSnippetModal = () => {
  //   setSelectedCategory('');
  //   setIsSnippetDataModalVisible(false);
  // };
  useEffect(() => {
    setEditorValue(editorContent || '');
  }, [editorContent]);
  // const handleCategoryChange = (event: SelectChangeEvent) => {
  //   setSelectedNewCategory(Number(event.target.value));
  // };
  const quillRef = useRef<any>(null);
  const closeAddNewCategory = () => {
    setNewCategory('');
    setIsCategoryModalVisible(false);
    // Clear new category error
    setErrors(prev => ({ ...prev, newCategory: '' }));
  };
  const closeSnippetDataModal = () => {
    setIsSnippetDataModalVisible(false);
    setSelectedCategory('');
    setFilteredSnippetData([]); // <-- clear the snippet list
  };
  return (
    <>
      <div style={{ marginBottom: '10px' }}>
        <Button onClick={showOptionModal}>Merge Field</Button>
        <Button onClick={showSnippetDataModal} style={{ marginLeft: 10 }}>
          Snippet Data
        </Button>
        <Button onClick={showSnippetModal} style={{ marginLeft: 10 }}>
          Save Snippet
        </Button>
      </div>

      <ReactQuill
        ref={quillRef}
        value={editorValue}
        onChange={handleEditorChange}
        modules={{
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ font: [] }, { size: [] }],
            [{ align: [] }],
            [{ list: 'ordered' }, { list: 'bullet' }],
          ],
        }}
        formats={[
          'bold',
          'italic',
          'underline',
          'strike',
          'font',
          'size',
          'align',
          'list',
          'bullet',
          'link',
          'image',
          // 'indent',
        ]}
        style={{ height: '300px', width: '100%', ...style }}
      />
      <Modal
        title="Select an Option"
        open={isOptionModalVisible}
        onCancel={() => setIsOptionModalVisible(false)}
        footer={null}
      >
        <Input
          ref={searchInputRef}
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          onKeyDown={handleCombinedKeyDown}
        />

        <List
          dataSource={filteredOptions}
          renderItem={(item, index) => (
            <List.Item
              ref={
                index === focusedIndex
                  ? (el) => el?.scrollIntoView({ block: 'nearest' })
                  : null
              }
              onClick={() => handleOptionClick(item)}
              style={{
                cursor: 'pointer',
                backgroundColor:
                  index === focusedIndex ? '#e6f7ff' : 'transparent',
              }}
            >
              {item.field}
            </List.Item>
          )}
          style={{ maxHeight: '300px', overflowY: 'auto' }}
        />
      </Modal>

      <Modal
        title="Add 
         Category"
        open={isCategoryModalVisible}
        onOk={handleAddCategory}
        // onCancel={() => setIsCategoryModalVisible(false)}
        okText="Save"
        cancelText="Close"
      >
        <Form layout="vertical">
          <Form.Item 
            label={
              <span>
                Save snippet category <span style={{ color: '#d32f2f' }}>*</span>
              </span>
            }
            validateStatus={errors.newCategory ? 'error' : ''}
            help={errors.newCategory}
            style={{ marginBottom: 16 }}
          >
            <Input
              value={newCategory}
              onChange={(e) => {
                setNewCategory(e.target.value);
                // Clear error when user types
                if (errors.newCategory) {
                  setErrors(prev => ({ ...prev, newCategory: '' }));
                }
              }}
              placeholder="Enter category name"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Snippet Data"
        open={isSnippetDataModalVisible}
        onCancel={closeSnippetDataModal}
        // onCancel={() => setIsSnippetDataModalVisible(false)}
        footer={null}
      >
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel id="snippet-category-label">Select Category</InputLabel>
          <Select
            labelId="snippet-category-label"
            value={snippetCheck || ''}
            label="Select Category"
            onChange={async (event) => {
              const categoryId = event.target.value;
              console.log('Selected Category ID:', categoryId);
              setSnippetCheck(categoryId);

              try {
                const response = await axios.get(
                  `template/snippet-category/${categoryId}`
                );
                console.log('API Response:', response?.data);

                const snippets = response?.data?.data?.data?.snippets || [];
                console.log('Extracted Snippets:', snippets);

                setFilteredSnippetData(snippets);
              } catch (error) {
                console.error('Error fetching snippets by category:', error);
              }
            }}
          >
            {snippetCategories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.category_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <List
          dataSource={filteredSnippetData}
          renderItem={(item, index) => (
            <List.Item
              ref={
                index === focusedIndex
                  ? (el) => el?.scrollIntoView({ block: 'nearest' })
                  : null
              }
              onClick={() => handleSnippetDataClick(item)}
              style={{
                cursor: 'pointer',
                backgroundColor:
                  index === focusedIndex ? '#e6f7ff' : 'transparent',
              }}
            >
              {item.name}
            </List.Item>
          )}
          style={{ maxHeight: '300px', overflowY: 'auto' }}
        />
      </Modal>

      <Modal
        title="Save Snippet"
        open={isSnippetModalVisible}
        onOk={handleSnippetModalSave}
        onCancel={closeSaveSnippetModal}
        okButtonProps={{
          style: {
            backgroundColor: 'rgb(13, 161, 199)',
            borderColor: 'rgb(13, 161, 199)',
            color: '#fff',
          },
        }}
        cancelButtonProps={{
          style: {
            backgroundColor: 'rgb(169, 167, 167)',
            borderColor: 'rgb(169, 167, 167)',
            color: '#fff',
          },
        }}
      >
        <Form layout="vertical">
          <Form.Item 
            label={
              <span>
                Snippet Category <span style={{ color: '#d32f2f' }}>*</span>
              </span>
            }
            validateStatus={errors.category ? 'error' : ''}
            help={errors.category}
            style={{ marginBottom: 16 }}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              <FormControl fullWidth size="small">
                <Select
                  labelId="snippet-category-label"
                  value={
                    hasCategoryChanged
                      ? selectedAddCategory
                      : selectNewCategory || ''
                  }
                  onChange={(e) => {
                    setSelectedAddCategory(e.target.value);
                    setHasCategoryChanged(true);
                    // Clear category error when user selects
                    if (errors.category) {
                      setErrors(prev => ({ ...prev, category: '' }));
                    }
                  }}
                  label="Select Category"
                >
                  {snippetCategories.map((item) => (
                    <MenuItem key={item.category_name} value={item.id}>
                      {item.category_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <PlusOutlined
                style={{ fontSize: 20, cursor: 'pointer', marginTop: 6 }}
                onClick={() => setIsCategoryModalVisible(true)}
              />
            </div>
          </Form.Item>

          <Form.Item 
            label={
              <span>
                Save snippet as <span style={{ color: '#d32f2f' }}>*</span>
              </span>
            }
            validateStatus={errors.snippetName ? 'error' : ''}
            help={errors.snippetName}
            style={{ marginBottom: 16 }}
          >
            <Input
              value={snippetName}
              onChange={(e) => {
                setSnippetName(e.target.value);
                // Clear error when user types
                if (errors.snippetName) {
                  setErrors(prev => ({ ...prev, snippetName: '' }));
                }
              }}
            />
          </Form.Item>

          <Form.Item 
            label={
              <span>
                Snippet <span style={{ color: '#d32f2f' }}>*</span>
              </span>
            }
            validateStatus={errors.snippet ? 'error' : ''}
            help={errors.snippet}
            style={{ marginBottom: 16 }}
          >
            <Input.TextArea
              value={stripHtml(selectedText)}
              onChange={(e) => {
                setSelectedText(e.target.value);
                // Clear error when user types
                if (errors.snippet) {
                  setErrors(prev => ({ ...prev, snippet: '' }));
                }
              }}
              rows={4}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add Snippet Category"
        open={isCategoryModalVisible}
        onOk={handleAddCategory}
        onCancel={closeAddNewCategory}
        okText="Save"
        cancelText="Close"
        okButtonProps={{
          style: {
            backgroundColor: 'rgb(13, 161, 199)',
            borderColor: 'rgb(13, 161, 199)',
            color: '#fff',
          },
        }}
        cancelButtonProps={{
          style: {
            backgroundColor: 'rgb(169, 167, 167)',
            borderColor: 'rgb(169, 167, 167)',
            color: '#fff',
          },
        }}
      >
        <Form layout="vertical">
          <Form.Item 
            label={
              <span>
                Save snippet category <span style={{ color: '#d32f2f' }}>*</span>
              </span>
            }
            validateStatus={errors.newCategory ? 'error' : ''}
            help={errors.newCategory}
            style={{ marginBottom: 16 }}
          >
            <Input
              value={newCategory}
              onChange={(e) => {
                setNewCategory(e.target.value);
                // Clear error when user types
                if (errors.newCategory) {
                  setErrors(prev => ({ ...prev, newCategory: '' }));
                }
              }}
              placeholder="Enter category name"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TextEditor;
