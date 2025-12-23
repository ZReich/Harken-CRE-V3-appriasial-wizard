import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { styled } from '@mui/system';
import { useParams } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css';
import Sidebar from './sidebar/sidebar';
import Section from './Section';
import CompDeleteModal from '@/components/modal/Comp-delete-modal';
import ClearIcon from '@mui/icons-material/Clear';
import { Typography } from '@mui/material';
import CreateSection from './screen-moals/create-section';
import { Grid } from '@mui/material';
import { useGet } from '@/hook/useGet';
import UpdateSectionReport from '../appraisal/Report/screen-moals/update-section';
import CommonButton from '@/components/elements/button/Button';
import axios from 'axios';
import { toast } from 'react-toastify';
import SnippetList from './snippet';

const SidebarContainer = styled('div')({
  display: 'flex',
  alignItems: 'flex-start',
  marginTop: '15px',
});

const initialTemplateData: any = {
  // id: null,
  sections: [],
};

export const TemplateContext = createContext(initialTemplateData);

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

const MainScreen: React.FC = () => {
  const { template_id } = useParams<{ template_id: string }>();
  const [sectionModel, setSectionModel] = useState(false);

  const [editSecModel, seteditSecModel] = useState(false);
  const [secIds, setId] = useState('');
  const [editSubSecModel, seteditSubSecModel] = useState(false);
  const [fakeModal, setFakeModal] = useState(false);

  const [editorEvent, setEditorEvent] = useState('');
  const [showTextBox, setShowTextBox] = useState(false);
  const [stImg, setStImg] = useState(false);
  const [imageModal, setImageModal] = useState(false);

  const [selectedMap, setSelectedMap] = useState('');

  const [updateSec, setUpdateSec] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const reportScrollRef = useRef<HTMLDivElement | null>(null);
  const sectionElsRef = useRef<Map<string, HTMLElement>>(new Map());
  const rafIdRef = useRef<number | null>(null);

  const { templateData, setTemplateData }: any =
    useContext<any[]>(TemplateContext);

  const onAddSection = () => {
    setSectionModel(true);
  };

  const handleModalClose = () => {
    setSectionModel(false);
  };

  const { data: update, refetch } = useGet<any>({
    queryKey: `template/get/${template_id}`,
    endPoint: `template/get/${template_id}`,
    config: {
      enabled: Boolean(updateSec || editSubSecModel),
      refetchOnWindowFocus: false,
    },
  });

  useEffect(() => {
    if (updateSec || editSubSecModel) {
      refetch();
    }

    const navigationEntries = window.performance.getEntriesByType(
      'navigation'
    ) as PerformanceNavigationTiming[];
    const isPageRefreshed =
      window.performance?.navigation?.type ===
        window.performance?.navigation?.TYPE_RELOAD ||
      navigationEntries[0]?.type === 'reload' ||
      navigationEntries[0]?.type === 'navigate';
    if (isPageRefreshed) {
      refetch();
    }
  }, [updateSec, editSubSecModel, refetch]);

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

  const updateActiveSectionHighlight = useCallback(() => {
    const container = reportScrollRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const viewportCenter = containerRect.top + containerRect.height / 2;

    let bestId: string | null = null;
    let bestVisible = -1;

    sectionElsRef.current.forEach((el, id) => {
      const rect = el.getBoundingClientRect();

      // Visible height of section within the scroll container viewport.
      const visibleTop = Math.max(rect.top, containerRect.top);
      const visibleBottom = Math.min(rect.bottom, containerRect.bottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);

      const containsCenter = rect.top <= viewportCenter && rect.bottom >= viewportCenter;

      if (containsCenter) {
        bestId = id;
        bestVisible = Number.POSITIVE_INFINITY; // lock in
        return;
      }

      if (bestVisible !== Number.POSITIVE_INFINITY && visibleHeight > bestVisible) {
        bestVisible = visibleHeight;
        bestId = id;
      }
    });

    setActiveSectionId((prev) => (prev === bestId ? prev : bestId));
  }, []);

  useEffect(() => {
    const container = reportScrollRef.current;
    if (!container) return;

    const onScroll = () => {
      if (rafIdRef.current !== null) return;
      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null;
        updateActiveSectionHighlight();
      });
    };

    container.addEventListener('scroll', onScroll, { passive: true });

    // Initial highlight after content renders.
    const timeoutId = window.setTimeout(() => {
      updateActiveSectionHighlight();
    }, 100);

    return () => {
      container.removeEventListener('scroll', onScroll as any);
      window.clearTimeout(timeoutId);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [updateActiveSectionHighlight, templateData?.sections?.length]);

  const scrollToSection = useCallback((sectionId: string | number) => {
    const el = sectionElsRef.current.get(String(sectionId));
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const editSection = (event: any) => {
    setId(event);
    seteditSecModel(true);
  };

  const handleModalCloseSecUpdate = () => {
    seteditSecModel(false);
    seteditSubSecModel(false);
  };

  const editsubSection = (event: any) => {
    seteditSubSecModel(true);
    setId(event);
  };

  const updateFn = async () => {
    try {
      const cleanTemplateData = JSON.parse(JSON.stringify(templateData));
      let sectionOrderCounter = 1;
      cleanTemplateData.sections.forEach(
        (section: { items: any[]; order: number }) => {
          let itemOrderCounter = 1;
          section.items = section.items.filter((item) => item.type !== null);
          section.items.forEach((item) => {
            item.order = itemOrderCounter++;
            delete item.submitId;
            delete item.name;
            delete item.id;
            delete item.contents;
            if (item.subsections) {
              let subItemOrderCounter = 1;
              item.subsections.items = item.subsections.items.filter(
                (subItem: { type: any }) => subItem.type !== null
              );
              item.subsections.items.forEach(
                (subItem: {
                  id: number;
                  contents: any;
                  sub_section_id: any;
                  order: number;
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
      if (res.data?.data?.statusCode === 200) {
        toast.success(res.data?.data?.message);
      } else toast.error(res?.data?.message);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  return (
    <SidebarContainer>
      <div
        ref={reportScrollRef}
        className="flex-coloumn w-full report-template-wrapper"
      >
        <Grid container spacing={2}>
          <Grid xs={3} xl={2}>
            <Sidebar
              onAddSection={onAddSection}
              sections={templateData?.sections}
              activeSectionId={activeSectionId}
              onNavigateToSection={scrollToSection}
            />
          </Grid>
          <Grid xs={9} xl={10} className="p-5">
            <div className="text-end">
              <SnippetList />
            </div>
            <div className="max-w-[1038px] rounded p-4">
              {templateData.sections.map((section: any, i: number) => {
                return (
                  <div
                    key={section?.id ?? i}
                    ref={(el) => {
                      const id = section?.id;
                      if (id === undefined || id === null) return;
                      if (el) sectionElsRef.current.set(String(id), el);
                      else sectionElsRef.current.delete(String(id));
                    }}
                  >
                    {section.items.map((item: any, index: number) => {
                      return (
                        <div key={index} className="py-3">
                          <Section
                            item={item}
                            index={index}
                            parentIndex={i}
                            template_id={template_id}
                            section_id={section.id}
                            sectionIdParams={section.id}
                            secTitle={section.title}
                            fakeModal={fakeModal}
                            setFakeModal={setFakeModal}
                            editSection={editSection}
                            editsubSection={editsubSection}
                            editorEvent={editorEvent}
                            setEditorEvent={setEditorEvent}
                            showTextBox={showTextBox}
                            setShowTextBox={setShowTextBox}
                            stImg={stImg}
                            setStImg={setStImg}
                            setImageModal={setImageModal}
                            imageModal={imageModal}
                            selectedMap={selectedMap}
                            setSelectedMap={setSelectedMap}
                          />
                          {secIds == section.id && editSecModel ? (
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
                                secTitle={section.title}
                                updateSec={updateSec}
                                setUpdateSec={setUpdateSec}
                              />
                            </CompDeleteModal>
                          ) : null}
                          {secIds == item.sub_section_id && editSubSecModel ? (
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
                                secTitle={item.subsections.title}
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
        </Grid>
        <div className="fixed bottom-0 left-0 right-0 flex items-center justify-center py-4 bg-white z-5 border-solid border-0 border-[#e1e1e1]">
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
              onClick={updateFn}
            >
              Save
            </CommonButton>
          </div>
        </div>
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
          <CreateSection cond="main-screen" setSectionModel={setSectionModel} />
        </CompDeleteModal>
      ) : null}
    </SidebarContainer>
  );
};

export default withTemplateProvider(MainScreen);
