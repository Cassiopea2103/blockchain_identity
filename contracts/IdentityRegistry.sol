// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IdentityRegistry
 * @dev Système de gestion décentralisée de l'identité numérique pour l'administration sénégalaise
 * @author Votre Équipe
 */
contract IdentityRegistry {
    
    // ============ STRUCTURES ============
    
    struct Certificate {
        string certificateId;      // ID unique du certificat
        string holderName;         // Nom du détenteur
        string holderAddress;      // Adresse du détenteur
        string certificateType;    // Type (naissance, diplôme, etc.)
        string ipfsHash;          // Hash IPFS du document PDF
        address issuer;           // Autorité émettrice
        uint256 issueDate;        // Date d'émission (timestamp)
        uint256 expiryDate;       // Date d'expiration (0 si permanent)
        bool isValid;             // Statut de validité
        string metadata;          // Métadonnées JSON additionnelles
    }
    
    // ============ VARIABLES D'ÉTAT ============
    
    address public owner;                                    // Propriétaire du contrat (gouvernement)
    uint256 public certificateCounter;                      // Compteur de certificats
    
    mapping(address => bool) public authorizedIssuers;      // Autorités autorisées
    mapping(string => Certificate) public certificates;     // Certificats par ID
    mapping(address => string[]) public holderCertificates; // Certificats par détenteur
    mapping(string => bool) public usedCertificateIds;     // IDs utilisés (éviter doublons)
    
    // ============ ÉVÉNEMENTS ============
    
    event CertificateIssued(
        string indexed certificateId,
        address indexed holder,
        address indexed issuer,
        string certificateType,
        uint256 issueDate
    );
    
    event CertificateRevoked(
        string indexed certificateId,
        address indexed revoker,
        uint256 revokeDate,
        string reason
    );
    
    event IssuerAdded(address indexed issuer, address indexed addedBy);
    event IssuerRemoved(address indexed issuer, address indexed removedBy);
    
    // ============ MODIFIEURS ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Seul le proprietaire peut executer cette action");
        _;
    }
    
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Emetteur non autorise");
        _;
    }
    
    modifier certificateExists(string memory _certificateId) {
        require(usedCertificateIds[_certificateId], "Certificat inexistant");
        _;
    }
    
    // ============ CONSTRUCTEUR ============
    
    constructor() {
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true; // Le déployeur est automatiquement autorisé
        certificateCounter = 0;
    }
    
    // ============ FONCTIONS PRINCIPALES ============
    
    /**
     * @dev Émettre un nouveau certificat
     */
    function issueCertificate(
        string memory _certificateId,
        string memory _holderName,
        string memory _holderAddress,
        string memory _certificateType,
        string memory _ipfsHash,
        uint256 _expiryDate,
        string memory _metadata,
        address _holderWallet
    ) external onlyAuthorizedIssuer {
        
        // Vérifications
        require(!usedCertificateIds[_certificateId], "ID de certificat deja utilise");
        require(bytes(_certificateId).length > 0, "ID de certificat requis");
        require(bytes(_holderName).length > 0, "Nom du detenteur requis");
        require(bytes(_ipfsHash).length > 0, "Hash IPFS requis");
        
        // Création du certificat
        Certificate memory newCertificate = Certificate({
            certificateId: _certificateId,
            holderName: _holderName,
            holderAddress: _holderAddress,
            certificateType: _certificateType,
            ipfsHash: _ipfsHash,
            issuer: msg.sender,
            issueDate: block.timestamp,
            expiryDate: _expiryDate,
            isValid: true,
            metadata: _metadata
        });
        
        // Stockage
        certificates[_certificateId] = newCertificate;
        usedCertificateIds[_certificateId] = true;
        holderCertificates[_holderWallet].push(_certificateId);
        certificateCounter++;
        
        // Événement
        emit CertificateIssued(
            _certificateId,
            _holderWallet,
            msg.sender,
            _certificateType,
            block.timestamp
        );
    }
    
    /**
     * @dev Vérifier un certificat
     */
    function verifyCertificate(string memory _certificateId) 
        external 
        view 
        certificateExists(_certificateId)
        returns (
            bool isValid,
            string memory holderName,
            string memory certificateType,
            address issuer,
            uint256 issueDate,
            uint256 expiryDate,
            string memory ipfsHash
        ) 
    {
        Certificate memory cert = certificates[_certificateId];
        
        // Vérifier si le certificat est encore valide
        bool stillValid = cert.isValid && 
                         (cert.expiryDate == 0 || block.timestamp <= cert.expiryDate);
        
        return (
            stillValid,
            cert.holderName,
            cert.certificateType,
            cert.issuer,
            cert.issueDate,
            cert.expiryDate,
            cert.ipfsHash
        );
    }
    
    /**
     * @dev Obtenir un certificat complet
     */
    function getCertificate(string memory _certificateId) 
        external 
        view 
        certificateExists(_certificateId)
        returns (Certificate memory) 
    {
        return certificates[_certificateId];
    }
    
    /**
     * @dev Obtenir tous les certificats d'un détenteur
     */
    function getCertificatesByHolder(address _holder) 
        external 
        view 
        returns (string[] memory) 
    {
        return holderCertificates[_holder];
    }
    
    /**
     * @dev Révoquer un certificat
     */
    function revokeCertificate(string memory _certificateId, string memory _reason) 
        external 
        onlyAuthorizedIssuer 
        certificateExists(_certificateId) 
    {
        Certificate storage cert = certificates[_certificateId];
        require(cert.issuer == msg.sender || msg.sender == owner, 
                "Seul l'emetteur ou le proprietaire peut revoquer");
        
        cert.isValid = false;
        
        emit CertificateRevoked(_certificateId, msg.sender, block.timestamp, _reason);
    }
    
    // ============ GESTION DES AUTORITÉS ============
    
    /**
     * @dev Ajouter une autorité émettrice
     */
    function addAuthorizedIssuer(address _issuer) external onlyOwner {
        require(_issuer != address(0), "Adresse invalide");
        require(!authorizedIssuers[_issuer], "Emetteur deja autorise");
        
        authorizedIssuers[_issuer] = true;
        emit IssuerAdded(_issuer, msg.sender);
    }
    
    /**
     * @dev Retirer une autorité émettrice
     */
    function removeAuthorizedIssuer(address _issuer) external onlyOwner {
        require(authorizedIssuers[_issuer], "Emetteur non autorise");
        require(_issuer != owner, "Impossible de retirer le proprietaire");
        
        authorizedIssuers[_issuer] = false;
        emit IssuerRemoved(_issuer, msg.sender);
    }
    
    /**
     * @dev Vérifier si une adresse est autorisée
     */
    function isAuthorizedIssuer(address _issuer) external view returns (bool) {
        return authorizedIssuers[_issuer];
    }
    
    // ============ FONCTIONS D'INFORMATION ============
    
    /**
     * @dev Obtenir le nombre total de certificats
     */
    function getTotalCertificates() external view returns (uint256) {
        return certificateCounter;
    }
    
    /**
     * @dev Vérifier si un ID de certificat existe
     */
    function certificateIdExists(string memory _certificateId) external view returns (bool) {
        return usedCertificateIds[_certificateId];
    }
    
    /**
     * @dev Transférer la propriété (en cas de changement de gouvernement)
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Nouvelle adresse invalide");
        
        // Retirer l'ancien propriétaire des émetteurs et ajouter le nouveau
        authorizedIssuers[owner] = false;
        authorizedIssuers[_newOwner] = true;
        
        owner = _newOwner;
    }
}