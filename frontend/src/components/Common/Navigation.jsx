import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../../contexts/Web3Context';
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  UserIcon, 
  ShieldCheckIcon,
  QrCodeIcon,
  Bars3Icon,
  XMarkIcon,
  WalletIcon
} from '@heroicons/react/24/outline';

const Navigation = () => {
  const { 
    account, 
    isConnected, 
    isAuthorized, 
    connectWallet, 
    disconnectWallet, 
    isLoading 
  } = useWeb3();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // DEBUG LOGS - Add these at the top
  console.log('🔍 Navigation render - connectWallet type:', typeof connectWallet);
  console.log('🔍 Navigation render - connectWallet function:', connectWallet);
  console.log('🔍 Navigation render - isConnected:', isConnected);
  console.log('🔍 Navigation render - isLoading:', isLoading);
  console.log('🔍 Navigation render - account:', account);

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const navigationItems = [
    {
      name: 'Accueil',
      href: '/',
      icon: HomeIcon,
      current: isActivePath('/')
    },
    {
      name: 'Autorités',
      href: '/authority',
      icon: BuildingOfficeIcon,
      current: isActivePath('/authority'),
      requiresAuth: true
    },
    {
      name: 'Mes Certificats',
      href: '/citizen',
      icon: UserIcon,
      current: isActivePath('/citizen')
    },
    {
      name: 'Vérification',
      href: '/verify',
      icon: ShieldCheckIcon,
      current: isActivePath('/verify')
    },
    {
      name: 'Scanner QR',
      href: '/scan',
      icon: QrCodeIcon,
      current: isActivePath('/scan')
    }
  ];

  // DEBUG FUNCTION for testing
  const debugConnectWallet = async () => {
    console.log('🟢 DEBUG Button Clicked - Starting comprehensive debug');
    console.log('🔍 isConnected:', isConnected);
    console.log('🔍 isLoading:', isLoading);
    console.log('🔍 connectWallet type:', typeof connectWallet);
    console.log('🔍 connectWallet function:', connectWallet);
    
    // Check if function exists
    if (typeof connectWallet !== 'function') {
      console.error('❌ connectWallet is not a function!');
      console.log('🔍 Available Web3 context:', useWeb3());
      alert('connectWallet is not a function! Check Web3Context.');
      return;
    }

    // Check if MetaMask is available
    if (!window.ethereum) {
      console.error('❌ MetaMask not found');
      alert('MetaMask not detected! Please install MetaMask extension.');
      return;
    }

    console.log('✅ MetaMask detected:', window.ethereum);
    
    // Check if already connecting
    if (isLoading) {
      console.warn('⚠️ Already connecting...');
      return;
    }

    // Try to call the function
    try {
      console.log('🔄 Calling connectWallet...');
      await connectWallet();
      console.log('✅ connectWallet completed successfully');
    } catch (error) {
      console.error('❌ Error in connectWallet:', error);
      console.error('Error stack:', error.stack);
      alert('Error connecting wallet: ' + error.message);
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b-4 border-senegal-green">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo et titre */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-senegal-green rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">🇸🇳</span>
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-gray-800">
                  Identité Numérique SN
                </h1>
                <p className="text-xs text-gray-600">
                  Blockchain pour l'administration
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              // Masquer les éléments nécessitant une autorisation si pas autorisé
              if (item.requiresAuth && !isAuthorized) {
                return null;
              }

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${item.current 
                      ? 'bg-senegal-green text-white' 
                      : 'text-gray-600 hover:text-senegal-green hover:bg-gray-100'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                  {item.requiresAuth && isAuthorized && (
                    <span className="text-xs bg-senegal-yellow text-senegal-green px-1 rounded">
                      AUTH
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Wallet connection - SIMPLE TEST FIRST */}
          <div className="flex items-center space-x-4">
            {!isConnected ? (
              <button
                onClick={() => {
                  console.log('🚀 BUTTON CLICKED!');
                  connectWallet();
                }}
                className="flex items-center space-x-2 bg-senegal-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <WalletIcon className="w-5 h-5" />
                <span>Connect Wallet</span>
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Statut autorité */}
                {isAuthorized && (
                  <span className="hidden md:inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-senegal-yellow text-senegal-green">
                    <BuildingOfficeIcon className="w-4 h-4 mr-1" />
                    Autorité
                  </span>
                )}
                
                {/* Adresse du compte */}
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-800">
                    {formatAddress(account)}
                  </span>
                  <span className="text-xs text-gray-500">
                    Connecté
                  </span>
                </div>
                
                {/* Bouton déconnexion */}
                <button
                  onClick={disconnectWallet}
                  className="text-gray-600 hover:text-red-600 transition-colors"
                  title="Déconnecter"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Menu mobile button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => {
              if (item.requiresAuth && !isAuthorized) {
                return null;
              }

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors
                    ${item.current 
                      ? 'bg-senegal-green text-white' 
                      : 'text-gray-600 hover:text-senegal-green hover:bg-gray-100'
                    }
                  `}
                >
                  <item.icon className="w-6 h-6" />
                  <span>{item.name}</span>
                  {item.requiresAuth && isAuthorized && (
                    <span className="text-xs bg-senegal-yellow text-senegal-green px-2 py-1 rounded">
                      AUTORITÉ
                    </span>
                  )}
                </Link>
              );
            })}
            
            {/* Wallet info mobile */}
            {isConnected && (
              <div className="px-3 py-2 border-t border-gray-200 mt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {formatAddress(account)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isAuthorized ? 'Autorité connectée' : 'Citoyen connecté'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      disconnectWallet();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Mobile connect button if not connected */}
            {!isConnected && (
              <div className="px-3 py-2 border-t border-gray-200 mt-2">
                <button
                  onClick={() => {
                    debugConnectWallet();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-senegal-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  <WalletIcon className="w-5 h-5" />
                  <span>{isLoading ? 'Connecting...' : 'Connecter Wallet [DEBUG]'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;