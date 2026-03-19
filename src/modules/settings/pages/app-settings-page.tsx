'use client';

import { AppSettingsListTable } from '../components/app-settings-list-table';
import { useAppSettings } from '../hooks/use-app-settings';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

export function AppSettingsPage() {
  useDocumentTitle('Configurations');

  const { data: settings = [], isLoading, error } = useAppSettings();

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-xl font-semibold text-foreground">Configurations</h3>
          <span className="text-sm text-muted-foreground">
            {isLoading
              ? 'Loading settings...'
              : error
                ? `Error loading settings: ${error.message}`
                : `${settings.length} settings found.`}
          </span>
        </div>
      </div>

      <AppSettingsListTable
        settings={settings}
        isLoading={isLoading}
        error={error?.message || null}
      />
    </div>
  );
}
