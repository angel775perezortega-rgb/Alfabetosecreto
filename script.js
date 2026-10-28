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
    accountTitle: 'Tu cuenta', accountEmailLabel: 'Correo electrónico', accountStorageNote: 'Guardado solo en este navegador.', accountArchiveNote: 'Importa ZIP anticipados. Se ejecutan si Firma.js contiene una firma válida de la versión 7 o posterior y una fecha desde el 27/10/2026.', accountArchiveUploadLabel: 'Selecciona un archivo ZIP', archiveRun: 'Ejecutar ZIP', archiveVersionPromptTitle: 'Antes de ejecutar el ZIP', archiveCancel: 'Cancelar', archiveContinue: 'Continuar', archiveSignatureNote: 'Solo se ejecutarán ZIP con Firma.js, firma válida desde la versión 7 y fecha desde el 27/10/2026.', archiveSignatureLabel: 'Formato: f52V{versión}/Mx/{DDMMAA}; fecha mínima 271026', archiveSignatureInvalid: 'No se puede ejecutar: la firma de Firma.js no es válida o su fecha es anterior al 27/10/2026.', archivePreviewTitle: 'Vista previa del ZIP', archiveSelectFile: 'Selecciona un archivo ZIP primero.', archiveSignatureRequired: 'No se puede ejecutar: el ZIP no incluye Firma.js.', archiveUnsupported: 'El ZIP debe incluir HTML y este navegador debe admitir archivos comprimidos compatibles.', archiveError: 'No se pudo abrir el ZIP. Revisa que no esté dañado y que contenga HTML y Firma.js.', archiveReady: 'Versión anticipada abierta a pantalla completa. Pulsa × para salir.', menuOpen: 'Abrir menú de cuenta', menuClose: 'Cerrar menú',
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
    translatorHint: 'Un espacio entre códigos y dos espacios entre palabras. Cada código tiene hasta 2 dígitos.',
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
    invalidCodes: 'Usa códigos de hasta 2 dígitos, separados por espacios; deja dos espacios entre palabras.',
    invalidCode: (token) => `El código ${token} no es válido. Usa números del 1 al ${codeCharacters.length}.`,
    copied: '¡Resultado copiado!', copyFailed: 'No se pudo copiar. Selecciona el resultado y cópialo manualmente.'
  },
  en: {
    accountTitle: 'Your account', accountEmailLabel: 'Email address', accountStorageNote: 'Saved only in this browser.', accountArchiveNote: 'Import preview ZIP files. They run if Firma.js has a valid signature for version 7 or later and a date on or after 27/10/2026.', accountArchiveUploadLabel: 'Select a ZIP file', archiveRun: 'Run ZIP', archiveVersionPromptTitle: 'Before running the ZIP', archiveCancel: 'Cancel', archiveContinue: 'Continue', archiveSignatureNote: 'ZIP files must contain Firma.js with a valid signature from version 7 onward and a date on or after 27/10/2026.', archiveSignatureLabel: 'Format: f52V{version}/Mx/{DDMMYY}; earliest date 271026', archiveSignatureInvalid: 'Cannot run: Firma.js has an invalid signature or a date before 27/10/2026.', archivePreviewTitle: 'ZIP preview', archiveSelectFile: 'Select a ZIP file first.', archiveSignatureRequired: 'Cannot run: the ZIP does not include Firma.js.', archiveUnsupported: 'The ZIP must include HTML, and this browser must support its compression format.', archiveError: 'Could not open the ZIP. Check that it is not damaged and contains HTML and Firma.js.', archiveReady: 'Preview version opened full screen. Select × to exit.', menuOpen: 'Open account menu', menuClose: 'Close menu',
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
    translatorHint: 'Use one space between codes and two spaces between words. Each code has up to 2 digits.',
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
    invalidCodes: 'Use codes up to 2 digits, separated by spaces; use two spaces between words.',
    invalidCode: (token) => `Code ${token} is invalid. Use numbers from 1 to ${codeCharacters.length}.`,
    copied: 'Result copied!', copyFailed: 'Could not copy. Select the result and copy it manually.'
  },
  fr: {
    accountTitle: 'Votre compte', accountEmailLabel: 'Adresse e-mail', accountStorageNote: 'Enregistré uniquement dans ce navigateur.', accountArchiveNote: 'Importez des ZIP préliminaires. Ils seront exécutés si Firma.js contient une signature valide de la version 7 ou ultérieure et une date à partir du 27/10/2026.', accountArchiveUploadLabel: 'Sélectionner un fichier ZIP', archiveRun: 'Exécuter le ZIP', archiveVersionPromptTitle: 'Avant d’exécuter le ZIP', archiveCancel: 'Annuler', archiveContinue: 'Continuer', archiveSignatureNote: 'Le ZIP doit contenir Firma.js avec une signature valide à partir de la version 7 et une date à partir du 27/10/2026.', archiveSignatureLabel: 'Format : f52V{version}/Mx/{JJMMAA} ; date minimale 271026', archiveSignatureInvalid: 'Impossible d’exécuter le ZIP : la signature de Firma.js est invalide ou sa date est antérieure au 27/10/2026.', archivePreviewTitle: 'Aperçu du ZIP', archiveSelectFile: 'Sélectionnez d’abord un fichier ZIP.', archiveSignatureRequired: 'Impossible d’exécuter le ZIP : Firma.js est absent.', archiveUnsupported: 'Le ZIP doit contenir un fichier HTML et le navigateur doit prendre en charge son format de compression.', archiveError: 'Impossible d’ouvrir le ZIP. Vérifiez qu’il contient HTML et Firma.js et qu’il n’est pas endommagé.', archiveReady: 'La version préliminaire est en plein écran. Appuyez sur × pour quitter.', menuOpen: 'Ouvrir le menu du compte', menuClose: 'Fermer le menu',
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
    translatorHint: 'Un espace entre les codes et deux espaces entre les mots. Chaque code comporte jusqu’à 2 chiffres.',
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
    invalidCodes: 'Utilisez des codes de 2 chiffres maximum, séparés par des espaces et deux espaces entre les mots.',
    invalidCode: (token) => `Le code ${token} est invalide. Utilisez un nombre de 1 à ${codeCharacters.length}.`,
    copied: 'Résultat copié !', copyFailed: 'Copie impossible. Sélectionnez le résultat pour le copier manuellement.'
  },
  pt: {
    accountTitle: 'Sua conta', accountEmailLabel: 'E-mail', accountStorageNote: 'Salvo apenas neste navegador.', accountArchiveNote: 'Importe ZIP de prévia. Eles serão executados se Firma.js contiver uma assinatura válida da versão 7 ou posterior e uma data a partir de 27/10/2026.', accountArchiveUploadLabel: 'Selecionar um arquivo ZIP', archiveRun: 'Executar ZIP', archiveVersionPromptTitle: 'Antes de executar o ZIP', archiveCancel: 'Cancelar', archiveContinue: 'Continuar', archiveSignatureNote: 'O ZIP deve conter Firma.js com uma assinatura válida a partir da versão 7 e uma data a partir de 27/10/2026.', archiveSignatureLabel: 'Formato: f52V{versão}/Mx/{DDMMAA}; data mínima 271026', archiveSignatureInvalid: 'Não é possível executar: a assinatura de Firma.js é inválida ou a data é anterior a 27/10/2026.', archivePreviewTitle: 'Prévia do ZIP', archiveSelectFile: 'Selecione um arquivo ZIP primeiro.', archiveSignatureRequired: 'Não é possível executar: o ZIP não inclui Firma.js.', archiveUnsupported: 'O ZIP deve incluir um arquivo HTML e o navegador precisa aceitar o formato de compactação.', archiveError: 'Não foi possível abrir o ZIP. Verifique se ele contém HTML e Firma.js e não está danificado.', archiveReady: 'A versão de prévia está em tela cheia. Use × para sair.', menuOpen: 'Abrir menu da conta', menuClose: 'Fechar menu',
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
    translatorHint: 'Use um espaço entre códigos e dois espaços entre palavras. Cada código tem até 2 dígitos.',
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
    invalidCodes: 'Use códigos de até 2 dígitos, separados por espaços; use dois espaços entre palavras.',
    invalidCode: (token) => `O código ${token} é inválido. Use números de 1 a ${codeCharacters.length}.`,
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
  invalidCodes: 'Usa códigos de hasta 2 cifras, separados por espacios; deja dos espacios entre palabras.',
  invalidCode: (token) => `El código ${token} no pertenece al grimorio. Usa números del 1 al ${codeCharacters.length}.`,
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
  const firstLine = lines.find((line) => line && !line.startsWith('#')) || '';
  const code = firstLine.replace(/^CODE\s*=\s*/i, '').toLocaleUpperCase('en');
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

const MINIMUM_ARCHIVE_VERSION = 7;
const EARLIEST_ARCHIVE_DATE = Date.UTC(2026, 9, 27);

function isSupportedArchiveSignature(signature) {
  const match = signature.match(/^f52V(\d+(?:\.\d+)?)\/Mx\/(\d{6})$/);
  if (!match) return false;

  const version = Number(match[1]);
  const [, day, month, shortYear] = match[2].match(/^(\d{2})(\d{2})(\d{2})$/);
  const year = 2000 + Number(shortYear);
  const date = new Date(Date.UTC(year, Number(month) - 1, Number(day)));
  const isValidDate = date.getUTCFullYear() === year
    && date.getUTCMonth() === Number(month) - 1
    && date.getUTCDate() === Number(day);

  return version >= MINIMUM_ARCHIVE_VERSION && isValidDate && date.getTime() >= EARLIEST_ARCHIVE_DATE;
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
      if (!/^\d{1,2}$/.test(token)) {
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
    if (!tokens.length || tokens.some((token) => !/^\d{1,2}$/.test(token))) return null;
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

document.getElementById('applyCode').addEventListener('click', applyAlphabetCode);
document.getElementById('resetCode').addEventListener('click', resetAlphabetOrder);
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

updateTheme();
updateLocale();
if (!hasCompletedTutorial()) {
  tutorial.hidden = false;
  renderTutorial();
}
