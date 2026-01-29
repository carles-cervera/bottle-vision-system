# Sistema d’inspecció visual d’ampolles (IA + Azure)

Aquest repositori conté el desenvolupament d’un **sistema complet d’inspecció visual per a ampolles**, basat en **visió per computador** i **serveis al núvol**. El sistema automatitza el control de qualitat a partir d’imatges i permet detectar defectes relacionats amb:

- **Nivell d’emplenat del líquid** (`low`, `ok`, `full`)
- **Presència o absència de tap** (`present`, `missing`)

El projecte integra infraestructura cloud d’Azure, models d’IA desplegats com a serveis REST i una interfície web per operar en mode manual o en mode de monitoratge continu.

## Objectiu del projecte

L’objectiu és demostrar la viabilitat d’una arquitectura modular que permeti:

- automatitzar la inspecció visual de botelles
- reduir errors humans i millorar la traçabilitat
- oferir resultats en temps quasi real
- generar evidències (PDF) en casos de no conformitat
- facilitar la substitució o reentrenament de models sense afectar la resta del sistema

## Funcionalitats

### 1) Mode interactiu (manual)
Mode pensat per a validació, proves i demostració del sistema.

Flux de funcionament:
1. L’usuari carrega una imatge d’una ampolla des de la interfície web.
2. Selecciona el tipus d’anàlisi:
   - classificació de nivell
   - detecció de tap
3. El frontend envia la imatge al backend mitjançant una crida HTTP.
4. El backend valida la imatge i delega la inferència a Azure Machine Learning.
5. El resultat (etiqueta i confiança) es retorna immediatament al frontend.

Aquest mode permet provar els models sense dependre del watcher de Blob Storage i sense necessitat de simular una línia industrial.

### 2) Mode automàtic (monitoratge continu)
Mode dissenyat per simular una línia industrial real amb processament continu.

Flux de funcionament:
1. Les imatges arriben de forma contínua a **Azure Blob Storage**.
2. El backend executa un procés de monitoratge en segon pla que detecta nous blobs.
3. Cada ampolla es representa amb dues imatges independents:
   - imatge de **nivell**
   - imatge de **tap**
4. El backend agrupa les dues imatges mitjançant un identificador d’ampolla (`bottle_id`) inferit del nom del fitxer.
5. Quan el parell està complet, el backend descarrega les imatges i invoca els endpoints d’Azure ML.
6. El backend determina si l’ampolla és conforme o defectuosa segons els criteris de nivell i tap.
7. El resultat es publica al frontend en temps quasi real mitjançant **WebSocket**.
8. Si es detecta defecte, es genera un **PDF d’evidència** i es desa en un contenidor específic de Blob Storage per a anàlisi posterior.

Aquest mode permet monitoratge continu sense intervenció manual.

## Arquitectura del sistema

L’arquitectura s’ha dissenyat per separar clarament presentació, orquestració i inferència. El sistema es divideix en quatre blocs principals:

1. **Frontend web**
   - interfície d’usuari
   - enviament d’imatges en mode interactiu
   - control d’estat del sistema (on/off)
   - visualització de resultats en temps real via WebSocket en mode automàtic

2. **Backend**
   - implementat amb **FastAPI**
   - capa central de lògica d’aplicació
   - orquestració del flux interactiu i automàtic
   - integració amb Azure Machine Learning i Azure Blob Storage
   - ús intensiu de concurrència asíncrona i execució en fils per evitar bloquejos

3. **Plataforma d’inferència**
   - **Azure Machine Learning**
   - models desplegats com **endpoints REST**

4. **Plataforma de dades**
   - **Azure Blob Storage**
   - emmagatzematge d’imatges de producció
   - emmagatzematge d’informes PDF d’evidència

Aquesta arquitectura modular facilita el manteniment i permet substituir models sense canviar les interfícies del backend ni el client web.

## Models d’IA

S’ha seleccionat una solució basada en **dues xarxes neuronals convolucionals independents**, cadascuna especialitzada en una tasca:

- **Model de nivell**
  - classificació del nivell d’emplenat (`low`, `ok`, `full`)
  - treballa amb imatges frontals on es veu clarament el coll de l’ampolla

- **Model de tap**
  - detecció de presència o absència de tap (`present`, `missing`)
  - treballa sobre la part superior de l’ampolla

Els models utilitzen **transfer learning** a partir d’arquitectures preentrenades (ResNet18) adaptant les capes finals a les classes del projecte.

Separar les tasques en dos models simplifica l’entrenament, facilita el desplegament independent i permet millores futures sense impactar l’altre model.

## Backend: API i contractes

### Mode interactiu
Els endpoints del backend reben imatges com a `multipart/form-data` (camp principal `file`) i retornen un JSON simplificat i estable:

```json
{
  "label": "<etiqueta_predita>",
  "confidence": 0.93
}

Internament, el backend envia la imatge als endpoints d’Azure ML codificada en hexadecimal dins d’un JSON:

```json
{
  "image": "<cadena_hexadecimal>"
}

### Control del mode automàtic

El backend permet iniciar i aturar el processament continu sense parar el servidor:

- `POST /system/on`
  - activa el watcher i reinicia la tasca asíncrona

- `POST /system/off`
  - atura el watcher i suspèn el processament


## Gestió d’estat en mode automàtic

Com que les imatges de tap i nivell poden arribar en qualsevol ordre, el backend manté estat en memòria per sincronitzar-les:

- `BottlePair` (`dataclass`)
  - agrupa bytes i metadades de les dues imatges (tap i nivell)
  - inclou un `timestamp` quan el parell queda complet

- `bottles: dict[str, BottlePair]`
  - actua com una “barrera” per esperar fins que hi hagi el parell complet

- `processed_blobs: Set[str]`
  - evita reprocessar blobs ja tractats (estratègia “mark before work”)

- `bottle_counter`
  - comptador global d’ampolles processades, utilitzat per informar el frontend

Aquest estat és volàtil i es perd en reiniciar el servei, ja que el sistema està concebut com un prototip de demostració.


## Frontend

El frontend és una aplicació web desenvolupada amb:

- React + TypeScript
- Tailwind CSS
- shadcn/ui
- Vite

No realitza càlcul d’IA: només gestiona interacció d’usuari, enviament de dades i visualització de resultats.

Inclou dues vistes principals:

- vista d’anàlisi interactiva (manual)
- vista de monitoratge automàtic en temps real (WebSocket)


## Tecnologies utilitzades

- Backend: FastAPI (Python)
- Concurrència: asyncio + ThreadPoolExecutor
- Frontend: React + TypeScript + Tailwind CSS + shadcn/ui + Vite
- Temps real: WebSocket
- IA: CNN amb transfer learning (ResNet18)
- Inferència: Azure Machine Learning (endpoints REST)
- Dades: Azure Blob Storage
- Evidències: generació de PDF d’errors / no conformitats


## Estat del projecte

Aquest repositori correspon a un prototip funcional, validat en entorn de laboratori, que demostra que una arquitectura basada en serveis gestionats al núvol i un backend lleuger pot donar suport a un sistema d’inspecció visual modular, extensible i mantenible.

No és un sistema industrial definitiu, però està dissenyat per facilitar futures ampliacions (persistència, escalabilitat, integració amb càmeres reals, etc.).

