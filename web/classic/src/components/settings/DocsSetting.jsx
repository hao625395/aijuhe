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
import { Card, Spin, Form, Button, Toast, Collapse } from '@douyinfe/semi-ui';
import { API, showError } from '../../helpers';

const DocsSetting = () => {
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
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
  });

  const getOptions = async () => {
    const res = await API.get('/api/option/');
    const { success, message, data } = res.data;
    if (success) {
      const newInputs = { ...inputs };
      data.forEach((item) => {
        if (item.key in inputs) {
          newInputs[item.key] = item.value;
        }
      });
      setInputs(newInputs);
    } else {
      showError(message);
    }
  };

  const onRefresh = async () => {
    try {
      setLoading(true);
      await getOptions();
    } catch (error) {
      showError('获取配置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    onRefresh();
  }, []);

  const handleInputChange = (name, value) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // 遍历 inputs 批量上传更新
      for (const [key, value] of Object.entries(inputs)) {
        await API.put('/api/option/', { key, value: String(value) });
      }
      Toast.success('文档设置更新成功！');
    } catch (error) {
      showError('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading} size="large">
      <Card style={{ marginTop: '10px' }} title="内置文档设置" headerExtraContent={
        <Button onClick={onRefresh} size="small" type="secondary">刷新</Button>
      }>
        <Form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Input
              label="文档显示系统名字"
              field="DocsSystemName"
              placeholder="默认：二狗子"
              value={inputs.DocsSystemName}
              onChange={(value) => handleInputChange('DocsSystemName', value)}
            />
            <Form.Input
              label="文档 API 请求地址"
              field="DocsServerAddress"
              placeholder="默认：https://ergouzi.life"
              value={inputs.DocsServerAddress}
              onChange={(value) => handleInputChange('DocsServerAddress', value)}
            />
            <Form.Input
              label="CC Switch 客户端下载链接"
              field="DocsClientDownloadLink"
              placeholder="默认：https://github.com/farion1231/cc-switch/releases"
              value={inputs.DocsClientDownloadLink}
              onChange={(value) => handleInputChange('DocsClientDownloadLink', value)}
            />
            <Form.Input
              label="Discord 客服沟通链接"
              field="DocsDiscordLink"
              placeholder="默认：https://discord.gg/Cq8JRkuQz"
              value={inputs.DocsDiscordLink}
              onChange={(value) => handleInputChange('DocsDiscordLink', value)}
            />
          </div>

          <div style={{ marginTop: '20px' }}>
            <Collapse>
              <Collapse.Panel header="高级：自定义文档截图 (留空则默认使用系统自带图片)" itemKey="images">
                <div style={{ padding: '10px 0' }} className="space-y-4">
                  <div className="text-xs font-semibold text-gray-400 mb-2">购买普通余额截图替换</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Input
                      label="钱包充值入口截图 URL"
                      field="DocsImgWalletEntry"
                      placeholder="默认本地：/docs-assets/purchase/wallet-entry.png"
                      value={inputs.DocsImgWalletEntry}
                      onChange={(value) => handleInputChange('DocsImgWalletEntry', value)}
                    />
                    <Form.Input
                      label="外部下单网页截图 URL"
                      field="DocsImgOrderPage"
                      placeholder="默认本地：/docs-assets/purchase/order-page.png"
                      value={inputs.DocsImgOrderPage}
                      onChange={(value) => handleInputChange('DocsImgOrderPage', value)}
                    />
                    <Form.Input
                      label="拿到兑换码截图 URL"
                      field="DocsImgCodeMessage"
                      placeholder="默认本地：/docs-assets/purchase/code-message.png"
                      value={inputs.DocsImgCodeMessage}
                      onChange={(value) => handleInputChange('DocsImgCodeMessage', value)}
                    />
                    <Form.Input
                      label="卡密兑换成功截图 URL"
                      field="DocsImgCodeExchange"
                      placeholder="默认本地：/docs-assets/purchase/code-exchange.png"
                      value={inputs.DocsImgCodeExchange}
                      onChange={(value) => handleInputChange('DocsImgCodeExchange', value)}
                    />
                  </div>

                  <div className="text-xs font-semibold text-gray-400 mt-4 mb-2">CC Switch 配置 Codex 截图替换</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Input
                      label="下载与主界面截图 URL"
                      field="DocsImgDownloadRelease"
                      placeholder="默认本地：/docs-assets/cc-switch/download-release.png"
                      value={inputs.DocsImgDownloadRelease}
                      onChange={(value) => handleInputChange('DocsImgDownloadRelease', value)}
                    />
                    <Form.Input
                      label="Codex 添加按钮截图 URL"
                      field="DocsImgOpenai1"
                      placeholder="默认本地：/docs-assets/cc-switch/openai-1.png"
                      value={inputs.DocsImgOpenai1}
                      onChange={(value) => handleInputChange('DocsImgOpenai1', value)}
                    />
                    <Form.Input
                      label="添加自定义配置名截图 URL"
                      field="DocsImgOpenai2"
                      placeholder="默认本地：/docs-assets/cc-switch/openai-2.png"
                      value={inputs.DocsImgOpenai2}
                      onChange={(value) => handleInputChange('DocsImgOpenai2', value)}
                    />
                    <Form.Input
                      label="API表单输入截图 URL"
                      field="DocsImgOpenai3"
                      placeholder="默认本地：/docs-assets/cc-switch/openai-3.png"
                      value={inputs.DocsImgOpenai3}
                      onChange={(value) => handleInputChange('DocsImgOpenai3', value)}
                    />
                    <Form.Input
                      label="生成配置文件确认截图 URL"
                      field="DocsImgOpenai4"
                      placeholder="默认本地：/docs-assets/cc-switch/openai-4.png"
                      value={inputs.DocsImgOpenai4}
                      onChange={(value) => handleInputChange('DocsImgOpenai4', value)}
                    />
                    <Form.Input
                      label="测试并启用状态截图 URL"
                      field="DocsImgOpenai5"
                      placeholder="默认本地：/docs-assets/cc-switch/openai-5.png"
                      value={inputs.DocsImgOpenai5}
                      onChange={(value) => handleInputChange('DocsImgOpenai5', value)}
                    />
                  </div>

                  <div className="text-xs font-semibold text-gray-400 mt-4 mb-2">CC Switch 配置 Claude Code 截图替换</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Input
                      label="Claude 供应商添加截图 URL"
                      field="DocsImgClaude1"
                      placeholder="默认本地：/docs-assets/cc-switch/claude-1.png"
                      value={inputs.DocsImgClaude1}
                      onChange={(value) => handleInputChange('DocsImgClaude1', value)}
                    />
                    <Form.Input
                      label="API 表单配置截图 URL"
                      field="DocsImgClaude2"
                      placeholder="默认本地：/docs-assets/cc-switch/claude-2.png"
                      value={inputs.DocsImgClaude2}
                      onChange={(value) => handleInputChange('DocsImgClaude2', value)}
                    />
                    <Form.Input
                      label="高级选项模型名字映射截图 URL"
                      field="DocsImgModleAlias"
                      placeholder="默认本地：/docs-assets/cc-switch/modle-alias.png"
                      value={inputs.DocsImgModleAlias}
                      onChange={(value) => handleInputChange('DocsImgModleAlias', value)}
                    />
                    <Form.Input
                      label="测试并启用配置截图 URL"
                      field="DocsImgClaude3"
                      placeholder="默认本地：/docs-assets/cc-switch/claude-3.png"
                      value={inputs.DocsImgClaude3}
                      onChange={(value) => handleInputChange('DocsImgClaude3', value)}
                    />
                    <Form.Input
                      label="设置页启用插件同步截图 URL"
                      field="DocsImgClaude5"
                      placeholder="默认本地：/docs-assets/cc-switch/claude-5.png"
                      value={inputs.DocsImgClaude5}
                      onChange={(value) => handleInputChange('DocsImgClaude5', value)}
                    />
                    <Form.Input
                      label="命令行对话效果截图 URL"
                      field="DocsImgClaude6"
                      placeholder="默认本地：/docs-assets/cc-switch/claude-6.png"
                      value={inputs.DocsImgClaude6}
                      onChange={(value) => handleInputChange('DocsImgClaude6', value)}
                    />
                  </div>

                  <div className="text-xs font-semibold text-gray-400 mt-4 mb-2">CC Switch 配置 Claude Desktop 截图替换</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Input
                      label="Desktop 供应商添加截图 URL"
                      field="DocsImgClaudeDesktop1"
                      placeholder="默认本地：/docs-assets/cc-switch/claude-desktop-1.png"
                      value={inputs.DocsImgClaudeDesktop1}
                      onChange={(value) => handleInputChange('DocsImgClaudeDesktop1', value)}
                    />
                    <Form.Input
                      label="API 表单输入及列表截图 URL"
                      field="DocsImgClaudeDesktop2"
                      placeholder="默认本地：/docs-assets/cc-switch/claude-desktop-2.png"
                      value={inputs.DocsImgClaudeDesktop2}
                      onChange={(value) => handleInputChange('DocsImgClaudeDesktop2', value)}
                    />
                    <Form.Input
                      label="模型列表角色映射截图 URL"
                      field="DocsImgClaudeDesktop3"
                      placeholder="默认本地：/docs-assets/cc-switch/claude-desktop-3.png"
                      value={inputs.DocsImgClaudeDesktop3}
                      onChange={(value) => handleInputChange('DocsImgClaudeDesktop3', value)}
                    />
                    <Form.Input
                      label="路由拦截启用截图 URL"
                      field="DocsImgClaudeDesktop4"
                      placeholder="默认本地：/docs-assets/cc-switch/claude-desktop-4.png"
                      value={inputs.DocsImgClaudeDesktop4}
                      onChange={(value) => handleInputChange('DocsImgClaudeDesktop4', value)}
                    />
                    <Form.Input
                      label="客户端成功连通对话截图 URL"
                      field="DocsImgClaudeDesktop5"
                      placeholder="默认本地：/docs-assets/cc-switch/claude-desktop-5.png"
                      value={inputs.DocsImgClaudeDesktop5}
                      onChange={(value) => handleInputChange('DocsImgClaudeDesktop5', value)}
                    />
                  </div>
                </div>
              </Collapse.Panel>
            </Collapse>
          </div>

          <div style={{ marginTop: '20px' }}>
            <Button onClick={handleSave} type="primary">保存文档设置</Button>
          </div>
        </Form>
      </Card>
    </Spin>
  );
};

export default DocsSetting;
