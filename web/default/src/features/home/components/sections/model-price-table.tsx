import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Copy, Check, Info, Sparkles, Coins } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { AnimateInView } from '@/components/animate-in-view'

interface ModelPrice {
  name: string
  id: string
  vendor: 'OpenAI' | 'Anthropic' | 'Google' | 'DeepSeek' | 'Alibaba' | 'Midjourney'
  type: 'recommended' | 'standard' | 'cheap' | 'multimodal'
  inputPrice: string // 每百万 Token
  outputPrice: string // 每百万 Token
  features: string[]
}

export function ModelPriceTable() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeType, setActiveType] = useState<'all' | 'recommended' | 'standard' | 'cheap' | 'multimodal'>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const models: ModelPrice[] = [
    {
      name: 'Claude 3.5 Sonnet',
      id: 'claude-3-5-sonnet-20241022',
      vendor: 'Anthropic',
      type: 'recommended',
      inputPrice: '$1.50',
      outputPrice: '$6.00',
      features: ['Stream', 'Tool Call', 'Artifacts', '200K Context']
    },
    {
      name: 'GPT-4o',
      id: 'gpt-4o',
      vendor: 'OpenAI',
      type: 'recommended',
      inputPrice: '$1.25',
      outputPrice: '$5.00',
      features: ['Stream', 'Tool Call', 'Vision', '128K Context']
    },
    {
      name: 'DeepSeek-V3',
      id: 'deepseek-chat',
      vendor: 'DeepSeek',
      type: 'cheap',
      inputPrice: '$0.07',
      outputPrice: '$0.28',
      features: ['Stream', 'Tool Call', '64K Context', 'Super Cheap']
    },
    {
      name: 'DeepSeek-R1 (推理)',
      id: 'deepseek-reasoner',
      vendor: 'DeepSeek',
      type: 'recommended',
      inputPrice: '$0.27',
      outputPrice: '$1.08',
      features: ['Reasoning Chain', 'Stream', 'Deep Thinking']
    },
    {
      name: 'Gemini 1.5 Pro',
      id: 'gemini-1.5-pro-latest',
      vendor: 'Google',
      type: 'standard',
      inputPrice: '$0.60',
      outputPrice: '$2.40',
      features: ['Stream', 'Tool Call', 'Vision', '2M Context']
    },
    {
      name: 'Claude 3.5 Haiku',
      id: 'claude-3-5-haiku-20241022',
      vendor: 'Anthropic',
      type: 'standard',
      inputPrice: '$0.40',
      outputPrice: '$2.00',
      features: ['Stream', 'Fast Reasoning', 'Tool Call']
    },
    {
      name: 'GPT-4o Mini',
      id: 'gpt-4o-mini',
      vendor: 'OpenAI',
      type: 'cheap',
      inputPrice: '$0.07',
      outputPrice: '$0.28',
      features: ['Stream', 'Tool Call', 'Vision', '128K Context']
    },
    {
      name: 'Qwen-Max (通义千问)',
      id: 'qwen-max',
      vendor: 'Alibaba',
      type: 'standard',
      inputPrice: '$0.30',
      outputPrice: '$0.90',
      features: ['Stream', 'Tool Call', 'Search Integrated']
    },
    {
      name: 'Gemini 1.5 Flash',
      id: 'gemini-1.5-flash-latest',
      vendor: 'Google',
      type: 'cheap',
      inputPrice: '$0.035',
      outputPrice: '$0.15',
      features: ['Stream', 'Vision', 'Fastest Speed']
    },
    {
      name: 'Midjourney v6 (画图)',
      id: 'mj-chat-image',
      vendor: 'Midjourney',
      type: 'multimodal',
      inputPrice: '$0.05 / 次',
      outputPrice: '--',
      features: ['High Resolution', 'Upscale', 'Prompt Magic']
    }
  ]

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(text)
    toast.success(t('已复制模型 ID 到剪贴板'))
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredModels = models.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.vendor.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = activeType === 'all' || m.type === activeType
    return matchesSearch && matchesType
  })

  const getVendorBadgeColor = (vendor: string) => {
    switch (vendor) {
      case 'OpenAI':
        return 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 border-emerald-500/20'
      case 'Anthropic':
        return 'bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400 border-amber-500/20'
      case 'Google':
        return 'bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 border-blue-500/20'
      case 'DeepSeek':
        return 'bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400 border-sky-500/20'
      default:
        return 'bg-muted text-muted-foreground border-border/40'
    }
  }

  return (
    <section className='relative z-10 px-6 py-20 bg-linear-to-b from-transparent via-muted/5 to-transparent border-t border-border/30'>
      <div className='mx-auto max-w-6xl'>
        
        {/* Header Block */}
        <AnimateInView className='mb-12 text-center md:mb-16'>
          <div className='mb-3 inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 px-3 py-1 text-xs font-medium text-violet-600 dark:border-violet-400/20 dark:bg-violet-400/5 dark:text-violet-400'>
            <Coins className='size-3.5' />
            <span>实时价格透明公开</span>
          </div>
          <h2 className='text-2.5xl leading-tight font-bold tracking-tight md:text-3.5xl'>
            全球主流 AI 模型计费广场
          </h2>
          <p className='text-muted-foreground/80 mx-auto mt-4 max-w-2xl text-sm leading-relaxed'>
            支持按量计费，无任何隐藏上浮系数。支持模型列表一键同步，按百万 Token 计费，用多少扣多少，为开发者提供高可用的高性价比解决方案。
          </p>
        </AnimateInView>

        {/* Toolbar Section */}
        <div className='flex flex-col md:flex-row gap-4 justify-between items-center mb-6'>
          {/* Tabs */}
          <div className='flex flex-wrap gap-1.5 bg-muted/30 p-1 rounded-xl border border-border/30 dark:border-white/[0.03] backdrop-blur-md w-full md:w-auto'>
            {[
              { id: 'all', label: '全部模型' },
              { id: 'recommended', label: '主力推荐' },
              { id: 'standard', label: '旗舰性能' },
              { id: 'cheap', label: '极低成本' },
              { id: 'multimodal', label: '多模态' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveType(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all shrink-0 ${
                  activeType === tab.id
                    ? 'bg-blue-600 text-white shadow-xs dark:bg-blue-500'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                {t(tab.label)}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className='relative w-full md:w-72'>
            <Search className='absolute left-3 top-2.5 size-4 text-muted-foreground/60' />
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('搜索模型名称或 ID...')}
              className='w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border/50 bg-white/70 shadow-xs dark:border-white/[0.06] dark:bg-[#0b0f17]/70 backdrop-blur-md focus:border-blue-500 focus:outline-hidden text-foreground'
            />
          </div>
        </div>

        {/* Price Table Card */}
        <Card className='border-border/50 bg-white/60 dark:bg-[#0b0f17]/60 shadow-md backdrop-blur-md dark:border-white/[0.05] overflow-hidden'>
          <CardContent className='p-0 overflow-x-auto'>
            <table className='w-full border-collapse text-left min-w-[700px]'>
              <thead>
                <tr className='border-b border-border/40 dark:border-white/[0.04] bg-muted/20 text-[11px] font-bold text-muted-foreground uppercase tracking-wider'>
                  <th className='py-4.5 px-6'>{t('大模型名称')}</th>
                  <th className='py-4.5 px-6'>{t('模型 ID (API 调用标识)')}</th>
                  <th className='py-4.5 px-6'>{t('输入价格 (/1M Tokens)')}</th>
                  <th className='py-4.5 px-6'>{t('输出价格 (/1M Tokens)')}</th>
                  <th className='py-4.5 px-6 hidden lg:table-cell'>{t('特性标签')}</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border/40 dark:divide-white/[0.03] text-xs'>
                {filteredModels.length > 0 ? (
                  filteredModels.map((m) => (
                    <tr key={m.id} className='group hover:bg-muted/10 transition-colors'>
                      {/* Name & Vendor */}
                      <td className='py-4.5 px-6 font-medium text-foreground'>
                        <div className='flex items-center gap-2.5'>
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md border ${getVendorBadgeColor(m.vendor)}`}>
                            {m.vendor}
                          </span>
                          <span>{m.name}</span>
                        </div>
                      </td>

                      {/* Model ID */}
                      <td className='py-4.5 px-6 font-mono text-muted-foreground relative'>
                        <div className='flex items-center gap-2 group/copy'>
                          <code className='bg-muted/40 dark:bg-white/[0.02] border border-border/30 px-2 py-0.5 rounded text-[10px] select-all'>
                            {m.id}
                          </code>
                          <button
                            onClick={() => handleCopy(m.id)}
                            className='opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-all'
                          >
                            {copiedId === m.id ? (
                              <Check className='size-3 text-emerald-500' />
                            ) : (
                              <Copy className='size-3' />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Input Price */}
                      <td className='py-4.5 px-6 font-semibold text-emerald-500 dark:text-emerald-400'>
                        {m.inputPrice}
                      </td>

                      {/* Output Price */}
                      <td className='py-4.5 px-6 font-semibold text-blue-500 dark:text-blue-400'>
                        {m.outputPrice}
                      </td>

                      {/* Features */}
                      <td className='py-4.5 px-6 hidden lg:table-cell'>
                        <div className='flex flex-wrap gap-1'>
                          {m.features.map((feat) => (
                            <span
                              key={feat}
                              className='px-1.5 py-0.5 rounded bg-muted/65 text-[9px] font-medium text-muted-foreground/80'
                            >
                              {feat}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className='py-12 text-center text-muted-foreground'>
                      <Info className='size-8 mx-auto mb-2 text-muted-foreground/40' />
                      {t('未找到匹配的模型价格条目')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Dynamic Tip Card */}
        <div className='mt-5 flex gap-3 p-4 rounded-xl border border-violet-500/10 bg-violet-500/5 text-xs text-muted-foreground leading-relaxed'>
          <Sparkles className='size-4 text-violet-500 shrink-0 mt-0.5' />
          <p>
            我们支持与上游渠道实时同步最新的大模型资产。上面价格为标准中转单价估算，对于大量并发调用或企业级接入，可在后台享受更多特惠比例抵扣及自定义分组倍率折扣。
          </p>
        </div>

      </div>
    </section>
  )
}
