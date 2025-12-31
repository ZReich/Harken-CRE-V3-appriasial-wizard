import React from 'react';
import ArrayItem from './sidebar/array-item';

interface SectionItemProps {
    item: string;
    array: string[];
}

const SectionItem: React.FC<SectionItemProps> = ({ item, array }) => {
    return (
        <div>
            <div className='font-bold text-center'>
                {item}
            </div>
            {array.map((elem, index) => (
                <ArrayItem key={index} elem={elem} />
            ))}
        </div>
    );
};

export default SectionItem;
