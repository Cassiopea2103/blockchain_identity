import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

// ABI du smart contract (à copier depuis Remix après compilation)
const CONTRACT_ABI = [
  "function issueCertificate(string _certificateId, string _holderName, string _holderAddress, string _certificateType, string _ipfsHash, uint256 _expiryDate, string _metadata, address _holderWallet) external",
  "function verifyCertificate(string _certificateId) external view returns (bool isValid, string holderName, string certificateType, address issuer, uint256 issueDate, uint256 expiryDate, string ipfsHash)",
  "function getCertificate(string _certificateId) external view returns (tuple(string certificateId, string holderName, string holderAddress, string certificateType, string ipfsHash, address issuer, uint256 issueDate, uint256 expiryDate, bool isValid, string metadata))",
  "function getCertificatesByHolder(address _holder) external view returns (string[])",
  "function addAuthorizedIssuer(address _issuer) external",
  "function isAuthorizedIssuer(address _issuer) external view returns (bool)",
  "function getTotalCertificates() external view returns (uint256)",
  "event CertificateIssued(string indexed certificateId, address indexed holder, address indexed issuer, string certificateType, uint256 issueDate)"
];

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Configuration du réseau
  const CONTRACT_ADDRESS = import.meta.env.REACT_APP_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Adresse par défaut Hardhat

  // Connecter à MetaMask
  const connectWallet = async () => {
    try {
      setIsLoading(true);
      
      if (!window.ethereum) {
        toast.error('MetaMask n\'est pas installé !');
        return;
      }

      // Demander la connexion
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        toast.error('Aucun compte sélectionné');
        return;
      }

      // Créer le provider
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const web3Signer = web3Provider.getSigner();
      const network = await web3Provider.getNetwork();

      // Créer l'instance du contrat
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        web3Signer
      );

      // Vérifier si l'utilisateur est une autorité autorisée
      let authorized = false;
      try {
        authorized = await contractInstance.isAuthorizedIssuer(accounts[0]);
      } catch (error) {
        console.log('Erreur vérification autorisation:', error);
      }

      // Mettre à jour les états
      setAccount(accounts[0]);
      setProvider(web3Provider);
      setSigner(web3Signer);
      setContract(contractInstance);
      setChainId(network.chainId);
      setIsConnected(true);
      setIsAuthorized(authorized);

      toast.success('Wallet connecté avec succès !');
      
    } catch (error) {
      console.error('Erreur connexion wallet:', error);
      toast.error('Erreur lors de la connexion au wallet');
    } finally {
      setIsLoading(false);
    }
  };

  // Déconnecter le wallet
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setIsConnected(false);
    setIsAuthorized(false);
    setChainId(null);
    toast.success('Wallet déconnecté');
  };

  // Créer un certificat
  const createCertificate = async (certificateData) => {
    try {
      if (!contract) {
        throw new Error('Contrat non initialisé');
      }

      if (!isAuthorized) {
        throw new Error('Vous n\'êtes pas autorisé à émettre des certificats');
      }

      setIsLoading(true);

      const tx = await contract.issueCertificate(
        certificateData.certificateId,
        certificateData.holderName,
        certificateData.holderAddress,
        certificateData.certificateType,
        certificateData.ipfsHash,
        certificateData.expiryDate || 0,
        certificateData.metadata || '{}',
        certificateData.holderWallet
      );

      toast.loading('Transaction en cours...', { id: 'create-cert' });
      const receipt = await tx.wait();
      
      toast.success('Certificat créé avec succès !', { id: 'create-cert' });
      return receipt;

    } catch (error) {
      console.error('Erreur création certificat:', error);
      toast.error(`Erreur: ${error.message}`, { id: 'create-cert' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier un certificat
  const verifyCertificate = async (certificateId) => {
    try {
      if (!contract) {
        throw new Error('Contrat non initialisé');
      }

      const result = await contract.verifyCertificate(certificateId);
      
      return {
        isValid: result.isValid,
        holderName: result.holderName,
        certificateType: result.certificateType,
        issuer: result.issuer,
        issueDate: new Date(result.issueDate.toNumber() * 1000),
        expiryDate: result.expiryDate.toNumber() === 0 ? null : new Date(result.expiryDate.toNumber() * 1000),
        ipfsHash: result.ipfsHash
      };

    } catch (error) {
      console.error('Erreur vérification certificat:', error);
      throw error;
    }
  };

  // Obtenir les certificats d'un utilisateur
  const getUserCertificates = async (userAddress = null) => {
    try {
      if (!contract) {
        throw new Error('Contrat non initialisé');
      }

      const address = userAddress || account;
      const certificateIds = await contract.getCertificatesByHolder(address);
      
      const certificates = [];
      for (const id of certificateIds) {
        try {
          const cert = await contract.getCertificate(id);
          certificates.push({
            certificateId: cert.certificateId,
            holderName: cert.holderName,
            holderAddress: cert.holderAddress,
            certificateType: cert.certificateType,
            ipfsHash: cert.ipfsHash,
            issuer: cert.issuer,
            issueDate: new Date(cert.issueDate.toNumber() * 1000),
            expiryDate: cert.expiryDate.toNumber() === 0 ? null : new Date(cert.expiryDate.toNumber() * 1000),
            isValid: cert.isValid,
            metadata: cert.metadata
          });
        } catch (error) {
          console.error(`Erreur récupération certificat ${id}:`, error);
        }
      }

      return certificates;

    } catch (error) {
      console.error('Erreur récupération certificats utilisateur:', error);
      throw error;
    }
  };

  // Obtenir les statistiques
  const getStats = async () => {
    try {
      if (!contract) {
        throw new Error('Contrat non initialisé');
      }

      const totalCertificates = await contract.getTotalCertificates();
      
      return {
        totalCertificates: totalCertificates.toNumber()
      };

    } catch (error) {
      console.error('Erreur récupération statistiques:', error);
      throw error;
    }
  };

  // Écouter les changements de compte
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // Vérifier la connexion au chargement
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          });
          if (accounts.length > 0) {
            await connectWallet();
          }
        } catch (error) {
          console.error('Erreur vérification connexion:', error);
        }
      }
    };

    checkConnection();
  }, []);

  const value = {
    // États
    account,
    provider,
    signer,
    contract,
    isConnected,
    isLoading,
    chainId,
    isAuthorized,
    
    // Méthodes
    connectWallet,
    disconnectWallet,
    createCertificate,
    verifyCertificate,
    getUserCertificates,
    getStats
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Provider;