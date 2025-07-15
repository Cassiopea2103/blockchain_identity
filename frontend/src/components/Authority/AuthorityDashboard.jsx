import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../contexts/Web3Context';
import {
  DocumentPlusIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AuthorityDashboard = () => {
  const { account, isConnected, isAuthorized, getStats } = useWeb3();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCertificates: 0,
    activeCertificates: 0,
    expiredCertificates: 0,
    totalHolders: 0
  });
  const [recentCertificates, setRecentCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isConnected) {
      navigate('/');
      return;
    }

    if (!isAuthorized) {
      toast.error('Accès non autorisé. Seules les autorités peuvent accéder à cette page.');
      navigate('/');
      return;
    }

    loadDashboardData();
  }, [isConnected, isAuthorized, navigate]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Charger les statistiques
      const statsData = await getStats();
      setStats(statsData);
      
      // Simuler le chargement des certificats récents
      // En production, cela viendrait du smart contract
      const mockRecentCertificates = [
        {
          id: 'SN-NAISS-20240315-ABC123',
          type: 'Acte de Naissance',
          holder: 'Amadou Diallo',
          date: new Date().toLocaleDateString('fr-FR'),
          status: 'Actif'
        },
        {
          id: 'SN-DIPL-20240310-DEF456',
          type: 'Diplôme Universitaire',
          holder: 'Fatou Sall',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
          status: 'Actif'
        }
      ];
      
      setRecentCertificates(mockRecentCertificates);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Accès Refusé</h2>
          <p className="text-gray-600 mb-4">
            Vous devez être une autorité autorisée pour accéder à cette page.
          </p>
          <Link
            to="/"
            className="bg-senegal-green text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Certificats',
      value: stats.totalCertificates,
      icon: DocumentTextIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Certificats Actifs',
      value: stats.activeCertificates,
      icon: DocumentPlusIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Certificats Expirés',
      value: stats.expiredCertificates,
      icon: DocumentTextIcon,
      color: 'bg-red-500'
    },
    {
      title: 'Citoyens Enregistrés',
      value: stats.totalHolders,
      icon: UserGroupIcon,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Tableau de Bord des Autorités
            </h1>
            <p className="text-gray-600">
              Gérez les certificats numériques de l'état civil sénégalais
            </p>
          </div>
          <Link
            to="/authority/create"
            className="bg-senegal-green text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <DocumentPlusIcon className="w-5 h-5" />
            <span>Créer un Certificat</span>
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <ChartBarIcon className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              {stat.title}
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? '...' : stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Certificats récents */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Certificats Récents
          </h2>
          <button
            onClick={loadDashboardData}
            className="text-senegal-green hover:text-green-700 transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <ArrowPathIcon className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Chargement des données...</p>
          </div>
        ) : recentCertificates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Titulaire</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentCertificates.map((cert, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-mono text-gray-600">
                      {cert.id}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {cert.type}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {cert.holder}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {cert.date}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {cert.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Aucun certificat émis pour le moment</p>
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Actions Rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/authority/create"
            className="border-2 border-senegal-green text-senegal-green p-6 rounded-lg hover:bg-senegal-green hover:text-white transition-colors text-center"
          >
            <DocumentPlusIcon className="w-8 h-8 mx-auto mb-2" />
            <span className="font-semibold">Créer un Certificat</span>
          </Link>
          <button
            className="border-2 border-gray-300 text-gray-600 p-6 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => toast.info('Fonctionnalité en cours de développement')}
          >
            <ChartBarIcon className="w-8 h-8 mx-auto mb-2" />
            <span className="font-semibold">Voir les Rapports</span>
          </button>
          <button
            className="border-2 border-gray-300 text-gray-600 p-6 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => toast.info('Fonctionnalité en cours de développement')}
          >
            <UserGroupIcon className="w-8 h-8 mx-auto mb-2" />
            <span className="font-semibold">Gérer les Utilisateurs</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;