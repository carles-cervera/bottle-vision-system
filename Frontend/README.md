# Bottle Quality Inspection System – Frontend

Aquest repositori conté el **frontend web** del *Bottle Quality Inspection System*, una aplicació orientada a la **visualització, control i gestió dels resultats d’inspecció de qualitat d’ampolles**.

El frontend actua com a **client del backend**, consumint la seva API per enviar dades d’entrada (imatges) i mostrar els resultats de la inferència de manera clara, estructurada i accessible per a l’usuari.

## Objectiu del frontend

L’objectiu principal del frontend és proporcionar una interfície web **intuïtiva i robusta** que permeti:

- Enviar imatges d’ampolles al sistema d’inspecció
- Visualitzar els resultats d’inferència dels models:
  - classificació del **nivell de líquid**
  - detecció de **presència/absència de tap**
- Mostrar la decisió global de qualitat:
  - `PASS` (conforme)
  - `FAIL` (no conforme)
- Mostrar informació d’estat del sistema (per exemple, si el processament automàtic està actiu)
- Facilitar el seguiment del procés d’inspecció mitjançant una experiència d’usuari clara i consistent

## Funcionalitats principals

- **Mode interactiu**
  - pujada manual d’imatges
  - selecció del tipus d’anàlisi (nivell / tap)
  - visualització immediata del resultat i confiança

- **Mode automàtic**
  - visualització de resultats en temps quasi real
  - recepció d’actualitzacions mitjançant WebSocket
  - llistat/monitoratge de les ampolles processades i el seu estat

> Nota: el frontend no executa cap model d’IA. Tot el càlcul i inferència es realitza al backend, i el frontend només gestiona la interacció amb l’usuari i la presentació de la informació.

## Tecnologies utilitzades

- **React**
  - desenvolupament de la interfície d’usuari basada en components

- **TypeScript**
  - tipatge estàtic per millorar mantenibilitat i robustesa del codi

- **Vite**
  - entorn de desenvolupament ràpid i empaquetat per producció

- **Tailwind CSS**
  - estilització basada en utilitats per una UI coherent i eficient

- **shadcn/ui**
  - components reutilitzables, accessibles i fàcilment personalitzables

## Context d’ús

Aquest frontend està pensat per ser utilitzat en:

- entorns industrials (supervisió i control de qualitat)
- laboratoris o bancs de prova
- contextos d’R+D (validació i demostració del sistema)

Facilita la supervisió del procés d’inspecció i la interpretació ràpida dels resultats obtinguts pel sistema.
