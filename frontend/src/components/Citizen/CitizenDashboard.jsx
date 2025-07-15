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
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CitizenDashboard = () => {
  const { account, isConnected, getCitizenCertificates } = useWeb3();
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    if (isConnected && account) {
      loadCertificates();
    } else {
      setIsLoading(false);
    }
  }, [isConnected, account]);

  useEffect(() => {
    filterCertificates();
  }, [searchTerm, selectedType, certificates]);

  const loadCertificates = async () => {
    try {
      setIsLoading(true);
      
      // En production, cela viendrait du smart contract
      // Pour la démo, utilisons des données simulées
      const mockCertificates = [
        {
          id: 'SN-NAISS-20240315-ABC123',
          type: 'Acte de Naissance',
          holderName: 'Amadou Diallo',
          issueDate: '2024-03-15',
          expiryDate: null,
          status: 'Actif',
          issuer: 'Mairie de Dakar',
          ipfsHash: 'QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANS...'
        },
        {
          id: 'SN-CNI-20230220-DEF456',
          type: 'Carte Nationale d\'Identité',
          holderName: 'Amadou Diallo',
          issueDate: '2023-02-20',
          expiryDate: '2033-02-20',
          status: 'Actif',
          issuer: 'Direction de l\'État Civil',
          ipfsHash: 'QmYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANS...'
        },
        {
          id: 'SN-DIPL-20220615-GHI789',
          type: 'Diplôme Universitaire',
          holderName: 'Amadou Diallo',
          issueDate: '2022-06-15',
          expiryDate: null,
          status: 'Actif',
          issuer: 'Université Cheikh Anta Diop',
          ipfsHash: 'QmZxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANS...'
        }
      ];

      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCertificates(mockCertificates);
      setFilteredCertificates(mockCertificates);
    } catch (error) {
      console.error('Erreur chargement certificats:', error);
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
        cert.issuer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCertificates(filtered);
  };

  const handleDownloadCertificate = (certificateId, ipfsHash) => {
    // En production, télécharger depuis IPFS
    toast.success(`Téléchargement du certificat ${certificateId}`);
    // window.open(`https://ipfs.io/ipfs/${ipfsHash}`, '_blank');
  };

  const handleShowQRCode = (certificateId) => {
    // Afficher le QR code dans un modal ou nouvelle fenêtre
    toast.info(`QR Code pour ${certificateId}`);
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
    'Certificat de Décès'
  ];

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Mes Certificats Numériques
        </h1>
        <p className="text-gray-600">
          Consultez et gérez vos documents officiels sécurisés sur la blockchain
        </p>
        <div className="mt-4 text-sm text-gray-500">
          Wallet connecté: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Non connecté'}
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par ID, type ou émetteur..."
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

      {/* Liste des certificats */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <ArrowPathIcon className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Chargement de vos certificats...</p>
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
                'bg-gray-500'
              } text-white`}>
                <DocumentTextIcon className="w-8 h-8 mb-2" />
                <h3 className="font-bold text-lg">{certificate.type}</h3>
              </div>

              {/* Corps du certificat */}
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-gray-500">ID du certificat</p>
                  <p className="font-mono text-sm">{certificate.id}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Titulaire</p>
                  <p className="font-semibold">{certificate.holderName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 flex items-center">
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      Date d'émission
                    </p>
                    <p className="text-sm">{new Date(certificate.issueDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                  {certificate.expiryDate && (
                    <div>
                      <p className="text-xs text-gray-500 flex items-center">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        Expiration
                      </p>
                      <p className="text-sm">{new Date(certificate.expiryDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-500 flex items-center">
                    <BuildingOfficeIcon className="w-3 h-3 mr-1" />
                    Émetteur
                  </p>
                  <p className="text-sm">{certificate.issuer}</p>
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
        </ul>
      </div>
    </div>
  );
};

export default CitizenDashboard;