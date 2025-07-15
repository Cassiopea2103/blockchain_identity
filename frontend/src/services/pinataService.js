// frontend/src/services/pinataService.js

import axios from 'axios';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET = import.meta.env.VITE_PINATA_SECRET;
const PINATA_BASE_URL = 'https://api.pinata.cloud';

// Configuration axios pour Pinata
const pinataAxios = axios.create({
  baseURL: PINATA_BASE_URL,
  headers: {
    'pinata_api_key': PINATA_API_KEY,
    'pinata_secret_api_key': PINATA_SECRET,
  }
});

/**
 * Upload un fichier vers IPFS via Pinata
 * @param {File} file - Fichier à uploader
 * @param {string} name - Nom du fichier sur IPFS
 * @returns {Promise<string>} Hash IPFS du fichier
 */
export const uploadFileToIPFS = async (file, name) => {
  try {
    console.log('📤 Upload vers IPFS:', name);
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Métadonnées du fichier
    const metadata = JSON.stringify({
      name: name,
      keyvalues: {
        type: 'certificate',
        uploadDate: new Date().toISOString(),
        originalName: file.name
      }
    });
    formData.append('pinataMetadata', metadata);
    
    // Options Pinata
    const options = JSON.stringify({
      cidVersion: 0,  // Version IPFS
    });
    formData.append('pinataOptions', options);
    
    const response = await pinataAxios.post('/pinning/pinFileToIPFS', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      maxContentLength: 'Infinity', // Pas de limite taille
    });
    
    const ipfsHash = response.data.IpfsHash;
    console.log('✅ Fichier uploadé sur IPFS:', ipfsHash);
    
    return ipfsHash;
    
  } catch (error) {
    console.error('❌ Erreur upload IPFS:', error);
    throw new Error(`Erreur upload IPFS: ${error.message}`);
  }
};

/**
 * Upload des données JSON vers IPFS
 * @param {Object} data - Données à uploader
 * @param {string} name - Nom du fichier JSON
 * @returns {Promise<string>} Hash IPFS
 */
export const uploadJSONToIPFS = async (data, name) => {
  try {
    console.log('📤 Upload JSON vers IPFS:', name);
    
    const response = await pinataAxios.post('/pinning/pinJSONToIPFS', data, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Métadonnées
      'pinataMetadata': JSON.stringify({
        name: name,
        keyvalues: {
          type: 'metadata',
          uploadDate: new Date().toISOString()
        }
      }),
      'pinataOptions': JSON.stringify({
        cidVersion: 0,
      })
    });
    
    const ipfsHash = response.data.IpfsHash;
    console.log('✅ JSON uploadé sur IPFS:', ipfsHash);
    
    return ipfsHash;
    
  } catch (error) {
    console.error('❌ Erreur upload JSON IPFS:', error);
    throw new Error(`Erreur upload JSON IPFS: ${error.message}`);
  }
};

/**
 * Récupérer un fichier depuis IPFS
 * @param {string} ipfsHash - Hash IPFS du fichier
 * @returns {Promise<string>} URL d'accès au fichier
 */
export const getIPFSUrl = (ipfsHash) => {
  // Gateway Pinata (plus rapide)
  return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
  
  // Alternative: Gateway public IPFS
  // return `https://ipfs.io/ipfs/${ipfsHash}`;
};

/**
 * Vérifier la connectivité Pinata
 * @returns {Promise<boolean>} True si Pinata est accessible
 */
export const testPinataConnection = async () => {
  try {
    const response = await pinataAxios.get('/data/testAuthentication');
    console.log('✅ Pinata connecté:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Erreur connexion Pinata:', error);
    return false;
  }
};

/**
 * Lister les fichiers uploadés
 * @returns {Promise<Array>} Liste des fichiers
 */
export const listPinataFiles = async () => {
  try {
    const response = await pinataAxios.get('/data/pinList?status=pinned');
    return response.data.rows;
  } catch (error) {
    console.error('❌ Erreur listing Pinata:', error);
    throw error;
  }
};

/**
 * Supprimer un fichier de Pinata
 * @param {string} ipfsHash - Hash du fichier à supprimer
 * @returns {Promise<boolean>} True si supprimé
 */
export const unpinFile = async (ipfsHash) => {
  try {
    await pinataAxios.delete(`/pinning/unpin/${ipfsHash}`);
    console.log('🗑️ Fichier supprimé de Pinata:', ipfsHash);
    return true;
  } catch (error) {
    console.error('❌ Erreur suppression Pinata:', error);
    return false;
  }
};