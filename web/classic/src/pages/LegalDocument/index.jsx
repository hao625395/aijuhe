/*
Copyright (C) 2026 QuantumNous

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

import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Typography, Card, Button } from '@douyinfe/semi-ui';
import { IconArrowLeft } from '@douyinfe/semi-icons';
import { useTranslation } from 'react-i18next';
import MarkdownRenderer from '../../components/common/markdown/MarkdownRenderer';
import {
  TERMS_MD,
  USAGE_POLICY_MD,
  SUPPORTED_REGIONS_MD,
  SERVICE_SPECIFIC_TERMS_MD,
} from './constants';

const { Title } = Typography;

const LegalDocument = () => {
  const { docId } = useParams();
  const { t } = useTranslation();

  const docData = useMemo(() => {
    switch (docId) {
      case 'terms':
        return {
          title: t('服务条款'),
          content: TERMS_MD,
        };
      case 'usage-policy':
        return {
          title: t('使用政策'),
          content: USAGE_POLICY_MD,
        };
      case 'supported-regions':
        return {
          title: t('支持的国家和地区'),
          content: SUPPORTED_REGIONS_MD,
        };
      case 'service-specific-terms':
        return {
          title: t('服务特定条款'),
          content: SERVICE_SPECIFIC_TERMS_MD,
        };
      default:
        return {
          title: t('未找到文档'),
          content: t('抱歉，您访问的法律条款页面不存在。'),
        };
    }
  }, [docId, t]);

  return (
    <div className='classic-page-fill bg-[#FAF6F0] min-h-screen pt-28 pb-12 px-4 sm:px-6 lg:px-8 overflow-y-auto'>
      <div className='max-w-4xl mx-auto'>
        {/* 返回首页按钮 */}
        <div className='mb-6'>
          <Link to='/'>
            <Button
              icon={<IconArrowLeft />}
              theme='light'
              type='secondary'
              style={{
                borderRadius: '12px',
                borderColor: '#D4C3B3',
                color: '#8C6239',
                backgroundColor: '#white',
              }}
            >
              {t('返回首页')}
            </Button>
          </Link>
        </div>

        {/* 条款内容卡片 */}
        <Card
          bodyStyle={{ padding: '40px' }}
          style={{
            borderRadius: '24px',
            border: '1px solid #EFECE6',
            boxShadow: '0 4px 20px rgba(140, 98, 57, 0.05)',
            backgroundColor: '#white',
          }}
        >
          <div className='prose prose-lg max-w-none text-[#2E271D]'>
            <MarkdownRenderer content={docData.content} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LegalDocument;
