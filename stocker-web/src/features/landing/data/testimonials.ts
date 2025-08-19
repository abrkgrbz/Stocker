export interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    name: 'Ahmet Yılmaz',
    role: 'Genel Müdür - TechnoSoft',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmet',
    content: 'Stocker sayesinde 5 şubemizi tek bir sistemden yönetiyoruz. Stok takibi ve CRM modülleri işlerimizi kolaylaştırdı.',
    rating: 5
  },
  {
    name: 'Ayşe Kaya',
    role: 'Mali İşler Müdürü - KayalarGrup',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayse',
    content: 'E-fatura entegrasyonu ve muhasebe modülü ile manuel işlemleri %80 azalttık. Harika bir çözüm!',
    rating: 5
  },
  {
    name: 'Mehmet Demir',
    role: 'IT Müdürü - DemirTicaret',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mehmet',
    content: 'API desteği sayesinde mevcut sistemlerimizle sorunsuz entegre ettik. Teknik destek ekibi çok başarılı.',
    rating: 5
  }
];