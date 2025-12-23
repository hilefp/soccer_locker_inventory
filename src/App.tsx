import { ThemeProvider } from 'next-themes';
import { BrowserRouter } from 'react-router-dom';
import { LoadingBarContainer } from 'react-top-loading-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/shared/components/ui/sonner';
import { ModulesProvider } from './routing/modules-provider';
import { queryClient } from '@/shared/lib/query-client';
import { PWAUpdatePrompt } from '@/shared/components/pwa-update-prompt';

const { BASE_URL } = import.meta.env;

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PWAUpdatePrompt />
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        storageKey="vite-theme"
        enableSystem
        disableTransitionOnChange
        enableColorScheme
      >
          <LoadingBarContainer>
            <BrowserRouter basename={BASE_URL}>
              <Toaster />
              <ModulesProvider />
            </BrowserRouter>
          </LoadingBarContainer>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
