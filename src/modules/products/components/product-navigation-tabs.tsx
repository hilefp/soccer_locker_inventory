import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

export function ProductNavigationTabs() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine the active tab based on the current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/products' || path === '/products/') {
      return '/products';
    } else if (path.startsWith('/products/categories')) {
      return '/products/categories';
    } else if (path.startsWith('/products/variants')) {
      return '/products/variants';
    } else if (path.startsWith('/products/attributes')) {
      return '/products/attributes';
    }
    return '/products';
  };

  const handleTabChange = (value: string) => {
    navigate(value);
  };

  return (
    <Tabs value={getActiveTab()} onValueChange={handleTabChange}>
      <TabsList variant="line" size="md">
        <TabsTrigger value="/products">Products</TabsTrigger>
        <TabsTrigger value="/products/categories">Categories</TabsTrigger>
        <TabsTrigger value="/products/variants">Variants</TabsTrigger>
        <TabsTrigger value="/products/attributes">Attributes</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
