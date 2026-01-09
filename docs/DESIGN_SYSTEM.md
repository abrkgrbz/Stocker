# Stocker Design System

Bu dokümantasyon, Stocker uygulamasındaki form sayfaları için tasarım standartlarını ve kullanım kılavuzlarını içerir.

## 🎨 Genel Tasarım Prensipleri

### Renk Paleti

```
Ana Renkler:
- Primary Black:     #1a1a1a (Butonlar, vurgular)
- Background:        #ffffff (Sayfa arka planı)
- Border Light:      rgba(0, 0, 0, 0.06) (Header border)

Slate Skalası (Form elemanları):
- slate-50:          #f8fafc (Input arka plan)
- slate-100:         #f1f5f9 (Section border light)
- slate-200:         #e2e8f0 (Card border, input border)
- slate-300:         #cbd5e1 (Input border default)
- slate-400:         #94a3b8 (Placeholder, secondary text)
- slate-500:         #64748b (Description text)
- slate-600:         #475569 (Label text)
- slate-700:         #334155 (Section header)
- slate-800:         #1e293b (Value text)
- slate-900:         #0f172a (Primary text, focused border)
```

### Tipografi

```
Başlıklar:
- Page Title:        text-xl font-semibold text-gray-900
- Section Header:    text-xs font-bold text-slate-700 uppercase tracking-wider
- Form Label:        text-sm font-medium text-slate-600

İçerik:
- Description:       text-sm text-gray-400
- Input Text:        text-base text-slate-900
- Helper Text:       text-xs text-slate-400/500
```

---

## 📐 Sayfa Yapısı

### Temel Layout

```tsx
<div className="min-h-screen bg-white">
  {/* Sticky Header */}
  <div className="sticky top-0 z-50 px-8 py-4" style={{
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
  }}>
    <div className="flex items-center justify-between max-w-7xl mx-auto">
      {/* Left: Back + Title */}
      {/* Right: Action Buttons */}
    </div>
  </div>

  {/* Page Content */}
  <div className="px-8 py-8 max-w-7xl mx-auto">
    {/* Form içeriği */}
  </div>
</div>
```

### Glass Effect Sticky Header

```tsx
<div
  className="sticky top-0 z-50 px-8 py-4"
  style={{
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
  }}
>
  <div className="flex items-center justify-between max-w-7xl mx-auto">
    {/* Sol: Geri + Başlık */}
    <div className="flex items-center gap-4">
      <Button
        icon={<ArrowLeftIcon className="w-4 h-4" />}
        onClick={() => router.back()}
        type="text"
        className="text-gray-500 hover:text-gray-800"
      />
      <div>
        <h1 className="text-xl font-semibold text-gray-900 m-0">
          Sayfa Başlığı
        </h1>
        <p className="text-sm text-gray-400 m-0">Sayfa açıklaması</p>
      </div>
    </div>
    
    {/* Sağ: Aksiyon Butonları */}
    <Space>
      <Button onClick={() => router.push('/list-page')}>
        Vazgeç
      </Button>
      <Button
        type="primary"
        icon={<CheckIcon className="w-4 h-4" />}
        loading={isLoading}
        onClick={() => form.submit()}
        style={{
          background: '#1a1a1a',
          borderColor: '#1a1a1a',
          color: 'white',
        }}
      >
        Kaydet
      </Button>
    </Space>
  </div>
</div>
```

---

## 📦 Form Card Yapısı

### Ana Form Container

```tsx
<div className="bg-white border border-slate-200 rounded-xl">
  {/* Header Section (İsim, Görsel, Tip) */}
  <div className="px-8 py-6 border-b border-slate-200">
    {/* Hero input alanı */}
  </div>

  {/* Form Body */}
  <div className="px-8 py-6">
    {/* Form sections */}
  </div>
</div>
```

### Section Başlıkları

```tsx
<div className="mb-8">
  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
    Section Başlığı
  </h3>
  {/* Section içeriği */}
</div>
```

---

## 🔤 Form Elemanları

### Input Stilleri

#### Standard Input
```tsx
<Input
  placeholder="Placeholder text"
  className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
/>
```

#### Hero Input (Borderless - Başlık stili)
```tsx
<Input
  placeholder="Başlık Girin..."
  variant="borderless"
  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
/>
```

#### Number Input
```tsx
<InputNumber
  style={{ width: '100%' }}
  min={0}
  precision={2}
  className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
/>
```

### Select Stilleri

```tsx
<Select
  placeholder="Seçim yapın"
  className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
  dropdownRender={(menu) => (
    <>
      {menu}
      <Divider className="my-1" />
      <Button type="text" icon={<PlusIcon className="w-4 h-4" />} size="small" block className="text-left text-slate-600">
        Yeni Ekle
      </Button>
    </>
  )}
/>
```

### TreeSelect Stilleri

```tsx
<TreeSelect
  placeholder="Kategori seçin"
  treeData={categoryTreeData}
  showSearch
  treeNodeFilterProp="title"
  treeLine={{ showLeafIcon: false }}
  treeDefaultExpandAll
  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
  className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
/>
```

### Label Yapısı

```tsx
<label className="block text-sm font-medium text-slate-600 mb-1.5">
  Label Metni <span className="text-red-500">*</span>
</label>
<Form.Item name="fieldName" rules={[{ required: true }]} className="mb-0">
  {/* Input */}
</Form.Item>
```

---

## 🔘 Buton Tipleri

### Segment Button Group (Tip Seçici)

```tsx
<div className="flex bg-slate-100 p-1 rounded-lg">
  {options.map((option) => (
    <button
      key={option.value}
      type="button"
      onClick={() => handleSelect(option.value)}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
        selectedValue === option.value
          ? 'bg-white shadow-sm text-slate-900'
          : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {option.label}
    </button>
  ))}
</div>
```

### Full Selection Buttons (Altı seçenek)

```tsx
<div className="grid grid-cols-6 gap-2">
  {options.map((option) => (
    <button
      key={option.value}
      type="button"
      onClick={() => handleSelect(option.value)}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
        selectedValue === option.value
          ? 'bg-slate-900 text-white border-slate-900'
          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400'
      }`}
    >
      {option.label}
    </button>
  ))}
</div>
```

### Primary Button (Kaydet)

```tsx
<Button
  type="primary"
  icon={<CheckIcon className="w-4 h-4" />}
  loading={isLoading}
  style={{
    background: '#1a1a1a',
    borderColor: '#1a1a1a',
    color: 'white',
  }}
>
  Kaydet
</Button>
```

### Dashed Button (Ekleme)

```tsx
<Button
  type="dashed"
  size="small"
  icon={<PlusIcon className="w-4 h-4" />}
  className="!border-slate-300 !text-slate-600 hover:!border-slate-400"
>
  Ekle
</Button>
```

---

## 🖼️ Görsel Yükleme

### Image Gallery Component

```tsx
{/* Main Preview Image */}
<div className="w-24 h-24 rounded-lg bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group cursor-pointer">
  {hasImage ? (
    <>
      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
      {isPrimary && (
        <div className="absolute top-1 left-1 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded">
          Ana
        </div>
      )}
      <button
        type="button"
        onClick={handleRemove}
        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
      >
        ×
      </button>
    </>
  ) : (
    <PhotoIcon className="w-6 h-6 text-slate-400" />
  )}
</div>

{/* Thumbnail Row */}
<div className="flex items-center gap-1.5">
  {images.map((img, index) => (
    <button
      key={img.id}
      type="button"
      onClick={() => setSelectedIndex(index)}
      className={`w-7 h-7 rounded border-2 overflow-hidden flex-shrink-0 transition-all ${
        selectedIndex === index
          ? 'border-slate-900 ring-1 ring-slate-900'
          : 'border-slate-200 hover:border-slate-400'
      }`}
    >
      <img src={img.preview} alt="" className="w-full h-full object-cover" />
    </button>
  ))}
  
  {/* Add Button */}
  <Upload showUploadList={false} accept="image/*" beforeUpload={handleAddImage}>
    <button
      type="button"
      className="w-7 h-7 rounded border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 hover:border-slate-400 hover:text-slate-500 transition-colors"
    >
      <PlusIcon className="w-3 h-3" />
    </button>
  </Upload>
</div>
```

---

## 📋 Toggle/Switch Kartları

### Status Toggle Card

```tsx
<div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
  <div>
    <div className="text-sm font-medium text-slate-700">Toggle Başlığı</div>
    <div className="text-xs text-slate-500 mt-0.5">
      {isActive ? 'Aktif durumda açıklama' : 'Pasif durumda açıklama'}
    </div>
  </div>
  <Switch
    checked={isActive}
    onChange={handleChange}
    checkedChildren="Aktif"
    unCheckedChildren="Pasif"
  />
</div>
```

### Stats Card (Edit mode için)

```tsx
<div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
  <div className="text-xl font-semibold text-slate-800">
    {value || 0}
  </div>
  <div className="text-xs text-slate-500 mt-1">Metric Label</div>
</div>
```

---

## ➕ Empty State / Placeholder

### Clickable Empty State

```tsx
<div
  className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-all"
  onClick={handleAdd}
>
  <IconComponent className="w-6 h-6 text-slate-400 mb-2 mx-auto" />
  <div className="text-sm text-slate-500">
    Eklemek için tıklayın
  </div>
  <div className="text-xs text-slate-400 mt-1">
    Opsiyonel açıklama
  </div>
</div>
```

---

## 📦 Collapse Section

### Gelişmiş Ayarlar Pattern

```tsx
<Collapse
  ghost
  expandIconPosition="end"
  className="!bg-transparent [&_.ant-collapse-header]:!px-0 [&_.ant-collapse-content-box]:!px-0"
  items={[
    {
      key: 'advanced',
      label: (
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
          <Cog6ToothIcon className="w-4 h-4" /> Gelişmiş Ayarlar
        </h3>
      ),
      children: (
        <div className="pt-4">
          {/* Collapse içeriği */}
        </div>
      ),
    },
  ]}
/>
```

---

## 📱 Grid Yapıları

### 12 Kolonlu Grid

```tsx
{/* 3 eşit kolon */}
<div className="grid grid-cols-12 gap-4">
  <div className="col-span-4">{/* 1/3 */}</div>
  <div className="col-span-4">{/* 1/3 */}</div>
  <div className="col-span-4">{/* 1/3 */}</div>
</div>

{/* 2 eşit kolon */}
<div className="grid grid-cols-12 gap-4">
  <div className="col-span-6">{/* 1/2 */}</div>
  <div className="col-span-6">{/* 1/2 */}</div>
</div>

{/* 4 eşit kolon */}
<div className="grid grid-cols-12 gap-4">
  <div className="col-span-3">{/* 1/4 */}</div>
  <div className="col-span-3">{/* 1/4 */}</div>
  <div className="col-span-3">{/* 1/4 */}</div>
  <div className="col-span-3">{/* 1/4 */}</div>
</div>

{/* 6 eşit kolon (buton grupları) */}
<div className="grid grid-cols-6 gap-2">
  {/* ... */}
</div>
```

---

## 🎯 Örnek Sayfa Şablonu

```tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form } from 'antd';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { EntityForm } from '@/components/module/entity';
import { useCreateEntity } from '@/lib/api/hooks/useModule';
import type { CreateEntityDto } from '@/lib/api/services/module.types';

export default function NewEntityPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createEntity = useCreateEntity();

  const handleSubmit = async (values: CreateEntityDto) => {
    try {
      await createEntity.mutateAsync(values);
      router.push('/module/entities');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                Yeni Kayıt
              </h1>
              <p className="text-sm text-gray-400 m-0">Kayıt açıklaması</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/module/entities')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createEntity.isPending}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
                color: 'white',
              }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <EntityForm
          form={form}
          onFinish={handleSubmit}
          loading={createEntity.isPending}
        />
      </div>
    </div>
  );
}
```

---

## 📁 Form Component Şablonu

```tsx
'use client';

import React from 'react';
import { Form, Input, InputNumber, Select, Switch } from 'antd';
import type { EntityDto } from '@/lib/api/services/module.types';

interface EntityFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: EntityDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function EntityForm({ form, initialValues, onFinish, loading }: EntityFormProps) {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="w-full"
      scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl">
        
        {/* Header Section */}
        <div className="px-8 py-6 border-b border-slate-200">
          {/* Hero inputs */}
        </div>

        {/* Form Body */}
        <div className="px-8 py-6">
          
          {/* Section 1 */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Section Başlığı
            </h3>
            <div className="grid grid-cols-12 gap-4">
              {/* Form fields */}
            </div>
          </div>

          {/* Section 2 */}
          <div className="mb-8">
            {/* ... */}
          </div>

        </div>
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <Button htmlType="submit" />
      </Form.Item>
    </Form>
  );
}
```

---

## ✅ Kontrol Listesi

Yeni sayfa oluştururken kontrol edilecekler:

- [ ] `min-h-screen bg-white` ana container
- [ ] Sticky header with glass effect
- [ ] `max-w-7xl mx-auto` content centering
- [ ] `px-8 py-8` padding
- [ ] Section başlıkları uppercase, tracking-wider
- [ ] Input'lar slate-50 arka plan, slate-300 border
- [ ] Focus state: slate-900 border, white background
- [ ] Primary button: #1a1a1a background
- [ ] 12 kolonlu grid sistemi
- [ ] Form.Item'larda `className="mb-0"` (label ile kontrol)
- [ ] Heroicons/24/outline icon seti
- [ ] Türkçe placeholder ve label'lar
