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

import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  Typography,
  Modal,
} from '@douyinfe/semi-ui';
import { API, showError, copy, showSuccess } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import { StatusContext } from '../../context/Status';
import { useActualTheme } from '../../context/Theme';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import {
  IconGithubLogo,
  IconPlay,
  IconFile,
} from '@douyinfe/semi-icons';
import { Link } from 'react-router-dom';
import NoticeModal from '../../components/layout/NoticeModal';
import {
  Moonshot,
  OpenAI,
  XAI,
  Zhipu,
  Volcengine,
  Cohere,
  Claude,
  Gemini,
  Suno,
  Minimax,
  Wenxin,
  Spark,
  Qingyan,
  DeepSeek,
  Qwen,
  Midjourney,
  Grok,
  AzureAI,
  Hunyuan,
  Xinference,
} from '@lobehub/icons';

const { Text } = Typography;

const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const actualTheme = useActualTheme();
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const isMobile = useIsMobile();
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;
  const docsLink = '/docs';
  const isChinese = i18n.language.startsWith('zh');

  const words = ['OpenAI GPT', 'Anthropic Claude', 'Google Gemini', 'DeepSeek V3'];
  const [typedText, setTypedText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    let timer;
    const handleTyping = () => {
      const currentFullText = words[wordIndex];
      if (!isDeleting) {
        setTypedText(currentFullText.substring(0, typedText.length + 1));
        setTypingSpeed(100);
        if (typedText === currentFullText) {
          setIsDeleting(true);
          setTypingSpeed(1500);
        }
      } else {
        setTypedText(currentFullText.substring(0, typedText.length - 1));
        setTypingSpeed(50);
        if (typedText === '') {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
          setTypingSpeed(500);
        }
      }
    };
    timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [typedText, isDeleting, wordIndex, typingSpeed]);

  const testPrompt = '你是一个由 aijuhe.fun 驱动的AI助手，请用一句话向我问好。';
  const handleCopyTestPrompt = async () => {
    const ok = await copy(testPrompt);
    if (ok) {
      showSuccess(t('已复制测试提示词到剪切板'));
    }
  };

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);

      // 如果内容是 URL，则发送主题模式
      if (data.startsWith('https://')) {
        const iframe = document.querySelector('iframe');
        if (iframe) {
          iframe.onload = () => {
            iframe.contentWindow.postMessage({ themeMode: actualTheme }, '*');
            iframe.contentWindow.postMessage({ lang: i18n.language }, '*');
          };
        }
      }
    } else {
      showError(message);
      setHomePageContent('加载首页内容失败...');
    }
    setHomePageContentLoaded(true);
  };



  useEffect(() => {
    const checkNoticeAndShow = async () => {
      const lastCloseDate = localStorage.getItem('notice_close_date');
      const today = new Date().toDateString();
      if (lastCloseDate !== today) {
        try {
          const res = await API.get('/api/notice');
          const { success, data } = res.data;
          if (success && data && data.trim() !== '') {
            setNoticeVisible(true);
          }
        } catch (error) {
          console.error('获取公告失败:', error);
        }
      }
    };

    checkNoticeAndShow();
  }, []);

  useEffect(() => {
    const agreed = localStorage.getItem('aijuhe_legal_agreed_version');
    if (agreed !== '2026-05-20') {
      setLegalModalVisible(true);
    }
  }, []);

  useEffect(() => {
    displayHomePageContent().then();
  }, []);



  return (
    <div className='classic-page-fill classic-home-page w-full overflow-x-hidden'>
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />
      <Modal
        visible={legalModalVisible}
        closable={false}
        maskClosable={false}
        footer={null}
        style={{
          borderRadius: '24px',
          maxWidth: '620px',
          width: '95%',
          backgroundColor: '#ffffff',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        }}
        bodyStyle={{ padding: '24px' }}
      >
        {/* 头部区域 */}
        <div className='flex items-start mb-6'>
          <div className='w-12 h-12 rounded-2xl bg-[#FDF1E2] flex items-center justify-center text-[#D97706] mr-4 flex-shrink-0 shadow-sm'>
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
              <path d='m9 12 2 2 4-4' />
            </svg>
          </div>
          <div className='text-left'>
            <div className='flex items-center mb-1.5'>
              <span className='text-lg font-bold text-[#2E271D]'>{t('条款更新通知')}</span>
              <span className='bg-[#F1F3F5] text-[#475569] text-[10px] font-bold px-2.5 py-0.5 rounded-full ml-3 tracking-wider'>
                2026-05-20
              </span>
            </div>
            <p className='text-xs text-[#6E6352] leading-relaxed'>
              {t('我们的服务条款已于 2026-05-20 更新。在继续使用服务之前，请仔细阅读并同意以下条款。')}
            </p>
          </div>
        </div>

        {/* 分割线 */}
        <div className='h-[1px] bg-[#F5EFEB] mb-6' />

        {/* 协议网格卡片 */}
        <div className='mb-2 text-left'>
          <div className='text-xs font-bold text-[#9E9280] mb-3 uppercase tracking-wider'>{t('相关文档')}</div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* 服务条款 */}
            <a
              href='/legal/terms'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center justify-between p-4 bg-white border border-[#D4C3B3] rounded-2xl hover:border-[#8C6239] hover:shadow-sm transition-all duration-200 group'
            >
              <div className='flex items-center'>
                <div className='w-10 h-10 rounded-xl bg-[#F5EFEB] flex items-center justify-center text-[#8C6239] mr-3 group-hover:bg-[#8C6239] group-hover:text-white transition-all'>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <path d='M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z' />
                    <polyline points='14 2 14 8 20 8' />
                  </svg>
                </div>
                <span className='font-bold text-xs text-[#2E271D]'>{t('服务条款')}</span>
              </div>
              <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='text-[#9E9280] group-hover:text-[#8C6239] transition-all'>
                <line x1='7' y1='17' x2='17' y2='7' />
                <polyline points='7 7 17 7 17 17' />
              </svg>
            </a>

            {/* 使用政策 */}
            <a
              href='/legal/usage-policy'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center justify-between p-4 bg-white border border-[#D4C3B3] rounded-2xl hover:border-[#8C6239] hover:shadow-sm transition-all duration-200 group'
            >
              <div className='flex items-center'>
                <div className='w-10 h-10 rounded-xl bg-[#F5EFEB] flex items-center justify-center text-[#8C6239] mr-3 group-hover:bg-[#8C6239] group-hover:text-white transition-all'>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
                  </svg>
                </div>
                <span className='font-bold text-xs text-[#2E271D]'>{t('使用政策')}</span>
              </div>
              <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='text-[#9E9280] group-hover:text-[#8C6239] transition-all'>
                <line x1='7' y1='17' x2='17' y2='7' />
                <polyline points='7 7 17 7 17 17' />
              </svg>
            </a>

            {/* 支持的国家和地区 */}
            <a
              href='/legal/supported-regions'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center justify-between p-4 bg-white border border-[#D4C3B3] rounded-2xl hover:border-[#8C6239] hover:shadow-sm transition-all duration-200 group'
            >
              <div className='flex items-center'>
                <div className='w-10 h-10 rounded-xl bg-[#F5EFEB] flex items-center justify-center text-[#8C6239] mr-3 group-hover:bg-[#8C6239] group-hover:text-white transition-all'>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <circle cx='12' cy='12' r='10' />
                    <line x1='2' y1='12' x2='22' y2='12' />
                    <path d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' />
                  </svg>
                </div>
                <span className='font-bold text-xs text-[#2E271D]'>{t('支持的国家和地区')}</span>
              </div>
              <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='text-[#9E9280] group-hover:text-[#8C6239] transition-all'>
                <line x1='7' y1='17' x2='17' y2='7' />
                <polyline points='7 7 17 7 17 17' />
              </svg>
            </a>

            {/* 服务特定条款 */}
            <a
              href='/legal/service-specific-terms'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center justify-between p-4 bg-white border border-[#D4C3B3] rounded-2xl hover:border-[#8C6239] hover:shadow-sm transition-all duration-200 group'
            >
              <div className='flex items-center'>
                <div className='w-10 h-10 rounded-xl bg-[#F5EFEB] flex items-center justify-center text-[#8C6239] mr-3 group-hover:bg-[#8C6239] group-hover:text-white transition-all'>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <circle cx='12' cy='12' r='3' />
                    <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' />
                  </svg>
                </div>
                <span className='font-bold text-xs text-[#2E271D]'>{t('服务特定条款')}</span>
              </div>
              <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='text-[#9E9280] group-hover:text-[#8C6239] transition-all'>
                <line x1='7' y1='17' x2='17' y2='7' />
                <polyline points='7 7 17 7 17 17' />
              </svg>
            </a>
          </div>
        </div>

        {/* 底部操作区 */}
        <div className='flex justify-end gap-3 mt-8 border-t border-[#F5EFEB] pt-5'>
          <button
            onClick={() => showError(t('您需要同意服务条款及相关政策后，方能继续使用本平台服务。'))}
            className='px-8 py-2.5 border border-[#BCA895] text-xs font-semibold rounded-xl text-[#6E6352] hover:bg-[#FAF8F5] transition-all cursor-pointer bg-white'
          >
            {t('拒绝')}
          </button>
          <button
            onClick={() => {
              localStorage.setItem('aijuhe_legal_agreed_version', '2026-05-20');
              setLegalModalVisible(false);
              showSuccess(t('感谢您同意我们的服务条款！'));
            }}
            className='px-8 py-2.5 bg-[#8C6239] hover:bg-[#724F2C] text-xs font-semibold rounded-xl text-white transition-all cursor-pointer shadow-md shadow-[#8c6239]/10'
          >
            {t('同意并继续')}
          </button>
        </div>
      </Modal>
      {homePageContentLoaded && homePageContent === '' ? (
        <div className='classic-home-default w-full overflow-x-hidden !bg-[#FAF6F0] !text-[#2E271D] min-h-screen font-sans pb-16 relative'>
          {/* 背景模糊渐变球 - 柔和的亮色渐变微光 */}
          <div 
            className='absolute top-20 left-10 w-[300px] h-[300px] rounded-full bg-[#E8DCCB] blur-[120px] opacity-40 pointer-events-none'
          />
          <div 
            className='absolute top-80 right-10 w-[320px] h-[320px] rounded-full bg-[#E5E9F0] blur-[130px] opacity-50 pointer-events-none' 
          />

          {/* ==================== 一、头部 Hero 区域 ==================== */}
          <div id='intro' className='relative py-20 md:py-28 overflow-hidden text-center px-4'>
            {/* 极淡的格线背景 */}
            <div className='absolute inset-0 pointer-events-none opacity-[0.03]' style={{
              backgroundImage: 'linear-gradient(#8c6239 1px, transparent 1px), linear-gradient(90deg, #8c6239 1px, transparent 1px)',
              backgroundSize: '45px 45px',
              backgroundPosition: 'center'
            }} />

            <div className='max-w-7xl mx-auto flex flex-col items-center relative z-10'>
              {/* 药丸标签 */}
              <div className='inline-flex items-center gap-1.5 rounded-full border border-[#BCA895] bg-[#F5EFEB] px-4 py-1.5 text-xs font-semibold text-[#8C6239] mb-8 shadow-sm'>
                <span className='relative flex h-2 w-2'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C68D56] opacity-75'></span>
                  <span className='relative inline-flex rounded-full h-2 w-2 bg-[#8C6239]'></span>
                </span>
                {t('全球 AI 模型接入平台')}
              </div>

              {/* 主标题 */}
              <h1 className='text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#2E271D] tracking-tight leading-tight mb-6'>
                {t('全球顶尖模型一站式入口')}
              </h1>

              {/* 打字机动画 */}
              <div className='text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#8C6239] min-h-[55px] mb-6 flex items-center justify-center gap-1'>
                <span>{typedText}</span>
                <span className='w-[3px] h-[35px] md:h-[42px] bg-[#8C6239] animate-pulse'>|</span>
              </div>

              {/* 副标题 */}
              <p className='text-sm md:text-base text-[#6E6352] max-w-4xl mx-auto mb-10 leading-relaxed'>
                {t('统一 API 接入 Claude、GPT、Gemini 等顶级模型')}
                <br />
                {t('稳定可靠，无需复杂的 API 管理，让全球顶级模型触手可及')}
              </p>



              {/* 按钮组 */}
              <div className='flex flex-row gap-4 justify-center items-center'>
                <Link to='/console'>
                  <button className='inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#A07C5A] to-[#8C6239] px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#8c6239]/20 hover:opacity-95 transition-all cursor-pointer'>
                    {t('立即体验')}
                  </button>
                </Link>
                {docsLink && (
                  <button
                    onClick={() => window.open(docsLink, '_blank')}
                    className='inline-flex items-center justify-center rounded-xl border border-[#BCA895] bg-white px-8 py-3.5 text-sm font-semibold text-[#8C6239] hover:bg-[#FAF8F5] transition-all cursor-pointer shadow-sm'
                  >
                    {t('查看文档 →')}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ==================== 二、新手引导四步流程 ==================== */}
          <div className='max-w-7xl mx-auto px-6 py-16'>
            <h2 className='text-2xl md:text-3xl font-extrabold text-center text-[#2E271D] mb-4'>
              {t('无需编程基础，仅依靠自然语言，')}
              <br className='md:hidden' />
              {t('就能将您的想法变为现实')}
            </h2>
            <p className='text-sm text-center text-[#6E6352] max-w-3xl mx-auto mb-16 leading-relaxed'>
              {t('用最简单的配置，即刻使用稳定，安全，优惠的 AI 编程能力，体验当前全球最顶级的智能编程工具。')}
            </p>

            <div className='grid grid-cols-1 md:grid-cols-4 gap-6 relative'>
              {/* 四个卡片 */}
              <div className='bg-white rounded-2xl border border-[#BCA895] p-6 shadow-sm hover:shadow-md hover:border-[#8C6239] transition-all flex flex-col min-h-[240px]'>
                <div className='flex justify-between items-center border-b border-[#F5EFEB] pb-3 mb-4'>
                  <span className='font-bold text-lg text-[#8C6239]'>01</span>
                  <span className='text-xs text-[#9E9280] font-semibold'>{t('账号准备')}</span>
                </div>
                <h3 className='font-bold text-base text-[#2E271D] mb-2'>{t('注册/登录/充值')}</h3>
                <p className='text-xs text-[#6E6352] leading-relaxed mb-6'>
                  {t('进入控制台完成注册或登录，充值余额后即可创建和使用 API Key。')}
                </p>
                <Link to='/console' className='w-full mt-auto'>
                  <button className='w-full py-2.5 px-4 rounded-xl bg-[#8C6239] hover:bg-[#724F2C] text-xs font-semibold text-white transition-all text-center cursor-pointer'>
                    {t('注册/登录 →')}
                  </button>
                </Link>
              </div>

              <div className='bg-white rounded-2xl border border-[#BCA895] p-6 shadow-sm hover:shadow-md hover:border-[#8C6239] transition-all flex flex-col min-h-[240px]'>
                <div className='flex justify-between items-center border-b border-[#F5EFEB] pb-3 mb-4'>
                  <span className='font-bold text-lg text-[#8C6239]'>02</span>
                  <span className='text-xs text-[#9E9280] font-semibold'>{t('安装工具')}</span>
                </div>
                <h3 className='font-bold text-base text-[#2E271D] mb-2'>{t('安装 Agent')}</h3>
                <p className='text-xs text-[#6E6352] leading-relaxed mb-6'>
                  {t('选择你常用的编程 Agent。我们会整理主流工具的下载入口和适用场景。')}
                </p>
                <Link to='/docs?id=JhscwRK5tioqwOkk9RkcmBzTnxe' className='w-full mt-auto'>
                  <button className='w-full py-2.5 px-4 rounded-xl bg-[#8C6239] hover:bg-[#724F2C] text-xs font-semibold text-white transition-all text-center cursor-pointer'>
                    {t('查看 Agent 列表 →')}
                  </button>
                </Link>
              </div>

              <div className='bg-white rounded-2xl border border-[#BCA895] p-6 shadow-sm hover:shadow-md hover:border-[#8C6239] transition-all flex flex-col min-h-[240px]'>
                <div className='flex justify-between items-center border-b border-[#F5EFEB] pb-3 mb-4'>
                  <span className='font-bold text-lg text-[#8C6239]'>03</span>
                  <span className='text-xs text-[#9E9280] font-semibold'>{t('接入配置')}</span>
                </div>
                <h3 className='font-bold text-base text-[#2E271D] mb-2'>{t('CC Switch 配置各个Agent')}</h3>
                <p className='text-xs text-[#6E6352] leading-relaxed mb-6'>
                  {t('推荐使用 cc switch 管理配置。查看CC Switch 配置各个Agent的教程文档。')}
                </p>
                <Link to='/docs?id=I6obw07QmiXRh4kMLY0cdbimnQe' className='w-full mt-auto'>
                  <button className='w-full py-2.5 px-4 rounded-xl bg-[#8C6239] hover:bg-[#724F2C] text-xs font-semibold text-white transition-all text-center cursor-pointer'>
                    {t('查看配置教程 →')}
                  </button>
                </Link>
              </div>

              <div className='bg-white rounded-2xl border border-[#BCA895] p-6 shadow-sm hover:shadow-md hover:border-[#8C6239] transition-all flex flex-col min-h-[240px]'>
                <div className='flex justify-between items-center border-b border-[#F5EFEB] pb-3 mb-4'>
                  <span className='font-bold text-lg text-[#8C6239]'>04</span>
                  <span className='text-xs text-[#9E9280] font-semibold'>{t('首次验证')}</span>
                </div>
                <h3 className='font-bold text-base text-[#2E271D] mb-2'>{t('验证并开始使用')}</h3>
                <p className='text-xs text-[#6E6352] leading-relaxed mb-6'>
                  {t('完成配置后发起一次测试请求，确认模型返回正常，再开始日常编码。')}
                </p>
                <button
                  onClick={handleCopyTestPrompt}
                  className='w-full mt-auto py-2.5 px-4 rounded-xl bg-[#8C6239] hover:bg-[#724F2C] text-xs font-semibold text-white transition-all text-center cursor-pointer'
                >
                  {t('复制测试提示词 →')}
                </button>
              </div>
            </div>
          </div>

          {/* ==================== 三、兼容生态 (设备与工具) ==================== */}
          <div className='max-w-7xl mx-auto px-6 py-16'>
            <div className='mb-12'>
              <span className='text-xs font-bold text-[#8C6239] uppercase tracking-wider block mb-2'>{t('兼容生态')}</span>
              <h2 className='text-2xl md:text-3xl font-extrabold text-[#2E271D]'>{t('支持的设备与 AI 编程工具')}</h2>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
              {/* 卡片 1 - OpenClaw */}
              <div className='bg-white rounded-2xl border border-[#BCA895] p-6 shadow-sm hover:shadow-md hover:border-[#8C6239] transition-all flex flex-col min-h-[250px]'>
                <div className='w-10 h-10 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#8C6239] mb-6 shadow-inner'>
                  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z'/></svg>
                </div>
                <h3 className='font-bold text-lg text-[#2E271D] mb-3'>OpenClaw</h3>
                <p className='text-xs text-[#6E6352] leading-relaxed mb-6'>
                  {t('开源本地 AI 助手，运行在你自己电脑上，通过聊天直接执行任务，不止对话，更能动手。')}
                </p>
                <div className='text-[10px] font-bold text-[#8C6239] uppercase tracking-wider border-t border-[#FAF6F0] pt-4 mt-auto'>
                  {t('开源 · 本地运行')}
                </div>
              </div>

              {/* 卡片 2 - Claude Code */}
              <div className='bg-white rounded-2xl border border-[#BCA895] p-6 shadow-sm hover:shadow-md hover:border-[#8C6239] transition-all flex flex-col min-h-[250px]'>
                <div className='w-10 h-10 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#8C6239] mb-6 shadow-inner'>
                  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='4 17 10 11 4 5'/><line x1='12' y1='19' x2='20' y2='19'/></svg>
                </div>
                <h3 className='font-bold text-lg text-[#2E271D] mb-3'>Claude Code</h3>
                <p className='text-xs text-[#6E6352] leading-relaxed mb-6'>
                  {t('Anthropic 官方 CLI，原生支持 Extended Thinking 深度思考，写代码如自然对话般流畅。')}
                </p>
                <div className='text-[10px] font-bold text-[#8C6239] uppercase tracking-wider border-t border-[#FAF6F0] pt-4 mt-auto'>
                  {t('ANTHROPIC 官方')}
                </div>
              </div>

              {/* 卡片 3 - Codex */}
              <div className='bg-white rounded-2xl border border-[#BCA895] p-6 shadow-sm hover:shadow-md hover:border-[#8C6239] transition-all flex flex-col min-h-[250px]'>
                <div className='w-10 h-10 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#8C6239] mb-6 shadow-inner'>
                  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='16 18 22 12 16 6'/><polyline points='8 6 2 12 8 18'/></svg>
                </div>
                <h3 className='font-bold text-lg text-[#2E271D] mb-3'>Codex</h3>
                <p className='text-xs text-[#6E6352] leading-relaxed mb-6'>
                  {t('OpenAI 官方编程代理，擅长大规模重构、Bug 修复与测试生成，长任务稳定不掉线。')}
                </p>
                <div className='text-[10px] font-bold text-[#8C6239] uppercase tracking-wider border-t border-[#FAF6F0] pt-4 mt-auto'>
                  {t('OPENAI 官方')}
                </div>
              </div>

              {/* 卡片 4 - Gemini CLI */}
              <div className='bg-white rounded-2xl border border-[#BCA895] p-6 shadow-sm hover:shadow-md hover:border-[#8C6239] transition-all flex flex-col min-h-[250px]'>
                <div className='w-10 h-10 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#8C6239] mb-6 shadow-inner'>
                  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'/></svg>
                </div>
                <h3 className='font-bold text-lg text-[#2E271D] mb-3'>Gemini CLI</h3>
                <p className='text-xs text-[#6E6352] leading-relaxed mb-6'>
                  {t('Google 官方开源的终端 AI 代理，在命令行调用 Gemini 完成编码、调试与工作流自动化。')}
                </p>
                <div className='text-[10px] font-bold text-[#8C6239] uppercase tracking-wider border-t border-[#FAF6F0] pt-4 mt-auto'>
                  {t('GOOGLE 官方')}
                </div>
              </div>
            </div>
          </div>

          {/* ==================== 四、定价方案 ==================== */}
          <div id='pricing-section' className='max-w-7xl mx-auto px-6 py-16'>
            <div className='text-center mb-16'>
              <span className='text-xs font-bold text-[#8C6239] uppercase tracking-wider block mb-2'>{t('定价方案')}</span>
              <h2 className='text-2xl md:text-3xl font-extrabold text-[#2E271D] mb-3'>{t('按量付费，按需使用')}</h2>
              <p className='text-xs text-[#6E6352]'>{t('1 RMB = 1 USD，使用官方原生模型，享受更低折扣')}</p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch'>
              {/* PAYGO 按量付费 */}
              <div className='bg-white rounded-3xl border border-[#BCA895] hover:border-[#8C6239] p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[360px] relative overflow-hidden'>
                <div>
                  <div className='mb-6'>
                    <span className='text-[10px] font-bold text-[#8C6239] tracking-wider uppercase bg-[#FAF6F0] rounded px-2.5 py-1'>{t('PAYGO')}</span>
                    <h3 className='text-2xl font-extrabold text-[#2E271D] mt-3'>{t('按量付费')}</h3>
                    <p className='text-xs text-[#9E9280] mt-1'>{t('永不过期')}</p>
                  </div>
                  <ul className='space-y-4 text-xs text-[#6E6352] mb-8'>
                    <li className='flex items-center gap-2.5'>
                      <span className='text-[#8C6239] font-bold'>✓</span>
                      <span>{t('充值金额，获得等价人民币额度')}</span>
                    </li>
                    <li className='flex items-center gap-2.5'>
                      <span className='text-[#8C6239] font-bold'>✓</span>
                      <span>{t('按实际使用付费')}</span>
                    </li>
                    <li className='flex items-center gap-2.5'>
                      <span className='text-[#8C6239] font-bold'>✓</span>
                      <span>{t('永不过期')}</span>
                    </li>
                  </ul>
                </div>
                <Link to='/console' className='w-full'>
                  <button className='w-full py-3 rounded-xl bg-[#8C6239] hover:bg-[#724F2C] text-xs font-bold text-white transition-all text-center cursor-pointer'>
                    {t('立即充值')}
                  </button>
                </Link>
              </div>

              {/* AI Claude 按需付费 */}
              <div className='bg-white rounded-3xl border-2 border-[#8C6239] p-8 shadow-md hover:shadow-lg transition-all flex flex-col justify-between min-h-[360px] relative overflow-hidden'>
                <div className='absolute top-0 right-0 bg-[#8C6239] text-white text-[9px] font-extrabold px-4 py-1 rounded-bl-xl uppercase tracking-wider'>
                  {t('推荐')}
                </div>
                <div>
                  <div className='mb-6'>
                    <span className='text-[10px] font-bold text-[#8C6239] tracking-wider uppercase bg-[#FAF6F0] rounded px-2.5 py-1'>{t('AI Claude 按需付费')}</span>
                    <h3 className='text-2xl font-extrabold text-[#2E271D] mt-3'>1:1 (RMB:USD)</h3>
                    <p className='text-xs text-[#9E9280] mt-1'>{t('无需订阅，根据实际使用量灵活计费')}</p>
                  </div>
                  <ul className='space-y-4 text-xs text-[#6E6352] mb-8'>
                    <li className='flex items-center gap-2.5'>
                      <span className='text-[#8C6239] font-bold'>✓</span>
                      <span>{t('1 RMB = 1 USD，官方价格同步')}</span>
                    </li>
                    <li className='flex items-center gap-2.5'>
                      <span className='text-[#8C6239] font-bold'>✓</span>
                      <span>{t('支持 Claude 全系列模型')}</span>
                    </li>
                    <li className='flex items-center gap-2.5'>
                      <span className='text-[#8C6239] font-bold'>✓</span>
                      <span>{t('专为 Claude Code 优化')}</span>
                    </li>
                  </ul>
                </div>
                <Link to='/console' className='w-full'>
                  <button className='w-full py-3 rounded-xl bg-[#8C6239] hover:bg-[#724F2C] text-xs font-bold text-white transition-all text-center cursor-pointer shadow-md shadow-[#8c6239]/10'>
                    {t('立即开始')}
                  </button>
                </Link>
              </div>

              {/* ChatGPT 按需付费 */}
              <div className='bg-white rounded-3xl border-2 border-[#8C6239] p-8 shadow-md hover:shadow-lg transition-all flex flex-col justify-between min-h-[360px] relative overflow-hidden'>
                <div className='absolute top-0 right-0 bg-[#8C6239] text-white text-[9px] font-extrabold px-4 py-1 rounded-bl-xl uppercase tracking-wider'>
                  {t('推荐')}
                </div>
                <div>
                  <div className='mb-6'>
                    <span className='text-[10px] font-bold text-[#8C6239] tracking-wider uppercase bg-[#FAF6F0] rounded px-2.5 py-1'>{t('ChatGPT 按需付费')}</span>
                    <h3 className='text-2xl font-extrabold text-[#2E271D] mt-3'>1:1 (RMB:USD)</h3>
                    <p className='text-xs text-[#9E9280] mt-1'>{t('无需订阅，根据实际使用量灵活计费')}</p>
                  </div>
                  <ul className='space-y-4 text-xs text-[#6E6352] mb-8'>
                    <li className='flex items-center gap-2.5'>
                      <span className='text-[#8C6239] font-bold'>✓</span>
                      <span>{t('1 RMB = 1 USD，官方价格同步')}</span>
                    </li>
                    <li className='flex items-center gap-2.5'>
                      <span className='text-[#8C6239] font-bold'>✓</span>
                      <span>{t('支持 OpenAI GPT 全系列模型')}</span>
                    </li>
                    <li className='flex items-center gap-2.5'>
                      <span className='text-[#8C6239] font-bold'>✓</span>
                      <span>{t('专为 CodeX 优化')}</span>
                    </li>
                  </ul>
                </div>
                <Link to='/console' className='w-full'>
                  <button className='w-full py-3 rounded-xl bg-[#8C6239] hover:bg-[#724F2C] text-xs font-bold text-white transition-all text-center cursor-pointer shadow-md shadow-[#8c6239]/10'>
                    {t('立即开始')}
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* ==================== 五、优势与看板部分 ==================== */}
          <div className='max-w-7xl mx-auto px-6 py-16'>
            {/* 奶油古铜色大 Banner */}
            <div className='bg-gradient-to-br from-[#F5EFEB] to-[#FAF8F5] rounded-3xl border border-[#BCA895] p-8 md:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 mb-12 relative overflow-hidden'>
              <div className='absolute top-0 right-0 w-[200px] h-[200px] bg-[#E8DCCB]/25 rounded-full blur-[80px] pointer-events-none' />
              <div className='max-w-2xl text-left relative z-10'>
                <span className='inline-block bg-[#F5EFEB] text-[#8C6239] text-xs font-bold rounded-full px-3.5 py-1 mb-4 shadow-sm'>
                  {t('低价优势')}
                </span>
                <h2 className='text-2xl md:text-3xl font-extrabold text-[#2E271D] mb-4'>
                  {t('同样是顶级模型，成本低至 0.7 折')}
                </h2>
                <p className='text-sm text-[#6E6352] leading-relaxed mb-6'>
                  {t('无月费、按量计费、余额长期可用，同时支持企业订阅与商务采购。多节点调度与稳定链路优化，面向全球用户都能获得更稳、更省的调用体验。')}
                </p>

                {/* 横排小标签 */}
                <div className='flex flex-wrap gap-2.5'>
                  <span className='inline-flex items-center gap-1 bg-white border border-[#D4C3B3] rounded-full px-3 py-1 text-xs text-[#6E6352] font-medium'>
                    <span className='text-[#8C6239] font-bold'>✓</span> {t('价格透明')}
                  </span>
                  <span className='inline-flex items-center gap-1 bg-white border border-[#D4C3B3] rounded-full px-3 py-1 text-xs text-[#6E6352] font-medium'>
                    <span className='text-[#8C6239] font-bold'>✓</span> {t('企业订阅支持')}
                  </span>
                  <span className='inline-flex items-center gap-1 bg-white border border-[#D4C3B3] rounded-full px-3 py-1 text-xs text-[#6E6352] font-medium'>
                    <span className='text-[#8C6239] font-bold'>✓</span> {t('充值即用')}
                  </span>
                  <span className='inline-flex items-center gap-1 bg-white border border-[#D4C3B3] rounded-full px-3 py-1 text-xs text-[#6E6352] font-medium'>
                    <span className='text-[#8C6239] font-bold'>✓</span> {t('全球稳定可连')}
                  </span>
                </div>
              </div>

              {/* 右侧操作按钮 */}
              <div className='flex flex-col gap-3 min-w-[200px] w-full md:w-auto relative z-10'>
                {docsLink && (
                  <button
                    onClick={() => window.open(docsLink, '_blank')}
                    className='w-full py-3.5 px-6 rounded-xl bg-white border border-[#BCA895] hover:bg-[#FAF8F5] text-xs font-bold text-[#8C6239] transition-all text-center cursor-pointer shadow-sm'
                  >
                    {t('查看计费说明')}
                  </button>
                )}
                <Link to='/console' className='w-full'>
                  <button className='w-full py-3.5 px-6 rounded-xl bg-[#8C6239] hover:bg-[#724F2C] text-xs font-bold text-white transition-all text-center cursor-pointer shadow-md shadow-[#8c6239]/10'>
                    {t('查看模型价格')}
                  </button>
                </Link>
              </div>
            </div>

            {/* 下方 4 个看板 */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
              <div className='bg-white rounded-2xl border border-[#BCA895] hover:border-[#8C6239] p-6 shadow-sm hover:shadow-md transition-all text-center'>
                <div className='text-3xl font-extrabold text-[#8C6239]'>100+</div>
                <div className='text-xs text-[#6E6352] mt-2 font-medium'>{t('模型覆盖数量')}</div>
              </div>
              <div className='bg-white rounded-2xl border border-[#BCA895] hover:border-[#8C6239] p-6 shadow-sm hover:shadow-md transition-all text-center'>
                <div className='text-3xl font-extrabold text-[#8C6239]'>99.9%</div>
                <div className='text-xs text-[#6E6352] mt-2 font-medium'>{t('服务可用率 SLA')}</div>
              </div>
              <div className='bg-white rounded-2xl border border-[#BCA895] hover:border-[#8C6239] p-6 shadow-sm hover:shadow-md transition-all text-center'>
                <div className='text-3xl font-extrabold text-[#8C6239]'>{t('低至 0.7折')}</div>
                <div className='text-xs text-[#6E6352] mt-2 font-medium'>{t('官方同款接口更低成本')}</div>
              </div>
              <div className='bg-white rounded-2xl border border-[#BCA895] hover:border-[#8C6239] p-6 shadow-sm hover:shadow-md transition-all text-center'>
                <div className='text-3xl font-extrabold text-[#8C6239]'>50,000+</div>
                <div className='text-xs text-[#6E6352] mt-2 font-medium'>{t('开发者与团队正在使用')}</div>
              </div>
            </div>
          </div>

          {/* ==================== 六、页面底部 CTA ==================== */}
          <div className='bg-[#FAF6F0] py-20 px-6 border-t border-[#D4C3B3] text-center relative overflow-hidden'>
            <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[150px] bg-[#E8DCCB]/25 rounded-full blur-[100px] pointer-events-none' />
            <div className='max-w-3xl mx-auto relative z-10'>
              <h2 className='text-3xl md:text-4xl font-extrabold text-[#2E271D] mb-4'>
                {t('开始体验全球顶尖模型')}
              </h2>
              <p className='text-sm md:text-base text-[#6E6352] max-w-2xl mx-auto mb-10 leading-relaxed'>
                {t('加入数以万计的开发者行列，利用 aijuhe.fun 稳定、专业的基础设施构建人工智能的未来。')}
              </p>
              <Link to='/console'>
                <button className='inline-flex items-center justify-center rounded-xl bg-[#8C6239] hover:bg-[#724F2C] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#8c6239]/20 transition-all cursor-pointer'>
                  {t('进入控制台')}
                </button>
              </Link>
              <div className='mt-12 flex flex-wrap justify-center gap-4 text-xs text-[#9E9280]'>
                <Link to='/legal/terms' className='hover:text-[#8C6239] transition-colors'>【服务条款】</Link>
                <Link to='/legal/supported-regions' className='hover:text-[#8C6239] transition-colors'>【支持的国家和地区】</Link>
                <Link to='/legal/usage-policy' className='hover:text-[#8C6239] transition-colors'>【使用政策】</Link>
                <Link to='/legal/service-specific-terms' className='hover:text-[#8C6239] transition-colors'>【服务特定条款】</Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='classic-page-fill overflow-x-hidden w-full'>
          {homePageContent.startsWith('https://') ? (
            <iframe
              src={homePageContent}
              className='w-full h-full border-none'
            />
          ) : (
            <div
              className='mt-[60px]'
              dangerouslySetInnerHTML={{ __html: homePageContent }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
