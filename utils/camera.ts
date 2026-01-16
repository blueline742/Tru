import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export const takePhoto = async (): Promise<string | null> => {
  try {
    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt, // Allows user to choose camera or gallery
    });

    if (photo.base64String) {
      return `data:image/${photo.format};base64,${photo.base64String}`;
    }
    return null;
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
};

export const pickImage = async (): Promise<string | null> => {
  try {
    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos, // Gallery only
    });

    if (photo.base64String) {
      return `data:image/${photo.format};base64,${photo.base64String}`;
    }
    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
};
