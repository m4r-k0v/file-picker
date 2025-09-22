# Stack AI Google Drive File Picker

A modern, responsive file picker for Stack AI's Google Drive integration with knowledge base indexing capabilities. Built with Next.js, TypeScript, Tailwind CSS, and Shadcn UI.

**🎉 Now integrated with Stack AI's real API endpoints!**

## Features

### Core Functionality
- **Stack AI Authentication**: Secure login with Stack AI credentials
- **Google Drive Connection**: Automatic connection to your Google Drive through Stack AI
- **File System Navigation**: Browse Google Drive files and folders like a native file manager
- **Knowledge Base Management**: Create and sync knowledge bases with selected files
- **Real-time Status**: Visual indicators showing which files are indexed

### Advanced Features
- **Search**: Find files by name across all folders
- **Sorting**: Sort files by name, date created, date modified, or size
- **Filtering**: Filter by file type (files/folders) and indexing status
- **Breadcrumb Navigation**: Easy navigation with clickable breadcrumbs
- **Bulk Operations**: Select multiple files for batch operations
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Data Fetching**: Tanstack Query (React Query)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- **Stack AI account with Google Drive connection set up**

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd file-picker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. **Set up Google Drive Connection in Stack AI**:
   - Go to the Stack AI Workflow builder
   - Click on Knowledge Bases in the left sidebar
   - Drop the Google Drive node on the canvas
   - Click "Connect to Google Drive" and follow the authorization steps

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3001](http://localhost:3001) in your browser and login with your Stack AI credentials.

## Stack AI Integration

The application is fully integrated with Stack AI's API endpoints for Google Drive and knowledge base management.

### Integrated API Endpoints

#### Authentication
- Stack AI Supabase authentication with email/password

#### Google Drive Operations  
- `GET /connections` - List Google Drive connections
- `GET /connections/{id}/resources/children` - List files and folders
- Connection management through Stack AI

#### Knowledge Base Operations
- `POST /knowledge_bases` - Create new knowledge base
- `GET /knowledge_bases/sync/trigger/{id}/{org_id}` - Sync knowledge base
- `GET /knowledge_bases/{id}/resources/children` - List indexed resources
- `DELETE /knowledge_bases/{id}/resources` - Remove resource from knowledge base

### API Request/Response Format

See `/src/types/api.ts` for complete TypeScript definitions including both legacy interfaces and new Stack AI interfaces.

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes (mock implementation)
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── auth/              # Authentication components
│   ├── file-picker/       # File picker components  
│   ├── knowledge-base/    # Knowledge base management
│   ├── providers/         # React providers (Query, etc.)
│   └── ui/                # Shadcn UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and Stack AI client
└── types/                 # TypeScript type definitions
```

## Key Components

### LoginForm
Handles Stack AI authentication with email/password.

### FilePicker
The main component that orchestrates the file browsing experience with Stack AI integration.

### KnowledgeBaseManager
Manages knowledge base creation and synchronization with selected files.

### FileItem
Individual file/folder component with actions for knowledge base operations.

### Toolbar
Search, sort, and filter controls for the file browser.

### Breadcrumb
Navigation breadcrumb for folder hierarchy.

## Customization

### Styling
The application uses Tailwind CSS with Shadcn UI components. You can customize:
- Colors in `tailwind.config.ts`
- Component styles in individual component files
- Global styles in `src/app/globals.css`

### API Integration
Replace the mock API routes in `/src/app/api/` with your actual Google Drive API integration.

### Icons and File Types
Customize file type detection and icons in `/src/components/file-picker/file-icon.tsx`.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. Define types in `/src/types/api.ts`
2. Add API client methods in `/src/lib/api-client.ts`
3. Create custom hooks in `/src/hooks/`
4. Build UI components in `/src/components/`

## Production Deployment

1. Set up your Google Drive API credentials
2. Configure your knowledge base API endpoints
3. Update environment variables for production
4. Build and deploy:

```bash
npm run build
npm run start
```

## License

This project is licensed under the MIT License.