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

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Modal, Spin, Tag } from '@douyinfe/semi-ui';
import { CheckCircle2, ChevronRight, Info, KeyRound } from 'lucide-react';
import { API } from '../../../../helpers';

const FALLBACK_MODELS = {
  claude: [
    'claude-opus-4-8',
    'claude-opus-4-8-thinking',
    'claude-sonnet-4-5-20250929',
  ],
  codex: ['gpt-5.4-mini', 'gpt-5.4', 'gpt-5.5', 'codex-auto-review'],
};

const GUIDE_STEPS = {
  claude: {
    key: 'claude',
    title: '创建 Claude Code 令牌',
    badge: 'Claude Code',
    accent: '#7c3aed',
    pale: '#f5edff',
    soft: '#faf5ff',
    name: 'claude',
    groupText: 'Claude Code类别的分组',
    modelTitle: 'Claude Code 分组可用模型',
    tip: '创建后可通过一键复制「Claude Code API 端点」按钮直接粘贴到 CC-Switch',
  },
  codex: {
    key: 'codex',
    title: '创建 Codex 令牌',
    badge: 'CODEX',
    accent: '#0f6bff',
    pale: '#e8f2ff',
    soft: '#f0f7ff',
    name: 'Codex',
    groupText: 'Codex 类别分组',
    modelTitle: 'Codex 分组可用模型',
    tip: '创建后可通过一键复制「Codex API端点」按钮直接粘贴到 CC-Switch',
  },
};

const STEP_ORDER = ['claude', 'codex'];

function normalizeText(value) {
  return String(value || '').toLowerCase();
}

function matchesGuideGroup(group, guideKey) {
  const text = normalizeText(`${group.value} ${group.label}`);
  if (guideKey === 'claude') {
    return (
      text.includes('claude') ||
      /\bcc\b/.test(text) ||
      text.includes('opus') ||
      text.includes('sonnet') ||
      text.includes('haiku')
    );
  }
  return text.includes('codex') || text.includes('gpt');
}

function matchesGuideModel(modelName, guideKey) {
  const text = normalizeText(modelName);
  if (guideKey === 'claude') {
    return (
      text.includes('claude') ||
      text.includes('opus') ||
      text.includes('sonnet') ||
      text.includes('haiku') ||
      text.startsWith('co-')
    );
  }
  return text.includes('codex') || text.startsWith('gpt-');
}

function extractModelsForGuide(pricingModels, groups, guideKey) {
  const matchedGroupNames = new Set(
    groups
      .filter((group) => matchesGuideGroup(group, guideKey))
      .map((group) => group.value),
  );

  const fromGroups = pricingModels
    .filter((model) => {
      const enableGroups = Array.isArray(model.enable_groups)
        ? model.enable_groups
        : [];
      return enableGroups.some((group) => matchedGroupNames.has(group));
    })
    .map((model) => model.model_name)
    .filter(Boolean);

  const byName = pricingModels
    .map((model) => model.model_name)
    .filter((modelName) => matchesGuideModel(modelName, guideKey));

  const merged = [...fromGroups, ...byName];
  const unique = [...new Set(merged)].slice(0, 8);
  return unique.length > 0 ? unique : FALLBACK_MODELS[guideKey];
}

function NumberBadge({ children, accent, muted = false }) {
  return (
    <span
      className='inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold'
      style={{
        color: muted ? '#9ca3af' : '#fff',
        backgroundColor: muted ? '#f1f2f4' : accent,
      }}
    >
      {children}
    </span>
  );
}

function MiniStep({ index, children, accent }) {
  return (
    <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]'>
      <NumberBadge accent={accent}>{index}</NumberBadge>
      <div className='mt-5 text-sm leading-6 text-slate-900'>{children}</div>
    </div>
  );
}

function ModelTags({ models, accent, pale }) {
  return (
    <div className='mt-3 flex max-h-[72px] flex-wrap gap-2 overflow-hidden'>
      {models.map((model) => (
        <span
          key={model}
          className='rounded-lg px-2 py-1 text-xs font-semibold leading-none'
          style={{ color: accent, backgroundColor: pale }}
        >
          {model}
        </span>
      ))}
    </div>
  );
}

export default function TokenCreateGuideModal({ visible, onClose }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [pricingModels, setPricingModels] = useState([]);

  useEffect(() => {
    if (!visible) return;
    setActiveIndex(0);

    let ignore = false;
    const loadGuideData = async () => {
      setLoading(true);
      try {
        const [groupsRes, pricingRes] = await Promise.all([
          API.get('/api/user/self/groups'),
          API.get('/api/pricing'),
        ]);

        if (ignore) return;

        const groupData = groupsRes?.data?.data || {};
        const groupOptions = Object.entries(groupData).map(([value, info]) => ({
          value,
          label: info?.desc || value,
        }));
        setGroups(groupOptions);

        const pricingData = pricingRes?.data?.data || [];
        setPricingModels(Array.isArray(pricingData) ? pricingData : []);
      } catch (_) {
        if (!ignore) {
          setGroups([]);
          setPricingModels([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadGuideData();
    return () => {
      ignore = true;
    };
  }, [visible]);

  const guideKey = STEP_ORDER[activeIndex];
  const guide = GUIDE_STEPS[guideKey];
  const models = useMemo(
    () => extractModelsForGuide(pricingModels, groups, guideKey),
    [pricingModels, groups, guideKey],
  );

  const isLast = activeIndex === STEP_ORDER.length - 1;

  return (
    <Modal
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={640}
      maskClosable={false}
      bodyStyle={{ padding: 0 }}
      title={
        <div className='flex items-center gap-3'>
          <span
            className='inline-flex h-8 w-8 items-center justify-center rounded-full'
            style={{ color: guide.accent, backgroundColor: guide.pale }}
          >
            <KeyRound size={16} />
          </span>
          <span className='text-xl font-bold text-slate-950'>
            令牌创建引导
          </span>
        </div>
      }
    >
      <Spin spinning={loading}>
        <div className='px-8 pb-6 pt-4'>
          <div className='mb-7 flex items-center gap-4'>
            {STEP_ORDER.map((key, index) => {
              const item = GUIDE_STEPS[key];
              const active = index === activeIndex;
              const done = index < activeIndex;
              return (
                <React.Fragment key={key}>
                  <button
                    type='button'
                    className='flex shrink-0 items-center gap-2 border-none bg-transparent p-0 text-sm font-semibold'
                    style={{ color: active || done ? item.accent : '#6b7280' }}
                    onClick={() => setActiveIndex(index)}
                  >
                    {done ? (
                      <CheckCircle2 size={20} fill={item.accent} color='#fff' />
                    ) : (
                      <NumberBadge accent={item.accent} muted={!active}>
                        {index + 1}
                      </NumberBadge>
                    )}
                    <span>{item.title}</span>
                  </button>
                  {index < STEP_ORDER.length - 1 && (
                    <div
                      className='h-px flex-1'
                      style={{
                        backgroundColor: done ? item.accent : '#e5e7eb',
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
            <div className='flex items-center gap-4'>
              <span
                className='rounded-xl px-3 py-2 text-sm font-bold'
                style={{ color: guide.accent, backgroundColor: guide.pale }}
              >
                {guide.badge}
              </span>
              <div className='text-lg font-bold text-slate-950'>
                {guide.title}
              </div>
            </div>
          </div>

          <div className='mt-4 grid grid-cols-2 gap-3'>
            <MiniStep index='1' accent={guide.accent}>
              点击{' '}
              <Tag color='blue' shape='circle'>
                添加令牌
              </Tag>{' '}
              按钮
            </MiniStep>
            <MiniStep index='2' accent={guide.accent}>
              名称填写{' '}
              <Tag color='purple' shape='circle'>
                {guide.name}
              </Tag>{' '}
              或者自定义
            </MiniStep>
            <MiniStep index='3' accent={guide.accent}>
              分组选择{' '}
              <Tag color={guideKey === 'claude' ? 'purple' : 'blue'} shape='circle'>
                {guide.groupText}
              </Tag>
              <div>
                <a
                  href='/pricing'
                  className='text-xs font-bold no-underline'
                  style={{ color: guide.accent }}
                >
                  去模型广场查看更多分组〉
                </a>
              </div>
            </MiniStep>
            <MiniStep index='4' accent={guide.accent}>
              其他选项保持默认，点击提交即可
            </MiniStep>
          </div>

          <div className='mt-4 grid grid-cols-[1.45fr_1fr] gap-3'>
            <div className='rounded-2xl border border-slate-200 bg-white p-4'>
              <div className='text-sm font-semibold text-slate-500'>
                {guide.modelTitle}
              </div>
              <ModelTags
                models={models}
                accent={guide.accent}
                pale={guide.pale}
              />
            </div>

            <div
              className='rounded-2xl p-4'
              style={{ backgroundColor: guide.soft }}
            >
              <div
                className='mb-3 flex items-center gap-2 text-sm font-bold'
                style={{ color: guide.accent }}
              >
                <Info size={14} />
                提示
              </div>
              <div
                className='text-sm font-semibold leading-7'
                style={{ color: guide.accent }}
              >
                {guide.tip}
              </div>
            </div>
          </div>

          <div className='mt-8 flex items-center justify-between'>
            <div className='flex items-center gap-1.5'>
              {STEP_ORDER.map((key, index) => (
                <span
                  key={key}
                  className='h-1.5 rounded-full transition-all'
                  style={{
                    width: index === activeIndex ? 24 : 8,
                    backgroundColor:
                      index === activeIndex ? guide.accent : '#e5e7eb',
                  }}
                />
              ))}
            </div>

            <div className='flex items-center gap-3'>
              {activeIndex > 0 && (
                <Button
                  className='!rounded-xl'
                  theme='light'
                  onClick={() => setActiveIndex((prev) => prev - 1)}
                >
                  上一步
                </Button>
              )}
              <Button
                className='!rounded-xl'
                theme='solid'
                type='primary'
                onClick={() => {
                  if (isLast) {
                    onClose();
                  } else {
                    setActiveIndex((prev) => prev + 1);
                  }
                }}
              >
                <span className='inline-flex items-center gap-1.5 font-bold'>
                  {isLast ? '我知道了' : '下一步'}
                  <ChevronRight size={16} />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </Spin>
    </Modal>
  );
}
