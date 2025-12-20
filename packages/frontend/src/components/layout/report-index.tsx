// import Header from '../header';

// export const Layout = ({ children }: React.PropsWithChildren) => {
//     return (
//         <>
//             <div className='sticky top-0 z-50'>
//                 <Header />
//             </div>

//             {children}
//         </>
//     )
// }
import { DirtyProvider } from '@/pages/evaluation/overview/dirty-state-context';
import ReportHeader from '../header/report-header-index';
export const ReportLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <DirtyProvider>
      <div className="sticky top-0 z-50">
        <ReportHeader />
      </div>
      {children}
    </DirtyProvider>
  );
};
