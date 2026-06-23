/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useTranslation } from 'react-i18next'
import { Copy } from 'lucide-react'
import { SectionPageLayout } from '@/components/layout'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { ApiKeysDialogs } from './components/api-keys-dialogs'
import { ApiKeysPrimaryButtons } from './components/api-keys-primary-buttons'
import { ApiKeysProvider } from './components/api-keys-provider'
import { ApiKeysTable } from './components/api-keys-table'

const API_ENDPOINTS = [
  {
    label: 'Codex API 端点',
    value: 'https://aijuhe.fun/v1',
  },
  {
    label: 'Claude Code API 端点',
    value: 'https://aijuhe.fun',
  },
]

function ApiEndpointShortcuts() {
  const { copyToClipboard } = useCopyToClipboard({
    successMessage: '端点地址已复制',
    errorMessage: '复制失败，请手动复制',
  })

  return (
    <div className='border-border/70 bg-muted/35 flex flex-col gap-2 rounded-lg border px-3 py-2 sm:flex-row sm:items-center sm:justify-between'>
      <div className='text-muted-foreground text-xs font-medium'>
        API 配置端点
      </div>
      <div className='flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end'>
        {API_ENDPOINTS.map((endpoint) => (
          <button
            key={endpoint.value}
            type='button'
            onClick={() => copyToClipboard(endpoint.value)}
            className='border-border/70 bg-background hover:bg-accent hover:text-accent-foreground flex min-w-0 items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors'
            title={`复制 ${endpoint.value}`}
          >
            <span className='text-foreground shrink-0 font-medium'>
              {endpoint.label}
            </span>
            <Tooltip>
              <TooltipTrigger
                render={
                  <span className='text-muted-foreground min-w-0 truncate font-mono'></span>
                }
              >
                {endpoint.value}
              </TooltipTrigger>
              <TooltipContent>
                <p>点击复制此端点</p>
              </TooltipContent>
            </Tooltip>
            <Copy className='text-muted-foreground size-3.5 shrink-0' />
          </button>
        ))}
      </div>
    </div>
  )
}

export function ApiKeys() {
  const { t } = useTranslation()
  return (
    <ApiKeysProvider>
      <SectionPageLayout>
        <SectionPageLayout.Title>{t('API Keys')}</SectionPageLayout.Title>
        <SectionPageLayout.Actions>
          <ApiKeysPrimaryButtons />
        </SectionPageLayout.Actions>
        <SectionPageLayout.Content>
          <ApiEndpointShortcuts />
          <ApiKeysTable />
        </SectionPageLayout.Content>
      </SectionPageLayout>

      <ApiKeysDialogs />
    </ApiKeysProvider>
  )
}
