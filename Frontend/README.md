# Bottle Quality Inspection System – Frontend

Aquest repositori conté el frontend web del Bottle Quality Inspection System, una aplicació destinada a la visualització i gestió dels resultats d’inspecció de qualitat d’ampolles obtinguts mitjançant models de visió per computador executats al backend.

El frontend actua com a client del backend, consumint la seva API per interactuar amb el sistema d’inspecció i presentar la informació de manera clara i accessible per a l’usuari.

**Objectiu del frontend**

L’objectiu principal del frontend és proporcionar una interfície web intuïtiva i robusta que permeti:

- Enviar imatges d’ampolles al sistema d’inspecció

- Visualitzar els resultats de la inferència dels models (nivell de líquid i presència de tap)

- Consultar la decisió global de qualitat (PASS / FAIL)

- Mostrar informació d’estat del sistema

**Tecnologies utilitzades**

- React – Desenvolupament de la interfície d’usuari

- TypeScript – Tipatge estàtic i major seguretat del codi

- Vite – Eina de desenvolupament i build

- Tailwind CSS – Estilització basada en utilitats

- shadcn/ui – Components d’interfície reutilitzables i accessibles


El frontend està pensat per ser utilitzat en entorns industrials, laboratoris o contextos d’R+D, facilitant la supervisió del procés d’inspecció.