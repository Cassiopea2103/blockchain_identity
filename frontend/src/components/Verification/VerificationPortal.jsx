// src/components/Verification/VerificationPortal.jsx
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWeb3 } from '../../contexts/Web3Context';
import toast from 'react-hot-toast';
import {
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const VerificationPortal = () => {
  const { verifyCertificate } = useWeb3();
  const [searchParams] = useSearchParams();
  
  const [certificateId, setCertificateId] = useState(searchParams.get('id') || '');
  const [isSearching, setIsSearching] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleVerification = async (e) => {
    e.preventDefault();
    
    if (!certificateId.trim()) {
      toast.error('Veuillez saisir un ID de certificat');
      return;
    }

    try {
      setIsSearching(true);
      setHasSearched(true);
      
      const result = await verifyCertificate(certificateId.trim());
      setVerificationResult(result);
      
      if (result.isValid) {
        toast.success('Certificat vérifié avec succès !');
      } else {
        toast.error('Certificat invalide ou non trouvé');
      }
      
    } catch (error) {
      console.error('Erreur vérification:', error);
      setVerificationResult(null);
      toast.error('Erreur lors de la vérification');
    } finally {
      setIsSearching(false);
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (date) => {
    return date ? date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Non spécifié';
  };

  const getStatusColor = (isValid) => {
    return isValid ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (isValid) => {
    return isValid ? CheckCircleIcon : XCircleIcon;
  };

  const getStatusText = (isValid) => {
    return isValid ? 'VALIDE' : 'INVALIDE';
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <ShieldCheckIcon className="w-16 h-16 text-senegal-green mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          🔍 Vérification de Certificat
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Saisissez l'ID d'un certificat pour vérifier son authenticité sur la blockchain. 
          La vérification est instantanée et gratuite.
        </p>
      </div>

      {/* Formulaire de recherche */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <form onSubmit={handleVerification} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DocumentTextIcon className="w-4 h-4 inline mr-1" />
              ID du Certificat
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-senegal-green focus:border-transparent text-lg"
                placeholder="Ex: SN-BIRTH-2025-001"
                disabled={isSearching}
              />
              <button
                type="submit"
                disabled={isSearching || !certificateId.trim()}
                className="bg-senegal-green text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Vérification...
                  </>
                ) : (
                  <>
                    <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                    Vérifier
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            💡 <strong>Astuce :</strong> Vous pouvez aussi scanner un QR code en utilisant le 
            <a href="/scan" className="text-senegal-green hover:underline ml-1">scanner QR</a>
          </div>
        </form>
      </div>

      {/* Résultats de la vérification */}
      {hasSearched && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          {verificationResult ? (
            <div>
              {/* Statut de validation */}
              <div className="text-center mb-8">
                {React.createElement(getStatusIcon(verificationResult.isValid), {
                  className: `w-20 h-20 mx-auto mb-4 ${getStatusColor(verificationResult.isValid)}`
                })}
                <h2 className={`text-3xl font-bold mb-2 ${getStatusColor(verificationResult.isValid)}`}>
                  {getStatusText(verificationResult.isValid)}
                </h2>
                <p className="text-gray-600">
                  {verificationResult.isValid 
                    ? 'Ce certificat est authentique et valide'
                    : 'Ce certificat n\'est pas valide ou a expiré'
                  }
                </p>
              </div>

              {/* Détails du certificat */}
              {verificationResult.isValid && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <UserIcon className="w-5 h-5 text-gray-600 mr-2" />
                        <span className="font-semibold text-gray-700">Détenteur</span>
                      </div>
                      <p className="text-lg font-medium">{verificationResult.holderName}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <DocumentTextIcon className="w-5 h-5 text-gray-600 mr-2" />
                        <span className="font-semibold text-gray-700">Type de Document</span>
                      </div>
                      <p className="text-lg font-medium">{verificationResult.certificateType}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <BuildingOfficeIcon className="w-5 h-5 text-gray-600 mr-2" />
                        <span className="font-semibold text-gray-700">Autorité Émettrice</span>
                      </div>
                      <p className="font-mono text-sm">{formatAddress(verificationResult.issuer)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <CalendarIcon className="w-5 h-5 text-gray-600 mr-2" />
                        <span className="font-semibold text-gray-700">Date d'Émission</span>
                      </div>
                      <p className="text-lg font-medium">{formatDate(verificationResult.issueDate)}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <CalendarIcon className="w-5 h-5 text-gray-600 mr-2" />
                        <span className="font-semibold text-gray-700">Date d'Expiration</span>
                      </div>
                      <p className="text-lg font-medium">
                        {verificationResult.expiryDate ? formatDate(verificationResult.expiryDate) : 'Permanent'}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <DocumentTextIcon className="w-5 h-5 text-gray-600 mr-2" />
                        <span className="font-semibold text-gray-700">Hash IPFS</span>
                      </div>
                      <p className="font-mono text-sm break-all">
                        {verificationResult.ipfsHash}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-8 flex justify-center gap-4">
                <button
                  onClick={() => {
                    setCertificateId('');
                    setVerificationResult(null);
                    setHasSearched(false);
                  }}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Nouvelle Vérification
                </button>
                
                {verificationResult.isValid && (
                  <button
                    onClick={() => window.print()}
                    className="bg-senegal-green text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Imprimer le Résultat
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <XCircleIcon className="w-20 h-20 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Certificat Non Trouvé
              </h2>
              <p className="text-gray-600 mb-6">
                Aucun certificat trouvé avec l'ID : <strong>{certificateId}</strong>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Vérifiez l'orthographe de l'ID ou contactez l'autorité émettrice.
              </p>
              <button
                onClick={() => {
                  setCertificateId('');
                  setVerificationResult(null);
                  setHasSearched(false);
                }}
                className="bg-senegal-green text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Essayer un Autre ID
              </button>
            </div>
          )}
        </div>
      )}

      {/* Informations sur la vérification */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">
          🛡️ Comment fonctionne la vérification ?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <h4 className="font-semibold mb-2">✓ Sécurité Blockchain</h4>
            <p>Chaque certificat est stocké de manière immuable sur la blockchain Polygon</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">⚡ Vérification Instantanée</h4>
            <p>La validation se fait en temps réel sans intermédiaire</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">🌍 Accès Mondial</h4>
            <p>Vérifiable depuis n'importe où dans le monde 24h/24</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">🆓 Totalement Gratuit</h4>
            <p>Aucuns frais pour la vérification des certificats</p>
          </div>
        </div>
      </div>

      {/* Guide d'utilisation */}
      <div className="mt-8 bg-senegal-green/10 border border-senegal-green/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-senegal-green mb-4">
          📖 Guide d'Utilisation
        </h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start">
            <span className="bg-senegal-green text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
            <p>Obtenez l'ID du certificat depuis le document officiel ou le QR code</p>
          </div>
          <div className="flex items-start">
            <span className="bg-senegal-green text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
            <p>Saisissez l'ID dans le champ de recherche ci-dessus</p>
          </div>
          <div className="flex items-start">
            <span className="bg-senegal-green text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
            <p>Cliquez sur "Vérifier" pour valider l'authenticité instantanément</p>
          </div>
          <div className="flex items-start">
            <span className="bg-senegal-green text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">4</span>
            <p>Consultez le résultat détaillé avec toutes les informations du certificat</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPortal;