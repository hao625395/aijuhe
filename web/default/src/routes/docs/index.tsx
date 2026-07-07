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

import React, { useState, useEffect } from 'react'
import { createFileRoute, useRouterState } from '@tanstack/react-router'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// TypeScript 接口定义
interface CodeBlockProps {
  code: string
  title?: string
}

interface DocImageProps {
  src: string
  alt: string
  caption?: string
}

interface DocItem {
  id: string
  category: string
  title: string
  markdown: string
}

let docsDataCache: DocItem[] | null = null

// 复制代码块组件 (TS)
const CodeBlock: React.FC<CodeBlockProps> = ({ code, title }) => {
  const [copied, setCopied] = useState<boolean>(false)

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  return (
    <div className='my-4 overflow-hidden rounded-lg border border-border bg-muted/50 font-mono text-sm shadow-sm'>
      <div className='flex items-center justify-between border-b border-border bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground'>
        <span>{title || '代码内容'}</span>
        <button
          onClick={handleCopy}
          className='flex items-center gap-1 hover:text-foreground focus:outline-none transition-colors bg-transparent border-none cursor-pointer'
        >
          {copied ? (
            <svg className='h-3.5 w-3.5 text-green-500' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2.5}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
            </svg>
          ) : (
            <svg className='h-3.5 w-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3' />
            </svg>
          )}
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <div className='relative p-4 overflow-x-auto text-foreground'>
        <pre className='whitespace-pre overflow-x-auto pr-8'>{code}</pre>
      </div>
    </div>
  )
}

// 支持点击放大的图片组件 (TS)
const DocImage: React.FC<DocImageProps> = ({ src, alt, caption }) => {
  const [zoomOpen, setZoomOpen] = useState<boolean>(false)
  const lowerCaption = (caption || '').toLowerCase()
  const isImageFile = lowerCaption === 'image' || 
    ['.png', '.jpg', '.jpeg', '.gif', '.webp'].some(ext => lowerCaption.endsWith(ext))
  const showCaption = caption && !isImageFile

  return (
    <div className='my-6'>
      <div
        onClick={() => setZoomOpen(true)}
        className='group relative cursor-pointer overflow-hidden rounded-lg border border-border bg-card shadow-sm max-w-2xl transition-all duration-300 hover:shadow-md hover:border-primary/50'
      >
        <img
          src={src}
          alt={alt}
          className='w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.01]'
        />
        <div className='absolute inset-0 bg-black/5 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
          <span className='rounded-full bg-black/75 px-3 py-1.5 text-xs text-white backdrop-blur-sm pointer-events-none'>
            点击放大查看
          </span>
        </div>
      </div>
      {showCaption && (
        <p className='mt-2 text-center text-xs text-muted-foreground italic'>{caption}</p>
      )}

      {zoomOpen && (
        <div
          onClick={() => setZoomOpen(false)}
          className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md cursor-zoom-out animate-fade-in'
        >
          <div className='relative max-w-5xl max-h-[90vh] overflow-auto rounded-lg border border-zinc-800 bg-zinc-950'>
            <img src={src} alt={alt} className='mx-auto max-w-full h-auto object-contain' />
            {showCaption && (
              <div className='border-t border-zinc-800 bg-zinc-950/90 p-3 text-center text-sm font-medium text-zinc-300'>
                {caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// 预设大分类顺序
const CATEGORY_ORDER = [
  '注册/登录/充值',
  '安装 Agent',
  'CC Switch 配置各个Agent',
  '进阶指南',
  '常见问题'
]

// 客服面板组件 (TS)
const ContactView: React.FC = () => {
  const [copied1, setCopied1] = useState<boolean>(false)
  const [copied2, setCopied2] = useState<boolean>(false)

  const handleCopy = async (wechatId: string, setCopied: React.Dispatch<React.SetStateAction<boolean>>): Promise<void> => {
    try {
      await navigator.clipboard.writeText(wechatId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  return (
    <div className='animate-fade-in'>
      <h1 className='text-2xl md:text-3xl font-extrabold text-foreground pb-3 border-b border-border tracking-tight mb-6 mt-4'>
        联系客服
      </h1>
      <p className='text-muted-foreground text-sm leading-relaxed mb-6'>
        如果您在注册、充值、使用或配置过程中遇到任何问题，请随时联系我们的官方客服，或加入社区交流群。
      </p>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-8'>
        {/* 客服 1 */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            backgroundColor: 'var(--card)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.12)'
            e.currentTarget.style.borderColor = '#10b981'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.03)'
            e.currentTarget.style.borderColor = 'var(--border)'
          }}
        >
          <div className='flex flex-col items-center w-full'>
            <div className='p-3 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full mb-4'>
              <svg className='w-8 h-8' style={{ color: '#10b981' }} viewBox='0 0 24 24' fill='currentColor'>
                <path d='M8.3,2.4C4.3,2.4,1,5,1,8.3c0,1.9,1.1,3.6,2.8,4.7c-0.2,0.6-0.6,1.7-0.7,1.8c-0.1,0.2,0,0.4,0.1,0.4c0.2,0.1,1.5-0.7,2.5-1.3C6.3,14,7.3,14.2,8.3,14.2c4,0,7.3-2.6,7.3-5.9S12.3,2.4,8.3,2.4z M6.3,6.3C5.9,6.3,5.5,6,5.5,5.5S5.9,4.8,6.3,4.8s0.8,0.3,0.8,0.8S6.8,6.3,6.3,6.3z M10.3,6.3c-0.4,0-0.8-0.3-0.8-0.8s0.4-0.8,0.8-0.8s0.8,0.3,0.8,0.8S10.8,6.3,10.3,6.3z M18.5,9.5c-0.3,0-0.6,0-0.9,0.1c1.9,1.7,3.1,3.9,3.1,6.3c0,1.5-0.5,2.9-1.4,4c0.8,0.5,1.9,1.2,2,1.3c0.1,0.1,0.2,0.1,0.2,0c0.1-0.1,0.2-1.6,0.2-1.6c1.4-1,2.2-2.4,2.2-4C23.5,12.1,20.9,9.5,18.5,9.5z M16.1,12.2c-3.3,0-6.1,2.2-6.1,4.9s2.7,4.9,6.1,4.9c0.8,0,1.6-0.1,2.4-0.4c0.8,0.5,1.9,1.2,2,1.3c0.1,0.1,0.2,0.1,0.2,0c0.1-0.1,0-1.1-0.2-1.6c1.2-0.9,1.8-2.1,1.8-3.4C22.2,14.4,19.4,12.2,16.1,12.2z M14.1,15.8c-0.3,0-0.6-0.3-0.6-0.6c0-0.3,0.3-0.6,0.6-0.6s0.6,0.3,0.6,0.6C14.7,15.5,14.4,15.8,14.1,15.8z M17.7,15.8c-0.3,0-0.6-0.3-0.6-0.6c0-0.3,0.3-0.6,0.6-0.6s0.6,0.3,0.6,0.6C18.3,15.5,18,15.8,17.7,15.8z'/>
              </svg>
            </div>
            <div 
              style={{
                padding: '8px 20px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                backgroundColor: 'var(--muted)',
                fontWeight: 'bold',
                color: 'var(--foreground)',
                marginBottom: '16px',
                width: '100%',
                textAlign: 'center',
                boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.02)'
              }}
            >
              block668
            </div>
          </div>
          <button 
            onClick={() => handleCopy('block668', setCopied1)}
            style={{
              display: 'block',
              width: '100%',
              padding: '10px 20px',
              borderRadius: '12px',
              border: '2px solid #10b981',
              color: '#10b981',
              backgroundColor: 'var(--background)',
              fontSize: '13px',
              fontWeight: 'bold',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 0 #059669, 0 4px 8px rgba(16, 185, 129, 0.15)',
              transition: 'all 0.1s ease-in-out',
              transform: 'translateY(0)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 0 #059669, 0 8px 14px rgba(16, 185, 129, 0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 0 #059669, 0 4px 8px rgba(16, 185, 129, 0.15)'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(2px)'
              e.currentTarget.style.boxShadow = '0 2px 0 #059669, 0 2px 4px rgba(16, 185, 129, 0.1)'
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 0 #059669, 0 8px 14px rgba(16, 185, 129, 0.25)'
            }}
          >
            {copied1 ? '已复制' : '复制微信号'}
          </button>
        </div>

        {/* 客服 2 */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            backgroundColor: 'var(--card)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.12)'
            e.currentTarget.style.borderColor = '#10b981'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.03)'
            e.currentTarget.style.borderColor = 'var(--border)'
          }}
        >
          <div className='flex flex-col items-center w-full'>
            <div className='p-3 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full mb-4'>
              <svg className='w-8 h-8' style={{ color: '#10b981' }} viewBox='0 0 24 24' fill='currentColor'>
                <path d='M8.3,2.4C4.3,2.4,1,5,1,8.3c0,1.9,1.1,3.6,2.8,4.7c-0.2,0.6-0.6,1.7-0.7,1.8c-0.1,0.2,0,0.4,0.1,0.4c0.2,0.1,1.5-0.7,2.5-1.3C6.3,14,7.3,14.2,8.3,14.2c4,0,7.3-2.6,7.3-5.9S12.3,2.4,8.3,2.4z M6.3,6.3C5.9,6.3,5.5,6,5.5,5.5S5.9,4.8,6.3,4.8s0.8,0.3,0.8,0.8S6.8,6.3,6.3,6.3z M10.3,6.3c-0.4,0-0.8-0.3-0.8-0.8s0.4-0.8,0.8-0.8s0.8,0.3,0.8,0.8S10.8,6.3,10.3,6.3z M18.5,9.5c-0.3,0-0.6,0-0.9,0.1c1.9,1.7,3.1,3.9,3.1,6.3c0,1.5-0.5,2.9-1.4,4c0.8,0.5,1.9,1.2,2,1.3c0.1,0.1,0.2,0.1,0.2,0c0.1-0.1,0.2-1.6,0.2-1.6c1.4-1,2.2-2.4,2.2-4C23.5,12.1,20.9,9.5,18.5,9.5z M16.1,12.2c-3.3,0-6.1,2.2-6.1,4.9s2.7,4.9,6.1,4.9c0.8,0,1.6-0.1,2.4-0.4c0.8,0.5,1.9,1.2,2,1.3c0.1,0.1,0.2,0.1,0.2,0c0.1-0.1,0,1.1-0.2-1.6c1.2-0.9,1.8-2.1,1.8-3.4C22.2,14.4,19.4,12.2,16.1,12.2z M14.1,15.8c-0.3,0-0.6-0.3-0.6-0.6c0-0.3,0.3-0.6,0.6-0.6s0.6,0.3,0.6,0.6C14.7,15.5,14.4,15.8,14.1,15.8z M17.7,15.8c-0.3,0-0.6-0.3-0.6-0.6c0-0.3,0.3-0.6,0.6-0.6s0.6,0.3,0.6,0.6C18.3,15.5,18,15.8,17.7,15.8z'/>
              </svg>
            </div>
            <div 
              style={{
                padding: '8px 20px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                backgroundColor: 'var(--muted)',
                fontWeight: 'bold',
                color: 'var(--foreground)',
                marginBottom: '16px',
                width: '100%',
                textAlign: 'center',
                boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.02)'
              }}
            >
              leohoo8
            </div>
          </div>
          <button 
            onClick={() => handleCopy('leohoo8', setCopied2)}
            style={{
              display: 'block',
              width: '100%',
              padding: '10px 20px',
              borderRadius: '12px',
              border: '2px solid #10b981',
              color: '#10b981',
              backgroundColor: 'var(--background)',
              fontSize: '13px',
              fontWeight: 'bold',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 0 #059669, 0 4px 8px rgba(16, 185, 129, 0.15)',
              transition: 'all 0.1s ease-in-out',
              transform: 'translateY(0)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 0 #059669, 0 8px 14px rgba(16, 185, 129, 0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 0 #059669, 0 4px 8px rgba(16, 185, 129, 0.15)'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(2px)'
              e.currentTarget.style.boxShadow = '0 2px 0 #059669, 0 2px 4px rgba(16, 185, 129, 0.1)'
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 0 #059669, 0 8px 14px rgba(16, 185, 129, 0.25)'
            }}
          >
            {copied2 ? '已复制' : '复制微信号'}
          </button>
        </div>

        {/* Discord 交流群 */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            backgroundColor: 'var(--card)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(88, 101, 242, 0.12)';
            e.currentTarget.style.borderColor = '#5865f2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.03)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <div className='flex flex-col items-center w-full'>
            <div className='p-3 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full mb-4'>
              <svg className='w-8 h-8' style={{ color: '#5865f2' }} viewBox='0 0 127.14 96.36' fill='currentColor'>
                <path d='M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.43-5c.87-.64,1.72-1.32,2.53-2a75.76,75.76,0,0,0,72.76,0c.81.71,1.66,1.4,2.53,2a68.64,68.64,0,0,1-10.43,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129,54.65,122.64,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z'/>
              </svg>
            </div>
            <div 
              style={{
                padding: '8px 20px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                backgroundColor: 'var(--muted)',
                fontWeight: 'bold',
                color: 'var(--foreground)',
                marginBottom: '16px',
                width: '100%',
                textAlign: 'center',
                boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.02)'
              }}
            >
              交流群
            </div>
          </div>
          <a 
            href='https://discord.com/invite/hfudanAKCg'
            target='_blank'
            rel='noopener noreferrer'
            style={{
              display: 'block',
              width: '100%',
              padding: '10px 20px',
              borderRadius: '12px',
              border: '2px solid #5865f2',
              color: '#5865f2',
              backgroundColor: 'var(--background)',
              fontSize: '13px',
              fontWeight: 'bold',
              textAlign: 'center',
              cursor: 'pointer',
              textDecoration: 'none',
              boxShadow: '0 4px 0 #4752c4, 0 4px 8px rgba(88, 101, 242, 0.15)',
              transition: 'all 0.1s ease-in-out',
              transform: 'translateY(0)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 0 #4752c4, 0 8px 14px rgba(88, 101, 242, 0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 0 #4752c4, 0 4px 8px rgba(88, 101, 242, 0.15)'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(2px)'
              e.currentTarget.style.boxShadow = '0 2px 0 #4752c4, 0 2px 4px rgba(88, 101, 242, 0.1)'
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 0 #4752c4, 0 8px 14px rgba(88, 101, 242, 0.25)'
            }}
          >
            加入 Discord
          </a>
        </div>
      </div>
    </div>
  )
}

interface AgentMerchantViewProps {
  setActiveDocId: React.Dispatch<React.SetStateAction<string | null>>
}

/**
 * 代理加盟与合伙人计划视图组件
 * @param props 包含设置激活文档 ID 的回调函数
 * @returns 3D 交互式代理加盟页面组件
 */
const AgentMerchantView: React.FC<AgentMerchantViewProps> = ({ setActiveDocId }) => {
  const [referrals, setReferrals] = React.useState<number>(5)

  // 基于目标页面保守估算模型的计算：
  // 5人/月时，首月 ¥320，12个月 ¥2400，累计 ¥15273，总客户 81人
  const factor = referrals / 5
  const m1Earnings = Math.round(320 * factor)
  const m12Earnings = Math.round(2400 * factor)
  const totalEarnings = Math.round(15273 * factor)
  const totalCustomers = Math.round(81 * factor)

  return (
    <div className='animate-fade-in text-foreground'>
      {/* 顶部 Banner */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #8b5cf6 100%)',
          borderRadius: '20px',
          padding: '40px 24px',
          textAlign: 'center',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3)',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-white'>
            零成本成为 AI 算力代理商
          </h1>
          <p className='text-blue-100 text-sm md:text-base max-w-2xl mx-auto leading-relaxed'>
            在 AI 爆发的时代里建立您的管道收益版图！不需要囤货，不需要技术，0 元轻松启动一门真正的生意，售卖 AI 时代的“水与电”。
          </p>
        </div>
        <div 
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* 核心卖点对比：传统创业 vs AI 算力代理 */}
      <h2 className='text-xl font-bold text-foreground mb-6 border-l-4 border-primary pl-3 flex items-center gap-2'>
        <span>💡 你以为的创业 vs 真实的 AI 算力代理</span>
      </h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-10'>
        {/* 传统创业 */}
        <div className='p-6 rounded-2xl border border-border bg-muted/20'>
          <h3 className='text-base font-extrabold text-red-500 mb-4 flex items-center gap-2'>
            <span>❌ 传统实体/软件创业</span>
          </h3>
          <ul className='space-y-2.5 text-xs text-muted-foreground'>
            <li className='flex items-start gap-2'>
              <span className='text-red-500'>•</span>
              <span>需要 10 万 - 100 万高昂的启动与硬件代理资金</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-red-500'>•</span>
              <span>需要租服务器、店面，面对库存积压和损耗风险</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-red-500'>•</span>
              <span>必须雇人做运维、写代码、打理客服，管理成本沉重</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-red-500'>•</span>
              <span>竞争极其白热化，前期回收周期漫长，失败容易血本无归</span>
            </li>
          </ul>
        </div>

        {/* AI 算力代理 */}
        <div className='p-6 rounded-2xl border border-primary/30 bg-primary/5'>
          <h3 className='text-base font-extrabold text-primary mb-4 flex items-center gap-2'>
            <span>🚀 真实便捷的 AI 算力代理</span>
          </h3>
          <ul className='space-y-2.5 text-xs text-foreground'>
            <li className='flex items-start gap-2'>
              <span className='text-primary'>•</span>
              <span className='font-bold'>0 元免费启动，无须任何代理加盟费或保证金</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-primary'>•</span>
              <span>无需囤货与物理服务器，高并发 API 后端由我们统一运维保障</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-primary'>•</span>
              <span>一个人就是一个平台，利用碎片时间即可开始，随时随地开启</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-primary'>•</span>
              <span className='font-bold'>高频刚需，API 充值后日结算，客户用得越久，返利如管道般源源不断</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 什么是供应商 */}
      <h2 className='text-xl font-bold text-foreground mb-6 border-l-4 border-primary pl-3 flex items-center gap-2'>
        <span>⚡ 什么是 AI 算力供应商？</span>
      </h2>
      <p className='text-sm text-muted-foreground leading-relaxed mb-6'>
        大模型技术（ChatGPT/Claude/Gemini/Midjourney）已全面渗透，每天数以万计的人都在调用 AI。正如 100 年前卖电的人、20 年前卖宽带流量的人赚到第一桶金一样，今天 <strong>AI 算力就是数字新时代的“电”与“流量”</strong>。每个人都在高频使用，且需求持续暴增。只要你成为算力供应商，就能拥有一份持久不衰的复利生意。
      </p>

      {/* 合作伙伴商业模式 */}
      <h2 className='text-xl font-bold text-foreground mb-6 border-l-4 border-primary pl-3 flex items-center gap-2'>
        <span>🤝 灵活选择您的代理合作模式</span>
      </h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-10'>
        {/* 个人合伙人 */}
        <div 
          style={{
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--card)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)'
          }}
        >
          <div className='text-xs font-bold text-primary mb-1'>0 门槛免费创业</div>
          <h3 className='text-lg font-bold text-foreground mb-3'>个人代理伙伴</h3>
          <p className='text-xs text-muted-foreground leading-relaxed mb-4'>
            适合想零成本尝试 AI 赛道的个人、技术博主、社群群主或上班族。
          </p>
          <ul className='space-y-1 text-xs text-muted-foreground mb-4'>
            <li>• 注册即可直接自动开通，无需审核</li>
            <li>• 即刻拥有专属推广链接与专属邀请码</li>
            <li>• 享受直接充值分成与后续使用佣金的双重分成</li>
          </ul>
        </div>

        {/* 企业级代理 */}
        <div 
          style={{
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--card)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)'
          }}
        >
          <div className='text-xs font-bold text-purple-500 mb-1'>资源变现与规模运营</div>
          <h3 className='text-lg font-bold text-foreground mb-3'>平台/企业级代理</h3>
          <p className='text-xs text-muted-foreground leading-relaxed mb-4'>
            适合拥有开发团队、外包项目资源、AI 教学社群或大量客户的企业。
          </p>
          <ul className='space-y-1 text-xs text-muted-foreground mb-4'>
            <li>• 专享大客户级别价格，更高比例的收益与结算回报</li>
            <li>• 获得专属折扣激活码，助力渠道吸客引流</li>
            <li>• 专属技术顾问与客户经理 1对1 支撑，优先享受新资源</li>
          </ul>
        </div>
      </div>

      {/* 收益模拟计算器 */}
      <h2 className='text-xl font-bold text-foreground mb-6 border-l-4 border-primary pl-3 flex items-center gap-2'>
        <span>📈 测算您的 AI 算力代理管道收益</span>
      </h2>

      <div className='my-6 p-6 rounded-2xl border border-border bg-muted/40 mb-10'>
        <div className='mb-6'>
          <div className='flex justify-between items-center mb-3'>
            <span className='text-sm font-semibold text-muted-foreground'>每月大约能推荐几人消费？</span>
            <span className='text-lg font-black text-primary'>{referrals} 人 / 月</span>
          </div>
          <input 
            type='range' 
            min='1' 
            max='50' 
            value={referrals} 
            onChange={(e) => setReferrals(parseInt(e.target.value))}
            style={{ accentColor: '#3b82f6' }}
            className='w-full h-2 bg-muted-foreground/20 rounded-lg appearance-none cursor-pointer'
          />
          <div className='flex justify-between text-[10px] text-muted-foreground mt-2'>
            <span>1人 (顺手朋友圈分享)</span>
            <span>25人 (深度社群运营)</span>
            <span>50人 (平台对接推广)</span>
          </div>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-center'>
          <div className='p-4 rounded-xl border border-border bg-card'>
            <div className='text-[10px] text-muted-foreground mb-1'>一年后客户总数</div>
            <div className='text-lg font-bold text-foreground'>{totalCustomers} 人</div>
            <div className='text-[9px] text-muted-foreground mt-0.5'>含口碑推荐裂变</div>
          </div>
          <div className='p-4 rounded-xl border border-border bg-card'>
            <div className='text-[10px] text-muted-foreground mb-1'>第 1 个月收益</div>
            <div className='text-lg font-bold text-foreground'>¥{m1Earnings.toLocaleString()}</div>
            <div className='text-[9px] text-muted-foreground mt-0.5'>生意起步蓄力阶段</div>
          </div>
          <div className='p-4 rounded-xl border border-border bg-card'>
            <div className='text-[10px] text-muted-foreground mb-1'>第 12 个月收益</div>
            <div className='text-lg font-bold text-emerald-600 dark:text-emerald-400'>¥{m12Earnings.toLocaleString()}</div>
            <div className='text-[9px] text-muted-foreground mt-0.5'>复利裂变网络爆发</div>
          </div>
          <div className='p-4 rounded-xl border border-primary/20 text-white bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md'>
            <div className='text-[10px] text-blue-100 mb-1'>第一年累计收益</div>
            <div className='text-xl font-extrabold'>¥{totalEarnings.toLocaleString()}+</div>
            <div className='text-[9px] text-blue-200 mt-0.5'>充值返佣 + 持续API返润</div>
          </div>
        </div>
        <p className='text-[10px] text-muted-foreground mt-4 italic text-center'>
          * 以上测算基于客单价 ¥100/月，返佣比 25%，以及 6% 的口碑裂变转化，仅作为保守参考，实际收益因渠道活跃度不同会有所差异。
        </p>
      </div>

      {/* 极简三步 */}
      <h2 className='text-xl font-bold text-foreground mb-6 border-l-4 border-primary pl-3 flex items-center gap-2'>
        <span>🛠️ 轻松三步，开启 AI 事业</span>
      </h2>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-10'>
        <div className='p-5 rounded-xl border border-border bg-card text-center'>
          <div className='w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mx-auto mb-3'>1</div>
          <h4 className='text-sm font-bold text-foreground mb-1'>注册账号 (免加盟费)</h4>
          <p className='text-xs text-muted-foreground leading-relaxed'>30 秒免费开通控制台，获取您的专属邀请链接和专属邀请码。</p>
        </div>
        <div className='p-5 rounded-xl border border-border bg-card text-center'>
          <div className='w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mx-auto mb-3'>2</div>
          <h4 className='text-sm font-bold text-foreground mb-1'>分享专属渠道</h4>
          <p className='text-xs text-muted-foreground leading-relaxed'>将专属分销码和链接复制到社群、技术博客、公众号或自媒体中。</p>
        </div>
        <div className='p-5 rounded-xl border border-border bg-card text-center'>
          <div className='w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mx-auto mb-3'>3</div>
          <h4 className='text-sm font-bold text-foreground mb-1'>自动结佣提现</h4>
          <p className='text-xs text-muted-foreground leading-relaxed'>客户消费，佣金自动到账商人后台，佣金日结且支持随时提现。</p>
        </div>
      </div>

      {/* 常见问题问答 */}
      <h2 className='text-xl font-bold text-foreground mb-6 border-l-4 border-primary pl-3 flex items-center gap-2'>
        <span>❓ 常见问题答疑 FAQ</span>
      </h2>

      <div className='space-y-4 mb-10 text-sm'>
        {[
          { q: "真的不需要任何启动资金吗？", a: "是的，完全零成本。无需代理费、会员费、预存充值或任何押金。您只需要免费注册账号并分享分销链接即可，不产生任何资金风险。" },
          { q: "我不懂编程和服务器技术，能行吗？", a: "完全可以。高并发 API 网关技术、接口稳定性、多模型池维护由我们技术团队统一提供支持。您只需要负责复制分享您的推广链接，即可运营这份算力管道业务。" },
          { q: "代理收益是怎么到账并提现的？", a: "我们的代理佣金按日结算。您的客户进行充值或消耗额度时，所获返利都会自动增加至后台余额，您可随时兑换为平台额度，或直接联系在线客服进行人工提现核销结账。" },
          { q: "客户的粘性高吗？能产生持久收益吗？", a: "AI 不是一时的热度，而是在现代办公与业务中彻底沉淀的刚需。正如电网与宽带流量一样，用户一旦集成我们的网关接口，便会持续调用并付费充值，这也保证了您的佣金能够持久滚雪球增长。" }
        ].map((item, idx) => (
          <div key={idx} className='p-4 rounded-xl border border-border bg-card/50'>
            <div className='font-bold text-foreground mb-1.5 flex items-start gap-2'>
              <span className='text-primary font-black'>Q:</span>
              <span>{item.q}</span>
            </div>
            <div className='text-xs text-muted-foreground leading-relaxed flex items-start gap-2 pl-4'>
              <span>{item.a}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 行动呼吁 3D 按钮组 */}
      <div className='flex flex-col sm:flex-row gap-6 justify-center items-center mt-10'>
        {/* 申请加入 3D 按钮 */}
        <a 
          href='/console/topup' 
          style={{
            display: 'inline-block',
            padding: '12px 32px',
            borderRadius: '12px',
            border: '2px solid #3b82f6',
            color: '#3b82f6',
            backgroundColor: 'var(--background)',
            fontSize: '14px',
            fontWeight: 'bold',
            textAlign: 'center',
            cursor: 'pointer',
            textDecoration: 'none',
            boxShadow: '0 4px 0 #2563eb, 0 4px 8px rgba(59, 130, 246, 0.15)',
            transition: 'all 0.1s ease-in-out',
            transform: 'translateY(0)',
            width: '100%',
            maxWidth: '240px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 0 #2563eb, 0 8px 14px rgba(59, 130, 246, 0.25)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 0 #2563eb, 0 4px 8px rgba(59, 130, 246, 0.15)'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(2px)'
            e.currentTarget.style.boxShadow = '0 2px 0 #2563eb, 0 2px 4px rgba(59, 130, 246, 0.1)'
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 0 #2563eb, 0 8px 14px rgba(59, 130, 246, 0.25)'
          }}
        >
          前往控制台获取邀请码
        </a>

        {/* 呼叫客服 3D 按钮 */}
        <button 
          onClick={() => setActiveDocId('contact-customer-service')}
          style={{
            display: 'inline-block',
            padding: '12px 32px',
            borderRadius: '12px',
            border: '2px solid #8b5cf6',
            color: '#8b5cf6',
            backgroundColor: 'var(--background)',
            fontSize: '14px',
            fontWeight: 'bold',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 0 #7c3aed, 0 4px 8px rgba(139, 92, 246, 0.15)',
            transition: 'all 0.1s ease-in-out',
            transform: 'translateY(0)',
            width: '100%',
            maxWidth: '240px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 0 #7c3aed, 0 8px 14px rgba(139, 92, 246, 0.25)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 0 #7c3aed, 0 4px 8px rgba(139, 92, 246, 0.15)'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(2px)'
            e.currentTarget.style.boxShadow = '0 2px 0 #7c3aed, 0 2px 4px rgba(139, 92, 246, 0.1)'
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 0 #7c3aed, 0 8px 14px rgba(139, 92, 246, 0.25)'
          }}
        >
          联系客服升级企业伙伴
        </button>
      </div>
    </div>
  )
}

// Docs 主要页面组件 (TS)
const Docs: React.FC = () => {
  const [docs, setDocs] = useState<DocItem[]>([])
  const [activeDocId, setActiveDocId] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const routerState = useRouterState()

  useEffect(() => {
    // 异步加载飞书文档的数据包
    if (docsDataCache && docsDataCache.length > 0) {
      setDocs(docsDataCache)
      const urlParams = new URLSearchParams(window.location.search)
      const idParam = urlParams.get('id')
      if (idParam && docsDataCache.some((d) => d.id === idParam)) {
        setActiveDocId(idParam)
      } else {
        setActiveDocId(docsDataCache[0].id)
      }
      setLoading(false)
      return
    }

    fetch('/docs-data.json?v=20260707-image-html-download', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data: DocItem[]) => {
        docsDataCache = data
        setDocs(data)
        if (data && data.length > 0) {
          const urlParams = new URLSearchParams(window.location.search)
          const idParam = urlParams.get('id')
          if (idParam && data.some((d) => d.id === idParam)) {
            setActiveDocId(idParam)
          } else {
            setActiveDocId(data[0].id)
          }
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('加载文档失败:', err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (docs && docs.length > 0) {
      const urlParams = new URLSearchParams(window.location.search)
      const idParam = urlParams.get('id')
      if (idParam && docs.some((d) => d.id === idParam)) {
        setActiveDocId(idParam)
      } else {
        setActiveDocId(docs[0].id)
      }
    }
  }, [routerState.location, docs])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeDocId])

  if (loading) {
    const idParam =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('id')
        : null

    if (idParam === 'contact-customer-service') {
      return (
        <div className='flex flex-col pt-12 max-w-7xl mx-auto w-full px-4 md:px-8 pb-12 text-foreground'>
          <div className='flex flex-col md:flex-row gap-8'>
            <div className='hidden w-full flex-shrink-0 md:block md:w-80'>
              <div className='sticky top-24 space-y-6'>
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className='space-y-3'>
                    <div className='h-5 w-44 animate-pulse rounded bg-muted' />
                    <div className='space-y-2 pl-7'>
                      <div className='h-8 animate-pulse rounded-lg bg-muted/70' />
                      <div className='h-8 animate-pulse rounded-lg bg-muted/60' />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className='flex-1 min-w-0 max-w-4xl bg-card border border-border p-6 md:p-10 rounded-2xl shadow-sm'>
              <ContactView />
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className='flex flex-col pt-12 max-w-7xl mx-auto w-full px-4 md:px-8 pb-12 text-foreground'>
        <div className='flex flex-col md:flex-row gap-8'>
          <div className='w-full flex-shrink-0 md:w-80'>
            <div className='sticky top-24 space-y-6'>
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className='space-y-3'>
                  <div className='h-5 w-44 animate-pulse rounded bg-muted' />
                  <div className='space-y-2 pl-7'>
                    <div className='h-8 animate-pulse rounded-lg bg-muted/70' />
                    <div className='h-8 animate-pulse rounded-lg bg-muted/60' />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className='flex-1 min-w-0 max-w-4xl bg-card border border-border p-6 md:p-10 rounded-2xl shadow-sm'>
            <div className='space-y-5'>
              <div className='h-9 w-2/3 animate-pulse rounded bg-muted' />
              <div className='h-4 w-full animate-pulse rounded bg-muted/70' />
              <div className='h-4 w-5/6 animate-pulse rounded bg-muted/70' />
              <div className='h-32 w-full animate-pulse rounded-xl bg-muted/60' />
              <div className='h-4 w-full animate-pulse rounded bg-muted/70' />
              <div className='h-4 w-4/5 animate-pulse rounded bg-muted/70' />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 整理数据，按大分类分组
  const groupedDocs = CATEGORY_ORDER.reduce<Record<string, DocItem[]>>((acc, cat) => {
    const mappedCat = cat === '帮助与支持' ? '常见问题' : cat
    acc[cat] = docs.filter((doc) => doc.category === mappedCat)
    return acc;
  }, {})

  const activeDoc = docs.find((doc) => doc.id === activeDocId)

  // 自定义 Markdown 元素渲染组件映射
  const markdownComponents = {
    h1: ({ node, ...props }: any) => (
      <h1 className='text-2xl md:text-3xl font-extrabold text-foreground pb-3 border-b border-border tracking-tight mb-6 mt-4' {...props} />
    ),
    h2: ({ node, ...props }: any) => (
      <h2 className='text-xl font-bold text-foreground mt-8 mb-4 border-l-4 border-primary pl-3 flex items-center gap-2' {...props} />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className='text-lg font-bold text-foreground mt-6 mb-3' {...props} />
    ),
    p: ({ node, ...props }: any) => (
      <p className='text-muted-foreground text-sm leading-relaxed mb-4' {...props} />
    ),
    ol: ({ node, ...props }: any) => (
      <ol className='list-decimal pl-5 space-y-2 text-muted-foreground text-sm mb-4 leading-relaxed' {...props} />
    ),
    ul: ({ node, ...props }: any) => (
      <ul className='list-disc pl-5 space-y-2 text-muted-foreground text-sm mb-4 leading-relaxed' {...props} />
    ),
    li: ({ node, ...props }: any) => (
      <li className='mb-1' {...props} />
    ),
    blockquote: ({ node, ...props }: any) => {
      const content = node.children?.[0]?.children?.[0]?.value || ''
      const isWarning = content.includes('⚠') || content.includes('警告') || content.includes('提示')
      const borderClass = isWarning ? 'border-amber-500 bg-amber-500/5 text-amber-900 dark:text-amber-300' : 'border-blue-500 bg-blue-500/5 text-blue-900 dark:text-blue-300'
      return (
        <blockquote className={`border-l-4 p-4 my-4 rounded-r-md text-sm leading-relaxed ${borderClass}`} {...props} />
      )
    },
    table: ({ node, ...props }: any) => (
      <div className='overflow-x-auto my-6 border border-border rounded-lg shadow-sm'>
        <table className='min-w-full divide-y divide-border text-sm' {...props} />
      </div>
    ),
    thead: ({ node, ...props }: any) => (
      <thead className='bg-muted' {...props} />
    ),
    tbody: ({ node, ...props }: any) => (
      <tbody className='divide-y divide-border/60 bg-background' {...props} />
    ),
    tr: ({ node, ...props }: any) => (
      <tr {...props} />
    ),
    th: ({ node, ...props }: any) => (
      <th className='px-4 py-2 text-left font-semibold text-muted-foreground' {...props} />
    ),
    td: ({ node, ...props }: any) => (
      <td className='px-4 py-2 text-muted-foreground' {...props} />
    ),
    a: ({ node, href, children, ...props }: any) => {
      const text = React.Children.toArray(children).join('')
      const isImageHtmlDownload =
        href === '/docs-assets/image-html/aijuhe-image.html' &&
        text.includes('下载 HTML 文件')

      return (
        <a
          href={href}
          target={isImageHtmlDownload ? undefined : '_blank'}
          rel={isImageHtmlDownload ? undefined : 'noopener noreferrer'}
          download={isImageHtmlDownload ? 'aijuhe-image.html' : undefined}
          className={
            isImageHtmlDownload
              ? 'my-2 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90'
              : 'text-primary hover:underline font-medium inline-flex items-center gap-0.5'
          }
          {...props}
        >
          {children}
          <svg className='h-3.5 w-3.5 inline-block' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
            {isImageHtmlDownload ? (
              <path strokeLinecap='round' strokeLinejoin='round' d='M12 3v12m0 0l4-4m-4 4l-4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2' />
            ) : (
              <path strokeLinecap='round' strokeLinejoin='round' d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' />
            )}
          </svg>
        </a>
      )
    },
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\\w+)/.exec(className || '')
      const codeString = String(children).replace(/\\n$/, '')
      const isCodeBlock = !inline && (match || codeString.includes('\\n'))
      
      return isCodeBlock ? (
        <CodeBlock 
          code={codeString} 
          title={match ? match[1] : 'code'} 
        />
      ) : (
        <code className='bg-muted px-1.5 py-0.5 rounded font-mono text-sm text-destructive font-medium' {...props}>
          {children}
        </code>
      )
    },
    img({ src, alt }: any) {
      return (
        <DocImage 
          src={src} 
          alt={alt || '文档图片'} 
          caption={alt} 
        />
      )
    }
  }

  return (
    <div className='flex flex-col pt-12 max-w-7xl mx-auto w-full px-4 md:px-8 pb-12 text-foreground'>
      <div className='flex flex-col md:flex-row gap-8'>
        
        {/* 左侧导航目录 */}
        <div className='w-full md:w-80 flex-shrink-0'>
          <div className='sticky top-24 space-y-6'>
            {CATEGORY_ORDER.map((category) => {
              const categoryDocs = groupedDocs[category] || []
              if (categoryDocs.length === 0) return null

              return (
                <div key={category}>
                  {/* 大标签：字体大、加粗、颜色深，配有相应 Emoji */}
                  <div className='text-[15px] font-bold text-foreground px-3 mb-3 flex items-center gap-2'>
                    {category === '注册/登录/充值' && '🚀'}
                    {category === '安装 Agent' && '📦'}
                    {category === 'CC Switch 配置各个Agent' && '⚙️'}
                    {category === '帮助与支持' && '🙋'}
                    {category === '进阶指南' && '🔥'}
                    <span>{category}</span>
                  </div>
                  {/* 子标签列表：缩进、空心圆圈，点击变橙色并带填充背景 */}
                  <div className='space-y-1 mb-5'>
                    {categoryDocs.map((doc) => {
                      const isActive = activeDocId === doc.id
                      return (
                        <button
                          key={doc.id}
                          onClick={() => setActiveDocId(doc.id)}
                          className={`w-full text-left pl-7 pr-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
                            isActive
                              ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          <svg 
                            className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-orange-500' : 'text-muted-foreground/60'}`} 
                            fill='none' 
                            viewBox='0 0 24 24' 
                            stroke='currentColor' 
                            strokeWidth={2}
                          >
                            <circle cx='12' cy='12' r='7' />
                          </svg>
                          <span>{doc.title}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 右侧内容渲染区域 */}
        <div className='flex-1 min-w-0 max-w-4xl bg-card border border-border p-6 md:p-10 rounded-2xl shadow-sm'>
          {activeDoc ? (
            <div className='animate-fade-in'>
              {activeDocId === 'contact-customer-service' ? (
                <ContactView />
              ) : activeDocId === 'agent-merchant' ? (
                <AgentMerchantView setActiveDocId={setActiveDocId} />
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {activeDoc.markdown}
                </ReactMarkdown>
              )}
            </div>
          ) : (
            <div className='text-center py-12 text-muted-foreground'>
              请选择一篇文档阅读
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export const Route = createFileRoute('/docs/')({
  component: Docs,
})
