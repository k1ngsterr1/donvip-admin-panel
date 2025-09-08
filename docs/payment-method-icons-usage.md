# Payment Method Icons Implementation

## Overview

This implementation adds icon upload functionality to payment methods, allowing administrators to upload, display, and manage icons for payment methods.

## Features Added

### 1. Icon Upload in Payment Method Form

- **File validation**: Only JPEG, PNG, and SVG files up to 5MB
- **Preview functionality**: Shows selected icon before upload
- **Upload progress**: Visual feedback during upload
- **Error handling**: Clear error messages for invalid files

### 2. Icon Display in Payment Methods Table

- **Icon column**: Shows payment method icons in a dedicated column
- **Fallback display**: Shows default icon when no custom icon is set
- **Responsive design**: Icons are properly sized and centered

### 3. API Integration

- **Upload endpoint**: `/payment/payment-methods/upload-icon`
- **Update endpoint**: `/payment/payment-methods/:id/icon`
- **Delete endpoint**: `/payment/payment-methods/:id/icon`

## Usage

### Creating Payment Method with Icon

1. Open payment method creation form
2. Fill in required fields (name, code, country, currency)
3. In the "Иконка метода" section:
   - Click "Загрузить иконку" or drag & drop file
   - Preview appears automatically
   - File is validated (type and size)
   - Click "Загрузить иконку" button to upload
4. Submit form to create payment method with icon

### Updating Payment Method Icon

1. Edit existing payment method
2. Current icon (if any) is displayed
3. Select new file to replace existing icon
4. Remove icon using "X" button if needed
5. Save changes

### Backend Endpoints Used

- `POST /payment/payment-methods/upload-icon` - Upload icon file
- `POST /payment/payment-methods/:id/icon` - Update existing method icon
- `DELETE /payment/payment-methods/:id/icon` - Remove method icon

## File Structure

```
components/payment-methods/
├── payment-method-form.tsx     # Form with icon upload
└── payment-methods-table.tsx   # Table with icon display

services/
└── payment-method-service.ts   # Service methods for icon operations

lib/
└── api-client.ts              # API client with icon endpoints
```

## Icon Requirements

- **File types**: JPEG, PNG, SVG
- **Max size**: 5MB
- **Recommended size**: 32x32px or 64x64px for optimal display
- **Format**: Square aspect ratio recommended

## Error Handling

- Invalid file type warning
- File size limit exceeded warning
- Upload failure notifications
- Network error handling
