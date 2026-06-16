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

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  Card,
  Tag,
  Avatar,
  Typography,
  Tooltip,
  Modal,
} from '@douyinfe/semi-ui';
import { getLobeHubIcon } from '../../../../../helpers';
import SearchActions from './SearchActions';

const { Paragraph } = Typography;

const CONFIG = {
  CAROUSEL_INTERVAL: 2000,
  ICON_SIZE: 40,
  UNKNOWN_VENDOR: 'unknown',
  DEFAULT_PRICING_GROUP: 'Codex Pro (仅限 Codex)',
  DEFAULT_PRICING_RATIO: 0.09,
};

const THEME_COLORS = {
  allVendors: {
    primary: '37 99 235',
    background: 'rgba(59, 130, 246, 0.08)',
  },
  specific: {
    primary: '16 185 129',
    background: 'rgba(16, 185, 129, 0.1)',
  },
};

const COMPONENT_STYLES = {
  tag: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    color: '#1f2937',
    border: '1px solid rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  avatarContainer:
    'w-16 h-16 rounded-2xl bg-white/90 shadow-md backdrop-blur-sm flex items-center justify-center',
  titleText: { color: 'white' },
  descriptionText: { color: 'rgba(255,255,255,0.9)' },
};

const CONTENT_TEXTS = {
  unknown: {
    displayName: (t) => t('未知供应商'),
    description: (t) =>
      t(
        '包含来自未知或未标明供应商的AI模型，这些模型可能来自小型供应商或开源项目。',
      ),
  },
  all: {
    description: (t) =>
      t('查看所有可用的AI模型供应商，包括众多知名供应商的模型。'),
  },
  fallback: {
    description: (t) => t('该供应商提供多种AI模型，适用于不同的应用场景。'),
  },
};

const getVendorDisplayName = (vendorName, t) => {
  return vendorName === CONFIG.UNKNOWN_VENDOR
    ? CONTENT_TEXTS.unknown.displayName(t)
    : vendorName;
};

const createDefaultAvatar = () => (
  <div className={COMPONENT_STYLES.avatarContainer}>
    <Avatar size='large' color='transparent'>
      AI
    </Avatar>
  </div>
);

const getAvatarBackgroundColor = (isAllVendors) =>
  isAllVendors
    ? THEME_COLORS.allVendors.background
    : THEME_COLORS.specific.background;

const getAvatarText = (vendorName) =>
  vendorName === CONFIG.UNKNOWN_VENDOR
    ? '?'
    : vendorName.charAt(0).toUpperCase();

const createAvatarContent = (vendor, isAllVendors) => {
  if (vendor.icon) {
    return getLobeHubIcon(vendor.icon, CONFIG.ICON_SIZE);
  }

  return (
    <Avatar
      size='large'
      style={{ backgroundColor: getAvatarBackgroundColor(isAllVendors) }}
    >
      {getAvatarText(vendor.name)}
    </Avatar>
  );
};

const renderVendorAvatar = (vendor, t, isAllVendors = false) => {
  if (!vendor) {
    return createDefaultAvatar();
  }

  const displayName = getVendorDisplayName(vendor.name, t);
  const avatarContent = createAvatarContent(vendor, isAllVendors);

  return (
    <Tooltip content={displayName} position='top'>
      <div className={COMPONENT_STYLES.avatarContainer}>{avatarContent}</div>
    </Tooltip>
  );
};

const getLowestCodexPricingGroup = (groupRatio = {}) => {
  const codexGroups = Object.entries(groupRatio)
    .map(([name, ratio]) => ({
      name,
      ratio: Number(ratio),
    }))
    .filter(
      ({ name, ratio }) =>
        name &&
        name.toLowerCase().includes('codex') &&
        Number.isFinite(ratio),
    )
    .sort((a, b) => a.ratio - b.ratio || a.name.localeCompare(b.name));

  return codexGroups[0] || null;
};

const PricingVendorIntro = memo(
  ({
    filterVendor,
    filterGroup = 'all',
    groupRatio = {},
    models = [],
    allModels = [],
    t,
    selectedRowKeys = [],
    copyText,
    handleChange,
    handleCompositionStart,
    handleCompositionEnd,
    isMobile = false,
    searchValue = '',
    setShowFilterModal,
    showWithRecharge,
    setShowWithRecharge,
    currency,
    setCurrency,
    showRatio,
    setShowRatio,
    viewMode,
    setViewMode,
    tokenUnit,
    setTokenUnit,
  }) => {
    const [currentOffset, setCurrentOffset] = useState(0);
    const [descModalVisible, setDescModalVisible] = useState(false);
    const [descModalContent, setDescModalContent] = useState('');

    const handleOpenDescModal = useCallback((content) => {
      setDescModalContent(content || '');
      setDescModalVisible(true);
    }, []);

    const handleCloseDescModal = useCallback(() => {
      setDescModalVisible(false);
    }, []);

    const renderDescriptionModal = useCallback(
      () => (
        <Modal
          title={t('供应商介绍')}
          visible={descModalVisible}
          onCancel={handleCloseDescModal}
          footer={null}
          width={isMobile ? '95%' : 600}
          bodyStyle={{
            maxHeight: isMobile ? '70vh' : '60vh',
            overflowY: 'auto',
          }}
        >
          <div className='text-sm mb-4'>{descModalContent}</div>
        </Modal>
      ),
      [descModalVisible, descModalContent, handleCloseDescModal, isMobile, t],
    );

    const vendorInfo = useMemo(() => {
      const vendors = new Map();
      let unknownCount = 0;

      const sourceModels =
        Array.isArray(allModels) && allModels.length > 0 ? allModels : models;

      sourceModels.forEach((model) => {
        if (model.vendor_name) {
          const existing = vendors.get(model.vendor_name);
          if (existing) {
            existing.count++;
          } else {
            vendors.set(model.vendor_name, {
              name: model.vendor_name,
              icon: model.vendor_icon,
              description: model.vendor_description,
              count: 1,
            });
          }
        } else {
          unknownCount++;
        }
      });

      const vendorList = Array.from(vendors.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      );

      if (unknownCount > 0) {
        vendorList.push({
          name: CONFIG.UNKNOWN_VENDOR,
          icon: null,
          description: CONTENT_TEXTS.unknown.description(t),
          count: unknownCount,
        });
      }

      return vendorList;
    }, [allModels, models, t]);

    const currentModelCount = models.length;
    const pricingRuleData = useMemo(() => {
      const defaultPricingGroup = getLowestCodexPricingGroup(groupRatio);
      const effectiveGroup =
        filterGroup === 'all'
          ? defaultPricingGroup?.name || CONFIG.DEFAULT_PRICING_GROUP
          : filterGroup;
      const groupName = effectiveGroup;
      const parsedRatio = Number(
        filterGroup === 'all'
          ? defaultPricingGroup?.ratio
          : groupRatio?.[effectiveGroup],
      );
      const ratio =
        Number.isFinite(parsedRatio)
          ? parsedRatio
          : filterGroup === 'all'
            ? CONFIG.DEFAULT_PRICING_RATIO
            : 1;
      const pricingContext = `${groupName} ${filterVendor}`.toLowerCase();
      const modelName = /claude|anthropic|opus/.test(pricingContext)
        ? 'claude-opus-4-8'
        : 'gpt-5.5';
      const officialPrice = 5;
      const accountCharge = officialPrice * ratio;
      const realUsd = accountCharge / 7;
      const discount = (realUsd / officialPrice) * 10;
      const formatNumber = (value, digits = 2) =>
        Number(value)
          .toFixed(digits)
          .replace(/\.?0+$/, '');
      const formatMoney = (value) => Number(value).toFixed(2);

      return {
        groupName,
        modelName,
        officialPrice: formatNumber(officialPrice),
        ratio: formatNumber(ratio),
        accountCharge: formatMoney(accountCharge),
        realUsd: formatMoney(realUsd),
        discount: formatNumber(discount, 1),
      };
    }, [filterGroup, filterVendor, groupRatio, t]);

    useEffect(() => {
      if (filterVendor !== 'all' || vendorInfo.length <= 1) {
        setCurrentOffset(0);
        return;
      }

      const interval = setInterval(() => {
        setCurrentOffset((prev) => (prev + 1) % vendorInfo.length);
      }, CONFIG.CAROUSEL_INTERVAL);

      return () => clearInterval(interval);
    }, [filterVendor, vendorInfo.length]);

    const getVendorDescription = useCallback(
      (vendorKey) => {
        if (vendorKey === 'all') {
          return CONTENT_TEXTS.all.description(t);
        }
        if (vendorKey === CONFIG.UNKNOWN_VENDOR) {
          return CONTENT_TEXTS.unknown.description(t);
        }
        const vendor = vendorInfo.find((v) => v.name === vendorKey);
        return vendor?.description || CONTENT_TEXTS.fallback.description(t);
      },
      [vendorInfo, t],
    );

    const createCoverStyle = useCallback(
      (primaryColor) => ({
        '--palette-primary-darkerChannel': primaryColor,
        backgroundImage: `linear-gradient(0deg, rgba(var(--palette-primary-darkerChannel) / 80%), rgba(var(--palette-primary-darkerChannel) / 80%)), url('/cover-4.webp')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }),
      [],
    );

    const renderSearchActions = useCallback(
      () => (
        <SearchActions
          selectedRowKeys={selectedRowKeys}
          copyText={copyText}
          handleChange={handleChange}
          handleCompositionStart={handleCompositionStart}
          handleCompositionEnd={handleCompositionEnd}
          isMobile={isMobile}
          searchValue={searchValue}
          setShowFilterModal={setShowFilterModal}
          showWithRecharge={showWithRecharge}
          setShowWithRecharge={setShowWithRecharge}
          currency={currency}
          setCurrency={setCurrency}
          showRatio={showRatio}
          setShowRatio={setShowRatio}
          viewMode={viewMode}
          setViewMode={setViewMode}
          tokenUnit={tokenUnit}
          setTokenUnit={setTokenUnit}
          t={t}
        />
      ),
      [
        selectedRowKeys,
        copyText,
        handleChange,
        handleCompositionStart,
        handleCompositionEnd,
        isMobile,
        searchValue,
        setShowFilterModal,
        showWithRecharge,
        setShowWithRecharge,
        currency,
        setCurrency,
        showRatio,
        setShowRatio,
        viewMode,
        setViewMode,
        tokenUnit,
        setTokenUnit,
        t,
      ],
    );

    const renderPricingRulesNotice = useCallback(
      () => (
        <div className='mb-3 rounded-xl border border-amber-200 bg-amber-50/90 px-3 py-2 text-xs leading-relaxed text-slate-700 shadow-sm'>
          <div className='mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-1'>
            <span className='font-semibold text-slate-900'>
              {t('计价规则')}
            </span>
            <span>
              {t(
                '官方价格默认按 $1 = ￥7 折算；本站充值按 ￥1 = $1 账户余额 入账，因此模型广场显示的 $ 为账户余额计价，并不等同于官方真实美元成本。',
              )}
            </span>
          </div>
          <div className='mb-1 flex flex-wrap items-center gap-x-3 gap-y-1'>
            <span className='font-medium text-slate-900'>
              {t('账户扣费 = 官方美元价格 × 分组倍率')}
            </span>
            <span>
              {t(
                '示例：{{modelName}} 输入价官方为 ${{officialPrice}} / M tokens，{{groupName}} 分组倍率为 {{ratio}}x，则账户实际扣费为：',
                pricingRuleData,
              )}
            </span>
            <span className='rounded-md border border-amber-200 bg-white/80 px-2 py-0.5 font-mono font-semibold text-slate-900'>
              {`$${pricingRuleData.officialPrice} × ${pricingRuleData.ratio} = $${pricingRuleData.accountCharge} / M tokens`}
            </span>
          </div>
          <div className='mb-1'>
            {t(
              '由于充值按 ￥1 = $1 账户余额，所以实际相当于花费 ￥{{accountCharge}}。按官方汇率 $1 = ￥7 折算，约等于真实美元 ${{realUsd}}，也就是官方价格 ${{officialPrice}} 的约 {{discount}} 折。',
              pricingRuleData,
            )}
          </div>
          <div className='font-medium text-slate-900'>
            {t('简易公式：{{ratio}}人民币 = 1美元用量', pricingRuleData)}
          </div>
        </div>
      ),
      [pricingRuleData, t],
    );

    const renderHeaderCard = useCallback(
      ({ title, count, description, rightContent, primaryDarkerChannel }) => (
        <Card
          className='!rounded-2xl shadow-sm border-0'
          cover={
            <div
              className='relative h-full'
              style={createCoverStyle(primaryDarkerChannel)}
            >
              <div className='relative z-10 h-full flex items-center justify-between p-4'>
                <div className='flex-1 min-w-0 mr-4'>
                  <div className='flex flex-row flex-wrap items-center gap-2 sm:gap-3 mb-2'>
                    <h2
                      className='text-lg sm:text-xl font-bold truncate'
                      style={COMPONENT_STYLES.titleText}
                    >
                      {title}
                    </h2>
                    <Tag
                      style={COMPONENT_STYLES.tag}
                      shape='circle'
                      size='small'
                      className='self-center'
                    >
                      {t('共 {{count}} 个模型', { count })}
                    </Tag>
                  </div>
                  <Paragraph
                    className='text-xs sm:text-sm leading-relaxed !mb-0 cursor-pointer'
                    style={COMPONENT_STYLES.descriptionText}
                    ellipsis={{ rows: 2 }}
                    onClick={() => handleOpenDescModal(description)}
                  >
                    {description}
                  </Paragraph>
                </div>

                <div className='flex-shrink-0'>{rightContent}</div>
              </div>
            </div>
          }
        >
          {renderPricingRulesNotice()}
          {renderSearchActions()}
        </Card>
      ),
      [
        renderSearchActions,
        renderPricingRulesNotice,
        createCoverStyle,
        handleOpenDescModal,
        t,
      ],
    );

    const renderAllVendorsAvatar = useCallback(() => {
      const currentVendor =
        vendorInfo.length > 0
          ? vendorInfo[currentOffset % vendorInfo.length]
          : null;
      return renderVendorAvatar(currentVendor, t, true);
    }, [vendorInfo, currentOffset, t]);

    if (filterVendor === 'all') {
      const headerCard = renderHeaderCard({
        title: t('全部供应商'),
        count: currentModelCount,
        description: getVendorDescription('all'),
        rightContent: renderAllVendorsAvatar(),
        primaryDarkerChannel: THEME_COLORS.allVendors.primary,
      });
      return (
        <>
          {headerCard}
          {renderDescriptionModal()}
        </>
      );
    }

    const currentVendor = vendorInfo.find((v) => v.name === filterVendor);
    if (!currentVendor) {
      return null;
    }

    const vendorDisplayName = getVendorDisplayName(currentVendor.name, t);

    const headerCard = renderHeaderCard({
      title: vendorDisplayName,
      count: currentModelCount,
      description:
        currentVendor.description || getVendorDescription(currentVendor.name),
      rightContent: renderVendorAvatar(currentVendor, t, false),
      primaryDarkerChannel: THEME_COLORS.specific.primary,
    });

    return (
      <>
        {headerCard}
        {renderDescriptionModal()}
      </>
    );
  },
);

PricingVendorIntro.displayName = 'PricingVendorIntro';

export default PricingVendorIntro;
