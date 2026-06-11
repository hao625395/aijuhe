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
import { SettingsPage } from '../components/settings-page'
import type { SiteSettings } from '../types'
import {
  SITE_DEFAULT_SECTION,
  getSiteSectionContent,
  getSiteSectionMeta,
} from './section-registry.tsx'

const defaultSiteSettings: SiteSettings = {
  'theme.frontend': 'default',
  Notice: '',
  SystemName: 'New API',
  Logo: '',
  Footer: '',
  About: '',
  HomePageContent: '',
  ServerAddress: '',
  'legal.user_agreement': '',
  'legal.privacy_policy': '',
  HeaderNavModules: '',
  SidebarModulesAdmin: '',
  DocsSystemName: '二狗子',
  DocsServerAddress: 'https://ergouzi.life',
  DocsClientDownloadLink: 'https://github.com/farion1231/cc-switch/releases',
  DocsDiscordLink: 'https://discord.gg/Cq8JRkuQz',
  DocsImgWalletEntry: '',
  DocsImgOrderPage: '',
  DocsImgCodeMessage: '',
  DocsImgCodeExchange: '',
  DocsImgDownloadRelease: '',
  DocsImgOpenai1: '',
  DocsImgOpenai2: '',
  DocsImgOpenai3: '',
  DocsImgOpenai4: '',
  DocsImgOpenai5: '',
  DocsImgClaude1: '',
  DocsImgClaude2: '',
  DocsImgModleAlias: '',
  DocsImgClaude3: '',
  DocsImgClaude5: '',
  DocsImgClaude6: '',
  DocsImgClaudeDesktop1: '',
  DocsImgClaudeDesktop2: '',
  DocsImgClaudeDesktop3: '',
  DocsImgClaudeDesktop4: '',
  DocsImgClaudeDesktop5: '',
}


export function SiteSettings() {
  return (
    <SettingsPage
      routePath='/_authenticated/system-settings/site/$section'
      defaultSettings={defaultSiteSettings}
      defaultSection={SITE_DEFAULT_SECTION}
      getSectionContent={getSiteSectionContent}
      getSectionMeta={getSiteSectionMeta}
    />
  )
}
