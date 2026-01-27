import { useQuery } from '@tanstack/react-query';
import { emailTemplateService, type EmailTemplateListDto } from '../services/emailTemplateService';

export const useEmailTemplates = () => {
    return useQuery<EmailTemplateListDto>({
        queryKey: ['email-templates'],
        queryFn: () => emailTemplateService.getAll(),
    });
};
