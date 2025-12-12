import { FastifyInstance } from 'fastify';
import { prisma } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { z } from 'zod';

interface KeyParams {
  Params: { key: string };
}

interface GroupParams {
  Params: { group: string };
}

const settingSchema = z.object({
  key: z.string().min(1),
  value: z.any(),
  group: z.string().default('general'),
});

export async function settingsRoutes(app: FastifyInstance) {
  // Get all settings (authenticated)
  app.get('/', { preHandler: [authenticate] }, async () => {
    const settings = await prisma.cMSSetting.findMany({
      orderBy: { group: 'asc' },
    });

    // Group by group name
    const grouped = settings.reduce((acc, setting) => {
      if (!acc[setting.group]) {
        acc[setting.group] = {};
      }
      acc[setting.group][setting.key] = setting.value;
      return acc;
    }, {} as Record<string, Record<string, any>>);

    return grouped;
  });

  // Get settings by group (authenticated)
  app.get<GroupParams>('/group/:group', { preHandler: [authenticate] }, async (request, reply) => {
    const settings = await prisma.cMSSetting.findMany({
      where: { group: request.params.group },
    });

    const result: Record<string, any> = {};
    settings.forEach((s) => {
      result[s.key] = s.value;
    });

    return result;
  });

  // Get single setting (public for some keys)
  app.get<KeyParams>('/:key', async (request, reply) => {
    const setting = await prisma.cMSSetting.findUnique({
      where: { key: request.params.key },
    });

    if (!setting) {
      return reply.status(404).send({ error: 'Setting not found' });
    }

    return { key: setting.key, value: setting.value };
  });

  // Create or update setting (authenticated)
  app.put<KeyParams>('/:key', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const { value, group } = settingSchema.partial().parse(request.body);

      const setting = await prisma.cMSSetting.upsert({
        where: { key: request.params.key },
        update: { value, ...(group && { group }) },
        create: {
          key: request.params.key,
          value,
          group: group || 'general',
        },
      });

      return setting;
    } catch (error: any) {
      reply.status(400).send({ error: 'Validation error', details: error.message });
    }
  });

  // Bulk update settings (authenticated)
  app.post('/bulk', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const settings = z.array(settingSchema).parse(request.body);

      const results = await Promise.all(
        settings.map((s) =>
          prisma.cMSSetting.upsert({
            where: { key: s.key },
            update: { value: s.value, group: s.group },
            create: s,
          })
        )
      );

      return results;
    } catch (error: any) {
      reply.status(400).send({ error: 'Validation error', details: error.message });
    }
  });

  // Delete setting (authenticated)
  app.delete<KeyParams>('/:key', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      await prisma.cMSSetting.delete({
        where: { key: request.params.key },
      });
      return reply.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        return reply.status(404).send({ error: 'Setting not found' });
      }
      reply.status(500).send({ error: 'Delete failed' });
    }
  });

  // Initialize default settings (authenticated)
  app.post('/init', { preHandler: [authenticate] }, async () => {
    const defaults = [
      { key: 'site_name', value: 'Stocker', group: 'general' },
      { key: 'site_description', value: 'Bulut Tabanlı Stok Yönetimi', group: 'general' },
      { key: 'contact_email', value: 'info@stocker.app', group: 'contact' },
      { key: 'contact_phone', value: '+90 212 123 45 67', group: 'contact' },
      { key: 'social_twitter', value: 'https://twitter.com/stockerapp', group: 'social' },
      { key: 'social_linkedin', value: 'https://linkedin.com/company/stocker', group: 'social' },
      { key: 'footer_copyright', value: '© 2024 Stocker. Tüm hakları saklıdır.', group: 'footer' },
    ];

    const results = await Promise.all(
      defaults.map((s) =>
        prisma.cMSSetting.upsert({
          where: { key: s.key },
          update: {},
          create: s,
        })
      )
    );

    return { message: 'Default settings initialized', count: results.length };
  });
}
