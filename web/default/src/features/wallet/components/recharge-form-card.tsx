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
import { useEffect, useState } from 'react'
import {
  Check,
  ExternalLink,
  Gift,
  Loader2,
  Receipt,
  Sparkles,
  WalletCards,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { TitledCard } from '@/components/ui/titled-card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  calculatePresetPricing,
  formatCurrency,
  getDiscountLabel,
  getMinTopupAmount,
  getPaymentIcon,
} from '../lib'
import type {
  CreemProduct,
  PaymentMethod,
  PresetAmount,
  TopupInfo,
  WaffoPayMethod,
} from '../types'
import { CreemProductsSection } from './creem-products-section'

interface RechargeFormCardProps {
  topupInfo: TopupInfo | null
  presetAmounts: PresetAmount[]
  selectedPreset: number | null
  onSelectPreset: (preset: PresetAmount) => void
  topupAmount: number
  onTopupAmountChange: (amount: number) => void
  paymentAmount: number
  calculating: boolean
  onPaymentMethodSelect: (method: PaymentMethod) => void
  selectedPaymentMethod?: PaymentMethod
  onPresetRecharge: (preset: PresetAmount) => void
  onCustomRecharge: () => void
  paymentLoading: string | null
  redemptionCode: string
  onRedemptionCodeChange: (code: string) => void
  onRedeem: () => void
  redeeming: boolean
  topupLink?: string
  loading?: boolean
  priceRatio?: number
  usdExchangeRate?: number
  onOpenBilling?: () => void
  creemProducts?: CreemProduct[]
  enableCreemTopup?: boolean
  onCreemProductSelect?: (product: CreemProduct) => void
  enableWaffoTopup?: boolean
  waffoPayMethods?: WaffoPayMethod[]
  waffoMinTopup?: number
  onWaffoMethodSelect?: (method: WaffoPayMethod, index: number) => void
  enableWaffoPancakeTopup?: boolean
}

function getPlanMeta(value: number, t: (key: string) => string) {
  if (value <= 20) return { title: t('Light'), subtitle: t('For quick trials') }
  if (value <= 50) return { title: t('Trial'), subtitle: t('For first use') }
  if (value <= 100)
    return { title: t('Standard'), subtitle: t('For everyday use') }
  if (value <= 500)
    return { title: t('Advanced'), subtitle: t('For high-frequency use') }
  if (value <= 1000)
    return { title: t('Pro'), subtitle: t('For professional workloads') }
  return { title: t('Enterprise'), subtitle: t('For team usage') }
}

export function RechargeFormCard({
  topupInfo,
  presetAmounts,
  selectedPreset,
  onSelectPreset,
  topupAmount,
  onTopupAmountChange,
  paymentAmount,
  calculating,
  onPaymentMethodSelect,
  selectedPaymentMethod,
  onPresetRecharge,
  onCustomRecharge,
  paymentLoading,
  redemptionCode,
  onRedemptionCodeChange,
  onRedeem,
  redeeming,
  topupLink,
  loading,
  priceRatio = 1,
  usdExchangeRate = 1,
  onOpenBilling,
  creemProducts,
  enableCreemTopup,
  onCreemProductSelect,
  enableWaffoTopup,
  waffoPayMethods,
  waffoMinTopup,
  onWaffoMethodSelect,
  enableWaffoPancakeTopup,
}: RechargeFormCardProps) {
  const { t } = useTranslation()
  const [localAmount, setLocalAmount] = useState(topupAmount.toString())

  useEffect(() => {
    setLocalAmount(topupAmount.toString())
  }, [topupAmount])

  const handleAmountChange = (value: string) => {
    setLocalAmount(value)
    const numValue = parseInt(value) || 0
    if (numValue >= 0) {
      onTopupAmountChange(numValue)
    }
  }

  const hasConfigurableTopup =
    topupInfo?.enable_online_topup ||
    topupInfo?.enable_stripe_topup ||
    enableWaffoTopup ||
    enableWaffoPancakeTopup
  const hasAnyTopup = hasConfigurableTopup || enableCreemTopup
  const hasStandardPaymentMethods =
    Array.isArray(topupInfo?.pay_methods) && topupInfo.pay_methods.length > 0
  const hasWaffoPaymentMethods =
    Array.isArray(waffoPayMethods) && waffoPayMethods.length > 0
  const minTopup = getMinTopupAmount(topupInfo)
  const redemptionEnabled = topupInfo?.enable_redemption !== false
  const activePaymentMethod =
    selectedPaymentMethod || topupInfo?.pay_methods?.[0] || undefined

  if (loading) {
    return (
      <Card className='gap-0 overflow-hidden py-0'>
        <CardHeader className='border-b p-3 !pb-3 sm:p-5 sm:!pb-5'>
          <Skeleton className='h-6 w-32' />
          <Skeleton className='mt-2 h-4 w-48' />
        </CardHeader>
        <CardContent className='space-y-4 p-3 sm:space-y-6 sm:p-5'>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className='h-[250px] rounded-xl' />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TitledCard
      title={t('Add Funds')}
      description={t('Choose an amount and payment method')}
      icon={<WalletCards className='h-4 w-4' />}
      action={
        onOpenBilling ? (
          <Button
            variant='outline'
            size='sm'
            onClick={onOpenBilling}
            className='w-full gap-2 sm:w-auto'
          >
            <Receipt className='h-4 w-4' />
            {t('Order History')}
          </Button>
        ) : null
      }
      contentClassName='space-y-4 sm:space-y-6'
    >
      {hasAnyTopup ? (
        <div className='space-y-4 sm:space-y-6'>
          {hasConfigurableTopup && (
            <>
              <div className='space-y-2.5 sm:space-y-3'>
                <Label className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
                  {t('Payment Method')}
                </Label>
                {hasStandardPaymentMethods ? (
                  <div className='grid grid-cols-2 gap-1.5 sm:gap-3 lg:grid-cols-3'>
                    {topupInfo?.pay_methods?.map((method) => {
                      const methodMinTopup = method.min_topup || 0
                      const disabled = methodMinTopup > topupAmount
                      const selected = activePaymentMethod?.type === method.type
                      const button = (
                        <Button
                          key={method.type}
                          variant='outline'
                          onClick={() => onPaymentMethodSelect(method)}
                          disabled={disabled || !!paymentLoading}
                          className={cn(
                            'h-9 min-w-0 justify-start gap-2 rounded-lg px-3',
                            selected && 'border-sky-500 bg-sky-50 text-sky-700'
                          )}
                        >
                          {getPaymentIcon(
                            method.type,
                            'h-4 w-4',
                            method.icon,
                            method.name
                          )}
                          <span className='truncate'>{method.name}</span>
                        </Button>
                      )

                      return disabled ? (
                        <TooltipProvider key={method.type}>
                          <Tooltip>
                            <TooltipTrigger render={button}></TooltipTrigger>
                            <TooltipContent>
                              {t('Minimum topup amount: {{amount}}', {
                                amount: methodMinTopup,
                              })}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        button
                      )
                    })}
                  </div>
                ) : hasWaffoPaymentMethods ? null : (
                  <Alert>
                    <AlertDescription>
                      {t(
                        'No payment methods available. Please contact administrator.'
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {presetAmounts.length > 0 && (
                <div className='space-y-2.5 sm:space-y-3'>
                  <Label className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
                    {t('Amount')}
                  </Label>
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
                    {presetAmounts.map((preset) => {
                      const discount =
                        preset.discount ||
                        topupInfo?.discount?.[preset.value] ||
                        1.0
                      const bonus = topupInfo?.bonus?.[preset.value] || 0
                      const receivedAmount = preset.value + bonus
                      const { displayValue, actualPrice, hasDiscount } =
                        calculatePresetPricing(
                          preset.value,
                          priceRatio,
                          discount,
                          usdExchangeRate
                        )
                      const meta = getPlanMeta(preset.value, t)
                      const featured = preset.value === 1000
                      const popular = preset.value === 500
                      const loadingKey = activePaymentMethod
                        ? `${activePaymentMethod.type}:${preset.value}`
                        : ''
                      const buttonLoading = paymentLoading === loadingKey

                      return (
                        <div
                          key={preset.value}
                          className={cn(
                            'relative flex min-h-[230px] flex-col rounded-xl border bg-background/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                            selectedPreset === preset.value &&
                              'border-sky-500 ring-1 ring-sky-500/20',
                            featured && 'border-orange-400'
                          )}
                          onClick={() => onSelectPreset(preset)}
                        >
                          {(popular || featured || bonus > 0) && (
                            <div className='mb-4 flex min-h-7 flex-wrap items-center gap-2'>
                              {(popular || featured) && (
                                <span
                                  className={cn(
                                    'inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold',
                                    featured
                                      ? 'border-orange-200 bg-orange-700 text-white'
                                      : 'border-amber-200 bg-amber-50 text-amber-700'
                                  )}
                                >
                                  {featured ? t('Best Value') : t('Popular')}
                                </span>
                              )}
                              {bonus > 0 && (
                                <span
                                  className={cn(
                                    'inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold',
                                    featured
                                      ? 'border-orange-200 bg-orange-50 text-orange-700'
                                      : 'border-amber-200 bg-amber-50 text-amber-700'
                                  )}
                                >
                                  {t('Bonus')} ${formatNumber(bonus)}
                                </span>
                              )}
                            </div>
                          )}

                          <div className='space-y-2'>
                            <div className='text-xl font-bold'>
                              {meta.title}
                            </div>
                            <div className='text-muted-foreground text-sm'>
                              {meta.subtitle}
                            </div>
                          </div>

                          <div className='mt-5 flex flex-wrap items-center gap-3'>
                            <span className='text-muted-foreground text-3xl font-semibold'>
                              ?
                            </span>
                            <span className='text-5xl font-black'>
                              {formatNumber(displayValue)}
                            </span>
                          </div>

                          <div className='mt-5 text-sm'>
                            <span className='text-muted-foreground'>
                              {t('Receive')}
                            </span>{' '}
                            {bonus > 0 && (
                              <span className='text-muted-foreground line-through'>
                                ${formatNumber(preset.value)}
                              </span>
                            )}
                            <span
                              className={cn(
                                'ml-2 font-bold',
                                featured ? 'text-orange-700' : 'text-sky-700'
                              )}
                            >
                              ${formatNumber(receivedAmount)}
                            </span>{' '}
                            <span className='text-muted-foreground'>
                              {t('credits')}
                            </span>
                          </div>

                          <div className='mt-5 space-y-2 text-sm text-muted-foreground'>
                            {[
                              t('Receive {{amount}} credits', {
                                amount: `$${formatNumber(receivedAmount)}`,
                              }),
                              t('Never expires'),
                              t('Supports all models'),
                            ].map((item) => (
                              <div
                                key={item}
                                className='flex items-center gap-2'
                              >
                                <Check
                                  className={cn(
                                    'h-4 w-4',
                                    featured ? 'text-orange-600' : 'text-sky-600'
                                  )}
                                />
                                <span>{item}</span>
                              </div>
                            ))}
                            {hasDiscount && (
                              <div className='flex items-center gap-2 text-green-700'>
                                <Sparkles className='h-4 w-4' />
                                <span>{getDiscountLabel(discount)}</span>
                              </div>
                            )}
                            <div className='text-xs text-muted-foreground'>
                              {t('Amount to pay:')} {formatCurrency(actualPrice)}
                            </div>
                          </div>

                          <Button
                            type='button'
                            disabled={!activePaymentMethod || !!paymentLoading}
                            onClick={(event) => {
                              event.stopPropagation()
                              onPresetRecharge(preset)
                            }}
                            className={cn(
                              'mt-auto h-12 w-full rounded-lg text-base font-bold',
                              featured
                                ? 'bg-orange-700 hover:bg-orange-800'
                                : 'bg-sky-700 hover:bg-sky-800'
                            )}
                          >
                            {buttonLoading && (
                              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            )}
                            {t('Recharge Now')}
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className='space-y-2.5 sm:space-y-3'>
                <Label
                  htmlFor='topup-amount'
                  className='text-muted-foreground text-xs font-medium tracking-wider uppercase'
                >
                  {t('Custom Amount')}
                </Label>
                <div className='grid grid-cols-[minmax(0,1fr)_minmax(110px,0.55fr)] gap-2 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center'>
                  <Input
                    id='topup-amount'
                    type='number'
                    value={localAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    min={minTopup}
                    placeholder={`Minimum ${minTopup}`}
                    className='h-9 text-base sm:h-10 sm:text-lg'
                  />
                  <div className='bg-muted/30 flex min-h-9 items-center justify-between gap-2 rounded-md border px-3 lg:min-w-52'>
                    <span className='text-muted-foreground truncate text-xs'>
                      {t('Amount to pay:')}
                    </span>
                    {calculating ? (
                      <Skeleton className='h-5 w-16' />
                    ) : (
                      <span className='text-sm font-semibold'>
                        {formatCurrency(paymentAmount)}
                      </span>
                    )}
                  </div>
                  <Button
                    type='button'
                    onClick={onCustomRecharge}
                    disabled={!activePaymentMethod || !!paymentLoading}
                    className='h-9 whitespace-nowrap'
                  >
                    {paymentLoading ===
                      `${activePaymentMethod?.type}:custom` && (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    )}
                    {t('Recharge Now')}
                  </Button>
                </div>
              </div>

              {enableWaffoTopup &&
                hasWaffoPaymentMethods &&
                onWaffoMethodSelect && (
                  <div className='space-y-2.5 sm:space-y-3'>
                    <Label className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
                      {t('Waffo Payment')}
                    </Label>
                    <div className='grid grid-cols-2 gap-1.5 sm:gap-3 lg:grid-cols-3'>
                      {waffoPayMethods?.map((method, index) => {
                        const loadingKey = `waffo-${index}`
                        const waffoMin = waffoMinTopup || 0
                        const belowMin = waffoMin > topupAmount
                        const button = (
                          <Button
                            key={`${method.name}-${index}`}
                            variant='outline'
                            onClick={() => onWaffoMethodSelect(method, index)}
                            disabled={belowMin || !!paymentLoading}
                            className='h-9 min-w-0 justify-start gap-2 rounded-lg px-3'
                          >
                            {paymentLoading === loadingKey ? (
                              <Loader2 className='h-4 w-4 animate-spin' />
                            ) : method.icon ? (
                              <img
                                src={method.icon}
                                alt={method.name}
                                className='h-4 w-4 object-contain'
                              />
                            ) : (
                              getPaymentIcon('waffo')
                            )}
                            <span className='truncate'>{method.name}</span>
                          </Button>
                        )

                        return belowMin ? (
                          <TooltipProvider key={`${method.name}-${index}`}>
                            <Tooltip>
                              <TooltipTrigger render={button}></TooltipTrigger>
                              <TooltipContent>
                                {t('Minimum topup amount: {{amount}}', {
                                  amount: waffoMin,
                                })}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          button
                        )
                      })}
                    </div>
                  </div>
                )}
            </>
          )}
        </div>
      ) : (
        <Alert>
          <AlertDescription>
            {t(
              'Online topup is not enabled. Please use redemption code or contact administrator.'
            )}
          </AlertDescription>
        </Alert>
      )}

      {enableCreemTopup &&
        Array.isArray(creemProducts) &&
        creemProducts.length > 0 &&
        onCreemProductSelect && (
          <div className='space-y-2.5 border-t pt-4 sm:space-y-3 sm:pt-6'>
            <Label className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
              {t('Creem Payment')}
            </Label>
            <CreemProductsSection
              products={creemProducts}
              onProductSelect={onCreemProductSelect}
            />
          </div>
        )}

      {redemptionEnabled ? (
        <div className='space-y-2.5 border-t pt-4 sm:space-y-3 sm:pt-6'>
          <div className='flex items-center gap-2'>
            <Gift className='text-muted-foreground h-4 w-4' />
            <Label
              htmlFor='redemption-code'
              className='text-muted-foreground text-xs font-medium tracking-wider uppercase'
            >
              {t('Have a Code?')}
            </Label>
          </div>
          <div className='grid grid-cols-[minmax(0,1fr)_auto] gap-2'>
            <Input
              id='redemption-code'
              value={redemptionCode}
              onChange={(e) => onRedemptionCodeChange(e.target.value)}
              placeholder={t('Enter your redemption code')}
              className='h-9 min-w-0'
            />
            <Button
              onClick={onRedeem}
              disabled={redeeming}
              variant='outline'
              className='h-9 px-4'
            >
              {redeeming && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {t('Redeem')}
            </Button>
          </div>
          {topupLink && (
            <p className='text-muted-foreground text-xs'>
              {t('Need a redemption code?')}{' '}
              <a
                href={topupLink}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1 underline-offset-4 hover:underline'
              >
                {t('Get one here')}
                <ExternalLink className='h-3 w-3' />
              </a>
            </p>
          )}
        </div>
      ) : (
        <Alert className='border-t'>
          <AlertDescription>
            {t(
              'Redemption codes are disabled until the administrator confirms compliance terms.'
            )}
          </AlertDescription>
        </Alert>
      )}
    </TitledCard>
  )
}
