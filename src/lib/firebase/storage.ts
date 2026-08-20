import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

export async function uploadImage(file: File, path: string): Promise<string> {
  const r = storageRef(storage, path);
  await uploadBytes(r, file);
  return getDownloadURL(r);
}

export async function deleteImage(path: string): Promise<void> {
  try {
    const r = storageRef(storage, path);
    await deleteObject(r);
  } catch {
    // ignore if not found
  }
}
