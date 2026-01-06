'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, Descriptions, Tag, Row, Col, Statistic, Divider } from 'antd';
import {
  ArrowDownTrayIcon,
  CurrencyDollarIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';
import { usePayslip } from '@/lib/api/hooks/useHR';
import { DetailPageLayout } from '@/components/patterns';

const statusColors: Record<string, string> = { 'Draft': 'default', 'Pending': 'processing', 'Approved': 'success', 'Paid': 'blue', 'Cancelled': 'error' };

export default function PayslipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: payslip, isLoading, isError } = usePayslip(id);

  const formatCurrency = (value: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value || 0);

  return (
    <DetailPageLayout
      title="Bordro Detayi"
      subtitle={payslip ? `${payslip.employeeName} - ${payslip.periodStart ? new Date(payslip.periodStart).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }) : ''}` : undefined}
      backPath="/hr/payslips"
      icon={<CurrencyDollarIcon className="w-6 h-6 text-white" />}
      iconBgColor="bg-violet-600"
      statusBadge={payslip ? <Tag color={statusColors[payslip.status]}>{payslip.status}</Tag> : undefined}
      isLoading={isLoading}
      isError={isError || !payslip}
      errorMessage="Bordro Bulunamadi"
      errorDescription="Istenen bordro kaydi bulunamadi veya bir hata olustu."
      actions={
        <>
          <Button icon={<PrinterIcon className="w-4 h-4" />} onClick={() => window.print()}>Yazdir</Button>
          <Button icon={<ArrowDownTrayIcon className="w-4 h-4" />}>PDF Indir</Button>
        </>
      }
    >
      {payslip && (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', border: 'none' }} bodyStyle={{ padding: '40px 20px', textAlign: 'center' }}>
              <CurrencyDollarIcon className="w-16 h-16 text-white/90" />
              <h3 className="mt-4 text-lg font-medium text-white/90">{payslip.employeeName}</h3>
              <p className="text-sm text-white/60">{payslip.period}</p>
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
                <Descriptions.Item label="Donem">{payslip.period || '-'}</Descriptions.Item>
                <Descriptions.Item label="Yil / Ay">{payslip.year} / {payslip.month}</Descriptions.Item>
                <Descriptions.Item label="Durum"><Tag color={statusColors[payslip.status]}>{payslip.status}</Tag></Descriptions.Item>
                <Descriptions.Item label="Donem Baslangic">{payslip.periodStart ? new Date(payslip.periodStart).toLocaleDateString('tr-TR') : '-'}</Descriptions.Item>
                <Descriptions.Item label="Donem Bitis">{payslip.periodEnd ? new Date(payslip.periodEnd).toLocaleDateString('tr-TR') : '-'}</Descriptions.Item>
                <Descriptions.Item label="Odeme Tarihi">{payslip.paymentDate ? new Date(payslip.paymentDate).toLocaleDateString('tr-TR') : '-'}</Descriptions.Item>
                <Descriptions.Item label="Odeme Yontemi">{payslip.paymentMethod || '-'}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Row gutter={16}>
              <Col xs={24} lg={12}>
                <Card title="Kazanclar" className="mb-4">
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Temel Maas">{formatCurrency(payslip.baseSalary)}</Descriptions.Item>
                    <Descriptions.Item label="Fazla Mesai">{formatCurrency(payslip.overtimePay)}</Descriptions.Item>
                    <Descriptions.Item label="Ikramiye">{formatCurrency(payslip.bonus)}</Descriptions.Item>
                    <Descriptions.Item label="Komisyon">{formatCurrency(payslip.commission)}</Descriptions.Item>
                    <Descriptions.Item label="Yemek Yardimi">{formatCurrency(payslip.mealAllowance)}</Descriptions.Item>
                    <Descriptions.Item label="Ulasim Yardimi">{formatCurrency(payslip.transportationAllowance)}</Descriptions.Item>
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
                    <Descriptions.Item label="SGK Primi (Calisan)">{formatCurrency(payslip.ssiEmployeeShare)}</Descriptions.Item>
                    <Descriptions.Item label="Issizlik Sigortasi (Calisan)">{formatCurrency(payslip.unemploymentInsuranceEmployee)}</Descriptions.Item>
                    <Descriptions.Item label="Sendika Aidati">{formatCurrency(payslip.unionDues)}</Descriptions.Item>
                    <Descriptions.Item label="Icra Kesintisi">{formatCurrency(payslip.garnishment)}</Descriptions.Item>
                    <Descriptions.Item label="Diger Kesintiler">{formatCurrency(payslip.otherDeductions)}</Descriptions.Item>
                    <Descriptions.Item label="Toplam Kesinti"><strong>{formatCurrency(payslip.totalDeductions)}</strong></Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>

            <Card title="Isveren Kesintileri" className="mb-4">
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="SGK Primi (Isveren)">{formatCurrency(payslip.ssiEmployerShare)}</Descriptions.Item>
                <Descriptions.Item label="Issizlik Sigortasi (Isveren)">{formatCurrency(payslip.unemploymentInsuranceEmployer)}</Descriptions.Item>
                <Descriptions.Item label="Toplam Isveren Maliyeti"><strong>{formatCurrency(payslip.totalEmployerCost)}</strong></Descriptions.Item>
              </Descriptions>
            </Card>

            {payslip.notes && <Card title="Notlar"><p>{payslip.notes}</p></Card>}
          </Col>
        </Row>
      )}
    </DetailPageLayout>
  );
}
