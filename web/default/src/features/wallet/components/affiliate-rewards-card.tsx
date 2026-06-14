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
import { Gift, History, Share2, TrendingUp, Users, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatNumber, formatQuota } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { CopyButton } from '@/components/copy-button'
import type { AffiliateSummary, UserWalletData } from '../types'

interface AffiliateRewardsCardProps {
  user: UserWalletData | null
  affiliateLink: string
  summary: AffiliateSummary | null
  onTransfer: () => void
  complianceConfirmed?: boolean
  loading?: boolean
}

function maskEmail(email?: string) {
  if (!email) return '-'
  const [name, domain] = email.split('@')
  if (!domain) return email
  return `${name.slice(0, 1)}***@${domain}`
}

export function AffiliateRewardsCard({
  user,
  affiliateLink,
  summary,
  onTransfer,
  complianceConfirmed = true,
  loading,
}: AffiliateRewardsCardProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className='space-y-4'>
        <div className='grid gap-4 md:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className='h-28 rounded-xl' />
          ))}
        </div>
        <Skeleton className='h-72 rounded-xl' />
      </div>
    )
  }

  const rate = summary?.rate ?? user?.aff_commission_rate ?? 0.05
  const pendingQuota = summary?.pending_quota ?? user?.aff_quota ?? 0
  const historyQuota = summary?.history_quota ?? user?.aff_history_quota ?? 0
  const inviteCount = summary?.invite_count ?? user?.aff_count ?? 0
  const affiliateCode = affiliateLink.split('aff=')[1] || ''

  const stats = [
    {
      label: t('My Commission Rate'),
      value: `${(rate * 100).toFixed(0)}%`,
      icon: TrendingUp,
      accent: 'text-orange-700',
    },
    {
      label: t('Invited Users'),
      value: String(inviteCount),
      icon: Users,
      accent: 'text-foreground',
    },
    {
      label: t('Transferable Rewards'),
      value: formatQuota(pendingQuota),
      icon: Wallet,
      accent: 'text-emerald-700',
    },
    {
      label: t('Historical Rewards'),
      value: formatQuota(historyQuota),
      icon: History,
      accent: 'text-foreground',
    },
  ]

  return (
    <div className='space-y-5'>
      <div className='grid gap-4 md:grid-cols-4'>
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <Card
              key={item.label}
              className='rounded-2xl border-border/70 bg-background/95 shadow-sm'
            >
              <CardContent className='p-5'>
                <div className='flex items-center gap-2 text-sm font-medium text-slate-600'>
                  <Icon className='h-4 w-4' />
                  <span>{item.label}</span>
                </div>
                <div className={`mt-4 text-3xl font-bold ${item.accent}`}>
                  {item.value}
                </div>
                {item.label === t('My Commission Rate') && (
                  <p className='mt-2 text-xs leading-relaxed text-slate-500'>
                    {t('Earn this percentage when invited users add funds')}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className='rounded-2xl border-border/70 bg-background/95 shadow-sm'>
        <CardContent className='space-y-6 p-6'>
          <div className='flex flex-col gap-1'>
            <h3 className='text-base font-semibold'>{t('Referral Rewards')}</h3>
            <p className='text-sm text-slate-600'>
              {t('Invite new users and transfer rewards to your balance')}
            </p>
          </div>

          <div className='grid gap-4 lg:grid-cols-[minmax(240px,0.9fr)_minmax(280px,1.1fr)]'>
            <div className='space-y-2'>
              <div className='text-sm font-medium text-slate-600'>
                {t('My Invite Code')}
              </div>
              <div className='flex items-center gap-2'>
                <Input
                  value={affiliateCode}
                  readOnly
                  className='h-11 font-mono text-sm font-semibold'
                />
                <CopyButton
                  value={affiliateCode}
                  variant='outline'
                  className='h-10 shrink-0'
                  tooltip={t('Copy invite code')}
                  aria-label={t('Copy invite code')}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <div className='text-sm font-medium text-slate-600'>
                {t('Referral Link')}
              </div>
              <div className='flex items-center gap-2'>
                <Input
                  value={affiliateLink}
                  readOnly
                  className='h-11 min-w-0 font-mono text-sm'
                />
                <CopyButton
                  value={affiliateLink}
                  variant='outline'
                  className='h-10 shrink-0'
                  tooltip={t('Copy referral link')}
                  aria-label={t('Copy referral link')}
                />
              </div>
            </div>
          </div>

          <div className='rounded-xl border border-orange-200 bg-orange-50/70 p-4 text-sm text-orange-900'>
            <div className='mb-3 flex items-center gap-2 font-semibold'>
              <Gift className='h-4 w-4' />
              {t('How it works')}
            </div>
            <ol className='list-decimal space-y-2 pl-5 leading-6'>
              <li>{t('Share your invite code or referral link with new users.')}</li>
              <li>
                {t(
                  'After an invited user adds funds, you earn {{rate}} commission.',
                  { rate: `${(rate * 100).toFixed(0)}%` }
                )}
              </li>
              <li>{t('Rewards can be transferred to your account balance anytime.')}</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card className='rounded-2xl border-border/70 bg-background/95 shadow-sm'>
        <CardContent className='flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h3 className='text-base font-semibold'>
              {t('Transfer Rewards to Balance')}
            </h3>
            <p className='mt-1 text-sm text-slate-600'>
              {t('Move available referral rewards to your account balance')}
            </p>
            {pendingQuota <= 0 && (
              <p className='mt-3 text-sm font-medium text-orange-700'>
                {t('No transferable rewards available')}
              </p>
            )}
          </div>
          <Button
            onClick={onTransfer}
            disabled={!complianceConfirmed || pendingQuota <= 0}
            className='h-10 shrink-0 bg-orange-600 px-5 hover:bg-orange-700'
          >
            <Wallet className='mr-2 h-4 w-4' />
            {t('Transfer to Balance')}
          </Button>
        </CardContent>
      </Card>

      <div className='grid gap-4 lg:grid-cols-[minmax(280px,0.9fr)_minmax(320px,1.1fr)]'>
        <Card className='rounded-2xl border-border/70 bg-background/95 shadow-sm'>
          <CardContent className='p-5'>
            <h3 className='mb-4 text-base font-semibold'>
              {t('Reward Instructions')}
            </h3>
            <ul className='space-y-3 text-sm leading-6 text-slate-700'>
              <li className='flex gap-2'>
                <span className='mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500' />
                <span>
                  {t('Invite new users to register and earn rewards after they add funds.')}
                </span>
              </li>
              <li className='flex gap-2'>
                <span className='mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500' />
                <span>
                  {t('Rewards can be transferred to your account balance at any time.')}
                </span>
              </li>
              <li className='flex gap-2'>
                <span className='mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500' />
                <span>{t('The more friends you invite, the more rewards you earn.')}</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className='rounded-2xl border-border/70 bg-background/95 shadow-sm'>
          <CardContent className='p-5'>
            <div className='mb-4 flex items-center justify-between gap-3'>
              <h3 className='text-base font-semibold'>
                {t('Commission Overview')}
              </h3>
              <span className='rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700'>
                {t('Enabled')}: {(rate * 100).toFixed(0)}%
              </span>
            </div>
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
              {[
                {
                  label: t('Total Commission'),
                  value: formatQuota(historyQuota),
                },
                {
                  label: t('This Month'),
                  value: formatQuota(summary?.month_quota || 0),
                },
                {
                  label: t('Today'),
                  value: formatQuota(summary?.today_quota || 0),
                },
                {
                  label: t('Commission Users'),
                  value: String(inviteCount),
                },
              ].map((item) => (
                <div key={item.label} className='rounded-xl bg-muted/40 p-4 text-center'>
                  <div className='text-lg font-bold text-slate-900'>{item.value}</div>
                  <div className='mt-1 text-xs text-slate-600'>{item.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 xl:grid-cols-2'>
        <Card className='rounded-2xl border-border/70 bg-background/95 shadow-sm'>
          <CardContent className='p-6'>
            <h3 className='mb-4 text-base font-semibold'>
              {t('Invited Users')}
            </h3>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='text-slate-600'>
                  <tr className='border-b'>
                    <th className='py-3 text-left font-medium'>{t('Email')}</th>
                    <th className='py-3 text-left font-medium'>
                      {t('Username')}
                    </th>
                    <th className='py-3 text-right font-medium'>
                      {t('Rewards')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(summary?.invited_users || []).length > 0 ? (
                    summary?.invited_users.map((item) => (
                      <tr key={item.id} className='border-b last:border-0'>
                        <td className='py-3'>{maskEmail(item.email)}</td>
                        <td className='py-3'>{item.display_name || item.username || '-'}</td>
                        <td className='py-3 text-right text-emerald-700'>
                          {formatQuota(item.aff_history_quota || 0)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className='py-8 text-center text-slate-500'
                      >
                        {t('No invited users yet')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className='rounded-2xl border-border/70 bg-background/95 shadow-sm'>
          <CardContent className='p-6'>
            <div className='mb-4 flex items-center gap-2'>
              <Share2 className='h-4 w-4 text-slate-600' />
              <h3 className='text-base font-semibold'>
                {t('Commission Records')}
              </h3>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='text-slate-600'>
                  <tr className='border-b'>
                    <th className='py-3 text-left font-medium'>
                      {t('Topup Amount')}
                    </th>
                    <th className='py-3 text-left font-medium'>{t('Rate')}</th>
                    <th className='py-3 text-right font-medium'>
                      {t('Commission')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(summary?.records || []).length > 0 ? (
                    summary?.records.map((item) => (
                      <tr key={item.id} className='border-b last:border-0'>
                        <td className='py-3'>${formatNumber(item.topup_amount)}</td>
                        <td className='py-3'>
                          {(item.commission_rate * 100).toFixed(0)}%
                        </td>
                        <td className='py-3 text-right text-emerald-700'>
                          {formatQuota(item.commission_quota)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className='py-8 text-center text-slate-500'
                      >
                        {t('No commission records yet')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
