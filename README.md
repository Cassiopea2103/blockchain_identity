# 🇸🇳 Identité Numérique Sénégalaise - Blockchain

## 📋 Vue d'ensemble

**Système de gestion décentralisée de l'identité numérique pour l'administration sénégalaise**

Ce projet démontre comment la blockchain peut révolutionner la gestion des documents d'état civil au Sénégal, en offrant une solution sécurisée, transparente et accessible pour les citoyens, notamment la diaspora.

### 🎯 Problématiques adressées

- **Accès difficile** : Documents d'état civil difficiles d'accès en zones rurales
- **Fraudes fréquentes** : Falsification de documents courante
- **Diaspora** : Sénégalais à l'étranger ayant besoin de documents officiels
- **Processus longs** : Démarches administratives coûteuses et chronophages
- **Vérification complexe** : Difficultés de validation des documents à l'international

### 💡 Solution blockchain

- ✅ **Immutabilité** : Impossible de falsifier ou modifier les certificats
- ✅ **Décentralisation** : Accès permanent, même si serveurs gouvernementaux indisponibles
- ✅ **Transparence** : Toutes les actions tracées et vérifiables publiquement
- ✅ **Interopérabilité** : Reconnaissance automatique à l'international
- ✅ **Désintermédiation** : Vérification directe sans contacter l'administration

## 🛠️ Architecture technique

### Stack technologique
- **Blockchain** : Ethereum / Hardhat (développement local)
- **Smart Contract** : Solidity ^0.8.19
- **Frontend** : React + Vite + Tailwind CSS
- **Web3** : Ethers.js v6
- **Wallet** : MetaMask
- **QR Code** : qrcode.js
- **Stockage** : IPFS 
- **IDE** : Remix pour déploiement

### Composants principaux

#### 1. **Smart Contract** (`IdentityRegistry.sol`)
- Gestion des certificats numériques
- Contrôle d'accès pour les autorités
- Événements pour traçabilité
- Fonctions de vérification

#### 2. **Application Web React**
- Interface autorités (création certificats)
- Interface citoyens (consultation documents)
- Système de vérification QR code
- Connexion MetaMask

#### 3. **Système de stockage**
- Métadonnées sur blockchain
- Documents PDF sur IPFS (simulé)
- QR codes pour vérification rapide

## 🚀 Installation et démarrage

### Prérequis

- **Node.js** 18+ et npm
- **MetaMask** installé dans le navigateur
- **Git**

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/identite-numerique-senegal.git
cd identite-numerique-senegal
```

### 2. Installation des dépendances

```bash
# Frontend
cd frontend
npm install

# Smart contracts (si nécessaire)
npm install --save-dev hardhat
```

### 3. Configuration de l'environnement

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Éditer les variables d'environnement
nano .env
```

### 4. Démarrage de la blockchain locale

```bash
# Dans le dossier frontend
npx hardhat node
```

### 5. Configuration MetaMask

**Ajouter réseau local :**
- **Nom** : Hardhat Local
- **RPC URL** : `http://127.0.0.1:8545`
- **Chain ID** : `31337`
- **Devise** : `ETH`

**Importer compte :**
- Copier une clé privée depuis Hardhat
- MetaMask → Importer compte → Coller la clé

### 6. Déploiement du contrat

1. Ouvrir **Remix IDE** (remix.ethereum.org)
2. Charger `contracts/IdentityRegistry.sol`
3. Compiler le contrat
4. Connecter Remix à MetaMask ("Injected Provider")
5. Déployer sur le réseau local
6. Copier l'adresse du contrat déployé

### 7. Configuration du frontend

```bash
# Mettre à jour .env avec l'adresse du contrat
VITE_CONTRACT_ADDRESS=0xVotreAdresseDeContrat

# Démarrer l'application
npm run dev
```

## 🎬 Workflows et démonstration

### 🏛️ **Workflow 1 : Création de certificat (Autorité)**

#### Étape 1 : Connexion autorité
1. **Ouvrir l'application** → `http://localhost:5173`
2. **Cliquer "Connect Wallet"** → MetaMask s'ouvre
3. **Confirmer la connexion** → Statut "Connecté" affiché
4. **Vérification automatique** → Badge "Autorité" si compte autorisé

#### Étape 2 : Accès portail autorité
1. **Navigation** → Cliquer "Autorités" dans le menu
2. **Vérification d'accès** → Page accessible uniquement aux comptes autorisés
3. **Interface de création** → Formulaire de certificat affiché

#### Étape 3 : Création du certificat
1. **Remplir le formulaire** :
   ```
   Nom du titulaire : Amadou Diallo
   Type : Acte de Naissance
   Adresse physique : Dakar, Sénégal
   Adresse wallet : 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
   ```

2. **Informations complémentaires** :
   ```
   Lieu : Hôpital Principal Dakar
   Date : 15/05/1990
   Détails : Certificat de naissance officiel
   ```

3. **Cliquer "Créer le Certificat"**
4. **Confirmer transaction** dans MetaMask
5. **Attendre confirmation** → Notification de succès
6. **QR Code généré** → Code affiché pour vérification

#### Résultat workflow 1
- ✅ Certificat enregistré sur blockchain
- ✅ Transaction confirmée et immuable
- ✅ QR code généré pour vérification
- ✅ Événement émis pour traçabilité

---

### 👤 **Workflow 2 : Consultation citoyenne**

#### Étape 1 : Connexion du détenteur
1. **Changer de compte** dans MetaMask
2. **Sélectionner le compte détenteur** (0x7099...)
3. **Actualiser la page** → Reconnexion automatique
4. **Vérifier l'adresse** affichée dans l'interface

#### Étape 2 : Accès aux certificats
1. **Navigation** → Cliquer "Mes Certificats"
2. **Chargement automatique** → Récupération depuis blockchain
3. **Liste affichée** → Certificats du détenteur visibles

#### Étape 3 : Consultation des détails
1. **Visualisation** → Carte de certificat avec :
   - ID unique du certificat
   - Type et informations
   - Date d'émission
   - Statut (Actif/Révoqué)
   - Adresse de l'émetteur

2. **Actions disponibles** :
   - **QR Code** → Génération pour partage
   - **Télécharger** → Accès document IPFS
   - **Vérifier** → Contrôle authenticité

#### Résultat workflow 2
- ✅ Accès sécurisé aux documents personnels
- ✅ Données récupérées en temps réel
- ✅ Interface intuitive et informative
- ✅ Contrôle total par le détenteur

---

### 🔍 **Workflow 3 : Vérification par tiers**

#### Étape 1 : Accès vérification
1. **Navigation** → Cliquer "Vérification"
2. **Interface publique** → Accessible sans connexion wallet
3. **Champ de saisie** → ID certificat requis

#### Étape 2 : Vérification manuelle
1. **Saisir l'ID** → Ex: `SN-ACTE-20250715-ABC123`
2. **Cliquer "Vérifier"**
3. **Appel smart contract** → Vérification blockchain
4. **Résultat affiché** → Statut et détails

#### Étape 3 : Vérification QR Code
1. **Scanner QR** → Depuis certificat physique/numérique
2. **Redirection automatique** → Vers page vérification
3. **ID extrait** → Vérification automatique
4. **Résultat instantané** → Authentique ou invalide

#### Cas d'usage réel
**Scénario** : Sénégalais en France présente son diplôme
1. **Employeur scanne QR** sur le document
2. **Vérification instantanée** via blockchain
3. **Confirmation authenticité** sans contact université
4. **Décision immédiate** basée sur preuve cryptographique

#### Résultat workflow 3
- ✅ Vérification instantanée et gratuite
- ✅ Aucun intermédiaire requis
- ✅ Preuve cryptographique solide
- ✅ Réduction drastique des fraudes

---

### 🔄 **Workflow 4 : Gestion administrative**

#### Étape 1 : Monitoring autorité
1. **Tableau de bord** → Statistiques en temps réel
2. **Certificats émis** → Nombre total visible
3. **Activité récente** → Dernières créations

#### Étape 2 : Gestion des accès
1. **Ajouter autorité** → Nouvelle adresse autorisée
2. **Révocation certificat** → Invalidation si nécessaire
3. **Audit trail** → Historique complet des actions

#### Étape 3 : Intégration systèmes
1. **API publique** → Vérification automatisée
2. **Webhooks** → Notifications en temps réel
3. **Export données** → Rapports administratifs

## 📊 Démonstration live - Script

### 🎯 **Introduction (5 min)**


1. **Problème actuel** :
   - Montrer statistiques fraudes documents
   - Cas diaspora : "3 semaines pour vérifier un diplôme"
   - Coûts administratifs élevés

2. **Solution proposée** :
   - Blockchain = registre immuable
   - Vérification instantanée
   - Accessibilité mondiale

### 🏛️ **Démo 1 : Autorité crée certificat (10 min)**

**"Simulons une mairie qui émet un acte de naissance"**

1. **Se connecter comme autorité** :
   ```
   "Je me connecte avec mon wallet d'autorité officielle"
   → Montrer badge "Autorité" affiché
   ```

2. **Créer le certificat** :
   ```
   "Pour le citoyen Amadou Diallo, né à Dakar"
   → Remplir formulaire en live
   → Expliquer chaque champ
   ```

3. **Transaction blockchain** :
   ```
   "La signature cryptographique prouve l'authenticité"
   → Montrer MetaMask
   → Expliquer gas fees et sécurité
   ```

4. **QR Code généré** :
   ```
   "Ce QR code permet vérification instantanée"
   → Montrer le code généré
   → Expliquer utilisation mobile
   ```

### 👤 **Démo 2 : Citoyen consulte documents (5 min)**

**"Maintenant, le citoyen accède à ses documents"**

1. **Changer de compte** :
   ```
   "Je passe au wallet du citoyen"
   → Montrer changement MetaMask
   → Expliquer contrôle d'accès
   ```

2. **Voir ses certificats** :
   ```
   "Tous ses documents officiels, sécurisés"
   → Navigation vers "Mes Certificats"
   → Montrer données temps réel
   ```

3. **Avantages citoyens** :
   ```
   - Accès 24/7 depuis n'importe où
   - Aucun risque de perte/vol
   - Partage sécurisé via QR
   ```

### 🔍 **Démo 3 : Vérification tiers (5 min)**

**"Un employeur en France vérifie le diplôme"**

1. **Vérification publique** :
   ```
   "Aucune connexion wallet nécessaire"
   → Montrer interface vérification
   → Saisir ID certificat
   ```

2. **Résultat instantané** :
   ```
   "Authentique ! Émis par l'Université de Dakar"
   → Montrer détails retournés
   → Expliquer preuve cryptographique
   ```

3. **Impact révolutionnaire** :
   ```
   Avant : 3 semaines + coûts + risques
   Après : 10 secondes + gratuit + sûr
   ```

### 📈 **Conclusion et impact (5 min)**

1. **Bénéfices économiques** :
   - Réduction 90% coûts vérification
   - Élimination fraudes documentaires
   - Accélération procédures administratives

2. **Impact social** :
   - Inclusion diaspora sénégalaise
   - Égalité d'accès aux services
   - Transparence gouvernementale

3. **Roadmap implémentation** :
   - Phase pilote : 3 mairies
   - Déploiement national : 12 mois
   - Intégration internationale : 24 mois

## 🔧 Configuration avancée

### Variables d'environnement

```bash
# .env
VITE_CONTRACT_ADDRESS=0xYourContractAddress
VITE_NETWORK_NAME=Hardhat Local
VITE_CHAIN_ID=31337
VITE_RPC_URL=http://127.0.0.1:8545

# IPFS (optionnel)
VITE_PINATA_API_KEY=your_pinata_key
VITE_PINATA_SECRET=your_pinata_secret
```

### Smart Contract ABI

Le contrat expose ces fonctions principales :

```solidity
// Création certificat (autorités seulement)
function issueCertificate(
    string _certificateId,
    string _holderName,
    string _holderAddress,
    string _certificateType,
    string _ipfsHash,
    uint256 _expiryDate,
    string _metadata,
    address _holderWallet
) external

// Vérification publique
function verifyCertificate(string _certificateId) 
    external view returns (
        bool isValid,
        string holderName,
        string certificateType,
        address issuer,
        uint256 issueDate,
        uint256 expiryDate,
        string ipfsHash
    )

// Récupération certificats détenteur
function getCertificatesByHolder(address _holder) 
    external view returns (string[] memory)
```

## 🧪 Tests et débogage

### Tests unitaires

```bash
# Tester le smart contract
npx hardhat test

# Tester l'interface
npm run test
```

### Debugging courant

1. **MetaMask non connecté** :
   ```bash
   Erreur : "MetaMask n'est pas installé"
   Solution : Installer extension et connecter réseau local
   ```

2. **Transaction échoue** :
   ```bash
   Erreur : "Transaction reverted"
   Solution : Vérifier autorisation et gas fees
   ```

3. **Contrat non trouvé** :
   ```bash
   Erreur : "Contract address invalid"
   Solution : Redéployer et mettre à jour .env
   ```

### Logs utiles

```javascript
// Console du navigateur
console.log('Account:', account);
console.log('Contract:', contract);
console.log('Network:', network);

// Hardhat node
eth_sendTransaction
Transaction: 0x...
Gas usage: 150000
Block Number: 2
```

## 🚢 Déploiement production

### Testnets recommandés

1. **Polygon Mumbai** (recommandé)
   - Gas fees très bas
   - Compatibilité Ethereum
   - Faucets disponibles

2. **Ethereum Sepolia**
   - Testnet officiel
   - Large adoption
   - Outils développeur

### Configuration production

```bash
# .env.production
VITE_CONTRACT_ADDRESS=0xProductionAddress
VITE_NETWORK_NAME=Polygon Mumbai
VITE_CHAIN_ID=80001
VITE_RPC_URL=https://rpc-mumbai.maticvigil.com
```


### Structure du projet

```
identite-numerique-senegal/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Authority/
│   │   │   ├── Citizen/
│   │   │   ├── Common/
│   │   │   └── Verification/
│   │   ├── contexts/
│   │   └── utils/
│   ├── public/
│   └── package.json
├── contracts/
│   └── IdentityRegistry.sol
├── docs/
└── README.md
```

## 📄 Licence

MIT License - Voir [LICENSE](LICENSE) pour détails.

