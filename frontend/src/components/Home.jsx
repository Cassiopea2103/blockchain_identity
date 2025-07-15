// src/components/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import {
  BuildingOfficeIcon,
  UserIcon,
  ShieldCheckIcon,
  QrCodeIcon,
  DocumentCheckIcon,
  GlobeAltIcon,
  LockClosedIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const { isConnected, isAuthorized, getStats } = useWeb3();
  const [stats, setStats] = useState({ totalCertificates: 0 });

  useEffect(() => {
    const loadStats = async () => {
      try {
        if (isConnected) {
          const data = await getStats();
          setStats(data);
        }
      } catch (error) {
        console.error('Erreur chargement statistiques:', error);
      }
    };

    loadStats();
  }, [isConnected, getStats]);

  const features = [
    {
      icon: LockClosedIcon,
      title: 'Sécurité Blockchain',
      description: 'Documents infalsifiables grâce à la technologie blockchain décentralisée'
    },
    {
      icon: GlobeAltIcon,
      title: 'Accès International',
      description: 'Vérification instantanée depuis n\'importe où dans le monde pour la diaspora'
    },
    {
      icon: DocumentCheckIcon,
      title: 'Vérification Instantanée',
      description: 'Scanner QR pour vérifier l\'authenticité en quelques secondes'
    },
    {
      icon: ChartBarIcon,
      title: 'Réduction des Coûts',
      description: 'Économies massives par rapport aux processus administratifs traditionnels'
    }
  ];

  const portals = [
    {
      title: 'Portail des Autorités',
      description: 'Créer et gérer les certificats officiels',
      icon: BuildingOfficeIcon,
      link: '/authority',
      color: 'senegal-green',
      requiresAuth: true,
      available: isAuthorized
    },
    {
      title: 'Mes Certificats',
      description: 'Consulter vos documents personnels',
      icon: UserIcon,
      link: '/citizen',
      color: 'blue-600',
      requiresAuth: false,
      available: isConnected
    },
    {
      title: 'Vérification',
      description: 'Vérifier l\'authenticité d\'un certificat',
      icon: ShieldCheckIcon,
      link: '/verify',
      color: 'purple-600',
      requiresAuth: false,
      available: true
    },
    {
      title: 'Scanner QR',
      description: 'Scanner un QR code pour vérification',
      icon: QrCodeIcon,
      link: '/scan',
      color: 'orange-600',
      requiresAuth: false,
      available: true
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 bg-slate-500 text-white rounded-2xl">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-6">
            🇸🇳 Identité Numérique Sénégalaise
          </h1>
          <p className="text-xl mb-8 text-green-100">
            Système de gestion décentralisée des documents d'état civil sur blockchain
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/verify"
              className="bg-senegal-yellow text-senegal-green px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
            >
              Vérifier un Certificat
            </Link>
            {!isConnected && (
              <button
                onClick={() => window.location.reload()}
                className="bg-white text-senegal-green px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Connecter Wallet
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Statistiques */}
      {isConnected && (
        <section className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
            📊 Statistiques du Système
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-senegal-green/10 rounded-lg">
              <div className="text-3xl font-bold text-senegal-green">
                {stats.totalCertificates}
              </div>
              <div className="text-gray-600">Certificats émis</div>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">100%</div>
              <div className="text-gray-600">Sécurité blockchain</div>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">24/7</div>
              <div className="text-gray-600">Accès disponible</div>
            </div>
          </div>
        </section>
      )}

      {/* Portails d'accès */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          🚪 Portails d'Accès
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portals.map((portal, index) => (
            <div key={index} className="relative">
              {portal.available ? (
                <Link
                  to={portal.link}
                  className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 bg-${portal.color} rounded-lg flex items-center justify-center mb-4`}>
                    <portal.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-800">
                    {portal.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {portal.description}
                  </p>
                  {portal.requiresAuth && (
                    <span className="inline-block mt-2 px-2 py-1 bg-senegal-yellow text-senegal-green text-xs rounded">
                      Autorité requise
                    </span>
                  )}
                </Link>
              ) : (
                <div className="p-6 bg-gray-100 rounded-xl shadow opacity-50">
                  <div className="w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center mb-4">
                    <portal.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-500">
                    {portal.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {portal.description}
                  </p>
                  <span className="inline-block mt-2 px-2 py-1 bg-gray-300 text-gray-600 text-xs rounded">
                    {portal.requiresAuth ? 'Autorisation requise' : 'Connexion requise'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="bg-gray-50 p-8 rounded-xl">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          ✨ Avantages de la Blockchain
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-senegal-green rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-3 text-gray-800">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Problèmes résolus */}
      <section className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          🎯 Problèmes Résolus
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-red-600">
              ❌ Avant (Système Papier)
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Fraudes et falsifications fréquentes</li>
              <li>• Accès difficile en zones rurales</li>
              <li>• Processus longs et coûteux</li>
              <li>• Vérification impossible à l'étranger</li>
              <li>• Documents perdus ou détériorés</li>
              <li>• Corruption et intermédiaires</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 text-senegal-green">
              ✅ Maintenant (Blockchain)
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Documents infalsifiables et sécurisés</li>
              <li>• Accès 24/7 depuis n'importe où</li>
              <li>• Vérification instantanée et gratuite</li>
              <li>• Reconnaissance internationale automatique</li>
              <li>• Stockage permanent et décentralisé</li>
              <li>• Transparence totale du processus</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="text-center py-12 bg-gradient-to-t bg-slate-900 to bg-cyan-200 rounded-xl">
        <h2 className="text-3xl font-bold mb-4 text-senegal-green">
          🚀 Prêt à découvrir l'avenir de l'administration ?
        </h2>
        <p className="text-senegal-green mb-8 max-w-2xl mx-auto">
          Explorez notre système révolutionnaire qui transforme la gestion 
          des documents officiels au Sénégal grâce à la blockchain.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/verify"
            className="bg-senegal-green text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Tester la Vérification
          </Link>
          <Link
            to="/scan"
            className="bg-white text-senegal-green px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Scanner un QR Code
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;