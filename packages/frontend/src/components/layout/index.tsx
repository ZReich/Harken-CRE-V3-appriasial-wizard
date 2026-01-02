import { DirtyProvider } from '@/pages/evaluation/overview/dirty-state-context';
import Header from '../header';

export const Layout = ({ children }: React.PropsWithChildren) => {
  return (
    <DirtyProvider>
      <div 
        className="min-h-screen"
        style={{ 
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
        }}
      >
        <div className="sticky top-0 z-50">
          <Header />
        </div>
        <main>{children}</main>
      </div>
    </DirtyProvider>
  );
};
