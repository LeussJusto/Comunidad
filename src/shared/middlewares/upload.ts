import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '@config/index';
import { ValidationError } from '@shared/errors';

// Crear directorios si no existen
const uploadDir = config.upload.uploadPath;
const dirs = ['photos', 'audio', 'videos'];

dirs.forEach(dir => {
  const dirPath = path.join(uploadDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'photos'; // Por defecto photos (imágenes)
    
    if (file.mimetype.startsWith('image/')) {
      folder = 'photos';
    } else if (file.mimetype.startsWith('audio/')) {
      folder = 'audio';
    } else if (file.mimetype.startsWith('video/')) {
      folder = 'videos';
    }
    
    console.log(`📁 Guardando archivo en: uploads/${folder}/ (mimetype: ${file.mimetype})`);
    cb(null, path.join(uploadDir, folder));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro de archivos
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  console.log('🔍 Archivo recibido:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });

  const allowedMimes = [
    // Imágenes
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    // Audio
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/3gpp',     // Android audio recorder (legacy)
    'audio/3gpp2',
    'audio/aac',
    'audio/mp4',      // M4A (AAC en contenedor MP4)
    'audio/m4a',
    'audio/x-m4a',
    // Video
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/3gpp',     // Android video recorder
    'video/3gpp2'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    console.log('✅ Archivo aceptado:', file.mimetype);
    cb(null, true);
  } else {
    console.log('❌ Tipo de archivo rechazado:', file.mimetype);
    cb(new ValidationError(`Tipo de archivo no permitido: ${file.mimetype}`));
  }
};

// Configuración de Multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize, // 10MB por defecto
  },
});

// Middleware para manejo de errores de Multer
export const handleMulterError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande',
        error: `Tamaño máximo: ${config.upload.maxFileSize / 1024 / 1024}MB`,
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Error al subir archivo',
      error: error.message,
    });
  }
  next(error);
};
