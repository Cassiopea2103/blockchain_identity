import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './contexts/Web3Context';

// Import des composants
import Navigation from './components/Common/Navigation';
import Home from './components/Home';
import AuthorityDashboard from './components/Authority/AuthorityDashboard';
import CreateCertificate from './components/Authority/CreateCertificate';
import CitizenDashboard from './components/Citizen/CitizenDashboard';
import VerificationPortal from './components/Verification/VerificationPortal';
import QRScanner from './components/Verification/QRScanner';

// Import des styles
import './App.css';

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* Navigation */}
          <Navigation />
          
          {/* Contenu principal */}
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* Page d'accueil */}
              <Route path="/" element={<Home />} />
              
              {/* Portail des autorités */}
              <Route path="/authority" element={<AuthorityDashboard />} />
              <Route path="/authority/create" element={<CreateCertificate />} />
              
              {/* Portail des citoyens */}
              <Route path="/citizen" element={<CitizenDashboard />} />
              
              {/* Portail de vérification */}
              <Route path="/verify" element={<VerificationPortal />} />
              <Route path="/scan" element={<QRScanner />} />
            </Routes>
          </main>
          
          {/* Footer */}
          <footer className="bg-senegal-green text-white py-8 mt-16">
            <div className="container mx-auto px-4 text-center">
              <h3 className="text-xl font-bold mb-2">
                🇸🇳 République du Sénégal
              </h3>
              <p className="text-senegal-yellow">
                Système de Gestion Décentralisée de l'Identité Numérique
              </p>
              <p className="text-sm mt-4 opacity-75">
                Projet académique - Blockchain pour l'administration sénégalaise
              </p>
            </div>
          </footer>
        </div>
        
        {/* Notifications toast */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#009639',
              },
            },
            error: {
              style: {
                background: '#CE1126',
              },
            },
          }}
        />
      </Router>
    </Web3Provider>
  );
}

export default App;