import { LayoutProvider } from './components/context';
import { Main } from './components/main';

export function DefaultLayout() {
  return (
    <>
      <LayoutProvider>
        <Main />
      </LayoutProvider>
    </>
  );
}
