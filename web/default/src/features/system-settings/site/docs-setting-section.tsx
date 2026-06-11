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
import * as z from 'zod'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { FormDirtyIndicator } from '../components/form-dirty-indicator'
import { FormNavigationGuard } from '../components/form-navigation-guard'
import {
  SettingsForm,
  SettingsFormGrid,
  SettingsFormGridItem,
} from '../components/settings-form-layout'
import { SettingsPageFormActions } from '../components/settings-page-context'
import { SettingsSection } from '../components/settings-section'
import { useSettingsForm } from '../hooks/use-settings-form'
import { useUpdateOption } from '../hooks/use-update-option'

const docsSettingSchema = z.object({
  DocsSystemName: z.string().optional(),
  DocsServerAddress: z.string().optional(),
  DocsClientDownloadLink: z.string().optional(),
  DocsDiscordLink: z.string().optional(),
  DocsImgWalletEntry: z.string().optional(),
  DocsImgOrderPage: z.string().optional(),
  DocsImgCodeMessage: z.string().optional(),
  DocsImgCodeExchange: z.string().optional(),
  DocsImgDownloadRelease: z.string().optional(),
  DocsImgOpenai1: z.string().optional(),
  DocsImgOpenai2: z.string().optional(),
  DocsImgOpenai3: z.string().optional(),
  DocsImgOpenai4: z.string().optional(),
  DocsImgOpenai5: z.string().optional(),
  DocsImgClaude1: z.string().optional(),
  DocsImgClaude2: z.string().optional(),
  DocsImgModleAlias: z.string().optional(),
  DocsImgClaude3: z.string().optional(),
  DocsImgClaude5: z.string().optional(),
  DocsImgClaude6: z.string().optional(),
  DocsImgClaudeDesktop1: z.string().optional(),
  DocsImgClaudeDesktop2: z.string().optional(),
  DocsImgClaudeDesktop3: z.string().optional(),
  DocsImgClaudeDesktop4: z.string().optional(),
  DocsImgClaudeDesktop5: z.string().optional(),
})

type DocsSettingFormValues = z.infer<typeof docsSettingSchema>

type DocsSettingSectionProps = {
  defaultValues: DocsSettingFormValues
}

function normalizeValue(value: unknown): string {
  if (value === undefined || value === null) return ''
  return typeof value === 'string' ? value : String(value)
}

export function DocsSettingSection({ defaultValues }: DocsSettingSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()

  const normalizedDefaults: DocsSettingFormValues = {
    DocsSystemName: normalizeValue(defaultValues.DocsSystemName) || '二狗子',
    DocsServerAddress: normalizeValue(defaultValues.DocsServerAddress) || 'https://ergouzi.life',
    DocsClientDownloadLink: normalizeValue(defaultValues.DocsClientDownloadLink) || 'https://github.com/farion1231/cc-switch/releases',
    DocsDiscordLink: normalizeValue(defaultValues.DocsDiscordLink) || 'https://discord.gg/Cq8JRkuQz',
    DocsImgWalletEntry: normalizeValue(defaultValues.DocsImgWalletEntry),
    DocsImgOrderPage: normalizeValue(defaultValues.DocsImgOrderPage),
    DocsImgCodeMessage: normalizeValue(defaultValues.DocsImgCodeMessage),
    DocsImgCodeExchange: normalizeValue(defaultValues.DocsImgCodeExchange),
    DocsImgDownloadRelease: normalizeValue(defaultValues.DocsImgDownloadRelease),
    DocsImgOpenai1: normalizeValue(defaultValues.DocsImgOpenai1),
    DocsImgOpenai2: normalizeValue(defaultValues.DocsImgOpenai2),
    DocsImgOpenai3: normalizeValue(defaultValues.DocsImgOpenai3),
    DocsImgOpenai4: normalizeValue(defaultValues.DocsImgOpenai4),
    DocsImgOpenai5: normalizeValue(defaultValues.DocsImgOpenai5),
    DocsImgClaude1: normalizeValue(defaultValues.DocsImgClaude1),
    DocsImgClaude2: normalizeValue(defaultValues.DocsImgClaude2),
    DocsImgModleAlias: normalizeValue(defaultValues.DocsImgModleAlias),
    DocsImgClaude3: normalizeValue(defaultValues.DocsImgClaude3),
    DocsImgClaude5: normalizeValue(defaultValues.DocsImgClaude5),
    DocsImgClaude6: normalizeValue(defaultValues.DocsImgClaude6),
    DocsImgClaudeDesktop1: normalizeValue(defaultValues.DocsImgClaudeDesktop1),
    DocsImgClaudeDesktop2: normalizeValue(defaultValues.DocsImgClaudeDesktop2),
    DocsImgClaudeDesktop3: normalizeValue(defaultValues.DocsImgClaudeDesktop3),
    DocsImgClaudeDesktop4: normalizeValue(defaultValues.DocsImgClaudeDesktop4),
    DocsImgClaudeDesktop5: normalizeValue(defaultValues.DocsImgClaudeDesktop5),
  }

  const { form, handleSubmit, handleReset, isDirty, isSubmitting } =
    useSettingsForm<DocsSettingFormValues>({
      resolver: zodResolver(docsSettingSchema) as Resolver<
        DocsSettingFormValues,
        unknown,
        DocsSettingFormValues
      >,
      defaultValues: normalizedDefaults,
      onSubmit: async (_data, changedFields) => {
        for (const [key, value] of Object.entries(changedFields)) {
          const v = normalizeValue(value)
          await updateOption.mutateAsync({
            key,
            value: v,
          })
        }
      },
    })

  return (
    <>
      <FormNavigationGuard when={isDirty} />

      <SettingsSection title={t('Built-in Documentation Settings')}>
        <Form {...form}>
          <SettingsForm onSubmit={handleSubmit}>
            <SettingsPageFormActions
              onSave={handleSubmit}
              onReset={handleReset}
              isSaving={isSubmitting || updateOption.isPending}
              isResetDisabled={!isDirty}
            />
            <FormDirtyIndicator isDirty={isDirty} />
            <SettingsFormGrid>
              <FormField
                control={form.control}
                name="DocsSystemName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Documentation system name')}</FormLabel>
                    <FormControl>
                      <Input placeholder="默认：二狗子" {...field} />
                    </FormControl>
                    <FormDescription>
                      {t('The system name shown in documentation context (replaces default brand names)')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="DocsServerAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Documentation API server address')}</FormLabel>
                    <FormControl>
                      <Input placeholder="默认：https://ergouzi.life" {...field} />
                    </FormControl>
                    <FormDescription>
                      {t('The endpoint domain shown in connection configuration instructions')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="DocsClientDownloadLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('CC Switch download link')}</FormLabel>
                    <FormControl>
                      <Input placeholder="默认：https://github.com/farion1231/cc-switch/releases" {...field} />
                    </FormControl>
                    <FormDescription>
                      {t('The download link provided for downloading the CC Switch application client')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="DocsDiscordLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Discord support community link')}</FormLabel>
                    <FormControl>
                      <Input placeholder="默认：https://discord.gg/Cq8JRkuQz" {...field} />
                    </FormControl>
                    <FormDescription>
                      {t('The community/support link users are directed to for help in the documentation')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SettingsFormGridItem span="full">
                <Accordion type="single" collapsible defaultValue="" className="w-full">
                  <AccordionItem value="images" className="border-none">
                    <AccordionTrigger className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                      {t('Advanced: Custom Documentation Screenshots (leave empty to use default local assets)')}
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <div className="space-y-6">
                        <div>
                          <div className="text-xs font-semibold text-muted-foreground mb-3">
                            {t('1. Balance Top-up Screenshots')}
                          </div>
                          <SettingsFormGrid>
                            <FormField
                              control={form.control}
                              name="DocsImgWalletEntry"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('Wallet balance top-up entry screenshot')}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="默认本地：/docs-assets/purchase/wallet-entry.png" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="DocsImgOrderPage"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('External order checkout page screenshot')}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="默认本地：/docs-assets/purchase/order-page.png" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="DocsImgCodeMessage"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('Received redeem code message screenshot')}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="默认本地：/docs-assets/purchase/code-message.png" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="DocsImgCodeExchange"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('Successful redemption status screenshot')}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="默认本地：/docs-assets/purchase/code-exchange.png" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </SettingsFormGrid>
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-muted-foreground mb-3">
                            {t('2. CC Switch Config Codex Screenshots')}
                          </div>
                          <SettingsFormGrid>
                            <FormField
                              control={form.control}
                              name="DocsImgDownloadRelease"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('Client download and main dashboard screenshot')}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="默认本地：/docs-assets/cc-switch/download-release.png" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="DocsImgOpenai1"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('Codex add provider button screenshot')}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="默认本地：/docs-assets/cc-switch/openai-1.png" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="DocsImgOpenai2"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('Provide configuration name input screenshot')}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="默认本地：/docs-assets/cc-switch/openai-2.png" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="DocsImgOpenai3"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('API base address and key input screenshot')}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="默认本地：/docs-assets/cc-switch/openai-3.png" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="DocsImgOpenai4"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('Configuration generated confirmation screenshot')}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="默认本地：/docs-assets/cc-switch/openai-4.png" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="DocsImgOpenai5"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('Test and activate connection status screenshot')}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="默认本地：/docs-assets/cc-switch/openai-5.png" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </SettingsFormGrid>
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-muted-foreground mb-3">
                            {t('3. CC Switch Config Claude Code Screenshots')}
                          </div>
                          <SettingsFormGrid>
                            <FormField
                              control={form.control}
                              name="DocsImgClaude1"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('Claude provider add action screenshot')}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="默认本地：/docs-assets/cc-switch/claude-1.png" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="DocsImgClaude2"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('Claude API keys and base config screenshot')}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="默认本地：/docs-assets/cc-switch/claude-2.png" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="DocsImgModleAlias"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('Advanced model mapping alias setting screenshot')}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="默认本地：/docs-assets/cc-switch/modle-alias.png" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="DocsImgClaude3"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('Claude connection active confirmation screenshot')}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="默认本地：/docs-assets/cc-switch/claude-3.png" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="DocsImgClaude5"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('Sync plugin status active settings screenshot')}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="默认本地：/docs-assets/cc-switch/claude-5.png" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="DocsImgClaude6"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('CLI dialog success response chat screenshot')}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="默认本地：/docs-assets/cc-switch/claude-6.png" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </SettingsFormGrid>
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-muted-foreground mb-3">
                            {t('4. CC Switch Config Claude Desktop Screenshots')}
                          </div>
                          <SettingsFormGrid>
                            <FormField
                              control={form.control}
                              name="DocsImgClaudeDesktop1"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('Desktop provider add action screenshot')}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="默认本地：/docs-assets/cc-switch/claude-desktop-1.png" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="DocsImgClaudeDesktop2"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('API base address list display screenshot')}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="默认本地：/docs-assets/cc-switch/claude-desktop-2.png" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="DocsImgClaudeDesktop3"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('Role and model list configuration mappings screenshot')}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="默认本地：/docs-assets/cc-switch/claude-desktop-3.png" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="DocsImgClaudeDesktop4"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('Active request route intercept status screenshot')}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="默认本地：/docs-assets/cc-switch/claude-desktop-4.png" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="DocsImgClaudeDesktop5"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('Claude Desktop chat connect success screenshot')}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="默认本地：/docs-assets/cc-switch/claude-desktop-5.png" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </SettingsFormGrid>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </SettingsFormGridItem>
            </SettingsFormGrid>
          </SettingsForm>
        </Form>
      </SettingsSection>
    </>
  )
}
