import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { styled } from '@mui/system';
import 'react-quill/dist/quill.snow.css';
import Sidebar from '@/pages/Report/sidebar/sidebar';
import AppraisalSection from './appraisalSection';
import CompDeleteModal from '@/components/modal/Comp-delete-modal';
import ClearIcon from '@mui/icons-material/Clear';
import { Button, Typography } from '@mui/material';
import CreateSectionReport from './screen-moals/create-section';
import { Grid } from '@mui/material';
import { useGet } from '@/hook/useGet';
import AppraisalMenu from '../set-up/appraisa-menu';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import CommonButton from '@/components/elements/button/Button';
import { toast } from 'react-toastify';
import loadingImage from '../../../images/loading.png';
import UpdateSectionReport from './screen-moals/update-section';
import SnippetList from '@/pages/Report/snippet';

const SidebarContainer = styled('div')({
  display: 'flex',
  alignItems: 'flex-start',
  marginTop: '15px',
});

const initialTemplateData: any = {
  appraisal_id: '',
  sections: [],
};
// interface TemplateContextType {
//   templateData: any;
//   setTemplateData: any;
// }
export const TemplateContext = createContext<any | undefined>(undefined);

const TemplateProvider = ({ children }: any) => {
  const [templateData, setTemplateData] = useState<any[]>(initialTemplateData);

  return (
    <TemplateContext.Provider value={{ templateData, setTemplateData }}>
      {children}
    </TemplateContext.Provider>
  );
};

const withTemplateProvider = (Component: any) => {
  return () => {
    return (
      <TemplateProvider>
        <Component />
      </TemplateProvider>
    );
  };
};

const MainScreenAppraisal: React.FC = () => {
  const [sectionModel, setSectionModel] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const template_id = searchParams.get('template_id');
  const id_am = searchParams.get('id');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleScroll = () => {
      // toggle button when scrolled more than 100px
      setShowScrollTop(wrapper.scrollTop > 100);
    };

    wrapper.addEventListener('scroll', handleScroll);
    // initialize in case wrapper is already scrolled
    handleScroll();

    return () => {
      wrapper.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    wrapper.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const { templateData, setTemplateData }: any =
    useContext<any[]>(TemplateContext);

  const [editSecModel, seteditSecModel] = useState(false);
  const [secIds, setId] = useState('');
  const [editSubSecModel, seteditSubSecModel] = useState(false);
  const [showTextBox, setShowTextBox] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stImg, setStImg] = useState(false);

  const [imageModal, setImageModal] = useState(false);

  const [editorEvent, setEditorEvent] = useState('');

  const onAddSection = () => {
    setSectionModel(true);
  };

  useEffect(() => {
    setTemplateData((old: any) => ({
      ...old,
      appraisal_id: Number(id_am),
    }));
  }, [id_am]);

  const handleModalClose = () => {
    setSectionModel(false);
  };

  const { data: update, refetch } = useGet<any>({
    queryKey: `template/get/${template_id}`,
    endPoint: `template/get/${template_id}`,
    config: {
      enabled: Boolean(editSecModel || editSubSecModel || template_id),
      refetchOnWindowFocus: false,
    },
  });

  useEffect(() => {
    // Currently not in use
    // if (editSecModel || editSubSecModel) {
    //   refetch();
    // }

    // const navigationEntries = window.performance.getEntriesByType(
    //   'navigation'
    // ) as PerformanceNavigationTiming[];
    // const isPageRefreshed =
    //   window.performance?.navigation?.type ===
    //     window.performance?.navigation?.TYPE_RELOAD ||
    //   navigationEntries[0]?.type === 'reload' ||
    //   navigationEntries[0]?.type === 'navigate';
    // if (isPageRefreshed) {
    //   refetch();
    // }
    
      refetch();
  }, [editSecModel, editSubSecModel, refetch]);
  useEffect(() => {
    if (update?.data?.data) {
      setShowTextBox(true);
      setStImg(true);
      setTemplateData((old: any) => {
        const updatedSections = update?.data?.data?.sections?.map(
          (section: any) => {
            const { ...restSection } = section;

            section.items.unshift({ type: null });

            return {
              ...restSection,
              items: section.items,
            };
          }
        );

        return { ...old, sections: updatedSections };
      });
    }
  }, [update?.data?.data]);
  const downloadReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`appraisals/download-report/${id_am}`, {
        responseType: 'blob',
      });
      setLoading(false);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Appraisal-Report.docx');
      document.body.appendChild(link);
      link.click();
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const handleModalCloseSecUpdate = () => {
    seteditSecModel(false);
    seteditSubSecModel(false);
  };

  const editsubSection = (event: any) => {
    seteditSubSecModel(true);
    setId(event);
  };

  if (loading) {
    return (
      <>
        <div className="img-update-loader">
          <img src={loadingImage} />
        </div>
      </>
    );
  }

  const updateFn = async (showToast = true) => {
    try {
      const cleanTemplateData = JSON.parse(JSON.stringify(templateData));
      // Initialize order counter
      let sectionOrderCounter = 1;

      cleanTemplateData.sections.forEach(
        (section: { items: any[]; order: number }) => {
          let itemOrderCounter = 1; // Counter for section items

          // Filter items and increment order for each item in the section
          section.items = section.items.filter((item) => item.type !== null);
          section.items.forEach((item) => {
            // Assign and increment the order
            item.order = itemOrderCounter++;

            // Clean up unnecessary fields
            delete item.submitId;
            delete item.name;
            delete item.id;
            delete item.contents;

            // Handle subsections
            if (item.subsections) {
              let subItemOrderCounter = 1; // Counter for subsection items

              // Filter and assign order for each item in subsections
              item.subsections.items = item.subsections.items.filter(
                (subItem: { type: any }) => subItem.type !== null
              );
              item.subsections.items.forEach(
                (subItem: {
                  id: number;
                  sub_section_id: any;
                  order: number;
                  contents: any;
                }) => {
                  subItem.order = subItemOrderCounter++;
                  subItem.id = Number(subItem.id);
                  delete subItem.sub_section_id;
                  delete subItem.contents;
                }
              );
            }
            delete item.sub_section_id;
          });

          section.order = sectionOrderCounter++;
        }
      );

      const res = await axios.post(
        `template/update-report-template/${template_id}`,
        cleanTemplateData
      );
      if (showToast) {
        toast.success(res.data?.data?.message);
      }
    } catch (error) {
      console.error('Error:', error);
      if (showToast) {
        toast.error('Failed to update the template');
      }
    }
  };

  const editSection = (event: any) => {
    setId(event);
    seteditSecModel(true);
  };

  // Attach updateFn to window for cross-file access
  (window as any).updateFn = updateFn;

  return (
    <>
      <AppraisalMenu>
        <SidebarContainer>
          <div
            ref={wrapperRef}
            className="flex-coloumn w-full report-template-wrapper"
          >
            <Grid container spacing={2}>
              <Grid
                xs={3}
                xl={2}
                className="border-0 border-r border-solid border-[#F2F2F2]"
              >
                <Sidebar
                  onAddSection={onAddSection}
                  sections={templateData?.sections}
                />
              </Grid>
              <Grid xs={9} xl={10} className="p-5">
                <div className="p-5 text-end">
                  <SnippetList />
                </div>

                <div className="max-w-[1138px]">
                  {templateData?.sections?.map((section: any, i: number) => {
                    return (
                      <div key={section.id}>
                        {section.items.map((item: any, index: number) => {
                          console.log(item, 'itemmmm');
                          return (
                            <div key={item.id} className="py-3 relative">
                              <AppraisalSection
                                item={item}
                                index={index}
                                parentIndex={i}
                                template_id={template_id}
                                section_id={section.id}
                                id_am={id_am}
                                secTitle={section.title}
                                editSection={editSection}
                                editsubSection={editsubSection}
                                showTextBox={showTextBox}
                                setShowTextBox={setShowTextBox}
                                stImg={stImg}
                                setStImg={setStImg}
                                setImageModal={setImageModal}
                                imageModal={imageModal}
                                setEditorEvent={setEditorEvent}
                                editorEvent={editorEvent}
                              />
                              {secIds === section.id && editSecModel ? (
                                <CompDeleteModal>
                                  <div className="flex justify-between items-center bg-[#0da1c714] m-2 rounded-md text-gray-500 px-3 py-5">
                                    <Typography
                                      variant="h4"
                                      component="h4"
                                      className="text-xl text-[#0da1c7] font-bold template"
                                    >
                                      Update Section
                                    </Typography>
                                    <ClearIcon
                                      className="text-3xl text-[#0da1c7] cursor-pointer"
                                      onClick={handleModalCloseSecUpdate}
                                    />
                                  </div>
                                  <UpdateSectionReport
                                    template_id={template_id}
                                    seteditSecModel={seteditSecModel}
                                    ids={secIds}
                                    seteditSubSecModel={seteditSubSecModel}
                                    editSecModel={editSecModel}
                                    appraisalSecTitle={section.title}
                                  />
                                </CompDeleteModal>
                              ) : null}

                              {secIds === item.sub_section_id &&
                              editSubSecModel ? (
                                <CompDeleteModal>
                                  <div className="flex justify-between items-center bg-[#0da1c714] m-2 rounded-md text-gray-500 px-3 py-5">
                                    <Typography
                                      variant="h4"
                                      component="h4"
                                      className="text-xl text-[#0da1c7] font-bold template"
                                    >
                                      Update Sub-section
                                    </Typography>
                                    <ClearIcon
                                      className="text-3xl text-[#0da1c7] cursor-pointer"
                                      onClick={handleModalCloseSecUpdate}
                                    />
                                  </div>
                                  <UpdateSectionReport
                                    template_id={template_id}
                                    seteditSecModel={seteditSecModel}
                                    ids={secIds}
                                    seteditSubSecModel={seteditSubSecModel}
                                    editSecModel={editSecModel}
                                    appraisalSecTitle={item?.subsections?.title}
                                  />
                                </CompDeleteModal>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </Grid>

              <div className="fixed bottom-0 border-solid border-t border-0 border-[#e1e1e1] left-0 right-0 flex items-center justify-center py-4 bg-white z-5">
                <div className="inline-block">
                  <CommonButton
                    variant="contained"
                    color="primary"
                    className="bg-customBlue"
                    style={{
                      width: '200px',
                      height: '40px',
                      borderRadius: '5px',
                    }}
                    onClick={downloadReport}
                  >
                    DownLoad Report
                  </CommonButton>
                </div>
                <div className="inline-block">
                  <CommonButton
                    variant="contained"
                    color="primary"
                    className="bg-customBlue"
                    style={{
                      width: '200px',
                      height: '40px',
                      borderRadius: '5px',
                      marginLeft: '20px',
                    }}
                    onClick={() => updateFn(true)}
                  >
                    Save
                  </CommonButton>
                </div>
                <div>
                  {showScrollTop && (
                    <Button
                      id="backToTop"
                      color="primary"
                      onClick={scrollToTop}
                    >
                      ↑
                    </Button>
                  )}
                </div>
              </div>
            </Grid>
          </div>

          {sectionModel ? (
            <CompDeleteModal>
              <div className="flex justify-between items-center bg-[#0da1c714] m-2 rounded-md text-gray-500 px-3 py-5">
                <Typography
                  variant="h4"
                  component="h4"
                  className="text-xl text-[#0da1c7] font-bold template"
                >
                  Create Section
                </Typography>
                <ClearIcon
                  className="text-3xl text-[#0da1c7] cursor-pointer"
                  onClick={handleModalClose}
                />
              </div>
              <CreateSectionReport
                template_id={template_id}
                setSectionModel={setSectionModel}
              />
            </CompDeleteModal>
          ) : null}
        </SidebarContainer>
      </AppraisalMenu>
    </>
  );
};

export default withTemplateProvider(MainScreenAppraisal);
