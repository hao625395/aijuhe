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

import React, { useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Banner,
  Button,
  Card,
  Col,
  Form,
  Row,
  Skeleton,
  Space,
  Spin,
  Tabs,
  TabPane,
  Typography,
} from '@douyinfe/semi-ui';
import { IconGift } from '@douyinfe/semi-icons';
import { SiAlipay, SiStripe, SiWechat } from 'react-icons/si';
import {
  BarChart2,
  CreditCard,
  Receipt,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useActualTheme } from '../../context/Theme';
import { getCurrencyConfig } from '../../helpers/render';
import { useMinimumLoadingTime } from '../../hooks/common/useMinimumLoadingTime';
import SubscriptionPlansCard from './SubscriptionPlansCard';

const { Text } = Typography;

const rechargePlans = [
  { value: 20, title: '轻量', subtitle: '快速补充额度' },
  { value: 50, title: '体验', subtitle: '适合初次体验' },
  { value: 100, title: '标准', subtitle: '开发者常用' },
  { value: 500, title: '进阶', subtitle: '高频使用', badge: '人气推荐' },
  {
    value: 1000,
    title: '专业',
    subtitle: '专业开发者',
    badge: '最佳价值',
    featured: true,
  },
  { value: 2000, title: '企业', subtitle: '团队高频调用', badge: '企业优选' },
];

const RechargeCardAijuhe = ({
  t,
  enableOnlineTopUp,
  enableStripeTopUp,
  enableCreemTopUp,
  creemProducts,
  creemPreTopUp,
  selectedPreset,
  selectPresetAmount,
  formatLargeNumber,
  topUpCount,
  minTopUp,
  renderQuotaWithAmount,
  getAmount,
  setTopUpCount,
  setSelectedPreset,
  renderAmount,
  amountLoading,
  payMethods,
  preTopUp,
  paymentLoading,
  payWay,
  redemptionCode,
  setRedemptionCode,
  topUp,
  isSubmitting,
  topUpLink,
  openTopUpLink,
  userState,
  renderQuota,
  statusLoading,
  topupInfo,
  onOpenHistory,
  enableWaffoTopUp,
  enableWaffoPancakeTopUp,
  subscriptionLoading = false,
  subscriptionPlans = [],
  billingPreference,
  onChangeBillingPreference,
  activeSubscriptions = [],
  allSubscriptions = [],
  reloadSubscriptionSelf,
  enableRedemption = true,
}) => {
  const onlineFormApiRef = useRef(null);
  const redeemFormApiRef = useRef(null);
  const initialTabSetRef = useRef(false);
  const actualTheme = useActualTheme();
  const showAmountSkeleton = useMinimumLoadingTime(amountLoading);
  const [activeTab, setActiveTab] = useState('topup');
  const [rechargingPlanKey, setRechargingPlanKey] = useState(null);
  const regularPayMethods = [...(payMethods || [])].sort((a, b) => {
    const order = { wxpay: 0, alipay: 1 };
    return (order[a.type] ?? 10) - (order[b.type] ?? 10);
  });
  const shouldShowSubscription =
    !subscriptionLoading && subscriptionPlans.length > 0;

  const getAvailablePayMethod = (amount) =>
    regularPayMethods.find((payMethod) => {
      const minTopupVal = Number(payMethod.min_topup) || 0;
      const isStripe = payMethod.type === 'stripe';
      const isWaffo =
        typeof payMethod.type === 'string' &&
        payMethod.type.startsWith('waffo:');
      const isWaffoPancake = payMethod.type === 'waffo_pancake';

      return (
        amount >= minTopupVal &&
        ((enableOnlineTopUp && !isStripe && !isWaffo && !isWaffoPancake) ||
          (enableStripeTopUp && isStripe) ||
          (enableWaffoTopUp && isWaffo) ||
          (enableWaffoPancakeTopUp && isWaffoPancake))
      );
    });

  const handlePlanSelect = (plan) => {
    const preset = {
      value: plan.value,
      discount: topupInfo?.discount?.[plan.value] || 1.0,
    };
    selectPresetAmount(preset);
    onlineFormApiRef.current?.setValue('topUpCount', plan.value);
  };

  const handleRechargePlanClick = async (plan) => {
    handlePlanSelect(plan);

    const payMethod = getAvailablePayMethod(plan.value);
    if (!payMethod) return;

    const loadingKey = `${payMethod.type}:${plan.value}`;
    setRechargingPlanKey(loadingKey);
    try {
      await preTopUp(payMethod.type, plan.value);
    } finally {
      setRechargingPlanKey(null);
    }
  };

  const formatBonusAmount = (value) => {
    const number = Number(value || 0);
    if (!Number.isFinite(number)) return '0';
    return Number.isInteger(number) ? String(number) : number.toFixed(2);
  };

  const pillStyle = {
    color: '#a95418',
    background: '#fff4d7',
    border: '1px solid #ffd38a',
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 5px rgba(180, 83, 9, 0.08)',
  };

  const renderPaymentIcon = (payMethod) => {
    if (payMethod.type === 'alipay') return <SiAlipay size={18} color='#1677FF' />;
    if (payMethod.type === 'wxpay') return <SiWechat size={18} color='#07C160' />;
    if (payMethod.type === 'stripe') return <SiStripe size={18} color='#635BFF' />;
    if (payMethod.icon) {
      return (
        <img
          src={payMethod.icon}
          alt={payMethod.name}
          style={{ width: 18, height: 18, objectFit: 'contain' }}
        />
      );
    }
    if (payMethod.type === 'waffo_pancake') {
      return (
        <img
          src={actualTheme === 'dark' ? '/waffo-logo-dark.svg' : '/waffo-logo-light.svg'}
          alt='Waffo'
          style={{ width: 18, height: 18, objectFit: 'contain' }}
        />
      );
    }
    return <CreditCard size={18} color={payMethod.color || '#64748b'} />;
  };

  const renderRechargePlans = () => (
    <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3'>
      {rechargePlans.map((plan) => {
        const isSelected = selectedPreset === plan.value;
        const payMethod = getAvailablePayMethod(plan.value);
        const disabled = !payMethod;
        const bonus = Number(topupInfo?.bonus?.[plan.value] || 0);
        const receiveAmount = plan.value + bonus;
        const loadingKey = payMethod ? `${payMethod.type}:${plan.value}` : '';
        const buttonLoading = paymentLoading && rechargingPlanKey === loadingKey;
        const accent = plan.featured ? '#b45309' : '#0369a1';
        const borderColor = isSelected
          ? plan.featured
            ? '#ea580c'
            : '#0ea5e9'
          : plan.featured
            ? '#fb923c'
            : '#e5e7eb';

        return (
          <div
            key={plan.value}
            className='relative flex flex-col rounded-xl bg-white p-4 transition-all'
            style={{
              border: `1px solid ${borderColor}`,
              boxShadow: isSelected
                ? '0 12px 26px rgba(15, 23, 42, 0.11)'
                : '0 8px 20px rgba(15, 23, 42, 0.07)',
              opacity: disabled ? 0.68 : 1,
              minHeight: 210,
            }}
            onClick={() => handlePlanSelect(plan)}
          >
            <div className='flex flex-1 flex-col'>
              {plan.badge && (
                <div
                  className='absolute left-4 top-4 shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold leading-4'
                  style={pillStyle}
                >
                  {plan.badge}
                </div>
              )}
              {bonus > 0 && (
                <div
                  className='absolute right-4 top-4 shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-black leading-4'
                  style={pillStyle}
                >
                  +送${formatBonusAmount(bonus)}
                </div>
              )}

              <div
                className='flex min-h-[42px] items-start justify-between gap-3'
                style={{ paddingTop: plan.badge ? 28 : 0 }}
              >
                <div className='min-w-0'>
                  <div className='text-sm font-bold leading-5' style={{ color: '#1e293b' }}>
                    {plan.title}
                  </div>
                  <div className='mt-0.5 text-xs leading-5' style={{ color: '#475569' }}>
                    {plan.subtitle}
                  </div>
                </div>
              </div>

              <div className='mt-3 flex items-end gap-1.5'>
                <span className='text-2xl font-semibold' style={{ color: '#475569' }}>
                  ¥
                </span>
                <span className='text-3xl font-black leading-none' style={{ color: '#0f172a' }}>
                  {formatLargeNumber(plan.value)}
                </span>
              </div>

              <div className='mt-2 text-xs leading-5' style={{ color: '#334155' }}>
                获得{' '}
                {bonus > 0 && (
                  <span className='mr-1 line-through' style={{ color: '#94a3b8' }}>
                    ${plan.value}
                  </span>
                )}
                <span className='font-semibold' style={{ color: accent }}>
                  ${receiveAmount}
                </span>{' '}
                额度
              </div>

              <div className='mt-3 space-y-1 text-xs leading-5' style={{ color: '#1e293b' }}>
                {[`获得 $${receiveAmount} 额度`, '永久有效', '支持全部模型'].map((item) => (
                  <div key={item} className='flex items-center gap-1.5'>
                    <span className='font-bold' style={{ color: accent }}>
                      ✓
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <Button
                theme='solid'
                type={plan.featured ? 'warning' : 'primary'}
                disabled={disabled}
                loading={buttonLoading}
                onClick={(event) => {
                  event.stopPropagation();
                  handleRechargePlanClick(plan);
                }}
                className='!mt-auto !h-9 !w-full !rounded-lg !text-sm !font-bold'
                style={{
                  backgroundColor: disabled ? undefined : accent,
                  boxShadow: disabled
                    ? undefined
                    : `0 5px 0 ${plan.featured ? '#92400e' : '#075985'}`,
                }}
              >
                {disabled ? '暂不可充值' : '立即充值'}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );

  useEffect(() => {
    if (initialTabSetRef.current) return;
    if (subscriptionLoading) return;
    setActiveTab(shouldShowSubscription ? 'subscription' : 'topup');
    initialTabSetRef.current = true;
  }, [shouldShowSubscription, subscriptionLoading]);

  useEffect(() => {
    if (!shouldShowSubscription && activeTab !== 'topup') {
      setActiveTab('topup');
    }
  }, [shouldShowSubscription, activeTab]);

  const topupContent = (
    <Space vertical style={{ width: '100%' }}>
      <Card
        className='!rounded-xl w-full'
        cover={
          <div
            className='relative h-30'
            style={{
              '--palette-primary-darkerChannel': '37 99 235',
              backgroundImage:
                "linear-gradient(0deg, rgba(var(--palette-primary-darkerChannel) / 80%), rgba(var(--palette-primary-darkerChannel) / 80%)), url('/cover-4.webp')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className='relative z-10 h-full flex flex-col justify-between p-4'>
              <div className='flex justify-between items-center'>
                <Text strong style={{ color: 'white', fontSize: '16px' }}>
                  账户统计
                </Text>
              </div>
              <div className='grid grid-cols-3 gap-6 mt-4'>
                {[
                  {
                    label: '当前余额',
                    value: renderQuota(userState?.user?.quota),
                    icon: Wallet,
                  },
                  {
                    label: '历史消费',
                    value: renderQuota(userState?.user?.used_quota),
                    icon: TrendingUp,
                  },
                  {
                    label: '请求次数',
                    value: userState?.user?.request_count || 0,
                    icon: BarChart2,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className='text-center'>
                      <div className='text-base sm:text-2xl font-bold mb-2' style={{ color: 'white' }}>
                        {item.value}
                      </div>
                      <div className='flex items-center justify-center text-sm'>
                        <Icon size={14} className='mr-1' style={{ color: 'rgba(255,255,255,0.8)' }} />
                        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                          {item.label}
                        </Text>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        }
      >
        {statusLoading ? (
          <div className='py-8 flex justify-center'>
            <Spin size='large' />
          </div>
        ) : enableOnlineTopUp ||
          enableStripeTopUp ||
          enableCreemTopUp ||
          enableWaffoTopUp ||
          enableWaffoPancakeTopUp ? (
          <Form
            getFormApi={(api) => (onlineFormApiRef.current = api)}
            initValues={{ topUpCount }}
          >
            <div className='space-y-6'>
              {(enableOnlineTopUp ||
                enableStripeTopUp ||
                enableWaffoTopUp ||
                enableWaffoPancakeTopUp) && (
                <>
                  <Row gutter={12}>
                    <Col xs={24} sm={24} md={24} lg={10} xl={10}>
                      <Form.InputNumber
                        field='topUpCount'
                        label='充值数量'
                        disabled={
                          !enableOnlineTopUp &&
                          !enableStripeTopUp &&
                          !enableWaffoTopUp &&
                          !enableWaffoPancakeTopUp
                        }
                        placeholder={`充值数量，最低 ${renderQuotaWithAmount(minTopUp)}`}
                        value={topUpCount}
                        min={minTopUp}
                        max={999999999}
                        step={1}
                        precision={0}
                        onChange={async (value) => {
                          if (value && value >= 1) {
                            setTopUpCount(value);
                            setSelectedPreset(null);
                            await getAmount(value);
                          }
                        }}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value);
                          if (!value || value < 1) {
                            setTopUpCount(1);
                            getAmount(1);
                          }
                        }}
                        formatter={(value) => (value ? `${value}` : '')}
                        parser={(value) =>
                          value ? parseInt(value.replace(/[^\d]/g, '')) : 0
                        }
                        extraText={
                          <Skeleton
                            loading={showAmountSkeleton}
                            active
                            placeholder={<Skeleton.Title style={{ width: 120, height: 20, borderRadius: 6 }} />}
                          >
                            <Text type='secondary' className='text-red-600'>
                              实付金额：
                              <span style={{ color: 'red' }}>{renderAmount()}</span>
                            </Text>
                          </Skeleton>
                        }
                        style={{ width: '100%' }}
                      />
                    </Col>
                    {regularPayMethods.length > 0 && (
                      <Col xs={24} sm={24} md={24} lg={14} xl={14}>
                        <Form.Slot label='选择支付方式'>
                          <Space wrap>
                            {regularPayMethods.map((payMethod) => {
                              const minTopupVal = Number(payMethod.min_topup) || 0;
                              const disabled = minTopupVal > Number(topUpCount || 0);

                              return (
                                <Button
                                  key={payMethod.type}
                                  theme='outline'
                                  type='tertiary'
                                  onClick={() => preTopUp(payMethod.type)}
                                  disabled={disabled}
                                  loading={paymentLoading && payWay === payMethod.type}
                                  icon={renderPaymentIcon(payMethod)}
                                  className='!rounded-lg !px-4 !py-2'
                                >
                                  {payMethod.name}
                                </Button>
                              );
                            })}
                          </Space>
                        </Form.Slot>
                      </Col>
                    )}
                  </Row>

                  <Form.Slot
                    label={
                      <div className='flex items-center gap-2'>
                        <span>选择充值额度</span>
                        {(() => {
                          const { symbol, rate, type } = getCurrencyConfig();
                          if (type === 'USD') return null;
                          return (
                            <span
                              style={{
                                color: 'var(--semi-color-text-2)',
                                fontSize: '12px',
                                fontWeight: 'normal',
                              }}
                            >
                              (1 $ = {rate.toFixed(2)} {symbol})
                            </span>
                          );
                        })()}
                      </div>
                    }
                  >
                    {renderRechargePlans()}
                  </Form.Slot>
                </>
              )}

              {enableCreemTopUp && creemProducts.length > 0 && (
                <Form.Slot label='Creem 充值'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
                    {creemProducts.map((product, index) => (
                      <Card
                        key={index}
                        onClick={() => creemPreTopUp(product)}
                        className='cursor-pointer !rounded-2xl transition-all hover:shadow-md border-gray-200 hover:border-gray-300'
                        bodyStyle={{ textAlign: 'center', padding: '16px' }}
                      >
                        <div className='font-medium text-lg mb-2'>{product.name}</div>
                        <div className='text-sm text-gray-600 mb-2'>充值额度: {product.quota}</div>
                        <div className='text-lg font-semibold text-blue-600'>
                          {product.currency === 'EUR' ? '€' : '$'}
                          {product.price}
                        </div>
                      </Card>
                    ))}
                  </div>
                </Form.Slot>
              )}
            </div>
          </Form>
        ) : (
          <div className='space-y-4'>
            {renderRechargePlans()}
            <Banner
              type='info'
              description='管理员未开启在线充值功能，请联系管理员开启或使用兑换码充值。'
              className='!rounded-xl'
              closeIcon={null}
            />
          </div>
        )}
      </Card>

      {enableRedemption ? (
        <Card
          className='!rounded-xl w-full'
          title={
            <Text type='tertiary' strong>
              兑换码充值
            </Text>
          }
        >
          <Form
            getFormApi={(api) => (redeemFormApiRef.current = api)}
            initValues={{ redemptionCode }}
          >
            <Form.Input
              field='redemptionCode'
              noLabel
              placeholder='请输入兑换码'
              value={redemptionCode}
              onChange={(value) => setRedemptionCode(value)}
              prefix={<IconGift />}
              suffix={
                <div className='flex items-center gap-2'>
                  <Button type='primary' theme='solid' onClick={topUp} loading={isSubmitting}>
                    兑换额度
                  </Button>
                </div>
              }
              showClear
              style={{ width: '100%' }}
              extraText={
                topUpLink && (
                  <Text type='tertiary'>
                    在找兑换码？
                    <Text
                      type='secondary'
                      underline
                      className='cursor-pointer'
                      onClick={openTopUpLink}
                    >
                      购买兑换码
                    </Text>
                  </Text>
                )
              }
            />
          </Form>
        </Card>
      ) : (
        <Banner
          type='warning'
          description='兑换码功能已禁用，管理员需先确认合规声明。'
          closeIcon={null}
          className='!rounded-xl'
        />
      )}
    </Space>
  );

  return (
    <Card className='!rounded-2xl shadow-sm border-0'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center'>
          <Avatar size='small' color='blue' className='mr-3 shadow-md'>
            <CreditCard size={16} />
          </Avatar>
          <div>
            <Typography.Text className='text-lg font-medium'>账户充值</Typography.Text>
            <div className='text-xs'>多种充值方式，安全便捷</div>
          </div>
        </div>
        <Button icon={<Receipt size={16} />} theme='solid' onClick={onOpenHistory}>
          账单
        </Button>
      </div>

      {shouldShowSubscription ? (
        <Tabs type='card' activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <div className='flex items-center gap-2'>
                <Sparkles size={16} />
                订阅套餐
              </div>
            }
            itemKey='subscription'
          >
            <div className='py-2'>
              <SubscriptionPlansCard
                t={t}
                loading={subscriptionLoading}
                plans={subscriptionPlans}
                payMethods={payMethods}
                enableOnlineTopUp={enableOnlineTopUp}
                enableStripeTopUp={enableStripeTopUp}
                enableCreemTopUp={enableCreemTopUp}
                billingPreference={billingPreference}
                onChangeBillingPreference={onChangeBillingPreference}
                activeSubscriptions={activeSubscriptions}
                allSubscriptions={allSubscriptions}
                reloadSubscriptionSelf={reloadSubscriptionSelf}
                withCard={false}
              />
            </div>
          </TabPane>
          <TabPane
            tab={
              <div className='flex items-center gap-2'>
                <Wallet size={16} />
                额度充值
              </div>
            }
            itemKey='topup'
          >
            <div className='py-2'>{topupContent}</div>
          </TabPane>
        </Tabs>
      ) : (
        topupContent
      )}
    </Card>
  );
};

export default RechargeCardAijuhe;
