import React, { useEffect, useState } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import {
  DocumentTextIcon,
  QrCodeIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CitizenDashboard = () => {
  const { account, isConnected, contract } = useWeb3();
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isConnected && account && contract) {
      loadCertificates();
    } else {
      setIsLoading(false);
    }
  }, [isConnected, account, contract]);

  useEffect(() => {
    filterCertificates();
  }, [searchTerm, selectedType, certificates]);

  const loadCertificates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 Chargement des certificats pour:', account);
      
      // Récupérer les IDs de certificats du détenteur
      const certificateIds = await contract.getCertificatesByHolder(account);
      console.log('📋 IDs des certificats trouvés:', certificateIds);
      
      if (certificateIds.length === 0) {
        setCertificates([]);
        setFilteredCertificates([]);
        return;
      }

      // Récupérer les détails de chaque certificat
      const certificateDetails = [];
      
      for (const id of certificateIds) {
        try {
          console.log(`🔍 Récupération détails certificat: ${id}`);
          const cert = await contract.getCertificate(id);
          
          // Formater les données pour l'affichage
          const formattedCert = {
            id: cert.certificateId || id,
            type: cert.certificateType,
            holderName: cert.holderName,
            holderAddress: cert.holderAddress,
            issueDate: cert.issueDate ? new Date(Number(cert.issueDate) * 1000) : null,
            expiryDate: cert.expiryDate && Number(cert.expiryDate) > 0 ? new Date(Number(cert.expiryDate) * 1000) : null,
            status: cert.isValid ? 'Actif' : 'Révoqué',
            issuer: cert.issuer,
            ipfsHash: cert.ipfsHash,
            metadata: cert.metadata
          };
          
          certificateDetails.push(formattedCert);
          console.log(`✅ Certificat ${id} traité:`, formattedCert);
          
        } catch (error) {
          console.error(`❌ Erreur récupération certificat ${id}:`, error);
          // Continuer avec les autres certificats même si un échoue
        }
      }
      
      setCertificates(certificateDetails);
      setFilteredCertificates(certificateDetails);
      
      if (certificateDetails.length > 0) {
        toast.success(`${certificateDetails.length} certificat(s) chargé(s)`);
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement certificats:', error);
      setError(error.message);
      toast.error('Erreur lors du chargement des certificats');
    } finally {
      setIsLoading(false);
    }
  };

  const filterCertificates = () => {
    let filtered = certificates;

    // Filtrer par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(cert => cert.type === selectedType);
    }

    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(cert => 
        cert.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.holderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof cert.issuer === 'string' && cert.issuer.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredCertificates(filtered);
  };

  const formatAddress = (address) => {
    if (typeof address === 'string' && address.startsWith('0x')) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return address;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownloadCertificate = (certificateId, ipfsHash) => {
    if (ipfsHash && ipfsHash !== '') {
      // En production, télécharger depuis IPFS
      toast.success(`Téléchargement du certificat ${certificateId}`);
      // window.open(`https://ipfs.io/ipfs/${ipfsHash}`, '_blank');
    } else {
      toast.info('Document IPFS non disponible pour ce certificat');
    }
  };

  const handleShowQRCode = (certificateId) => {
    // Générer l'URL de vérification
    const verificationUrl = `${window.location.origin}/verify?id=${certificateId}`;
    toast.success(`QR Code généré pour ${certificateId}`, {
      duration: 3000
    });
    console.log('URL de vérification:', verificationUrl);
  };

  const handleRefresh = () => {
    loadCertificates();
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Connectez votre wallet
          </h2>
          <p className="text-gray-600 mb-4">
            Pour accéder à vos certificats numériques
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-senegal-green text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Actualiser la page
          </button>
        </div>
      </div>
    );
  }

  const certificateTypes = [
    'all',
    'Acte de Naissance',
    'Carte Nationale d\'Identité',
    'Diplôme Universitaire',
    'Certificat de Mariage',
    'Certificat de Décès',
    'Permis de Conduire',
    'Certificat de Scolarité'
  ];

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Mes Certificats Numériques
            </h1>
            <p className="text-gray-600">
              Consultez et gérez vos documents officiels sécurisés sur la blockchain
            </p>
            <div className="mt-4 text-sm text-gray-500">
              Wallet connecté: {formatAddress(account)}
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-senegal-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par ID, type ou nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-senegal-green focus:border-transparent"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-senegal-green focus:border-transparent"
          >
            <option value="all">Tous les types</option>
            {certificateTypes.slice(1).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Gestion des erreurs */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-red-800 font-semibold">Erreur de chargement</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Liste des certificats */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <ArrowPathIcon className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Chargement de vos certificats depuis la blockchain...</p>
          </div>
        </div>
      ) : filteredCertificates.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">
              {searchTerm || selectedType !== 'all' 
                ? 'Aucun certificat ne correspond à votre recherche'
                : 'Vous n\'avez pas encore de certificats numériques'}
            </p>
            {certificates.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Les certificats créés pour votre adresse wallet apparaîtront ici.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((certificate, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* En-tête du certificat */}
              <div className={`p-4 ${
                certificate.type === 'Acte de Naissance' ? 'bg-blue-500' :
                certificate.type === 'Carte Nationale d\'Identité' ? 'bg-green-500' :
                certificate.type === 'Diplôme Universitaire' ? 'bg-purple-500' :
                certificate.type === 'Certificat de Mariage' ? 'bg-pink-500' :
                certificate.type === 'Permis de Conduire' ? 'bg-orange-500' :
                'bg-gray-500'
              } text-white`}>
                <DocumentTextIcon className="w-8 h-8 mb-2" />
                <h3 className="font-bold text-lg">{certificate.type}</h3>
              </div>

              {/* Corps du certificat */}
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-gray-500">ID du certificat</p>
                  <p className="font-mono text-sm break-all">{certificate.id}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Titulaire</p>
                  <p className="font-semibold">{certificate.holderName}</p>
                </div>

                {certificate.holderAddress && (
                  <div>
                    <p className="text-xs text-gray-500">Adresse</p>
                    <p className="text-sm">{certificate.holderAddress}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 flex items-center">
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      Émission
                    </p>
                    <p className="text-sm">{formatDate(certificate.issueDate)}</p>
                  </div>
                  {certificate.expiryDate && (
                    <div>
                      <p className="text-xs text-gray-500 flex items-center">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        Expiration
                      </p>
                      <p className="text-sm">{formatDate(certificate.expiryDate)}</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-500 flex items-center">
                    <BuildingOfficeIcon className="w-3 h-3 mr-1" />
                    Émetteur
                  </p>
                  <p className="text-sm">{formatAddress(certificate.issuer)}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    certificate.status === 'Actif' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {certificate.status === 'Actif' ? (
                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                    ) : (
                      <XCircleIcon className="w-3 h-3 mr-1" />
                    )}
                    {certificate.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-4 border-t">
                  <button
                    onClick={() => handleShowQRCode(certificate.id)}
                    className="flex-1 bg-senegal-green text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm"
                  >
                    <QrCodeIcon className="w-4 h-4 mr-1" />
                    QR Code
                  </button>
                  <button
                    onClick={() => handleDownloadCertificate(certificate.id, certificate.ipfsHash)}
                    className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center text-sm"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                    Télécharger
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Informations */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          ℹ️ À propos de vos certificats numériques
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Tous vos certificats sont sécurisés sur la blockchain</li>
          <li>• Les QR codes permettent une vérification instantanée</li>
          <li>• Les documents originaux sont stockés de manière décentralisée sur IPFS</li>
          <li>• Seul vous pouvez accéder à vos certificats avec votre wallet</li>
          <li>• Les données sont récupérées en temps réel depuis le smart contract</li>
        </ul>
      </div>
    </div>
  );
};

export default CitizenDashboard;