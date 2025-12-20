import { createContext, useContext, useState } from 'react';

const DirtyContext = createContext<{
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
}>({
  isDirty: false,
  setIsDirty: () => {},
});

export const DirtyProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDirty, setIsDirty] = useState(false);

  return (
    <DirtyContext.Provider value={{ isDirty, setIsDirty }}>
      {children}
    </DirtyContext.Provider>
  );
};

export const useDirty = () => useContext(DirtyContext);
