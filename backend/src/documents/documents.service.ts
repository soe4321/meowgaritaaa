import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async saveDocumentMetadata(file: Express.Multer.File, applicationId?: string) {
    return this.prisma.uploadedDocument.create({
      data: {
        applicationId: applicationId || '',
        fileName: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        filePath: file.path.replace(/\\/g, '/'),
      },
    });
  }

  async getDocumentForDownload(id: string, user: { id: string; role: UserRole }) {
    const doc = await this.prisma.uploadedDocument.findUnique({
      where: { id },
      include: {
        application: {
          include: { studentProfile: true },
        },
      },
    });

    if (!doc) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    // Role verification: Student may only download their own docs, Faculty/Admin can access
    if (user.role === UserRole.STUDENT) {
      if (doc.application && doc.application.studentProfile.userId !== user.id) {
        throw new ForbiddenException('Access denied: You do not have permission to view this document');
      }
    }

    const resolvedPath = path.resolve(doc.filePath);
    if (!fs.existsSync(resolvedPath)) {
      throw new NotFoundException('The requested document file could not be found on the server');
    }

    return {
      filePath: resolvedPath,
      fileName: doc.originalName,
      mimeType: doc.mimeType,
    };
  }
}
