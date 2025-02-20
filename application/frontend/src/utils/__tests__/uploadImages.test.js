import { preloadImages, getImageUrl, uploadImage, uploadPlaceholders, awardBadgeToUser } from '../uploadImages';
import { getStorage, ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { getDatabase, ref as dbRef, set } from 'firebase/database';

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(() => ({})),
  getDownloadURL: jest.fn(),
  uploadBytes: jest.fn()
}));

jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(),
  ref: jest.fn(),
  set: jest.fn()
}));

describe('uploadImages utility', () => {
  // Move getImageUrl tests first, before any other tests set mock implementations
  describe('getImageUrl', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      console.error = jest.fn();
      // Clear existing mocks
      getDownloadURL.mockReset();
      getStorage.mockReturnValue({});
      ref.mockReturnValue({});
    });

    test('returns null when parameters are missing', async () => {
      getDownloadURL.mockRejectedValueOnce(new Error('Should fail'));
      
      const result = await getImageUrl('avatars', '');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    test('fetches URL from storage when not cached', async () => {
      const mockUrl = 'http://example.com/new.png';
      getDownloadURL.mockResolvedValueOnce(mockUrl);

      const result = await getImageUrl('badges', 'badge_1.png');
      expect(result).toBe(mockUrl);
      expect(getDownloadURL).toHaveBeenCalledTimes(1);
    });

    test('handles fetch failure gracefully', async () => {
      getDownloadURL.mockRejectedValueOnce(new Error('Fetch failed'));

      const result = await getImageUrl('avatars', 'avatar_1.png');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  // Move preloadImages tests after getImageUrl tests
  describe('preloadImages', () => {
    test('successfully preloads all images', async () => {
      // Create a storage mock object that we'll reuse
      const storageMock = {};
      getStorage.mockReturnValue(storageMock);
      
      getDownloadURL.mockImplementation(() => 
        Promise.resolve('http://example.com/image.png')
      );

      const result = await preloadImages();
      
      expect(result).toBe(true);
      expect(getDownloadURL).toHaveBeenCalledTimes(24);
      expect(ref).toHaveBeenCalledWith(storageMock, 'avatars/avatar_1.png');
      expect(ref).toHaveBeenCalledWith(storageMock, 'badges/badge_1.png');
    });

    test('handles preload failure gracefully', async () => {
      getDownloadURL.mockRejectedValue(new Error('Download failed'));
      console.error = jest.fn();

      const result = await preloadImages();
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });

    test('handles partial preload failure', async () => {
      let callCount = 0;
      getDownloadURL.mockImplementation(() => {
        callCount++;
        if (callCount > 12) {
          return Promise.reject(new Error('Failed to load badges'));
        }
        return Promise.resolve('http://example.com/image.png');
      });
      console.error = jest.fn();

      const result = await preloadImages();
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
      expect(getDownloadURL).toHaveBeenCalledTimes(13);
    });
  });

  describe('uploadImage', () => {
    test('successfully uploads an image', async () => {
      const mockFile = new Blob(['test'], { type: 'image/png' });
      const mockUrl = 'http://example.com/uploaded.png';
      const mockSnapshot = { ref: {} };
      
      uploadBytes.mockResolvedValueOnce(mockSnapshot);
      getDownloadURL.mockResolvedValueOnce(mockUrl);

      const result = await uploadImage(mockFile, 'avatars', 'test.png');
      
      expect(result).toBe(mockUrl);
      expect(uploadBytes).toHaveBeenCalled();
      expect(getDownloadURL).toHaveBeenCalled();
    });

    test('handles upload failure', async () => {
      const mockFile = new Blob(['test'], { type: 'image/png' });
      uploadBytes.mockRejectedValueOnce(new Error('Upload failed'));
      
      await expect(uploadImage(mockFile, 'avatars', 'test.png'))
        .rejects.toThrow('Upload failed');
    });
  });

  describe('uploadPlaceholders', () => {
    beforeEach(() => {
      global.fetch = jest.fn(() => 
        Promise.resolve({ blob: () => Promise.resolve(new Blob()) })
      );
    });

    test('successfully uploads all placeholders', async () => {
      const mockSnapshot = { ref: {} };
      const mockUrl = 'http://example.com/placeholder.png';
      
      uploadBytes.mockResolvedValue(mockSnapshot);
      getDownloadURL.mockResolvedValue(mockUrl);

      await uploadPlaceholders();
      
      // Uploads 12 avatars and 12 badges
      expect(uploadBytes).toHaveBeenCalledTimes(24);
    });

    test('handles fetch failure', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Fetch failed'));
      console.log = jest.fn();
      
      await uploadPlaceholders();
      
      expect(console.log).toHaveBeenCalledWith(
        'Error uploading placeholders:',
        expect.any(Error)
      );
    });

    test('handles individual upload failures', async () => {
      // Mock first upload to fail, rest succeed
      uploadBytes
        .mockRejectedValueOnce(new Error('Upload failed'))
        .mockResolvedValue({ ref: {} });
      
      console.log = jest.fn();
      
      await uploadPlaceholders();
      
      expect(console.log).toHaveBeenCalledWith(
        'Error uploading placeholders:',
        expect.any(Error)
      );
    });

    test('handles fetch failures for individual files', async () => {
      global.fetch
        .mockRejectedValueOnce(new Error('Fetch failed'))
        .mockImplementation(() => 
          Promise.resolve({ blob: () => Promise.resolve(new Blob()) })
        );
      
      console.log = jest.fn();
      
      await uploadPlaceholders();
      
      expect(console.log).toHaveBeenCalledWith(
        'Error uploading placeholders:',
        expect.any(Error)
      );
    });

    test('handles blob conversion failure', async () => {
      global.fetch.mockResolvedValue({
        blob: () => Promise.reject(new Error('Blob conversion failed'))
      });
      
      console.log = jest.fn();
      
      await uploadPlaceholders();
      
      expect(console.log).toHaveBeenCalledWith(
        'Error uploading placeholders:',
        expect.any(Error)
      );
    });
  });

  describe('awardBadgeToUser', () => {
    test('successfully awards badge', async () => {
      const mockDbRef = {};
      dbRef.mockReturnValue(mockDbRef);
      set.mockResolvedValueOnce();

      const result = await awardBadgeToUser('user123', 'badge1');
      
      expect(result).toBe(true);
      expect(set).toHaveBeenCalledWith(
        mockDbRef,
        expect.objectContaining({
          badgeId: 'badge1'
        })
      );
    });

    test('handles award failure', async () => {
      dbRef.mockReturnValue({});
      set.mockRejectedValueOnce(new Error('Award failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await awardBadgeToUser('user123', 'badge1');
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('getImageUrl edge cases', () => {
    test('handles invalid folder names', async () => {
      const result = await getImageUrl('invalid_folder', 'test.png');
      expect(result).toBeNull();
    });

    test('handles cache initialization', async () => {
      const mockUrl = 'http://example.com/test.png';
      getDownloadURL.mockResolvedValueOnce(mockUrl);
      
      const result = await getImageUrl('avatars', 'new_avatar.png');
      expect(result).toBe(mockUrl);
      
      const cachedResult = await getImageUrl('avatars', 'new_avatar.png');
      expect(cachedResult).toBe(mockUrl);
      expect(getDownloadURL).toHaveBeenCalledTimes(1);
    });
  });
}); 