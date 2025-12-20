import React, { ReactNode } from 'react';

const Heading: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <>
            <h2>{children}</h2>
        </>
    )
}

export default Heading;
