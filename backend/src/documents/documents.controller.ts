import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload supporting document (PDF, PNG, JPG up to 10MB)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
        if (allowedMimes.includes(file.mimetype.toLowerCase())) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only PDF, JPG, and PNG documents are permitted'), false);
        }
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file was provided');
    }
    return this.documentsService.saveDocumentMetadata(file);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Securely download or view uploaded document' })
  async downloadFile(@Request() req, @Param('id') id: string, @Res() res: Response) {
    const docInfo = await this.documentsService.getDocumentForDownload(id, req.user);
    res.setHeader('Content-Type', docInfo.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(docInfo.fileName)}"`);
    res.sendFile(docInfo.filePath);
  }
}
