# README.md

# Web Serial Project

Ce projet est une application web qui permet de communiquer avec des appareils série via l'API Web Serial. Il fournit une interface utilisateur simple pour envoyer des commandes et recevoir des messages d'un appareil connecté.

## Structure du projet

- `src/`: Contient tous les fichiers sources de l'application.
  - `css/`: Dossier contenant les fichiers CSS.
    - `styles.css`: Styles pour l'application.
  - `js/`: Dossier contenant les fichiers JavaScript.
    - `SerialScaleController.js`: Gère la communication avec les appareils série.
    - `main.js`: Point d'entrée JavaScript de l'application.
  - `index.html`: Page HTML principale de l'application.

- `package.json`: Fichier de configuration pour npm, listant les dépendances et les scripts.

## Installation

1. Clonez le dépôt:
   ```bash
   git clone https://github.com/Maxime272003/web-serial-project.git
   cd web-serial-project
   ```

2. Installez les dépendances:
   ```bash
   npm install
   ```

## Utilisation

1. Ouvrez `index.html` dans un navigateur compatible avec l'API Web Serial.
2. Cliquez sur le bouton pour vous connecter à un appareil série.
3. Envoyez des commandes et visualisez les messages reçus dans l'interface utilisateur.

## Contribuer

Les contributions sont les bienvenues! Veuillez soumettre une demande de tirage pour toute amélioration ou correction de bogue.

## License

Ce projet est sous licence MIT.
