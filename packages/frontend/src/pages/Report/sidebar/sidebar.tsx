import React from 'react';
import { List as MuiList } from '@mui/material';
import { styled } from '@mui/system';
import AddIcon from '../../../images/AddIcons.png';
import SectionItem from './sec-item';

const SidebarWrapper = styled('div')({
  height: 'calc(100vh - 230px)',
  padding: '15px 35px',
  maxWidth: '292px',
});

interface SidebarProps {
  onAddSection: () => void;
  sections: { title: string }[];
}

const Sidebar: React.FC<SidebarProps> = ({ onAddSection, sections }) => {
  return (
    <>
      <SidebarWrapper>
        <MuiList>
          {sections?.map((section, i) => (
            <>
              <SectionItem key={i} item={section} />
            </>
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
