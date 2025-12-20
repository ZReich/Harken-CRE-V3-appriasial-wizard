import CreateSubSectionReport from './screen-moals/create-subsection';
import CompDeleteModal from '@/components/modal/Comp-delete-modal';
import ImageListModal from '@/components/modal/image-list-model';
import ClearIcon from '@mui/icons-material/Clear';
import approch from '../../../images/Approach.png';
import map from '../../../images/Map.png';
import textBlock from '../../../images/Text Block.png';
import subSection from '../../../images/Text Block-1.png';
import { Icons } from '@/components/icons';
import group3 from '../../../images/Group3.png';
import CommonButton from '@/components/elements/button/Button';
import {
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Typography,
} from '@mui/material';
import React, {
  useContext,
  useState,
  // InputHTMLAttributes,
  useEffect,
} from 'react';
import TinyMceTextEditor from '@/pages/Report/editor';
import { ReportTitleEnum } from '@/pages/Report/Enums/report-template';
import FormLabel from '@mui/material/FormLabel';
import { TemplateContext } from './main-screen';
import { toast } from 'react-toastify';
import SubSectionsItemsReport from './screen-moals/section-sub-part';
import { useGet } from '@/hook/useGet';
import ReportSectionMap from './map';
import ImageGallery from './image-part';
import IncomeApproachTable from './approch-data';
import axios from 'axios';
import SaleReportMap from './saleMapt';
import GoogleMapAreaInfoCost from './costMap';
import Tooltip from '@mui/material/Tooltip';
import SaleTable from './sale-data';
import CompDeleteModalCross from '@/components/modal/comp-cross-Modal';
import CostTable from './cost-data';
import ReportMapBoundary from './report-map-boundary';
import CompDeleteModalCrossEditor from '@/components/modal/comp-cross-editor-modal';
import DeleteConfirmationSectionItems from '@/components/delete-confirmation-section-items';
import { useMutate, RequestType } from '@/hook/useMutate';
import PhotoImageGallery from './photo-image-part';
import GoogleMapAreaInfoLease from './leaseMap';
import LeaseTable from './lease-data';
import IncomeComparisonTable from './income_comparison_data';
import RentRoleTable from './rent-roll-data';

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  'data-id'?: string;
  'data-appraisal-id'?: string;
  'data-type'?: string;
}

const AppraisalSection = ({
  parentIndex,
  index,
  template_id,
  section_id,
  item,
  id_am,
  secTitle,
  editSection,
  editsubSection,
  setShowTextBox,
  showTextBox,
  setStImg,
  stImg,
  setImageModal,
  imageModal,
  setEditorEvent,
  editorEvent,
}: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const { templateData, setTemplateData } = useContext<any>(TemplateContext);
  const [editItemData, setEditItemData] = useState<any>(null);
  const [addItemInfo, setAddItemInfo] = useState<any>(null);
  // const [approachId] = useState(null);
  const [openImage, setIsModalOpenImg] = useState(false);
  const [isModalOpenApproch, setIsModalOpenApproch] = useState(false);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteItemData, setDeleteItemData] = useState({
    parentIndex: null,
    index: null,
    id: null,
  });
  const { data } = useGet<any>({
    queryKey: `appraisals/get/${template_id}`,
    endPoint: `appraisals/get/${id_am}`,
    config: { refetchOnWindowFocus: false },
  });
  console.log('iteeemmm', item);
  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const deleteFn = (parentIndex: any, index: any, id: any) => {
    setTemplateData((old: any) => {
      const updatedData = {
        ...old,
        sections: old.sections.map((section: any, sectionIndex: number) => {
          if (sectionIndex === parentIndex) {
            if (section.items.length === 1) {
              section.items[0] = { type: null };

              return {
                ...section,
                items: [...section.items],
              };
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
        axios
          .delete(`template/delete-section-item/${id}`)
          .then((response) => {
            toast.success(response?.data?.message);
          })
          .catch((error) => {
            console.error('Error deleting item', error);
          });
      }

      return { ...updatedData, sections: [...updatedData.sections] };
    });
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
    if (itemType === 'image') {
      setIsModalOpenImg(true);
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
    // After updating state, call updateFn to save to backend
    // if (typeof (window as any).updateFn === 'function') {
    //   (window as any).updateFn();
    // }
  };

  const handleEditItem = (parentIndex: any, index: any) => {
    const item = templateData.sections[parentIndex]?.items[index];

    if (!item) {
      console.error('Item not found at', parentIndex, index);
      return;
    }

    setIsModalOpenImg(true);

    if (item) {
      setEditItemData({
        ...item,
        sectionIndex: parentIndex,
        itemIndex: index,
        isEdit: true,
        isSubSectionItem: item.type === 'subsection',
      });
    }
  };

  const handleModalCloseImage = () => {
    setIsModalOpenImg(false);
  };

  const getImageUrl = (event: any) => {
    setImageModal(event);
    // setIsModalOpenImg(false);
  };

  const deleSubSection = (parentIndex: number, itemIndex: number) => {
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
  const editorData = (event: any) => {
    setEditorEvent(event);
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { dataset, value } = event.target;
    const { id, type } = dataset;

    const vals = `${type}_${id}`;

    setTemplateData((old: any) => {
      const sections = [...old.sections];

      const updatedItem = {
        ...sections[parentIndex].items[index],
        content: vals,
        id: value,
        type: type === 'incomeComparison' ? 'income_comparison' : 'approach',
      };

      // Remove subsections if present
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
            (addItemInfo?.subItemIndex || -1) + 1, // Safely handle undefined `addItemInfo`
            0,
            updatedItem
          );
        }
      } else {
        if (editItemData.isEdit) {
          sections[parentIndex].items[index] = updatedItem;
        } else {
          // Ensure `addItemInfo` is safely handled
          if (
            addItemInfo?.itemIndex !== undefined &&
            addItemInfo.itemIndex > 0
          ) {
            sections[parentIndex].items.splice(
              addItemInfo.itemIndex + 1,
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
    // Call updateFn after a specific option is selected, but do not show toast
    if (typeof (window as any).updateFn === 'function') {
      (window as any).updateFn(false);
    }
    setEditItemData(null); // Trigger state update for `item`
    setAddItemInfo(null); // Reset `addItemInfo` to avoid conflicts
  };

  const handleRadioChangeMap = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, dataset } = event.target;
    const { id, type } = dataset;

    const handleUpdate = (content: string) => {
      setTemplateData((old: any) => {
        const sections = [...old.sections];

        const updatedItem = {
          ...sections[parentIndex].items[index],
          content,
          id: value,
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
      // Call updateFn after a specific map option is selected
      if (typeof (window as any).updateFn === 'function') {
        (window as any).updateFn(false);
      }
      setEditItemData(null);
      setAddItemInfo(null);
    };

    if (value === 'aerial_map' || value === 'map_boundary') {
      handleUpdate(value);
    } else {
      const vals = `${type}_${id}`;
      handleUpdate(vals);
    }
  };

  const data_get = data?.data?.data?.appraisal_approaches;

  const filteredApproaches =
    // data_get?.filter((approach: any) => approach.type !== 'income') || [];
    data_get?.filter(
      (approach: any) =>
        approach.type !== 'income' && approach.type !== 'rent_roll'
    ) || [];
  const defaultOption = { type: 'aerial_map', name: 'Aerial map' };
  const defaultOption_2 = { type: 'map_boundary', name: 'Map Boundary Map' };

  const deleteSection = async (parentIndex: any) => {
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

  const back = async () => {
    setShowTextBox(true);

    const data = {
      appraisal_id: Number(id_am),
      fieldContent: editorEvent,
    };
    let res: { data: { data: any } };
    try {
      res = await mutation.mutateAsync(data);
    } catch (error) {
      console.log(error);
    }

    setTemplateData((old: any) => {
      const sections = [...old.sections];

      const updatedItem = {
        ...sections[parentIndex].items[index],
        content: editorEvent,
        id: editorEvent,
        type: 'text_block',
        contents: res?.data?.data,
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

  const mutation = useMutate<any, any>({
    queryKey: 'appraisals/convert-editor-data/${id_am}',
    endPoint: `appraisals/convert-editor-data/${id_am}`,
    requestType: RequestType.POST,
  });

  useEffect(() => {
    const updateContent = async () => {
      if (item.type === 'text_block' || item.type === 'subsection') {
        let data;
        if (item.type === 'subsection') {
          if (item.subsections.items.length) {
            const subsectionItems = item.subsections.items;
            for (let i = 0; i <= subsectionItems.length; i++) {
              if (subsectionItems[i]['type'] === 'text_block') {
                data = {
                  appraisal_id: Number(id_am),
                  fieldContent: subsectionItems[i].content,
                };

                try {
                  const res = await mutation.mutateAsync(data);

                  setTemplateData((old: any) => {
                    const sections = [...old.sections];

                    const updatedItem = {
                      ...sections[parentIndex].items[index].subsections.items[
                        i
                      ],
                      contents: res?.data?.data,
                    };

                    sections[parentIndex].items[index].subsections.items[i] =
                      updatedItem;

                    return { ...old, sections };
                  });
                } catch (error) {
                  console.log(error);
                }
              }
            }
          }
        } else {
          data = {
            appraisal_id: Number(id_am),
            fieldContent: item?.content,
          };

          try {
            const res = await mutation.mutateAsync(data);

            setTemplateData((old: any) => {
              const sections = [...old.sections];

              const updatedItem = {
                ...sections[parentIndex].items[index],
                contents: res?.data?.data,
              };

              sections[parentIndex].items[index] = updatedItem;

              return { ...old, sections };
            });
          } catch (error) {
            console.log(error);
          }
        }
      }
    };

    updateContent();
  }, [item.type]);

  const backImage = () => {
    setStImg(true);
    setTemplateData((old: any) => {
      const sections = [...old.sections];

      const updatedItem = {
        ...sections[parentIndex].items[index],
        content: imageModal,
        id: imageModal,
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

  const editSections = (section_id: any) => {
    editSection(section_id);
  };

  const editsubSections = (event: any) => {
    editsubSection(event);
  };

  const handleModalClosePopUp = () => {
    setEditItemData(null);
  };

  const parentList = () => {
    setShowOptions(false);
  };

  const [approchType, numericPart] = item.content
    ? item.content.split('_')
    : [];

  const number = numericPart || '';

  const openModal = () => {
    setIsModalOpenApproch(true);
  };

  const openDeleteModalHandler = (parentIndex: any, index: any, id: any) => {
    setDeleteItemData({ parentIndex, index, id });
    setOpenDeleteModal(true);
  };
  // const incomeComparisonRendered = false;
  const renderTableByType = (
    item: any,
    targetType: string,
    TableComponent: React.FC<{ approachId: string }>
  ) => {
    if (!item.content) return null;

    let approachType, approachId;

    if (item.content.startsWith('rent_roll_')) {
      // Extract only the numeric ID after "rent_roll_"
      approachType = 'rent';
      approachId = item.content.replace('rent_roll_', '');
    } else {
      [approachType, approachId] = item.content.split('_');
    }

    console.log(`Processing type: ${approachType}, approachId: ${approachId}`);

    if (approachType === targetType && approachId) {
      return (
        <div className="mt-4">
          <TableComponent approachId={approachId} />
        </div>
      );
    }

    return null;
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
              <div className="flex items-center pb-4">
                <FormLabel className="uppercase font-semibold text-base text-customBlue pr-9 mt-2">
                  {ReportTitleEnum.APPROCH}
                </FormLabel>
              </div>

              <RadioGroup
                aria-labelledby="approach-radio-group"
                name="radio-buttons-group"
                onChange={handleRadioChange}
                className="flex flex-row gap-3 ps-2"
              >
                {data_get &&
                  (() => {
                    const renderedApproaches = new Set(); // Ensure each approach is rendered only once

                    return data_get.map((approach: any) => {
                      const sections = templateData?.sections || [];
                      let item;

                      if (editItemData.isEdit) {
                        if (editItemData.isSubSectionItem) {
                          item =
                            sections[parentIndex]?.items[
                              editItemData?.itemIndex
                            ]?.subsections?.items[editItemData.subItemIndex];
                        } else {
                          item =
                            sections[parentIndex]?.items[
                              editItemData?.itemIndex
                            ];
                        }
                      }

                      const isIncomeApproach = approach.type === 'income';
                      const shouldRenderIncomeComparison =
                        isIncomeApproach &&
                        !renderedApproaches.has('incomeComparison');

                      renderedApproaches.add(approach.type);
                      if (shouldRenderIncomeComparison) {
                        renderedApproaches.add('incomeComparison');
                      }

                      return (
                        <React.Fragment key={approach.id}>
                          {/* Approach Radio Option */}
                          <FormControlLabel
                            className={`ps-1 pr-3 py-1 rounded-full border border-black gap-2 text-base ${
                              item?.content ===
                              `${approach.type}_${approach.id}`
                                ? 'bg-[#0DA1C71A]'
                                : 'bg-[#A0A0A01A]'
                            }`}
                            control={
                              <Radio
                                inputProps={
                                  {
                                    'data-id': approach.id,
                                    'data-appraisal-id': approach.appraisal_id,
                                    'data-type': approach.type,
                                  } as CustomInputProps
                                }
                                checked={
                                  editItemData.isEdit
                                    ? item?.content ===
                                      `${approach.type}_${approach.id}`
                                    : false
                                }
                                value={approach.id}
                              />
                            }
                            label={`${
                              approach.type === 'rent_roll'
                                ? approach.type
                                    .split('_')
                                    .map(
                                      (word: any) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1)
                                    )
                                    .join(' ')
                                : approach.type.charAt(0).toUpperCase() +
                                  approach.type.slice(1)
                            } - ${approach.name}`}
                          />

                          {/* Income Comparison Component (Only Render Once) */}
                          {shouldRenderIncomeComparison && (
                            <FormControlLabel
                              className={`ps-1 pr-3 py-1 rounded-full border border-black gap-2 text-base ${
                                item?.content === `incomeComparison_component`
                                  ? 'bg-[#0DA1C71A]'
                                  : 'bg-[#A0A0A01A]'
                              }`}
                              control={
                                <Radio
                                  inputProps={
                                    {
                                      'data-id': approach.id,
                                      'data-appraisal-id':
                                        approach.appraisal_id,
                                      'data-type': 'incomeComparison',
                                    } as CustomInputProps
                                  }
                                  checked={
                                    editItemData.isEdit
                                      ? item?.content ===
                                        `incomeComparison_${approach.id}`
                                      : false
                                  }
                                  value="incomeComparison_component"
                                />
                              }
                              label="Income Comparison Component"
                            />
                          )}
                        </React.Fragment>
                      );
                    });
                  })()}
              </RadioGroup>
            </FormControl>
          </CompDeleteModalCross>
        </>
      ) : null}

      {editItemData?.type === 'map' ? (
        <>
          <CompDeleteModalCross>
            <div className="cursor-pointer px-9 pb-1">
              <div className="bg-[#0da1c714] rounded-md text-gray-500  absolute right-[15px]">
                <ClearIcon
                  className="text-3xl text-[#0da1c7]"
                  onClick={handleModalClosePopUp}
                />
              </div>
            </div>

            <FormControl>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                name="radio-buttons-group"
                className="flex flex-row gap-3 ps-2"
                onChange={handleRadioChangeMap}
              >
                <FormControlLabel
                  value={defaultOption.type}
                  // checked={item.content == 'aerial_map'}
                  checked={
                    editItemData.isEdit ? item?.content === `aerial_map` : false
                  }
                  className={`ps-1 pr-3 py-1 rounded-full border border-black gap-2 text-base ${
                    item.content === `aerial_map`
                      ? 'bg-[#0DA1C71A]'
                      : 'bg-[#A0A0A01A]'
                  }`}
                  control={
                    <Radio
                      inputProps={
                        {
                          'data-id': '',
                          'data-appraisal-id': '',
                        } as CustomInputProps
                      }
                    />
                  }
                  label={defaultOption.name}
                />
                <FormControlLabel
                  value={defaultOption_2.type}
                  checked={
                    editItemData.isEdit
                      ? item?.content === 'map_boundary'
                      : false
                  }
                  className={`ps-1 pr-3 py-1 rounded-full border border-black gap-2 text-base`}
                  style={{
                    backgroundColor:
                      item?.content === 'map_boundary'
                        ? '#0DA1C71A'
                        : '#A0A0A01A',
                  }}
                  control={
                    <Radio
                      inputProps={
                        {
                          'data-id': '',
                          'data-appraisal-id': '',
                        } as CustomInputProps
                      }
                    />
                  }
                  label={defaultOption_2.name}
                />

                {filteredApproaches &&
                  filteredApproaches.map((approach: any) => {
                    const sections = templateData?.sections || [];

                    if (editItemData.isEdit) {
                      if (editItemData.isSubSectionItem) {
                        item =
                          sections[parentIndex]?.items[editItemData?.itemIndex]
                            ?.subsections?.items[editItemData.subItemIndex];
                      } else {
                        item =
                          sections[parentIndex]?.items[editItemData?.itemIndex];
                      }
                    }

                    return (
                      <FormControlLabel
                        className={`ps-1 pr-3 py-1 rounded-full border border-black gap-2 text-base ${
                          item.content === `${approach.type}_${approach.id}`
                            ? 'bg-[#0DA1C71A]'
                            : 'bg-[#A0A0A01A]'
                        }`}
                        control={
                          <Radio
                            checked={
                              editItemData.isEdit
                                ? item?.content ===
                                  `${approach.type}_${approach.id}`
                                : false
                            }
                            value={approach.id}
                            inputProps={
                              {
                                'data-id': approach.id,
                                'data-appraisal-id': approach.appraisal_id,
                                'data-type': approach.type,
                              } as CustomInputProps
                            }
                          />
                        }
                        label={`${approach.type.charAt(0).toUpperCase() + approach.type.slice(1)} - ${approach.name}`}
                      />
                    );
                  })}
              </RadioGroup>
            </FormControl>
          </CompDeleteModalCross>
        </>
      ) : null}
      {editItemData?.type === `text_block` ? (
        <CompDeleteModalCrossEditor>
          <div className="cursor-pointer px-9 pb-1 cursor-pointer">
            <div className="bg-[#0da1c714] rounded-md text-gray-500  absolute right-[15px] top-[10px] z-50">
              <ClearIcon
                className="text-3xl text-[#0da1c7]"
                onClick={handleModalClosePopUp}
              />
            </div>
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

      {editItemData?.type === 'image' ? (
        <>
          {openImage && (
            <CompDeleteModalCross>
              <div className="w-full">
                <ImageListModal>
                  <div className="flex justify-between items-center bg-[#0da1c714] m-2 rounded-md text-gray-500 p-3">
                    <Typography
                      variant="h4"
                      component="h4"
                      className="text-sm text-[#0da1c7] font-bold template mx-auto"
                    >
                      List of Images
                    </Typography>
                    <ClearIcon
                      className="text-3xl text-[#0da1c7] cursor-pointer"
                      onClick={handleModalCloseImage}
                    />
                  </div>
                  <ImageGallery getImageUrl={getImageUrl} />
                  <Grid item xs={12}>
                    <div className="flex justify-center mt-9 mb-6">
                      <CommonButton
                        variant="contained"
                        color="primary"
                        className="bg-customBlue"
                        style={{
                          width: '200px',
                          height: '40px',
                          borderRadius: '5px',
                        }}
                        onClick={() => backImage()}
                      >
                        SAVE
                      </CommonButton>
                    </div>
                  </Grid>
                </ImageListModal>
              </div>
            </CompDeleteModalCross>
          )}
        </>
      ) : null}

      <div className="w-full">
        <div
          className={`flex items-center relative imageGallerControlWrapper group ${item?.type && item?.type !== 'subsection' && 'w-full'}`}
        >
          {item?.type === 'approach' ? (
            <div className="template-wrapper active-appraisal w-full">
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  {/* Log the approach type for debugging */}
                  {console.log('Selected approach_type:', approchType)}

                  {/* Income Approach Table */}
                  {approchType === 'income' && number && (
                    <div className="mt-4">
                      <IncomeApproachTable approachId={number} />
                    </div>
                  )}
                  {/* {approchType === 'rent' && number && (
                    <RentRoleTable approachId={number} />
                  )} */}

                  {/* Sale Table */}
                  {renderTableByType(item, 'sale', SaleTable)}

                  {/* Cost Table */}
                  {renderTableByType(item, 'cost', CostTable)}

                  {/* Lease Table */}
                  {renderTableByType(item, 'lease', LeaseTable)}
                  {renderTableByType(item, 'rent', RentRoleTable)}
                </Grid>
              </Grid>
            </div>
          ) : item?.type === 'income_comparison' ? (
            <div className="template-wrapper active-appraisal w-full">
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  {/* Log the selected approach_type */}

                  {/* Render Income Comparison Table */}
                  <IncomeComparisonTable />
                </Grid>
              </Grid>
            </div>
          ) : null}

          {item.type === 'image' && (
            <React.Fragment>
              <div className="template-wrapper active-appraisal w-full">
                {(function () {
                  return (
                    <>
                      {stImg ? (
                        <div className="common-approach">
                          <img src={item?.content} alt="Content Image" />
                        </div>
                      ) : null}
                    </>
                  );
                })()}
              </div>
            </React.Fragment>
          )}

          {item.type === 'photo_pages' && (
            <React.Fragment>
              <div className="template-wrapper active-appraisal w-full common-approach">
                {(function () {
                  return (
                    <>
                      <Grid item xs={12}>
                        <div className="flex">
                          <Typography
                            variant="h4"
                            component="h4"
                            className="font-bold font-bold text-xl mb-5 pl-[90px]"
                          >
                            Subject Property Photos
                          </Typography>
                        </div>
                        <PhotoImageGallery getImageUrl={getImageUrl} />
                      </Grid>
                    </>
                  );
                })()}
              </div>
            </React.Fragment>
          )}

          {item.type === 'text_block' && (
            <div className="template-wrapper active-appraisal max-w-[1138px] w-full">
              {showTextBox && (
                <div
                  className="dangerouslySetInnerHTML"
                  dangerouslySetInnerHTML={{
                    __html: item?.contents || item?.content,
                  }}
                />
              )}
            </div>
          )}

          {item?.type === 'map' && (
            <React.Fragment>
              <div className="template-wrapper active-appraisal w-full">
                {item.content === 'aerial_map' ? (
                  <>
                    <ReportSectionMap googleDta={data?.data?.data} />
                  </>
                ) : null}

                {item.content === 'map_boundary' ? (
                  <>
                    <ReportMapBoundary id_am={id_am} />
                  </>
                ) : null}

                {(function () {
                  const [approachType, approachId] = item.content
                    ? item.content.split('_')
                    : [];
                  return (
                    (approchType === 'sale' ||
                      (approachType === 'sale' && approachId)) && (
                      <>
                        <SaleReportMap approachId={approachId} />
                      </>
                    )
                  );
                })()}
                {(function () {
                  const [approachType, approachId] = item.content
                    ? item.content.split('_')
                    : [];
                  return (
                    (approchType === 'rent_roll' ||
                      (approachType === 'rent_roll' && approachId)) && (
                      <>
                        <SaleReportMap approachId={approachId} />
                      </>
                    )
                  );
                })()}
                {(function () {
                  const [approachType, approachId] = item.content
                    ? item.content.split('_')
                    : [];
                  return (
                    (approchType === 'cost' ||
                      (approachType === 'cost' && approachId)) && (
                      <>
                        <GoogleMapAreaInfoCost approachId={approachId} />
                      </>
                    )
                  );
                })()}
                {(function () {
                  const [approachType, approachId] = item.content
                    ? item.content.split('_')
                    : [];
                  return (
                    (approchType === 'lease' ||
                      (approachType === 'lease' && approachId)) && (
                      <>
                        <GoogleMapAreaInfoLease approachId={approachId} />
                      </>
                    )
                  );
                })()}
              </div>
            </React.Fragment>
          )}

          <div>
            <div className="text-nowrap font-bold text-2xl">
              {item.type === null ? `${secTitle}` : ''}
            </div>

            {item.type === 'subsection' ? (
              <div className="flex items-center">
                <span className="pr-1 font-bold">
                  {item.subsections?.title}
                </span>
              </div>
            ) : null}
          </div>

          <div
            className={`imageGallerControl group-hover:flex hidden rounded bg-white items-center ${item?.type && item?.type !== 'subsection' ? 'absolute' : 'ml-[16px]'} right-[8px]  top-0 border border-solid border-[#e1e1e1] gap-2 p-2`}
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
                  <Tooltip title="Delete Delete Section">
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
            <div className="template-wrapper active-appraisal pl-[28px]">
              <SubSectionsItemsReport
                item={item}
                parentIndex={parentIndex}
                index={index}
                template_id={template_id}
                id_am={id_am}
                setEditItemData={setEditItemData}
                googleDta={data?.data?.data}
                showTextBox={showTextBox}
                approchType={approchType}
                setAddItemInfo={setAddItemInfo}
                toggleOptions={toggleOptions}
                editItemData={editItemData}
                handleAddItem={handleAddItem}
                setIsModalOpenImg={setIsModalOpenImg}
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
            <div className="flex flex-col items-center gap-1">
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
          <CreateSubSectionReport
            section_id={section_id}
            handleModalClose={handleModalClose}
            parentIndex={parentIndex}
            template_id={template_id}
            addItemInfo={addItemInfo}
            setAddItemInfo={setAddItemInfo}
          />
        </CompDeleteModal>
      ) : null}
    </>
  );
};

export default AppraisalSection;
