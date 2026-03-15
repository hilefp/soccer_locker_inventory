import { RouteObject } from 'react-router-dom';
import { TagListPage } from './pages/tag-list-page';

export const tagsRoutes: RouteObject = {
  path: '',
  children: [
    {
      path: '',
      element: <TagListPage />,
    },
  ],
};
