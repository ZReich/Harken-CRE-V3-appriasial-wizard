import { Icons } from '@/components/icons';
import { Grid } from '@mui/material';
import React, { useContext, useState } from 'react';
import { TemplateContext } from '../main-screen';
import ReportSectionMap from '../map';
import IncomeApproachTable from '../approch-data';
import SaleReportMap from '../saleMapt';
import GoogleMapAreaInfoCost from '../costMap';
import Tooltip from '@mui/material/Tooltip';
import ReportMapBoundary from '../report-map-boundary';
import SaleTable from '../sale-data';
import CostTable from '../cost-data';
import group3 from '../../../../images/Group3.png';
import DeleteConfirmationSectionItems from '@/components/delete-confirmation-section-items';
import axios from 'axios';
import { toast } from 'react-toastify';
import addImage from '../../../../images/Group 1580.png';
import GoogleMapAreaInfoLease from '../leaseMap';
import LeaseTable from '../lease-data';
import IncomeComparisonTable from '../income_comparison_data';
import RentRoleTable from '../rent-roll-data';

const SubSectionsItemsReport = ({
  item,
  parentIndex,
  index: itemIndex,
  id_am,
  setEditItemData,
  googleDta,
  showTextBox,
  approchType,
  toggleOptions,
  setAddItemInfo,
  setIsModalOpenImg,
}: any) => {
  const { setTemplateData }: any = useContext<any[]>(TemplateContext);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteItemData, setDeleteItemData] = useState({
    parentIndex: null,
    index: null,
    id: null,
    deleteId: null,
  });

  const deleteFnSubSection = (
    parentIndex: any,
    itemIndex: any,
    index: any,
    deleteId: null
  ) => {
    setTemplateData((old: any) => {
      const updatedSections = [...old.sections];
      const item = updatedSections[parentIndex].items[itemIndex];
      const subItem = item.subsections.items[index];

      old.sections[parentIndex].items[itemIndex].subsections.items.splice(
        index,
        1
      );

      if (typeof deleteId !== 'string') {
        setTimeout(async () => {
          try {
            await axios.delete(`/template/delete-section-item/${subItem?.id}`);
            toast.success('Sub-section deleted successfully');
          } catch (error) {
            console.error(
              `Failed to delete subsection with ID ${subItem?.id}}`,
              error
            );
          }
        }, 0);
      }
      return { ...old };
    });
  };

  const openDeleteModalHandler = (
    parentIndex: any,
    index: any,
    id: any,
    deleteId: any
  ) => {
    setDeleteItemData({ parentIndex, index, id, deleteId });
    setOpenDeleteModal(true);
  };

  return (
    <>
      {item.type === 'subsection' && (
        <div className="py-4" key={item?.id}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {item?.subsections?.items.map((elem: any, index: number) => {
                return (
                  <>
                    {elem.type === 'approach' ? (
                      <div
                        className={`flex items-center relative imageGallerControlWrapper group ${
                          elem?.type && elem?.type !== 'subsection' && 'w-full'
                        }`}
                        key={item?.id}
                      >
                        <div className="imageGallerControl group-hover:flex hidden rounded bg-white flex items-center gap-2 justify-end absolute right-0 top-0 border border-solid border-[#e1e1e1] p-2">
                          {/* Controls for 'approach' */}
                          <Tooltip title="Add Item">
                            <div
                              className="cursor-pointer rounded-full p-1 border border-solid shadow-md border-slate-300 w-[30px] h-[30px] imageGallerControl flex item-center justify-center bg-white"
                              onClick={() => {
                                toggleOptions();
                                setAddItemInfo({
                                  sectionIndex: parentIndex,
                                  itemIndex,
                                  subItemIndex: index,
                                });
                              }}
                            >
                              <img src={group3} alt="add" className="w-full" />
                            </div>
                          </Tooltip>
                          <Tooltip title="Edit Section">
                            <Icons.EditIcon
                              onClick={() =>
                                setEditItemData({
                                  isSubSectionItem: true,
                                  sectionIndex: parentIndex,
                                  itemIndex,
                                  subItemIndex: index,
                                  isEdit: true,
                                  type: elem.type,
                                })
                              }
                              className="text-3xl bg-white text-blue-500 top-9 rounded-full p-1 border border-solid shadow-md border-slate-300 cursor-pointer"
                            />
                          </Tooltip>
                          <Tooltip title="Delete Approach">
                            <Icons.DeleteIcon
                              className="text-red-500 cursor-pointer text-2xl"
                              onClick={() =>
                                openDeleteModalHandler(
                                  parentIndex,
                                  itemIndex,
                                  index,
                                  elem.id
                                )
                              }
                            />
                          </Tooltip>
                          {openDeleteModal && (
                            <DeleteConfirmationSectionItems
                              close={() => setOpenDeleteModal(false)}
                              deleteComps={() => {
                                deleteFnSubSection(
                                  deleteItemData.parentIndex,
                                  deleteItemData.index,
                                  deleteItemData.id,
                                  deleteItemData.deleteId
                                );
                                setOpenDeleteModal(false);
                              }}
                              label="Delete"
                            />
                          )}
                        </div>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            {/* Approach-Based Rendering */}
                            {(function () {
                              let approachType, approachId;

                              if (elem.content) {
                                if (elem.content.startsWith('rent_roll_')) {
                                  // Extract ID after "rent_roll_"
                                  approachType = 'rent';
                                  approachId = elem.content.replace(
                                    'rent_roll_',
                                    ''
                                  );
                                } else {
                                  [approachType, approachId] =
                                    elem.content.split('_');
                                }
                              }

                              if (approachType === 'income' && approachId) {
                                return (
                                  <div className="mt-2 common-approach">
                                    <IncomeApproachTable
                                      approachId={approachId}
                                    />
                                  </div>
                                );
                              }
                              if (approachType === 'sale' && approachId) {
                                return (
                                  <div className="mt-2 common-approach">
                                    <SaleTable approachId={approachId} />
                                  </div>
                                );
                              }
                              if (approachType === 'cost' && approachId) {
                                return (
                                  <div className="mt-2 common-approach">
                                    <CostTable approachId={approachId} />
                                  </div>
                                );
                              }
                              if (approachType === 'lease' && approachId) {
                                return (
                                  <div className="mt-2 common-approach">
                                    <LeaseTable approachId={approachId} />
                                  </div>
                                );
                              }
                              if (approachType === 'rent' && approachId) {
                                return (
                                  <div className="mt-2 common-approach">
                                    <RentRoleTable approachId={approachId} />
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </Grid>
                        </Grid>
                      </div>
                    ) : elem.type === 'income_comparison' ? (
                      <div className="template-wrapper active-appraisal w-full group">
                        <div
                          className={`flex items-center relative imageGallerControlWrapper ${
                            elem?.type &&
                            elem?.type !== 'subsection' &&
                            'w-full'
                          }`}
                        >
                          {/* Hover-controlled container */}
                          <div className="imageGallerControl hidden group-hover:flex items-center gap-2 justify-end absolute right-0 top-0 border border-solid border-[#e1e1e1] p-2 rounded bg-white">
                            {/* Add Item */}
                            <Tooltip title="Add Item">
                              <div
                                className="cursor-pointer rounded-full p-1 border border-solid shadow-md border-slate-300 w-[30px] h-[30px] flex items-center justify-center bg-white"
                                onClick={() => {
                                  toggleOptions();
                                  setAddItemInfo({
                                    sectionIndex: parentIndex,
                                    itemIndex,
                                    subItemIndex: index,
                                  });
                                }}
                              >
                                <img
                                  src={group3}
                                  alt="add"
                                  className="w-full"
                                />
                              </div>
                            </Tooltip>
                            {/* Edit Section */}
                            <Tooltip title="Edit Section">
                              <Icons.EditIcon
                                onClick={() =>
                                  setEditItemData({
                                    isSubSectionItem: true,
                                    sectionIndex: parentIndex,
                                    itemIndex,
                                    subItemIndex: index,
                                    isEdit: true,
                                    type: elem.type,
                                  })
                                }
                                className="text-3xl bg-white text-blue-500 top-9 rounded-full p-1 border border-solid shadow-md border-slate-300 cursor-pointer"
                              />
                            </Tooltip>
                            {/* Delete Approach */}
                            <Tooltip title="Delete Approach">
                              <Icons.DeleteIcon
                                className="text-red-500 cursor-pointer text-2xl"
                                onClick={() =>
                                  openDeleteModalHandler(
                                    parentIndex,
                                    itemIndex,
                                    index,
                                    elem.id
                                  )
                                }
                              />
                            </Tooltip>
                            {openDeleteModal && (
                              <DeleteConfirmationSectionItems
                                close={() => setOpenDeleteModal(false)}
                                deleteComps={() => {
                                  deleteFnSubSection(
                                    deleteItemData.parentIndex,
                                    deleteItemData.index,
                                    deleteItemData.id,
                                    deleteItemData.deleteId
                                  );
                                  setOpenDeleteModal(false);
                                }}
                                label="Delete"
                              />
                            )}
                          </div>
                        </div>

                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            {/* Render Income Comparison Table */}
                            <IncomeComparisonTable
                            // approachId={elem?.content?.split('_')?.[1]}
                            />
                          </Grid>
                        </Grid>
                      </div>
                    ) : null}

                    {elem.type === 'map' && (
                      <div
                        className={`flex items-center relative imageGallerControlWrapper group ${elem?.type && elem?.type !== 'subsection' && 'w-full'}`}
                        key={item?.id}
                      >
                        <div className="imageGallerControl group-hover:flex hidden rounded bg-white flex items-center gap-2 justify-end absolute right-0 top-0 border border-solid border-[#e1e1e1] p-2">
                          <Tooltip title="Add Item">
                            <div
                              className="cursor-pointer rounded-full p-1 border border-solid shadow-md border-slate-300 w-[30px] h-[30px] imageGallerControl  flex item-center justify-center bg-white"
                              onClick={() => {
                                toggleOptions();
                                setAddItemInfo({
                                  sectionIndex: parentIndex,
                                  itemIndex,
                                  subItemIndex: index,
                                });
                              }}
                            >
                              <img src={group3} alt="add" className="w-full" />
                            </div>
                          </Tooltip>
                          <Tooltip title="Edit Map">
                            <Icons.EditIcon
                              onClick={() =>
                                setEditItemData({
                                  isSubSectionItem: true,
                                  sectionIndex: parentIndex,
                                  itemIndex,
                                  subItemIndex: index,
                                  isEdit: true,
                                  type: elem.type,
                                })
                              }
                              className="text-3xl bg-white text-blue-500 top-9 rounded-full p-1 border border-solid shadow-md border-slate-300 cursor-pointer"
                            />
                          </Tooltip>
                          <Tooltip title="Delete Map">
                            <Icons.DeleteIcon
                              className="text-red-500 cursor-pointer text-2xl"
                              onClick={() =>
                                openDeleteModalHandler(
                                  parentIndex,
                                  itemIndex,
                                  index,
                                  elem.id
                                )
                              }
                            />
                          </Tooltip>
                          {openDeleteModal && (
                            <DeleteConfirmationSectionItems
                              close={() => setOpenDeleteModal(false)}
                              deleteComps={() => {
                                deleteFnSubSection(
                                  deleteItemData.parentIndex,
                                  deleteItemData.index,
                                  deleteItemData.id,
                                  deleteItemData.deleteId
                                );
                                setOpenDeleteModal(false);
                              }}
                              label="Delete"
                            />
                          )}
                        </div>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <div>
                              {elem.content === 'aerial_map' ? (
                                <div className="mt-9 common-approach">
                                  <ReportSectionMap googleDta={googleDta} />
                                </div>
                              ) : null}
                              {elem.content === 'map_boundary' ? (
                                <div className="mt-9 common-approach">
                                  <ReportMapBoundary id_am={id_am} />
                                </div>
                              ) : null}
                              {(function () {
                                const [approachType, approachId] = elem.content
                                  ? elem.content.split('_')
                                  : [];
                                return (
                                  (approchType === 'sale' ||
                                    (approachType === 'sale' &&
                                      approachId)) && (
                                    <div className="mt-9 common-approach">
                                      <SaleReportMap approachId={approachId} />
                                    </div>
                                  )
                                );
                              })()}
                              {(function () {
                                const [approachType, approachId] = elem.content
                                  ? elem.content.split('_')
                                  : [];
                                return (
                                  (approchType === 'cost' ||
                                    (approachType === 'cost' &&
                                      approachId)) && (
                                    <div className="mt-9 common-approach">
                                      <GoogleMapAreaInfoCost
                                        approachId={approachId}
                                      />
                                    </div>
                                  )
                                );
                              })()}
                              {(function () {
                                const [approachType, approachId] = elem.content
                                  ? elem.content.split('_')
                                  : [];
                                return (
                                  (approchType === 'lease' ||
                                    (approachType === 'lease' &&
                                      approachId)) && (
                                    <div className="mt-9 common-approach">
                                      <GoogleMapAreaInfoLease
                                        approachId={approachId}
                                      />
                                    </div>
                                  )
                                );
                              })()}
                            </div>
                          </Grid>
                        </Grid>
                      </div>
                    )}

                    {elem.type === 'image' && (
                      <div
                        className={`flex items-center relative imageGallerControlWrapper group ${elem?.type && elem?.type !== 'subsection' && 'w-full'}`}
                        key={item?.id}
                      >
                        <div className="imageGallerControl group-hover:flex hidden rounded bg-white flex items-center gap-2 justify-end absolute right-0 top-0 border border-solid border-[#e1e1e1] p-2">
                          <Tooltip title="Add Item">
                            <div
                              className="cursor-pointer rounded-full p-1 border border-solid shadow-md border-slate-300 w-[30px] h-[30px] imageGallerControl  flex item-center justify-center bg-white"
                              onClick={() => {
                                toggleOptions();
                                setAddItemInfo({
                                  sectionIndex: parentIndex,
                                  itemIndex,
                                  subItemIndex: index,
                                });
                              }}
                            >
                              <img src={group3} alt="add" className="w-full" />
                            </div>
                          </Tooltip>
                          <Tooltip title="Edit Image">
                            <Icons.EditIcon
                              onClick={() =>
                                setEditItemData({
                                  isSubSectionItem: true,
                                  sectionIndex: parentIndex,
                                  itemIndex,
                                  subItemIndex: index,
                                  isEdit: true,
                                  type: 'image',
                                })
                              }
                              className="text-3xl bg-white text-blue-500 top-9 rounded-full p-1 border border-solid shadow-md border-slate-300 cursor-pointer"
                            />
                          </Tooltip>
                          <Tooltip title="Delete Image">
                            <Icons.DeleteIcon
                              className="text-red-500 cursor-pointer text-2xl"
                              onClick={() =>
                                openDeleteModalHandler(
                                  parentIndex,
                                  itemIndex,
                                  index,
                                  elem.id
                                )
                              }
                            />
                          </Tooltip>
                          {openDeleteModal && (
                            <DeleteConfirmationSectionItems
                              close={() => setOpenDeleteModal(false)}
                              deleteComps={() => {
                                deleteFnSubSection(
                                  deleteItemData.parentIndex,
                                  deleteItemData.index,
                                  deleteItemData.id,
                                  deleteItemData.deleteId
                                );
                                setOpenDeleteModal(false);
                              }}
                              label="Delete"
                            />
                          )}
                        </div>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            {elem.type === 'image' && (
                              <React.Fragment>
                                <div className="template-wrapper active-appraisal w-full">
                                  {(function () {
                                    return (
                                      <>
                                        <div className="common-approach">
                                          <img
                                            src={elem?.content || addImage}
                                            alt="Content Image"
                                            onClick={() => {
                                              setIsModalOpenImg(true);
                                            }}
                                          />
                                        </div>
                                      </>
                                    );
                                  })()}
                                </div>
                              </React.Fragment>
                            )}
                          </Grid>
                        </Grid>
                      </div>
                    )}

                    {elem.type === 'text_block' && (
                      <div
                        className={`flex items-center relative imageGallerControlWrapper group ${elem?.type && elem?.type !== 'subsection' && 'w-full'}`}
                        key={item?.id}
                      >
                        <div className="imageGallerControl group-hover:flex hidden rounded bg-white flex items-center gap-2 justify-end absolute right-0 top-0 border border-solid border-[#e1e1e1] p-2">
                          <Tooltip title="Add Item">
                            <div
                              className="cursor-pointer rounded-full p-1 border border-solid shadow-md border-slate-300 w-[30px] h-[30px] imageGallerControl  flex item-center justify-center bg-white"
                              onClick={() => {
                                toggleOptions();
                                setAddItemInfo({
                                  sectionIndex: parentIndex,
                                  itemIndex,
                                  subItemIndex: index,
                                });
                              }}
                            >
                              <img src={group3} alt="add" className="w-full" />
                            </div>
                          </Tooltip>
                          <Tooltip title="Edit Text Block">
                            <Icons.EditIcon
                              onClick={() =>
                                setEditItemData({
                                  isSubSectionItem: true,
                                  sectionIndex: parentIndex,
                                  itemIndex,
                                  subItemIndex: index,
                                  isEdit: true,
                                  type: 'text_block',
                                })
                              }
                              className="text-3xl bg-white text-blue-500 top-9 rounded-full p-1 border border-solid shadow-md border-slate-300 cursor-pointer"
                            />
                          </Tooltip>
                          <Tooltip title="Delete Text Block">
                            <Icons.DeleteIcon
                              className="text-red-500 cursor-pointer text-2xl"
                              onClick={() =>
                                openDeleteModalHandler(
                                  parentIndex,
                                  itemIndex,
                                  index,
                                  elem.id
                                )
                              }
                            />
                          </Tooltip>
                          {openDeleteModal && (
                            <DeleteConfirmationSectionItems
                              close={() => setOpenDeleteModal(false)}
                              deleteComps={() => {
                                deleteFnSubSection(
                                  deleteItemData.parentIndex,
                                  deleteItemData.index,
                                  deleteItemData.id,
                                  deleteItemData.deleteId
                                );
                                setOpenDeleteModal(false);
                              }}
                              label="Delete"
                            />
                          )}
                        </div>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <div>
                              {showTextBox ? (
                                <>
                                  <div
                                    className="dangerouslySetInnerHTML"
                                    dangerouslySetInnerHTML={{
                                      __html: elem?.contents || elem?.content,
                                    }}
                                  />
                                </>
                              ) : null}
                            </div>
                          </Grid>
                        </Grid>
                      </div>
                    )}
                  </>
                );
              })}
            </Grid>
          </Grid>
        </div>
      )}
    </>
  );
};
export default SubSectionsItemsReport;
