import React from 'react';
import { MuiProvider } from './MuiProvider';
import { ClientProvider } from './query';

type Props = {
  children: React.ReactNode;
};

export function AppProvider({ children }: Props) {
  return (
    <>
      <MuiProvider>
          <ClientProvider>{children}</ClientProvider>
      </MuiProvider>
    </>
  );
}
