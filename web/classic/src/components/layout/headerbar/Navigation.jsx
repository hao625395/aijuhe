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
import { Link, useLocation } from 'react-router-dom';
import DocsLink from '../../common/DocsLink';
import SkeletonWrapper from '../components/SkeletonWrapper';

const Navigation = ({
  mainNavLinks,
  isMobile,
  isLoading,
  userState,
  pricingRequireAuth,
}) => {
  const location = useLocation();

  const renderNavLinks = () => {
    const baseClasses =
      'flex-shrink-0 flex items-center gap-1 font-semibold rounded-md transition-all duration-200 ease-in-out';
    const spacingClasses = isMobile ? 'p-1' : 'p-2';

    return mainNavLinks.map((link) => {
      const linkContent = <span>{link.text}</span>;

      if (link.isExternal) {
        const commonLinkClasses = `${baseClasses} ${spacingClasses} hover:text-blue-500 text-zinc-650 dark:text-zinc-400 dark:hover:text-blue-400`;
        return (
          <a
            key={link.itemKey}
            href={link.externalLink}
            target='_blank'
            rel='noopener noreferrer'
            className={commonLinkClasses}
          >
            {linkContent}
          </a>
        );
      }

      let targetPath = link.to;
      if (link.itemKey === 'console' && !userState.user) {
        targetPath = '/login';
      }
      if (link.itemKey === 'pricing' && pricingRequireAuth && !userState.user) {
        targetPath = '/login';
      }

      const isActive = link.itemKey === 'contact'
        ? (location.pathname === '/docs' && location.search.includes('contact-customer-service'))
        : link.itemKey === 'docs'
          ? (location.pathname === '/docs' && !location.search.includes('contact-customer-service'))
          : location.pathname === link.to;

      const activeClasses = isActive
        ? 'text-blue-500 font-semibold relative after:absolute after:-bottom-1 after:left-1 after:right-1 after:h-[2px] after:bg-blue-500 after:rounded-full'
        : 'text-zinc-650 hover:text-blue-500 dark:text-zinc-400 dark:hover:text-blue-400';

      const linkClasses = `${baseClasses} ${spacingClasses} ${activeClasses}`;

      const LinkComponent = targetPath.startsWith('/docs') ? DocsLink : Link;

      return (
        <LinkComponent key={link.itemKey} to={targetPath} className={linkClasses}>
          {linkContent}
        </LinkComponent>
      );
    });
  };

  return (
    <nav className='flex flex-1 items-center gap-1 lg:gap-2 mx-2 md:mx-4 overflow-x-auto whitespace-nowrap scrollbar-hide'>
      <SkeletonWrapper
        loading={isLoading}
        type='navigation'
        count={4}
        width={60}
        height={16}
        isMobile={isMobile}
      >
        {renderNavLinks()}
      </SkeletonWrapper>
    </nav>
  );
};

export default Navigation;
