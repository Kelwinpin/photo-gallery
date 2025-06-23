import * as FileSystem from 'expo-file-system';
import { Photo, photoService } from './photoService';

jest.mock('expo-file-system');

const mockedFileSystem = jest.mocked(FileSystem);

describe('PhotoService', () => {
  const mockPhoto: Photo = {
    id: '123',
    uri: 'file://photo.jpg',
    timestamp: new Date(),
    location: {
      latitude: -23.564,
      longitude: -46.653,
    },
    filename: 'photo_123.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ensureDirectoryExists', () => {
    it('creates directory if not exists', async () => {
      mockedFileSystem.getInfoAsync.mockResolvedValue({ exists: false });
      await photoService['ensureDirectoryExists']();
      expect(mockedFileSystem.makeDirectoryAsync).toHaveBeenCalledWith(
        photoService['PHOTOS_DIR'],
        { intermediates: true }
      );
    });

    it('does not create directory if already exists', async () => {
      mockedFileSystem.getInfoAsync.mockResolvedValue({ exists: true });
      await photoService['ensureDirectoryExists']();
      expect(mockedFileSystem.makeDirectoryAsync).not.toHaveBeenCalled();
    });
  });

  describe('getAllPhotos', () => {
    it('returns empty array if metadata file does not exist', async () => {
      mockedFileSystem.getInfoAsync.mockResolvedValue({ exists: false });
      const result = await photoService.getAllPhotos();
      expect(result).toEqual([]);
    });

    it('reads and parses metadata correctly', async () => {
      const photosData = JSON.stringify([mockPhoto]);
      mockedFileSystem.readAsStringAsync.mockResolvedValue(photosData);
      mockedFileSystem.getInfoAsync.mockResolvedValue({ exists: true });
      const result = await photoService.getAllPhotos();
      expect(result[0].id).toBe(mockPhoto.id);
      expect(result[0].timestamp instanceof Date).toBe(true);
    });
  });

  describe('savePhoto', () => {
    it('saves photo and metadata successfully', async () => {
      const photoUri = 'file://temp.jpg';
      const location = { latitude: 12.34, longitude: 56.78 };
      mockedFileSystem.moveAsync.mockResolvedValue(undefined);
      mockedFileSystem.writeAsStringAsync.mockResolvedValue(undefined);
      const result = await photoService.savePhoto(photoUri, location);
      expect(result).toBeDefined();
      expect(result?.uri).toContain('photo_');
      expect(mockedFileSystem.moveAsync).toHaveBeenCalled();
    });
  });

  describe('deletePhoto', () => {
    it('deletes photo by ID successfully', async () => {
      mockedFileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify([mockPhoto]));
      mockedFileSystem.getInfoAsync
        .mockResolvedValueOnce({ exists: true })
        .mockResolvedValueOnce({ exists: true, size: 1000 });
      mockedFileSystem.deleteAsync.mockResolvedValue(undefined);
      mockedFileSystem.writeAsStringAsync.mockResolvedValue(undefined);
      const result = await photoService.deletePhoto(mockPhoto.id);
      expect(result).toBe(true);
    });

    it('returns false if photo not found', async () => {
      mockedFileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify([]));
      const result = await photoService.deletePhoto('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('getPhotoById', () => {
    it('returns photo when found by ID', async () => {
      mockedFileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify([mockPhoto]));
      const result = await photoService.getPhotoById(mockPhoto.id);
      expect(result?.id).toBe(mockPhoto.id);
    });

    it('returns null when photo not found', async () => {
      mockedFileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify([]));
      const result = await photoService.getPhotoById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('clearAllPhotos', () => {
    it('deletes all photos directory successfully', async () => {
      mockedFileSystem.getInfoAsync.mockResolvedValue({ exists: true });
      mockedFileSystem.deleteAsync.mockResolvedValue(undefined);
      const result = await photoService.clearAllPhotos();
      expect(result).toBe(true);
    });

    it('returns true if directory does not exist', async () => {
      mockedFileSystem.getInfoAsync.mockResolvedValue({ exists: false });
      const result = await photoService.clearAllPhotos();
      expect(result).toBe(true);
    });
  });

  describe('getPhotosStats', () => {
    it('returns default stats when no photos exist', async () => {
      mockedFileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify([]));
      const result = await photoService.getPhotosStats();
      expect(result.totalPhotos).toBe(0);
      expect(result.totalSize).toBe('0 B');
      expect(result.oldestPhoto).toBeUndefined();
      expect(result.newestPhoto).toBeUndefined();
    });
  });
});