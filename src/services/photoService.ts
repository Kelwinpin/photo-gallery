import * as FileSystem from 'expo-file-system';

interface Photo {
  id: string;
  uri: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
  };
  filename: string;
}

class PhotoService {
  private readonly PHOTOS_DIR = `${FileSystem.documentDirectory}photos/`;
  private readonly METADATA_FILE = `${this.PHOTOS_DIR}metadata.json`;

  async ensureDirectoryExists(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(this.PHOTOS_DIR);
    
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.PHOTOS_DIR, { intermediates: true });
    }
  }

  async getAllPhotos(): Promise<Photo[]> {
    try {
      await this.ensureDirectoryExists();
      
      const fileInfo = await FileSystem.getInfoAsync(this.METADATA_FILE);
      
      if (!fileInfo.exists) {
        return [];
      }
      
      const data = await FileSystem.readAsStringAsync(this.METADATA_FILE);
      const photos: Photo[] = JSON.parse(data);
      
      return photos.map(photo => ({
        ...photo,
        timestamp: new Date(photo.timestamp),
      }));
      
    } catch (error) {
      console.error('Erro ao carregar fotos:', error);
      return [];
    }
  }

  async savePhoto(photoUri: string, location: { latitude: number; longitude: number }): Promise<Photo | null> {
    try {
      await this.ensureDirectoryExists();
      
      const timestamp = Date.now();
      const filename = `photo_${timestamp}.jpg`;
      const newUri = `${this.PHOTOS_DIR}${filename}`;

      await FileSystem.moveAsync({
        from: photoUri,
        to: newUri,
      });

      const photo: Photo = {
        id: timestamp.toString(),
        uri: newUri,
        timestamp: new Date(),
        location,
        filename,
      };

      const success = await this.savePhotoMetadata(photo);
      
      return success ? photo : null;
      
    } catch (error) {
      console.error('Erro ao salvar foto:', error);
      return null;
    }
  }

  private async savePhotoMetadata(photo: Photo): Promise<boolean> {
    try {
      const existingPhotos = await this.getAllPhotos();
      existingPhotos.push(photo);
      
      await FileSystem.writeAsStringAsync(
        this.METADATA_FILE, 
        JSON.stringify(existingPhotos, null, 2)
      );
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar metadados:', error);
      return false;
    }
  }

  async deletePhoto(photoId: string): Promise<boolean> {
    try {
      const photos = await this.getAllPhotos();
      const photoToDelete = photos.find(p => p.id === photoId);
      
      if (!photoToDelete) {
        return false;
      }

      const fileInfo = await FileSystem.getInfoAsync(photoToDelete.uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(photoToDelete.uri);
      }

      const updatedPhotos = photos.filter(p => p.id !== photoId);
      
      await FileSystem.writeAsStringAsync(
        this.METADATA_FILE,
        JSON.stringify(updatedPhotos, null, 2)
      );

      return true;
    } catch (error) {
      console.error('Erro ao deletar foto:', error);
      return false;
    }
  }

  async getPhotoById(photoId: string): Promise<Photo | null> {
    try {
      const photos = await this.getAllPhotos();
      return photos.find(p => p.id === photoId) || null;
    } catch (error) {
      console.error('Erro ao buscar foto:', error);
      return null;
    }
  }

  async clearAllPhotos(): Promise<boolean> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.PHOTOS_DIR);
      
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(this.PHOTOS_DIR, { idempotent: true });
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao limpar fotos:', error);
      return false;
    }
  }

  async getPhotosStats(): Promise<{
    totalPhotos: number;
    totalSize: string;
    oldestPhoto?: Date;
    newestPhoto?: Date;
  }> {
    try {
      const photos = await this.getAllPhotos();
      
      if (photos.length === 0) {
        return {
          totalPhotos: 0,
          totalSize: '0 B',
        };
      }

      let totalSize = 0;
      for (const photo of photos) {
        const fileInfo = await FileSystem.getInfoAsync(photo.uri);
        if (fileInfo.exists && 'size' in fileInfo) {
          totalSize += fileInfo.size || 0;
        }
      }

      const formatSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
      };

      const timestamps = photos.map(p => p.timestamp);
      const oldestPhoto = new Date(Math.min(...timestamps.map(d => d.getTime())));
      const newestPhoto = new Date(Math.max(...timestamps.map(d => d.getTime())));

      return {
        totalPhotos: photos.length,
        totalSize: formatSize(totalSize),
        oldestPhoto,
        newestPhoto,
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        totalPhotos: 0,
        totalSize: '0 B',
      };
    }
  }
}

export const photoService = new PhotoService();
export type { Photo };