import { Router } from 'express';
import multer from 'multer';
import { uploadFile } from '../controllers/upload.controller';

const router = Router();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB

router.post('/', upload.single('file'), uploadFile);

export default router;