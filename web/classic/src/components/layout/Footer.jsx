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

import React, { useEffect, useState, useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Toast } from '@douyinfe/semi-ui';
import { Link } from 'react-router-dom';
import { getFooterHTML, getLogo, getSystemName } from '../../helpers';
import { StatusContext } from '../../context/Status';

const FooterBar = () => {
  const { t } = useTranslation();
  const systemName = getSystemName();
  const logo = getLogo();
  const currentYear = new Date().getFullYear();

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      Toast.success(`${label}已复制：${text}`);
    }).catch(() => {
      Toast.error('复制失败，请手动复制');
    });
  };

  return (
    <div className='w-full'>
      <footer className='border-t border-[#e8e8e8] dark:border-[#2f2f2f] bg-white dark:bg-[#151515] relative h-auto py-12 px-6 md:px-24 w-full flex flex-col items-center justify-between overflow-hidden'>
        <div className='grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8 w-full max-w-[1110px] mb-10'>
          {/* 左侧 Brand 区域 */}
          <div className='col-span-1 md:col-span-4 flex flex-col items-start gap-2.5'>
            <Link to='/' className='group flex items-center gap-2.5 text-black dark:text-white no-underline hover:no-underline'>
              <img
                src='/logo-footer.png?v=20260608'
                alt={systemName}
                style={{ height: '62px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>
            <p className='text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-[280px]'>
              {t('一个key，连接全球顶尖AI模型')}
            </p>
          </div>

          {/* 右侧 5 列导航 */}
          <div className='footer-nav-columns col-span-1 md:col-span-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8'>
            {/* 友情链接 */}
            <div>
              <p className='text-black dark:text-white mb-4 text-sm font-semibold'>{t('友情链接')}</p>
              <ul className='space-y-3 text-sm list-none p-0 m-0'>
                <li>
                  <a
                    href='https://link3.cc/qukuai66'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors no-underline'
                  >
                    {t('区块捕手聚合')}
                  </a>
                </li>
              </ul>
            </div>

            {/* 产品 */}
            <div>
              <p className='text-black dark:text-white mb-4 text-sm font-semibold'>{t('产品')}</p>
              <ul className='space-y-3 text-sm list-none p-0 m-0'>
                <li>
                  <Link
                    to='/about'
                    className='text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors no-underline'
                  >
                    {t('aijuhe介绍')}
                  </Link>
                </li>
                <li>
                  <Link
                    to='/pricing'
                    className='text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors no-underline'
                  >
                    {t('模型广场')}
                  </Link>
                </li>
                <li>
                  <a
                    href='/#pricing-section'
                    className='text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors no-underline'
                  >
                    {t('定价方案')}
                  </a>
                </li>
              </ul>
            </div>

            {/* 帮助与支持 */}
            <div>
              <p className='text-black dark:text-white mb-4 text-sm font-semibold'>{t('帮助与支持')}</p>
              <ul className='space-y-3 text-sm list-none p-0 m-0'>
                <li>
                  <Link
                    to='/docs'
                    className='text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors no-underline'
                  >
                    {t('使用教程')}
                  </Link>
                </li>
                <li>
                  <Link
                    to='/docs'
                    className='text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors no-underline'
                  >
                    {t('API 文档')}
                  </Link>
                </li>
                <li>
                  <a
                    href='/docs?id=contact-customer-service'
                    className='text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors no-underline'
                  >
                    {t('联系我们')}
                  </a>
                </li>
                <li>
                  <a
                    href='/docs?id=agent-merchant'
                    className='text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors no-underline'
                  >
                    {t('代理加盟')}
                  </a>
                </li>
              </ul>
            </div>

            {/* 联系方式 */}
            <div>
              <p className='text-black dark:text-white mb-4 text-sm font-semibold'>{t('联系方式')}</p>
              <ul className='space-y-3 text-sm list-none p-0 m-0'>
                <li>
                  <button
                    onClick={() => handleCopy('leohoo8', t('邮箱'))}
                    className='text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors text-left bg-transparent p-0 border-0 cursor-pointer block w-full outline-none'
                  >
                    {t('邮箱')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleCopy('block668', t('微信'))}
                    className='text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors text-left bg-transparent p-0 border-0 cursor-pointer block w-full outline-none'
                  >
                    {t('微信')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleCopy('775860198', t('QQ交流群'))}
                    className='text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors text-left bg-transparent p-0 border-0 cursor-pointer block w-full outline-none'
                  >
                    {t('QQ交流群')}
                  </button>
                </li>
                <li>
                  <a
                    href='https://x.com/qukuai66'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors no-underline block w-full'
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href='https://discord.com/invite/hfudanAKCg'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors no-underline block w-full'
                  >
                    Discord
                  </a>
                </li>
              </ul>
            </div>

            {/* 法律 & 安全 */}
            <div>
              <p className='text-black dark:text-white mb-4 text-sm font-semibold'>{t('法律 & 安全')}</p>
              <ul className='space-y-3 text-sm list-none p-0 m-0'>
                <li>
                  <Link
                    to='/legal/terms'
                    className='text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors no-underline'
                  >
                    {t('服务条款')}
                  </Link>
                </li>
                <li>
                  <Link
                    to='/legal/supported-regions'
                    className='text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors no-underline'
                  >
                    {t('支持的国家和地区')}
                  </Link>
                </li>
                <li>
                  <Link
                    to='/legal/usage-policy'
                    className='text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors no-underline'
                  >
                    {t('使用政策')}
                  </Link>
                </li>
                <li>
                  <Link
                    to='/legal/service-specific-terms'
                    className='text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors no-underline'
                  >
                    {t('服务特定条款')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 底部的署名与协议 */}
        <div className='flex flex-col md:flex-row items-center justify-between w-full max-w-[1110px] gap-6 border-t border-[#e8e8e8] dark:border-[#2f2f2f] pt-6'>
          <div className='flex flex-wrap items-center gap-2'>
            <Typography.Text className='text-xs !text-semi-color-text-1'>
              &copy; {currentYear} {systemName}. All rights reserved.
            </Typography.Text>
          </div>

          <div className='text-xs'>
            <span className='!text-semi-color-text-1'>
              {t('设计与开发由')}{' '}
            </span>
            <a
              href='https://github.com/QuantumNous/new-api'
              target='_blank'
              rel='noopener noreferrer'
              className='!text-semi-color-primary font-medium no-underline'
            >
              New API
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FooterBar;
