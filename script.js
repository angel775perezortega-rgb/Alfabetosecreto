const alphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
const punctuation = [
  [33, 47],
  [58, 64],
  [91, 96],
  [123, 126]
].flatMap(([start, end]) =>
  Array.from({ length: end - start + 1 }, (_, index) => String.fromCharCode(start + index))
);
const codeCharacters = [
  ...alphabet,
  ...alphabet.toLocaleLowerCase('es'),
  ...'0123456789',
  ...punctuation
];
let characterCodes = new Map(codeCharacters.map((character, index) => [character, index + 1]));
let charactersByCode = new Map(codeCharacters.map((character, index) => [index + 1, character]));
const standardCharactersByCode = new Map(codeCharacters.map((character, index) => [index + 1, character]));
const input = document.getElementById('inputText');
const output = document.getElementById('outputText');
const message = document.getElementById('message');
const copyButton = document.getElementById('copyOutput');
const languageSelect = document.getElementById('languageSelect');
const styleSelect = document.getElementById('styleSelect');
const countrySelect = document.getElementById('countrySelect');
const alphabetCodeInput = document.getElementById('alphabetCode');
const codeStatus = document.getElementById('codeStatus');
const codeMetadata = document.getElementById('codeMetadata');
const twitchChannelInput = document.getElementById('twitchChannel');
const twitchConnectButton = document.getElementById('twitchConnect');
const twitchDisconnectButton = document.getElementById('twitchDisconnect');
const twitchStatus = document.getElementById('twitchStatus');
const twitchVoiceCheckbox = document.getElementById('twitchVoice');
const twitchOriginal = document.getElementById('twitchOriginal');
const twitchTranslation = document.getElementById('twitchTranslation');
let twitchSocket = null;
let metadataGeneration = 0;

const translations = {
  es: {
    accountTitle: 'Tu cuenta', accountEmailLabel: 'Correo electrónico', accountStorageNote: 'Guardado solo en este navegador.',     accountArchiveNote: 'Importa ZIP anticipados. Se ejecutan si Firma.js contiene una firma válida desde la versión 9.1.', accountArchiveUploadLabel: 'Selecciona un archivo ZIP', archiveRun: 'Ejecutar ZIP', archiveVersionPromptTitle: 'Antes de ejecutar el ZIP', archiveCancel: 'Cancelar', archiveContinue: 'Continuar', archiveSignatureNote: 'Se requiere una firma válida en Firma.js desde la versión 9.1.', archiveSignatureLabel: 'Formato: f52V{versión}/Mx/{DDMMAA}; fecha válida', archiveSignatureInvalid: 'No se puede ejecutar: la firma de Firma.js no alcanza la versión 9.1 o la fecha no es válida.', archivePreviewTitle: 'Vista previa del ZIP', archiveSelectFile: 'Selecciona un archivo ZIP primero.', archiveSignatureRequired: 'No se puede ejecutar: el ZIP no incluye Firma.js.', archiveUnsupported: 'El ZIP debe incluir HTML y este navegador debe admitir archivos comprimidos compatibles.', archiveError: 'No se pudo abrir el ZIP. Revisa que no esté dañado y que contenga HTML y Firma.js.', archiveReady: 'Versión anticipada abierta a pantalla completa. Pulsa × para salir.', menuOpen: 'Abrir menú de cuenta', menuClose: 'Cerrar menú',
    eyebrow: 'TU ESPACIO MULTILINGÜE', title: 'Traductor de letras y números',
    description: 'Traduce texto a códigos numéricos y descífralos en tu idioma.',
    languageLabel: 'Idioma', styleLabel: 'Estilo', styleStandard: 'Estándar', styleFestive: 'Festivo', styleHalloween: 'Halloween', styleCustom: 'Personalizado', customBackgroundLabel: 'Color del fondo', customOutlineLabel: 'Color de contornos', countryLabel: 'País o región',
    codeLabel: 'Archivo CNV para cambiar el alfabeto',
    applyCode: 'Cargar archivo', resetCode: 'Alfabeto original',
    codeHint: 'Admite archivos CNV-ALEXIS, CNV-CARPO o CNV-ADMIN, también con metadatos opcionales AUTHOR=, DESCRIPTION=, ID=, VERSION= y LICENSE=.',
    metadataFile: 'Archivo', metadataSize: 'Tamaño', metadataAlphabet: 'Alfabeto', metadataAuthor: 'Autoría',
    metadataDescription: 'Descripción', metadataId: 'Identificador', metadataVersion: 'Versión', metadataLicense: 'Licencia', metadataFingerprint: 'Huella SHA-256', metadataViewAll: 'Ver toda la información', metadataNoticeLabel: 'Nota',
    metadataNotice: 'La huella ayuda a verificar si el archivo cambió; los metadatos no evitan que se copie o se suplante su autoría.',
    metadataMissing: 'No declarado', metadataFingerprintPending: 'Calculando…', metadataFingerprintUnavailable: 'No disponible en este navegador',
    codeApplied: (name) => `Archivo de ${name} cargado: el orden del alfabeto ha cambiado.`,
    codeAdmin: 'Archivo Admin reconocido. Está reservado para funciones de desarrollo y no modifica el alfabeto.',
    codeReset: 'Se restauró el alfabeto original.', codeInvalid: 'Archivo CNV no válido. Selecciona un archivo CNV de Alexis, Carpo o Admin.',
    eventDayOfTheDeadTitle: 'Día de Muertos', eventDayOfTheDeadDescription: 'Recordamos con cariño a quienes siguen viviendo en nuestra memoria.',
    eventChristmasTitle: '¡Feliz Navidad!', eventChristmasDescription: 'Que estas fiestas estén llenas de alegría, cariño y buenos momentos.',
    eventNewYearTitle: '¡Feliz Año Nuevo!', eventNewYearDescription: 'Te deseamos un año nuevo lleno de nuevos comienzos y buenos deseos.',
    eventHalloweenTitle: '¡Especial de Halloween!', eventHalloweenDescription: 'En octubre, hasta las palabras esconden un poco de magia.',
    seasonSpringTitle: '¡Llegó la primavera!', seasonSpringDescription: 'La naturaleza despierta y los días se llenan de color.',
    seasonSummerTitle: '¡Llegó el verano!', seasonSummerDescription: 'Disfruta de los días largos y del calor de la temporada.',
    seasonAutumnTitle: '¡Llegó el otoño!', seasonAutumnDescription: 'Los días cambian de color y comienza una nueva estación.',
    seasonWinterTitle: '¡Llegó el invierno!', seasonWinterDescription: 'Abrígate y disfruta de los días tranquilos de invierno.',

    localeNote: 'El país adapta la región del navegador; el idioma cambia los textos de la interfaz.',
    translatorTitle: 'Traductor de letras y números',
    translatorDescription: 'Admite mayúsculas, minúsculas, números y símbolos estándar.',
    inputLabel: 'Texto o códigos numéricos', inputPlaceholder: 'Ejemplo: HOLA o 8 16 12 1',
    translatorHint: 'Un espacio entre códigos y dos espacios entre palabras. Los códigos pueden tener hasta 3 dígitos.',
    toNumbers: 'Texto → números', toText: 'Números → texto', copyResult: 'Copiar resultado',
    resultLabel: 'Resultado', resultPlaceholder: 'Aquí aparecerá la traducción',
    footer: 'Hecho para que te sientas en casa, estés donde estés.',
    tutorialSteps: [
      { title: 'Idioma y región', description: 'Los menús de la parte superior permiten cambiar el idioma de la interfaz y elegir tu país o región.' },
      { title: 'Escribe un mensaje', description: 'Introduce letras, números o símbolos. Pulsa «Texto → números» para convertirlo; también puedes usar «Números → texto» para descifrar códigos.' },
      { title: 'Copia el resultado', description: 'Tu traducción aparecerá aquí. Usa «Copiar resultado» para guardarla en el portapapeles.' }
    ],
    tutorialStep: (step, total) => `PASO ${step} DE ${total}`,
    tutorialOpen: 'Ver tutorial', tutorialSkip: 'Omitir tutorial', tutorialBack: 'Atrás', tutorialNext: 'Siguiente', tutorialDone: 'Empezar',
    halloweenEventTitle: '¡Especial de Halloween!', halloweenEventDescription: 'Solo en octubre: hasta las palabras esconden un poco de magia.',
    empty: '', invalidCharacter: (character) => `El carácter «${character}» no está admitido. Usa letras, números y símbolos estándar del teclado.`,
    invalidCodes: 'Usa códigos de hasta 3 dígitos, separados por espacios; deja dos espacios entre palabras.',
    invalidCode: (token) => `El código ${token} no es válido. Usa números del 1 al ${Math.max(...charactersByCode.keys())}.`,
    copied: '¡Resultado copiado!', copyFailed: 'No se pudo copiar. Selecciona el resultado y cópialo manualmente.'
  },
  en: {
    accountTitle: 'Your account', accountEmailLabel: 'Email address', accountStorageNote: 'Saved only in this browser.',     accountArchiveNote: 'Import preview ZIP files. They run if Firma.js has a valid signature from version 9.1 onward.', accountArchiveUploadLabel: 'Select a ZIP file', archiveRun: 'Run ZIP', archiveVersionPromptTitle: 'Before running the ZIP', archiveCancel: 'Cancel', archiveContinue: 'Continue', archiveSignatureNote: 'A valid signature in Firma.js from version 9.1 onward is required.', archiveSignatureLabel: 'Format: f52V{version}/Mx/{DDMMYY}; valid date required', archiveSignatureInvalid: 'Cannot run: the Firma.js signature is below version 9.1 or has an invalid date.', archivePreviewTitle: 'ZIP preview', archiveSelectFile: 'Select a ZIP file first.', archiveSignatureRequired: 'Cannot run: the ZIP does not include Firma.js.', archiveUnsupported: 'The ZIP must include HTML, and this browser must support its compression format.', archiveError: 'Could not open the ZIP. Check that it is not damaged and contains HTML and Firma.js.', archiveReady: 'Preview version opened full screen. Select × to exit.', menuOpen: 'Open account menu', menuClose: 'Close menu',
    eyebrow: 'YOUR MULTILINGUAL SPACE', title: 'Letters and numbers translator',
    description: 'Translate text into number codes and decode them in your language.',
    languageLabel: 'Language', styleLabel: 'Style', styleStandard: 'Standard', styleFestive: 'Seasonal', styleHalloween: 'Halloween', styleCustom: 'Custom', customBackgroundLabel: 'Background color', customOutlineLabel: 'Outline color', countryLabel: 'Country or region',
    codeLabel: 'CNV file to change the alphabet',
    applyCode: 'Load file', resetCode: 'Original alphabet',
    codeHint: 'Accepts CNV-ALEXIS, CNV-CARPO, or CNV-ADMIN files, with optional AUTHOR=, DESCRIPTION=, ID=, VERSION=, and LICENSE= metadata lines.',
    metadataFile: 'File', metadataSize: 'Size', metadataAlphabet: 'Alphabet', metadataAuthor: 'Attribution',
    metadataDescription: 'Description', metadataId: 'Identifier', metadataVersion: 'Version', metadataLicense: 'License', metadataFingerprint: 'SHA-256 fingerprint', metadataViewAll: 'View all information', metadataNoticeLabel: 'Note',
    metadataNotice: 'The fingerprint helps verify whether the file changed; metadata does not prevent copying or false ownership claims.',
    metadataMissing: 'Not declared', metadataFingerprintPending: 'Calculating…', metadataFingerprintUnavailable: 'Unavailable in this browser',
    codeApplied: (name) => `${name} file loaded: the alphabet order has changed.`,
    codeAdmin: 'Admin file recognized. It is reserved for development features and does not change the alphabet.',
    codeReset: 'The original alphabet was restored.', codeInvalid: 'Invalid CNV file. Select an Alexis, Carpo, or Admin CNV file.',
    eventDayOfTheDeadTitle: 'Day of the Dead', eventDayOfTheDeadDescription: 'We lovingly remember those who continue to live in our memories.',
    eventChristmasTitle: 'Merry Christmas!', eventChristmasDescription: 'May your holidays be filled with joy, care, and happy moments.',
    eventNewYearTitle: 'Happy New Year!', eventNewYearDescription: 'Wishing you a new year full of fresh starts and good wishes.',
    eventHalloweenTitle: 'Halloween special!', eventHalloweenDescription: 'Even words hide a little magic in October.',
    seasonSpringTitle: 'Spring is here!', seasonSpringDescription: 'Nature wakes up and the days fill with color.',
    seasonSummerTitle: 'Summer is here!', seasonSummerDescription: 'Enjoy the long days and the warmth of the season.',
    seasonAutumnTitle: 'Autumn is here!', seasonAutumnDescription: 'The days change color as a new season begins.',
    seasonWinterTitle: 'Winter is here!', seasonWinterDescription: 'Stay cozy and enjoy the quiet days of winter.',

    localeNote: 'Your country sets the browser region; the language changes the interface text.',
    translatorTitle: 'Letters and numbers translator',
    translatorDescription: 'Supports uppercase and lowercase letters, numbers, and standard symbols.',
    inputLabel: 'Text or number codes', inputPlaceholder: 'Example: HELLO or 8 5 12 12 15',
    translatorHint: 'Use one space between codes and two spaces between words. Codes can have up to 3 digits.',
    toNumbers: 'Text → numbers', toText: 'Numbers → text', copyResult: 'Copy result',
    resultLabel: 'Result', resultPlaceholder: 'Your translation will appear here',
    footer: 'Made to feel like home, wherever you are.',
    tutorialSteps: [
      { title: 'Language and region', description: 'Use the menus at the top to change the interface language and choose your country or region.' },
      { title: 'Enter a message', description: 'Type letters, numbers, or symbols. Select “Text → numbers” to convert it, or “Numbers → text” to decode codes.' },
      { title: 'Copy the result', description: 'Your translation will appear here. Select “Copy result” to save it to your clipboard.' }
    ],
    tutorialStep: (step, total) => `STEP ${step} OF ${total}`,
    tutorialOpen: 'View tutorial', tutorialSkip: 'Skip tutorial', tutorialBack: 'Back', tutorialNext: 'Next', tutorialDone: 'Get started',
    halloweenEventTitle: 'Halloween special!', halloweenEventDescription: 'Only in October: even words hide a little magic.',
    empty: '', invalidCharacter: (character) => `The character “${character}” is not supported. Use letters, numbers, and standard keyboard symbols.`,
    invalidCodes: 'Use codes up to 3 digits, separated by spaces; use two spaces between words.',
    invalidCode: (token) => `Code ${token} is invalid. Use numbers from 1 to ${Math.max(...charactersByCode.keys())}.`,
    copied: 'Result copied!', copyFailed: 'Could not copy. Select the result and copy it manually.'
  },
  fr: {
    accountTitle: 'Votre compte', accountEmailLabel: 'Adresse e-mail', accountStorageNote: 'Enregistré uniquement dans ce navigateur.',     accountArchiveNote: 'Importez des ZIP préliminaires. Ils seront exécutés si Firma.js contient une signature valide à partir de la version 9.1.', accountArchiveUploadLabel: 'Sélectionner un fichier ZIP', archiveRun: 'Exécuter le ZIP', archiveVersionPromptTitle: 'Avant d’exécuter le ZIP', archiveCancel: 'Annuler', archiveContinue: 'Continuer', archiveSignatureNote: 'Une signature valide dans Firma.js à partir de la version 9.1 est requise.', archiveSignatureLabel: 'Format : f52V{version}/Mx/{JJMMAA} ; date valide requise', archiveSignatureInvalid: 'Impossible d’exécuter le ZIP : la signature de Firma.js doit être valide à partir de la version 9.1.', archivePreviewTitle: 'Aperçu du ZIP', archiveSelectFile: 'Sélectionnez d’abord un fichier ZIP.', archiveSignatureRequired: 'Impossible d’exécuter le ZIP : Firma.js est absent.', archiveUnsupported: 'Le ZIP doit contenir un fichier HTML et le navigateur doit prendre en charge son format de compression.', archiveError: 'Impossible d’ouvrir le ZIP. Vérifiez qu’il contient HTML et Firma.js et qu’il n’est pas endommagé.', archiveReady: 'La version préliminaire est en plein écran. Appuyez sur × pour quitter.', menuOpen: 'Ouvrir le menu du compte', menuClose: 'Fermer le menu',
    eyebrow: 'VOTRE ESPACE MULTILINGUE', title: 'Traducteur de lettres et de chiffres',
    description: 'Traduisez du texte en codes numériques et décodez-les dans votre langue.',
    languageLabel: 'Langue', styleLabel: 'Style', styleStandard: 'Standard', styleFestive: 'Saisonnier', styleHalloween: 'Halloween', styleCustom: 'Personnalisé', customBackgroundLabel: 'Couleur du fond', customOutlineLabel: 'Couleur des contours', countryLabel: 'Pays ou région',
    codeLabel: 'Fichier CNV pour modifier l’alphabet',
    applyCode: 'Charger le fichier', resetCode: 'Alphabet d’origine',
    codeHint: 'Accepte les fichiers CNV-ALEXIS, CNV-CARPO ou CNV-ADMIN, avec les métadonnées facultatives AUTHOR=, DESCRIPTION=, ID=, VERSION= et LICENSE=.',
    metadataFile: 'Fichier', metadataSize: 'Taille', metadataAlphabet: 'Alphabet', metadataAuthor: 'Attribution',
    metadataDescription: 'Description', metadataId: 'Identifiant', metadataVersion: 'Version', metadataLicense: 'Licence', metadataFingerprint: 'Empreinte SHA-256', metadataViewAll: 'Voir toutes les informations', metadataNoticeLabel: 'Note',
    metadataNotice: 'L’empreinte aide à vérifier si le fichier a changé ; les métadonnées n’empêchent ni la copie ni les fausses revendications de propriété.',
    metadataMissing: 'Non indiqué', metadataFingerprintPending: 'Calcul…', metadataFingerprintUnavailable: 'Indisponible dans ce navigateur',
    codeApplied: (name) => `Fichier de ${name} chargé : l’ordre de l’alphabet a changé.`,
    codeAdmin: 'Fichier Admin reconnu. Il est réservé aux fonctions de développement et ne modifie pas l’alphabet.',
    codeReset: 'L’alphabet d’origine a été rétabli.', codeInvalid: 'Fichier CNV invalide. Sélectionnez un fichier CNV Alexis, Carpo ou Admin.',
    eventDayOfTheDeadTitle: 'Jour des morts', eventDayOfTheDeadDescription: 'Nous nous souvenons avec affection de ceux qui vivent toujours dans nos mémoires.',
    eventChristmasTitle: 'Joyeux Noël !', eventChristmasDescription: 'Que ces fêtes soient remplies de joie, d’affection et de beaux moments.',
    eventNewYearTitle: 'Bonne année !', eventNewYearDescription: 'Nous vous souhaitons une nouvelle année pleine de nouveaux départs et de beaux vœux.',
    eventHalloweenTitle: 'Spécial Halloween !', eventHalloweenDescription: 'En octobre, même les mots cachent un peu de magie.',
    seasonSpringTitle: 'Le printemps est arrivé !', seasonSpringDescription: 'La nature se réveille et les journées se remplissent de couleurs.',
    seasonSummerTitle: 'L’été est arrivé !', seasonSummerDescription: 'Profitez des longues journées et de la chaleur de la saison.',
    seasonAutumnTitle: 'L’automne est arrivé !', seasonAutumnDescription: 'Les couleurs changent et une nouvelle saison commence.',
    seasonWinterTitle: 'L’hiver est arrivé !', seasonWinterDescription: 'Restez au chaud et profitez des journées paisibles de l’hiver.',

    localeNote: 'Votre pays définit la région du navigateur ; la langue modifie les textes de l’interface.',
    translatorTitle: 'Traducteur de lettres et de chiffres',
    translatorDescription: 'Prend en charge les majuscules, minuscules, chiffres et symboles courants.',
    inputLabel: 'Texte ou codes numériques', inputPlaceholder: 'Exemple : SALUT ou 19 1 12 21 20',
    translatorHint: 'Un espace entre les codes et deux espaces entre les mots. Les codes peuvent comporter jusqu’à 3 chiffres.',
    toNumbers: 'Texte → chiffres', toText: 'Chiffres → texte', copyResult: 'Copier le résultat',
    resultLabel: 'Résultat', resultPlaceholder: 'La traduction apparaîtra ici',
    footer: 'Pour vous sentir chez vous, où que vous soyez.',
    tutorialSteps: [
      { title: 'Langue et région', description: 'Utilisez les menus en haut pour changer la langue de l’interface et choisir votre pays ou région.' },
      { title: 'Saisissez un message', description: 'Saisissez des lettres, chiffres ou symboles. Choisissez « Texte → chiffres » pour convertir, ou « Chiffres → texte » pour décoder.' },
      { title: 'Copiez le résultat', description: 'Votre traduction apparaîtra ici. Choisissez « Copier le résultat » pour l’enregistrer dans le presse-papiers.' }
    ],
    tutorialStep: (step, total) => `ÉTAPE ${step} SUR ${total}`,
    tutorialOpen: 'Voir le tutoriel', tutorialSkip: 'Ignorer le tutoriel', tutorialBack: 'Retour', tutorialNext: 'Suivant', tutorialDone: 'Commencer',
    halloweenEventTitle: 'Spécial Halloween !', halloweenEventDescription: 'Seulement en octobre : même les mots cachent un peu de magie.',
    empty: '', invalidCharacter: (character) => `Le caractère « ${character} » n’est pas pris en charge. Utilisez des lettres, chiffres et symboles standards.`,
    invalidCodes: 'Utilisez des codes de 3 chiffres maximum, séparés par des espaces et deux espaces entre les mots.',
    invalidCode: (token) => `Le code ${token} est invalide. Utilisez un nombre de 1 à ${Math.max(...charactersByCode.keys())}.`,
    copied: 'Résultat copié !', copyFailed: 'Copie impossible. Sélectionnez le résultat pour le copier manuellement.'
  },
  pt: {
    accountTitle: 'Sua conta', accountEmailLabel: 'E-mail', accountStorageNote: 'Salvo apenas neste navegador.',     accountArchiveNote: 'Importe ZIP de prévia. Eles serão executados se Firma.js contiver uma assinatura válida a partir da versão 9.1.', accountArchiveUploadLabel: 'Selecionar um arquivo ZIP', archiveRun: 'Executar ZIP', archiveVersionPromptTitle: 'Antes de executar o ZIP', archiveCancel: 'Cancelar', archiveContinue: 'Continuar', archiveSignatureNote: 'É necessária uma assinatura válida em Firma.js a partir da versão 9.1.', archiveSignatureLabel: 'Formato: f52V{versão}/Mx/{DDMMAA}; data válida obrigatória', archiveSignatureInvalid: 'Não é possível executar: a assinatura de Firma.js precisa ser válida a partir da versão 9.1.', archivePreviewTitle: 'Prévia do ZIP', archiveSelectFile: 'Selecione um arquivo ZIP primeiro.', archiveSignatureRequired: 'Não é possível executar: o ZIP não inclui Firma.js.', archiveUnsupported: 'O ZIP deve incluir um arquivo HTML e o navegador precisa aceitar o formato de compactação.', archiveError: 'Não foi possível abrir o ZIP. Verifique se ele contém HTML e Firma.js e não está danificado.', archiveReady: 'A versão de prévia está em tela cheia. Use × para sair.', menuOpen: 'Abrir menu da conta', menuClose: 'Fechar menu',
    eyebrow: 'SEU ESPAÇO MULTILÍNGUE', title: 'Tradutor de letras e números',
    description: 'Traduza textos em códigos numéricos e decifre-os no seu idioma.',
    languageLabel: 'Idioma', styleLabel: 'Estilo', styleStandard: 'Padrão', styleFestive: 'Sazonal', styleHalloween: 'Halloween', styleCustom: 'Personalizado', customBackgroundLabel: 'Cor do fundo', customOutlineLabel: 'Cor dos contornos', countryLabel: 'País ou região',
    codeLabel: 'Arquivo CNV para mudar o alfabeto',
    applyCode: 'Carregar arquivo', resetCode: 'Alfabeto original',
    codeHint: 'Aceita arquivos CNV-ALEXIS, CNV-CARPO ou CNV-ADMIN, com metadados opcionais AUTHOR=, DESCRIPTION=, ID=, VERSION= e LICENSE=.',
    metadataFile: 'Arquivo', metadataSize: 'Tamanho', metadataAlphabet: 'Alfabeto', metadataAuthor: 'Autoria',
    metadataDescription: 'Descrição', metadataId: 'Identificador', metadataVersion: 'Versão', metadataLicense: 'Licença', metadataFingerprint: 'Impressão digital SHA-256', metadataViewAll: 'Ver todas as informações', metadataNoticeLabel: 'Aviso',
    metadataNotice: 'A impressão ajuda a verificar se o arquivo mudou; metadados não impedem cópias ou falsas alegações de autoria.',
    metadataMissing: 'Não informado', metadataFingerprintPending: 'Calculando…', metadataFingerprintUnavailable: 'Indisponível neste navegador',
    codeApplied: (name) => `Arquivo de ${name} carregado: a ordem do alfabeto foi alterada.`,
    codeAdmin: 'Arquivo Admin reconhecido. Ele é reservado para funções de desenvolvimento e não altera o alfabeto.',
    codeReset: 'O alfabeto original foi restaurado.', codeInvalid: 'Arquivo CNV inválido. Selecione um arquivo CNV de Alexis, Carpo ou Admin.',
    eventDayOfTheDeadTitle: 'Dia dos Mortos', eventDayOfTheDeadDescription: 'Lembramos com carinho de quem continua vivendo em nossas memórias.',
    eventChristmasTitle: 'Feliz Natal!', eventChristmasDescription: 'Que as festas sejam cheias de alegria, carinho e bons momentos.',
    eventNewYearTitle: 'Feliz Ano-Novo!', eventNewYearDescription: 'Desejamos um ano novo cheio de recomeços e bons desejos.',
    eventHalloweenTitle: 'Especial de Halloween!', eventHalloweenDescription: 'Em outubro, até as palavras escondem um pouco de magia.',
    seasonSpringTitle: 'A primavera chegou!', seasonSpringDescription: 'A natureza desperta e os dias ficam cheios de cor.',
    seasonSummerTitle: 'O verão chegou!', seasonSummerDescription: 'Aproveite os dias longos e o calor da estação.',
    seasonAutumnTitle: 'O outono chegou!', seasonAutumnDescription: 'As cores mudam e uma nova estação começa.',
    seasonWinterTitle: 'O inverno chegou!', seasonWinterDescription: 'Aconchegue-se e aproveite os dias tranquilos do inverno.',

    localeNote: 'Seu país define a região do navegador; o idioma altera os textos da interface.',
    translatorTitle: 'Tradutor de letras e números',
    translatorDescription: 'Aceita letras maiúsculas e minúsculas, números e símbolos padrão.',
    inputLabel: 'Texto ou códigos numéricos', inputPlaceholder: 'Exemplo: OLÁ ou 15 12 1',
    translatorHint: 'Use um espaço entre códigos e dois espaços entre palavras. Os códigos podem ter até 3 dígitos.',
    toNumbers: 'Texto → números', toText: 'Números → texto', copyResult: 'Copiar resultado',
    resultLabel: 'Resultado', resultPlaceholder: 'A tradução aparecerá aqui',
    footer: 'Feito para você se sentir em casa, onde estiver.',
    tutorialSteps: [
      { title: 'Idioma e região', description: 'Use os menus no topo para mudar o idioma da interface e escolher seu país ou região.' },
      { title: 'Digite uma mensagem', description: 'Digite letras, números ou símbolos. Selecione “Texto → números” para converter ou “Números → texto” para decifrar.' },
      { title: 'Copie o resultado', description: 'Sua tradução aparecerá aqui. Selecione “Copiar resultado” para salvá-la na área de transferência.' }
    ],
    tutorialStep: (step, total) => `ETAPA ${step} DE ${total}`,
    tutorialOpen: 'Ver tutorial', tutorialSkip: 'Pular tutorial', tutorialBack: 'Voltar', tutorialNext: 'Avançar', tutorialDone: 'Começar',
    halloweenEventTitle: 'Especial de Halloween!', halloweenEventDescription: 'Só em outubro: até as palavras escondem um pouco de magia.',
    empty: '', invalidCharacter: (character) => `O caractere “${character}” não é aceito. Use letras, números e símbolos padrão do teclado.`,
    invalidCodes: 'Use códigos de até 3 dígitos, separados por espaços; use dois espaços entre palavras.',
    invalidCode: (token) => `O código ${token} é inválido. Use números de 1 a ${Math.max(...charactersByCode.keys())}.`,
    copied: 'Resultado copiado!', copyFailed: 'Não foi possível copiar. Selecione o resultado e copie manualmente.'
  }
};

const halloweenTranslations = {
  ...translations.es,
  eyebrow: 'EL RINCÓN MÁS EMBRUJADO',
  title: 'Traductor de letras hechizadas',
  description: 'Convierte tus palabras en códigos misteriosos… si te atreves.',
  languageLabel: 'Idioma encantado',
  countryLabel: 'País o guarida',
  localeNote: 'Elige tu guarida y deja que las palabras hagan su magia.',
  tutorialSteps: [
    { title: 'Idioma y guarida', description: 'Usa los menús de la parte superior para cambiar el idioma de la interfaz y elegir tu país o región.' },
    { title: 'Escribe un conjuro', description: 'Escribe letras y pulsa «Hechizar → símbolos» para transformarlas. También puedes descifrar los símbolos con el botón correspondiente.' },
    { title: 'Guarda la magia', description: 'El resultado aparecerá aquí. Usa «Copiar el conjuro» para guardarlo en el portapapeles.' }
  ],
  translatorTitle: 'Laboratorio de palabras',
  translatorDescription: 'El traductor de Halloween convierte letras en símbolos embrujados, no en números.',
  inputLabel: 'Escribe tu conjuro o los símbolos',
  inputPlaceholder: 'Ejemplo: BRUJA o 🎃 👻 🦇',
  translatorHint: 'Usa un espacio entre símbolos y dos espacios entre palabras. Los números y signos se conservan.',
  toNumbers: 'Hechizar → símbolos',
  toText: 'Descifrar → texto',
  copyResult: 'Copiar el conjuro',
  resultLabel: 'Tu mensaje encantado',
  resultPlaceholder: 'Aquí aparecerá la magia…',
  footer: '¡Que tus palabras tengan una noche terroríficamente divertida!',
  halloweenEventTitle: '¡El aquelarre de Halloween está aquí!',
  halloweenEventDescription: 'Solo durante octubre: activa el idioma Halloween y deja que la magia transforme tus palabras.',
  invalidCharacter: (character) => `¡El carácter «${character}» escapó del hechizo! Prueba con letras, números o símbolos estándar.`,
  invalidHalloweenSymbol: (symbol) => `El símbolo «${symbol}» no pertenece al grimorio de Halloween.`,
  invalidCodes: 'Usa códigos de hasta 3 cifras, separados por espacios; deja dos espacios entre palabras.',
  invalidCode: (token) => `El código ${token} no pertenece al grimorio. Usa números del 1 al ${Math.max(...charactersByCode.keys())}.`,
  copied: '¡Conjuro copiado!',
  copyFailed: 'La magia de copiar falló. Selecciona el resultado y cópialo manualmente.'
};

let currentLanguage = 'es';
const seasonalEvent = document.getElementById('seasonalEvent');
const seasonalIcon = document.getElementById('seasonalIcon');
const tutorial = document.getElementById('tutorial');
const tutorialStep = document.getElementById('tutorialStep');
const tutorialTitle = document.getElementById('tutorialTitle');
const tutorialDescription = document.getElementById('tutorialDescription');
const tutorialBack = document.getElementById('tutorialBack');
const tutorialNext = document.getElementById('tutorialNext');
let tutorialIndex = 0;
const tutorialStorageKey = 'translator-tutorial-completed';
const accountStorageKey = 'translator-local-account';
const accountSessionKey = 'translator-account-session';
try {
  localStorage.removeItem('translator-visit-history');
} catch {
  // Ignore unavailable browser storage.
}
const emailPrompt = document.getElementById('emailPrompt');
const emailForm = document.getElementById('emailForm');
const accountUsername = document.getElementById('accountUsername');
const accountPassword = document.getElementById('accountPassword');
const accountPromptDescription = document.getElementById('accountPromptDescription');
const accountSubmit = document.getElementById('accountSubmit');
const emailAddress = document.getElementById('emailAddress');
const accountMenuToggle = document.getElementById('accountMenuToggle');
const accountSidebar = document.getElementById('accountSidebar');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
const archiveUpload = document.getElementById('accountArchiveUpload');
const runArchiveButton = document.getElementById('runArchive');
const archiveSignature = document.getElementById('archiveSignature');
const archiveStatus = document.getElementById('archiveStatus');
const archivePreview = document.getElementById('archivePreview');
const archiveVersionPrompt = document.getElementById('archiveVersionPrompt');
const archiveFrame = document.getElementById('archiveFrame');

function updateTheme() {
  const month = new Date().getMonth();
  const halloweenOption = styleSelect.querySelector('option[value="halloween"]');
  halloweenOption.hidden = month !== 9;
  if (styleSelect.value === 'halloween' && month !== 9) styleSelect.value = 'standard';

  const seasonalThemes = { 0: 'new-year', 9: 'halloween', 10: 'day-of-the-dead', 11: 'christmas' };
  const selectedTheme = styleSelect.value === 'halloween'
    ? 'halloween'
    : styleSelect.value === 'festive' ? seasonalThemes[month] : '';
  const festiveStyle = Boolean(selectedTheme);
  const customStyle = styleSelect.value === 'custom';
  document.body.classList.toggle('festive', festiveStyle);
  document.body.classList.toggle('custom', customStyle);
  ['halloween', 'day-of-the-dead', 'christmas', 'new-year'].forEach((theme) => {
    document.body.classList.toggle(`theme-${theme}`, selectedTheme === theme);
  });
  document.getElementById('customStyleControls').hidden = !customStyle;
  document.body.style.setProperty('--custom-background', document.getElementById('customBackground').value);
  document.body.style.setProperty('--custom-outline', document.getElementById('customOutline').value);
  const themeColors = {
    halloween: '#291b3b', 'day-of-the-dead': '#54265e', christmas: '#174b37', 'new-year': '#172a52'
  };
  document.querySelector('meta[name="theme-color"]').content = themeColors[selectedTheme]
    || (customStyle ? document.getElementById('customBackground').value : '#5c6ac4');
}

function t(key, ...args) {
  const dictionary = translations[currentLanguage];
  const value = dictionary[key];
  return typeof value === 'function' ? value(...args) : value;
}

function setAlphabetOrder(code = '') {
  const keyLetters = Array.from(new Set(Array.from(code.replace(/^CNV-/, '').toLocaleUpperCase('es')).filter((character) => alphabet.includes(character))));
  let orderedAlphabet;

  if (code === 'CNV-ALEXIS') {
    orderedAlphabet = Array.from('QWERTYUIOPÑLKJHGFDSCBMNZAXV');
  } else if (code === 'CNV-CARPO') {
    orderedAlphabet = [...keyLetters, ...Array.from(alphabet).reverse().filter((character) => !keyLetters.includes(character))];
  } else {
    orderedAlphabet = Array.from(alphabet);
  }

  const orderedCharacters = [
    ...orderedAlphabet,
    ...orderedAlphabet.map((character) => character.toLocaleLowerCase('es')),
    ...'0123456789',
    ...punctuation
  ];
  characterCodes = new Map(orderedCharacters.map((character, index) => [character, index + 1]));
  charactersByCode = new Map(orderedCharacters.map((character, index) => [index + 1, character]));
}

function parseCNVFile(contents) {
  const lines = contents.replace(/^\uFEFF/, '').split(/\r?\n/).map((line) => line.trim());
  const codeLine = lines.find((line) => /^(?:CODE\s*=\s*)?CNV-(?:ALEXIS|CARPO|ADMIN)$/i.test(line)) || '';
  const code = codeLine.replace(/^CODE\s*=\s*/i, '').toLocaleUpperCase('en');
  const metadata = {};
  const allowedKeys = new Set(['AUTHOR', 'DESCRIPTION', 'ID', 'VERSION', 'LICENSE']);

  for (const line of lines) {
    const match = line.match(/^([A-Z_]+)\s*=\s*(.*)$/i);
    if (!match) continue;
    const name = match[1].toUpperCase();
    if (allowedKeys.has(name)) metadata[name] = match[2].slice(0, 300);
  }
  return { code, metadata };
}

function setMetadataValue(id, value) {
  document.getElementById(id).textContent = value || t('metadataMissing');
}

async function showCNVMetadata(file, code, metadata) {
  const generation = ++metadataGeneration;
  codeMetadata.hidden = false;
  setMetadataValue('metadataFile', file.name);
  setMetadataValue('metadataSize', `${(file.size / 1024).toLocaleString(document.documentElement.lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KB`);
  setMetadataValue('metadataAlphabet', code === 'CNV-ALEXIS' ? 'Alexis' : code === 'CNV-CARPO' ? 'Carpo' : 'Admin');
  setMetadataValue('metadataAuthor', metadata.AUTHOR);
  setMetadataValue('metadataDescription', metadata.DESCRIPTION);
  setMetadataValue('metadataId', metadata.ID);
  setMetadataValue('metadataVersion', metadata.VERSION);
  setMetadataValue('metadataLicense', metadata.LICENSE);
  const fingerprint = document.getElementById('metadataFingerprint');
  fingerprint.textContent = t('metadataFingerprintPending');

  try {
    if (!window.crypto?.subtle) throw new Error('SHA-256 unavailable');
    const digest = await window.crypto.subtle.digest('SHA-256', await file.arrayBuffer());
    if (generation !== metadataGeneration) return;
    fingerprint.textContent = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  } catch {
    if (generation !== metadataGeneration) return;
    fingerprint.textContent = t('metadataFingerprintUnavailable');
  }
}

async function applyAlphabetCode() {
  const file = alphabetCodeInput.files[0];
  if (!file || !file.name.toLocaleLowerCase('en').endsWith('.cnv')) {
    codeStatus.textContent = t('codeInvalid');
    codeStatus.classList.remove('success');
    codeMetadata.hidden = true;
    return;
  }

  let parsedFile;
  try {
    parsedFile = parseCNVFile(await file.text());
  } catch {
    codeStatus.textContent = t('codeInvalid');
    codeStatus.classList.remove('success');
    codeMetadata.hidden = true;
    return;
  }
  const { code, metadata } = parsedFile;
  if (code !== 'CNV-ALEXIS' && code !== 'CNV-CARPO' && code !== 'CNV-ADMIN') {
    codeStatus.textContent = t('codeInvalid');
    codeStatus.classList.remove('success');
    codeMetadata.hidden = true;
    return;
  }

  if (code !== 'CNV-ADMIN') setAlphabetOrder(code);
  showCNVMetadata(file, code, metadata);
  const alphabetName = code === 'CNV-ALEXIS' ? 'Alexis' : 'Carpo';
  codeStatus.textContent = code === 'CNV-ADMIN'
    ? t('codeAdmin')
    : t('codeApplied', metadata.AUTHOR || alphabetName);
  codeStatus.classList.add('success');
  setOutput('');
  showMessage('');
}

function resetAlphabetOrder() {
  alphabetCodeInput.value = '';
  codeMetadata.hidden = true;
  setAlphabetOrder();
  codeStatus.textContent = t('codeReset');
  codeStatus.classList.add('success');
  setOutput('');
  showMessage('');
}

function updateSeasonalEvent() {
  const month = new Date().getMonth() + 1;
  const eventsByMonth = {
    10: ['eventHalloweenTitle', 'eventHalloweenDescription'],
    11: ['eventDayOfTheDeadTitle', 'eventDayOfTheDeadDescription'],
    12: ['eventChristmasTitle', 'eventChristmasDescription'],
    1: ['eventNewYearTitle', 'eventNewYearDescription']
  };
  const event = eventsByMonth[month];
  if (!event) {
    seasonalEvent.hidden = true;
    return;
  }

  seasonalIcon.textContent = month === 10 ? '🎃' : month === 11 ? '🕯️' : month === 12 ? '🎄' : '🎆';
  seasonalEvent.querySelector('h2').textContent = t(event[0]);
  seasonalEvent.querySelector('p').textContent = t(event[1]);
  seasonalEvent.hidden = false;
}

const MINIMUM_ARCHIVE_VERSION = '9.1';

function compareVersions(first, second) {
  const left = first.split('.').map(Number);
  const right = second.split('.').map(Number);
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const difference = (left[index] || 0) - (right[index] || 0);
    if (difference) return difference;
  }
  return 0;
}

function isSupportedArchiveSignature(signature) {
  const match = signature.match(/^f52V(\d+(?:\.\d+)*)\/Mx\/(\d{6})$/);
  if (!match) return false;

  const [, day, month, shortYear] = match[2].match(/^(\d{2})(\d{2})(\d{2})$/);
  const year = 2000 + Number(shortYear);
  const date = new Date(Date.UTC(year, Number(month) - 1, Number(day)));
  const isValidDate = date.getUTCFullYear() === year
    && date.getUTCMonth() === Number(month) - 1
    && date.getUTCDate() === Number(day);

  return compareVersions(match[1], MINIMUM_ARCHIVE_VERSION) >= 0 && isValidDate;
}

async function readZipEntry(bytes, view, entry) {
  if (entry.flags & 1) throw new Error('Encrypted ZIP entries are not supported');
  if (entry.uncompressedSize > 8 * 1024 * 1024) throw new Error('Archive entry is too large');
  const localOffset = entry.localOffset;
  if (localOffset + 30 > bytes.length || view.getUint32(localOffset, true) !== 0x04034b50) {
    throw new Error('Invalid ZIP entry');
  }
  const nameLength = view.getUint16(localOffset + 26, true);
  const extraLength = view.getUint16(localOffset + 28, true);
  const start = localOffset + 30 + nameLength + extraLength;
  const end = start + entry.compressedSize;
  if (end > bytes.length) throw new Error('Invalid ZIP data');
  const compressed = bytes.slice(start, end);
  if (entry.method === 0) return compressed;
  if (entry.method !== 8 || typeof DecompressionStream !== 'function') throw new Error('Unsupported ZIP compression');
  const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  const result = new Uint8Array(await new Response(stream).arrayBuffer());
  if (result.length !== entry.uncompressedSize) throw new Error('Invalid decompressed ZIP entry');
  return result;
}

async function buildArchivePreview(file, pageContext) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let endRecord = -1;
  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65557); offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      endRecord = offset;
      break;
    }
  }
  if (endRecord < 0) throw new Error('ZIP directory not found');
  const entryCount = view.getUint16(endRecord + 10, true);
  const directorySize = view.getUint32(endRecord + 12, true);
  let cursor = view.getUint32(endRecord + 16, true);
  if (entryCount > 2000 || cursor + directorySize > bytes.length) throw new Error('Unsupported ZIP directory');

  const decoder = new TextDecoder();
  const entries = [];
  for (let index = 0; index < entryCount; index += 1) {
    if (cursor + 46 > bytes.length || view.getUint32(cursor, true) !== 0x02014b50) throw new Error('Invalid ZIP directory');
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const nameStart = cursor + 46;
    const name = decoder.decode(bytes.slice(nameStart, nameStart + nameLength)).replace(/\\/g, '/');
    entries.push({
      name,
      flags: view.getUint16(cursor + 8, true),
      method: view.getUint16(cursor + 10, true),
      compressedSize: view.getUint32(cursor + 20, true),
      uncompressedSize: view.getUint32(cursor + 24, true),
      localOffset: view.getUint32(cursor + 42, true)
    });
    cursor = nameStart + nameLength + extraLength + commentLength;
  }

  const signatureEntry = entries.find((entry) => /(?:^|\/)firma\.js$/i.test(entry.name));
  if (!signatureEntry) throw new Error('Firma.js missing');
  const signatureContents = decoder.decode(await readZipEntry(bytes, view, signatureEntry));
  const signatureMatch = signatureContents.match(/\b(?:const|let|var)\s+FIRMA_VERSION\s*=\s*(['"])(.*?)\1/);
  if (!signatureMatch || !isSupportedArchiveSignature(signatureMatch[2])) {
    throw new Error('Firma.js signature invalid');
  }

  const htmlEntry = entries.find((entry) => /(?:^|\/)index\.html$/i.test(entry.name))
    || entries.find((entry) => /\.html$/i.test(entry.name));
  if (!htmlEntry) throw new Error('HTML file missing');
  const folder = htmlEntry.name.includes('/') ? htmlEntry.name.slice(0, htmlEntry.name.lastIndexOf('/') + 1) : '';
  const findAsset = (filename, extension) => entries.find((entry) => entry.name.toLowerCase() === `${folder}${filename}`.toLowerCase())
    || entries.find((entry) => entry.name.toLowerCase().endsWith(`/${filename}`))
    || entries.find((entry) => entry.name.toLowerCase().startsWith(folder.toLowerCase()) && entry.name.toLowerCase().endsWith(extension))
    || entries.find((entry) => entry.name.toLowerCase().endsWith(extension));
  const cssEntry = findAsset('styles.css', '.css');
  const jsEntry = findAsset('script.js', '.js');
  const html = decoder.decode(await readZipEntry(bytes, view, htmlEntry));
  const css = cssEntry ? decoder.decode(await readZipEntry(bytes, view, cssEntry)) : '';
  const js = jsEntry ? decoder.decode(await readZipEntry(bytes, view, jsEntry)) : '';
  const policy = '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\' data:; img-src data: blob:; font-src data:; media-src data:; connect-src \'none\'; object-src \'none\'; base-uri \'none\'; form-action \'none\'">';
  let preview = html
    .replace(/<script\b(?=[^>]*\bsrc\s*=)[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<link\b(?=[^>]*\b rel\s*=\s*["']?stylesheet)[^>]*>/gi, '');
  if (!/<head\b[^>]*>/i.test(preview)) preview = `<head>${policy}</head>${preview}`;
  else preview = preview.replace(/<head\b[^>]*>/i, (head) => `${head}${policy}`);
  if (css) preview = preview.replace(/<\/head\s*>/i, `<style>${css.replace(/<\/style/gi, '<\\/style')}</style></head>`);
  const contextScript = `<script>
    window.__PAGE_CONTEXT__=${JSON.stringify(pageContext).replace(/</g, '\\u003c')};
    document.addEventListener('DOMContentLoaded',()=>{
      for(const [id,value] of Object.entries(window.__PAGE_CONTEXT__)){
        const control=document.getElementById(id);
        if(control) control.value=value;
      }
      for(const id of ['countrySelect','languageSelect','styleSelect','customBackground','customOutline','inputText','outputText']){
        const control=document.getElementById(id);
        if(control) control.dispatchEvent(new Event(control.tagName==='SELECT'?'change':'input',{bubbles:true}));
      }
    });
  </script>`;
  if (js) preview = preview.replace(/<\/body\s*>/i, `<script>${js.replace(/<\/script/gi, '<\\/script')}</script>${contextScript}</body>`);
  else preview = preview.replace(/<\/body\s*>/i, `${contextScript}</body>`);
  return preview;
}

function getPreviewPageContext() {
  return {
    runningInPage: true,
    inputText: input.value,
    outputText: output.value,
    languageSelect: languageSelect.value,
    styleSelect: styleSelect.value,
    countrySelect: countrySelect.value,
    customBackground: document.getElementById('customBackground').value,
    customOutline: document.getElementById('customOutline').value
  };
}

function getZipEntries(bytes, view) {
  let endRecord = -1;
  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65557); offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      endRecord = offset;
      break;
    }
  }
  if (endRecord < 0) throw new Error('ZIP directory not found');
  const entryCount = view.getUint16(endRecord + 10, true);
  const directorySize = view.getUint32(endRecord + 12, true);
  let cursor = view.getUint32(endRecord + 16, true);
  if (entryCount > 2000 || cursor + directorySize > bytes.length) throw new Error('Unsupported ZIP directory');

  const decoder = new TextDecoder();
  const entries = [];
  for (let index = 0; index < entryCount; index += 1) {
    if (cursor + 46 > bytes.length || view.getUint32(cursor, true) !== 0x02014b50) throw new Error('Invalid ZIP directory');
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const nameStart = cursor + 46;
    entries.push({
      name: decoder.decode(bytes.slice(nameStart, nameStart + nameLength)).replace(/\\/g, '/'),
      flags: view.getUint16(cursor + 8, true),
      method: view.getUint16(cursor + 10, true),
      compressedSize: view.getUint32(cursor + 20, true),
      uncompressedSize: view.getUint32(cursor + 24, true),
      localOffset: view.getUint32(cursor + 42, true)
    });
    cursor = nameStart + nameLength + extraLength + commentLength;
  }
  return entries;
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createZipBlob(files) {
  if (files.length > 2000) throw new Error('Too many ZIP entries');
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  files.forEach(({ name, data }) => {
    const nameBytes = encoder.encode(name);
    if (nameBytes.length > 65535 || data.length > 0xffffffff || offset > 0xffffffff) throw new Error('ZIP is too large');
    const crc = crc32(data);
    const local = new Uint8Array(30 + nameBytes.length + data.length);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0x0800, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(12, 0x21, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, data.length, true);
    localView.setUint32(22, data.length, true);
    localView.setUint16(26, nameBytes.length, true);
    local.set(nameBytes, 30);
    local.set(data, 30 + nameBytes.length);
    localParts.push(local);

    const central = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(central.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0x0800, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(14, 0x21, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, data.length, true);
    centralView.setUint32(24, data.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint32(42, offset, true);
    central.set(nameBytes, 46);
    centralParts.push(central);
    offset += local.length;
  });

  const centralSize = centralParts.reduce((total, part) => total + part.length, 0);
  if (offset + centralSize > 0xffffffff) throw new Error('ZIP is too large');
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);
  return new Blob([...localParts, ...centralParts, end], { type: 'application/zip' });
}

function makeAdminSignatureFile(signature) {
  return new TextEncoder().encode([
    '// Firma secundaria creada al activar CNV-ADMIN. No es una firma criptográfica.',
    `const FIRMA_VERSION = '${signature}';`,
    ''
  ].join('\n'));
}

/* La función de creación de firma2.js se retiró.
async function signArchive() {
  const file = archiveUpload.files[0];
  if (!adminCnvEnabled || !file) return;
  signArchiveButton.disabled = true;
  signArchiveStatus.textContent = 'Preparando ZIP…';
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const entries = getZipEntries(bytes, view);
    const decoder = new TextDecoder();
    const secondary = entries.find((entry) => /(?:^|\/)firma2\.js$/i.test(entry.name));
    const original = entries.find((entry) => /(?:^|\/)firma\.js$/i.test(entry.name));
    const source = secondary || original;
    let signature;

    if (source) {
      const contents = decoder.decode(await readZipEntry(bytes, view, source));
      const match = contents.match(/\\b(?:const|let|var)\\s+FIRMA_VERSION\\s*=\\s*(['"])(.*?)\\1/);
      if (!match || !isSupportedArchiveSignature(match[2])) throw new Error('No hay una firma de versión válida en el archivo prioritario.');
      signature = match[2];
    } else {
      const now = new Date();
      const date = `${String(now.getUTCDate()).padStart(2, '0')}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCFullYear() % 100).padStart(2, '0')}`;
      signature = `f52V${MINIMUM_ARCHIVE_VERSION}/Mx/${date}`;
    }

    const totalSize = entries.reduce((total, entry) => total + entry.uncompressedSize, 0);
    if (totalSize > 64 * 1024 * 1024) throw new Error('El ZIP supera el límite de 64 MB descomprimidos.');
    const htmlExists = entries.some((entry) => /\\.html?$/i.test(entry.name));
    if (!htmlExists) throw new Error('El ZIP no contiene una página HTML.');

    const signaturePath = secondary?.name
      || `${original ? original.name.slice(0, original.name.lastIndexOf('/') + 1) : ''}firma2.js`;
    const outputFiles = [];
    for (const entry of entries) {
      if (/(?:^|\/)firma2\\.js$/i.test(entry.name)) continue;
      outputFiles.push({ name: entry.name, data: await readZipEntry(bytes, view, entry) });
    }
    outputFiles.push({ name: signaturePath, data: makeAdminSignatureFile(signature) });

    const signedBlob = createZipBlob(outputFiles);
    const url = URL.createObjectURL(signedBlob);
    const download = document.createElement('a');
    download.href = url;
    download.download = file.name.replace(/\\.zip$/i, '') + '-firma2.zip';
    document.body.append(download);
    download.click();
    download.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    signArchiveStatus.textContent = 'ZIP creado con firma2.js. Si está presente, esa firma se verifica antes que Firma.js.';
  } catch (error) {
    signArchiveStatus.textContent = error.message || 'No se pudo crear la firma2.js.';
  } finally {
    signArchiveButton.disabled = false;
  }
}

signArchiveButton.addEventListener('click', signArchive);
*/

function runArchive() {
  if (!archiveUpload.files[0]) {
    archiveStatus.textContent = t('archiveSelectFile');
    return;
  }
  updateArchiveSignature();
  archiveVersionPrompt.hidden = false;
  document.getElementById('confirmArchiveRun').focus();
}

async function executeArchive() {
  const file = archiveUpload.files[0];
  if (!file) {
    archiveStatus.textContent = t('archiveSelectFile');
    return;
  }
  runArchiveButton.disabled = true;
  archiveStatus.textContent = '';
  try {
    archiveFrame.srcdoc = await buildArchivePreview(file, getPreviewPageContext());
    archivePreview.hidden = false;
    document.getElementById('closeArchivePreview').focus();
    archiveStatus.textContent = t('archiveReady');
  } catch (error) {
    archiveStatus.textContent = error.message === 'Firma.js missing'
      ? t('archiveSignatureRequired')
      : error.message === 'Firma.js signature invalid'
        ? t('archiveSignatureInvalid')
        : t('archiveError');
  } finally {
    runArchiveButton.disabled = false;
  }
}

function closeArchive() {
  archivePreview.hidden = true;
  archiveFrame.srcdoc = '';
  runArchiveButton.focus();
}

const MOD_STORAGE_KEY = 'translator-local-mods';

function getCustomAlphabetData() {
  const letters = Array.from(document.getElementById('customAlphabetLetters').value.toLocaleUpperCase('es').replace(/\s/g, ''));
  const start = Number(document.getElementById('customAlphabetStart').value);
  const name = document.getElementById('customAlphabetName').value.trim() || 'Mi alfabeto';
  const expected = Array.from(alphabet).sort().join('');
  if (letters.length !== Array.from(alphabet).length || new Set(letters).size !== letters.length || letters.slice().sort().join('') !== expected) {
    throw new Error('El orden debe incluir una sola vez cada letra del alfabeto español, incluida Ñ.');
  }
  if (!Number.isInteger(start) || start < 1 || start > 99) {
    throw new Error('El número inicial de A debe ser un entero entre 1 y 99.');
  }
  return { name, letters: letters.join(''), start };
}

function applyCustomAlphabet(name, letters, start) {
  const orderedLetters = Array.from(letters);
  const aIndex = orderedLetters.indexOf('A');
  if (aIndex < 0) throw new Error('El alfabeto debe incluir la letra A.');

  // Rotate the chosen order so A receives the selected starting code.
  const lettersFromA = [...orderedLetters.slice(aIndex), ...orderedLetters.slice(0, aIndex)];
  const orderedCharacters = [
    ...lettersFromA,
    ...lettersFromA.map((character) => character.toLocaleLowerCase('es')),
    ...'0123456789',
    ...punctuation
  ];
  const codes = orderedCharacters.map((character, index) => [character, start + index]);
  if (codes.some(([, code]) => code > 999)) {
    throw new Error('El número inicial es demasiado alto para códigos de hasta 3 cifras.');
  }

  characterCodes = new Map(codes);
  charactersByCode = new Map(codes.map(([character, code]) => [code, character]));
  setOutput('');
  showMessage('');
  const status = document.getElementById('customAlphabetStatus');
  status.textContent = `Alfabeto «${name}» aplicado al traductor. A comienza en ${start}.`;
  status.classList.add('success');
}

function customAlphabetFileContents(data) {
  return `CNV-CUSTOM\nNAME=${data.name.replace(/[\r\n]/g, ' ')}\nSTART=${data.start}\nALPHABET=${data.letters}\n`;
}

function applyCustomAlphabetFromForm() {
  try {
    const data = getCustomAlphabetData();
    applyCustomAlphabet(data.name, data.letters, data.start);
  } catch (error) {
    const status = document.getElementById('customAlphabetStatus');
    status.textContent = error.message;
    status.classList.remove('success');
  }
}

async function importCustomAlphabetFile() {
  const file = document.getElementById('importCustomAlphabet').files[0];
  const status = document.getElementById('customAlphabetStatus');
  if (!file) return;
  try {
    const lines = (await file.text()).replace(/^\uFEFF/, '').split(/\r?\n/);
    if (!lines.some((line) => /^\s*CNV-CUSTOM\s*$/i.test(line))) throw new Error('El archivo no es un CNV-CUSTOM válido.');
    const values = Object.fromEntries(lines.map((line) => {
      const match = line.match(/^\s*([A-Z]+)\s*=\s*(.*)\s*$/i);
      return match ? [match[1].toUpperCase(), match[2]] : [];
    }).filter((entry) => entry.length));
    const name = values.NAME || file.name.replace(/\.cnv$/i, '');
    const letters = Array.from((values.ALPHABET || '').toLocaleUpperCase('es').replace(/\s/g, '')).join('');
    const start = Number(values.START);
    const expected = Array.from(alphabet).sort().join('');
    if (letters.length !== Array.from(alphabet).length || new Set(letters).size !== letters.length || letters.split('').sort().join('') !== expected || !Number.isInteger(start) || start < 1 || start > 99) {
      throw new Error('El archivo debe contener todas las letras una sola vez y un número inicial entre 1 y 99.');
    }
    document.getElementById('customAlphabetName').value = name;
    document.getElementById('customAlphabetLetters').value = letters;
    document.getElementById('customAlphabetStart').value = start;
    applyCustomAlphabet(name, letters, start);
  } catch (error) {
    status.textContent = error.message || 'No se pudo importar el alfabeto.';
    status.classList.remove('success');
  }
}

function getModVisualSettings() {
  return {
    background: document.getElementById('modVisualBackground').value,
    image: document.getElementById('modVisualImage').value.trim()
  };
}

function getSafeModBackgroundImage(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
  } catch {
    return '';
  }
}

let activeVisualModId = null;

function applyVisualMod(settings, modId = null) {
  const image = getSafeModBackgroundImage(settings.image || '');
  document.body.classList.add('visual-mod-active');
  document.body.style.setProperty('--visual-mod-background', settings.background || '#eaf3ff');
  document.body.style.setProperty('--visual-mod-image', image ? `url(${JSON.stringify(image)})` : 'none');
  activeVisualModId = modId;
}

function resetVisualMod() {
  document.body.classList.remove('visual-mod-active');
  document.body.style.removeProperty('--visual-mod-background');
  document.body.style.removeProperty('--visual-mod-image');
  activeVisualModId = null;
}

function escapeModHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function createVisualModCode(settings = getModVisualSettings()) {
  const image = getSafeModBackgroundImage(settings.image || '');
  return `(() => {
  document.body.style.backgroundColor = ${JSON.stringify(settings.background || '#eaf3ff')};
  document.body.style.backgroundImage = ${image ? `url(${JSON.stringify(image)})` : "'none'"};
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
  document.body.style.backgroundAttachment = 'fixed';
})();`;
}

function updateModVisualPreview() {
  const settings = getModVisualSettings();
  const preview = document.getElementById('modVisualPreview');
  const image = getSafeModBackgroundImage(settings.image);
  preview.srcdoc = `<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{min-height:100%;margin:0}body{background-color:${settings.background};background-image:${image ? `url(${JSON.stringify(image)})` : 'none'};background-size:cover;background-position:center;background-attachment:fixed;font:14px system-ui,sans-serif;color:#20334f}.sample{margin:22px;padding:18px;border:1px solid #ffffff99;border-radius:14px;background:#ffffffcc}</style></head><body><div class="sample">Así se verá el fondo de la página</div></body></html>`;
  document.getElementById('modCode').value = createVisualModCode(settings);
}

function setModEditorMode(mode) {
  const visual = mode === 'visual';
  document.getElementById('modCodePanel').hidden = visual;
  document.getElementById('modVisualPanel').hidden = !visual;
  document.getElementById('modCodeTab').setAttribute('aria-selected', String(!visual));
  document.getElementById('modVisualTab').setAttribute('aria-selected', String(visual));
  if (visual) updateModVisualPreview();
}

function readMods() {
  try {
    const mods = JSON.parse(localStorage.getItem(MOD_STORAGE_KEY) || '[]');
    return Array.isArray(mods)
      ? mods.filter((mod) => mod && typeof mod.id === 'string' && typeof mod.name === 'string' && typeof mod.code === 'string')
      : [];
  } catch {
    return [];
  }
}

function writeMods(mods) {
  localStorage.setItem(MOD_STORAGE_KEY, JSON.stringify(mods));
}

function renderMods(selectedId = document.getElementById('modSelect').value) {
  const select = document.getElementById('modSelect');
  const mods = readMods();
  select.replaceChildren();
  if (!mods.length) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'No hay mods guardados';
    select.append(option);
  } else {
    mods.forEach((mod) => {
      const option = document.createElement('option');
      option.value = mod.id;
      option.textContent = mod.name;
      select.append(option);
    });
  }
  if (mods.some((mod) => mod.id === selectedId)) select.value = selectedId;
  document.getElementById('executeMod').disabled = !mods.length;
  document.getElementById('deleteMod').disabled = !mods.length;
  return mods;
}

function loadModIntoEditor() {
  const mod = readMods().find((item) => item.id === document.getElementById('modSelect').value);
  document.getElementById('modName').value = mod?.name || '';
  document.getElementById('modCode').value = mod?.code || '';
  if (mod?.visual) {
    document.getElementById('modVisualBackground').value = mod.visual.background || '#eaf3ff';
    document.getElementById('modVisualImage').value = mod.visual.image || '';
    setModEditorMode('visual');
  } else {
    setModEditorMode('code');
  }
  document.getElementById('deleteMod').disabled = !mod;
  document.getElementById('executeMod').disabled = !mod;
}

function createModId() {
  return window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function saveCurrentMod() {
  const name = document.getElementById('modName').value.trim();
  const visualMode = !document.getElementById('modVisualPanel').hidden;
  const visual = visualMode ? getModVisualSettings() : null;
  const code = visualMode ? createVisualModCode(visual) : document.getElementById('modCode').value;
  const status = document.getElementById('modStatus');
  if (visualMode && visual.image && !getSafeModBackgroundImage(visual.image)) {
    status.textContent = 'La imagen debe tener una URL HTTP o HTTPS válida.';
    return;
  }
  if (!name || !code.trim()) {
    status.textContent = 'Escribe un nombre y código JavaScript para guardar el mod.';
    return;
  }
  if (code.length > 200000) {
    status.textContent = 'El código supera el límite de 200 KB.';
    return;
  }
  const mods = readMods();
  const selectedId = document.getElementById('modSelect').value;
  const existing = mods.find((mod) => mod.id === selectedId);
  const saved = { id: existing?.id || createModId(), name: name.slice(0, 60), code };
  if (visualMode) saved.visual = visual;
  const nextMods = existing
    ? mods.map((mod) => mod.id === existing.id ? saved : mod)
    : [...mods, saved];
  try {
    writeMods(nextMods);
    renderMods(saved.id);
    loadModIntoEditor();
    status.textContent = 'Mod guardado en este navegador.';
  } catch {
    status.textContent = 'No se pudo guardar el mod en el almacenamiento del navegador.';
  }
}

async function importModFile() {
  const file = document.getElementById('modImportFile').files[0];
  const status = document.getElementById('modStatus');
  if (!file) {
    status.textContent = 'Selecciona un archivo .json o .js primero.';
    return;
  }
  if (file.size > 200000) {
    status.textContent = 'El archivo supera el límite de 200 KB.';
    return;
  }
  try {
    const contents = await file.text();
    const isJson = file.name.toLowerCase().endsWith('.json');
    const modData = isJson ? JSON.parse(contents) : { name: file.name.replace(/\.js$/i, ''), code: contents };
    if (!modData || typeof modData.name !== 'string' || typeof modData.code !== 'string' || !modData.name.trim() || !modData.code.trim()) {
      throw new Error('Formato inválido');
    }
    const mods = readMods();
    const imported = { id: createModId(), name: modData.name.trim().slice(0, 60), code: modData.code };
    writeMods([...mods, imported]);
    renderMods(imported.id);
    loadModIntoEditor();
    status.textContent = `Mod «${imported.name}» importado y guardado.`;
  } catch {
    status.textContent = 'No se pudo importar. Usa un .js o un JSON con las propiedades name y code.';
  }
}

function executeSelectedMod() {
  const mod = readMods().find((item) => item.id === document.getElementById('modSelect').value);
  const status = document.getElementById('modStatus');
  if (!mod) {
    status.textContent = 'Selecciona un mod guardado primero.';
    return;
  }
  document.getElementById('modRunnerFrame').hidden = true;
  document.getElementById('modRunnerFrame').srcdoc = '';
  if (mod.visual) {
    if (mod.visual.image && !getSafeModBackgroundImage(mod.visual.image)) {
      status.textContent = 'La imagen debe tener una URL HTTP o HTTPS válida.';
      return;
    }
    applyVisualMod(mod.visual, mod.id);
    status.textContent = `Apariencia de «${mod.name}» aplicada a la página.`;
    return;
  }
  resetVisualMod();
  const safeCode = mod.code.replace(/<\/script/gi, '<\\/script');
  const frame = document.getElementById('modRunnerFrame');
  frame.srcdoc = `<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'none'; form-action 'none'; object-src 'none'; base-uri 'none'"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${mod.name.replace(/[&<>"']/g, '')}</title><style>body{margin:0;padding:16px;font:14px system-ui,sans-serif;color:#20334f;background:#fff;overflow-wrap:anywhere}pre{white-space:pre-wrap}</style></head><body><p>Mod ejecutándose en un entorno aislado.</p><script>${safeCode}<\/script></body></html>`;
  frame.hidden = false;
  status.textContent = `Ejecutando «${mod.name}» en un marco aislado. El mod no puede acceder a la página principal ni a su almacenamiento.`;
}

function deleteSelectedMod() {
  const selectedId = document.getElementById('modSelect').value;
  const remaining = readMods().filter((mod) => mod.id !== selectedId);
  if (activeVisualModId === selectedId) resetVisualMod();
  try {
    writeMods(remaining);
    document.getElementById('modRunnerFrame').hidden = true;
    document.getElementById('modRunnerFrame').srcdoc = '';
    renderMods(remaining[0]?.id || '');
    loadModIntoEditor();
    document.getElementById('modStatus').textContent = 'Mod eliminado.';
  } catch {
    document.getElementById('modStatus').textContent = 'No se pudo actualizar el almacenamiento de mods.';
  }
}



function createVirtualHtml() {
  /*<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Traductor virtual renovado</title>
<style>
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:#172b4d;background:#edf4ff;font-synthesis:none}*{box-sizing:border-box}body{margin:0;min-width:320px;min-height:100vh;padding:28px 16px 50px;background:radial-gradient(ellipse at 10% 0,#d9eaff,transparent 45%),linear-gradient(135deg,#f4f7ff,#edf4ff 55%,#fff0f1)}main{width:min(100%,920px);margin:auto}.hero{padding:10px 4px 24px}.eyebrow{font-size:.75rem;font-weight:800;letter-spacing:.14em;color:#c63d57}.hero h1{margin:8px 0;color:#174b83;font-size:clamp(2rem,6vw,3.3rem);letter-spacing:-.05em}.hero p{margin:0;color:#5a6d89;line-height:1.6}.tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:12px 0 16px;padding:7px;border:1px solid #c6d9f1;border-radius:15px;background:#e5effc}.tab{min-height:46px;padding:9px;border:0;border-radius:10px;background:transparent;color:#34516f;font:inherit;font-weight:750;cursor:pointer}.tab[aria-selected=true]{background:#1765ad;color:white;box-shadow:0 4px 12px #1765ad30}.panel{padding:clamp(18px,4vw,30px);border:1px solid #c5d9f1;border-radius:20px;background:#fff;box-shadow:0 14px 36px #254d7810}.panel[hidden]{display:none}h2{margin:0 0 7px;color:#174b83;font-size:1.4rem} .sub{margin:0 0 20px;color:#64758d;line-height:1.5}label{display:block;margin:16px 0 7px;color:#234d78;font-size:.9rem;font-weight:750}textarea,input,select{width:100%;min-height:45px;padding:11px 13px;border:1px solid #b9cfea;border-radius:11px;background:#f8fbff;color:#20334f;font:inherit}textarea{min-height:118px;resize:vertical;line-height:1.5}textarea:focus,input:focus,select:focus{outline:3px solid #1765ad2a;border-color:#1765ad}textarea[readonly]{background:#eff5fc}.row{display:flex;flex-wrap:wrap;gap:9px;margin-top:13px}.row>*{flex:1 1 140px}.btn{min-height:44px;padding:10px 15px;border:0;border-radius:10px;background:#1765ad;color:white;font:inherit;font-weight:750;cursor:pointer}.btn.secondary{background:#f4dfe3;color:#9d293a}.btn:hover{filter:brightness(.95)}.btn:disabled{opacity:.5;cursor:not-allowed}.hint,.status{min-height:1.4em;color:#64758d;font-size:.86rem;line-height:1.5}.status.error{color:#b32f42}.status.success{color:#19704a}.stamp{margin:10px 0 0;color:#526b88;font-size:.82rem}.badge{display:inline-flex;padding:5px 9px;border-radius:99px;background:#e4f1ff;color:#1765ad;font-size:.78rem;font-weight:750}.alphabet-box,.result-box{margin-top:16px;padding:14px;border:1px solid #d1e1f2;border-radius:12px;background:#f5f9ff;overflow-wrap:anywhere}.meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:12px}.meta div{padding:10px;border-radius:9px;background:#e9f2fd}.meta small{display:block;color:#63758c}.meta strong{display:block;margin-top:4px;overflow-wrap:anywhere}.history{display:grid;gap:8px;margin-top:14px}.history-item{padding:11px;border-radius:10px;background:#f2f6fc;overflow-wrap:anywhere}.history-item time{display:block;margin-top:5px;color:#708096;font-size:.77rem}.info{padding:12px;border-radius:11px;background:#edf5ff;color:#526b88;font-size:.86rem;line-height:1.5}.twitch-result{margin-top:16px;padding:15px;border-radius:12px;background:#f2f6fc;line-height:1.65;overflow-wrap:anywhere}.twitch-result p{margin:5px 0}.footer{margin:18px 0 0;text-align:center;color:#708096;font-size:.8rem}@media(max-width:620px){.tabs{grid-template-columns:repeat(2,minmax(0,1fr))}.tab{font-size:.86rem}.row>*{flex-basis:100%}}
</style>
</head>
<body>
<main>
<header class="hero"><span class="eyebrow" id="eyebrow">HTML VIRTUAL · LABORATORIO</span><h1 id="appTitle">Traductor renovado</h1><p id="appDescription">Versión de pruebas independiente: experimenta aquí sin modificar el traductor original.</p></header>
<nav class="tabs" role="tablist" aria-label="Secciones">
<button class="tab" role="tab" id="tab-translate" aria-controls="view-translate" aria-selected="true" data-tab="translate">1 · Traductor</button><button class="tab" role="tab" id="tab-cnv" aria-controls="view-cnv" aria-selected="false" data-tab="cnv">2 · CNV y alfabeto</button><button class="tab" role="tab" id="tab-languages" aria-controls="view-languages" aria-selected="false" data-tab="languages">3 · Idiomas</button><button class="tab" role="tab" id="tab-twitch" aria-controls="view-twitch" aria-selected="false" data-tab="twitch">4 · Twitch</button>
</nav>
<section class="panel" id="view-translate" role="tabpanel" aria-labelledby="tab-translate"><h2 data-i="translateTitle">Traducción</h2><p class="sub" data-i="translateDesc">Convierte texto en códigos o descifra códigos numéricos.</p><label for="source" data-i="sourceLabel">Texto o códigos</label><textarea id="source" placeholder="Ejemplo: HOLA o 8 16 12 1"></textarea><div class="row"><button class="btn" id="encode" data-i="encode">Texto → números</button><button class="btn secondary" id="decode" data-i="decode">Números → texto</button><button class="btn secondary" id="clear" data-i="clear">Limpiar</button></div><label for="result" data-i="resultLabel">Resultado</label><textarea id="result" readonly placeholder="El resultado aparecerá aquí"></textarea><div class="row"><button class="btn secondary" id="copy" data-i="copy" disabled>Copiar resultado</button></div><p class="status" id="translateStatus" role="status" aria-live="polite"></p><p class="stamp" id="translationTime" aria-live="polite">Aún no hay traducciones.</p><div class="result-box"><strong data-i="recentTitle">Historial reciente</strong><div class="history" id="history"><p class="hint" data-i="historyEmpty">Las traducciones aparecerán aquí con su hora.</p></div></div></section>
<section class="panel" id="view-cnv" role="tabpanel" aria-labelledby="tab-cnv" hidden><h2 data-i="cnvTitle">Archivos CNV y alfabeto</h2><p class="sub" data-i="cnvDesc">Carga un archivo CNV compatible para cambiar el orden del alfabeto en este HTML virtual.</p><label for="cnvFile" data-i="fileLabel">Archivo CNV</label><input id="cnvFile" type="file" accept=".cnv,text/plain"><div class="row"><button class="btn" id="loadCnv" data-i="loadCnv">Cargar y aplicar</button><button class="btn secondary" id="resetAlphabet" data-i="resetAlphabet">Restaurar alfabeto original</button></div><p class="status" id="cnvStatus" role="status" aria-live="polite"></p><div class="meta" id="cnvMetadata" hidden></div><div class="alphabet-box"><strong data-i="activeAlphabet">Alfabeto activo</strong><p id="alphabetName" class="badge">Original</p><p id="alphabetDisplay" style="line-height:1.8;overflow-wrap:anywhere"></p></div><div class="info" data-i="cnvInfo">Formatos admitidos: CNV-ALEXIS, CNV-CARPO y CNV-ADMIN. El alfabeto seleccionado se usa también en las traducciones de la pestaña 1.</div></section>
<section class="panel" id="view-languages" role="tabpanel" aria-labelledby="tab-languages" hidden><h2 data-i="languageTitle">Idiomas</h2><p class="sub" data-i="languageDesc">Cambia el idioma de la interfaz de prueba. Los códigos se basan en el alfabeto activo.</p><label for="language" data-i="interfaceLanguage">Idioma de la interfaz</label><select id="language"><option value="es">Español</option><option value="en">English</option><option value="fr">Français</option><option value="pt">Português</option><option value="de">Deutsch</option><option value="it">Italiano</option><option value="nl">Nederlands</option><option value="ca">Català</option><option value="ja">日本語</option><option value="zh">中文</option></select><div class="info" style="margin-top:16px" data-i="languageInfo">La interfaz ya está disponible en diez idiomas. Las letras con acentos se normalizan al alfabeto latino; el contenido escrito no se traduce automáticamente entre idiomas.</div><p class="stamp" id="localePreview"></p></section>
<section class="panel" id="view-twitch" role="tabpanel" aria-labelledby="tab-twitch" hidden><h2 data-i="twitchTitle">Conexión con Twitch</h2><p class="sub" data-i="twitchDesc">Conéctate a un canal público y descifra mensajes que sean códigos válidos.</p><label for="channel" data-i="channelLabel">Canal de Twitch</label><input id="channel" autocomplete="off" spellcheck="false" placeholder="nombre_del_canal"><div class="row"><button class="btn" id="connect" data-i="connect">Conectar</button><button class="btn secondary" id="disconnect" data-i="disconnect" disabled>Desconectar</button><label style="display:flex;align-items:center;gap:8px;flex:1 1 190px;margin:0;padding:10px"><input id="voice" type="checkbox" style="width:auto;min-height:0" data-i-aria="voiceLabel"><span data-i="voiceLabel">Leer traducciones en voz alta</span></label></div><p class="status" id="twitchStatus" role="status" aria-live="polite">Desconectado.</p><div class="twitch-result"><p><strong data-i="lastMessage">Último mensaje:</strong> <span id="twitchOriginal">—</span></p><p><strong data-i="twitchTranslation">Traducción:</strong> <span id="twitchDecoded">—</span></p><p class="stamp" id="twitchTime"></p></div><div class="info" data-i="twitchInfo">La conexión requiere acceso a Internet y puede estar bloqueada por las políticas del navegador. Twitch no garantiza la disponibilidad permanente del servicio.</div></section>
<footer class="footer" data-i="footer">HTML virtual de pruebas · Los cambios se quedan en esta vista.</footer>
</main>
<script>
(()=>{
const dictionaries={
es:{translateTitle:'Traducción',translateDesc:'Convierte texto en códigos o descifra códigos numéricos.',sourceLabel:'Texto o códigos',encode:'Texto → números',decode:'Números → texto',clear:'Limpiar',resultLabel:'Resultado',copy:'Copiar resultado',copied:'Resultado copiado.',copyFail:'No se pudo copiar.',empty:'Escribe texto o códigos para empezar.',badChar:c=>'Carácter no admitido: '+c,recentTitle:'Historial reciente',historyEmpty:'Las traducciones aparecerán aquí con su hora.',translated:'Traducción completada.',badCodes:'Usa códigos de hasta 2 dígitos; separa palabras con dos espacios.',badCode:n=>'El código '+n+' no es válido.',timeLabel:'Traducido el',cnvTitle:'Archivos CNV y alfabeto',cnvDesc:'Carga un archivo CNV compatible para cambiar el orden del alfabeto en este HTML virtual.',fileLabel:'Archivo CNV',loadCnv:'Cargar y aplicar',resetAlphabet:'Restaurar alfabeto original',activeAlphabet:'Alfabeto activo',cnvInfo:'Formatos admitidos: CNV-ALEXIS, CNV-CARPO y CNV-ADMIN. El alfabeto seleccionado se usa también en las traducciones de la pestaña 1.',cnvInvalid:'Archivo CNV no válido. Usa CNV-ALEXIS, CNV-CARPO o CNV-ADMIN.',cnvApplied:'Alfabeto aplicado.',cnvReset:'Alfabeto original restaurado.',languageTitle:'Idiomas',languageDesc:'Cambia el idioma de la interfaz de prueba. Los códigos se basan en el alfabeto activo.',interfaceLanguage:'Idioma de la interfaz',languageInfo:'La interfaz está disponible en diez idiomas. Las letras con acentos se normalizan al alfabeto latino; el contenido no se traduce automáticamente entre idiomas.',twitchTitle:'Conexión con Twitch',twitchDesc:'Conéctate a un canal público y descifra mensajes que sean códigos válidos.',channelLabel:'Canal de Twitch',connect:'Conectar',disconnect:'Desconectar',voiceLabel:'Leer traducciones en voz alta',disconnected:'Desconectado.',lastMessage:'Último mensaje:',twitchTranslation:'Traducción:',twitchInfo:'Requiere Internet y puede estar bloqueado por el navegador. Twitch no garantiza la disponibilidad permanente del servicio.',footer:'HTML virtual de pruebas · Los cambios se quedan en esta vista.',appTitle:'Traductor renovado',appDescription:'Versión de pruebas independiente: experimenta aquí sin modificar el traductor original.',locale:'Idioma activo'},
en:{translateTitle:'Translation',translateDesc:'Turn text into codes or decode number codes.',sourceLabel:'Text or codes',encode:'Text → numbers',decode:'Numbers → text',clear:'Clear',resultLabel:'Result',copy:'Copy result',copied:'Result copied.',copyFail:'Could not copy.',empty:'Enter text or codes to begin.',recentTitle:'Recent history',historyEmpty:'Translations will appear here with their time.',translated:'Translation complete.',badCodes:'Use codes up to 2 digits; separate words with two spaces.',badCode:n=>'Code '+n+' is invalid.',timeLabel:'Translated at',cnvTitle:'CNV files & alphabet',cnvDesc:'Load a compatible CNV file to change the alphabet order in this virtual HTML.',fileLabel:'CNV file',loadCnv:'Load and apply',resetAlphabet:'Restore original alphabet',activeAlphabet:'Active alphabet',cnvInfo:'Supported formats: CNV-ALEXIS, CNV-CARPO, and CNV-ADMIN. The selected alphabet is also used for translations in tab 1.',cnvInvalid:'Invalid CNV file. Use CNV-ALEXIS, CNV-CARPO, or CNV-ADMIN.',cnvApplied:'Alphabet applied.',cnvReset:'Original alphabet restored.',languageTitle:'Languages',languageDesc:'Change the test interface language. Codes use the active alphabet.',interfaceLanguage:'Interface language',languageInfo:'The interface is available in ten languages. Accented letters are normalized to the Latin alphabet; text is not automatically translated between languages.',twitchTitle:'Twitch connection',twitchDesc:'Connect to a public channel and decode messages that contain valid codes.',channelLabel:'Twitch channel',connect:'Connect',disconnect:'Disconnect',voiceLabel:'Read translations aloud',disconnected:'Disconnected.',lastMessage:'Last message:',twitchTranslation:'Translation:',twitchInfo:'Requires Internet access and may be blocked by browser policies. Twitch does not guarantee permanent service availability.',footer:'Virtual test HTML · Changes stay in this view.',appTitle:'Renewed translator',appDescription:'Independent test version: experiment here without changing the original translator.',locale:'Active language'},
fr:{translateTitle:'Traduction',translateDesc:'Convertissez du texte en codes ou décodez des codes numériques.',sourceLabel:'Texte ou codes',encode:'Texte → nombres',decode:'Nombres → texte',clear:'Effacer',resultLabel:'Résultat',copy:'Copier le résultat',copied:'Résultat copié.',copyFail:'Copie impossible.',empty:'Saisissez du texte ou des codes.',recentTitle:'Historique récent',historyEmpty:'Les traductions apparaîtront ici avec leur heure.',translated:'Traduction terminée.',badCodes:'Utilisez des codes de 2 chiffres maximum et deux espaces entre les mots.',badCode:n=>`Le code ${n} est invalide.`,timeLabel:'Traduit à',cnvTitle:'Fichiers CNV et alphabet',cnvDesc:'Chargez un fichier CNV compatible pour modifier l’alphabet.',fileLabel:'Fichier CNV',loadCnv:'Charger et appliquer',resetAlphabet:'Restaurer l’alphabet d’origine',activeAlphabet:'Alphabet actif',cnvInfo:'Formats acceptés : CNV-ALEXIS, CNV-CARPO et CNV-ADMIN. Cet alphabet est utilisé dans l’onglet 1.',cnvInvalid:'Fichier CNV invalide.',cnvApplied:'Alphabet appliqué.',cnvReset:'Alphabet d’origine restauré.',languageTitle:'Langues',languageDesc:'Changez la langue de l’interface de test.',interfaceLanguage:'Langue de l’interface',languageInfo:'Interface disponible en dix langues. Les accents sont normalisés en alphabet latin ; le texte n’est pas traduit automatiquement.',twitchTitle:'Connexion Twitch',twitchDesc:'Connectez-vous à une chaîne publique pour décoder les codes valides.',channelLabel:'Chaîne Twitch',connect:'Connecter',disconnect:'Déconnecter',voiceLabel:'Lire les traductions à voix haute',disconnected:'Déconnecté.',lastMessage:'Dernier message :',twitchTranslation:'Traduction :',twitchInfo:'Connexion Internet requise et potentiellement bloquée par le navigateur.',footer:'HTML virtuel de test · Les changements restent dans cette vue.',appTitle:'Traducteur renouvelé',appDescription:'Version de test indépendante, sans modifier le traducteur original.',locale:'Langue active'},
pt:{translateTitle:'Tradução',translateDesc:'Converta textos em códigos ou decifre códigos numéricos.',sourceLabel:'Texto ou códigos',encode:'Texto → números',decode:'Números → texto',clear:'Limpar',resultLabel:'Resultado',copy:'Copiar resultado',copied:'Resultado copiado.',copyFail:'Não foi possível copiar.',empty:'Digite texto ou códigos para começar.',recentTitle:'Histórico recente',historyEmpty:'As traduções aparecerão aqui com o horário.',translated:'Tradução concluída.',badCodes:'Use códigos de até 2 dígitos e dois espaços entre palavras.',badCode:n=>`O código ${n} é inválido.`,timeLabel:'Traduzido às',cnvTitle:'Arquivos CNV e alfabeto',cnvDesc:'Carregue um arquivo CNV compatível para alterar a ordem do alfabeto.',fileLabel:'Arquivo CNV',loadCnv:'Carregar e aplicar',resetAlphabet:'Restaurar alfabeto original',activeAlphabet:'Alfabeto ativo',cnvInfo:'Formatos aceitos: CNV-ALEXIS, CNV-CARPO e CNV-ADMIN. O alfabeto ativo também é usado na aba 1.',cnvInvalid:'Arquivo CNV inválido.',cnvApplied:'Alfabeto aplicado.',cnvReset:'Alfabeto original restaurado.',languageTitle:'Idiomas',languageDesc:'Altere o idioma da interface de teste.',interfaceLanguage:'Idioma da interface',languageInfo:'Interface disponível em dez idiomas. Acentos são normalizados para o alfabeto latino; o texto não é traduzido automaticamente.',twitchTitle:'Conexão com Twitch',twitchDesc:'Conecte-se a um canal público e decifre mensagens com códigos válidos.',channelLabel:'Canal da Twitch',connect:'Conectar',disconnect:'Desconectar',voiceLabel:'Ler traduções em voz alta',disconnected:'Desconectado.',lastMessage:'Última mensagem:',twitchTranslation:'Tradução:',twitchInfo:'Requer Internet e pode ser bloqueado pelas políticas do navegador.',footer:'HTML virtual de teste · As alterações ficam nesta visualização.',appTitle:'Tradutor renovado',appDescription:'Versão de teste independente, sem alterar o tradutor original.',locale:'Idioma ativo'},
de:{translateTitle:'Übersetzung',translateDesc:'Wandle Text in Codes um oder entschlüssele Zahlencodes.',sourceLabel:'Text oder Codes',encode:'Text → Zahlen',decode:'Zahlen → Text',clear:'Leeren',resultLabel:'Ergebnis',copy:'Ergebnis kopieren',copied:'Ergebnis kopiert.',copyFail:'Kopieren nicht möglich.',empty:'Text oder Codes eingeben.',recentTitle:'Letzte Übersetzungen',historyEmpty:'Übersetzungen erscheinen hier mit Uhrzeit.',translated:'Übersetzung abgeschlossen.',badCodes:'Codes mit bis zu 2 Ziffern verwenden; Wörter mit zwei Leerzeichen trennen.',badCode:n=>`Code ${n} ist ungültig.`,timeLabel:'Übersetzt um',cnvTitle:'CNV-Dateien und Alphabet',cnvDesc:'Lade eine kompatible CNV-Datei, um die Alphabetreihenfolge zu ändern.',fileLabel:'CNV-Datei',loadCnv:'Laden und anwenden',resetAlphabet:'Ursprüngliches Alphabet',activeAlphabet:'Aktives Alphabet',cnvInfo:'Unterstützt: CNV-ALEXIS, CNV-CARPO und CNV-ADMIN. Das Alphabet gilt auch für Tab 1.',cnvInvalid:'Ungültige CNV-Datei.',cnvApplied:'Alphabet angewendet.',cnvReset:'Ursprüngliches Alphabet wiederhergestellt.',languageTitle:'Sprachen',languageDesc:'Ändere die Sprache der Testoberfläche.',interfaceLanguage:'Oberflächensprache',languageInfo:'Oberfläche in zehn Sprachen. Akzente werden normalisiert; Texte werden nicht automatisch übersetzt.',twitchTitle:'Twitch-Verbindung',twitchDesc:'Verbinde dich mit einem öffentlichen Kanal und entschlüssele gültige Codes.',channelLabel:'Twitch-Kanal',connect:'Verbinden',disconnect:'Trennen',voiceLabel:'Übersetzungen vorlesen',disconnected:'Getrennt.',lastMessage:'Letzte Nachricht:',twitchTranslation:'Übersetzung:',twitchInfo:'Internet erforderlich; Browserrichtlinien können die Verbindung blockieren.',footer:'Virtuelles Test-HTML · Änderungen bleiben in dieser Ansicht.',appTitle:'Erneuerter Übersetzer',appDescription:'Unabhängige Testversion ohne Änderung des Originals.',locale:'Aktive Sprache'},
it:{translateTitle:'Traduzione',translateDesc:'Converti il testo in codici o decifra codici numerici.',sourceLabel:'Testo o codici',encode:'Testo → numeri',decode:'Numeri → testo',clear:'Cancella',resultLabel:'Risultato',copy:'Copia risultato',copied:'Risultato copiato.',copyFail:'Impossibile copiare.',empty:'Inserisci testo o codici.',recentTitle:'Cronologia recente',historyEmpty:'Le traduzioni appariranno qui con l’ora.',translated:'Traduzione completata.',badCodes:'Usa codici fino a 2 cifre e due spazi tra le parole.',badCode:n=>`Il codice ${n} non è valido.`,timeLabel:'Tradotto alle',cnvTitle:'File CNV e alfabeto',cnvDesc:'Carica un file CNV compatibile per modificare l’ordine dell’alfabeto.',fileLabel:'File CNV',loadCnv:'Carica e applica',resetAlphabet:'Ripristina alfabeto originale',activeAlphabet:'Alfabeto attivo',cnvInfo:'Formati: CNV-ALEXIS, CNV-CARPO e CNV-ADMIN. L’alfabeto è usato anche nella scheda 1.',cnvInvalid:'File CNV non valido.',cnvApplied:'Alfabeto applicato.',cnvReset:'Alfabeto originale ripristinato.',languageTitle:'Lingue',languageDesc:'Cambia la lingua dell’interfaccia di test.',interfaceLanguage:'Lingua interfaccia',languageInfo:'Interfaccia disponibile in dieci lingue. Gli accenti sono normalizzati; il testo non viene tradotto automaticamente.',twitchTitle:'Connessione Twitch',twitchDesc:'Connettiti a un canale pubblico e decifra i codici validi.',channelLabel:'Canale Twitch',connect:'Connetti',disconnect:'Disconnetti',voiceLabel:'Leggi le traduzioni ad alta voce',disconnected:'Disconnesso.',lastMessage:'Ultimo messaggio:',twitchTranslation:'Traduzione:',twitchInfo:'Richiede Internet e può essere bloccato dal browser.',footer:'HTML virtuale di test · Le modifiche restano in questa vista.',appTitle:'Traduttore rinnovato',appDescription:'Versione di test indipendente che non modifica l’originale.',locale:'Lingua attiva'},
nl:{translateTitle:'Vertaling',translateDesc:'Zet tekst om in codes of ontcijfer cijfercodes.',sourceLabel:'Tekst of codes',encode:'Tekst → cijfers',decode:'Cijfers → tekst',clear:'Wissen',resultLabel:'Resultaat',copy:'Resultaat kopiëren',copied:'Resultaat gekopieerd.',copyFail:'Kopiëren mislukt.',empty:'Voer tekst of codes in.',recentTitle:'Recente geschiedenis',historyEmpty:'Vertalingen verschijnen hier met tijd.',translated:'Vertaling voltooid.',badCodes:'Gebruik codes van maximaal 2 cijfers; scheid woorden met twee spaties.',badCode:n=>`Code ${n} is ongeldig.`,timeLabel:'Vertaald om',cnvTitle:'CNV-bestanden en alfabet',cnvDesc:'Laad een compatibel CNV-bestand om de alfabetvolgorde te wijzigen.',fileLabel:'CNV-bestand',loadCnv:'Laden en toepassen',resetAlphabet:'Origineel alfabet herstellen',activeAlphabet:'Actief alfabet',cnvInfo:'Ondersteund: CNV-ALEXIS, CNV-CARPO en CNV-ADMIN. Het actieve alfabet geldt ook voor tab 1.',cnvInvalid:'Ongeldig CNV-bestand.',cnvApplied:'Alfabet toegepast.',cnvReset:'Origineel alfabet hersteld.',languageTitle:'Talen',languageDesc:'Wijzig de taal van de testinterface.',interfaceLanguage:'Interfacetaal',languageInfo:'Interface beschikbaar in tien talen. Accenten worden genormaliseerd; tekst wordt niet automatisch vertaald.',twitchTitle:'Twitch-verbinding',twitchDesc:'Verbind met een openbaar kanaal en decodeer geldige codes.',channelLabel:'Twitch-kanaal',connect:'Verbinden',disconnect:'Verbreken',voiceLabel:'Vertalingen hardop voorlezen',disconnected:'Niet verbonden.',lastMessage:'Laatste bericht:',twitchTranslation:'Vertaling:',twitchInfo:'Internet vereist; browserbeleid kan de verbinding blokkeren.',footer:'Virtuele test-HTML · Wijzigingen blijven in deze weergave.',appTitle:'Vernieuwde vertaler',appDescription:'Onafhankelijke testversie; het origineel blijft ongewijzigd.',locale:'Actieve taal'},
ca:{translateTitle:'Traducció',translateDesc:'Converteix text en codis o desxifra codis numèrics.',sourceLabel:'Text o codis',encode:'Text → números',decode:'Números → text',clear:'Neteja',resultLabel:'Resultat',copy:'Copia el resultat',copied:'Resultat copiat.',copyFail:'No s’ha pogut copiar.',empty:'Escriu text o codis.',recentTitle:'Historial recent',historyEmpty:'Les traduccions apareixeran aquí amb l’hora.',translated:'Traducció completada.',badCodes:'Fes servir codis de fins a 2 dígits i dos espais entre paraules.',badCode:n=>`El codi ${n} no és vàlid.`,timeLabel:'Traduït a les',cnvTitle:'Fitxers CNV i alfabet',cnvDesc:'Carrega un fitxer CNV compatible per canviar l’ordre de l’alfabet.',fileLabel:'Fitxer CNV',loadCnv:'Carrega i aplica',resetAlphabet:'Restaura l’alfabet original',activeAlphabet:'Alfabet actiu',cnvInfo:'Formats admesos: CNV-ALEXIS, CNV-CARPO i CNV-ADMIN. L’alfabet també s’utilitza a la pestanya 1.',cnvInvalid:'Fitxer CNV no vàlid.',cnvApplied:'Alfabet aplicat.',cnvReset:'Alfabet original restaurat.',languageTitle:'Idiomes',languageDesc:'Canvia l’idioma de la interfície de prova.',interfaceLanguage:'Idioma de la interfície',languageInfo:'Interfície disponible en deu idiomes. Els accents es normalitzen; el text no es tradueix automàticament.',twitchTitle:'Connexió amb Twitch',twitchDesc:'Connecta’t a un canal públic i desxifra codis vàlids.',channelLabel:'Canal de Twitch',connect:'Connecta',disconnect:'Desconnecta',voiceLabel:'Llegeix les traduccions en veu alta',disconnected:'Desconnectat.',lastMessage:'Darrer missatge:',twitchTranslation:'Traducció:',twitchInfo:'Cal Internet i el navegador pot bloquejar la connexió.',footer:'HTML virtual de proves · Els canvis es mantenen en aquesta vista.',appTitle:'Traductor renovat',appDescription:'Versió de prova independent, sense modificar el traductor original.',locale:'Idioma actiu'},
ja:{translateTitle:'翻訳',translateDesc:'テキストを数字コードに変換、またはコードを解読します。',sourceLabel:'テキストまたはコード',encode:'テキスト → 数字',decode:'数字 → テキスト',clear:'クリア',resultLabel:'結果',copy:'結果をコピー',copied:'コピーしました。',copyFail:'コピーできませんでした。',empty:'テキストまたはコードを入力してください。',recentTitle:'最近の履歴',historyEmpty:'翻訳と時刻がここに表示されます。',translated:'翻訳完了。',badCodes:'2桁までのコードを使い、単語間は2つのスペースで区切ってください。',badCode:n=>`コード ${n} は無効です。`,timeLabel:'翻訳時刻',cnvTitle:'CNVファイルとアルファベット',cnvDesc:'互換性のあるCNVファイルでアルファベット順を変更します。',fileLabel:'CNVファイル',loadCnv:'読み込んで適用',resetAlphabet:'元のアルファベットに戻す',activeAlphabet:'使用中のアルファベット',cnvInfo:'対応形式: CNV-ALEXIS、CNV-CARPO、CNV-ADMIN。選択した配列はタブ1でも使用されます。',cnvInvalid:'CNVファイルが無効です。',cnvApplied:'アルファベットを適用しました。',cnvReset:'元のアルファベットに戻しました。',languageTitle:'言語',languageDesc:'テスト画面の言語を変更します。',interfaceLanguage:'画面の言語',languageInfo:'10言語に対応。アクセントはラテン文字に正規化されます。文章自体は自動翻訳されません。',twitchTitle:'Twitch接続',twitchDesc:'公開チャンネルに接続して有効な数字コードを解読します。',channelLabel:'Twitchチャンネル',connect:'接続',disconnect:'切断',voiceLabel:'翻訳を読み上げる',disconnected:'未接続。',lastMessage:'最新メッセージ:',twitchTranslation:'翻訳:',twitchInfo:'インターネットが必要です。ブラウザー設定により接続できない場合があります。',footer:'仮想テストHTML · 変更はこの画面内に保存されます。',appTitle:'新しい翻訳ツール',appDescription:'元のページを変更しない独立したテスト版です。',locale:'選択中の言語'},
zh:{translateTitle:'翻译',translateDesc:'将文本转换为数字代码，或解码数字代码。',sourceLabel:'文本或代码',encode:'文本 → 数字',decode:'数字 → 文本',clear:'清空',resultLabel:'结果',copy:'复制结果',copied:'已复制结果。',copyFail:'无法复制。',empty:'请输入文本或代码。',recentTitle:'最近记录',historyEmpty:'翻译和时间将显示在这里。',translated:'翻译完成。',badCodes:'代码最多两位数字；单词之间用两个空格分隔。',badCode:n=>`代码 ${n} 无效。`,timeLabel:'翻译时间',cnvTitle:'CNV文件和字母表',cnvDesc:'加载兼容的CNV文件以更改字母顺序。',fileLabel:'CNV文件',loadCnv:'加载并应用',resetAlphabet:'恢复原始字母表',activeAlphabet:'当前字母表',cnvInfo:'支持 CNV-ALEXIS、CNV-CARPO 和 CNV-ADMIN。所选字母表也用于第1个标签页。',cnvInvalid:'CNV文件无效。',cnvApplied:'字母表已应用。',cnvReset:'已恢复原始字母表。',languageTitle:'语言',languageDesc:'更改测试界面的语言。',interfaceLanguage:'界面语言',languageInfo:'支持十种界面语言。重音字符会规范为拉丁字母；文本不会自动翻译。',twitchTitle:'Twitch连接',twitchDesc:'连接公开频道并解码有效的数字代码。',channelLabel:'Twitch频道',connect:'连接',disconnect:'断开连接',voiceLabel:'朗读翻译',disconnected:'未连接。',lastMessage:'最新消息：',twitchTranslation:'翻译：',twitchInfo:'需要互联网，浏览器策略可能会阻止连接。',footer:'虚拟测试HTML · 修改仅保留在此视图中。',appTitle:'焕新翻译器',appDescription:'独立测试版本，不会修改原始页面。',locale:'当前语言'}
};
const ui={lang:'es',alphabet:'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ',codeMap:new Map(),byCode:new Map(),socket:null,history:[]};const alphabet='ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';const punctuation=Array.from({length:47},(_,i)=>String.fromCharCode(i+33)).concat(Array.from({length:7},(_,i)=>String.fromCharCode(i+58)),Array.from({length:6},(_,i)=>String.fromCharCode(i+91)),Array.from({length:4},(_,i)=>String.fromCharCode(i+123)));const chars=[...alphabet,...alphabet.toLocaleLowerCase('es'),...'0123456789',...punctuation];
function dict(){return dictionaries[ui.lang]||dictionaries.es}function tr(key,...args){const value=dict()[key]??dictionaries.es[key]??key;return typeof value==='function'?value(...args):value}function setAlphabet(order=alphabet,name='Original'){ui.alphabet=order;const sequence=[...order,...Array.from(order).map(x=>x.toLocaleLowerCase('es')),...'0123456789',...punctuation];ui.codeMap=new Map(sequence.map((c,i)=>[c,i+1]));ui.byCode=new Map(sequence.map((c,i)=>[i+1,c]));document.getElementById('alphabetName').textContent=name;document.getElementById('alphabetDisplay').textContent=order+' · '+Array.from(order).map(c=>c.toLocaleLowerCase('es')).join('');}
function normalize(value){return value.replace(/Ñ/g,'\uE000').replace(/ñ/g,'\uE001').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\uE000/g,'Ñ').replace(/\uE001/g,'ñ')}
function timeText(date){return new Intl.DateTimeFormat(ui.lang,{dateStyle:'medium',timeStyle:'medium'}).format(date)}function addHistory(source,result,date){const holder=document.getElementById('history');if(!ui.history.length)holder.replaceChildren();ui.history.unshift({source,result,date});ui.history=ui.history.slice(0,8);holder.replaceChildren(...ui.history.map(item=>{const el=document.createElement('div');el.className='history-item';const text=document.createElement('div');text.textContent=item.source+' → '+item.result;const time=document.createElement('time');time.dateTime=item.date.toISOString();time.textContent=timeText(item.date);el.append(text,time);return el;}));}
function run(direction){const source=document.getElementById('source').value.trim(),out=document.getElementById('result'),status=document.getElementById('translateStatus');if(!source){out.value='';status.textContent=tr('empty');status.className='status';return}let result='';try{if(direction==='encode'){result=source.split(/\s+/).map(word=>Array.from(normalize(word)).map(c=>{const n=ui.codeMap.get(c);if(n===undefined)throw new Error('char:'+c);return n}).join(' ')).join('  ')}else{result=source.split(/\s{2,}/).map(word=>word.trim().split(/\s+/).map(token=>{if(!/^\d{1,3}$/.test(token))throw new Error('format');const c=ui.byCode.get(Number(token));if(!c)throw new Error('code:'+token);return c}).join('')).join(' ')} }catch(error){out.value='';status.textContent=error.message.startsWith('char:')?`Unsupported character: ${error.message.slice(5)}`:error.message.startsWith('code:')?tr('badCode',error.message.slice(5)):tr('badCodes');status.className='status error';return}out.value=result;document.getElementById('copy').disabled=!result;const date=new Date();document.getElementById('translationTime').textContent=tr('timeLabel')+': '+timeText(date);status.textContent=tr('translated');status.className='status success';addHistory(source,result,date)}
function applyLanguage(){document.documentElement.lang=ui.lang;document.querySelectorAll('[data-i]').forEach(el=>{const key=el.dataset.i;el.textContent=tr(key)});document.getElementById('appTitle').textContent=tr('appTitle');document.getElementById('appDescription').textContent=tr('appDescription');document.getElementById('localePreview').textContent=tr('locale')+': '+document.querySelector('#language option:checked').textContent;document.getElementById('twitchStatus').textContent=ui.socket?'Connected.':' '+tr('disconnected');if(!ui.history.length)document.querySelector('[data-i=historyEmpty]').textContent=tr('historyEmpty');if(ui.history.length){document.getElementById('history').replaceChildren(...ui.history.map(item=>{const el=document.createElement('div');el.className='history-item';const text=document.createElement('div');text.textContent=item.source+' → '+item.result;const time=document.createElement('time');time.dateTime=item.date.toISOString();time.textContent=timeText(item.date);el.append(text,time);return el;}));}}
document.querySelectorAll('.tab').forEach(tab=>tab.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(item=>item.setAttribute('aria-selected',String(item===tab)));document.querySelectorAll('[role=tabpanel]').forEach(panel=>panel.hidden=panel.id!==tab.getAttribute('aria-controls'));tab.focus()}));document.getElementById('encode').addEventListener('click',()=>run('encode'));document.getElementById('decode').addEventListener('click',()=>run('decode'));document.getElementById('clear').addEventListener('click',()=>{document.getElementById('source').value='';document.getElementById('result').value='';document.getElementById('translateStatus').textContent='';document.getElementById('translationTime').textContent='';document.getElementById('copy').disabled=true});document.getElementById('copy').addEventListener('click',async()=>{const field=document.getElementById('result');try{await navigator.clipboard.writeText(field.value);document.getElementById('translateStatus').textContent=tr('copied')}catch{field.select();document.execCommand('copy');document.getElementById('translateStatus').textContent=tr('copyFail')}});
document.getElementById('loadCnv').addEventListener('click',async()=>{const file=document.getElementById('cnvFile').files[0],status=document.getElementById('cnvStatus');if(!file){status.textContent=tr('cnvInvalid');status.className='status error';return}try{const contents=(await file.text()).replace(/^\uFEFF/,'');const lines=contents.split(/\r?\n/).map(line=>line.trim());const line=lines.find(x=>x&&!x.startsWith('#'))||'';const code=line.replace(/^CODE\s{0,}=\s{0,}/i,'').toUpperCase();if(!['CNV-ALEXIS','CNV-CARPO','CNV-ADMIN'].includes(code))throw new Error();let order=alphabet;if(code==='CNV-ALEXIS')order='QWERTYUIOPÑLKJHGFDSCBMNZAXV';if(code==='CNV-CARPO'){const keys=Array.from(new Set(Array.from(code.replace(/^CNV-/,'')).filter(c=>alphabet.includes(c))));order=[...keys,...Array.from(alphabet).reverse().filter(c=>!keys.includes(c))].join('')}if(code!=='CNV-ADMIN')setAlphabet(order,code.slice(4));status.textContent=code==='CNV-ADMIN'?'Admin recognized; alphabet unchanged.':tr('cnvApplied');status.className='status success';const meta=document.getElementById('cnvMetadata');meta.hidden=false;const details=[['File',file.name],['Size',new Intl.NumberFormat(ui.lang,{maximumFractionDigits:2}).format(file.size/1024)+' KB'],['Format',code],['SHA-256','Calculating…']];meta.replaceChildren(...details.map(([label,value])=>{const div=document.createElement('div'),small=document.createElement('small'),strong=document.createElement('strong');small.textContent=label;strong.textContent=value;div.append(small,strong);return div}));if(crypto.subtle){const digest=await crypto.subtle.digest('SHA-256',await file.arrayBuffer());meta.lastElementChild.lastElementChild.textContent=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('')} }catch{status.textContent=tr('cnvInvalid');status.className='status error'}});document.getElementById('resetAlphabet').addEventListener('click',()=>{setAlphabet();document.getElementById('cnvFile').value='';document.getElementById('cnvMetadata').hidden=true;document.getElementById('cnvStatus').textContent=tr('cnvReset');document.getElementById('cnvStatus').className='status success'});document.getElementById('language').addEventListener('change',event=>{ui.lang=event.target.value;applyLanguage()});
function twitchLine(line){if(line.startsWith('PING ')){ui.socket?.send(line.replace('PING','PONG'));return}const match=line.match(/^:[^!]+![^ ]+ PRIVMSG #[^ ]+ :(.*)$/);if(!match)return;const decoded=(()=>{try{return match[1].trim().split(/ {2,}/).map(word=>word.trim().split(/ +/).map(n=>{if(!/^\d{1,2}$/.test(n)||!ui.byCode.has(Number(n)))throw 0;return ui.byCode.get(Number(n))}).join('')).join(' ')}catch{return null}})();if(decoded===null)return;const now=new Date();document.getElementById('twitchOriginal').textContent=match[1];document.getElementById('twitchDecoded').textContent=decoded;document.getElementById('twitchTime').textContent=tr('timeLabel')+': '+timeText(now);if(document.getElementById('voice').checked&&'speechSynthesis'in window){speechSynthesis.cancel();const voice=new SpeechSynthesisUtterance(decoded);voice.lang=ui.lang;speechSynthesis.speak(voice)}}function connectTwitch(){const channel=document.getElementById('channel').value.trim().replace(/^#/,'').toLowerCase(),status=document.getElementById('twitchStatus');if(!/^[a-z0-9_]{1,25}$/.test(channel)){status.textContent='Enter a valid Twitch channel name.';status.className='status error';return}disconnectTwitch();status.textContent='Connecting to twitch.tv/'+channel+'…';try{const socket=new WebSocket('wss://irc-ws.chat.twitch.tv:443');ui.socket=socket;document.getElementById('connect').disabled=true;document.getElementById('disconnect').disabled=false;socket.addEventListener('open',()=>{if(ui.socket!==socket)return;socket.send('NICK justinfan'+(Math.floor(Math.random()*90000)+10000));socket.send('JOIN #'+channel);status.textContent='Connected to twitch.tv/'+channel+'. Waiting for codes…'});socket.addEventListener('message',event=>{if(typeof event.data==='string')event.data.split(/\r?\n/).forEach(twitchLine)});socket.addEventListener('error',()=>{if(ui.socket===socket){status.textContent='Twitch connection failed.';status.className='status error'}});socket.addEventListener('close',()=>{if(ui.socket!==socket)return;ui.socket=null;document.getElementById('connect').disabled=false;document.getElementById('disconnect').disabled=true;status.textContent=tr('disconnected')})}catch{status.textContent='Could not start the Twitch connection.';status.className='status error'}}function disconnectTwitch(){const socket=ui.socket;ui.socket=null;if(socket)socket.close();document.getElementById('connect').disabled=false;document.getElementById('disconnect').disabled=true;if('speechSynthesis'in window)speechSynthesis.cancel()}document.getElementById('connect').addEventListener('click',connectTwitch);document.getElementById('disconnect').addEventListener('click',()=>{disconnectTwitch();document.getElementById('twitchStatus').textContent=tr('disconnected')});document.getElementById('channel').addEventListener('keydown',event=>{if(event.key==='Enter')connectTwitch()});setAlphabet();applyLanguage();
})();
</script>
</body></html>`;
  virtualHtmlFrame.srcdoc = virtualDocument;
}
*/
}

function updateArchiveSignature() {
  archiveSignature.textContent = t('archiveSignatureLabel');
}

let accountPromptMode = 'create';

function setAccountPromptMode(mode) {
  accountPromptMode = mode;
  const creating = mode === 'create';
  document.getElementById('emailPromptTitle').textContent = creating ? 'Crea tu cuenta' : 'Inicia sesión';
  accountPromptDescription.textContent = creating
    ? 'Elige un usuario y una contraseña. La cuenta se guarda solo en este navegador; no se enviará ningún correo.'
    : 'Introduce tu usuario y contraseña para continuar en este navegador.';
  accountPassword.autocomplete = creating ? 'new-password' : 'current-password';
  emailAddress.hidden = !creating;
  emailAddress.required = false;
  emailAddress.previousElementSibling.hidden = !creating;
  accountSubmit.textContent = creating ? 'Crear cuenta' : 'Iniciar sesión';
}

async function hashAccountPassword(password, salt) {
  if (!window.crypto?.subtle) throw new Error('Secure password hashing is unavailable');
  const key = await window.crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await window.crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 210000, hash: 'SHA-256' }, key, 256);
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

function getSavedAccount() {
  try {
    return JSON.parse(localStorage.getItem(accountStorageKey) || 'null');
  } catch {
    return null;
  }
}

function renderAccountPanel() {
  const account = getSavedAccount();
  document.getElementById('accountUsernameDisplay').textContent = account?.username || '—';
  const emailHeading = document.getElementById('accountEmailHeading');
  const emailDisplay = document.getElementById('accountEmail');
  emailHeading.hidden = !account?.email;
  emailDisplay.hidden = !account?.email;
  emailDisplay.textContent = account?.email || '';
}

function openAccountMenu() {
  accountSidebar.hidden = false;
  accountSidebar.setAttribute('aria-hidden', 'false');
  sidebarBackdrop.hidden = false;
  accountMenuToggle.setAttribute('aria-expanded', 'true');
  renderAccountPanel();
  document.getElementById('accountMenuClose').focus();
}

function closeAccountMenu() {
  accountSidebar.hidden = true;
  accountSidebar.setAttribute('aria-hidden', 'true');
  sidebarBackdrop.hidden = true;
  accountMenuToggle.setAttribute('aria-expanded', 'false');
  accountMenuToggle.focus();
}

function updateLocale() {
  currentLanguage = translations[languageSelect.value] ? languageSelect.value : 'es';
  const localeByCountry = {
    ES: 'es-ES', MX: 'es-MX', AR: 'es-AR', CO: 'es-CO',
    US: 'en-US', GB: 'en-GB', FR: 'fr-FR', BR: 'pt-BR', PT: 'pt-PT'
  };
  document.documentElement.lang = localeByCountry[countrySelect.value] || currentLanguage;
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const value = t(element.dataset.i18n);
    if (value !== undefined) element.textContent = value;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const value = t(element.dataset.i18nPlaceholder);
    if (value !== undefined) element.placeholder = value;
  });
  const displayLanguage = currentLanguage;
  const fallbackCountryNames = {
    ES: 'España', MX: 'México', AR: 'Argentina', CO: 'Colombia',
    US: 'Estados Unidos', GB: 'Reino Unido', FR: 'Francia', BR: 'Brasil', PT: 'Portugal'
  };
  countrySelect.querySelectorAll('option[data-country]').forEach((option) => {
    try {
      const countryNames = new Intl.DisplayNames([displayLanguage], { type: 'region' });
      option.textContent = countryNames.of(option.dataset.country) || fallbackCountryNames[option.dataset.country];
    } catch {
      option.textContent = fallbackCountryNames[option.dataset.country];
    }
  });
  document.title = t('title');
  accountMenuToggle.setAttribute('aria-label', t('menuOpen'));
  document.getElementById('accountMenuClose').setAttribute('aria-label', t('menuClose'));
  sidebarBackdrop.setAttribute('aria-label', t('menuClose'));
  renderAccountPanel();
  updateArchiveSignature();
  updateSeasonalEvent();
  if (!tutorial.hidden) renderTutorial();
}

function renderTutorial() {
  const steps = t('tutorialSteps');
  const step = steps[tutorialIndex];
  tutorialStep.textContent = t('tutorialStep', tutorialIndex + 1, steps.length);
  tutorialTitle.textContent = step.title;
  tutorialDescription.textContent = step.description;
  tutorialBack.textContent = t('tutorialBack');
  tutorialBack.hidden = tutorialIndex === 0;
  document.getElementById('tutorialSkip').textContent = t('tutorialSkip');
  tutorialNext.textContent = tutorialIndex === steps.length - 1 ? t('tutorialDone') : t('tutorialNext');
}

function hasCompletedTutorial() {
  try {
    if (localStorage.getItem(tutorialStorageKey) === 'true') return true;
  } catch {
    // Fall back to session storage when local storage is blocked.
  }
  try {
    return sessionStorage.getItem(tutorialStorageKey) === 'true';
  } catch {
    return false;
  }
}

function saveTutorialCompletion() {
  try {
    localStorage.setItem(tutorialStorageKey, 'true');
    return;
  } catch {
    // Fall back to session storage when local storage is blocked.
  }
  try {
    sessionStorage.setItem(tutorialStorageKey, 'true');
  } catch {
    // The tutorial can still be closed if browser storage is unavailable.
  }
}

function finishTutorial() {
  tutorial.hidden = true;
  saveTutorialCompletion();
}

function showMessage(text, isSuccess = false) {
  message.textContent = text;
  message.classList.toggle('success', isSuccess);
}

function setOutput(value) {
  output.value = value;
  copyButton.disabled = !value;
}

function normalizeText(text) {
  return text
    .replace(/Ñ/g, '\uE000')
    .replace(/ñ/g, '\uE001')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\uE000/g, 'Ñ')
    .replace(/\uE001/g, 'ñ');
}

function translateToNumbers() {
  const text = normalizeText(input.value).trim();
  if (!text) {
    setOutput('');
    showMessage('');
    return;
  }

  const translated = [];
  for (const word of text.split(/\s+/)) {
    const codes = [];
    for (const character of Array.from(word)) {
      const code = characterCodes.get(character);
      if (code === undefined) {
        showMessage(t('invalidCharacter', character));
        setOutput('');
        return;
      }
      codes.push(String(code));
    }
    translated.push(codes.join(' '));
  }

  setOutput(translated.join('  '));
  showMessage('');
}

function translateToText() {
  const text = input.value.trim();
  if (!text) {
    setOutput('');
    showMessage('');
    return;
  }

  const translated = [];
  for (const word of text.split(/\s{2,}/)) {
    let decodedWord = '';
    for (const token of word.trim().split(/\s+/)) {
      if (!/^\d{1,3}$/.test(token)) {
        showMessage(t('invalidCodes'));
        setOutput('');
        return;
      }
      const character = charactersByCode.get(Number(token));
      if (character === undefined) {
        showMessage(t('invalidCode', token));
        setOutput('');
        return;
      }
      decodedWord += character;
    }
    translated.push(decodedWord);
  }

  setOutput(translated.join(' '));
  showMessage('');
}

async function copyText(text, field) {
  if (!text) return false;
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  field.focus();
  field.select();
  const copied = document.execCommand('copy');
  field.setSelectionRange(0, 0);
  return copied;
}

async function copyOutput() {
  if (!output.value) return;
  try {
    if (await copyText(output.value, output)) {
      showMessage(t('copied'), true);
    } else {
      showMessage(t('copyFailed'));
    }
  } catch {
    showMessage(t('copyFailed'));
  }
}

function decodeTwitchCodes(text) {
  const words = text.trim().split(/ {2,}/);
  const decoded = [];
  for (const word of words) {
    const tokens = word.trim().split(/ +/);
    if (!tokens.length || tokens.some((token) => !/^\d{1,3}$/.test(token))) return null;
    const characters = tokens.map((token) => standardCharactersByCode.get(Number(token)));
    if (characters.some((character) => character === undefined)) return null;
    decoded.push(characters.join(''));
  }
  return decoded.join(' ');
}

function speakTwitchTranslation(text) {
  if (!twitchVoiceCheckbox.checked || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = { es: 'es-ES', en: 'en-US', fr: 'fr-FR', pt: 'pt-BR' }[currentLanguage] || 'es-ES';
  window.speechSynthesis.speak(utterance);
}

function handleTwitchLine(line) {
  if (line.startsWith('PING ')) {
    twitchSocket?.send(line.replace('PING', 'PONG'));
    return;
  }
  const chatMessage = line.match(/^:[^!]+![^ ]+ PRIVMSG #[^ ]+ :(.*)$/);
  if (!chatMessage) return;
  const decoded = decodeTwitchCodes(chatMessage[1]);
  if (decoded === null) return;
  twitchOriginal.textContent = chatMessage[1];
  twitchTranslation.textContent = decoded;
  speakTwitchTranslation(decoded);
}

function connectTwitch() {
  const channel = twitchChannelInput.value.trim().replace(/^#/, '').toLowerCase();
  if (!/^[a-z0-9_]{1,25}$/.test(channel)) {
    twitchStatus.textContent = 'Escribe un nombre de canal válido (letras, números o guion bajo).';
    return;
  }
  if (twitchSocket) twitchSocket.close();
  twitchStatus.textContent = `Conectando con twitch.tv/${channel}…`;
  twitchConnectButton.disabled = true;
  twitchDisconnectButton.disabled = false;

  try {
    const socket = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
    twitchSocket = socket;
    socket.addEventListener('open', () => {
      if (twitchSocket !== socket) return;
      socket.send(`NICK justinfan${Math.floor(Math.random() * 90000) + 10000}`);
      socket.send(`JOIN #${channel}`);
      twitchStatus.textContent = `Conectado a twitch.tv/${channel}. Esperando códigos numéricos…`;
    });
    socket.addEventListener('message', (event) => {
      if (typeof event.data === 'string') event.data.split(/\r?\n/).forEach(handleTwitchLine);
    });
    socket.addEventListener('error', () => {
      if (twitchSocket === socket) twitchStatus.textContent = 'No se pudo conectar con Twitch. Comprueba la conexión y vuelve a intentarlo.';
    });
    socket.addEventListener('close', () => {
      if (twitchSocket !== socket) return;
      twitchSocket = null;
      twitchStatus.textContent = 'Desconectado de Twitch.';
      twitchConnectButton.disabled = false;
      twitchDisconnectButton.disabled = true;
    });
  } catch {
    twitchSocket = null;
    twitchStatus.textContent = 'No se pudo iniciar la conexión con Twitch.';
    twitchConnectButton.disabled = false;
    twitchDisconnectButton.disabled = true;
  }
}

function disconnectTwitch() {
  const socket = twitchSocket;
  twitchSocket = null;
  if (socket) socket.close();
  twitchStatus.textContent = 'Desconectado de Twitch.';
  twitchConnectButton.disabled = false;
  twitchDisconnectButton.disabled = true;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

accountMenuToggle.addEventListener('click', openAccountMenu);
document.getElementById('accountMenuClose').addEventListener('click', closeAccountMenu);
sidebarBackdrop.addEventListener('click', closeAccountMenu);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !archivePreview.hidden) closeArchive();
  else if (event.key === 'Escape' && !archiveVersionPrompt.hidden) {
    archiveVersionPrompt.hidden = true;
    runArchiveButton.focus();
  } else if (event.key === 'Escape' && !accountSidebar.hidden) closeAccountMenu();
});

archiveUpload.addEventListener('change', () => {
  runArchiveButton.disabled = !archiveUpload.files.length;
  archiveStatus.textContent = '';
});
runArchiveButton.addEventListener('click', runArchive);
document.getElementById('modSelect').addEventListener('change', loadModIntoEditor);
document.getElementById('modCodeTab').addEventListener('click', () => setModEditorMode('code'));
document.getElementById('modVisualTab').addEventListener('click', () => setModEditorMode('visual'));
['modVisualBackground', 'modVisualImage'].forEach((id) => {
  document.getElementById(id).addEventListener('input', updateModVisualPreview);
});
document.getElementById('resetVisualMod').addEventListener('click', () => {
  resetVisualMod();
  document.getElementById('modStatus').textContent = 'Se restauró la apariencia original de la página.';
});
document.getElementById('newMod').addEventListener('click', () => {
  document.getElementById('modSelect').value = '';
  document.getElementById('modName').value = '';
  document.getElementById('modCode').value = '';
  document.getElementById('modVisualBackground').value = '#eaf3ff';
  document.getElementById('modVisualImage').value = '';
  setModEditorMode('code');
  document.getElementById('deleteMod').disabled = true;
  document.getElementById('executeMod').disabled = true;
  document.getElementById('modStatus').textContent = 'Editor listo para crear un mod nuevo.';
});
document.getElementById('executeMod').addEventListener('click', executeSelectedMod);
document.getElementById('importMod').addEventListener('click', importModFile);
document.getElementById('saveMod').addEventListener('click', saveCurrentMod);
document.getElementById('deleteMod').addEventListener('click', deleteSelectedMod);
document.getElementById('cancelArchiveRun').addEventListener('click', () => {
  archiveVersionPrompt.hidden = true;
  runArchiveButton.focus();
});
document.getElementById('confirmArchiveRun').addEventListener('click', () => {
  archiveVersionPrompt.hidden = true;
  executeArchive();
});
document.getElementById('closeArchivePreview').addEventListener('click', closeArchive);

twitchConnectButton.addEventListener('click', connectTwitch);
twitchDisconnectButton.addEventListener('click', disconnectTwitch);
twitchChannelInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') connectTwitch();
});

const mainTabs = Array.from(document.querySelectorAll('.main-tab'));
const mainTabPanels = Array.from(document.querySelectorAll('.main-tab-panel'));

function activateMainTab(tab, moveFocus = false) {
  mainTabs.forEach((item) => {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
  });
  mainTabPanels.forEach((panel) => {
    panel.hidden = panel.id !== tab.getAttribute('aria-controls');
  });
  if (moveFocus) tab.focus();
}

mainTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateMainTab(tab));
  tab.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft' && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    const nextIndex = event.key === 'Home' ? 0
      : event.key === 'End' ? mainTabs.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + mainTabs.length) % mainTabs.length;
    activateMainTab(mainTabs[nextIndex], true);
  });
});

activateMainTab(mainTabs[0]);

document.getElementById('applyCode').addEventListener('click', applyAlphabetCode);
document.getElementById('resetCode').addEventListener('click', resetAlphabetOrder);
document.getElementById('applyCustomAlphabet').addEventListener('click', applyCustomAlphabetFromForm);
document.getElementById('downloadCustomAlphabet').addEventListener('click', () => {
  try {
    const data = getCustomAlphabetData();
    const blob = new Blob([customAlphabetFileContents(data)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.name.replace(/[^\p{L}\p{N}-]+/gu, '-') || 'alfabeto'}.cnv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    const status = document.getElementById('customAlphabetStatus');
    status.textContent = `Archivo CNV de «${data.name}» descargado.`;
    status.classList.add('success');
  } catch (error) {
    const status = document.getElementById('customAlphabetStatus');
    status.textContent = error.message;
    status.classList.remove('success');
  }
});
document.getElementById('importCustomAlphabet').addEventListener('change', importCustomAlphabetFile);
styleSelect.addEventListener('change', updateTheme);
document.getElementById('customBackground').addEventListener('input', updateTheme);
document.getElementById('customOutline').addEventListener('input', updateTheme);
document.getElementById('toNumbers').addEventListener('click', translateToNumbers);
document.getElementById('toSpanish').addEventListener('click', translateToText);
copyButton.addEventListener('click', copyOutput);
document.getElementById('openTutorial').addEventListener('click', () => {
  tutorialIndex = 0;
  tutorial.hidden = false;
  renderTutorial();
  tutorialNext.focus();
});
document.getElementById('tutorialSkip').addEventListener('click', finishTutorial);
tutorialBack.addEventListener('click', () => {
  if (tutorialIndex > 0) {
    tutorialIndex -= 1;
    renderTutorial();
  }
});
tutorialNext.addEventListener('click', () => {
  if (tutorialIndex < t('tutorialSteps').length - 1) {
    tutorialIndex += 1;
    renderTutorial();
  } else {
    finishTutorial();
  }
});
languageSelect.addEventListener('change', updateLocale);

countrySelect.addEventListener('change', () => {
  const languageByCountry = { ES: 'es', MX: 'es', AR: 'es', CO: 'es', US: 'en', GB: 'en', FR: 'fr', BR: 'pt', PT: 'pt' };
  languageSelect.value = languageByCountry[countrySelect.value] || 'es';
  updateLocale();
});

emailForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!emailForm.reportValidity()) return;

  accountSubmit.disabled = true;
  try {
    const username = accountUsername.value.trim();
    const password = accountPassword.value;
    if (accountPromptMode === 'create') {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const passwordHash = await hashAccountPassword(password, salt);
      localStorage.setItem(accountStorageKey, JSON.stringify({
        username,
        email: emailAddress.value.trim(),
        salt: btoa(String.fromCharCode(...salt)),
        passwordHash
      }));
    } else {
      const account = getSavedAccount();
      const salt = Uint8Array.from(atob(account.salt), (character) => character.charCodeAt(0));
      const passwordHash = await hashAccountPassword(password, salt);
      if (username.toLowerCase() !== account.username.toLowerCase() || passwordHash !== account.passwordHash) {
        throw new Error('Usuario o contraseña incorrectos.');
      }
    }
    try {
      sessionStorage.setItem(accountSessionKey, 'true');
    } catch {
      // The account can still be used for this page session.
    }
    emailPrompt.hidden = true;
    accountPassword.value = '';
    renderAccountPanel();
  } catch (error) {
    accountPromptDescription.textContent = error.message === 'Usuario o contraseña incorrectos.'
      ? error.message
      : 'No se pudo guardar o verificar la cuenta. Comprueba que el almacenamiento del navegador esté disponible.';
  } finally {
    accountSubmit.disabled = false;
  }
});

document.getElementById('accountLogout').addEventListener('click', () => {
  try {
    sessionStorage.removeItem(accountSessionKey);
  } catch {
    // Continue to the sign-in screen if session storage is unavailable.
  }
  closeAccountMenu();
  setAccountPromptMode('login');
  emailPrompt.hidden = false;
  accountPassword.value = '';
  accountUsername.focus();
});

const existingAccount = getSavedAccount();
let accountSignedIn = false;
try {
  accountSignedIn = sessionStorage.getItem(accountSessionKey) === 'true';
} catch {
  // Ask the user to sign in when session storage is unavailable.
}
if (existingAccount && accountSignedIn) {
  emailPrompt.hidden = true;
} else {
  setAccountPromptMode(existingAccount ? 'login' : 'create');
  emailPrompt.hidden = false;
  if (existingAccount) accountUsername.value = existingAccount.username;
  accountUsername.focus();
}

renderMods();
loadModIntoEditor();
updateTheme();
updateLocale();
if (!hasCompletedTutorial()) {
  tutorial.hidden = false;
  renderTutorial();
}
