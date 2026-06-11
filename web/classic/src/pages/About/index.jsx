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

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API, showError } from '../../helpers';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import { Sparkles, Terminal, ArrowRight, ShieldCheck, Layers, Cpu } from 'lucide-react';

const About = () => {
  const { t } = useTranslation();
  const [about, setAbout] = useState('');
  const [aboutLoaded, setAboutLoaded] = useState(false);
  const currentYear = new Date().getFullYear();

  const displayAbout = async () => {
    setAbout(localStorage.getItem('about') || '');
    try {
      const res = await API.get('/api/about');
      const { success, message, data } = res.data;
      if (success) {
        let aboutContent = data;
        if (!data.startsWith('https://')) {
          aboutContent = marked.parse(data);
        }
        setAbout(aboutContent);
        localStorage.setItem('about', aboutContent);
      } else {
        showError(message);
        setAbout(t('加载关于内容失败...'));
      }
    } catch (error) {
      console.error('获取关于页面失败:', error);
      setAbout(t('加载关于内容失败...'));
    }
    setAboutLoaded(true);
  };

  useEffect(() => {
    displayAbout().then();
  }, []);

  return (
    <div className='classic-page-fill about-home-bg flex flex-col pt-[60px] px-2'>
      {aboutLoaded && about === '' ? (
        <div className="relative z-10 w-full min-h-screen text-zinc-900 dark:text-zinc-100 overflow-x-hidden pt-12 pb-16">
          {/* 1. Hero Section */}
          <section className="relative overflow-hidden py-16">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8C6239]/5 via-transparent to-transparent pointer-events-none" />
            <div className="mx-auto max-w-4xl px-6 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#8C6239]/20 bg-[#FAF6F0] dark:bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-[#8C6239] mb-8">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8C6239] animate-pulse" />
                AI 基础设施与路由
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl text-zinc-900 dark:text-zinc-50 mb-6 leading-tight">
                构建面向未来的<br/>
                <span className="bg-gradient-to-r from-[#8C6239] to-[#b3855c] bg-clip-text text-transparent">AI 基础设施与模型路由</span>
              </h1>
              <p className="mx-auto max-w-2xl text-base text-zinc-650 dark:text-zinc-400 leading-relaxed mb-8">
                AIJUHE 聚合全球主流大模型，提供统一的 OpenAI 兼容 API 接口，让开发者、企业和 AI 应用团队用一个入口轻松调度多种模型，降低集成难度与运行成本。
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link 
                  to="/console"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#8C6239] px-6 py-3 text-sm font-semibold text-white hover:bg-[#704d2b] transition-all shadow-sm shadow-[#8C6239]/20"
                >
                  开始使用
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link 
                  to="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-3 text-sm font-semibold text-zinc-650 dark:text-zinc-350 hover:bg-[#FAF6F0]/30 hover:border-[#D4C5B3] transition-all"
                >
                  查看价格
                </Link>
              </div>
            </div>
          </section>

          {/* 2. Stats Section */}
          <section className="bg-white/40 backdrop-blur-sm dark:bg-zinc-900/20">
            <div className="mx-auto max-w-4xl px-6 py-10">
              <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-[#8C6239]">50+</div>
                  <div className="mt-1.5 text-xs font-medium text-zinc-650 dark:text-zinc-400">{t('支持模型')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-[#8C6239]">40+</div>
                  <div className="mt-1.5 text-xs font-medium text-zinc-650 dark:text-zinc-400">{t('上游供应商')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-[#8C6239]">99.9%</div>
                  <div className="mt-1.5 text-xs font-medium text-zinc-650 dark:text-zinc-400">{t('服务可用性')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-[#8C6239]">~80%</div>
                  <div className="mt-1.5 text-xs font-medium text-zinc-650 dark:text-zinc-400">{t('成本节省')}</div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Core Features Section */}
          <section className="mx-auto max-w-4xl px-6 py-16">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold md:text-3xl text-zinc-900 dark:text-zinc-50">为什么选择 AIJUHE</h2>
              <p className="mt-3 text-zinc-650 dark:text-zinc-400 text-sm">用技术与专注，让大模型集成变得简单而优雅</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200/50 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50 p-6 hover:border-[#D4C5B3] hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-lg bg-[#FAF6F0] dark:bg-zinc-800 flex items-center justify-center text-[#8C6239] mb-4">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-2">统一的 API Key</h3>
                <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed">
                  一键配通 Claude、GPT、Gemini、DeepSeek 等全球主流大模型，免去在多个平台逐个注册、充值和管理密钥的繁琐流程。
                </p>
              </div>
              <div className="rounded-xl border border-gray-200/50 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50 p-6 hover:border-[#D4C5B3] hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-lg bg-[#FAF6F0] dark:bg-zinc-800 flex items-center justify-center text-[#8C6239] mb-4">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-2">完全兼容的接口</h3>
                <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed">
                  严格兼容 OpenAI 官方标准格式。对于现有的程序、客户端和 AI 代理，只需替换根地址与 API 密钥，零开发成本无缝接入。
                </p>
              </div>
              <div className="rounded-xl border border-gray-200/50 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50 p-6 hover:border-[#D4C5B3] hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-lg bg-[#FAF6F0] dark:bg-zinc-800 flex items-center justify-center text-[#8C6239] mb-4">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-2">一体化后台管理</h3>
                <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed">
                  提供独立、详尽的数据看板。消耗额度、请求日志、并发统计一目了然，方便企业与开发者掌握每一分用量与成本。
                </p>
              </div>
              <div className="rounded-xl border border-gray-200/50 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50 p-6 hover:border-[#D4C5B3] hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-lg bg-[#FAF6F0] dark:bg-zinc-800 flex items-center justify-center text-[#8C6239] mb-4">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-2">智能通道调度</h3>
                <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed">
                  采用企业级高可用集群架构，自动调度成本、延迟最佳的上游通道，并内置故障快速自动重试与转移，保障业务永不断线。
                </p>
              </div>
            </div>
          </section>

          {/* 4. Context / Vision Section */}
          <section className="bg-[#FAF6F0]/20 dark:bg-zinc-900/10">
            <div className="mx-auto max-w-4xl px-6 py-16">
              <div className="md:grid md:grid-cols-2 md:gap-16 items-center">
                <div>
                  <h2 className="text-2xl font-bold md:text-3xl text-zinc-900 dark:text-zinc-50 mb-6">算力与 Token：AI 时代的全新度量衡</h2>
                  <div className="space-y-4 text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed">
                    <p>每一次对话、每一行生成的代码或 Agent 执行的复杂重构任务，本质上消耗的都是大模型的推理算力与 Token，它们是大模型供应链中的基本流转货币。</p>
                    <p>AIJUHE 致力于通过核心路由分流技术，将杂乱、易受网络与限频影响的多上游模型接口，塑造成<strong>简单、高可用、可计量且按需分配</strong>的基础调用通道。</p>
                    <p>把处理风控、多账单、频繁限频和通道故障转移的繁重技术底座交给 AIJUHE，将您宝贵的精力百分百倾注回产品和商业本身的增长中。</p>
                  </div>
                </div>
                <div className="mt-10 md:mt-0">
                  <div className="rounded-2xl border border-[#8C6239]/10 bg-white dark:bg-zinc-900 p-6 space-y-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">😰</span>
                      <div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-50">传统碎片接入</div>
                        <div className="text-[10px] text-zinc-650 dark:text-zinc-400 mt-0.5">多处开通 · 账单繁杂 · 通道单点故障</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 justify-center text-[#8C6239] font-bold text-xs">
                      <span className="text-xl animate-pulse">⚡</span>
                      <div>
                        <div className="text-[11px] font-bold tracking-wider">→ 接入 AIJUHE 统一路由网关 →</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">😊</span>
                      <div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-50">极简高效网关</div>
                        <div className="text-[10px] text-zinc-650 dark:text-zinc-400 mt-0.5">单一 Key · 标准格式 · 故障自愈通道</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 5. CTA Section */}
          <section className="mx-auto max-w-4xl px-6 py-20 text-center">
            <div className="rounded-2xl border border-[#8C6239]/10 bg-gradient-to-br from-[#8C6239]/5 to-transparent p-10 md:p-12">
              <div className="text-4xl mb-6">🔥</div>
              <blockquote className="text-lg font-bold text-zinc-900 dark:text-zinc-50 leading-relaxed md:text-xl mb-6">
                &quot;AIJUHE，连接大语言模型与 AI 生产力应用的基础底座&quot;
              </blockquote>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
                无论您是独立创作者、高成长初创企业还是经验丰富的开发团队，AIJUHE 都将以最少的操作阻碍和极高的可用率，提供最卓越的模型性能。
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  to="/console"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#8C6239] px-8 py-3.5 text-sm font-semibold text-white hover:bg-[#704d2b] transition-all shadow-sm shadow-[#8C6239]/20"
                >
                  免费体验 ↗
                </Link>
                <Link 
                  to="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-8 py-3.5 text-sm font-semibold text-zinc-650 dark:text-zinc-350 hover:bg-[#FAF6F0]/30 hover:border-[#D4C5B3] transition-all"
                >
                  服务价格表
                </Link>
              </div>
            </div>
          </section>

          {/* 底部小版权声明 */}
          <div className="text-center py-8 text-[11px] text-zinc-650/50 dark:text-zinc-400/50 mt-12 bg-white/20">
            <span>AIJUHE © {currentYear} | All Rights Reserved.</span>
          </div>
        </div>
      ) : (
        <>
          {about.startsWith('https://') ? (
            <iframe
              src={about}
              style={{
                width: '100%',
                flex: '1 1 auto',
                minHeight: 0,
                border: 'none',
              }}
            />
          ) : (
            <div
              style={{ fontSize: 'larger' }}
              dangerouslySetInnerHTML={{ __html: about }}
            ></div>
          )}
        </>
      )}
    </div>
  );
};

export default About;
