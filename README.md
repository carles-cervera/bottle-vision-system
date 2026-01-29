Sistema d’inspecció visual d’ampolles (IA + Azure)

Aquest repositori conté un prototip funcional d’un sistema d’inspecció visual automàtica d’ampolles, orientat a entorns industrials, basat en visió per computador i serveis al núvol de Microsoft Azure.

El sistema analitza ampolles a partir d’imatges per detectar:

Nivell d’emplenat del líquid (classificació: low, ok, full)

Presència de tap (detecció: present / missing)

L’objectiu és automatitzar el control de qualitat, reduir errors humans i generar evidències quan es detecten no conformitats. 

Memoria-carles.cervera

 

Memoria-carles.cervera

Funcionalitats principals
✅ Mode interactiu (manual)

Pensat per a proves, validació i demostració del sistema:

L’usuari puja una imatge des de la interfície web

Selecciona el tipus d’anàlisi:

classificació del nivell

detecció de tap

El backend fa una petició a l’endpoint del model corresponent a Azure Machine Learning

El resultat es retorna immediatament al frontend via HTTP

Aquest mode és útil quan no hi ha un flux industrial real de càmeres o quan es vol provar el rendiment dels models amb imatges concretes. 

Memoria-carles.cervera

 

Memoria-carles.cervera

⚙️ Mode automàtic (monitoratge continu)

Mode pensat per simular una línia industrial:

Les imatges arriben contínuament a Azure Blob Storage

El backend detecta automàticament nous blobs (watcher en segon pla)

Cada ampolla es representa amb dues imatges:

una per al nivell

una per al tap

El backend sincronitza ambdues imatges (mateix bottle_id) i llança la inferència quan el parell està complet

Els resultats es publiquen al frontend en temps quasi real mitjançant WebSockets

Si hi ha defecte, el sistema genera un PDF d’evidència i el desa a Blob Storage

Aquest mode permet operar de manera contínua sense intervenció manual. 

Memoria-carles.cervera

 

Memoria-carles.cervera

 

Memoria-carles.cervera

Arquitectura del sistema

El sistema es divideix en 4 blocs principals:

Frontend web

React + TypeScript

Tailwind CSS

shadcn/ui

Vite

Dues vistes: interactiva i automàtica

Backend

FastAPI

Concurrència asíncrona

Integració amb Azure ML i Blob Storage

Publicació de resultats via WebSocket

Azure Machine Learning

Models desplegats com a endpoints REST

Un endpoint per al model de nivell i un altre per al model de tap

Azure Blob Storage

Contenidors per imatges de nivell i tap

Contenidor per informes PDF d’evidència

Aquesta separació modular permet reentrenar o substituir models sense afectar el frontend ni el backend. 

Memoria-carles.cervera

 

Memoria-carles.cervera

 

Memoria-carles.cervera

Models d’IA

S’ha optat per una arquitectura amb dos models independents (en lloc d’un únic model multi-sortida):

Model de nivell

Classificació del nivell d’emplenat: low, ok, full

Model de tap

Detecció de tap: present, missing

Tots dos models es basen en transfer learning amb una arquitectura preentrenada (ResNet18) adaptada a les classes del projecte.

Aquesta separació simplifica l’entrenament, la comparació de resultats i el desplegament modular. 

Memoria-carles.cervera

 

Memoria-carles.cervera

Contracte d’API (resum)
Mode interactiu

Els endpoints reben imatges com a multipart/form-data i retornen un JSON simplificat:

Resposta:

{
  "label": "<etiqueta_predita>",
  "confidence": 0.93
}


El backend encapsula l’accés als endpoints d’Azure ML i retorna una interfície estable al frontend. 

Memoria-carles.cervera

Control del mode automàtic

El backend exposa endpoints per activar/desactivar el watcher:

POST /system/on → inicia el processament automàtic

POST /system/off → atura el processament automàtic

Memoria-carles.cervera

Estructures internes rellevants (mode automàtic)

Per assegurar que cada ampolla es processa només quan hi ha les dues imatges (tap i nivell), el backend utilitza:

BottlePair (dataclass): agrupa bytes i metadades de tap+nivell

bottles: dict[str, BottlePair]: barrera en memòria per sincronitzar arribades

processed_blobs: Set[str]: evita reprocessaments

bottle_counter: comptador global d’ampolles processades

Aquest estat és volàtil i es perd en reiniciar el servei (prototip). 

Memoria-carles.cervera

 

Memoria-carles.cervera

Tecnologies utilitzades

Backend: FastAPI (Python)

Frontend: React + TypeScript + Tailwind + shadcn/ui + Vite

Inferència IA: Azure Machine Learning (endpoints REST)

Dades: Azure Blob Storage

Temps real: WebSockets

Models: CNN amb transfer learning (ResNet18)

Memoria-carles.cervera

 

Memoria-carles.cervera

Resultat del sistema

El projecte demostra la viabilitat d’un sistema modular capaç de:

Processar imatges automàticament a partir de blobs entrants

Publicar resultats en temps quasi real

Gestionar errors típics (blobs incomplets, timeouts, etc.)

Generar evidències en forma de PDF per a no conformitats

Tot plegat orientat a un prototip de demostració i no a un sistema industrial final.
