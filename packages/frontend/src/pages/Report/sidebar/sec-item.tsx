import React from 'react';
import ArrayItem from './array-item';

const SectionItem: React.FC<any> = ({ item }: any) => {
  return (
    <div>
      <div className="py-3 flex gap-3">
        <span className="font-bold text-base uppercase border-0 border-l-2 border-solid border-[#0DA1C7] ps-3">
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
