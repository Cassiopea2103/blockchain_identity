import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../contexts/Web3Context';
import { uploadFileToIPFS, uploadJSONToIPFS, testPinataConnection } from '../../services/pinataService';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';
import {
  DocumentPlusIcon,
  QrCodeIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  DocumentIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
  DocumentArrowUpIcon
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pinataConnected, setPinataConnected] = useState(false);
  const [createdCertificateData, setCreatedCertificateData] = useState(null);

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
    'Certificat de Mariage',
    'Certificat de Divorce',
    'Autre'
  ];

  // Tester connexion Pinata au chargement
  useEffect(() => {
    const checkPinata = async () => {
      try {
        const connected = await testPinataConnection();
        setPinataConnected(connected);
        if (connected) {
          toast.success('IPFS connecté via Pinata');
        } else {
          toast.info('Mode démo - IPFS simulé');
        }
      } catch (error) {
        console.error('Erreur test Pinata:', error);
        setPinataConnected(false);
      }
    };
    checkPinata();
  }, []);

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

  // Générer un PDF simple pour la démo
  const generateCertificatePDF = (certificateData) => {
    const pdfContent = `
═══════════════════════════════════════════════════════════════════
                          RÉPUBLIQUE DU SÉNÉGAL
                    Un Peuple - Un But - Une Foi
═══════════════════════════════════════════════════════════════════

                      ${certificateData.certificateType.toUpperCase()}
                           
═══════════════════════════════════════════════════════════════════

INFORMATIONS DU TITULAIRE
─────────────────────────────────────────────────────────────────
Nom complet      : ${certificateData.holderName}
Adresse          : ${certificateData.holderAddress || 'Non spécifiée'}
Wallet Ethereum  : ${certificateData.holderWallet}

DÉTAILS DU CERTIFICAT
─────────────────────────────────────────────────────────────────
ID Certificat    : ${certificateData.certificateId}
Type             : ${certificateData.certificateType}
Date d'émission  : ${new Date().toLocaleDateString('fr-FR')}
Date d'expiration: ${certificateData.expiryDate ? new Date(certificateData.expiryDate * 1000).toLocaleDateString('fr-FR') : 'Permanent'}

INFORMATIONS COMPLÉMENTAIRES
─────────────────────────────────────────────────────────────────
Lieu             : ${certificateData.metadata.lieu || 'Non spécifié'}
Date événement   : ${certificateData.metadata.date || 'Non spécifiée'}
Détails          : ${certificateData.metadata.details || 'Aucun détail supplémentaire'}

AUTORITÉ ÉMETTRICE
─────────────────────────────────────────────────────────────────
Émis par         : Autorité Officielle Sénégalaise
Adresse blockchain: ${account}
Blockchain       : Ethereum/Polygon
Réseau           : ${import.meta.env.VITE_NETWORK_NAME || 'Local'}

SÉCURITÉ ET VÉRIFICATION
─────────────────────────────────────────────────────────────────
Ce document est sécurisé par la technologie blockchain.
Chaque certificat possède une signature cryptographique unique.

Hash de transaction: [SERA AJOUTÉ APRÈS TRANSACTION]
Hash IPFS           : [SERA AJOUTÉ APRÈS UPLOAD]

VÉRIFICATION EN LIGNE
─────────────────────────────────────────────────────────────────
Pour vérifier l'authenticité de ce document:
1. Scannez le QR code ci-dessous avec votre smartphone
2. Ou visitez: ${window.location.origin}/verify?id=${certificateData.certificateId}
3. Saisissez l'ID du certificat: ${certificateData.certificateId}

La vérification est instantanée et gratuite.

═══════════════════════════════════════════════════════════════════
                    DOCUMENT OFFICIEL ÉLECTRONIQUE
              Émis le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
═══════════════════════════════════════════════════════════════════

Note: Ce document est généré automatiquement par le système
d'identité numérique de la République du Sénégal.
Toute falsification est punissable par la loi.
    `;

    // Créer un Blob avec le contenu
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    return new File([blob], `${certificateData.certificateId}.txt`, { 
      type: 'text/plain',
      lastModified: Date.now()
    });
  };

  // Gérer la sélection de fichier
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille (max 10MB pour Pinata gratuit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Fichier trop volumineux (max 10MB)');
        e.target.value = '';
        return;
      }

      // Vérifier le type de fichier
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Type de fichier non supporté. Utilisez PDF, JPG, PNG ou TXT.');
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
      toast.success(`Fichier sélectionné: ${file.name}`);
    }
  };

  // Supprimer le fichier sélectionné
  const removeSelectedFile = () => {
    setSelectedFile(null);
    // Reset input file
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
    toast.info('Fichier supprimé');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setUploadProgress(0);

      // Validation des champs obligatoires
      if (!formData.holderName || !formData.certificateType || !formData.holderWallet) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Vérifier le format de l'adresse wallet
      if (!/^0x[a-fA-F0-9]{40}$/.test(formData.holderWallet)) {
        toast.error('Adresse wallet invalide (format: 0x...)');
        return;
      }

      // Générer un ID automatiquement si vide
      const certificateId = formData.certificateId || generateCertificateId();
      
      // Préparer les données du certificat
      const certificateData = {
        certificateId,
        holderName: formData.holderName,
        holderAddress: formData.holderAddress,
        certificateType: formData.certificateType,
        holderWallet: formData.holderWallet,
        expiryDate: formData.expiryDate ? Math.floor(new Date(formData.expiryDate).getTime() / 1000) : 0,
        metadata: {
          ...formData.metadata,
          issuer: account,
          issueTimestamp: Date.now(),
          pinataEnabled: pinataConnected,
          originalFilename: selectedFile?.name || 'generated_document.txt'
        }
      };

      let ipfsHash = '';
      let ipfsUrl = '';

      setUploadProgress(10);

      // Upload vers IPFS si Pinata est connecté
      if (pinataConnected) {
        toast.loading('Upload du document vers IPFS...', { id: 'upload' });
        setUploadProgress(25);

        try {
          // Utiliser le fichier sélectionné ou générer un document
          const fileToUpload = selectedFile || generateCertificatePDF(certificateData);
          
          console.log('📤 Upload fichier vers IPFS:', fileToUpload.name);
          
          // Upload vers IPFS via Pinata
          ipfsHash = await uploadFileToIPFS(
            fileToUpload, 
            `certificate_${certificateId}`
          );
          
          ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
          
          setUploadProgress(50);
          toast.success('Document uploadé sur IPFS !', { id: 'upload' });
          
          // Upload optionnel des métadonnées
          try {
            const metadataHash = await uploadJSONToIPFS(
              { ...certificateData, documentHash: ipfsHash }, 
              `metadata_${certificateId}`
            );
            console.log('📋 Métadonnées IPFS:', metadataHash);
          } catch (metaError) {
            console.warn('Erreur upload métadonnées:', metaError);
            // Continuer même si les métadonnées échouent
          }
          
        } catch (error) {
          console.error('❌ Erreur upload IPFS:', error);
          toast.error('Erreur upload IPFS, création sans document stocké');
          ipfsHash = `error_${Date.now()}`; // Fallback pour permettre la création
        }
      } else {
        // Mode simulation sans Pinata
        ipfsHash = `demo_${Math.random().toString(36).substring(2, 48)}`;
        ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
        toast.info('Mode démo - Hash IPFS simulé');
      }

      setUploadProgress(75);

      // Préparer les données finales pour le smart contract
      const finalCertificateData = {
        ...certificateData,
        ipfsHash,
        metadata: JSON.stringify({
          ...certificateData.metadata,
          ipfsUrl: ipfsUrl,
          fileSize: selectedFile?.size || 0,
          fileType: selectedFile?.type || 'text/plain'
        })
      };

      toast.loading('Création du certificat sur la blockchain...', { id: 'blockchain' });
      
      // Créer le certificat sur la blockchain
      const receipt = await createCertificate(finalCertificateData);
      
      setUploadProgress(90);
      
      // Générer le QR code
      const qrCodeData = await generateQRCode(certificateId);
      setGeneratedQR(qrCodeData);
      
      // Préparer les données pour affichage succès
      setCreatedCertificateData({
        ...finalCertificateData,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        ipfsUrl: ipfsUrl
      });
      
      setUploadProgress(100);
      setShowSuccess(true);

      toast.success('🎉 Certificat créé avec succès !', { id: 'blockchain' });
      
      // Log complet pour debug
      console.log('📄 Certificat créé:', {
        id: certificateId,
        ipfsHash,
        ipfsUrl,
        transaction: receipt.hash,
        block: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString()
      });

    } catch (error) {
      console.error('❌ Erreur création certificat:', error);
      toast.error(`Erreur: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // Modal de succès
  if (showSuccess && createdCertificateData) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
          
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            🎉 Certificat Créé avec Succès !
          </h1>
          
          <div className="bg-white rounded-lg p-6 my-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              📋 Détails du Certificat
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-gray-500">ID Certificat</p>
                <p className="font-mono text-sm font-semibold">{createdCertificateData.certificateId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-semibold">{createdCertificateData.certificateType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Titulaire</p>
                <p className="font-semibold">{createdCertificateData.holderName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Transaction</p>
                <p className="font-mono text-xs">{createdCertificateData.transactionHash?.slice(0, 20)}...</p>
              </div>
              {createdCertificateData.ipfsUrl && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Document IPFS</p>
                  <a 
                    href={createdCertificateData.ipfsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm break-all"
                  >
                    {createdCertificateData.ipfsUrl}
                  </a>
                </div>
              )}
            </div>
          </div>

          {generatedQR && (
            <div className="bg-white rounded-lg p-6 my-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                QR Code de Vérification
              </h3>
              <img 
                src={generatedQR} 
                alt="QR Code" 
                className="mx-auto border-2 border-senegal-green rounded-lg"
              />
              <p className="text-sm text-gray-600 mt-2">
                Scannez ce QR code pour vérifier le certificat
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                setShowSuccess(false);
                setFormData({
                  certificateId: '',
                  holderName: '',
                  holderAddress: '',
                  certificateType: '',
                  holderWallet: '',
                  expiryDate: '',
                  metadata: { lieu: '', date: '', details: '' }
                });
                setSelectedFile(null);
                setGeneratedQR(null);
                setCreatedCertificateData(null);
              }}
              className="bg-senegal-green text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Créer un Autre Certificat
            </button>
            <button
              onClick={() => navigate('/authority')}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Créer un Certificat Numérique
            </h1>
            <p className="text-gray-600">
              Émettre un nouveau document officiel sécurisé sur la blockchain
            </p>
          </div>
          
          {/* Statut Pinata */}
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            pinataConnected ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${pinataConnected ? 'bg-green-500' : 'bg-orange-500'}`}></div>
            <span>{pinataConnected ? 'IPFS Connecté' : 'IPFS Simulé'}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="w-4 h-4 inline mr-1" />
                Nom du Titulaire *
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

          {/* Section Upload de Document */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <DocumentArrowUpIcon className="w-5 h-5 mr-2" />
              Document du Certificat
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fichier PDF/Image du certificat (optionnel)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.txt"
                  onChange={handleFileSelect}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-senegal-green focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Si aucun fichier sélectionné, un document sera généré automatiquement. 
                  Formats acceptés: PDF, JPG, PNG, TXT. Taille max: 10MB.
                </p>
              </div>

              {selectedFile && (
                <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-800 font-semibold">
                        📄 {selectedFile.name}
                      </p>
                      <p className="text-xs text-blue-600">
                        Taille: {(selectedFile.size / 1024).toFixed(1)} KB | 
                        Type: {selectedFile.type}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeSelectedFile}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {!pinataConnected && (
                <div className="bg-orange-50 p-4 rounded border-l-4 border-orange-500">
                  <p className="text-sm text-orange-800">
                    ⚠️ IPFS non configuré. Les documents seront simulés pour cette démo.
                    <br />
                    Pour activer IPFS: configurez VITE_PINATA_API_KEY et VITE_PINATA_SECRET dans .env
                  </p>
                </div>
              )}
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
                  placeholder="Ex: Hôpital Principal Dakar"
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
                placeholder="Informations additionnelles..."
              />
            </div>
          </div>

          {/* Progress bar pendant upload */}
          {uploadProgress > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">Progression de la création</span>
                <span className="text-sm text-blue-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-blue-700">
                {uploadProgress < 25 && "Initialisation..."}
                {uploadProgress >= 25 && uploadProgress < 50 && "Upload IPFS en cours..."}
                {uploadProgress >= 50 && uploadProgress < 75 && "Finalisation stockage..."}
                {uploadProgress >= 75 && uploadProgress < 90 && "Création sur blockchain..."}
                {uploadProgress >= 90 && "Génération QR code..."}
              </div>
            </div>
          )}

          {/* Informations importantes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">
              ⚠️ Informations importantes
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Assurez-vous que l'adresse wallet du détenteur est correcte</li>
              <li>• Une fois créé, le certificat ne peut pas être modifié</li>
              <li>• Le processus peut prendre quelques minutes selon le réseau</li>
              <li>• Un QR code sera généré pour la vérification</li>
            </ul>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => navigate('/authority')}
              disabled={isSubmitting}
              className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!formData.holderName || !formData.certificateType || !formData.holderWallet)}
              className="flex-1 bg-senegal-green text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
                  {uploadProgress > 0 ? `Création... ${uploadProgress}%` : 'Initialisation...'}
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <DocumentPlusIcon className="w-5 h-5 mr-2" />
                  Créer le Certificat
                </div>
              )}
            </button>
          </div>

          {/* Aperçu des données (mode développement) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="bg-gray-100 p-4 rounded-lg">
              <summary className="cursor-pointer font-medium text-gray-700">
                🔧 Aperçu des données (développement)
              </summary>
              <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                {JSON.stringify({
                  formData,
                  selectedFile: selectedFile ? {
                    name: selectedFile.name,
                    size: selectedFile.size,
                    type: selectedFile.type
                  } : null,
                  pinataConnected,
                  account
                }, null, 2)}
              </pre>
            </details>
          )}
        </form>
      </div>

      {/* Section aide */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3">
          📚 Guide d'utilisation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-semibold mb-2">Champs obligatoires :</h4>
            <ul className="space-y-1">
              <li>• Nom du titulaire</li>
              <li>• Type de certificat</li>
              <li>• Adresse wallet du détenteur</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Formats de fichier :</h4>
            <ul className="space-y-1">
              <li>• PDF (recommandé)</li>
              <li>• Images: JPG, PNG</li>
              <li>• Texte: TXT</li>
              <li>• Taille max: 10MB</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Adresse wallet :</h4>
            <ul className="space-y-1">
              <li>• Format: 0x + 40 caractères</li>
              <li>• Exemple: 0x742d35Cc...</li>
              <li>• Vérifiez bien l'adresse</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Après création :</h4>
            <ul className="space-y-1">
              <li>• QR code généré</li>
              <li>• Transaction blockchain</li>
              <li>• Document sur IPFS</li>
              <li>• Certificat immuable</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCertificate;