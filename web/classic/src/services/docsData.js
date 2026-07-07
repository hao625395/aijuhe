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

let docsDataCache = null;
let docsDataPromise = null;

export const getCachedDocsData = () => docsDataCache;

export const getInitialDocId = (docs, search = '') => {
  if (!Array.isArray(docs) || docs.length === 0) return null;

  const urlParams = new URLSearchParams(search);
  const idParam = urlParams.get('id');
  if (idParam && docs.some((doc) => doc.id === idParam)) {
    return idParam;
  }

  return docs[0].id;
};

export const preloadDocsData = () => {
  if (docsDataCache && docsDataCache.length > 0) {
    return Promise.resolve(docsDataCache);
  }

  if (!docsDataPromise) {
    docsDataPromise = fetch('/docs-data.json?v=20260707-image-html-download', {
      cache: 'no-store',
    })
      .then((res) => res.json())
      .then((data) => {
        docsDataCache = Array.isArray(data) ? data : [];
        return docsDataCache;
      })
      .catch((err) => {
        docsDataPromise = null;
        throw err;
      });
  }

  return docsDataPromise;
};
