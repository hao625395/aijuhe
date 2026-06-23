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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  InputNumber,
  Modal,
  Space,
  Spin,
  Table,
  Tag,
  Toast,
  Tooltip,
  Typography,
} from '@douyinfe/semi-ui';
import { IconRefresh, IconSave, IconUserGroup } from '@douyinfe/semi-icons';
import { API, showError, showSuccess } from '../../../../helpers';

const { Text } = Typography;

function parseJsonSafe(value, fallback) {
  if (!value || !String(value).trim()) return fallback;
  try {
    return JSON.parse(value);
  } catch (_) {
    return fallback;
  }
}

function normalizeRatio(value, fallback = 1) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function formatRatio(value) {
  const ratio = normalizeRatio(value, 1);
  if (Number.isInteger(ratio)) return String(ratio);
  return ratio.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
}

function buildOptionMap(options) {
  const result = {};
  (options || []).forEach((item) => {
    result[item.key] = item.value;
  });
  return result;
}

function previewRows(rows) {
  const changedRows = rows.filter((row) => row.enabled);
  if (changedRows.length === 0) return '本次没有启用任何用户专属倍率。';
  return changedRows
    .map(
      (row) =>
        `${row.group}: ${formatRatio(row.baseRatio)}x -> ${formatRatio(row.ratio)}x`,
    )
    .join('\n');
}

export default function CustomerGroupRatioEditor({
  userId,
  onSaved,
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState([]);
  const [userData, setUserData] = useState(null);
  const [userSetting, setUserSetting] = useState({});
  const [batchDiscount, setBatchDiscount] = useState(0.8);

  const selectedCount = rows.filter((row) => row.selected).length;
  const enabledCount = rows.filter((row) => row.enabled).length;

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [optionRes, groupRes, userRes] = await Promise.all([
        API.get('/api/option/'),
        API.get('/api/group/'),
        API.get(`/api/user/${userId}`),
      ]);

      const options = buildOptionMap(optionRes?.data?.data || []);
      const groupRatio = parseJsonSafe(options.GroupRatio, {});
      const userUsableGroups = parseJsonSafe(options.UserUsableGroups, {});
      const apiGroups = Array.isArray(groupRes?.data?.data)
        ? groupRes.data.data
        : [];
      const nextUserData = userRes?.data?.data || {};
      const nextUserSetting = parseJsonSafe(nextUserData.setting, {});
      const userOverrides = nextUserSetting.group_ratio_overrides || {};

      const names = Array.from(
        new Set([
          ...Object.keys(groupRatio),
          ...Object.keys(userUsableGroups),
          ...apiGroups,
        ]),
      ).filter(Boolean);

      const nextRows = names.map((group) => {
        const baseRatio = normalizeRatio(groupRatio[group], 1);
        const hasOverride = Object.prototype.hasOwnProperty.call(
          userOverrides,
          group,
        );
        return {
          key: group,
          group,
          desc: userUsableGroups[group] || '',
          baseRatio,
          ratio: normalizeRatio(userOverrides[group], baseRatio),
          enabled: hasOverride,
          selected: false,
        };
      });

      nextRows.sort((a, b) => a.group.localeCompare(b.group));
      setRows(nextRows);
      setUserData(nextUserData);
      setUserSetting(nextUserSetting);
    } catch (error) {
      showError(error.message || '加载用户专属倍率失败');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateRows = useCallback((updater) => {
    setRows((prev) => (typeof updater === 'function' ? updater(prev) : updater));
  }, []);

  const setSelectedForAll = (selected) => {
    updateRows((prev) => prev.map((row) => ({ ...row, selected })));
  };

  const invertSelected = () => {
    updateRows((prev) =>
      prev.map((row) => ({ ...row, selected: !row.selected })),
    );
  };

  const applyBatchDiscount = () => {
    const discount = normalizeRatio(batchDiscount, NaN);
    if (!Number.isFinite(discount)) {
      Toast.warning('请输入有效折扣比例');
      return;
    }
    if (selectedCount === 0) {
      Toast.warning('请先选择要批量修改的分组');
      return;
    }
    updateRows((prev) =>
      prev.map((row) =>
        row.selected
          ? {
              ...row,
              ratio: Number((row.baseRatio * discount).toFixed(6)),
              enabled: true,
            }
          : row,
      ),
    );
  };

  const clearSelectedOverrides = () => {
    if (selectedCount === 0) {
      Toast.warning('请先选择要清空的分组');
      return;
    }
    updateRows((prev) =>
      prev.map((row) =>
        row.selected
          ? { ...row, ratio: row.baseRatio, enabled: false }
          : row,
      ),
    );
  };

  const restoreSelectedBaseRatios = () => {
    if (selectedCount === 0) {
      Toast.warning('请先选择要恢复基础倍率的分组');
      return;
    }
    updateRows((prev) =>
      prev.map((row) =>
        row.selected
          ? { ...row, ratio: row.baseRatio, enabled: false }
          : row,
      ),
    );
  };

  const save = async () => {
    if (!userId) return;
    const targetOverrides = {};
    rows.forEach((row) => {
      if (row.enabled) {
        targetOverrides[row.group] = normalizeRatio(row.ratio, row.baseRatio);
      }
    });

    const nextSetting = { ...(userSetting || {}) };
    if (Object.keys(targetOverrides).length > 0) {
      nextSetting.group_ratio_overrides = targetOverrides;
    } else {
      delete nextSetting.group_ratio_overrides;
    }

    Modal.confirm({
      title: '确认保存该用户专属倍率？',
      content: (
        <div>
          <div className='mb-2 text-sm text-slate-700'>
            将只为用户{' '}
            <Tag color='blue'>{userData?.username || userId}</Tag>{' '}
            保存以下模型分组专属倍率：
          </div>
          <pre className='max-h-56 overflow-auto rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-700'>
            {previewRows(rows)}
          </pre>
          <div className='mt-2 text-xs text-orange-600'>
            这次保存只影响该用户，不会影响同一用户分组里的其他用户。
          </div>
        </div>
      ),
      okText: '确认保存',
      cancelText: '取消',
      onOk: async () => {
        setSaving(true);
        try {
          const res = await API.put('/api/user/', {
            id: Number(userId),
            setting: JSON.stringify(nextSetting),
          });
          if (res?.data?.success) {
            showSuccess('该用户专属倍率已保存');
            setUserSetting(nextSetting);
            await loadData();
            onSaved?.();
          } else {
            showError(res?.data?.message || '保存失败');
          }
        } catch (error) {
          showError(error.message || '保存失败');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        title: (
          <Checkbox
            checked={rows.length > 0 && selectedCount === rows.length}
            indeterminate={selectedCount > 0 && selectedCount < rows.length}
            onChange={(e) => setSelectedForAll(e.target.checked)}
          />
        ),
        dataIndex: 'selected',
        width: 46,
        render: (_, record) => (
          <Checkbox
            checked={record.selected}
            onChange={(e) => {
              updateRows((prev) =>
                prev.map((row) =>
                  row.group === record.group
                    ? { ...row, selected: e.target.checked }
                    : row,
                ),
              );
            }}
          />
        ),
      },
      {
        title: '模型分组',
        dataIndex: 'group',
        render: (_, record) => (
          <div className='min-w-0'>
            <div className='flex items-center gap-2'>
              <Text strong>{record.group}</Text>
              {record.enabled && (
                <Tag size='small' color='green'>
                  用户专属
                </Tag>
              )}
              {record.baseRatio <= 0.3 && (
                <Tooltip content='基础倍率已经较低，继续打折前请确认利润'>
                  <Tag size='small' color='orange'>
                    低倍率
                  </Tag>
                </Tooltip>
              )}
            </div>
            {record.desc && (
              <div className='mt-1 truncate text-xs text-slate-500'>
                {record.desc}
              </div>
            )}
          </div>
        ),
      },
      {
        title: '基础倍率',
        dataIndex: 'baseRatio',
        width: 92,
        render: (value) => `${formatRatio(value)}x`,
      },
      {
        title: '用户专属倍率',
        dataIndex: 'ratio',
        width: 150,
        render: (_, record) => (
          <InputNumber
            size='small'
            min={0}
            step={0.01}
            precision={4}
            value={record.ratio}
            suffix='x'
            style={{ width: 120 }}
            onChange={(value) => {
              updateRows((prev) =>
                prev.map((row) =>
                  row.group === record.group
                    ? {
                        ...row,
                        ratio: normalizeRatio(value, row.baseRatio),
                        enabled: true,
                      }
                    : row,
                ),
              );
            }}
          />
        ),
      },
      {
        title: '启用',
        dataIndex: 'enabled',
        width: 72,
        render: (_, record) => (
          <Checkbox
            checked={record.enabled}
            onChange={(e) => {
              updateRows((prev) =>
                prev.map((row) =>
                  row.group === record.group
                    ? {
                        ...row,
                        enabled: e.target.checked,
                        ratio: e.target.checked ? row.ratio : row.baseRatio,
                      }
                    : row,
                ),
              );
            }}
          />
        ),
      },
    ],
    [rows.length, selectedCount, updateRows],
  );

  return (
    <div className='rounded-2xl border border-slate-100 bg-white p-4 shadow-sm'>
      <div className='mb-3 flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <div className='flex items-center gap-2'>
            <IconUserGroup />
            <Text className='text-lg font-medium'>大客户用户专属倍率</Text>
            <Tag color='blue'>{userData?.username || userId}</Tag>
          </div>
          <div className='mt-1 text-xs leading-5 text-slate-500'>
            只给当前用户单独配置优惠倍率。未启用专属倍率的分组直接使用基础倍率，不影响任何其他用户。
          </div>
        </div>
        <Space>
          <Button icon={<IconRefresh />} onClick={loadData} loading={loading}>
            刷新
          </Button>
          <Button
            theme='solid'
            type='primary'
            icon={<IconSave />}
            onClick={save}
            loading={saving}
          >
            保存倍率
          </Button>
        </Space>
      </div>

      <div className='mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3'>
        <Button size='small' onClick={() => setSelectedForAll(true)}>
          全选全部分组
        </Button>
        <Button size='small' onClick={() => setSelectedForAll(false)}>
          清空选择
        </Button>
        <Button size='small' onClick={invertSelected}>
          反选
        </Button>
        <Text type='tertiary' size='small'>
          折扣比例
        </Text>
        <Tooltip content='按基础倍率乘以折扣比例：例如基础倍率 0.72x，填 0.8 后专属倍率为 0.576x'>
          <InputNumber
            size='small'
            min={0}
            step={0.01}
            precision={4}
            value={batchDiscount}
            style={{ width: 120 }}
            onChange={(value) => setBatchDiscount(value)}
          />
        </Tooltip>
        <Button size='small' type='primary' onClick={applyBatchDiscount}>
          批量设置折扣比例
        </Button>
        <Button
          size='small'
          type='danger'
          theme='light'
          onClick={clearSelectedOverrides}
        >
          清空所选专属倍率
        </Button>
        <Button size='small' onClick={restoreSelectedBaseRatios}>
          恢复基础倍率
        </Button>
        <Text type='tertiary' size='small'>
          已选 {selectedCount} 个，已启用用户专属倍率 {enabledCount} 个
        </Text>
      </div>

      <Spin spinning={loading}>
        <Table
          size='small'
          columns={columns}
          dataSource={rows}
          pagination={false}
          rowKey='group'
          scroll={{ y: 300 }}
        />
      </Spin>
    </div>
  );
}
