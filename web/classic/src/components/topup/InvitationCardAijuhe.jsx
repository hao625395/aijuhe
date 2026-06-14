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
import { Avatar, Button, Card, Input, Tag, Typography } from '@douyinfe/semi-ui';
import { Copy, Gift, History, TrendingUp, Users, Wallet } from 'lucide-react';

const { Text } = Typography;

function maskEmail(email) {
  if (!email) return '-';
  const [name, domain] = email.split('@');
  if (!domain) return email;
  return `${name.slice(0, 1)}***@${domain}`;
}

function formatTime(value) {
  const timestamp = Number(value || 0);
  if (!timestamp) return '-';
  const date = new Date(timestamp * 1000);
  const pad = (num) => String(num).padStart(2, '0');
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
}

const statCardStyle = {
  borderColor: '#e2e8f0',
  background: 'rgba(255,255,255,0.95)',
  boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)',
};

const InvitationCardAijuhe = ({
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
  const commissionByInvitee = records.reduce((acc, record) => {
    const key = record.invitee_id;
    if (key) {
      acc[key] = (acc[key] || 0) + Number(record.commission_quota || 0);
    }
    return acc;
  }, {});

  const stats = [
    {
      label: '我的返佣比例',
      value: `${(rate * 100).toFixed(0)}%`,
      icon: TrendingUp,
      color: '#b45309',
    },
    {
      label: '邀请人数',
      value: String(inviteCount),
      icon: Users,
      color: '#0f172a',
    },
    {
      label: '可划转奖励',
      value: renderQuota(pendingQuota),
      icon: Wallet,
      color: '#047857',
    },
    {
      label: '历史奖励',
      value: renderQuota(historyQuota),
      icon: History,
      color: '#0f172a',
    },
  ];

  const copyInviteCode = () => {
    if (inviteCode) navigator.clipboard?.writeText(inviteCode);
  };

  return (
    <Card className='!rounded-2xl shadow-sm border-0'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center'>
          <Avatar size='small' color='green' className='mr-3 shadow-md'>
            <Gift size={16} />
          </Avatar>
          <div>
            <Typography.Text className='text-lg font-medium'>邀请奖励</Typography.Text>
            <div className='text-xs' style={{ color: '#475569' }}>
              邀请好友获得额外奖励
            </div>
          </div>
        </div>
        <Tag color='orange' size='large'>
          默认返佣 5%
        </Tag>
      </div>

      <div className='space-y-3'>
        <div className='grid grid-cols-4 gap-3'>
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className='rounded-xl border p-3'
                style={statCardStyle}
              >
                <div
                  className='flex items-center gap-1.5 text-xs font-medium'
                  style={{ color: '#475569' }}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </div>
                <div
                  className='mt-3 text-xl font-black leading-tight'
                  style={{ color: item.color }}
                >
                  {item.value}
                </div>
              </div>
            );
          })}
        </div>

        <Card
          className='!rounded-xl overflow-hidden'
          bodyStyle={{ padding: 0 }}
          cover={
            <div
              className='relative h-28'
              style={{
                '--palette-primary-darkerChannel': '0 75 80',
                backgroundImage:
                  "linear-gradient(0deg, rgba(var(--palette-primary-darkerChannel) / 82%), rgba(var(--palette-primary-darkerChannel) / 82%)), url('/cover-4.webp')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div className='relative z-10 flex h-full items-center justify-between gap-4 p-4'>
                <div>
                  <Text strong style={{ color: 'white', fontSize: 16 }}>
                    邀请收益
                  </Text>
                  <div
                    className='mt-2 text-xs leading-5'
                    style={{ color: 'rgba(255,255,255,0.9)' }}
                  >
                    好友充值后自动按返佣比例发放到可划转奖励
                  </div>
                </div>
                <Button
                  type='tertiary'
                  theme='solid'
                  size='small'
                  disabled={!complianceConfirmed || pendingQuota <= 0}
                  onClick={() => setOpenTransfer(true)}
                  className='!rounded-lg'
                  style={{
                    color: '#64748b',
                    background: 'rgba(255,255,255,0.88)',
                  }}
                >
                  <Wallet size={12} className='mr-1' />
                  划转到余额
                </Button>
              </div>
            </div>
          }
        >
          <div className='space-y-2 p-3'>
            <Input
              value={inviteCode}
              readOnly
              className='!rounded-lg'
              prefix='邀请码'
              suffix={
                <Button
                  type='tertiary'
                  theme='borderless'
                  onClick={copyInviteCode}
                  icon={<Copy size={14} />}
                >
                  复制
                </Button>
              }
            />
            <Input
              value={affLink}
              readOnly
              className='!rounded-lg'
              prefix='邀请链接'
              suffix={
                <Button
                  type='primary'
                  theme='solid'
                  onClick={handleAffLinkClick}
                  icon={<Copy size={14} />}
                  className='!rounded-lg'
                >
                  复制
                </Button>
              }
            />
          </div>
        </Card>

        <Card
          className='!w-full !rounded-xl'
          title={
            <span className='flex items-center gap-2'>
              <Gift size={15} />
              <Text strong>奖励说明</Text>
            </span>
          }
          bodyStyle={{ padding: 0 }}
        >
          <div className='space-y-2 px-4 py-3 text-sm leading-6' style={{ color: '#475569' }}>
            {[
              '邀请好友注册，好友充值后您可获得相应奖励',
              '通过划转功能将奖励额度转入到您的账户余额中',
              '邀请的好友越多，获得的奖励越多',
            ].map((item) => (
              <div key={item} className='flex gap-2'>
                <span className='mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500' />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card
          className='!w-full !rounded-xl overflow-hidden'
          title={<Text strong>已邀请用户</Text>}
          bodyStyle={{ padding: 0 }}
        >
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[520px] text-left text-xs'>
              <thead>
                <tr style={{ color: '#64748b' }}>
                  <th className='px-4 py-3 font-medium'>邮箱</th>
                  <th className='px-4 py-3 font-medium'>用户名</th>
                  <th className='px-4 py-3 font-medium'>返利明细</th>
                  <th className='px-4 py-3 font-medium'>注册时间</th>
                </tr>
              </thead>
              <tbody>
                {invitedUsers.length > 0 ? (
                  invitedUsers.map((item) => (
                    <tr key={item.id} className='border-t last:border-b-0'>
                      <td className='px-4 py-3'>{maskEmail(item.email)}</td>
                      <td className='px-4 py-3' style={{ color: '#64748b' }}>
                        {item.display_name || item.username || '-'}
                      </td>
                      <td className='px-4 py-3 font-medium text-emerald-600'>
                        {renderQuota(commissionByInvitee[item.id] || 0)}
                      </td>
                      <td className='px-4 py-3' style={{ color: '#475569' }}>
                        {formatTime(item.created_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className='px-4 py-8 text-center'
                      colSpan={4}
                      style={{ color: '#64748b' }}
                    >
                      暂无受邀用户
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Card>
  );
};

export default InvitationCardAijuhe;
