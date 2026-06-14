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
import { Avatar, Typography, Card, Button, Input, Space, Tag } from '@douyinfe/semi-ui';
import {
  Copy,
  Users,
  BarChart2,
  TrendingUp,
  Gift,
  Wallet,
  Share2,
} from 'lucide-react';

const { Text } = Typography;

function maskEmail(email) {
  if (!email) return '-';
  const [name, domain] = email.split('@');
  if (!domain) return email;
  return `${name.slice(0, 1)}***@${domain}`;
}

const InvitationCard = ({
  t,
  userState,
  renderQuota,
  setOpenTransfer,
  affLink,
  affSummary,
  handleAffLinkClick,
  complianceConfirmed = true,
}) => {
  const rate = affSummary?.rate ?? userState?.user?.aff_commission_rate ?? 0.05;
  const pendingQuota = affSummary?.pending_quota ?? userState?.user?.aff_quota ?? 0;
  const historyQuota =
    affSummary?.history_quota ?? userState?.user?.aff_history_quota ?? 0;
  const inviteCount = affSummary?.invite_count ?? userState?.user?.aff_count ?? 0;
  const inviteCode = affLink?.split('aff=')?.[1] || '';
  const invitedUsers = affSummary?.invited_users || [];
  const records = affSummary?.records || [];

  const stats = [
    {
      label: t('我的返佣比例'),
      value: `${(rate * 100).toFixed(0)}%`,
      icon: TrendingUp,
      color: '#b45309',
    },
    {
      label: t('邀请人数'),
      value: String(inviteCount),
      icon: Users,
      color: '#0f172a',
    },
    {
      label: t('可划转奖励'),
      value: renderQuota(pendingQuota),
      icon: Wallet,
      color: '#047857',
    },
    {
      label: t('历史奖励'),
      value: renderQuota(historyQuota),
      icon: BarChart2,
      color: '#0f172a',
    },
  ];

  return (
    <Card className='!rounded-2xl shadow-sm border-0'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center'>
          <Avatar size='small' color='green' className='mr-3 shadow-md'>
            <Gift size={16} />
          </Avatar>
          <div>
            <Typography.Text className='text-lg font-medium'>
              {t('邀请奖励')}
            </Typography.Text>
            <div className='text-xs'>{t('邀请好友获得额外奖励')}</div>
          </div>
        </div>
        <Tag color='orange' size='large'>
          {t('默认返佣')} 5%
        </Tag>
      </div>

      <Space vertical style={{ width: '100%' }} size='medium'>
        <div className='grid grid-cols-2 gap-3'>
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className='rounded-xl border bg-white p-3'
                style={{
                  borderColor: '#e5e7eb',
                  boxShadow: '0 6px 18px rgba(15, 23, 42, 0.06)',
                }}
              >
                <div className='flex items-center gap-1.5 text-xs text-slate-500'>
                  <Icon size={14} />
                  <span>{item.label}</span>
                </div>
                <div
                  className='mt-2 text-xl font-black'
                  style={{ color: item.color }}
                >
                  {item.value}
                </div>
              </div>
            );
          })}
        </div>

        <Card
          className='!rounded-xl w-full'
          bodyStyle={{ padding: 14 }}
          cover={
            <div
              className='relative h-28'
              style={{
                '--palette-primary-darkerChannel': '0 75 80',
                backgroundImage: `linear-gradient(0deg, rgba(var(--palette-primary-darkerChannel) / 80%), rgba(var(--palette-primary-darkerChannel) / 80%)), url('/cover-4.webp')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div className='relative z-10 h-full flex items-center justify-between p-4'>
                <div>
                  <Text strong style={{ color: 'white', fontSize: 16 }}>
                    {t('邀请收益')}
                  </Text>
                  <div className='mt-2 text-xs text-white/80'>
                    {t('好友充值后自动按返佣比例发放到可划转奖励')}
                  </div>
                </div>
                <Button
                  type='primary'
                  theme='solid'
                  size='small'
                  disabled={!complianceConfirmed || pendingQuota <= 0}
                  onClick={() => setOpenTransfer(true)}
                  className='!rounded-lg'
                >
                  <Wallet size={12} className='mr-1' />
                  {t('划转到余额')}
                </Button>
              </div>
            </div>
          }
        >
          {!complianceConfirmed && (
            <Text type='tertiary' className='mb-3 block text-xs'>
              {t('邀请奖励划转已禁用，管理员需先确认合规声明。')}
            </Text>
          )}

          <div className='space-y-3'>
            <Input
              value={inviteCode}
              readOnly
              className='!rounded-lg'
              prefix={t('邀请码')}
              suffix={
                <Button
                  type='tertiary'
                  theme='borderless'
                  onClick={() => {
                    if (inviteCode) navigator.clipboard?.writeText(inviteCode);
                  }}
                  icon={<Copy size={14} />}
                >
                  {t('复制')}
                </Button>
              }
            />
            <Input
              value={affLink}
              readOnly
              className='!rounded-lg'
              prefix={t('邀请链接')}
              suffix={
                <Button
                  type='primary'
                  theme='solid'
                  onClick={handleAffLinkClick}
                  icon={<Copy size={14} />}
                  className='!rounded-lg'
                >
                  {t('复制')}
                </Button>
              }
            />
          </div>
        </Card>

        <div className='rounded-xl border bg-orange-50/70 p-4 text-sm text-orange-900'>
          <div className='mb-2 flex items-center gap-2 font-bold'>
            <Gift size={15} />
            {t('奖励规则')}
          </div>
          <ol className='m-0 space-y-1 pl-5'>
            <li>{t('分享邀请码或邀请链接给新用户。')}</li>
            <li>
              {t('受邀用户充值后，您可获得 {{rate}} 返佣。', {
                rate: `${(rate * 100).toFixed(0)}%`,
              })}
            </li>
            <li>{t('返佣奖励可随时划转到账户余额。')}</li>
          </ol>
        </div>

        <div className='grid grid-cols-1 xl:grid-cols-2 gap-3'>
          <Card
            className='!rounded-xl'
            title={<Text strong>{t('受邀用户')}</Text>}
            bodyStyle={{ padding: 0 }}
          >
            <div className='max-h-56 overflow-auto'>
              {invitedUsers.length > 0 ? (
                invitedUsers.map((item) => (
                  <div
                    key={item.id}
                    className='flex items-center justify-between border-b px-3 py-2 text-xs last:border-b-0'
                  >
                    <div>
                      <div className='font-medium'>
                        {item.display_name || item.username || '-'}
                      </div>
                      <div className='text-slate-500'>{maskEmail(item.email)}</div>
                    </div>
                    <div className='text-right text-emerald-700'>
                      {renderQuota(item.aff_history_quota || 0)}
                    </div>
                  </div>
                ))
              ) : (
                <div className='py-8 text-center text-xs text-slate-500'>
                  {t('暂无受邀用户')}
                </div>
              )}
            </div>
          </Card>

          <Card
            className='!rounded-xl'
            title={
              <span className='flex items-center gap-2'>
                <Share2 size={14} />
                <Text strong>{t('返佣记录')}</Text>
              </span>
            }
            bodyStyle={{ padding: 0 }}
          >
            <div className='max-h-56 overflow-auto'>
              {records.length > 0 ? (
                records.map((item) => (
                  <div
                    key={item.id}
                    className='flex items-center justify-between border-b px-3 py-2 text-xs last:border-b-0'
                  >
                    <div>
                      <div className='font-medium'>
                        ${Number(item.topup_amount || 0).toFixed(2)}
                      </div>
                      <div className='text-slate-500'>
                        {(Number(item.commission_rate || 0) * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className='text-right text-emerald-700'>
                      {renderQuota(item.commission_quota || 0)}
                    </div>
                  </div>
                ))
              ) : (
                <div className='py-8 text-center text-xs text-slate-500'>
                  {t('暂无返佣记录')}
                </div>
              )}
            </div>
          </Card>
        </div>
      </Space>
    </Card>
  );
};

export default InvitationCard;
