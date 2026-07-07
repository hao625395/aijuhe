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

export * from './history';
export * from './auth';
export * from './utils';
export {
  isAdmin,
  isRoot,
  getSystemName,
  getLogo,
  getUserIdFromLocalStorage,
  getFooterHTML,
  copy,
  showError,
  showWarning,
  showSuccess,
  showInfo,
  showNotice,
  openPage,
  removeTrailingSlash,
  getTodayStartTimestamp,
  timestamp2string,
  timestamp2string1,
  isDataCrossYear,
  downloadTextAsFile,
  verifyJSON,
  verifyJSONPromise,
  shouldShowPrompt,
  setPromptShown,
  compareObjects,
  generateMessageId,
  getTextContent,
  processThinkTags,
  processIncompleteThinkTags,
  buildMessageContent,
  createMessage,
  createLoadingAssistantMessage,
  hasImageContent,
  formatMessageForAPI,
  isValidMessage,
  getLastUserMessage,
  getLastAssistantMessage,
  getRelativeTime,
  formatDateString,
  formatDateTimeString,
  getTableCompactMode,
  setTableCompactMode,
  selectFilter,
  calculateModelPrice,
  getModelPriceItems,
  formatDynamicPriceSummary,
  formatPriceInfo,
  createCardProPagination,
  resetPricingFilters,
} from './utils';
export * from './base64';
export * from './api';
export * from './render';
export * from './log';
export * from './data';
export * from './token';
export * from './boolean';
export * from './dashboard';
export * from './passkey';
export * from './statusCodeRules';
