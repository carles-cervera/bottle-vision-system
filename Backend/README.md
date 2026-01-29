# Bottle Quality Inspection System

Aquest projecte implementa un sistema de inspecció de qualitat d’ampolles basat en visió per computador i models de deep learning.  
L’objectiu és detectar defectes en ampolles embotellades (nivell de líquid incorrecte i absència de tap) i classificar-les com a PASS/FAIL, proporcionant informes traçables que poden ser integrats en un entorn industrial.

El sistema està format per:
- Un **backend** que exposa serveis per a la inferència dels models (ResNet-18 entrenats amb transfer learning sobre ImageNet).
- Un **frontend web** per a visualitzar resultats, estat del sistema i informes.
- Scripts d’**entrenament i avaluació** dels models de visió.
- Integració amb serveis externs (p. ex. Azure ML) per a la inferència en GPU quan és necessari.

---

## Getting Started

A continuació es descriu com posar en marxa el projecte en un entorn local de desenvolupament. Adapta els noms de carpetes/ordres segons l’estructura real del teu repositori.

### 1. Requisits previs

- **Git**
- **Python** 3.10 o superior
- **Node.js** 18+ i **npm** o **pnpm**/**yarn**
- (Opcional) **Docker** si vols executar tot el sistema en contenidors

### 2. Clonar el repositori

```bash
git clone https://github.com/<owner>/<repo>.git
cd <repo>
```

### 3. Backend (API i inferència de models)

#### 3.1. Entorn virtual i dependències

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

#### 3.2. Fitxers de configuració

Configura les variables necessàries (per exemple, accés a models, rutes d’informes, Azure, etc.):

- Còpia `.env.example` a `.env` (si existeix) i adapta els valors:
  ```bash
  cp .env.example .env
  ```

- Assegura’t que els pesos dels models (p. ex. `resnet18_level.pt`, `resnet18_cap.pt`) es troben a la ruta que esperen els scripts del backend o actualitza la configuració perquè hi apunti correctament.

#### 3.3. Executar el backend en mode desenvolupament

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

> Adapta el mòdul (`app.main:app`) a la teva estructura real (FastAPI, Flask, Django, etc.).

### 4. Frontend (interfície web)

El frontend s’ha desenvolupat utilitzant React amb TypeScript com a framework principal, Tailwind CSS per a l’estilització de components, shadcn-ui com a biblioteca de components d’interfície d’usuari i Vite com a eina de compilació i empaquetat.

#### 4.1. Instal·lació de dependències

```bash
cd ../frontend
npm install
# o
pnpm install
# o
yarn
```

#### 4.2. Variables d’entorn

Crea un fitxer `.env` (o `.env.local`) amb, com a mínim, la URL del backend:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

#### 4.3. Execució en mode desenvolupament

```bash
npm run dev
```

Obre el navegador a l’adreça que mostri Vite (normalment `http://localhost:5173`).

---

## Software Dependencies

### Backend

- Python 3.10+
- PyTorch i torchvision (per ResNet18 i inferència de models)
- FastAPI o Flask (segons implementació de l’API)
- Uvicorn / Gunicorn per servir l’aplicació
- Altres llibreries habituals:
  - `pydantic`, `python-dotenv`, `requests`, etc.

Les dependències concretes es detallen a:

- `backend/requirements.txt` (o `pyproject.toml` / `Pipfile`)

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn-ui

Dependències detallades a:

- `frontend/package.json`

---

## Build and Test

### Backend

#### 1. Execució de tests

Si utilitzes `pytest`:

```bash
cd backend
pytest
```

Pots afegir opcions com `-v` per a més detall o `--maxfail=1` per aturar en el primer error.

#### 2. Build per producció (exemple)

En un desplegament típic amb Docker:

```bash
docker build -t bottle-backend ./backend
docker run -p 8000:8000 bottle-backend
```

Assegura’t que el `Dockerfile` exposa el port i arrenca l’ASGI/WSGI server amb la configuració adequada.

### Frontend

#### 1. Tests (si n’hi ha configurats)

Per exemple, amb Vitest o Jest:

```bash
cd frontend
npm test
```

#### 2. Build per producció

```bash
npm run build
```

Això generarà els fitxers estàtics optimitzats a `dist/`.  
Es poden servir amb qualsevol servidor d’arquius estàtics (Nginx, Azure Static Web Apps, etc.).

---

## API Reference (esbós)

> Ajusta aquest apartat als endpoints reals de la teva API.

### Exemple d’endpoint: inspecció d’una ampolla

**POST** `/api/v1/inspect`

- **Descripció:**  
  Rep una imatge d’una ampolla i retorna les prediccions dels models de nivell i tap, juntament amb la classificació PASS/FAIL i la confiança associada.

- **Body (multipart/form-data):**

```text
file: imatge de l’ampolla (JPEG/PNG)
```

- **Resposta (JSON, exemple):**

```json
{
  "level": {
    "class": "ok",
    "confidence": 0.94
  },
  "cap": {
    "class": "present",
    "confidence": 0.97
  },
  "global_decision": "PASS",
  "timestamp": "2026-01-15T10:23:45Z",
  "report_id": "rep_20260115_102345_001"
}
```

Altres endpoints típics podrien ser:

- `/api/v1/health` – comprovació d’estat del servei
- `/api/v1/reports/{id}` – obtenció d’un informe en PDF
- `/api/v1/metrics` – mètriques internes del sistema (opcional)

---

## Contribute

Les contribucions són benvingudes. Per col·laborar en el projecte, segueix aquests passos:

1. **Fes un fork** del repositori.
2. Crea una branca per a la teva funcionalitat o correcció:
   ```bash
   git checkout -b feature/nova-funcio
   ```
3. Implementa els canvis (backend, frontend o documentació) i afegeix tests quan sigui possible.
4. Assegura’t que:
   - Tots els tests passen (`pytest`, `npm test`, etc.).
   - El codi segueix l’estil establert (formatadors, linters, tipus).
5. Fes commit dels canvis amb missatges clars:
   ```bash
   git commit -m "Afegida detecció millorada de nivell LOW"
   ```
6. Envia un **pull request** descrivint:
   - Quin problema resols o quina funcionalitat afegeixes.
   - Canvis principals a backend/frontend.
   - Impacte sobre el desplegament o la configuració.

Abans de començar una contribució gran, és recomanable obrir una *issue* per discutir la proposta i alinear-la amb els objectius del projecte.

---