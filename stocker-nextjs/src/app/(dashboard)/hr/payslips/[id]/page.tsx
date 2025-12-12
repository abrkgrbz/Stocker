'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, Descriptions, Tag, Spin, Row, Col, Statistic, Divider } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined, DollarOutlined, DownloadOutlined } from '@ant-design/icons';
import { usePayslip } from '@/lib/api/hooks/useHR';

const statusColors: Record<string, string> = { 'Draft': 'default', 'Pending': 'processing', 'Approved': 'success', 'Paid': 'blue', 'Cancelled': 'error' };

export default function PayslipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: payslip, isLoading } = usePayslip(id);

  const formatCurrency = (value: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value || 0);

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Spin size="large" /></div>;
  if (!payslip) return <div className="p-6"><Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>Geri</Button><div className="mt-4">Bordro bulunamadi.</div></div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 px-8 py-4" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} type="text" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">Bordro Detayi</h1>
              <p className="text-sm text-gray-400 m-0">{payslip.employeeName} - {payslip.payPeriodStart ? new Date(payslip.payPeriodStart).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }) : ''}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button icon={<PrinterOutlined />} onClick={() => window.print()}>Yazdir</Button>
            <Button icon={<DownloadOutlined />}>PDF Indir</Button>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', border: 'none' }} bodyStyle={{ padding: '40px 20px', textAlign: 'center' }}>
              <DollarOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <h3 className="mt-4 text-lg font-medium text-white/90">{payslip.employeeName}</h3>
              <p className="text-sm text-white/60">{payslip.departmentName}</p>
              <Tag color={statusColors[payslip.status]} className="mt-4">{payslip.status}</Tag>
            </Card>
            <Card className="mt-4">
              <Statistic title="Net Maas" value={payslip.netSalary || 0} prefix="₺" precision={2} valueStyle={{ color: '#3f8600' }} />
              <Divider />
              <Statistic title="Brut Maas" value={payslip.grossSalary || 0} prefix="₺" precision={2} />
            </Card>
          </Col>
          <Col xs={24} lg={16}>
            <Card title="Donem Bilgileri" className="mb-4">
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Calisan">{payslip.employeeName}</Descriptions.Item>
                <Descriptions.Item label="Departman">{payslip.departmentName || '-'}</Descriptions.Item>
                <Descriptions.Item label="Pozisyon">{payslip.positionTitle || '-'}</Descriptions.Item>
                <Descriptions.Item label="Durum"><Tag color={statusColors[payslip.status]}>{payslip.status}</Tag></Descriptions.Item>
                <Descriptions.Item label="Donem Baslangic">{payslip.payPeriodStart ? new Date(payslip.payPeriodStart).toLocaleDateString('tr-TR') : '-'}</Descriptions.Item>
                <Descriptions.Item label="Donem Bitis">{payslip.payPeriodEnd ? new Date(payslip.payPeriodEnd).toLocaleDateString('tr-TR') : '-'}</Descriptions.Item>
                <Descriptions.Item label="Odeme Tarihi">{payslip.paymentDate ? new Date(payslip.paymentDate).toLocaleDateString('tr-TR') : '-'}</Descriptions.Item>
                <Descriptions.Item label="Odeme Yontemi">{payslip.paymentMethod || '-'}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Row gutter={16}>
              <Col xs={24} lg={12}>
                <Card title="Kazanclar" className="mb-4">
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Temel Maas">{formatCurrency(payslip.basicSalary)}</Descriptions.Item>
                    <Descriptions.Item label="Fazla Mesai">{formatCurrency(payslip.overtimePay)}</Descriptions.Item>
                    <Descriptions.Item label="Ikramiye">{formatCurrency(payslip.bonuses)}</Descriptions.Item>
                    <Descriptions.Item label="Komisyon">{formatCurrency(payslip.commission)}</Descriptions.Item>
                    <Descriptions.Item label="Yemek Yardimi">{formatCurrency(payslip.mealAllowance)}</Descriptions.Item>
                    <Descriptions.Item label="Ulasim Yardimi">{formatCurrency(payslip.transportAllowance)}</Descriptions.Item>
                    <Descriptions.Item label="Konut Yardimi">{formatCurrency(payslip.housingAllowance)}</Descriptions.Item>
                    <Descriptions.Item label="Diger Odenekler">{formatCurrency(payslip.otherAllowances)}</Descriptions.Item>
                    <Descriptions.Item label="Brut Toplam"><strong>{formatCurrency(payslip.grossSalary)}</strong></Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Kesintiler" className="mb-4">
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Gelir Vergisi">{formatCurrency(payslip.incomeTax)}</Descriptions.Item>
                    <Descriptions.Item label="Damga Vergisi">{formatCurrency(payslip.stampTax)}</Descriptions.Item>
                    <Descriptions.Item label="SGK Primi (Calisan)">{formatCurrency(payslip.ssiEmployeeContribution)}</Descriptions.Item>
                    <Descriptions.Item label="Issizlik Sigortasi (Calisan)">{formatCurrency(payslip.unemploymentInsuranceEmployee)}</Descriptions.Item>
                    <Descriptions.Item label="Saglik Sigortasi">{formatCurrency(payslip.healthInsurance)}</Descriptions.Item>
                    <Descriptions.Item label="Sendika Aidati">{formatCurrency(payslip.unionDues)}</Descriptions.Item>
                    <Descriptions.Item label="Icra Kesintisi">{formatCurrency(payslip.garnishments)}</Descriptions.Item>
                    <Descriptions.Item label="Diger Kesintiler">{formatCurrency(payslip.otherDeductions)}</Descriptions.Item>
                    <Descriptions.Item label="Toplam Kesinti"><strong>{formatCurrency(payslip.totalDeductions)}</strong></Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>

            <Card title="Isveren Kesintileri" className="mb-4">
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="SGK Primi (Isveren)">{formatCurrency(payslip.ssiEmployerContribution)}</Descriptions.Item>
                <Descriptions.Item label="Issizlik Sigortasi (Isveren)">{formatCurrency(payslip.unemploymentInsuranceEmployer)}</Descriptions.Item>
                <Descriptions.Item label="Toplam Isveren Maliyeti"><strong>{formatCurrency(payslip.totalEmployerCost)}</strong></Descriptions.Item>
              </Descriptions>
            </Card>

            {payslip.notes && <Card title="Notlar"><p>{payslip.notes}</p></Card>}
          </Col>
        </Row>
      </div>
    </div>
  );
}
