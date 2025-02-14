import { storage } from "../../../../frontend/src/firebase-config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase, ref as dbRef, set } from "firebase/database";

// Function to upload a single image
export const uploadImage = async (imageFile, folder, filename) => {
  try {
    const storageRef = ref(storage, `${folder}/${filename}`);
    const snapshot = await uploadBytes(storageRef, imageFile);
    const url = await getDownloadURL(snapshot.ref);
    return url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const getImageUrl = async (folder, filename) => {
  try {
    const imageRef = ref(storage, `${folder}/${filename}`);
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error('Error getting image URL:', error);
    // Return a default fallback image URL instead of throwing
    return `/default-${folder.slice(0, -1)}.png`;
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
  const placeholders = {
    avatars: [
      // Study themed avatars from Microsoft Fluent Emoji
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Graduation%20cap/3D/graduation_cap_3d.png",
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Books/3D/books_3d.png",
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Backpack/3D/backpack_3d.png",
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Student/3D/student_3d.png",
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Teacher/3D/teacher_3d.png",
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Desktop%20computer/3D/desktop_computer_3d.png",
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Laptop/3D/laptop_3d.png",
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Light%20bulb/3D/light_bulb_3d.png",
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Brain/3D/brain_3d.png",
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Memo/3D/memo_3d.png"
    ],
    badges: [
      // Achievement badges from Microsoft Fluent Emoji
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Trophy/3D/trophy_3d.png",          // First Session
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Star/3D/star_3d.png",             // Perfect Week
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Fire/3D/fire_3d.png",             // Study Streak
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Sparkles/3D/sparkles_3d.png",     // Top Performer
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Party%20popper/3D/party_popper_3d.png", // Milestone
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Crown/3D/crown_3d.png",           // Study Champion
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Rocket/3D/rocket_3d.png",         // Fast Learner
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/High%20voltage/3D/high_voltage_3d.png", // Power Student
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Check%20mark%20button/3D/check_mark_button_3d.png", // Task Master
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Hundred%20points/3D/hundred_points_3d.png" // Perfect Score
    ]
  };

  try {
    // Upload avatars
    for (let i = 0; i < placeholders.avatars.length; i++) {
      const response = await fetch(placeholders.avatars[i]);
      const blob = await response.blob();
      await uploadImage(blob, 'avatars', `avatar_${i + 1}.png`);
    }

    // Upload badges
    for (let i = 0; i < placeholders.badges.length; i++) {
      const response = await fetch(placeholders.badges[i]);
      const blob = await response.blob();
      await uploadImage(blob, 'badges', `badge_${i + 1}.png`);
    }

    console.log('Placeholders uploaded successfully!');
  } catch (error) {
    console.error('Error uploading placeholders:', error);
  }
}; 