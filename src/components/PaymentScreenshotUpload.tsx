
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, QrCode, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentScreenshotUploadProps {
  onScreenshotUpload: (file: File) => void;
  isUploading: boolean;
  uploadedFile?: File | null;
}

const PaymentScreenshotUpload = ({ 
  onScreenshotUpload, 
  isUploading, 
  uploadedFile 
}: PaymentScreenshotUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    onScreenshotUpload(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <QrCode className="h-5 w-5" />
          <span>Payment Screenshot Upload</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code Display */}
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <img
                src="/qr_payment.jpg"
                alt="Payment QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Scan to Pay with UPI
          </h3>
          <p className="text-gray-600 text-sm">
            Use any UPI app to scan this QR code and make the payment
          </p>
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-blue-800 text-sm font-medium">
              UPI ID: 8414876432@okbizaxis
            </p>
          </div>
        </div>

        {/* Upload Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-yellow-800 font-medium mb-1">Important:</h4>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• Complete the payment using the QR code above</li>
                <li>• Take a screenshot of the successful payment confirmation</li>
                <li>• Upload the screenshot below to complete your order</li>
              </ul>
            </div>
          </div>
        </div>

        {/* File Upload Area */}
        <div>
          <Label htmlFor="payment-screenshot" className="text-sm font-medium">
            Upload Payment Screenshot *
          </Label>
          <div
            className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : uploadedFile
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {uploadedFile ? (
              <div className="space-y-2">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                <p className="text-green-700 font-medium">Screenshot uploaded successfully!</p>
                <p className="text-sm text-gray-600">{uploadedFile.name}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-gray-600 mb-2">
                    Drag and drop your payment screenshot here, or
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isUploading}
                    onClick={() => document.getElementById('payment-screenshot')?.click()}
                  >
                    {isUploading ? 'Uploading...' : 'Browse Files'}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Supported: JPG, PNG, GIF (Max 5MB)
                </p>
              </div>
            )}
          </div>
          <input
            id="payment-screenshot"
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentScreenshotUpload;
