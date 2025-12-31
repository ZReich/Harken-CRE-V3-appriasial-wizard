import CreateSubSection from './screen-moals/create-subsection';
import CompDeleteModal from '@/components/modal/Comp-delete-modal';
import ClearIcon from '@mui/icons-material/Clear';
import { Upload } from './upload-image';
import approch from '../../images/Approach.png';
import map from '../../images/Map.png';
import textBlock from '../../images/Text Block.png';
import subSection from '../../images/Text Block-1.png';
import axios from 'axios';
import { Icons } from '@/components/icons';
import {
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Typography,
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import TinyMceTextEditor from './editor';
import { ReportTitleEnum } from './Enums/report-template';
import FormLabel from '@mui/material/FormLabel';
import { TemplateContext } from './main-screen-template';
import SubSectionsItems from './section-sub-part';
import Tooltip from '@mui/material/Tooltip';
import DeleteConfirmationSectionItems from '@/components/delete-confirmation-section-items';
import { toast } from 'react-toastify';
import CompDeleteModalCross from '@/components/modal/comp-cross-Modal';
import CompDeleteModalCrossEditor from '@/components/modal/comp-cross-editor-modal';
import CommonButton from '@/components/elements/button/Button';
import group3 from '../../images/Group3.png';
import CompDeleteModalCrossImage from '@/components/modal/comp-cross-Image-delete';
import FakeTable from './fakeTable';
import FakeGoogleMapLocation from './fakeMap';
import PhotoImageTemplate from './photo-image-template';

const Section = ({
  parentIndex,
  index,
  template_id,
  section_id,
  item,
  sectionIdParams,
  secTitle,
  editsubSection,
  editSection,
  setEditorEvent,
  editorEvent,
  setShowTextBox,
  showTextBox,
  setStImg,
  setImageModal,
  imageModal,
}: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const { templateData, setTemplateData } = useContext<any>(TemplateContext);
  const [selectedApproach, setSelectedApproach] = useState('');
  const [selectedMap, setSelectedMap] = useState('');
  const [isModalOpenApproch, setIsModalOpenApproch] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteItemData, setDeleteItemData] = useState({
    parentIndex: null,
    index: null,
    id: null,
  });

  const [editItemData, setEditItemData] = useState<any>(null);
  const [addItemInfo, setAddItemInfo] = useState<any>(null);

  useEffect(() => {
    const savedApproach =
      templateData.sections[parentIndex].items[index].content;

    if (item.type === 'approach' && savedApproach) {
      setSelectedApproach(savedApproach);
    } else {
      setSelectedApproach('');
    }
  }, [templateData, parentIndex, index, item.type]);
  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = event.target.value;
    setSelectedApproach(selectedValue);
    setTemplateData((old: any) => {
      const sections = [...old.sections];

      const updatedItem = {
        ...sections[parentIndex].items[index],
        content: selectedValue,
        type:
          selectedValue === 'income_comparison'
            ? 'income_comparison'
            : 'approach', // Update type if it's income_comparison
      };

      if (updatedItem?.subsections) {
        delete updatedItem?.subsections;
      }

      if (editItemData.isSubSectionItem) {
        if (editItemData.isEdit) {
          sections[parentIndex].items[index].subsections.items[
            editItemData.subItemIndex
          ] = updatedItem;
        } else {
          if (updatedItem?.subsections) {
            delete updatedItem.subsections;
          }

          sections[parentIndex].items[
            editItemData.itemIndex
          ].subsections.items.splice(
            addItemInfo?.subItemIndex + 1,
            0,
            updatedItem
          );
        }
      } else {
        if (editItemData.isEdit) {
          sections[parentIndex].items[index] = updatedItem;
        } else {
          if (addItemInfo.itemIndex > 0) {
            sections[parentIndex].items.splice(
              addItemInfo?.itemIndex + 1,
              0,
              updatedItem
            );
          } else {
            sections[parentIndex].items.push(updatedItem);
          }
        }
      }

      return { ...old, sections: [...sections] };
    });
    setEditItemData(null);
    setAddItemInfo(null);
  };

  useEffect(() => {
    const savedMap = templateData.sections[parentIndex].items[index].content;

    if (item.type === 'map' && savedMap) {
      setSelectedMap(savedMap);
    } else {
      setSelectedMap('');
    }
  }, [templateData, parentIndex, index, item.type]);

  const handleMapSelectionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedValue = event.target.value;
    setSelectedMap(selectedValue);
    setTemplateData((old: any) => {
      const sections = [...old.sections];

      const updatedItem = {
        ...sections[parentIndex].items[index],
        content: selectedValue,
        // id: selectedValue,
        type: 'map',
      };

      if (updatedItem?.subsections) {
        delete updatedItem?.subsections;
      }

      if (editItemData.isSubSectionItem) {
        if (editItemData.isEdit) {
          sections[parentIndex].items[index].subsections.items[
            editItemData.subItemIndex
          ] = updatedItem;
        } else {
          if (updatedItem?.subsections) {
            delete updatedItem.subsections;
          }

          sections[parentIndex].items[
            editItemData.itemIndex
          ].subsections.items.splice(
            addItemInfo?.subItemIndex + 1,
            0,
            updatedItem
          );
        }
      } else {
        if (editItemData.isEdit) {
          sections[parentIndex].items[index] = updatedItem;
        } else {
          if (addItemInfo.itemIndex > 0) {
            sections[parentIndex].items.splice(
              addItemInfo?.itemIndex + 1,
              0,
              updatedItem
            );
          } else {
            sections[parentIndex].items.push(updatedItem);
          }
        }
      }

      return { ...old, sections: [...sections] };
    });
    setEditItemData(null);
    setAddItemInfo(null);
  };

  const handleAddItem = (
    itemType: string,
    parentIndex: any,
    index: any,
    isSubSectionItem: any,
    subItemIndex: any
    // isEdit: any
  ) => {
    setShowOptions(false);
    if (itemType === 'approach') {
      setSelectedApproach('');
    }
    if (itemType === 'map') {
      setSelectedMap('');
    }
    if (itemType === 'subsection') {
      return setIsModalOpen(true);
    }

    if (isSubSectionItem) {
      setEditItemData({
        type: itemType,
        sectionIndex: parentIndex,
        itemIndex: index,
        isEdit: false,
        isSubSectionItem: true,
        subItemIndex,
      });
    } else {
      setEditItemData({
        type: itemType,
        sectionIndex: parentIndex,
        itemIndex: index,
        isEdit: false,
      });
    }

    if (itemType === 'photo_pages') {
      setTemplateData((old: any) => {
        const sections = [...old.sections];

        const updatedItem = {
          ...sections[parentIndex].items[index],
          content: '',
          id: '',
          type: 'photo_pages',
        };

        if (addItemInfo.itemIndex > 0) {
          sections[parentIndex].items.splice(
            addItemInfo?.itemIndex + 1,
            0,
            updatedItem
          );
        } else {
          sections[parentIndex].items.push(updatedItem);
        }

        return { ...old, sections: [...sections] };
      });
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const getImageUrl = (event: any) => {
    setImageModal(event);
  };

  const deleteSecItem = async (id: any) => {
    try {
      const response = await axios.delete(
        `/template/delete-section-item/${id}`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting section item:', error);
      throw error;
    }
  };

  const deleteFn = (parentIndex: any, index: any, id: any) => {
    setTemplateData((old: any) => {
      const updatedData = {
        ...old,
        sections: old.sections.map((section: any, sectionIndex: number) => {
          if (sectionIndex === parentIndex) {
            if (section.items.length === 1) {
              section.items[0] = { type: null };
              return { ...section, items: [...section.items] };
            }
            return {
              ...section,
              items: section.items.filter((_: any, i: any) => i !== index),
            };
          }
          return section;
        }),
      };

      if (id != undefined) {
        setTimeout(() => {
          deleteSecItem(id)
            .then((response) => {
              toast.success(response?.data?.message);
            })
            .catch((error) => {
              console.error('Error deleting the item:', error);
            });
        }, 500);
      }

      return { ...updatedData, sections: [...updatedData.sections] };
    });
  };

  const openDeleteModalHandler = (parentIndex: any, index: any, id: any) => {
    setDeleteItemData({ parentIndex, index, id });
    setOpenDeleteModal(true);
  };

  const editorData = (event: any) => {
    setEditorEvent(event);
  };

  const deleSubSection = async (parentIndex: number, itemIndex: number) => {
    setIsModalOpenApproch(false);
    setTemplateData((old: any) => {
      const updatedSections = [...old.sections];
      const section = updatedSections[parentIndex];
      let removedSubId: number | null = null;

      if (
        section.items[itemIndex] &&
        section.items[itemIndex].type === 'subsection'
      ) {
        removedSubId = section.items[itemIndex].id;
        section.items.splice(itemIndex, 1);
      }

      if (removedSubId !== null) {
        setTimeout(async () => {
          try {
            await axios.delete(`/template/delete-section-item/${removedSubId}`);
            toast.success('Sub-section deleted successfully');
          } catch (error) {
            console.error(
              `Failed to delete subsection with ID ${removedSubId}`,
              error
            );
          }
        }, 0);
      }

      return { ...old, sections: updatedSections };
    });
  };

  const deleteSection = async (parentIndex: any) => {
    setIsModalOpenApproch(false);
    let idParam: any;

    setTemplateData((old: any) => {
      const sectionToRemove = old.sections[parentIndex];

      const updatedSections = old.sections.filter(
        (_: any, index: any) => index !== parentIndex
      );

      idParam = sectionToRemove.id;

      return { ...old, sections: updatedSections };
    });
    setTimeout(async () => {
      if (idParam) {
        try {
          await axios.delete(`template/delete-section/${idParam}`);
          toast.success('Section deleted successfully');
        } catch (error) {
          console.error('Error deleting section:', error);
        }
      } else {
        console.error('No section ID found to delete');
      }
    }, 100);
  };

  const editSections = (section_id: any) => {
    editSection(section_id);
  };

  const editsubSections = (event: any) => {
    editsubSection(event);
  };

  const openModal = () => {
    setIsModalOpenApproch(true);
  };

  const parentList = () => {
    setShowOptions(false);
  };
  const handleModalClosePopUp = () => {
    setEditItemData(null);
  };

  const back = async () => {
    setShowTextBox(true);

    setTemplateData((old: any) => {
      const sections = [...old.sections];

      const updatedItem = {
        ...sections[parentIndex].items[index],
        content: editorEvent,
        id: editorEvent,
        type: 'text_block',
      };

      if (updatedItem?.subsections) {
        delete updatedItem?.subsections;
      }

      if (editItemData.isSubSectionItem) {
        if (editItemData.isEdit) {
          sections[parentIndex].items[index].subsections.items[
            editItemData.subItemIndex
          ] = updatedItem;
        } else {
          if (updatedItem?.subsections) {
            delete updatedItem.subsections;
          }

          sections[parentIndex].items[
            editItemData.itemIndex
          ].subsections.items.push(updatedItem);
        }
      } else {
        if (editItemData.isEdit) {
          sections[parentIndex].items[index] = updatedItem;
        } else {
          if (addItemInfo.itemIndex > 0) {
            sections[parentIndex].items.splice(
              addItemInfo?.itemIndex + 1,
              0,
              updatedItem
            );
          } else {
            sections[parentIndex].items.push(updatedItem);
          }
        }
      }

      return { ...old, sections: [...sections] };
    });
    setEditItemData(null);
    setAddItemInfo(null);
  };

  const backImage = () => {
    setStImg(true);
    setTemplateData((old: any) => {
      const sections = [...old.sections];

      const updatedItem = {
        ...sections[parentIndex].items[index],
        content: imageModal,
        // id: imageModal,
        type: 'image',
      };

      if (updatedItem?.subsections) {
        delete updatedItem?.subsections;
      }
      if (editItemData.isSubSectionItem) {
        if (editItemData.isEdit) {
          sections[parentIndex].items[index].subsections.items[
            editItemData.subItemIndex
          ] = updatedItem;
        } else {
          if (updatedItem?.subsections) {
            delete updatedItem.subsections;
          }

          sections[parentIndex].items[
            editItemData.itemIndex
          ].subsections.items.push(updatedItem);
        }
      } else {
        if (editItemData.isEdit) {
          sections[parentIndex].items[index] = updatedItem;
        } else {
          if (addItemInfo.itemIndex > 0) {
            sections[parentIndex].items.splice(
              addItemInfo?.itemIndex + 1,
              0,
              updatedItem
            );
          } else {
            sections[parentIndex].items.push(updatedItem);
          }
        }
      }

      return { ...old, sections: [...sections] };
    });
    setEditItemData(null);
    setAddItemInfo(null);
  };

  const handleEditItem = (parentIndex: any, index: any) => {
    const item = templateData.sections[parentIndex].items[index];

    setEditItemData({
      ...item,
      sectionIndex: parentIndex,
      itemIndex: index,
      isEdit: true,
      isSubSectionItem: item.type === 'subsection',
    });
  };

  return (
    <>
      {editItemData?.type === 'approach' ||
      editItemData?.type === 'income_comparison' ? (
        <>
          <CompDeleteModalCross>
            <div className="cursor-pointer px-9 pb-1">
              <div className="bg-[#0da1c714] rounded-md text-gray-500 absolute right-[15px]">
                <ClearIcon
                  className="text-3xl text-[#0da1c7]"
                  onClick={handleModalClosePopUp}
                />
              </div>
            </div>
            <FormControl>
              <FormLabel
                id="approach-radio-buttons-label"
                className="pb-3 uppercase font-semibold text-base text-customBlue"
              >
                {ReportTitleEnum.APPROCH}
              </FormLabel>
              <RadioGroup
                aria-labelledby="approach-radio-buttons-label"
                name="approach"
                className="flex flex-row gap-4 w-full"
                onChange={handleRadioChange}
              >
                {/* Income Comparison */}
                <FormControlLabel
                  value="income_comparison"
                  control={<Radio />}
                  label="Income Comparison Component"
                  className="template-labels ps-1 pr-3 py-1 rounded-full border border-black bg-[#A0A0A01A] gap-2 text-base"
                  checked={
                    editItemData.isEdit
                      ? item?.content === 'income_comparison'
                      : false
                  }
                />

                {/* Income */}
                <FormControlLabel
                  value="income"
                  control={<Radio />}
                  label="Income"
                  className="template-labels ps-1 pr-3 py-1 rounded-full border border-black bg-[#A0A0A01A] text-base gap-2"
                  checked={
                    editItemData.isEdit ? item?.content === 'income' : false
                  }
                />

                <FormControlLabel
                  value="rent_roll"
                  control={<Radio />}
                  label="Rent Roll"
                  className="template-labels ps-1 pr-3 py-1 rounded-full border border-black bg-[#A0A0A01A] text-base gap-2"
                  checked={
                    editItemData.isEdit ? item?.content === 'rent_roll' : false
                  }
                />

                {/* Sale */}
                <FormControlLabel
                  value="sale"
                  control={<Radio />}
                  label="Sale"
                  className="template-labels ps-1 pr-3 py-1 rounded-full border border-black bg-[#A0A0A01A] text-base gap-2"
                  checked={
                    editItemData.isEdit ? item?.content === 'sale' : false
                  }
                />

                {/* Cost */}
                <FormControlLabel
                  value="cost"
                  control={<Radio />}
                  label="Cost"
                  className="template-labels ps-1 pr-3 py-1 rounded-full border border-black bg-[#A0A0A01A] text-base gap-2"
                  checked={
                    editItemData.isEdit ? item?.content === 'cost' : false
                  }
                />

                {/* Lease */}
                <FormControlLabel
                  value="lease"
                  control={<Radio />}
                  label="Lease"
                  className="template-labels ps-1 pr-3 py-1 rounded-full border border-black bg-[#A0A0A01A] text-base gap-2"
                  checked={
                    editItemData.isEdit ? item?.content === 'lease' : false
                  }
                />
              </RadioGroup>
            </FormControl>
          </CompDeleteModalCross>
        </>
      ) : null}

      {editItemData?.type === `text_block` ? (
        <CompDeleteModalCrossEditor>
          <div className="bg-[#0da1c714] rounded-md text-gray-500  absolute right-[15px] top-[10px] z-50">
            <ClearIcon
              className="text-3xl text-[#0da1c7] cursor-pointer p-2 w-[40px] h-[40px]"
              onClick={handleModalClosePopUp}
            />
          </div>

          <div className="w-full">
            <Grid item xs={12}>
              {(() => {
                const sections = templateData?.sections || [];
                const editorItem =
                  sections[parentIndex]?.items[editItemData?.itemIndex]
                    ?.subsections?.items[editItemData.subItemIndex]?.content;
                return (
                  <TinyMceTextEditor
                    editorData={editorData}
                    editorContent={
                      editItemData?.type === `text_block` &&
                      item?.type === `text_block`
                        ? item?.content
                        : editorItem
                    }
                  />
                );
              })()}
            </Grid>
            <div>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <div className="flex justify-end mt-4">
                    <CommonButton
                      variant="contained"
                      color="primary"
                      className="bg-customBlue"
                      style={{
                        width: '200px',
                        height: '40px',
                        borderRadius: '5px',
                      }}
                      onClick={() => back()}
                    >
                      SAVE
                    </CommonButton>
                  </div>
                </Grid>
              </Grid>
            </div>
          </div>
        </CompDeleteModalCrossEditor>
      ) : null}

      {editItemData?.type === 'map' ? (
        <>
          <CompDeleteModalCross>
            <div className="cursor-pointer px-9 pb-1">
              <div className="bg-[#0da1c714] rounded-md text-gray-500 absolute right-[15px]">
                <ClearIcon
                  className="text-3xl text-[#0da1c7]"
                  onClick={handleModalClosePopUp}
                />
              </div>
            </div>
            <FormControl>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                name="map-radio-buttons-group"
                value={selectedMap}
                onChange={handleMapSelectionChange}
                className="flex flex-row ps-2 gap-5"
              >
                <FormControlLabel
                  value="aerial_map"
                  control={<Radio />}
                  label="Aerial map"
                  className="template-labels ps-1 pr-3 py-1 rounded-full border border-black bg-[#A0A0A01A] gap-2 text-base"
                  checked={
                    editItemData.isEdit ? item?.content === `aerial_map` : false
                  }
                />
                <FormControlLabel
                  value="map_boundary"
                  control={<Radio />}
                  label="Map Boundary"
                  className="template-labels ps-1 pr-3 py-1 rounded-full border border-black bg-[#A0A0A01A] gap-2 text-base"
                  checked={
                    editItemData.isEdit
                      ? item?.content === `map_boundary`
                      : false
                  }
                />
                <FormControlLabel
                  value="sale"
                  control={<Radio />}
                  label="Sales Approach Map"
                  className="template-labels ps-1 pr-3 py-1 rounded-full border border-black bg-[#A0A0A01A] gap-2 text-base"
                  checked={
                    editItemData.isEdit ? item?.content === `sale` : false
                  }
                />
                <FormControlLabel
                  value="cost"
                  control={<Radio />}
                  label="Cost Approach Map"
                  className="template-labels ps-1 pr-3 py-1 rounded-full border border-black bg-[#A0A0A01A] gap-2 text-base"
                  checked={
                    editItemData.isEdit ? item?.content === `cost` : false
                  }
                />
                <FormControlLabel
                  value="lease"
                  control={<Radio />}
                  label="Lease Approach Map"
                  className="template-labels ps-1 pr-3 py-1 rounded-full border border-black bg-[#A0A0A01A] gap-2 text-base"
                  checked={
                    editItemData.isEdit ? item?.content === `lease` : false
                  }
                />
              </RadioGroup>
            </FormControl>
          </CompDeleteModalCross>
        </>
      ) : null}

      {editItemData?.type === 'image' ? (
        <>
          <CompDeleteModalCrossImage>
            <div className="bg-[#0da1c714] rounded-md text-gray-500  absolute right-[15px] top-[10px] z-50">
              <ClearIcon
                className="text-3xl text-[#0da1c7] cursor-pointer"
                onClick={handleModalClosePopUp}
              />
            </div>
            <React.Fragment key={item?.id}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Upload getImageUrl={getImageUrl} paths={item?.content} />
                </Grid>
              </Grid>
            </React.Fragment>
            <br />
            <div>
              <Grid container spacing={3}>
                <Grid item xs={12} className="p-0 mt-2">
                  <div className="">
                    <CommonButton
                      variant="contained"
                      color="primary"
                      className="bg-customBlue"
                      style={{
                        width: '200px',
                        marginTop: '15px',
                        height: '40px',
                        borderRadius: '5px',
                      }}
                      onClick={() => backImage()}
                    >
                      SAVE
                    </CommonButton>
                  </div>
                </Grid>
              </Grid>
            </div>
          </CompDeleteModalCrossImage>
        </>
      ) : null}

      <div className="w-full">
        <div
          className={`flex items-center relative imageGallerControlWrapper group ${item?.type && item?.type !== 'subsection' && 'w-full'}`}
        >
          {item?.type === 'approach' ||
          item?.content === 'income_comparison' ? (
            <div className="template-wrapper active-appraisal mr-3">
              <Grid item xs={12}>
                {selectedApproach === 'income' && (
                  <>
                    <p className="pb-2 font-bold text-lg">Income</p>
                    <FakeTable />
                  </>
                )}
                {selectedApproach === 'sale' && (
                  <>
                    <p className="pb-2 font-bold text-lg">Sale</p>
                    <FakeTable />
                  </>
                )}
                {selectedApproach === 'rent_roll' && (
                  <>
                    <p className="pb-2 font-bold text-lg">Rent Roll</p>
                    <FakeTable />
                  </>
                )}
                {selectedApproach === 'cost' && (
                  <>
                    <p className="pb-2 font-bold text-lg">Cost</p>
                    <FakeTable />
                  </>
                )}
                {selectedApproach === 'lease' && (
                  <>
                    <p className="pb-2 font-bold text-lg">Lease</p>
                    <FakeTable />
                  </>
                )}
                {/* Additional check for income_comparison */}
                {item.type === 'income_comparison' && (
                  <>
                    <p className="pb-2 font-bold text-lg">Income Comparison</p>
                    <FakeTable />
                  </>
                )}
              </Grid>
            </div>
          ) : null}

          {item?.type === 'map' && (
            <div className="template-wrapper active-appraisal mr-3">
              <Grid item xs={12}>
                {selectedMap === 'aerial_map' && (
                  <>
                    <p className="pb-2 font-bold text-lg">Aerial map</p>
                    <FakeGoogleMapLocation />
                  </>
                )}
                {selectedMap === 'map_boundary' && (
                  <>
                    <p className="pb-2 font-bold text-lg">Map Boundary</p>
                    <FakeGoogleMapLocation />
                  </>
                )}
                {selectedMap === 'sale' && (
                  <>
                    <p className="pb-2 font-bold text-lg">Sales Approach Map</p>
                    <FakeGoogleMapLocation />
                  </>
                )}
                {selectedMap === 'cost' && (
                  <>
                    <p className="pb-2 font-bold text-lg">Cost Approach Map</p>
                    <FakeGoogleMapLocation />
                  </>
                )}
                {selectedMap === 'lease' && (
                  <>
                    <p className="pb-2 font-bold text-lg">Lease Approach Map</p>
                    <FakeGoogleMapLocation />
                  </>
                )}
              </Grid>
            </div>
          )}
          {item.type === 'text_block' && (
            <div className="template-wrapper active-appraisal max-w-[1138px] w-full">
              {showTextBox && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: item?.contents || item?.content,
                  }}
                />
              )}
            </div>
          )}
          {item.type === 'image' && (
            <React.Fragment>
              <div className="template-wrapper active-appraisal mr-3">
                {(function () {
                  return (
                    <>
                      {/* {stImg ? (
                      ) : null} */}
                      <div className="common-approach">
                        <img
                          src={item?.content}
                          alt="Content Image"
                          className="w-64 h-64 object-cover"
                        />
                      </div>
                    </>
                  );
                })()}
              </div>
            </React.Fragment>
          )}
          {item.type === 'photo_pages' && (
            <React.Fragment>
              <div className="template-wrapper active-appraisal">
                {(function () {
                  return (
                    <>
                      <div className="common-approach">
                        <Typography
                          variant="h4"
                          component="h4"
                          className="font-bold font-bold text-xl ml-[190px] mb-5"
                        >
                          Subject Property Photos
                        </Typography>
                        <div>
                          <PhotoImageTemplate />
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </React.Fragment>
          )}
          <div>
            <div className="text-nowrap font-bold text-2xl">
              {item.type === null ? `${secTitle}` : ``}
            </div>

            {item.type === 'subsection' ? (
              <div className="flex items-center">
                <span className="pr-1 font-bold capitalize">
                  {item.subsections?.title}
                </span>
              </div>
            ) : null}
          </div>
          <div
            className={`imageGallerControl group-hover:flex hidden rounded bg-white ${item?.type && item?.type !== 'subsection' ? '' : 'ml-[16px]'}  border border-solid border-[#e1e1e1] gap-2 p-2 h-[47px]`}
          >
            {item.type === null ? (
              <div className="flex items-center justify-between gap-2 cursor-pointer">
                <Tooltip title="Add Item">
                  <div
                    className="cursor-pointer rounded-full p-1 border border-solid shadow-md border-slate-300 w-[30px] h-[30px] imageGallerControl  flex item-center justify-center bg-white"
                    onClick={() => {
                      toggleOptions();
                      setAddItemInfo({
                        sectionIndex: parentIndex,
                        itemIndex: index,
                      });
                    }}
                  >
                    <img src={group3} alt="add" className="w-full" />
                  </div>
                </Tooltip>
                <Tooltip title="Edit Section">
                  <Icons.EditIcon
                    onClick={() => editSections(section_id)}
                    className="text-3xl bg-white text-blue-500 top-9 rounded-full p-1 border border-solid shadow-md border-slate-300 cursor-pointer"
                  />
                </Tooltip>
                <div className="flex items-center justify-between gap-2 cursor-pointer">
                  <Tooltip title="Delete Section">
                    <Icons.DeleteIcon
                      onClick={openModal}
                      className="text-3xl text-red-500 bg-white rounded-full p-1 border border-solid shadow-md border-slate-300 cursor-pointer"
                    />
                  </Tooltip>
                  {isModalOpenApproch && (
                    <DeleteConfirmationSectionItems
                      deleteComps={() => deleteSection(parentIndex)}
                      label="Delete"
                      close={() => setIsModalOpenApproch(false)}
                    />
                  )}
                </div>
              </div>
            ) : null}
            {item.type === 'subsection' ? (
              <div className="flex items-center gap-2">
                <Tooltip title="Add Item">
                  <div
                    className="cursor-pointer rounded-full p-1 border border-solid shadow-md border-slate-300 w-[30px] h-[30px] imageGallerControl  flex item-center justify-center bg-white"
                    onClick={() => {
                      toggleOptions();
                      setAddItemInfo({
                        sectionIndex: parentIndex,
                        itemIndex: index,
                      });
                    }}
                  >
                    <img src={group3} alt="add" className="w-full" />
                  </div>
                </Tooltip>
                <Tooltip title="Edit Section">
                  <Icons.EditIcon
                    onClick={() => editsubSections(item?.sub_section_id)}
                    className="text-3xl bg-white text-blue-500 top-9 rounded-full p-1 border border-solid shadow-md border-slate-300 cursor-pointer"
                  />
                </Tooltip>
                <div className="flex items-center justify-between gap-2 cursor-pointer">
                  <Tooltip title="Delete Sub-section">
                    <Icons.DeleteIcon
                      onClick={openModal}
                      className="text-3xl text-red-500 bg-white rounded-full p-1 border border-solid shadow-md border-slate-300 cursor-pointer"
                    />
                  </Tooltip>
                  {isModalOpenApproch && (
                    <DeleteConfirmationSectionItems
                      deleteComps={() => deleSubSection(parentIndex, index)}
                      label="Delete"
                      close={() => setIsModalOpenApproch(false)}
                    />
                  )}
                </div>
              </div>
            ) : null}
            {item?.type === 'approach' && (
              <React.Fragment>
                <div className="flex  items-center gap-2">
                  <Tooltip title="Add Item">
                    <div
                      className="cursor-pointer rounded-full p-1 border border-solid shadow-md border-slate-300 w-[30px] h-[30px] imageGallerControl flex item-center justify-center bg-white"
                      onClick={() => {
                        toggleOptions();
                        setAddItemInfo({
                          sectionIndex: parentIndex,
                          itemIndex: index,
                        });
                      }}
                    >
                      <img src={group3} alt="add" className="w-full" />
                    </div>
                  </Tooltip>
                  <Tooltip title="Edit Approch">
                    <Icons.EditIcon
                      className="text-3xl bg-white text-blue-500 top-9 rounded-full p-1 border border-solid shadow-md border-slate-300 cursor-pointer"
                      onClick={() => handleEditItem(parentIndex, index)}
                    />
                  </Tooltip>
                  <Tooltip title="Delete Approach">
                    <Icons.DeleteIcon
                      className="text-red-500 cursor-pointer text-2xl"
                      onClick={() =>
                        openDeleteModalHandler(parentIndex, index, item?.id)
                      }
                    />
                  </Tooltip>
                  {openDeleteModal && (
                    <DeleteConfirmationSectionItems
                      close={() => setOpenDeleteModal(false)}
                      deleteComps={() => {
                        deleteFn(
                          deleteItemData.parentIndex,
                          deleteItemData.index,
                          deleteItemData.id
                        );
                        setOpenDeleteModal(false);
                      }}
                      label="Delete"
                    />
                  )}
                </div>
              </React.Fragment>
            )}
            {item?.type === 'income_comparison' && (
              <React.Fragment>
                <div className="flex  items-center gap-2">
                  <Tooltip title="Add Item">
                    <div
                      className="cursor-pointer rounded-full p-1 border border-solid shadow-md border-slate-300 w-[30px] h-[30px] imageGallerControl flex item-center justify-center bg-white"
                      onClick={() => {
                        toggleOptions();
                        setAddItemInfo({
                          sectionIndex: parentIndex,
                          itemIndex: index,
                        });
                      }}
                    >
                      <img src={group3} alt="add" className="w-full" />
                    </div>
                  </Tooltip>
                  <Tooltip title="Edit Approch">
                    <Icons.EditIcon
                      className="text-3xl bg-white text-blue-500 top-9 rounded-full p-1 border border-solid shadow-md border-slate-300 cursor-pointer"
                      onClick={() => handleEditItem(parentIndex, index)}
                    />
                  </Tooltip>
                  <Tooltip title="Delete Approach">
                    <Icons.DeleteIcon
                      className="text-red-500 cursor-pointer text-2xl"
                      onClick={() =>
                        openDeleteModalHandler(parentIndex, index, item?.id)
                      }
                    />
                  </Tooltip>
                  {openDeleteModal && (
                    <DeleteConfirmationSectionItems
                      close={() => setOpenDeleteModal(false)}
                      deleteComps={() => {
                        deleteFn(
                          deleteItemData.parentIndex,
                          deleteItemData.index,
                          deleteItemData.id
                        );
                        setOpenDeleteModal(false);
                      }}
                      label="Delete"
                    />
                  )}
                </div>
              </React.Fragment>
            )}
            {item?.type === 'map' && (
              <React.Fragment>
                <div className="flex items-center gap-2">
                  <Tooltip title="Add Item">
                    <div
                      className="cursor-pointer rounded-full p-1 border border-solid shadow-md border-slate-300 w-[30px] h-[30px] imageGallerControl  flex item-center justify-center bg-white"
                      onClick={() => {
                        toggleOptions();
                        setAddItemInfo({
                          sectionIndex: parentIndex,
                          itemIndex: index,
                        });
                      }}
                    >
                      <img src={group3} alt="add" className="w-full" />
                    </div>
                  </Tooltip>
                  <Tooltip title="Edit Map">
                    <Icons.EditIcon
                      className="text-3xl bg-white text-blue-500 top-9 rounded-full p-1 border border-solid shadow-md border-slate-300 cursor-pointer"
                      onClick={() => handleEditItem(parentIndex, index)}
                    />
                  </Tooltip>
                  <Tooltip title="Delete Map">
                    <Icons.DeleteIcon
                      className="text-red-500 cursor-pointer text-2xl"
                      onClick={() =>
                        openDeleteModalHandler(parentIndex, index, item?.id)
                      }
                    />
                  </Tooltip>
                  {openDeleteModal && (
                    <DeleteConfirmationSectionItems
                      close={() => setOpenDeleteModal(false)}
                      deleteComps={() => {
                        deleteFn(
                          deleteItemData.parentIndex,
                          deleteItemData.index,
                          deleteItemData.id
                        );
                        setOpenDeleteModal(false);
                      }}
                      label="Delete"
                    />
                  )}
                </div>
              </React.Fragment>
            )}

            {item?.type === 'text_block' && (
              <React.Fragment>
                <div className="flex gap-2">
                  <Tooltip title="Add Item">
                    <div
                      className="cursor-pointer rounded-full p-1 border border-solid shadow-md border-slate-300 w-[30px] h-[30px] imageGallerControl  flex item-center justify-center bg-white"
                      onClick={() => {
                        toggleOptions();
                        setAddItemInfo({
                          sectionIndex: parentIndex,
                          itemIndex: index,
                        });
                      }}
                    >
                      <img src={group3} alt="add" className="w-full" />
                    </div>
                  </Tooltip>
                  <Tooltip title="Edit Map">
                    <Icons.EditIcon
                      className="text-3xl bg-white text-blue-500 top-9 rounded-full p-1 border border-solid shadow-md border-slate-300 cursor-pointer"
                      onClick={() => handleEditItem(parentIndex, index)}
                    />
                  </Tooltip>
                  <Tooltip title="Delete Text Block">
                    <Icons.DeleteIcon
                      className="text-red-500 cursor-pointer text-2xl"
                      onClick={() =>
                        openDeleteModalHandler(parentIndex, index, item?.id)
                      }
                    />
                  </Tooltip>
                  {openDeleteModal && (
                    <DeleteConfirmationSectionItems
                      close={() => setOpenDeleteModal(false)}
                      deleteComps={() => {
                        deleteFn(
                          deleteItemData.parentIndex,
                          deleteItemData.index,
                          deleteItemData.id
                        );
                        setOpenDeleteModal(false);
                      }}
                      label="Delete"
                    />
                  )}
                </div>
              </React.Fragment>
            )}
            {item?.type === 'image' && (
              <React.Fragment>
                <div className="flex items-center gap-2">
                  <Tooltip title="Add Item">
                    <div
                      className="cursor-pointer rounded-full p-1 border border-solid shadow-md border-slate-300 w-[30px] h-[30px] imageGallerControl  flex item-center justify-center bg-white"
                      onClick={() => {
                        toggleOptions();
                        setAddItemInfo({
                          sectionIndex: parentIndex,
                          itemIndex: index,
                        });
                      }}
                    >
                      <img src={group3} alt="add" className="w-full" />
                    </div>
                  </Tooltip>
                  <Tooltip title="Edit Image">
                    <Icons.EditIcon
                      className="text-3xl bg-white text-blue-500 top-9 rounded-full p-1 border border-solid shadow-md border-slate-300 cursor-pointer"
                      onClick={() => handleEditItem(parentIndex, index)}
                    />
                  </Tooltip>
                  <Tooltip title="Delete Image">
                    <Icons.DeleteIcon
                      className="text-red-500 cursor-pointer text-2xl"
                      onClick={() =>
                        openDeleteModalHandler(parentIndex, index, item?.id)
                      }
                    />
                  </Tooltip>
                  {openDeleteModal && (
                    <DeleteConfirmationSectionItems
                      close={() => setOpenDeleteModal(false)}
                      deleteComps={() => {
                        deleteFn(
                          deleteItemData.parentIndex,
                          deleteItemData.index,
                          deleteItemData.id
                        );
                        setOpenDeleteModal(false);
                      }}
                      label="Delete"
                    />
                  )}
                </div>
              </React.Fragment>
            )}
            {item?.type === 'photo_pages' && (
              <React.Fragment>
                <div className="flex items-center gap-2">
                  <Tooltip title="Add Item">
                    <div
                      className="cursor-pointer rounded-full p-1 border border-solid shadow-md border-slate-300 w-[30px] h-[30px] imageGallerControl  flex item-center justify-center bg-white"
                      onClick={() => {
                        toggleOptions();
                        setAddItemInfo({
                          sectionIndex: parentIndex,
                          itemIndex: index,
                        });
                      }}
                    >
                      <img src={group3} alt="add" className="w-full" />
                    </div>
                  </Tooltip>
                  <Tooltip title="Delete Photo sheet">
                    <Icons.DeleteIcon
                      className="text-red-500 cursor-pointer text-2xl"
                      onClick={() =>
                        openDeleteModalHandler(parentIndex, index, item?.id)
                      }
                    />
                  </Tooltip>
                  {openDeleteModal && (
                    <DeleteConfirmationSectionItems
                      close={() => setOpenDeleteModal(false)}
                      deleteComps={() => {
                        deleteFn(
                          deleteItemData.parentIndex,
                          deleteItemData.index,
                          deleteItemData.id
                        );
                        setOpenDeleteModal(false);
                      }}
                      label="Delete"
                    />
                  )}
                </div>
              </React.Fragment>
            )}
          </div>
        </div>

        <section>
          <div className="relative">
            <div className="template-wrapper active-appraisal">
              <SubSectionsItems
                item={item}
                parentIndex={parentIndex}
                index={index}
                template_id={template_id}
                setEditItemData={setEditItemData}
                setAddItemInfo={setAddItemInfo}
                toggleOptions={toggleOptions}
                editItemData={editItemData}
                handleAddItem={handleAddItem}
                showTextBox={showTextBox}
              />
            </div>
          </div>
        </section>
      </div>

      {showOptions && (
        <>
          <CompDeleteModalCross>
            <div className="bg-[#0da1c714] rounded-md text-gray-500  absolute right-[15px] cursor-pointer">
              <ClearIcon
                className="text-3xl text-[#0da1c7]"
                onClick={parentList}
              />
            </div>
            <div className="flex flex-col items-center gap-1">
              <img
                src={approch}
                onClick={() =>
                  handleAddItem(
                    'approach',
                    parentIndex,
                    index,
                    item.type == 'subsection',
                    false
                  )
                }
                alt="approach"
                className="h-14 w-14 cursor-pointer"
              />
              <span className="text-[13px] text-nowrap">Approach</span>
            </div>
            <div className="flex flex-col items-center gap-1 ">
              <img
                src={map}
                alt="map"
                className="h-14 w-14 cursor-pointer"
                onClick={() =>
                  handleAddItem(
                    'map',
                    parentIndex,
                    index,
                    item.type == 'subsection',
                    false
                  )
                }
              />
              <span className="text-[13px] text-nowrap">Map</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <img
                onClick={() =>
                  handleAddItem(
                    'text_block',
                    parentIndex,
                    index,
                    item.type == 'subsection',
                    false
                  )
                }
                src={textBlock}
                alt="text_block"
                className="h-14 w-14 cursor-pointer"
              />
              <span className="text-[13px] text-nowrap">Text Block</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Icons.MonochromePhotosIcon
                className="h-14 w-14 cursor-pointer text-customBlue"
                onClick={() =>
                  handleAddItem(
                    'photo_pages',
                    parentIndex,
                    index,
                    item.type == 'subsection',
                    false
                  )
                }
              />
              <span className="text-[13px] text-nowrap">Photo Sheet</span>
            </div>
            {item.type !== 'subsection' ? (
              <div className="flex flex-col items-center gap-1">
                <img
                  src={subSection}
                  alt="subSection"
                  className="h-14 w-14 cursor-pointer"
                  onClick={() =>
                    handleAddItem(
                      'subsection',
                      parentIndex,
                      index,
                      item.type == 'subsection',
                      false
                    )
                  }
                />
                <span className="text-[13px] text-nowrap">Subsection</span>
              </div>
            ) : null}
          </CompDeleteModalCross>
        </>
      )}

      {isModalOpen ? (
        <CompDeleteModal>
          <div className="flex justify-between items-center bg-[#0da1c714] m-2 rounded-md text-gray-500 px-3 py-5">
            <Typography
              variant="h4"
              component="h4"
              className="text-xl text-[#0da1c7] font-bold template"
            >
              Add Sub-section
            </Typography>
            <ClearIcon
              className="text-3xl text-[#0da1c7] cursor-pointer"
              onClick={handleModalClose}
            />
          </div>
          <CreateSubSection
            section_id={section_id}
            handleModalClose={handleModalClose}
            parentIndex={parentIndex}
            template_id={template_id}
            sectionIdParams={sectionIdParams}
            addItemInfo={addItemInfo}
            setAddItemInfo={setAddItemInfo}
          />
        </CompDeleteModal>
      ) : null}
    </>
  );
};
export default Section;
