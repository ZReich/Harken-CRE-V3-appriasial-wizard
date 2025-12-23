import React from 'react';
import ArrayItem from './array-item';

const SectionItem: React.FC<any> = ({
  item,
  activeSectionId,
  onNavigateToSection,
}: any) => {
  const sectionId = item?.id;
  const isActive =
    activeSectionId !== null &&
    activeSectionId !== undefined &&
    sectionId !== null &&
    sectionId !== undefined &&
    String(activeSectionId) === String(sectionId);

  return (
    <div
      data-section-id={sectionId !== undefined ? String(sectionId) : undefined}
    >
      <div
        className={`py-3 flex gap-3 px-2 cursor-pointer ${isActive ? 'bg-[rgba(13,161,199,0.08)] rounded' : ''}`}
        onClick={() => {
          if (sectionId === undefined || sectionId === null) return;
          onNavigateToSection?.(sectionId);
        }}
      >
        <span
          className={`text-base uppercase ps-3 border-0 border-solid ${isActive ? 'font-bold text-[#0DA1C7] border-l-[3px] border-[#0DA1C7]' : 'font-bold border-l-2 border-[#0DA1C7]'}`}
        >
          {item?.title}
        </span>
      </div>
      {item?.items.map((elem: any, index: any) => {
        return <ArrayItem key={index} elem={elem} />;
      })}
    </div>
  );
};

export default SectionItem;
