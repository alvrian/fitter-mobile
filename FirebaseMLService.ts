import * as FileSystem from 'expo-file-system';

export interface RecognitionResult {
  label: string;
  confidence: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export class FirebaseMLService {
  private isInitialized = false;
  private model: any = null;

  async initialize(): Promise<boolean> {
    try {
      // Initialize Firebase ML Kit
      // Note: Firebase ML Kit initialization is typically automatic
      // when the app starts, but you can add custom initialization here
      this.isInitialized = true;
      console.log('Firebase ML Kit initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Firebase ML Kit:', error);
      throw error;
    }
  }

  async imageToTensor(imageUri: string): Promise<Uint8Array> {
    try {
      // Read image as base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to array buffer
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert to Uint8Array for 192x192 RGB (3 channels) - your model's input size
      const tensor = new Uint8Array(192 * 192 * 3);
      let tensorIndex = 0;
      
      // Process RGB channels - keep as uint8 (0-255) since your model expects uint8
      for (let i = 0; i < bytes.length; i += 3) {
        if (tensorIndex < tensor.length) {
          const r = bytes[i];
          const g = bytes[i + 1];
          const b = bytes[i + 2];
          
          tensor[tensorIndex] = r;     // Red channel
          tensor[tensorIndex + 1] = g; // Green channel
          tensor[tensorIndex + 2] = b; // Blue channel
          
          tensorIndex += 3;
        }
      }

      return tensor;
    } catch (error) {
      console.error('Error converting image to tensor:', error);
      throw error;
    }
  }

  async recognizeFood(imageUri: string): Promise<RecognitionResult> {
    if (!this.isInitialized) {
      throw new Error('Firebase ML Kit not initialized');
    }

    try {
      const inputTensor = await this.imageToTensor(imageUri);
      
      // For now, simulate the TensorFlow Lite inference since the native module isn't linked
      // TODO: Replace this with actual TensorFlow Lite inference when native module is properly linked
      
      // Simulate inference delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock prediction results based on your model's output shape (2024 classes)
      const mockOutput = new Array(2024).fill(0).map(() => Math.random());
      
      // Find most probable class (skip background class if needed)
      const maxIndex = mockOutput.indexOf(Math.max(...mockOutput));
      const confidence = mockOutput[maxIndex];
      
      // Map to food labels (you'll need to adjust this based on your actual label mapping)
      const foodLabels = [
        'apple', 'banana', 'orange', 'strawberry', 'grape',
        'carrot', 'broccoli', 'tomato', 'potato', 'onion',
        'chicken', 'beef', 'fish', 'pork', 'egg',
        'rice', 'bread', 'pasta', 'pizza', 'burger',
        'salad', 'soup', 'cake', 'cookie', 'ice_cream'
      ];
      
      // Map the model output index to a food label
      const foodIndex = maxIndex % foodLabels.length;
      const label = foodLabels[foodIndex];
      
      // Get nutrition info for the recognized food
      const nutritionalData = this.getNutritionalData(label);
      
      return {
        label,
        confidence,
        ...nutritionalData
      };
    } catch (error) {
      console.error('Error during food recognition:', error);
      throw error;
    }
  }

  private getNutritionalData(foodName: string) {
    const nutritionDB: { [key: string]: { calories: number; protein: number; carbs: number; fat: number } } = {
      'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
      'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
      'orange': { calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
      'strawberry': { calories: 32, protein: 0.7, carbs: 8, fat: 0.3 },
      'grape': { calories: 62, protein: 0.6, carbs: 16, fat: 0.2 },
      'carrot': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
      'broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
      'tomato': { calories: 18, protein: 0.9, carbs: 4, fat: 0.2 },
      'potato': { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
      'onion': { calories: 40, protein: 1.1, carbs: 9, fat: 0.1 },
      'chicken': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
      'beef': { calories: 250, protein: 26, carbs: 0, fat: 15 },
      'fish': { calories: 206, protein: 22, carbs: 0, fat: 12 },
      'pork': { calories: 242, protein: 27, carbs: 0, fat: 14 },
      'egg': { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
      'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
      'bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
      'pasta': { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
      'pizza': { calories: 266, protein: 11, carbs: 33, fat: 10 },
      'burger': { calories: 295, protein: 12, carbs: 30, fat: 12 },
      'salad': { calories: 20, protein: 2, carbs: 4, fat: 0.2 },
      'soup': { calories: 50, protein: 3, carbs: 8, fat: 1 },
      'cake': { calories: 257, protein: 3, carbs: 35, fat: 12 },
      'cookie': { calories: 502, protein: 6, carbs: 63, fat: 24 },
      'ice_cream': { calories: 207, protein: 3.5, carbs: 24, fat: 11 },
    };

    return nutritionDB[foodName] || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

// Export a singleton instance
export const firebaseMLService = new FirebaseMLService();
