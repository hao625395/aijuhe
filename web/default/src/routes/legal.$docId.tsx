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

import React, { useMemo } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Markdown } from '@/components/ui/markdown'
import { PublicLayout } from '@/components/layout'
import {
  TERMS_MD,
  USAGE_POLICY_MD,
  SUPPORTED_REGIONS_MD,
  SERVICE_SPECIFIC_TERMS_MD,
} from '@/features/legal/constants'

function LegalDocumentView() {
  const { docId } = Route.useParams()
  const { t } = useTranslation()

  const docData = useMemo(() => {
    switch (docId) {
      case 'terms':
        return {
          title: t('服务条款'),
          content: TERMS_MD,
        }
      case 'usage-policy':
        return {
          title: t('使用政策'),
          content: USAGE_POLICY_MD,
        }
      case 'supported-regions':
        return {
          title: t('支持的国家和地区'),
          content: SUPPORTED_REGIONS_MD,
        }
      case 'service-specific-terms':
        return {
          title: t('服务特定条款'),
          content: SERVICE_SPECIFIC_TERMS_MD,
        }
      default:
        return {
          title: t('未找到文档'),
          content: t('抱歉，您访问的法律条款页面不存在。'),
        }
    }
  }, [docId, t])

  return (
    <PublicLayout>
      <div className='mx-auto max-w-4xl space-y-6 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='mb-6'>
          <Button variant='outline' render={<Link to='/' />}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            {t('返回首页')}
          </Button>
        </div>

        <Card className='border border-border bg-card shadow-sm p-6 md:p-10 rounded-2xl'>
          <CardContent className='prose prose-neutral dark:prose-invert max-w-none text-foreground leading-relaxed'>
            <h1 className='text-3xl font-semibold tracking-tight mb-6'>{docData.title}</h1>
            <Markdown>{docData.content}</Markdown>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  )
}

export const Route = createFileRoute('/legal/$docId')({
  component: LegalDocumentView,
})
