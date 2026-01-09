# Stocker Design System

Bu döküman, Stocker uygulamasındaki sayfa tasarımları için kullanılacak standart tasarım sistemini tanımlar.
`lot-batches` sayfası referans alınarak oluşturulmuştur.

---

## 🎨 Renk Paleti

### Monochrome (Tek Renkli) Sistem
```typescript
const MONOCHROME_COLORS = [
  '#1e293b', // slate-800 - En koyu (primary actions, önemli text)
  '#334155', // slate-700 - Koyu (secondary text, active states)
  '#475569', // slate-600 - Orta-koyu (labels, icons)
  '#64748b', // slate-500 - Orta (muted text, borders)
  '#94a3b8', // slate-400 - Orta-açık (disabled, placeholders)
  '#cbd5e1', // slate-300 - Açık (borders, dividers)
  '#e2e8f0', // slate-200 - Çok açık (backgrounds, hover states)
  '#f1f5f9', // slate-100 - En açık (card backgrounds)
  '#f8fafc', // slate-50 - Neredeyse beyaz (page background)
];
```

### Kullanım Alanları
| Renk | Kullanım |
|------|----------|
| `#1e293b` | Primary butonlar, önemli başlıklar |
| `#334155` | Aktif durumlar, vurgulu text |
| `#475569` | Label'lar, icon'lar |
| `#64748b` | Muted text, secondary info |
| `#94a3b8` | Disabled durumlar, placeholder |
| `#e2e8f0` | Hover states, light backgrounds |
| `#f1f5f9` | Card backgrounds, input backgrounds |

---

## 📐 Sayfa Yapısı

### Temel Layout
```tsx
<div className="min-h-screen bg-slate-50 p-8">
  {/* Header */}
  <div className="flex justify-between items-center mb-8">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Sayfa Başlığı</h1>
      <p className="text-slate-500 mt-1">Sayfa açıklaması</p>
    </div>
    <Space>
      {/* Action Buttons */}
    </Space>
  </div>

  {/* Stats Cards */}
  <div className="grid grid-cols-12 gap-6 mb-8">
    {/* Stat cards */}
  </div>

  {/* Alerts (if any) */}

  {/* Main Content Card */}
  <div className="bg-white border border-slate-200 rounded-xl p-6">
    {/* Tabs, Filters, Table */}
  </div>
</div>
```

---

## 🔘 Buton Stilleri

### Primary Button
```tsx
<Button
  type="primary"
  icon={<PlusIcon className="w-4 h-4" />}
  className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
>
  Yeni Ekle
</Button>
```

### Secondary Button
```tsx
<Button
  icon={<ArrowPathIcon className="w-4 h-4" />}
  className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
>
  Yenile
</Button>
```

### Cancel Button
```tsx
<Button className="!border-slate-300 !text-slate-600">
  İptal
</Button>
```

### Danger Button (Modal OK)
```tsx
okButtonProps={{ danger: true }}
```

---

## 📊 Stat Cards

### Yapı
```tsx
<div className="col-span-12 md:col-span-4 lg:col-span-2">
  <div className="bg-white border border-slate-200 rounded-xl p-5">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
        <IconComponent className="w-5 h-5 text-slate-600" />
      </div>
    </div>
    <div className="text-2xl font-bold text-slate-900">{value}</div>
    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
      Label
    </div>
  </div>
</div>
```

### Icon Background Varyasyonları
```tsx
// Normal
className="bg-slate-100"  // icon: text-slate-600

// Warning
className="bg-slate-200"  // icon: text-slate-700

// Danger
className="bg-slate-300"  // icon: text-slate-800

// Critical
className="bg-slate-400"  // icon: text-white

// Neutral
className="bg-slate-500"  // icon: text-white
```

---

## 🏷️ Status Badges / Tags

### Status Configuration Pattern
```typescript
interface StatusConfig {
  color: string;      // Text color
  bgColor: string;    // Background color
  label: string;      // Turkish label
  icon: React.ReactNode;
}

const statusConfig: Record<StatusType, StatusConfig> = {
  Pending: {
    color: '#64748b',
    bgColor: '#f1f5f9',
    label: 'Beklemede',
    icon: <ClockIcon className="w-4 h-4" />
  },
  Active: {
    color: '#1e293b',
    bgColor: '#e2e8f0',
    label: 'Aktif',
    icon: <CheckCircleIcon className="w-4 h-4" />
  },
  Warning: {
    color: '#475569',
    bgColor: '#f1f5f9',
    label: 'Uyarı',
    icon: <ExclamationTriangleIcon className="w-4 h-4" />
  },
  // ... diğer durumlar
};
```

### Badge Render
```tsx
<span
  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
  style={{ backgroundColor: config.bgColor, color: config.color }}
>
  {config.icon}
  {config.label}
</span>
```

---

## 📑 Tabs

### Yapı
```tsx
const tabItems = [
  {
    key: 'all',
    label: (
      <span className="flex items-center gap-2">
        <InboxIcon className="w-4 h-4" />
        Tab Label
        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-slate-200 text-slate-700">
          {count}
        </span>
      </span>
    ),
  },
  // ... diğer tablar
];

<Tabs
  activeKey={activeTab}
  onChange={setActiveTab}
  items={tabItems}
  className="mb-6 [&_.ant-tabs-tab]:!text-slate-600 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-slate-900 [&_.ant-tabs-ink-bar]:!bg-slate-900"
/>
```

### Tab Badge Varyasyonları
```tsx
// Normal count
className="bg-slate-200 text-slate-700"

// Warning count
className="bg-slate-300 text-slate-800"

// Critical count
className="bg-slate-400 text-white"

// Danger count
className="bg-slate-500 text-white"
```

---

## 🔍 Filter Dropdowns

### Select Component
```tsx
<Select
  placeholder="Seçiniz"
  allowClear
  style={{ width: 200 }}
  showSearch
  optionFilterProp="children"
  className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
>
  {options.map((o) => (
    <Select.Option key={o.id} value={o.id}>
      {o.label}
    </Select.Option>
  ))}
</Select>
```

---

## 📋 Table

### Table Styling
```tsx
<Table
  columns={columns}
  dataSource={data}
  rowKey="id"
  loading={isLoading}
  pagination={{
    total: data.length,
    pageSize: 10,
    showSizeChanger: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
  }}
  scroll={{ x: 1000 }}
  className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
/>
```

### Column Patterns

#### Clickable Title with Sub-badges
```tsx
{
  title: 'Başlık',
  dataIndex: 'title',
  key: 'title',
  width: 150,
  render: (text: string, record) => (
    <div className="space-y-1">
      <span
        className="font-semibold text-slate-900 cursor-pointer hover:text-slate-600"
        onClick={() => handleViewDetail(record.id)}
      >
        {text}
      </span>
      <div className="flex gap-1">
        {record.hasWarning && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-700">
            <ExclamationTriangleIcon className="w-3 h-3" /> Uyarı
          </span>
        )}
      </div>
    </div>
  ),
}
```

#### Two-line Info Cell
```tsx
{
  title: 'Bilgi',
  key: 'info',
  width: 200,
  render: (_, record) => (
    <div>
      <div className="font-medium text-slate-900">{record.primary}</div>
      <div className="text-xs text-slate-500">{record.secondary}</div>
    </div>
  ),
}
```

#### Actions Column
```tsx
{
  title: 'İşlemler',
  key: 'actions',
  width: 100,
  fixed: 'right',
  render: (_, record) => {
    const menuItems = [
      {
        key: 'view',
        icon: <EyeIcon className="w-4 h-4" />,
        label: 'Detay',
        onClick: () => handleViewDetail(record.id),
      },
      // ... diğer actions
    ];

    return (
      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <Button
          type="text"
          icon={<EllipsisHorizontalIcon className="w-4 h-4" />}
          className="text-slate-600 hover:text-slate-900"
        />
      </Dropdown>
    );
  },
}
```

---

## 🔔 Alerts

### Error Alert
```tsx
<Alert
  type="error"
  showIcon
  icon={<ExclamationTriangleIcon className="w-4 h-4" />}
  message="Hata mesajı başlığı"
  description="Detaylı açıklama metni."
  className="mb-6 !border-slate-300 !bg-slate-100 [&_.ant-alert-message]:!text-slate-900 [&_.ant-alert-description]:!text-slate-600"
/>
```

### Warning Alert
```tsx
<Alert
  type="warning"
  showIcon
  icon={<ClockIcon className="w-4 h-4" />}
  message="Uyarı mesajı"
  description="Detaylı açıklama."
  className="mb-6 !border-slate-300 !bg-slate-50 [&_.ant-alert-message]:!text-slate-900 [&_.ant-alert-description]:!text-slate-600"
/>
```

### Info Alert
```tsx
<Alert
  type="info"
  message="Bilgi mesajı"
  showIcon
  className="!border-slate-300 !bg-slate-50"
/>
```

---

## 🪟 Modals

### Modal Yapısı
```tsx
<Modal
  title={<span className="text-slate-900 font-semibold">Modal Başlığı</span>}
  open={isOpen}
  onCancel={handleClose}
  onOk={handleSubmit}
  okText="Kaydet"
  cancelText="İptal"
  confirmLoading={isLoading}
  width={600}
  okButtonProps={{ className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900' }}
  cancelButtonProps={{ className: '!border-slate-300 !text-slate-600' }}
>
  {/* Modal content */}
</Modal>
```

### Detail Modal Footer
```tsx
footer={[
  <Button
    key="close"
    onClick={handleClose}
    className="!border-slate-300 !text-slate-600"
  >
    Kapat
  </Button>,
  // Conditional action buttons
]}
```

---

## 📝 Form Elements

### Form Item Label
```tsx
<Form.Item
  name="fieldName"
  label={<span className="text-slate-700 font-medium">Label Text</span>}
  rules={[{ required: true, message: 'Hata mesajı' }]}
>
  {/* Input component */}
</Form.Item>
```

### Input
```tsx
<Input
  placeholder="Placeholder text"
  className="!rounded-lg !border-slate-300"
/>
```

### TextArea
```tsx
<TextArea
  rows={3}
  placeholder="Placeholder text"
  className="!rounded-lg !border-slate-300"
/>
```

### InputNumber
```tsx
<InputNumber
  min={0}
  style={{ width: '100%' }}
  placeholder="0"
  className="!rounded-lg [&_.ant-input-number-input]:!border-slate-300"
/>
```

### DatePicker
```tsx
<DatePicker
  style={{ width: '100%' }}
  format="DD.MM.YYYY"
  className="!rounded-lg !border-slate-300"
/>
```

### Select in Form
```tsx
<Select
  placeholder="Seçiniz"
  showSearch
  optionFilterProp="children"
  className="[&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-slate-300"
>
  {options.map((o) => (
    <Select.Option key={o.id} value={o.id}>
      {o.label}
    </Select.Option>
  ))}
</Select>
```

---

## 📊 Detail View Patterns

### Info Grid
```tsx
<div className="grid grid-cols-2 gap-4">
  <div>
    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
      Label
    </p>
    <p className="text-lg font-semibold text-slate-900">{value}</p>
  </div>
  {/* More fields */}
</div>
```

### Sub-label Style
```tsx
<p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Label</p>
<p className="font-semibold text-slate-900">Primary Value</p>
<p className="text-sm text-slate-500">Secondary Value</p>
```

### Footer Metadata
```tsx
<div className="border-t border-slate-200 pt-4 mt-4">
  <p className="text-xs text-slate-400">
    Oluşturulma: {dayjs(createdAt).format('DD.MM.YYYY HH:mm')}
    {updatedAt && (
      <> | Güncelleme: {dayjs(updatedAt).format('DD.MM.YYYY HH:mm')}</>
    )}
  </p>
</div>
```

---

## 🎯 Confirmation Dialogs

### Modal.confirm Pattern
```tsx
Modal.confirm({
  title: 'İşlem Başlığı',
  content: `"${item.name}" için işlemi onaylıyor musunuz?`,
  okText: 'Onayla',
  cancelText: 'İptal',
  okButtonProps: { className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900' },
  onOk: async () => {
    try {
      await mutation.mutateAsync(item.id);
    } catch (error) {
      // Error handled by hook
    }
  },
});
```

---

## 📱 Responsive Grid

### Stats Cards
```tsx
// 6 cards in a row
className="col-span-12 md:col-span-4 lg:col-span-2"

// 4 cards in a row
className="col-span-12 md:col-span-6 lg:col-span-3"

// 3 cards in a row
className="col-span-12 md:col-span-6 lg:col-span-4"

// 2 cards in a row
className="col-span-12 lg:col-span-6"
```

### Form Grid
```tsx
<div className="grid grid-cols-2 gap-4">
  {/* Two columns on all screens */}
</div>

<div className="grid grid-cols-3 gap-4">
  {/* Three columns on all screens */}
</div>
```

---

## ✅ Checklist: Yeni Sayfa Oluştururken

1. [ ] Page background: `bg-slate-50`
2. [ ] Container padding: `p-8`
3. [ ] Header section with title + description + action buttons
4. [ ] Stats cards (if applicable)
5. [ ] Alerts for warnings/errors (if applicable)
6. [ ] Main content card: `bg-white border border-slate-200 rounded-xl p-6`
7. [ ] Tabs with count badges (if applicable)
8. [ ] Filter dropdowns with proper styling
9. [ ] Table with monochrome header styling
10. [ ] Action dropdown in table
11. [ ] Create modal with proper button styling
12. [ ] Detail modal with grid layout
13. [ ] Confirmation dialogs for destructive actions

---

## 🚫 Kaçınılması Gerekenler

- ❌ Renkli Ant Design tag'leri (`color="blue"` gibi)
- ❌ Renkli butonlar (yeşil, mavi, turuncu)
- ❌ Gradient'ler (sadece monochrome kullanın)
- ❌ Çok parlak renkler
- ❌ Default Ant Design stilleri (her zaman override edin)

---

## ✅ Tercih Edilenler

- ✅ Slate renk paleti (slate-50 → slate-900)
- ✅ Subtle borders (`border-slate-200`, `border-slate-300`)
- ✅ Rounded corners (`rounded-lg`, `rounded-xl`)
- ✅ Icon + text kombinasyonları
- ✅ Uppercase tracking-wider labels
- ✅ Consistent spacing (`gap-4`, `gap-6`, `mb-8`)
