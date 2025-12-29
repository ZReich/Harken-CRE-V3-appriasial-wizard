// @ts-nocheck - Legacy file using old react-query, not actively used
import { QueryClient, QueryClientProvider } from 'react-query';

type Props = {
  children: React.ReactNode;
};

const queryClient = new QueryClient();

export function ClientProvider({ children }: Props) {
  // queryClient.refetchQueries()
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
