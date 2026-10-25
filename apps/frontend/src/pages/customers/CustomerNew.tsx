// src/components/CustomerNew.tsx
import React, { useState } from 'react';
import { ContactType, Gender, IdentityType } from '@workspace/shared';
import { customerApi, type CreateCustomerInput } from '@/services/customer';

interface CustomerNewProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CustomerNew: React.FC<CustomerNewProps> = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 初始化全量字段表单状态
  const [form, setForm] = useState<CreateCustomerInput>({
    identityType: IdentityType.ID_CARD,
    identityName: '',
    identityNo: '',
    gender: Gender.MALE,
    ethnicity: '',
    birthDate: '',
    address: '',
    issueAuthority: '',
    issueDate: '',
    startDate: '',
    endDate: '',
    contacts: [{ contactType: ContactType.PHONE, contactValue: '', isDefault: true, remark: '' }],
  });

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (index: number, field: string, value: any) => {
    const contacts = [...(form.contacts || [])];
    contacts[index] = { ...contacts[index], [field]: value };
    setForm((prev) => ({ ...prev, contacts }));
  };

  const addContact = () => {
    setForm((prev) => ({
      ...prev,
      contacts: [
        ...(prev.contacts || []),
        { contactType: ContactType.PHONE, contactValue: '', isDefault: false, remark: '' },
      ],
    }));
  };

  const removeContact = (index: number) => {
    setForm((prev) => ({
      ...prev,
      contacts: prev.contacts?.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await customerApi.create(form);
      alert('创建客户成功！');
      onSuccess?.();
    } catch (err: any) {
      setErrorMsg(err.message || '创建失败，请检查输入');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">新建客户（全量信息）</h2>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded">{errorMsg}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. 基本身份信息区 */}
        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-3">基本身份信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                证件类型 <span className="text-red-500">*</span>
              </label>
              <select
                value={form.identityType}
                onChange={(e) => handleChange('identityType', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
              >
                <option value={IdentityType.ID_CARD}>身份证 (个人)</option>
                <option value={IdentityType.PASSPORT}>护照</option>
                <option value={IdentityType.BUSINESS_LICENSE}>营业执照 (对公)</option>
                <option value={IdentityType.OTHER}>其他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                客户/证件名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.identityName || ''}
                onChange={(e) => handleChange('identityName', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                placeholder="请输入客户姓名或公司名称"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                证件号码 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.identityNo || ''}
                onChange={(e) => handleChange('identityNo', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                placeholder="请输入证件号码或统一社会信用代码"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">性别</label>
              <select
                value={form.gender || ''}
                onChange={(e) => handleChange('gender', e.target.value || undefined)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
              >
                <option value="">请选择性别</option>
                <option value={Gender.MALE}>男</option>
                <option value={Gender.FEMALE}>女</option>
                <option value={Gender.OTHER}>其他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">民族</label>
              <input
                type="text"
                value={form.ethnicity || ''}
                onChange={(e) => handleChange('ethnicity', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                placeholder="如：汉族"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">出生日期</label>
              <input
                type="date"
                value={form.birthDate || ''}
                onChange={(e) => handleChange('birthDate', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">住址</label>
              <input
                type="text"
                value={form.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                placeholder=""
              />
            </div>
          </div>
        </div>

        {/* 2. 证件签发与有效期区 */}
        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-3">证件签发与有效期</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">签发机关</label>
              <input
                type="text"
                value={form.issueAuthority || ''}
                onChange={(e) => handleChange('issueAuthority', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                placeholder="请输入签发机关"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">签发日期</label>
              <input
                type="date"
                value={form.issueDate || ''}
                onChange={(e) => handleChange('issueDate', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">有效期开始日期</label>
              <input
                type="date"
                value={form.startDate || ''}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">有效期结束日期</label>
              <input
                type="date"
                value={form.endDate || ''}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* 3. 联系方式列表区 */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md font-semibold text-gray-700">联系方式列表</h3>
            <button
              type="button"
              onClick={addContact}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              + 添加联系方式
            </button>
          </div>

          <div className="space-y-3">
            {form.contacts?.map((contact, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-md border border-gray-200 space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">类型</label>
                    <select
                      value={contact.contactType}
                      onChange={(e) => handleContactChange(index, 'contactType', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                    >
                      <option value={ContactType.PHONE}>电话</option>
                      <option value={ContactType.EMAIL}>邮箱</option>
                      <option value={ContactType.WECHAT}>微信</option>
                      <option value={ContactType.QQ}>QQ</option>
                      <option value={ContactType.FAX}>传真</option>
                      <option value={ContactType.ADDRESS}>地址</option>
                      <option value={ContactType.OTHER}>其他</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      联系内容 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="请输入号码/邮箱/地址等内容"
                      value={contact.contactValue || ''}
                      onChange={(e) => handleContactChange(index, 'contactValue', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={contact.isDefault || false}
                        onChange={(e) => handleContactChange(index, 'isDefault', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm"
                      />
                      设为默认
                    </label>

                    <input
                      type="text"
                      placeholder="备注说明 (选填)"
                      value={contact.remark || ''}
                      onChange={(e) => handleContactChange(index, 'remark', e.target.value)}
                      className="rounded-md border-gray-300 shadow-sm border p-1 text-sm w-64"
                    />
                  </div>

                  {form.contacts && form.contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      className="text-red-500 text-sm hover:underline font-medium px-2 py-1"
                    >
                      删除
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 border rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
            >
              取消
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium shadow-sm"
          >
            {loading ? '提交中...' : '确认创建客户'}
          </button>
        </div>
      </form>
    </div>
  );
};
