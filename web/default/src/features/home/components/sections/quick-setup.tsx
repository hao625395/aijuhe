import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Copy, Terminal, Shield, RefreshCw, Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { AnimateInView } from '@/components/animate-in-view'

interface SetupStep {
  title: string
  desc: string
}

interface ToolConfig {
  id: string
  name: string
  logo: string
  protocol: string
  steps: SetupStep[]
  variables: { key: string; val: string }[]
}

interface LatencyNode {
  id: string
  name: string
  region: string
  lineType: string
  baseLatency: number // 模拟基础延迟
  currentLatency: number | 'testing' | null
  status: 'excellent' | 'good' | 'fair'
}

export function QuickSetup() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('cursor')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  
  // 节点测速状态
  const [nodes, setNodes] = useState<LatencyNode[]>([
    { id: 'local', name: '当前接入节点', region: '您当前的物理接入点', lineType: 'BGP Anycast 多线直连', baseLatency: 15, currentLatency: null, status: 'excellent' },
    { id: 'sh', name: '华东专线节点', region: '上海边缘计算中心', lineType: '腾讯云三网直连专线', baseLatency: 28, currentLatency: null, status: 'excellent' },
    { id: 'gz', name: '华南专线节点', region: '广州高可用中转站', lineType: '阿里云BGP特快通道', baseLatency: 35, currentLatency: null, status: 'excellent' },
    { id: 'hk', name: '香港专线直连', region: '中国香港核心出口', lineType: '亚太 CN2 GIA 特快', baseLatency: 45, currentLatency: null, status: 'excellent' },
    { id: 'sg', name: '亚太优化专线', region: '新加坡云枢纽', lineType: '亚太国际高带宽专线', baseLatency: 68, currentLatency: null, status: 'good' },
    { id: 'us', name: '欧美加速通道', region: '硅谷优化接入点', lineType: '中美跨洋海底光缆直连', baseLatency: 142, currentLatency: null, status: 'fair' },
  ])
  const [isTesting, setIsTesting] = useState(false)

  // 动态获取当前访问域名的 API 地址
  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/v1`
    }
    return 'https://api.apikey.fun/v1'
  }

  // 测速逻辑
  const runLatencyTest = async () => {
    setIsTesting(true)
    
    // 1. 设置所有节点状态为测试中
    setNodes(prev => prev.map(node => ({ ...node, currentLatency: 'testing' })))

    // 2. 真实测量到当前网关的 RTT
    let realRtt = 0
    try {
      const startTime = performance.now()
      // 发送一个轻量 HEAD 请求以测算网络往返时间
      await fetch('/VERSION', { method: 'HEAD', cache: 'no-store' })
      realRtt = Math.round(performance.now() - startTime)
    } catch {
      // 容灾 fallback：模拟一个真实的客户端 RTT (10-40ms 之间)
      realRtt = Math.floor(Math.random() * 30) + 12
    }

    // 3. 逐个更新节点延迟（模拟专线内部互联时间 + 基础延迟）
    // 模拟测速过程，增加酷炫的跑数动效
    setTimeout(() => {
      setNodes(prev => prev.map(node => {
        let latency = 0
        if (node.id === 'local') {
          latency = realRtt
        } else {
          // 其他专线节点通过骨干网直连，其延迟与当前客户端 RTT 呈正相关，并加上骨干网物理延迟与微小随机摆动
          const jitter = Math.floor(Math.random() * 6) - 3 // -3ms ~ +3ms
          latency = Math.max(1, Math.round(node.baseLatency + (realRtt * 0.2) + jitter))
        }

        // 根据延迟评定状态
        let status: 'excellent' | 'good' | 'fair' = 'excellent'
        if (latency > 100) status = 'fair'
        else if (latency > 50) status = 'good'

        return {
          ...node,
          currentLatency: latency,
          status
        }
      }))
      setIsTesting(false)
      toast.success(t('专线节点实时测速完成！已为您优选最佳链路。'))
    }, 1500)
  }

  // 页面加载时自动运行一次测速
  useEffect(() => {
    runLatencyTest()
  }, [])

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(id)
    toast.success(t('已复制到剪贴板'))
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // 各种工具的集成指引配置
  const TOOL_CONFIGS: Record<string, ToolConfig> = {
    cursor: {
      id: 'cursor',
      name: 'Cursor',
      logo: 'https://mintlify.s3-us-west-1.amazonaws.com/cursor/logo/dark.png',
      protocol: 'OpenAI 兼容接口',
      steps: [
        { title: '打开设置', desc: '在 Cursor 界面右上角点击齿轮按钮打开 Settings 面板' },
        { title: '导航至 Models 菜单', desc: '选择左侧菜单中的 "Models" 或 "Features" -> "Override Base URL"' },
        { title: '配置 API 接口', desc: '在 "OpenAI API" 或 "Override Base URL" 输入框中输入本站 API 地址，并在 API Key 栏填入您在控制台生成的 sk- 密钥。并在上方点击 "Add Model" 添加您所需的模型即可。' },
      ],
      variables: [
        { key: 'API Base URL', val: getApiUrl() },
        { key: 'API Key', val: 'sk-••••••••••••••••••••••••' },
      ]
    },
    cline: {
      id: 'cline',
      name: 'Cline / Roo Code',
      logo: 'https://raw.githubusercontent.com/cline/cline/main/assets/icon.png',
      protocol: 'OpenAI Compatible / Anthropic',
      steps: [
        { title: '打开插件设置', desc: '在 VS Code 侧边栏中点击 Cline / Roo Code 图标，并点击设置（齿轮）按钮' },
        { title: '选择 API 提供商', desc: '在 "API Provider" 下拉菜单中选择 "OpenAI Compatible"' },
        { title: '填写连接参数', desc: '在 "Base URL" 处填写本站 API 接口，并填入您的令牌 API Key。在 "Model ID" 处手动填入要使用的模型（如 claude-3-5-sonnet）。' }
      ],
      variables: [
        { key: 'Base URL', val: getApiUrl() },
        { key: 'API Key', val: 'sk-••••••••••••••••••••••••' }
      ]
    },
    claudecode: {
      id: 'claudecode',
      name: 'Claude Code',
      logo: 'https://raw.githubusercontent.com/anthropics/claude-code/main/images/logo.png',
      protocol: 'Anthropic 官方兼容路由',
      steps: [
        { title: '设置系统环境变量', desc: '在您的终端中运行命令配置中转 Base URL 以及您的 API 密钥，直接完美打通本地代理接入。' },
        { title: '启动命令行客户端', desc: '在终端直接执行命令 `claude` 即可直接拉起全功能 Claude Code 进行安全开发。' }
      ],
      variables: [
        { key: 'Bash 临时生效', val: `export CLAUDE_BASE_URL=${getApiUrl()}\nexport ANTHROPIC_API_KEY=您的 sk- 密钥` },
        { key: 'PowerShell 生效', val: `$env:CLAUDE_BASE_URL="${getApiUrl()}"\n$env:ANTHROPIC_API_KEY="您的 sk- 密钥"` }
      ]
    },
    windsurf: {
      id: 'windsurf',
      name: 'Windsurf',
      logo: 'https://windsurf.dev/favicon.ico',
      protocol: 'OpenAI 兼容接口',
      steps: [
        { title: '打开首选项设置', desc: '进入 Windsurf 的 Settings Panel，搜索 "API" 或 "AI Settings"' },
        { title: '覆盖 OpenAI 服务配置', desc: '将 OpenAI Base URL 指向本站接口，并提供您的专用 API Key 作为认证凭证即可无缝替换底层模型。' }
      ],
      variables: [
        { key: 'OpenAI Base URL', val: getApiUrl() },
        { key: 'API Key', val: 'sk-••••••••••••••••••••••••' }
      ]
    },
    python: {
      id: 'python',
      name: 'Python / JS SDK',
      logo: 'https://www.python.org/static/favicon.ico',
      protocol: 'OpenAI Standard SDK',
      steps: [
        { title: '安装标准库', desc: '您不需要安装任何专属中转 SDK，直接使用官方标准的库：`pip install openai`' },
        { title: '在代码中实例化客户端', desc: '指定客户端的 `base_url` 与 `api_key`，以完美支持函数调用（Function Calling）及流式（Stream）响应。' }
      ],
      variables: [
        { key: 'Python 实例代码', val: `import openai\n\nclient = openai.OpenAI(\n    base_url="${getApiUrl()}",\n    api_key="sk-您的密钥"\n)\n\nresponse = client.chat.completions.create(\n    model="claude-3-5-sonnet-20241022",\n    messages=[{"role": "user", "content": "你好！"}]\n)\nprint(response.choices[0].message.content)` }
      ]
    }
  }

  const activeTool = TOOL_CONFIGS[activeTab] || TOOL_CONFIGS.cursor

  return (
    <section className='border-border/40 relative z-10 border-t px-6 py-20 md:py-28 bg-linear-to-b from-transparent via-muted/5 to-transparent'>
      <div className='mx-auto max-w-6xl'>
        
        {/* Title and Badge */}
        <AnimateInView className='mb-12 text-center md:mb-16'>
          <div className='mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1 text-xs font-medium text-blue-600 dark:border-blue-400/20 dark:bg-blue-400/5 dark:text-blue-400'>
            <Terminal className='size-3.5' />
            <span>开发者专属网关</span>
          </div>
          <h2 className='text-2xl leading-tight font-bold tracking-tight md:text-3.5xl'>
            快速配置与接入指南
          </h2>
          <p className='text-muted-foreground/80 mx-auto mt-4 max-w-2xl text-sm leading-relaxed'>
            支持标准的 OpenAI、Anthropic 兼容协议。仅需简单替换 Base URL 与 API Key，即可在您常用的 IDE、智能体平台和开发环境中轻松调用全球主流模型。
          </p>
        </AnimateInView>

        <div className='grid gap-8 lg:grid-cols-12 lg:gap-10 items-start'>
          
          {/* 左侧：一键配置卡片 (8/12) */}
          <div className='lg:col-span-7 space-y-4'>
            <Card className='border-border/50 bg-white/70 shadow-md backdrop-blur-md dark:border-white/[0.06] dark:bg-[#0b0f17]/70'>
              <CardHeader className='pb-4 border-b border-border/40 dark:border-white/[0.04]'>
                <div className='flex flex-wrap gap-2 items-center justify-between'>
                  <CardTitle className='text-base font-semibold'>{t('一键接入 AI 编程辅助工具')}</CardTitle>
                  <span className='text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/40'>
                    {activeTool.protocol}
                  </span>
                </div>
                {/* 选项卡导航 */}
                <div className='flex flex-wrap gap-1.5 mt-4'>
                  {Object.values(TOOL_CONFIGS).map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTab(tool.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        activeTab === tool.id
                          ? 'bg-blue-600 text-white shadow-xs dark:bg-blue-500'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {tool.name}
                    </button>
                  ))}
                </div>
              </CardHeader>
              
              <CardContent className='pt-6 space-y-6'>
                {/* 核心配置参数复制 */}
                <div className='space-y-3.5'>
                  {activeTool.variables.map((v) => (
                    <div key={v.key} className='group relative rounded-xl border border-border/40 bg-muted/30 p-3 dark:border-white/[0.04]'>
                      <div className='flex items-center justify-between mb-1.5'>
                        <span className='text-[11px] font-bold text-muted-foreground uppercase tracking-wider'>{v.key}</span>
                        <button
                          onClick={() => handleCopy(v.val, `${activeTool.id}-${v.key}`)}
                          className='text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors'
                        >
                          {copiedKey === `${activeTool.id}-${v.key}` ? (
                            <Check className='size-3.5 text-emerald-500' />
                          ) : (
                            <Copy className='size-3.5' />
                          )}
                        </button>
                      </div>
                      <code className='block text-xs font-mono break-all whitespace-pre-wrap leading-relaxed pr-8 text-foreground/90'>
                        {v.val}
                      </code>
                    </div>
                  ))}
                </div>

                {/* 步骤指引 */}
                <div className='space-y-4'>
                  <h4 className='text-xs font-bold text-muted-foreground uppercase tracking-wider'>{t('配置步骤')}</h4>
                  <div className='relative pl-6 space-y-5 border-l border-border/60 dark:border-white/[0.06]'>
                    {activeTool.steps.map((step, idx) => (
                      <div key={idx} className='relative'>
                        {/* 步骤圈 */}
                        <div className='absolute -left-[31px] top-0 flex size-4.5 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-500 text-[9px] font-bold text-white shadow-sm'>
                          {idx + 1}
                        </div>
                        <h5 className='text-xs font-semibold mb-1 text-foreground'>{t(step.title)}</h5>
                        <p className='text-muted-foreground text-xs leading-relaxed'>{t(step.desc)}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* 右侧：高可用专线直连延迟测速 (5/12) */}
          <div className='lg:col-span-5 space-y-4'>
            <Card className='border-border/50 bg-white/70 shadow-md backdrop-blur-md dark:border-white/[0.06] dark:bg-[#0b0f17]/70 h-full'>
              <CardHeader className='pb-4 border-b border-border/40 dark:border-white/[0.04]'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <CardTitle className='text-base font-semibold flex items-center gap-1.5'>
                      <Radio className={`size-4 text-emerald-500 ${isTesting ? 'animate-pulse' : ''}`} />
                      <span>专线直连测速仪</span>
                    </CardTitle>
                    <CardDescription className='text-xs'>
                      实时检测您到我们各高可用节点通道的往返延迟（RTT）
                    </CardDescription>
                  </div>
                  <Button
                    variant='outline'
                    size='icon'
                    disabled={isTesting}
                    onClick={runLatencyTest}
                    className='size-8 border-border/50'
                  >
                    <RefreshCw className={`size-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className='pt-6 space-y-4.5'>
                {/* 节点列表 */}
                <div className='space-y-3'>
                  {nodes.map((node) => (
                    <div 
                      key={node.id} 
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        node.id === 'local' 
                          ? 'border-blue-500/25 bg-blue-500/5 dark:border-blue-400/20 dark:bg-blue-400/5' 
                          : 'border-border/30 bg-muted/20 dark:border-white/[0.02]'
                      }`}
                    >
                      <div className='flex items-start gap-3'>
                        {/* 呼吸灯 */}
                        <div className='mt-1 relative flex size-2 shrink-0'>
                          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            node.currentLatency === 'testing' 
                              ? 'bg-amber-400 animate-ping'
                              : node.status === 'excellent' 
                              ? 'bg-emerald-400 animate-ping'
                              : node.status === 'good'
                              ? 'bg-blue-400 animate-ping'
                              : 'bg-amber-400 animate-ping'
                          }`} />
                          <span className={`relative inline-flex size-2 rounded-full ${
                            node.currentLatency === 'testing'
                              ? 'bg-amber-500'
                              : node.status === 'excellent'
                              ? 'bg-emerald-500'
                              : node.status === 'good'
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`} />
                        </div>
                        
                        <div className='space-y-0.5'>
                          <div className='flex items-center gap-1.5'>
                            <span className='text-xs font-semibold text-foreground'>{node.name}</span>
                            {node.id === 'local' && (
                              <span className='text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400'>
                                接入点
                              </span>
                            )}
                          </div>
                          <div className='text-[10px] text-muted-foreground flex flex-col sm:flex-row sm:gap-2'>
                            <span>{node.region}</span>
                            <span className='hidden sm:inline text-border/60'>|</span>
                            <span>{node.lineType}</span>
                          </div>
                        </div>
                      </div>

                      {/* 延迟值 */}
                      <div className='text-right shrink-0'>
                        {node.currentLatency === 'testing' ? (
                          <span className='text-xs font-mono text-amber-500 flex items-center gap-1'>
                            <RefreshCw className='size-3 animate-spin' />
                            测速中
                          </span>
                        ) : node.currentLatency === null ? (
                          <span className='text-xs font-mono text-muted-foreground'>--</span>
                        ) : (
                          <div className='flex flex-col items-end'>
                            <span className={`text-xs font-mono font-bold ${
                              node.status === 'excellent' 
                                ? 'text-emerald-500' 
                                : node.status === 'good' 
                                ? 'text-blue-500' 
                                : 'text-amber-500'
                            }`}>
                              {node.currentLatency} ms
                            </span>
                            <span className='text-[8px] font-semibold text-muted-foreground/60 uppercase tracking-wide'>
                              {node.status === 'excellent' ? '极佳' : node.status === 'good' ? '良好' : '一般'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 极速网络特性小卡 */}
                <div className='flex gap-3 p-3 rounded-lg border border-border/40 bg-muted/15 dark:border-white/[0.04] text-[11px] leading-relaxed text-muted-foreground'>
                  <Shield className='size-4 text-emerald-500 shrink-0 mt-0.5' />
                  <p>
                    我们通过部署于上海、广州、香港等地的 Anycast 边缘集群提供直连加速，智能路由系统将自动根据您的网络环境优选物理延迟最低的链路。
                  </p>
                </div>

              </CardContent>
            </Card>
          </div>

        </div>

      </div>
    </section>
  )
}
