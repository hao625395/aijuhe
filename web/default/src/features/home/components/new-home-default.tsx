/*
Copyright (C) 2026 QuantumNous

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
*/

import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Sparkles, Terminal, Code, Star, Check } from 'lucide-react'
import { useStatus } from '@/hooks/use-status'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'

interface NewHomeDefaultProps {
  isAuthenticated: boolean
}

export function NewHomeDefault({ isAuthenticated }: NewHomeDefaultProps) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const { copyToClipboard } = useCopyToClipboard()


  const docsLink = '/docs'

  // 打字机逻辑
  const words = ['OpenAI GPT', 'Anthropic Claude', 'Google Gemini', 'DeepSeek V3']
  const [typedText, setTypedText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(150)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const handleTyping = () => {
      const currentFullText = words[wordIndex]
      if (!isDeleting) {
        setTypedText(currentFullText.substring(0, typedText.length + 1))
        setTypingSpeed(100)
        if (typedText === currentFullText) {
          setIsDeleting(true)
          setTypingSpeed(1500) // 停留 1.5 秒
        }
      } else {
        setTypedText(currentFullText.substring(0, typedText.length - 1))
        setTypingSpeed(50)
        if (typedText === '') {
          setIsDeleting(false)
          setWordIndex((prev) => (prev + 1) % words.length)
          setTypingSpeed(500) // 开始下一个词前停留 0.5 秒
        }
      }
    }
    timer = setTimeout(handleTyping, typingSpeed)
    return () => clearTimeout(timer)
  }, [typedText, isDeleting, wordIndex, typingSpeed])

  // 复制测试提示词
  const testPrompt = '你是一个由 aijuhe.fun 驱动的AI助手，请用一句话向我问好。'
  const handleCopyTestPrompt = async () => {
    await copyToClipboard(testPrompt)
  }



  return (
    <div className="w-full bg-[#FAF6F0] text-[#2E271D] min-h-screen font-sans pb-16 relative overflow-x-hidden">
      {/* 柔和的亮色渐变背景微光 */}
      <div className="absolute top-20 left-10 w-[300px] h-[300px] rounded-full bg-[#E8DCCB] blur-[120px] opacity-40 pointer-events-none" />
      <div className="absolute top-80 right-10 w-[320px] h-[320px] rounded-full bg-[#E5E9F0] blur-[130px] opacity-50 pointer-events-none" />

      {/* ==================== 一、头部 Hero 区域 ==================== */}
      <div id="intro" className="relative py-20 md:py-28 overflow-hidden text-center px-4">
        {/* 极淡的格线背景 */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(#8c6239 1px, transparent 1px), linear-gradient(90deg, #8c6239 1px, transparent 1px)',
          backgroundSize: '45px 45px',
          backgroundPosition: 'center'
        }} />

        <div className="max-w-7xl mx-auto flex flex-col items-center relative z-10">
          {/* 药丸标签 */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D4C3B3] bg-[#F5EFEB] px-4 py-1.5 text-xs font-semibold text-[#8C6239] mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C68D56] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8C6239]"></span>
            </span>
            {t('全球 AI 模型接入平台')}
          </div>

          {/* 主标题 */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#2E271D] tracking-tight leading-tight mb-6">
            {t('全球顶尖模型一站式入口')}
          </h1>

          {/* 打字机动画 */}
          <div className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#8C6239] min-h-[55px] mb-6 flex items-center justify-center gap-1">
            <span>{typedText}</span>
            <span className="w-[3px] h-[35px] md:h-[42px] bg-[#8C6239] animate-pulse">|</span>
          </div>

          {/* 副标题 */}
          <p className="text-sm md:text-base text-[#6E6352] max-w-4xl mx-auto mb-10 leading-relaxed">
            {t('统一 API 接入 Claude、GPT、Gemini 等顶级模型')}
            <br />
            {t('稳定可靠，无需复杂的 API 管理，让全球顶级模型触手可及')}
          </p>



          {/* 按钮组 */}
          <div className="flex flex-row gap-4 justify-center items-center">
            <Link to={isAuthenticated ? '/console' : '/login'}>
              <button className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#A07C5A] to-[#8C6239] px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#8c6239]/20 hover:opacity-95 transition-all cursor-pointer">
                {t('立即体验')}
              </button>
            </Link>
            {docsLink && (
              <a
                href={docsLink}
                className="inline-flex items-center justify-center rounded-xl border border-[#D4C3B3] bg-white px-8 py-3.5 text-sm font-semibold text-[#8C6239] hover:bg-[#FAF8F5] transition-all cursor-pointer shadow-sm"
              >
                {t('查看文档 →')}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ==================== 二、新手引导四步流程 ==================== */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center text-[#2E271D] mb-4">
          {t('无需编程基础，仅依靠自然语言，')}
          <br className="md:hidden" />
          {t('就能将您的想法变为现实')}
        </h2>
        <p className="text-sm text-center text-[#6E6352] max-w-3xl mx-auto mb-16 leading-relaxed">
          {t('用最简单的配置，即刻使用稳定，安全，优惠的 AI 编程能力，体验当前全球最顶级的智能编程工具。')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 步骤 1 */}
          <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm hover:shadow-md hover:border-[#D4C5B3] transition-all flex flex-col min-h-[240px]">
            <div className="flex justify-between items-center border-b border-[#F5EFEB] pb-3 mb-4">
              <span className="font-bold text-lg text-[#8C6239]">01</span>
              <span className="text-xs text-[#9E9280] font-semibold">{t('账号准备')}</span>
            </div>
            <h3 className="font-bold text-base text-[#2E271D] mb-2">{t('注册/登录/充值')}</h3>
            <p className="text-xs text-[#6E6352] leading-relaxed mb-6">
              {t('进入控制台完成注册或登录，充值余额后即可创建和使用 API Key。')}
            </p>
            <Link to={isAuthenticated ? '/console' : '/login'} className="w-full mt-auto">
              <button className="w-full py-2.5 px-4 rounded-xl bg-[#8C6239] hover:bg-[#724F2C] text-xs font-semibold text-white transition-all text-center cursor-pointer">
                {t('注册/登录 →')}
              </button>
            </Link>
          </div>

          {/* 步骤 2 */}
          <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm hover:shadow-md hover:border-[#D4C5B3] transition-all flex flex-col min-h-[240px]">
            <div className="flex justify-between items-center border-b border-[#F5EFEB] pb-3 mb-4">
              <span className="font-bold text-lg text-[#8C6239]">02</span>
              <span className="text-xs text-[#9E9280] font-semibold">{t('安装工具')}</span>
            </div>
            <h3 className="font-bold text-base text-[#2E271D] mb-2">{t('安装 Agent')}</h3>
            <p className="text-xs text-[#6E6352] leading-relaxed mb-6">
              {t('选择你常用的编程 Agent。我们会整理主流工具的下载入口和适用场景。')}
            </p>
            <a href="/docs?id=JhscwRK5tioqwOkk9RkcmBzTnxe" className="w-full mt-auto">
              <button className="w-full py-2.5 px-4 rounded-xl bg-[#8C6239] hover:bg-[#724F2C] text-xs font-semibold text-white transition-all text-center cursor-pointer">
                {t('查看 Agent 列表 →')}
              </button>
            </a>
          </div>

          {/* 步骤 3 */}
          <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm hover:shadow-md hover:border-[#D4C5B3] transition-all flex flex-col min-h-[240px]">
            <div className="flex justify-between items-center border-b border-[#F5EFEB] pb-3 mb-4">
              <span className="font-bold text-lg text-[#8C6239]">03</span>
              <span className="text-xs text-[#9E9280] font-semibold">{t('接入配置')}</span>
            </div>
            <h3 className="font-bold text-base text-[#2E271D] mb-2">{t('配置 Agent')}</h3>
            <p className="text-xs text-[#6E6352] leading-relaxed mb-6">
              {t('推荐使用 cc switch 管理配置。令牌页面旁边也有键跳转 ccs 的入口。')}
            </p>
            <a href="/docs?id=I6obw07QmiXRh4kMLY0cdbimnQe" className="w-full mt-auto">
              <button className="w-full py-2.5 px-4 rounded-xl bg-[#8C6239] hover:bg-[#724F2C] text-xs font-semibold text-white transition-all text-center cursor-pointer">
                {t('查看配置教程 →')}
              </button>
            </a>
          </div>

          {/* 步骤 4 */}
          <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm hover:shadow-md hover:border-[#D4C5B3] transition-all flex flex-col min-h-[240px]">
            <div className="flex justify-between items-center border-b border-[#F5EFEB] pb-3 mb-4">
              <span className="font-bold text-lg text-[#8C6239]">04</span>
              <span className="text-xs text-[#9E9280] font-semibold">{t('首次验证')}</span>
            </div>
            <h3 className="font-bold text-base text-[#2E271D] mb-2">{t('验证并开始使用')}</h3>
            <p className="text-xs text-[#6E6352] leading-relaxed mb-6">
              {t('完成配置后发起一次测试请求，确认模型返回正常，再开始日常编码。')}
            </p>
            <button
              onClick={handleCopyTestPrompt}
              className="w-full mt-auto py-2.5 px-4 rounded-xl bg-[#8C6239] hover:bg-[#724F2C] text-xs font-semibold text-white transition-all text-center cursor-pointer"
            >
              {t('复制测试提示词 →')}
            </button>
          </div>
        </div>
      </div>

      {/* ==================== 三、兼容生态 (设备与工具) ==================== */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-12">
          <span className="text-xs font-bold text-[#8C6239] uppercase tracking-wider block mb-2">{t('兼容生态')}</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#2E271D]">{t('支持的设备与 AI 编程工具')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 卡片 1 - OpenClaw */}
          <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm hover:shadow-md hover:border-[#D4C5B3] transition-all flex flex-col min-h-[250px]">
            <div className="w-10 h-10 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#8C6239] mb-6 shadow-inner">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg text-[#2E271D] mb-3">OpenClaw</h3>
            <p className="text-xs text-[#6E6352] leading-relaxed mb-6">
              {t('开源本地 AI 助手，运行在你自己电脑上，通过聊天直接执行任务，不止对话，更能动手。')}
            </p>
            <div className="text-[10px] font-bold text-[#8C6239] uppercase tracking-wider border-t border-[#FAF6F0] pt-4 mt-auto">
              {t('开源 · 本地运行')}
            </div>
          </div>

          {/* 卡片 2 - Claude Code */}
          <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm hover:shadow-md hover:border-[#D4C5B3] transition-all flex flex-col min-h-[250px]">
            <div className="w-10 h-10 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#8C6239] mb-6 shadow-inner">
              <Terminal className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg text-[#2E271D] mb-3">Claude Code</h3>
            <p className="text-xs text-[#6E6352] leading-relaxed mb-6">
              {t('Anthropic 官方 CLI，原生支持 Extended Thinking 深度思考，写代码如自然对话般流畅。')}
            </p>
            <div className="text-[10px] font-bold text-[#8C6239] uppercase tracking-wider border-t border-[#FAF6F0] pt-4 mt-auto">
              {t('ANTHROPIC 官方')}
            </div>
          </div>

          {/* 卡片 3 - Codex */}
          <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm hover:shadow-md hover:border-[#D4C5B3] transition-all flex flex-col min-h-[250px]">
            <div className="w-10 h-10 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#8C6239] mb-6 shadow-inner">
              <Code className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg text-[#2E271D] mb-3">Codex</h3>
            <p className="text-xs text-[#6E6352] leading-relaxed mb-6">
              {t('OpenAI 官方编程代理，擅长大规模重构、Bug 修复与测试生成，长任务稳定不掉线。')}
            </p>
            <div className="text-[10px] font-bold text-[#8C6239] uppercase tracking-wider border-t border-[#FAF6F0] pt-4 mt-auto">
              {t('OPENAI 官方')}
            </div>
          </div>

          {/* 卡片 4 - Gemini CLI */}
          <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm hover:shadow-md hover:border-[#D4C5B3] transition-all flex flex-col min-h-[250px]">
            <div className="w-10 h-10 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#8C6239] mb-6 shadow-inner">
              <Star className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg text-[#2E271D] mb-3">Gemini CLI</h3>
            <p className="text-xs text-[#6E6352] leading-relaxed mb-6">
              {t('Google 官方开源的终端 AI 代理，在命令行调用 Gemini 完成编码、调试与工作流自动化。')}
            </p>
            <div className="text-[10px] font-bold text-[#8C6239] uppercase tracking-wider border-t border-[#FAF6F0] pt-4 mt-auto">
              {t('GOOGLE 官方')}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 四、定价方案 ==================== */}
      <div id="pricing-section" className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-[#8C6239] uppercase tracking-wider block mb-2">{t('定价方案')}</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#2E271D] mb-3">{t('按量付费，按需使用')}</h2>
          <p className="text-xs text-[#6E6352]">{t('1 RMB = 1 USD，使用官方原生模型，享受更低折扣')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
          {/* PAYGO 按量付费 */}
          <div className="bg-white rounded-3xl border border-[#EFECE6] p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[360px] relative overflow-hidden">
            <div>
              <div className="mb-6">
                <span className="text-[10px] font-bold text-[#8C6239] tracking-wider uppercase bg-[#FAF6F0] rounded px-2.5 py-1">{t('PAYGO')}</span>
                <h3 className="text-2xl font-extrabold text-[#2E271D] mt-3">{t('按量付费')}</h3>
                <p className="text-xs text-[#9E9280] mt-1">{t('永不过期')}</p>
              </div>
              <ul className="space-y-4 text-xs text-[#6E6352] mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="h-3.5 w-3.5 text-[#8C6239] font-bold" />
                  <span>{t('充值金额，获得等价人民币额度')}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-3.5 w-3.5 text-[#8C6239] font-bold" />
                  <span>{t('按实际使用付费')}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-3.5 w-3.5 text-[#8C6239] font-bold" />
                  <span>{t('永不过期')}</span>
                </li>
              </ul>
            </div>
            <Link to={isAuthenticated ? '/console' : '/login'} className="w-full">
              <button className="w-full py-3 rounded-xl bg-[#8C6239] hover:bg-[#724F2C] text-xs font-bold text-white transition-all text-center cursor-pointer">
                {t('立即充值')}
              </button>
            </Link>
          </div>

          {/* AI Claude 按需付费 */}
          <div className="bg-white rounded-3xl border-2 border-[#8C6239] p-8 shadow-md hover:shadow-lg transition-all flex flex-col justify-between min-h-[360px] relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#8C6239] text-white text-[9px] font-extrabold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
              {t('推荐')}
            </div>
            <div>
              <div className="mb-6">
                <span className="text-[10px] font-bold text-[#8C6239] tracking-wider uppercase bg-[#FAF6F0] rounded px-2.5 py-1">{t('AI Claude 按需付费')}</span>
                <h3 className="text-2xl font-extrabold text-[#2E271D] mt-3">1:1 (RMB:USD)</h3>
                <p className="text-xs text-[#9E9280] mt-1">{t('无需订阅，根据实际使用量灵活计费')}</p>
              </div>
              <ul className="space-y-4 text-xs text-[#6E6352] mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="h-3.5 w-3.5 text-[#8C6239] font-bold" />
                  <span>{t('1 RMB = 1 USD，官方价格同步')}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-3.5 w-3.5 text-[#8C6239] font-bold" />
                  <span>{t('支持 Claude 全系列模型')}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-3.5 w-3.5 text-[#8C6239] font-bold" />
                  <span>{t('专为 Claude Code 优化')}</span>
                </li>
              </ul>
            </div>
            <Link to="/console" className="w-full">
              <button className="w-full py-3 rounded-xl bg-[#8C6239] hover:bg-[#724F2C] text-xs font-bold text-white transition-all text-center cursor-pointer shadow-md shadow-[#8c6239]/10">
                {t('立即开始')}
              </button>
            </Link>
          </div>

          {/* ChatGPT 按需付费 */}
          <div className="bg-white rounded-3xl border-2 border-[#8C6239] p-8 shadow-md hover:shadow-lg transition-all flex flex-col justify-between min-h-[360px] relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#8C6239] text-white text-[9px] font-extrabold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
              {t('推荐')}
            </div>
            <div>
              <div className="mb-6">
                <span className="text-[10px] font-bold text-[#8C6239] tracking-wider uppercase bg-[#FAF6F0] rounded px-2.5 py-1">{t('ChatGPT 按需付费')}</span>
                <h3 className="text-2xl font-extrabold text-[#2E271D] mt-3">1:1 (RMB:USD)</h3>
                <p className="text-xs text-[#9E9280] mt-1">{t('无需订阅，根据实际使用量灵活计费')}</p>
              </div>
              <ul className="space-y-4 text-xs text-[#6E6352] mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="h-3.5 w-3.5 text-[#8C6239] font-bold" />
                  <span>{t('1 RMB = 1 USD，官方价格同步')}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-3.5 w-3.5 text-[#8C6239] font-bold" />
                  <span>{t('支持 OpenAI GPT 全系列模型')}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-3.5 w-3.5 text-[#8C6239] font-bold" />
                  <span>{t('专为 CodeX 优化')}</span>
                </li>
              </ul>
            </div>
            <Link to="/console" className="w-full">
              <button className="w-full py-3 rounded-xl bg-[#8C6239] hover:bg-[#724F2C] text-xs font-bold text-white transition-all text-center cursor-pointer shadow-md shadow-[#8c6239]/10">
                {t('立即开始')}
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ==================== 五、优势与看板部分 ==================== */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* 蓝色大 Banner */}
        <div className="bg-gradient-to-br from-[#EBF3FC] to-[#F3F8FD] rounded-3xl border border-[#D5E4F5] p-8 md:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-blue-400/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="max-w-2xl text-left relative z-10">
            <span className="inline-block bg-[#FDF1E2] text-[#D97706] text-xs font-bold rounded-full px-3.5 py-1 mb-4 shadow-sm">
              {t('低价优势')}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1E3A8A] mb-4">
              {t('同样是顶级模型，成本低至 0.7 折')}
            </h2>
            <p className="text-sm text-[#475569] leading-relaxed mb-6">
              {t('无月费、按量计费、余额长期可用，同时支持企业订阅与商务采购。多节点调度与稳定链路优化，面向全球用户都能获得更稳、更省的调用体验。')}
            </p>

            {/* 横排小标签 */}
            <div className="flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-1 bg-white border border-[#E2E8F0] rounded-full px-3 py-1 text-xs text-[#475569] font-medium shadow-2xs">
                <span className="text-green-500 font-bold">✓</span> {t('价格透明')}
              </span>
              <span className="inline-flex items-center gap-1 bg-white border border-[#E2E8F0] rounded-full px-3 py-1 text-xs text-[#475569] font-medium shadow-2xs">
                <span className="text-green-500 font-bold">✓</span> {t('企业订阅支持')}
              </span>
              <span className="inline-flex items-center gap-1 bg-white border border-[#E2E8F0] rounded-full px-3 py-1 text-xs text-[#475569] font-medium shadow-2xs">
                <span className="text-green-500 font-bold">✓</span> {t('充值即用')}
              </span>
              <span className="inline-flex items-center gap-1 bg-white border border-[#E2E8F0] rounded-full px-3 py-1 text-xs text-[#475569] font-medium shadow-2xs">
                <span className="text-green-500 font-bold">✓</span> {t('全球稳定可连')}
              </span>
            </div>
          </div>

          {/* 右侧操作按钮 */}
          <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto relative z-10">
            {docsLink && (
              <a
                href={docsLink}
                className="w-full py-3.5 px-6 rounded-xl bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-xs font-bold text-[#334155] transition-all text-center cursor-pointer shadow-sm"
              >
                {t('查看计费说明')}
              </a>
            )}
            <Link to="/console" className="w-full">
              <button className="w-full py-3.5 px-6 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-xs font-bold text-white transition-all text-center cursor-pointer shadow-md shadow-[#F97316]/20">
                {t('查看模型价格')}
              </button>
            </Link>
          </div>
        </div>

        {/* 下方 4 个看板 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm hover:shadow-md transition-all text-center">
            <div className="text-3xl font-extrabold text-[#3B82F6]">100+</div>
            <div className="text-xs text-[#6E6352] mt-2 font-medium">{t('模型覆盖数量')}</div>
          </div>
          <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm hover:shadow-md transition-all text-center">
            <div className="text-3xl font-extrabold text-[#3B82F6]">99.9%</div>
            <div className="text-xs text-[#6E6352] mt-2 font-medium">{t('服务可用率 SLA')}</div>
          </div>
          <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm hover:shadow-md transition-all text-center">
            <div className="text-3xl font-extrabold text-[#3B82F6]">{t('低至 0.7折')}</div>
            <div className="text-xs text-[#6E6352] mt-2 font-medium">{t('官方同款接口更低成本')}</div>
          </div>
          <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm hover:shadow-md transition-all text-center">
            <div className="text-3xl font-extrabold text-[#3B82F6]">50,000+</div>
            <div className="text-xs text-[#6E6352] mt-2 font-medium">{t('开发者与团队正在使用')}</div>
          </div>
        </div>
      </div>

      {/* ==================== 六、页面底部 CTA ==================== */}
      <div className="bg-[#FAF6F0] py-20 px-6 border-t border-[#EFECE6] text-center relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[150px] bg-[#E8DCCB]/25 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#2E271D] mb-4">
            {t('开始体验全球顶尖模型')}
          </h2>
          <p className="text-sm md:text-base text-[#6E6352] max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('加入数以万计的开发者行列，利用 aijuhe.fun 稳定、专业的基础设施构建人工智能的未来。')}
          </p>
          <Link to="/console">
            <button className="inline-flex items-center justify-center rounded-xl bg-[#8C6239] hover:bg-[#724F2C] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#8c6239]/20 transition-all cursor-pointer">
              {t('进入控制台')}
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
