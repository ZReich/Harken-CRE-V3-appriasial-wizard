import { Icons } from '@/components/icons';
import { Grid } from '@mui/material';
import React, { useContext, useState } from 'react';
import { TemplateContext } from './main-screen-template';
import Tooltip from '@mui/material/Tooltip';
import DeleteConfirmationSectionItems from '@/components/delete-confirmation-section-items';
import axios from 'axios';
import group3 from '../../images/Group3.png';
import { toast } from 'react-toastify';
import addImage from '../../images/Group3.png';
import FakeTable from './fakeTable';
import FakeGoogleMapLocation from './fakeMap';

const SubSectionsItems = ({
  item,
  parentIndex,
  index: itemIndex,
  setEditItemData,
  toggleOptions,
  setAddItemInfo,
  showTextBox,
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
                    <Grid xs={8}>
                      {elem.type === 'approach' && (
                        <div
                          className={`flex items-center relative imageGallerControlWrapper group ${elem?.type && elem?.type !== 'subsection' && 'w-full'}`}
                          key={elem?.id} // Changed to elem.id for consistency
                        >
                          <div className="imageGallerControl group-hover:flex hidden rounded bg-white flex items-center gap-2 justify-end absolute right-[250px] top-0 border border-solid border-[#e1e1e1] p-2">
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
                                <img
                                  src={group3}
                                  alt="add"
                                  className="w-full"
                                />
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
                            <Grid item xs={8}>
                              <div>
                                {elem.content === 'income' && (
                                  <>
                                    <p className="pb-2 font-bold text-lg">
                                      Income
                                    </p>
                                    <FakeTable />
                                  </>
                                )}
                                {elem.content === 'rent_roll' && (
                                  <>
                                    <p className="pb-2 font-bold text-lg">
                                      Rent Roll
                                    </p>
                                    <FakeTable />
                                  </>
                                )}
                                {elem.content === 'sale' && (
                                  <>
                                    <p className="pb-2 font-bold text-lg">
                                      Sale
                                    </p>
                                    <FakeTable />
                                  </>
                                )}
                                {elem.content === 'cost' && (
                                  <>
                                    <p className="pb-2 font-bold text-lg">
                                      Cost
                                    </p>
                                    <FakeTable />
                                  </>
                                )}
                                {elem.content === 'cost' && (
                                  <>
                                    <p className="pb-2 font-bold text-lg">
                                      Cost
                                    </p>
                                    <FakeTable />
                                  </>
                                )}
                                {elem.content === 'lease' && (
                                  <>
                                    <p className="pb-2 font-bold text-lg">
                                      Lease
                                    </p>
                                    <FakeTable />
                                  </>
                                )}
                                {elem.content === 'income_comparison' && (
                                  <>
                                    <p className="pb-2 font-bold text-lg">
                                      Income Comparison
                                    </p>
                                    <FakeTable />
                                  </>
                                )}
                              </div>
                            </Grid>
                          </Grid>
                        </div>
                      )}
                      {elem.type === 'income_comparison' && (
                        <div
                          className={`flex items-center relative imageGallerControlWrapper group ${elem?.type && elem?.type !== 'subsection' && 'w-full'}`}
                          key={elem?.id} // Changed to elem.id for consistency
                        >
                          <div className="imageGallerControl group-hover:flex hidden rounded bg-white flex items-center gap-2 justify-end absolute right-[250px] top-0 border border-solid border-[#e1e1e1] p-2">
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
                                <img
                                  src={group3}
                                  alt="add"
                                  className="w-full"
                                />
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
                            <Grid item xs={8}>
                              <div>
                                {elem.content === 'income' && (
                                  <>
                                    <p className="pb-2 font-bold text-lg">
                                      Income
                                    </p>
                                    <FakeTable />
                                  </>
                                )}
                                {elem.content === 'sale' && (
                                  <>
                                    <p className="pb-2 font-bold text-lg">
                                      Sale
                                    </p>
                                    <FakeTable />
                                  </>
                                )}
                                {elem.content === 'cost' && (
                                  <>
                                    <p className="pb-2 font-bold text-lg">
                                      Cost
                                    </p>
                                    <FakeTable />
                                  </>
                                )}
                                {elem.content === 'lease' && (
                                  <>
                                    <p className="pb-2 font-bold text-lg">
                                      Lease
                                    </p>
                                    <FakeTable />
                                  </>
                                )}
                                {elem.content === 'income_comparison' && (
                                  <>
                                    <p className="pb-2 font-bold text-lg">
                                      Income Comparison
                                    </p>
                                    <FakeTable />
                                  </>
                                )}
                              </div>
                            </Grid>
                          </Grid>
                        </div>
                      )}

                      {elem.type === 'map' && (
                        <div
                          className={`flex items-center relative imageGallerControlWrapper group ${elem?.type && elem?.type !== 'subsection' && 'w-full'}`}
                          key={item?.id}
                        >
                          <div className="imageGallerControl group-hover:flex hidden rounded bg-white flex items-center gap-2 justify-end absolute right-[230px] top-0 border border-solid border-[#e1e1e1] p-2">
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
                                <img
                                  src={group3}
                                  alt="add"
                                  className="w-full"
                                />
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
                            <Grid item xs={8}>
                              {elem.content === 'aerial_map' && (
                                <>
                                  <p className="pb-2 font-bold text-lg">
                                    Aerial map
                                  </p>
                                  <FakeGoogleMapLocation />
                                </>
                              )}
                              {elem.content === 'map_boundary' && (
                                <>
                                  <p className="pb-2 font-bold text-lg">
                                    Map Boundary
                                  </p>
                                  <FakeGoogleMapLocation />
                                </>
                              )}
                              {elem.content === 'sale' && (
                                <>
                                  <p className="pb-2 font-bold text-lg">
                                    Sales Approach Map
                                  </p>
                                  <FakeGoogleMapLocation />
                                </>
                              )}
                              {elem.content === 'cost' && (
                                <>
                                  <p className="pb-2 font-bold text-lg">
                                    Cost Approach Map
                                  </p>
                                  <FakeGoogleMapLocation />
                                </>
                              )}
                              {elem.content === 'lease' && (
                                <>
                                  <p className="pb-2 font-bold text-lg">
                                    Lease Approach Map
                                  </p>
                                  <FakeGoogleMapLocation />
                                </>
                              )}
                            </Grid>
                          </Grid>
                        </div>
                      )}

                      {elem.type === 'image' && (
                        <div
                          className={`flex items-center relative imageGallerControlWrapper group ${elem?.type && elem?.type !== 'subsection'}`}
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
                                <img
                                  src={group3}
                                  alt="add"
                                  className="w-full"
                                />
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
                                  <div className="template-wrapper active-appraisal">
                                    {(function () {
                                      return (
                                        <>
                                          <div>
                                            <img
                                              src={elem?.content || addImage}
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
                                <img
                                  src={group3}
                                  alt="add"
                                  className="w-full"
                                />
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
                    </Grid>
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
export default SubSectionsItems;
