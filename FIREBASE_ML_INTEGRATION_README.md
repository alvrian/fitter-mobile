# Firebase ML Kit (AIY) Integration for Fitter Mobile

## Overview

This document explains the Firebase ML Kit (AIY) integration for food recognition in the Fitter Mobile app. The integration is set up to use Firebase ML Kit with your uploaded model, providing a clean architecture with a popup modal for displaying recognition results.

## Current Implementation

### Files Created/Modified

1. **`app/(tabs)/two.tsx`** - Camera screen with Firebase ML Kit integration
2. **`FirebaseMLService.ts`** - Service class for Firebase ML Kit operations
3. **`FIREBASE_ML_INTEGRATION_README.md`** - This documentation

### Features Implemented

✅ **Firebase ML Kit Integration**
- Model input format: 224x224 RGB images, normalized to [0, 1]
- Automatic image resizing and preprocessing
- Tensor conversion for Firebase ML Kit compatibility
- Error handling and loading states

✅ **Camera Integration**
- Take photos with front/back camera switching
- Image resizing to 224x224 pixels (model input size)
- Image preview with recognition results

✅ **Popup Modal UI**
- Beautiful modal popup for recognition results
- Food name and confidence score display
- Nutritional information grid (calories, protein, carbs, fat)
- Smooth animations and modern design

✅ **Service Architecture**
- Clean separation of concerns with `FirebaseMLService`
- Mock implementation for testing
- Proper TypeScript interfaces
- Comprehensive nutritional database

✅ **User Experience**
- Automatic food recognition after taking a photo
- Loading indicators during processing
- Retake photo functionality
- Error recovery options

## How to Use

### Current Mock Implementation

The app currently uses a mock implementation that:
1. Simulates Firebase ML Kit initialization
2. Simulates food recognition (2 second delay)
3. Returns random food predictions from 25 predefined food classes
4. Provides realistic nutritional data for recognized foods

### Testing the Integration

1. **Start the app** and navigate to the Camera tab
2. **Take a photo** of any food item
3. **Wait for processing** - you'll see a loading indicator
4. **View results** - a popup modal will appear showing:
   - Recognized food name
   - Confidence percentage
   - Nutritional information (calories, protein, carbs, fat)
5. **Close modal** or take another photo

## Completing the Real Implementation

### Step 1: Firebase ML Kit Setup

Ensure your Firebase project has ML Kit enabled and your model is uploaded:

1. **Firebase Console**: Go to your Firebase project
2. **ML Kit**: Navigate to Machine Learning > Custom models
3. **Upload Model**: Upload your AIY model with the name "aiy"
4. **Model Configuration**: Ensure the model expects 224x224 RGB input

### Step 2: Update FirebaseMLService.ts

Replace the mock implementation in `FirebaseMLService.ts` with real Firebase ML Kit code:

```typescript
// Replace the recognizeFood method
async recognizeFood(imageUri: string): Promise<RecognitionResult> {
  if (!this.isInitialized) {
    throw new Error('Firebase ML Kit not initialized');
  }

  try {
    // Convert image to tensor
    const inputTensor = await this.imageToTensor(imageUri);
    
    // Use Firebase ML Kit for inference
    import ml from '@react-native-firebase/ml';
    
    const result = await ml().runInference({
      modelName: 'aiy', // Your model name in Firebase
      input: {
        data: inputTensor,
        shape: [1, 224, 224, 3], // Batch size 1, 224x224 RGB
        dataType: 'float32'
      }
    });

    // Process the output
    if (result && result.output && result.output.data) {
      const outputData = result.output.data as number[];
      const maxIndex = outputData.indexOf(Math.max(...outputData));
      const confidence = outputData[maxIndex];
      
      // Get the label from the model output
      const label = `Food_${maxIndex}`; // Adjust based on your model's output format
      
      // Get nutritional data
      const nutritionalData = this.getNutritionalData(label);
      
      return {
        label,
        confidence,
        ...nutritionalData
      };
    } else {
      throw new Error('Invalid model output');
    }
  } catch (error) {
    console.error('Error during food recognition:', error);
    throw error;
  }
}
```

### Step 3: Adjust Model Input Format

The current implementation assumes:
- **Input size**: 224x224 pixels
- **Color format**: RGB (3 channels)
- **Normalization**: Values between 0 and 1
- **Data type**: Float32Array

You may need to adjust the `imageToTensor` method based on your model's requirements:

```typescript
async imageToTensor(imageUri: string): Promise<Float32Array> {
  // Adjust this method based on your model's input requirements:
  // - Input dimensions (width x height)
  // - Color channels (RGB, BGR, grayscale, etc.)
  // - Normalization range (-1 to 1, 0 to 1, etc.)
  // - Channel order (RGB, BGR, etc.)
}
```

### Step 4: Update Food Classes

Update the food labels in `FirebaseMLService.ts` to match your model's output classes:

```typescript
// Replace the label generation in recognizeFood method
const label = `Food_${maxIndex}`; // Replace with your actual food class names
```

### Step 5: Test with Real Model

1. **Replace the mock implementation** with real Firebase ML Kit code
2. **Test with your uploaded model** in Firebase ML Kit
3. **Verify input/output formats** match your model's requirements
4. **Test with real food images** to ensure accuracy

## Model Requirements

### Input Format
- **Size**: 224x224 pixels
- **Color**: RGB (3 channels)
- **Normalization**: 0-1 range
- **Data type**: Float32Array
- **Shape**: [1, 224, 224, 3] (batch size 1)

### Output Format
- **Type**: Array of confidence scores
- **Length**: Should match your model's number of classes
- **Range**: 0-1 (probabilities)

## Firebase ML Kit Configuration

### Model Upload
1. **Model Format**: TensorFlow Lite (.tflite) or TensorFlow SavedModel
2. **Model Name**: "aiy" (as used in the code)
3. **Input Shape**: [1, 224, 224, 3]
4. **Output Shape**: [1, num_classes]

### Firebase Project Setup
1. **Enable ML Kit**: In Firebase Console > Machine Learning
2. **Custom Models**: Enable custom model hosting
3. **Model Upload**: Upload your AIY model
4. **Permissions**: Ensure your app has proper Firebase permissions

## Troubleshooting

### Common Issues

1. **Model not found**
   - Check if the model is uploaded to Firebase ML Kit
   - Verify the model name matches "aiy"
   - Check Firebase project configuration

2. **Input format errors**
   - Verify tensor shape matches [1, 224, 224, 3]
   - Check normalization range (0-1)
   - Ensure RGB channel order

3. **Performance issues**
   - Consider model optimization
   - Implement caching for processed images
   - Add loading states for better UX

### Debug Tips

1. **Enable console logging** to see Firebase ML Kit calls
2. **Test with simple images** first (clear, well-lit food photos)
3. **Verify tensor shapes** match model input requirements
4. **Check Firebase ML Kit documentation** for your specific model type

## Next Steps

1. **Complete the real Firebase ML Kit integration** using the steps above
2. **Add meal tracking functionality** to save recognized foods
3. **Implement nutritional goal tracking** based on recognized foods
4. **Add food database integration** for more accurate nutritional data
5. **Optimize model performance** for mobile devices

## Resources

- [Firebase ML Kit Documentation](https://firebase.google.com/docs/ml-kit)
- [Firebase ML Kit Custom Models](https://firebase.google.com/docs/ml-kit/custom-models)
- [React Native Firebase ML](https://rnfirebase.io/ml)
- [Expo Camera](https://docs.expo.dev/versions/latest/sdk/camera/)
- [Expo Image Manipulator](https://docs.expo.dev/versions/latest/sdk/image-manipulator/)

## Support

If you encounter issues with the Firebase ML Kit integration:
1. Check the console logs for error messages
2. Verify your model is properly uploaded to Firebase ML Kit
3. Test with the mock implementation first
4. Refer to the Firebase ML Kit documentation for your specific model requirements
5. Ensure your Firebase project has ML Kit enabled

## Implementation Notes

- The current implementation uses a mock service to simulate Firebase ML Kit behavior
- The popup modal provides a great user experience for displaying results
- The service architecture makes it easy to switch from mock to real implementation
- All image preprocessing is handled automatically (resize to 224x224, RGB conversion, normalization)
- Error handling is comprehensive with user-friendly alerts
