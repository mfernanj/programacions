# Gestor de Programacions Didàctiques

Aplicació web per a la gestió de programacions didàctiques del departament de matemàtiques. Permet crear, editar i organitzar programacions per nivells i matèries, amb unitats didàctiques, situacions d'aprenentatge i seguiment de l'estat.

## Funcionalitats principals

- **Autenticació d'usuaris** — Login amb credencials i rols (admin/membre) mitjançant NextAuth v5
- **Dashboard** — Panell de control amb estadístiques i accions ràpides
- **Gestió de programacions didàctiques** — CRUD complet amb estats: esborrany, publicat, finalitzat
- **Copiar programacions** — Crear una nova programació a partir d'una existent, canviant només el curs escolar (manté unitats, SA, metodologia i atenció a la diversitat)
- **Cursos escolars automàtics** — Els cursos escolars es creen i esborren automàticament segons les programacions existents
- **Unitats didàctiques** — Organització amb títol, temporització, objectius, continguts, criteris d'avaluació i dates d'inici/fi
- **Situacions d'aprenentatge** — Dins de cada unitat, seqüenciació d'activitats amb:
  - Competències específiques del currículum
  - Mesures i suports universals (DUA)
  - Activitats inicials (Què sabem?)
  - Activitats de desenvolupament (Aprenem nous sabers)
  - Activitats d'estructuració (Què hem après?)
  - Activitats d'aplicació (Apliquem el que hem après)
- **Blocs i criteris d'avaluació** — Associats a cada matèria
- **Metodologia** — Estratègies, recursos, agrupaments i instruments d'avaluació
- **Atenció a la diversitat** — Mesures generals, específiques i adaptacions
- **Gestió d'exàmens** — Pujada de fitxers PDF, etiquetes, dificultat
- **Plantilles de programació** — Estructures reutilitzables
- **Control de versions** — Historial de canvis per cada programació
- **Calendari** — Visualització de les dates de les unitats didàctiques
- **Exportació/Impressió** — Preparat per a generació de documents PDF

## Stack tecnològic

| Tecnologia | Versió |
|------------|--------|
| Next.js | 16.2.10 |
| React | 19.2.4 |
| TypeScript | ^5 |
| Prisma | 6.19.3 |
| SQLite | Dev |
| NextAuth | 5.0.0-beta.31 |
| Tailwind CSS | ^4 |
| bcrypt-ts | ^9.0.1 |
| pdf-lib | ^1.17.1 |
| docx | ^9.7.1 |

## Requisits previs

- Node.js 20+
- npm

## Configuració inicial

```bash
# 1. Clonar el repositori
git clone https://github.com/mfernanj/programacions.git
cd programacions

# 2. Instal·lar dependències
npm install

# 3. Crear fitxer .env amb la base de dades
echo "DATABASE_URL=\"file:./dev.db\"" > .env

# 4. Executar migracions de la base de dades
npx prisma migrate dev

# 5. (Opcional) Omplir la base de dades amb dades d'exemple
npm run seed

# 6. Iniciar el servidor de desenvolupament
npm run dev
```

Obre [http://localhost:3000](http://localhost:3000) al teu navegador.

## Scripts disponibles

| Script | Descripció |
|--------|------------|
| `npm run dev` | Inicia el servidor de desenvolupament |
| `npm run build` | Compila el projecte per a producció |
| `npm run start` | Inicia el servidor de producció |
| `npm run lint` | Executa l'anàlisi de codi amb ESLint |
| `npm run seed` | Omple la base de dades amb dades d'exemple |
| `npx prisma studio` | Obre l'explorador visual de la base de dades |
| `npx prisma migrate dev` | Crea una nova migració després de canvis al schema |

## Estructura del projecte

```
programacions/
├── prisma/
│   ├── schema.prisma          # Model de dades
│   ├── seed.ts                # Dades d'exemple
│   ├── dev.db                 # Base de dades SQLite (desenvolupament)
│   └── migrations/            # Migracions de base de dades
├── src/
│   ├── app/
│   │   ├── api/               # API REST (Next.js App Router)
│   │   │   ├── auth/          # Autenticació
│   │   │   ├── programacions/ # CRUD programacions
│   │   │   ├── unitats/       # CRUD unitats didàctiques
│   │   │   ├── situacions/    # CRUD situacions d'aprenentatge
│   │   │   ├── examens/       # Gestió d'exàmens
│   │   │   ├── nivells/       # Nivells educatius
│   │   │   ├── materies/      # Matèries
│   │   │   ├── blocs/         # Blocs de contingut
│   │   │   ├── cursos/        # Cursos escolars
│   │   │   ├── plantilles/    # Plantilles de programació
│   │   │   └── configuracio/  # Configuració del centre
│   │   ├── dashboard/         # Panell de control
│   │   ├── programacions/     # Pàgines de programacions
│   │   │   ├── [id]/          # Detall de programació (amb unitats i SA)
│   │   │   ├── nova/          # Crear nova programació
│   │   │   ├── imprimir/      # Vista d'impressió
│   │   │   └── calendari/     # Calendari de la programació
│   │   ├── examens/           # Gestió d'exàmens
│   │   ├── unitats/           # Llistat d'unitats
│   │   └── usuaris/           # Gestió d'usuaris
│   ├── components/
│   │   ├── Sidebar.tsx        # Barra de navegació lateral
│   │   └── ThemeToggle.tsx    # Commutador de tema
│   └── lib/
│       ├── auth.ts            # Configuració de NextAuth
│       └── prisma.ts          # Client de Prisma
└── scripts/                   # Scripts de seed addicionals
```

## Models de dades

- **Usuari** — Autenticació i rols (admin/membre)
- **Configuracio** — Configuració del centre educatiu
- **CursEscolar** — Cursos acadèmics (ex: 2026-2027)
- **Nivell** — Nivells educatius (1rESO, 2nESO, 1rBatx, etc.)
- **Materia** — Matèries associades a un nivell
- **Bloc** — Blocs de contingut dins d'una matèria
- **Contingut** — Continguts específics per curs
- **CriteriAvaluacio** — Criteris d'avaluació associats a blocs
- **Programacio** — Programació didàctica per curs, nivell i matèria
- **UnitatDidactica** — Unitats dins d'una programació
- **SituacioAprenentatge** — Situacions d'aprenentatge dins d'una unitat (amb activitats inicials, de desenvolupament, d'estructuració i d'aplicació)
- **Metodologia** — Metodologia aplicada a la programació
- **AtencioDiversitat** — Mesures d'atenció a la diversitat
- **Examen** — Exàmens amb fitxers adjunts
- **Plantilla** — Plantilles reutilitzables de programació
- **VersioProgramacio** — Control de versions de programacions

## Migracions

Per a modificar l'esquema de base de dades:

1. Edita `prisma/schema.prisma`
2. Executa:
   ```bash
   npx prisma migrate dev --name descripcio_del_canvi
   ```
3. (Opcional) Per a regenerar el client Prisma:
   ```bash
   npx prisma generate