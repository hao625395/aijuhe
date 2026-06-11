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
import { Fragment, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useStatus } from '@/hooks/use-status'
import { useSystemConfig } from '@/hooks/use-system-config'
import { toast } from 'sonner'

interface FooterLink {
  text: string
  href: string
}

interface FooterColumnProps {
  title: string
  links: FooterLink[]
}

interface FooterProps {
  logo?: string
  name?: string
  columns?: FooterColumnProps[]
  copyright?: string
  className?: string
}

const NEW_API_FOOTER_ATTRIBUTION_KEY = [
  'footer',
  'new' + 'api',
  'projectAttributionSuffix',
].join('.')

// Renders User Agreement / Privacy Policy links inline with the parent's
// copyright row when either is configured in System Settings → Site. Emits
// fragmented siblings so the parent flex container's gap controls spacing.
function LegalLinks(props: { leadingSeparator?: boolean }) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const items: { key: string; label: string; href: string }[] = []
  if (status?.user_agreement_enabled) {
    items.push({
      key: 'user-agreement',
      label: t('User Agreement'),
      href: '/user-agreement',
    })
  }
  if (status?.privacy_policy_enabled) {
    items.push({
      key: 'privacy-policy',
      label: t('Privacy Policy'),
      href: '/privacy-policy',
    })
  }
  if (items.length === 0) {
    return null
  }
  return (
    <>
      {items.map((item, index) => (
        <Fragment key={item.key}>
          {(props.leadingSeparator || index > 0) && (
            <span aria-hidden='true' className='text-muted-foreground/30'>
              ·
            </span>
          )}
          <Link
            to={item.href}
            className='hover:text-foreground transition-colors duration-200'
          >
            {item.label}
          </Link>
        </Fragment>
      ))}
    </>
  )
}

// inline=true returns just the inner span for composition in a parent flex
// row. inline=false wraps in a centered/right-aligned div (default).
function ProjectAttribution(props: { currentYear: number; inline?: boolean }) {
  const { t } = useTranslation()
  const content = (
    <span className='text-muted-foreground/45'>
      &copy; {props.currentYear}{' '}
      <a
        href='https://github.com/QuantumNous/new-api'
        target='_blank'
        rel='noopener noreferrer'
        className='text-foreground/70 hover:text-foreground font-medium transition-colors'
      >
        {t('New API')}
      </a>
      . {t(NEW_API_FOOTER_ATTRIBUTION_KEY)}
    </span>
  )
  if (props.inline) {
    return content
  }
  return (
    <div className='text-muted-foreground/45 text-center text-xs sm:text-right'>
      {content}
    </div>
  )
}

export function Footer(props: FooterProps) {
  const { t } = useTranslation()
  const {
    systemName,
    logo: systemLogo,
  } = useSystemConfig()

  const displayLogo = systemLogo || props.logo || '/logo.png'
  const displayName = systemName || props.name || 'New API'
  const currentYear = new Date().getFullYear()

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label}已复制：${text}`)
    }).catch(() => {
      toast.error('复制失败，请手动复制')
    })
  }

  return (
    <footer
      className={cn('border-border/40 relative z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60', props.className)}
    >
      <div className='mx-auto max-w-6xl px-6 py-12 md:py-16'>
        <div className='grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8'>
          {/* 左侧 Brand 区域 */}
          <div className='col-span-1 md:col-span-4 flex flex-col items-start gap-2.5'>
            <Link to='/' className='group flex items-center gap-2.5'>
              <img
                src='/logo-footer.png?v=20260608'
                alt={displayName}
                style={{ height: '62px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>
            <p className='text-muted-foreground/80 text-sm leading-relaxed max-w-[280px]'>
              {t('一个key，连接全球顶尖AI模型')}
            </p>
          </div>

          {/* 右侧 5 列导航 */}
          <div className='col-span-1 md:col-span-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8'>
            {/* 友情链接 */}
            <div>
              <p className='text-foreground mb-4 text-sm font-semibold'>{t('友情链接')}</p>
              <ul className='space-y-3 text-sm'>
                <li>
                  <a
                    href='https://link3.cc/qukuai66'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-muted-foreground hover:text-foreground transition-colors'
                  >
                    {t('区块捕手聚合')}
                  </a>
                </li>
              </ul>
            </div>

            {/* 产品 */}
            <div>
              <p className='text-foreground mb-4 text-sm font-semibold'>{t('产品')}</p>
              <ul className='space-y-3 text-sm'>
                <li>
                  <a
                    href='/#intro'
                    className='text-muted-foreground hover:text-foreground transition-colors'
                  >
                    {t('aijuhe介绍')}
                  </a>
                </li>
                <li>
                  <Link
                    to='/pricing'
                    className='text-muted-foreground hover:text-foreground transition-colors'
                  >
                    {t('模型广场')}
                  </Link>
                </li>
                <li>
                  <a
                    href='/#pricing-section'
                    className='text-muted-foreground hover:text-foreground transition-colors'
                  >
                    {t('定价方案')}
                  </a>
                </li>
              </ul>
            </div>

            {/* 帮助与支持 */}
            <div>
              <p className='text-foreground mb-4 text-sm font-semibold'>{t('帮助与支持')}</p>
              <ul className='space-y-3 text-sm'>
                <li>
                  <Link
                    to='/docs'
                    className='text-muted-foreground hover:text-foreground transition-colors'
                  >
                    {t('使用教程')}
                  </Link>
                </li>
                <li>
                  <Link
                    to='/docs'
                    className='text-muted-foreground hover:text-foreground transition-colors'
                  >
                    {t('API 文档')}
                  </Link>
                </li>
                <li>
                  <a
                    href='/docs?id=contact-customer-service'
                    className='text-muted-foreground hover:text-foreground transition-colors'
                  >
                    {t('联系我们')}
                  </a>
                </li>
                <li>
                  <a
                    href='/docs?id=agent-merchant'
                    className='text-muted-foreground hover:text-foreground transition-colors'
                  >
                    {t('代理加盟')}
                  </a>
                </li>
              </ul>
            </div>

            {/* 联系方式 */}
            <div>
              <p className='text-foreground mb-4 text-sm font-semibold'>{t('联系方式')}</p>
              <ul className='space-y-3 text-sm'>
                <li>
                  <button
                    onClick={() => handleCopy('leohoo8', t('邮箱'))}
                    className='text-muted-foreground hover:text-foreground transition-colors text-left bg-transparent p-0 border-0 cursor-pointer block w-full'
                  >
                    {t('邮箱')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleCopy('block668', t('微信'))}
                    className='text-muted-foreground hover:text-foreground transition-colors text-left bg-transparent p-0 border-0 cursor-pointer block w-full'
                  >
                    {t('微信')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleCopy('775860198', t('QQ交流群'))}
                    className='text-muted-foreground hover:text-foreground transition-colors text-left bg-transparent p-0 border-0 cursor-pointer block w-full'
                  >
                    {t('QQ交流群')}
                  </button>
                </li>
                <li>
                  <a
                    href='https://x.com/qukuai66'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-muted-foreground hover:text-foreground transition-colors block w-full'
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href='https://discord.com/invite/hfudanAKCg'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-muted-foreground hover:text-foreground transition-colors block w-full'
                  >
                    Discord
                  </a>
                </li>
              </ul>
            </div>

            {/* 法律 & 安全 */}
            <div>
              <p className='text-foreground mb-4 text-sm font-semibold'>{t('法律 & 安全')}</p>
              <ul className='space-y-3 text-sm'>
                <li>
                  <Link
                    to='/legal/terms'
                    className='text-muted-foreground hover:text-foreground transition-colors'
                  >
                    {t('服务条款')}
                  </Link>
                </li>
                <li>
                  <Link
                    to='/legal/supported-regions'
                    className='text-muted-foreground hover:text-foreground transition-colors'
                  >
                    {t('支持的国家和地区')}
                  </Link>
                </li>
                <li>
                  <Link
                    to='/legal/usage-policy'
                    className='text-muted-foreground hover:text-foreground transition-colors'
                  >
                    {t('使用政策')}
                  </Link>
                </li>
                <li>
                  <Link
                    to='/legal/service-specific-terms'
                    className='text-muted-foreground hover:text-foreground transition-colors'
                  >
                    {t('服务特定条款')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 版权和协议 */}
        <div className='border-border/30 mt-12 flex flex-col items-center justify-between gap-x-3 gap-y-2 border-t pt-6 sm:flex-row'>
          <div className='text-muted-foreground/45 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs sm:justify-start'>
            <span>
              &copy; {currentYear} {displayName}. All rights reserved.
            </span>
            <LegalLinks leadingSeparator />
          </div>
          <ProjectAttribution currentYear={currentYear} />
        </div>
      </div>
    </footer>
  )
}
