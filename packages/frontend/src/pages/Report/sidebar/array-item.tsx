import React from 'react';

interface ArrayItemProps {
  elem: any;
  key: any;
}

const ArrayItem: React.FC<ArrayItemProps> = ({ elem }: any) => {
  return (
    <>
      {elem.type == 'subsection' ? (
        <div className="px-3 pb-2 flex gap-3 pl-9">
          <span className="capitalize text-base text-[#0da1c7]">
            {elem?.subsections?.title ? elem?.subsections?.title : elem?.title}
          </span>
        </div>
      ) : null}
    </>
  );
};

export default ArrayItem;
