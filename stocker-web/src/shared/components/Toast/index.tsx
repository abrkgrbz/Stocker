import { notification, message } from 'antd';
import type { NotificationArgsProps } from 'antd/es/notification/interface';

interface ToastOptions extends Omit<NotificationArgsProps, 'message' | 'description'> {
  title?: string;
  description?: string;
}

class ToastService {
  private defaultDuration = 4;

  success(description: string, options?: ToastOptions) {
    const { title = 'Başarılı', ...rest } = options || {};
    notification.success({
      message: title,
      description,
      duration: this.defaultDuration,
      placement: 'topRight',
      ...rest,
    });
  }

  error(description: string, options?: ToastOptions) {
    const { title = 'Hata', ...rest } = options || {};
    notification.error({
      message: title,
      description,
      duration: this.defaultDuration,
      placement: 'topRight',
      ...rest,
    });
  }

  info(description: string, options?: ToastOptions) {
    const { title = 'Bilgi', ...rest } = options || {};
    notification.info({
      message: title,
      description,
      duration: this.defaultDuration,
      placement: 'topRight',
      ...rest,
    });
  }

  warning(description: string, options?: ToastOptions) {
    const { title = 'Uyarı', ...rest } = options || {};
    notification.warning({
      message: title,
      description,
      duration: this.defaultDuration,
      placement: 'topRight',
      ...rest,
    });
  }

  // Simple message variants
  simpleSuccess(content: string) {
    message.success(content);
  }

  simpleError(content: string) {
    message.error(content);
  }

  simpleInfo(content: string) {
    message.info(content);
  }

  simpleWarning(content: string) {
    message.warning(content);
  }

  simpleLoading(content: string = 'Yükleniyor...') {
    return message.loading(content, 0);
  }

  destroy() {
    notification.destroy();
    message.destroy();
  }
}

export const Toast = new ToastService();
export default Toast;