import { FastifyInstance } from 'fastify';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { authenticate } from '../middleware/auth.js';
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';

interface IdParams {
  Params: { id: string };
}

export async function mediaRoutes(app: FastifyInstance) {
  // Get all media (authenticated)
  app.get('/', { preHandler: [authenticate] }, async (request, reply) => {
    const { folder, limit = 50, offset = 0 } = request.query as { folder?: string; limit?: number; offset?: number };

    const where = folder ? { folder } : {};

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.media.count({ where }),
    ]);

    return { media, total, limit, offset };
  });

  // Upload media (authenticated)
  app.post('/upload', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({ error: 'No file uploaded' });
      }

      const buffer = await data.toBuffer();
      const ext = path.extname(data.filename);
      const filename = `${randomUUID()}${ext}`;
      const folder = (data.fields.folder as any)?.value || 'general';

      // Create folder if not exists
      const uploadPath = path.join(env.uploadDir, folder);
      await fs.mkdir(uploadPath, { recursive: true });

      // Save file
      const filePath = path.join(uploadPath, filename);
      await fs.writeFile(filePath, buffer);

      // Save to database
      const media = await prisma.media.create({
        data: {
          filename,
          originalName: data.filename,
          mimeType: data.mimetype,
          size: buffer.length,
          url: `/uploads/${folder}/${filename}`,
          folder,
        },
      });

      return reply.status(201).send(media);
    } catch (error: any) {
      console.error('Upload error:', error);
      reply.status(500).send({ error: 'Upload failed', details: error.message });
    }
  });

  // Update media metadata (authenticated)
  app.put<IdParams>('/:id', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const { alt, caption } = request.body as { alt?: string; caption?: string };

      const media = await prisma.media.update({
        where: { id: request.params.id },
        data: { alt, caption },
      });

      return media;
    } catch (error: any) {
      if (error.code === 'P2025') {
        return reply.status(404).send({ error: 'Media not found' });
      }
      reply.status(500).send({ error: 'Update failed' });
    }
  });

  // Delete media (authenticated)
  app.delete<IdParams>('/:id', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const media = await prisma.media.findUnique({
        where: { id: request.params.id },
      });

      if (!media) {
        return reply.status(404).send({ error: 'Media not found' });
      }

      // Delete file from disk
      const filePath = path.join(env.uploadDir, media.folder, media.filename);
      try {
        await fs.unlink(filePath);
      } catch {
        // File might not exist, continue with DB deletion
      }

      // Delete from database
      await prisma.media.delete({ where: { id: request.params.id } });

      return reply.status(204).send();
    } catch (error: any) {
      reply.status(500).send({ error: 'Delete failed' });
    }
  });

  // Get folders (authenticated)
  app.get('/folders', { preHandler: [authenticate] }, async () => {
    const folders = await prisma.media.groupBy({
      by: ['folder'],
      _count: { id: true },
    });

    return folders.map((f) => ({
      name: f.folder,
      count: f._count.id,
    }));
  });
}
