import React, { useEffect, useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { toast } from 'react-toastify';
import { Modal, Input, List, Button } from 'antd';
import axios from 'axios';
import { Editor as TinyMCEEditor } from 'tinymce';
import type { InputRef } from 'antd';

import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
// import { PlusOutlined } from '@ant-design/icons';
import SaveSnippetModal from '@/components/SaveSnippetModal';

interface Option {
  tag: string;
  field: string;
}

interface Snippet {
  name: string;
  snippet: string;
}

interface TinyMceTextEditorProps {
  editorData: (content: string) => void;
  editorContent: any;
}
interface SnippetCategory {
  id: any;
  category_name: any;
}
const TinyMceTextEditor: React.FC<TinyMceTextEditorProps> = ({
  editorData,
  editorContent,
}) => {
  const editorRef = useRef<TinyMCEEditor | null>(null);
  const inputRef = useRef<any>(null);
  const [isOptionModalVisible, setIsOptionModalVisible] = useState(false);
  const [isSnippetModalVisible, setIsSnippetModalVisible] = useState(false);
  const [isSnippetDataModalVisible, setIsSnippetDataModalVisible] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);
  const [filteredSnippetData, setFilteredSnippetData] = useState<Snippet[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [snippetName, setSnippetName] = useState('');
  // const [snippetCategory, setSnippetCategory] = useState('');

  const [newCategory, setNewCategory] = useState('');
  const [snippetData, setSnippetData] = useState<Snippet[]>([]);
  const [options, setMergeFieldData] = useState<Option[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);

  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);

  const [hasCategoryChanged, setHasCategoryChanged] = useState(false);
  const [selectedAddCategory, setSelectedAddCategory] = useState<any | null>(
    null
  );
  const [snippetCategories, setSnippetCategories] = useState<SnippetCategory[]>(
    []
  );
  const [snippetCheck, setSnippetCheck] = useState('');
  // console.log(selectNewCategory);
  // const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, '');

  // const [searchParams] = useSearchParams();
  // const approachId = searchParams.get('id');
  console.log(snippetData);
  const mergeFieldRefs = useRef<(HTMLDivElement | null)[]>([]);
  const snippetRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [activeList, setActiveList] = useState<
    'mergeFields' | 'snippets' | null
  >(null);

  // Add error states
  const [errors, setErrors] = useState({
    category: '',
    snippetName: '',
    snippet: '',
    newCategory: '',
  });

  const handleEditorChange = (content: string) => {
    editorData(content);
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

  useEffect(() => {
    fetchSnippets();
  }, []);

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
    const fetchMergeField = async () => {
      try {
        const response = await axios.get('template/merge-fields-list');
        if (response.data?.data?.data) {
          setMergeFieldData(response.data.data.data);
        }
      } catch (error) {
        console.error('Error fetching merge field data:', error);
      }
    };

    fetchMergeField();
  }, []);

  useEffect(() => {
    const listRefs =
      activeList === 'mergeFields'
        ? mergeFieldRefs.current
        : snippetRefs.current;
    const ref = listRefs[highlightIndex];
    if (ref) {
      ref.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [highlightIndex, activeList]);
  const snippetSearchRef = useRef<InputRef>(null);

  const showOptionModal = () => {
    setSearchTerm('');
    setFocusedIndex(-1);

    setFilteredOptions(options);
    setHighlightIndex(-1); // no item selected initially
    setActiveList('mergeFields');
    setIsOptionModalVisible(true);
    setTimeout(() => inputRef.current?.focus(), 100);
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

  const handleOptionClick = (option: Option) => {
    if (!editorRef.current) return;

    const placeholder = `{{${option.tag}}}`;
    editorRef.current.insertContent(placeholder);
    setIsOptionModalVisible(false);
  };

  const showSnippetModal = () => {
    setSelectedAddCategory('');
    setSelectedCategory('');
    // setSelectedNewCategory('');
    if (editorRef.current) {
      const selectedContent = editorRef.current.selection.getContent({
        format: 'text',
      });

      if (selectedContent) {
        setSelectedText(selectedContent);
        setSelectedCategory('');
        setIsSnippetModalVisible(true);
      } else {
        toast.warning('Please select some text to create a snippet.');
      }
    }
  };
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
        await axios.post('template/save-snippet-category', {
          category_name: newCategory,
        });

        setIsCategoryModalVisible(false);
        toast.success('Snippet Category saved successfully');
        fetchSnippetsCategory();

        fetchSnippetsCategory(newCategory); // <-- pass name to highlight
        setNewCategory('');
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.data?.message ||
          'Something went wrong while saving the category';
        setErrors((prev) => ({ ...prev, newCategory: errorMessage }));
        console.error('Error saving category:', error);
      }
    }
  };

  const handleSnippetModalSave = async () => {
    // Clear previous errors
    setErrors({
      category: '',
      snippetName: '',
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

    if (snippetName.trim() === '') {
      setErrors((prev) => ({
        ...prev,
        snippetName: 'Snippet name is required',
      }));
      hasErrors = true;
    }

    if (selectedText.trim() === '') {
      setErrors((prev) => ({ ...prev, snippet: 'Snippet is required' }));
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);

    const filtered = options.filter((item) =>
      item.field.toLowerCase().includes(searchValue.toLowerCase())
    );

    setFilteredOptions(filtered);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: 'option' | 'snippet'
  ) => {
    const list = type === 'option' ? filteredOptions : filteredSnippetData;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < list.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : list.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < list.length) {
        if (type === 'option') {
          handleOptionClick(filteredOptions[highlightIndex]);
        } else {
          handleSnippetDataClick(filteredSnippetData[highlightIndex]);
        }
      }
    }
  };
  const closeSnippetDataModal = () => {
    setIsSnippetDataModalVisible(false);
    setSelectedCategory('');
    setFilteredSnippetData([]); // <-- clear the snippet list
  };
  const handleSnippetDataClick = (snippet: Snippet) => {
    setFilteredSnippetData([]); // <-- clear the snippet list

    setSelectedCategory('');
    if (editorRef.current) {
      editorRef.current.insertContent(snippet.snippet);
    }
    setIsSnippetDataModalVisible(false);
  };

  const closeSnippetModal = () => {
    setIsSnippetModalVisible(false);
    setSnippetName('');
    // Clear errors when closing modal
    setErrors({
      category: '',
      snippetName: '',
      snippet: '',
      newCategory: '',
    });
  };
  // const handleCategoryChange = (event: SelectChangeEvent) => {
  //   setSelectedNewCategory(Number(event.target.value));
  // };
  const closeAddNewCategory = () => {
    setNewCategory('');
    setIsCategoryModalVisible(false);
    // Clear new category error
    setErrors((prev) => ({ ...prev, newCategory: '' }));
  };
  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <Button onClick={showOptionModal}>Merge Field</Button>
        <Button onClick={showSnippetDataModal} style={{ marginLeft: 10 }}>
          Snippet Data
        </Button>
        <Button onClick={showSnippetModal} style={{ marginLeft: 10 }}>
          Save Snippet
        </Button>
      </div>

      <Editor
        apiKey="5ssphb6eht1cskbpwen60xguoacsxcacdde1q98k6pdbjuks"
        onInit={(_evt, editor) => {
          editorRef.current = editor;
          setTimeout(() => {
            editor.setContent(editorContent);
          }, 100);
        }}
        init={{
          height: 700,
          menubar: false,
          plugins: ['image', 'table', 'autoresize'],
          toolbar:
            'bold italic underline strikethrough forecolor backcolor | fontfamily fontsize | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | image table',
        }}
        onEditorChange={handleEditorChange}
      />

      <Modal
        title="Select an Option"
        open={isOptionModalVisible}
        onCancel={() => setIsOptionModalVisible(false)}
        footer={null}
      >
        <Input
          ref={inputRef}
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          onKeyDown={(e) => handleKeyDown(e, 'option')}
        />
        <List
          dataSource={filteredOptions}
          renderItem={(item, index) => (
            <List.Item
              ref={(el) => (mergeFieldRefs.current[index] = el)}
              onClick={() => handleOptionClick(item)}
              style={{
                cursor: 'pointer',
                backgroundColor:
                  activeList === 'mergeFields' && index === highlightIndex
                    ? '#e6f7ff'
                    : undefined,
              }}
            >
              {item.field}
            </List.Item>
          )}
          style={{ maxHeight: '300px', overflowY: 'auto' }}
        />
      </Modal>
      {/* <Modal
        title="Add 
               Category"
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
      </Modal> */}
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

      {/* <Modal
        title="Save Snippet"
        open={isSnippetModalVisible}
        onOk={handleSnippetModalSave}
        // onCancel={() => setIsSnippetModalVisible(false)}
        onCancel={closeSnippetModal}
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
                      : selectedCategory || ''
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
      </Modal> */}
      {/* Save Snippet Modal */}
      <SaveSnippetModal
        open={isSnippetModalVisible}
        onClose={closeSnippetModal}
        onSave={handleSnippetModalSave}
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
        name={snippetName}
        setName={setSnippetName}
        snippet={selectedText}
        setSnippet={setSelectedText}
        errors={{
          category: errors.category,
          name: errors.snippetName,
          snippet: errors.snippet,
          newCategory: errors.newCategory,
        }}
      />
    </>
  );
};

export default TinyMceTextEditor;
