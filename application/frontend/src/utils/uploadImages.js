import { storage } from "../firebase-config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase, ref as dbRef, set } from "firebase/database";
import { getStorage } from 'firebase/storage';

// Function to upload a single image
export const uploadImage = async (imageFile, folder, filename) => {
  console.log(`Starting upload for ${folder}/${filename}`);
  try {
    const storageRef = ref(storage, `${folder}/${filename}`);
    console.log('Storage reference created');
    const snapshot = await uploadBytes(storageRef, imageFile);
    console.log('File uploaded');
    const url = await getDownloadURL(snapshot.ref);
    console.log('Got download URL:', url);
    return url;
  } catch (error) {
    console.error(`Error uploading ${folder}/${filename}:`, error);
    throw error;
  }
};

export const getImageUrl = async (folder, filename) => {
  const storage = getStorage();
  const imageRef = ref(storage, `${folder}/${filename}`);
  try {
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.log('Error getting image URL:', error);
    return null;
  }
};

// Function to award badge to user
export const awardBadgeToUser = async (userId, badgeId) => {
  const db = getDatabase();
  const userBadgesRef = dbRef(db, `users/${userId}/badges/${badgeId}`);
  
  try {
    await set(userBadgesRef, {
      dateAwarded: new Date().toISOString(),
      badgeId: badgeId
    });
    return true;
  } catch (error) {
    console.error('Error awarding badge:', error);
    return false;
  }
};

export const uploadPlaceholders = async () => {
  const storage = getStorage();
  
  // Avatar placeholders (12 total - 3 rows of 4)
  const avatarPlaceholders = [
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Nerd%20face/3D/nerd_face_3d.png',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Graduation%20cap/3D/graduation_cap_3d.png',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Backpack/3D/backpack_3d.png',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pencil/3D/pencil_3d.png',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Notebook/3D/notebook_3d.png',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Desktop%20computer/3D/desktop_computer_3d.png',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Laptop/3D/laptop_3d.png',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Books/3D/books_3d.png',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Magnifying%20glass%20tilted%20right/3D/magnifying_glass_tilted_right_3d.png',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Light%20bulb/3D/light_bulb_3d.png',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Brain/3D/brain_3d.png',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Glasses/3D/glasses_3d.png'
  ];

  // Badge placeholders (12 total - 3 rows of 4)
  const badgePlaceholders = [
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Trophy/3D/trophy_3d.png',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Star/3D/star_3d.png',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Glowing%20star/3D/glowing_star_3d.png',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/1st%20place%20medal/3D/1st_place_medal_3d.png',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/2nd%20place%20medal/3D/2nd_place_medal_3d.png',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/3rd%20place%20medal/3D/3rd_place_medal_3d.png',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Crown/3D/crown_3d.png',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Fire/3D/fire_3d.png',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Sparkles/3D/sparkles_3d.png',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/High%20voltage/3D/high_voltage_3d.png',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Rocket/3D/rocket_3d.png',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Party%20popper/3D/party_popper_3d.png'
  ];

  try {
    // Upload avatars
    for (let i = 0; i < avatarPlaceholders.length; i++) {
      const avatarRef = ref(storage, `avatars/avatar_${i + 1}.png`);
      const response = await fetch(avatarPlaceholders[i]);
      const blob = await response.blob();
      await uploadBytes(avatarRef, blob);
    }

    // Upload badges
    for (let i = 0; i < badgePlaceholders.length; i++) {
      const badgeRef = ref(storage, `badges/badge_${i + 1}.png`);
      const response = await fetch(badgePlaceholders[i]);
      const blob = await response.blob();
      await uploadBytes(badgeRef, blob);
    }
  } catch (error) {
    console.log('Error uploading placeholders:', error);
  }
}; 