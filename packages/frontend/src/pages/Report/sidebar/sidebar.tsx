import React, { useEffect, useRef } from 'react';
import { List as MuiList } from '@mui/material';
import { styled } from '@mui/system';
import AddIcon from '../../../images/AddIcons.png';
import SectionItem from './sec-item';

const SidebarWrapper = styled('div')({
  height: 'calc(100vh - 230px)',
  padding: '15px 35px',
  maxWidth: '292px',
  overflowY: 'auto',
});

interface SidebarProps {
  onAddSection: () => void;
  sections: any[];
  activeSectionId?: string | number | null;
  onNavigateToSection?: (sectionId: string | number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  onAddSection,
  sections,
  activeSectionId,
  onNavigateToSection,
}) => {
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (activeSectionId === null || activeSectionId === undefined) return;
    const listEl = listRef.current;
    if (!listEl) return;

    const activeEl = listEl.querySelector(
      `[data-section-id="${String(activeSectionId)}"]`
    ) as HTMLElement | null;

    // Keep highlighted item visible in the sidebar.
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeSectionId]);

  return (
    <>
      <SidebarWrapper>
        <MuiList ref={listRef}>
          {sections?.map((section, i) => (
            <SectionItem
              key={section?.id ?? i}
              item={section}
              activeSectionId={activeSectionId}
              onNavigateToSection={onNavigateToSection}
            />
          ))}
          <div
            onClick={onAddSection}
            className="flex items-center border border-dashed border-customBlue p-2 rounded-md w-full cursor-pointer"
          >
            <span className="ml-2">
              <img
                src={AddIcon}
                alt="AddIcon"
                className="h-[13px] w-[13px]"
              />
            </span>
            <span className="text-customBlue pl-4 text-sm">
              Add New Section
            </span>
          </div>
        </MuiList>
      </SidebarWrapper>
    </>
  );
};

export default Sidebar;
