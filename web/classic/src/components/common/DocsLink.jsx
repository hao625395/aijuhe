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
import { Link, useNavigate } from 'react-router-dom';
import { preloadDocsData } from '../../services/docsData';

const isPlainLeftClick = (event) =>
  event.button === 0 &&
  !event.metaKey &&
  !event.altKey &&
  !event.ctrlKey &&
  !event.shiftKey;

const DocsLink = ({ to, onClick, onMouseEnter, onFocus, target, ...props }) => {
  const navigate = useNavigate();

  const prepareDocs = () => {
    preloadDocsData().catch(() => {});
  };

  const handleClick = (event) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      target === '_blank' ||
      !isPlainLeftClick(event)
    ) {
      return;
    }

    event.preventDefault();
    preloadDocsData()
      .catch(() => {})
      .finally(() => navigate(to));
  };

  return (
    <Link
      to={to}
      target={target}
      onMouseEnter={(event) => {
        prepareDocs();
        onMouseEnter?.(event);
      }}
      onFocus={(event) => {
        prepareDocs();
        onFocus?.(event);
      }}
      onClick={handleClick}
      {...props}
    />
  );
};

export default DocsLink;
