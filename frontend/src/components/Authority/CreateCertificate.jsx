import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../contexts/Web3Context';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';
import {
  DocumentPlusIcon,
  QrCodeIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';

const CreateCertificate = () => {
  const { createCertificate, account, isAuthorized } = useWeb3();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    certificateId: '',
    holderName: '',
    holderAddress: '',
    certificateType: '',
    holderWallet: '',
    expiryDate: '',
    metadata: {
      lieu: '',
      date: '',
      details: ''
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedQR, setGeneratedQR] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Types de certificats disponibles
  const certificateTypes = [
    'Acte de Naissance',
    'Acte de Mariage', 
    'Acte de Décès',
    'Diplôme Universitaire',
    'Certificat de Scolarité',
    'Permis de Conduire',
    'Carte d\'Identité Nationale',
    'Passeport',
    'Certificat de Résidence',
    'Autre'
  ];

  // Vérifier l'autorisation
  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8">
          <BuildingOfficeIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-4">
            Accès Non Autorisé
          </h2>
          <p className="text-red-600 mb-6">
            Vous devez être une autorité autorisée pour créer des certificats.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('metadata.')) {
      const metadataField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [metadataField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const generateCertificateId = () => {
    const prefix = formData.certificateType.split(' ')[0].toUpperCase() || 'CERT';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `SN-${prefix}-${date}-${random}`;
  };

  const generateQRCode = async (certificateId) => {
    try {
      const verificationData = {
        certificateId,
        verifyUrl: `${window.location.origin}/verify?id=${certificateId}`,
        timestamp: Date.now()
      };
      
      const qrString = await QRCode.toDataURL(JSON.stringify(verificationData), {
        width: 256,
        margin: 2,
        color: {
          dark: '#009639', // Couleur verte du Sénégal
          light: '#FFFFFF'
        }
      });
      
      return qrString;
    } catch (error) {
      console.error('Erreur génération QR code:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);

      // Validation
      if (!formData.holderName || !formData.certificateType || !formData.holderWallet) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Vérifier le format de l'adresse wallet
      if (!/^0x[a-fA-F0-9]{40}$/.test(formData.holderWallet)) {
        toast.error('Adresse wallet invalide');
        return;
      }

      // Générer un ID automatiquement si vide
      const certificateId = formData.certificateId || generateCertificateId();
      
      // Simuler le hash IPFS (en production, uploader le PDF réel)
      const ipfsHash = `Qm${Math.random().toString(36).substring(2, 48)}`;

      // Préparer les métadonnées
      const metadata = JSON.stringify({
        ...formData.metadata,
        issuer: account,
        issueTimestamp: Date.now()
      });

      // Préparer les données pour le smart contract
      const certificateData = {
        certificateId,
        holderName: formData.holderName,
        holderAddress: formData.holderAddress,
        certificateType: formData.certificateType,
        ipfsHash,
        expiryDate: formData.expiryDate ? Math.floor(new Date(formData.expiryDate).getTime() / 1000) : 0,
        metadata,
        holderWallet: formData.holderWallet
      };

      // Créer le certificat
      const receipt = await createCertificate(certificateData);
      
      // Générer le QR code
      const qrCode = await generateQRCode(certificateId);
      
      // Afficher le succès
      setGeneratedQR(qrCode);
      setShowSuccess(true);
      
      toast.success('Certificat créé avec succès !');

    } catch (error) {
      console.error('Erreur création certificat:', error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      certificateId: '',
      holderName: '',
      holderAddress: '',
      certificateType: '',
      holderWallet: '',
      expiryDate: '',
      metadata: {
        lieu: '',
        date: '',
        details: ''
      }
    });
    setGeneratedQR(null);
    setShowSuccess(false);
  };

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <DocumentPlusIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-green-800 mb-4">
            🎉 Certificat Créé avec Succès !
          </h2>
          
          <div className="bg-white p-6 rounded-lg mb-6">
            <h3 className="font-bold text-lg mb-4">QR Code de Vérification</h3>
            {generatedQR && (
              <img 
                src={generatedQR} 
                alt="QR Code" 
                className="mx-auto mb-4 border-2 border-senegal-green rounded"
              />
            )}
            <p className="text-sm text-gray-600">
              Scannez ce QR code pour vérifier le certificat
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={resetForm}
              className="bg-senegal-green text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Créer un Autre Certificat
            </button>
            <button
              onClick={() => navigate('/authority')}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Retour au Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center mb-8">
          <DocumentPlusIcon className="w-8 h-8 text-senegal-green mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">
            Créer un Nouveau Certificat
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="w-4 h-4 inline mr-1" />
                Nom du Détenteur *
              </label>
              <input
                type="text"
                name="holderName"
                value={formData.holderName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-senegal-green focus:border-transparent"
                placeholder="Ex: Amadou Diallo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DocumentIcon className="w-4 h-4 inline mr-1" />
                Type de Certificat *
              </label>
              <select
                name="certificateType"
                value={formData.certificateType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-senegal-green focus:border-transparent"
                required
              >
                <option value="">Sélectionner le type</option>
                {certificateTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse Physique
            </label>
            <input
              type="text"
              name="holderAddress"
              value={formData.holderAddress}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-senegal-green focus:border-transparent"
              placeholder="Ex: Dakar, Sénégal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse Wallet du Détenteur *
            </label>
            <input
              type="text"
              name="holderWallet"
              value={formData.holderWallet}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-senegal-green focus:border-transparent"
              placeholder="0x..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Certificat (optionnel)
              </label>
              <input
                type="text"
                name="certificateId"
                value={formData.certificateId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-senegal-green focus:border-transparent"
                placeholder="Généré automatiquement si vide"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                Date d'Expiration (optionnel)
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-senegal-green focus:border-transparent"
              />
            </div>
          </div>

          {/* Métadonnées */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Informations Complémentaires
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu
                </label>
                <input
                  type="text"
                  name="metadata.lieu"
                  value={formData.metadata.lieu}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-senegal-green focus:border-transparent"
                  placeholder="Ex: Dakar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de l'événement
                </label>
                <input
                  type="date"
                  name="metadata.date"
                  value={formData.metadata.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-senegal-green focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Détails supplémentaires
              </label>
              <textarea
                name="metadata.details"
                value={formData.metadata.details}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-senegal-green focus:border-transparent"
                placeholder="Informations complémentaires..."
              />
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-senegal-green text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Création en cours...' : 'Créer le Certificat'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/authority')}
              className="bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCertificate;