/*
Copyright (C) 2025 QuantumNous

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

import React from 'react';
import { Tooltip, Typography } from '@douyinfe/semi-ui';
import { Copy, Key, Zap } from 'lucide-react';
import CompactModeToggle from '../../common/ui/CompactModeToggle';
import { copy, showError, showSuccess } from '../../../helpers';

const { Text } = Typography;

const TokensDescription = ({ compactMode, setCompactMode, t }) => {
  const endpoints = [
    {
      label: 'Codex API 端点',
      value: 'https://aijuhe.fun/v1',
      isDefault: true,
    },
    {
      label: 'Claude Code API 端点',
      value: 'https://aijuhe.fun',
      isDefault: false,
    },
  ];

  const handleCopyEndpoint = async (endpoint) => {
    const ok = await copy(endpoint.value);
    if (ok) {
      showSuccess(t('已复制：{{name}}', { name: endpoint.label }));
    } else {
      showError(t('复制失败，请手动复制'));
    }
  };

  return (
    <div className='flex flex-col gap-2 w-full'>
      <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 w-full'>
        <div className='flex items-center text-blue-500 shrink-0'>
          <Key size={16} className='mr-2' />
          <Text>{t('令牌管理')}</Text>
        </div>

        <div className='flex flex-wrap items-center gap-2 min-w-0 flex-1 lg:justify-center'>
          {endpoints.map((endpoint) => (
            <button
              key={endpoint.value}
              type='button'
              className='group flex h-7 max-w-full items-center gap-2 rounded-md border px-2.5 text-xs transition-all hover:-translate-y-px hover:shadow-sm'
              style={{
                borderColor: endpoint.isDefault ? '#fed7aa' : '#e2e8f0',
                backgroundColor: endpoint.isDefault ? '#fff7ed' : '#ffffff',
                color: '#334155',
              }}
              onClick={() => handleCopyEndpoint(endpoint)}
            >
              <span className='shrink-0 font-medium'>{endpoint.label}</span>
              {endpoint.isDefault && (
                <span
                  className='shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none'
                  style={{ backgroundColor: '#ffedd5', color: '#ea580c' }}
                >
                  {t('默认')}
                </span>
              )}
              <span
                className='h-3 w-px shrink-0'
                style={{ backgroundColor: '#cbd5e1' }}
              />
              <span className='min-w-0 truncate font-mono'>
                {endpoint.value}
              </span>
              <Tooltip content={t('点击复制此端点')} position='top'>
                <Copy
                  size={13}
                  className='shrink-0 opacity-60 transition-opacity group-hover:opacity-100'
                />
              </Tooltip>
              <Zap
                size={13}
                className='shrink-0 opacity-60 transition-opacity group-hover:opacity-100'
              />
            </button>
          ))}
        </div>

        <CompactModeToggle
          compactMode={compactMode}
          setCompactMode={setCompactMode}
          t={t}
        />
      </div>
    </div>
  );
};

export default TokensDescription;
