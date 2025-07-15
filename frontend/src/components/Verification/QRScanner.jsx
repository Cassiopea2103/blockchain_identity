import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCodeIcon, CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import jsQR from 'jsqr';

const QRScanner = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    startScanning();
    
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        setHasCamera(true);
        requestAnimationFrame(scanQRCode);
      }
    } catch (error) {
      console.error('Erreur accès caméra:', error);
      setHasCamera(false);
      toast.error('Impossible d\'accéder à la caméra');
    }
  };

  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setIsScanning(false);
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        handleQRCodeDetected(code.data);
        return;
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(scanQRCode);
  };

  const handleQRCodeDetected = (data) => {
    try {
      stopScanning();
      setScanResult(data);
      
      // Parser les données du QR code
      const qrData = JSON.parse(data);
      
      if (qrData.certificateId && qrData.verifyUrl) {
        toast.success('QR Code détecté!');
        
        // Rediriger vers la page de vérification avec l'ID
        setTimeout(() => {
          navigate(`/verify?id=${qrData.certificateId}`);
        }, 1000);
      } else {
        toast.error('QR Code invalide');
        setScanResult(null);
        setTimeout(() => startScanning(), 2000);
      }
    } catch (error) {
      console.error('Erreur parsing QR code:', error);
      toast.error('Format de QR code non reconnu');
      setScanResult(null);
      setTimeout(() => startScanning(), 2000);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          handleQRCodeDetected(code.data);
        } else {
          toast.error('Aucun QR code détecté dans l\'image');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* En-tête */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                  <QrCodeIcon className="w-8 h-8 mr-2 text-senegal-green" />
                  Scanner QR Code
                </h1>
                <p className="text-gray-600 mt-1">
                  Scannez le QR code d'un certificat pour le vérifier
                </p>
              </div>
              <button
                onClick={() => navigate('/verify')}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Zone de scan */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {hasCamera ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-auto max-h-96"
                  style={{ display: isScanning ? 'block' : 'none' }}
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {/* Overlay de scan */}
                {isScanning && !scanResult && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-senegal-green rounded-lg">
                      <div className="w-full h-full relative">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-senegal-yellow rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-senegal-yellow rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-senegal-yellow rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-senegal-yellow rounded-br-lg"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Message de scan */}
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg inline-block">
                    {scanResult ? 'QR Code détecté!' : 'Positionnez le QR code dans le cadre'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <CameraIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Caméra non disponible
                </h3>
                <p className="text-gray-600 mb-6">
                  Veuillez autoriser l'accès à la caméra ou télécharger une image
                </p>
              </div>
            )}
          </div>

          {/* Actions alternatives */}
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              Autres options
            </h3>
            
            <div className="space-y-4">
              {/* Upload d'image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Télécharger une image contenant un QR code
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-senegal-green file:text-white
                    file:bg-green-700"
                />
              </div>

              {/* Saisie manuelle */}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  Ou saisissez manuellement l'ID du certificat
                </p>
                <button
                  onClick={() => navigate('/verify')}
                  className="text-senegal-green hover:text-green-700 font-medium"
                >
                  Saisir un ID manuellement →
                </button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              💡 Comment scanner un QR code ?
            </h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Autorisez l'accès à votre caméra si demandé</li>
              <li>Positionnez le QR code du certificat dans le cadre</li>
              <li>Le scan se fait automatiquement</li>
              <li>Vous serez redirigé vers la page de vérification</li>
            </ol>
          </div>

          {/* Boutons de contrôle */}
          {hasCamera && (
            <div className="flex justify-center mt-6 space-x-4">
              {isScanning ? (
                <button
                  onClick={stopScanning}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <XMarkIcon className="w-5 h-5 mr-2" />
                  Arrêter le scan
                </button>
              ) : (
                <button
                  onClick={startScanning}
                  className="bg-senegal-green text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <CameraIcon className="w-5 h-5 mr-2" />
                  Démarrer le scan
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;